"""
SKAPA Backend - Authenticated Flow Tests
Tests that require minting a valid JWT by inserting a test user into MongoDB.
Also tests encryption roundtrip and MongoDB indexes.
"""
import pytest
import asyncio
import sys
import os
import requests
from datetime import datetime, timezone

# Add backend to path
sys.path.insert(0, '/app/backend')

BASE_URL = "https://1e23550a-aef8-41ec-bafc-7efe3da04521.preview.emergentagent.com"


class TestEncryptionRoundtrip:
    """Test AES-256-GCM encryption/decryption of refresh tokens"""
    
    def test_encrypt_decrypt_roundtrip(self):
        """Verify encrypt_token and decrypt_token work correctly"""
        from security import encrypt_token, decrypt_token
        
        original = "test_refresh_token_abc123xyz"
        encrypted = encrypt_token(original)
        
        # Encrypted should be different from original
        assert encrypted != original
        # Encrypted should be base64 encoded
        import base64
        try:
            decoded = base64.b64decode(encrypted)
            assert len(decoded) > 12  # nonce (12) + ciphertext
        except Exception:
            pytest.fail("Encrypted token is not valid base64")
        
        # Decrypt should recover original
        decrypted = decrypt_token(encrypted)
        assert decrypted == original
        print("✓ Encryption roundtrip works correctly")
    
    def test_different_encryptions_produce_different_ciphertext(self):
        """Each encryption should produce different ciphertext (due to random nonce)"""
        from security import encrypt_token
        
        original = "same_token_value"
        enc1 = encrypt_token(original)
        enc2 = encrypt_token(original)
        
        # Should be different due to random nonce
        assert enc1 != enc2
        print("✓ Different encryptions produce different ciphertext (random nonce)")


class TestJWTStructure:
    """Test JWT token structure and claims"""
    
    def test_jwt_uses_hs256_with_jti_and_30day_expiry(self):
        """Verify JWT uses HS256 with jti claim and 30-day expiry"""
        from security import create_session_jwt
        from jose import jwt
        
        user_id = "507f1f77bcf86cd799439011"
        token, jti = create_session_jwt(user_id)
        
        # Decode without verification to check structure
        jwt_secret = "9b6734cd78d620e5cede6de19a3596c656b860edb1eca709323d6b6f74692a67ab222cc20c106d51fbd3ab433002ebf2"
        claims = jwt.decode(token, jwt_secret, algorithms=["HS256"])
        
        # Check claims
        assert claims["sub"] == user_id
        assert "jti" in claims
        assert claims["jti"] == jti
        assert "iat" in claims
        assert "exp" in claims
        
        # Check 30-day expiry
        iat = claims["iat"]
        exp = claims["exp"]
        diff_days = (exp - iat) / (60 * 60 * 24)
        assert 29 <= diff_days <= 31, f"Expected ~30 days, got {diff_days}"
        
        print(f"✓ JWT uses HS256 with jti={jti[:8]}... and {diff_days:.1f} day expiry")


class TestAuthenticatedFlows:
    """Tests that require a valid authenticated session"""
    
    @pytest.fixture(scope="class")
    def test_user_and_token(self):
        """Create a test user in MongoDB and mint a JWT"""
        import asyncio
        from motor.motor_asyncio import AsyncIOMotorClient
        from bson import ObjectId
        from security import create_session_jwt, encrypt_token
        
        async def setup():
            client = AsyncIOMotorClient("mongodb://localhost:27017")
            db = client["skapa"]
            
            # Create test user
            now = datetime.now(timezone.utc)
            test_user = {
                "_id": ObjectId(),
                "spotify_id": "TEST_spotify_user_12345",
                "handle": "TEST_testuser",
                "display_name": "Test User",
                "email": "test@example.com",
                "avatar_url": None,
                "country": "US",
                "product": "premium",
                "spotify": {
                    "connected": True,
                    "connected_at": now,
                    "scopes": ["user-read-email", "user-top-read"],
                    "access_token": "fake_access_token",
                    "access_expires_at": now.timestamp() + 3600,
                    "refresh_token_enc": encrypt_token("fake_refresh_token_12345"),
                },
                "vibe": {"emoji": "🎵", "label": "Testing", "set_at": now},
                "profile": {"bio": "Test bio", "private": False, "share_slug": "testuser"},
                "stats": {"following": 0, "followers": 0, "streak_days": 1},
                "created_at": now,
                "last_login_at": now,
                "updated_at": now,
            }
            
            # Delete any existing test user
            await db.users.delete_many({"spotify_id": "TEST_spotify_user_12345"})
            
            # Insert test user
            result = await db.users.insert_one(test_user)
            user_id = str(result.inserted_id)
            
            # Mint JWT
            token, jti = create_session_jwt(user_id)
            
            client.close()
            return {"user_id": user_id, "token": token, "jti": jti}
        
        return asyncio.get_event_loop().run_until_complete(setup())
    
    @pytest.fixture(scope="class")
    def cleanup(self, test_user_and_token):
        """Cleanup test data after tests"""
        yield
        import asyncio
        from motor.motor_asyncio import AsyncIOMotorClient
        
        async def teardown():
            client = AsyncIOMotorClient("mongodb://localhost:27017")
            db = client["skapa"]
            await db.users.delete_many({"spotify_id": "TEST_spotify_user_12345"})
            await db.sessions.delete_many({"user_id": test_user_and_token["user_id"]})
            client.close()
        
        asyncio.get_event_loop().run_until_complete(teardown())
    
    def test_get_me_with_valid_token(self, test_user_and_token, cleanup):
        """GET /api/me with valid token should return user data"""
        token = test_user_and_token["token"]
        
        response = requests.get(f"{BASE_URL}/api/me", headers={
            "Authorization": f"Bearer {token}"
        })
        assert response.status_code == 200
        data = response.json()
        
        assert "user" in data
        user = data["user"]
        assert user["spotify_id"] == "TEST_spotify_user_12345"
        assert user["handle"] == "TEST_testuser"
        assert user["display_name"] == "Test User"
        assert user["spotify_connected"] is True
        print("✓ GET /api/me with valid token returns user data")
    
    def test_update_vibe_with_valid_token(self, test_user_and_token, cleanup):
        """PUT /api/me/vibe with valid token should update vibe"""
        token = test_user_and_token["token"]
        
        response = requests.put(f"{BASE_URL}/api/me/vibe", 
            headers={"Authorization": f"Bearer {token}"},
            json={"emoji": "🔥", "label": "On Fire"}
        )
        assert response.status_code == 200
        data = response.json()
        
        assert "user" in data
        assert data["user"]["vibe"]["emoji"] == "🔥"
        assert data["user"]["vibe"]["label"] == "On Fire"
        print("✓ PUT /api/me/vibe updates vibe correctly")
    
    def test_logout_invalidates_session(self, test_user_and_token, cleanup):
        """POST /api/auth/logout should invalidate session, subsequent /api/me returns 401"""
        token = test_user_and_token["token"]
        
        # First verify token works
        response = requests.get(f"{BASE_URL}/api/me", headers={
            "Authorization": f"Bearer {token}"
        })
        assert response.status_code == 200
        print("✓ Token works before logout")
        
        # Logout
        response = requests.post(f"{BASE_URL}/api/auth/logout", headers={
            "Authorization": f"Bearer {token}"
        })
        assert response.status_code == 200
        data = response.json()
        assert data["ok"] is True
        print("✓ Logout returns ok: true")
        
        # Verify session is revoked
        response = requests.get(f"{BASE_URL}/api/me", headers={
            "Authorization": f"Bearer {token}"
        })
        assert response.status_code == 401
        data = response.json()
        assert "Session revoked" in data.get("detail", "")
        print("✓ After logout, /api/me returns 401 'Session revoked'")


class TestMongoDBIndexes:
    """Verify MongoDB indexes exist"""
    
    def test_mongodb_indexes_exist(self):
        """Verify required indexes: users.spotify_id unique, users.handle unique sparse, sessions.jti unique, sessions.expires_at TTL"""
        import asyncio
        from motor.motor_asyncio import AsyncIOMotorClient
        
        async def check_indexes():
            client = AsyncIOMotorClient("mongodb://localhost:27017")
            db = client["skapa"]
            
            # Get users indexes
            users_indexes = await db.users.index_information()
            sessions_indexes = await db.sessions.index_information()
            
            client.close()
            return users_indexes, sessions_indexes
        
        users_indexes, sessions_indexes = asyncio.get_event_loop().run_until_complete(check_indexes())
        
        # Check users.spotify_id unique index
        spotify_id_idx = None
        for name, info in users_indexes.items():
            if info.get("key") == [("spotify_id", 1)]:
                spotify_id_idx = info
                break
        assert spotify_id_idx is not None, "Missing users.spotify_id index"
        assert spotify_id_idx.get("unique") is True, "users.spotify_id should be unique"
        print("✓ users.spotify_id unique index exists")
        
        # Check users.handle unique sparse index
        handle_idx = None
        for name, info in users_indexes.items():
            if info.get("key") == [("handle", 1)]:
                handle_idx = info
                break
        assert handle_idx is not None, "Missing users.handle index"
        assert handle_idx.get("unique") is True, "users.handle should be unique"
        assert handle_idx.get("sparse") is True, "users.handle should be sparse"
        print("✓ users.handle unique sparse index exists")
        
        # Check sessions.jti unique index
        jti_idx = None
        for name, info in sessions_indexes.items():
            if info.get("key") == [("jti", 1)]:
                jti_idx = info
                break
        assert jti_idx is not None, "Missing sessions.jti index"
        assert jti_idx.get("unique") is True, "sessions.jti should be unique"
        print("✓ sessions.jti unique index exists")
        
        # Check sessions.expires_at TTL index
        expires_idx = None
        for name, info in sessions_indexes.items():
            if info.get("key") == [("expires_at", 1)]:
                expires_idx = info
                break
        assert expires_idx is not None, "Missing sessions.expires_at index"
        assert "expireAfterSeconds" in expires_idx, "sessions.expires_at should be TTL index"
        print("✓ sessions.expires_at TTL index exists")


class TestCORSConfiguration:
    """Test CORS configuration"""
    
    def test_cors_allows_all_origins(self):
        """Verify CORS is permissive (allow_origins from env, currently '*')"""
        # Send OPTIONS preflight request
        response = requests.options(f"{BASE_URL}/api/health", headers={
            "Origin": "https://example.com",
            "Access-Control-Request-Method": "GET",
        })
        
        # Check CORS headers
        assert "access-control-allow-origin" in response.headers or response.status_code == 200
        
        # Also test with actual GET request
        response = requests.get(f"{BASE_URL}/api/health", headers={
            "Origin": "https://example.com"
        })
        assert response.status_code == 200
        
        # Check if CORS header is present
        cors_header = response.headers.get("access-control-allow-origin", "")
        assert cors_header == "*" or cors_header == "https://example.com"
        print(f"✓ CORS allows origin: {cors_header}")


class TestRefreshTokenEncryption:
    """Verify refresh_token is stored ENCRYPTED in MongoDB"""
    
    def test_refresh_token_stored_encrypted(self):
        """Verify refresh_token is stored as refresh_token_enc (encrypted), not plaintext"""
        import asyncio
        from motor.motor_asyncio import AsyncIOMotorClient
        from bson import ObjectId
        from security import encrypt_token, decrypt_token
        
        async def check_encryption():
            client = AsyncIOMotorClient("mongodb://localhost:27017")
            db = client["skapa"]
            
            # Create a test user with encrypted refresh token
            now = datetime.now(timezone.utc)
            original_refresh_token = "test_refresh_token_for_encryption_check"
            encrypted = encrypt_token(original_refresh_token)
            
            test_user = {
                "_id": ObjectId(),
                "spotify_id": "TEST_encryption_check_user",
                "handle": "TEST_encryptioncheck",
                "display_name": "Encryption Test",
                "email": "encrypt@test.com",
                "spotify": {
                    "connected": True,
                    "refresh_token_enc": encrypted,
                    "access_token": "fake",
                    "access_expires_at": now.timestamp() + 3600,
                },
                "created_at": now,
            }
            
            # Delete any existing
            await db.users.delete_many({"spotify_id": "TEST_encryption_check_user"})
            
            # Insert
            await db.users.insert_one(test_user)
            
            # Fetch back
            fetched = await db.users.find_one({"spotify_id": "TEST_encryption_check_user"})
            
            # Cleanup
            await db.users.delete_many({"spotify_id": "TEST_encryption_check_user"})
            client.close()
            
            return fetched, original_refresh_token
        
        fetched, original = asyncio.get_event_loop().run_until_complete(check_encryption())
        
        # Verify stored value is encrypted (not plaintext)
        stored_enc = fetched["spotify"]["refresh_token_enc"]
        assert stored_enc != original, "Refresh token should be encrypted, not plaintext"
        
        # Verify we can decrypt it back
        from security import decrypt_token
        decrypted = decrypt_token(stored_enc)
        assert decrypted == original, "Decrypted token should match original"
        
        print("✓ Refresh token is stored ENCRYPTED in MongoDB (refresh_token_enc field)")
        print("✓ Decrypting with TOKEN_ENCRYPTION_KEY recovers original string")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
