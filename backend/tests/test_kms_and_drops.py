"""
SKAPA Backend - KMS Envelope Encryption & Drops Feature Tests
Tests for:
- Envelope encryption round-trip
- Envelope format validation (v1 JSON structure)
- Per-encryption DEK uniqueness
- Legacy v0 backward compatibility
- Rotation-ready KEK identification
- Drops CRUD endpoints
- Drops MongoDB indexes
"""
import pytest
import asyncio
import sys
import os
import base64
import json
import requests
from datetime import datetime, timezone, timedelta

# Add backend to path
sys.path.insert(0, '/app/backend')

BASE_URL = "https://1e23550a-aef8-41ec-bafc-7efe3da04521.preview.emergentagent.com"


# ══════════════════════════════════════════════════════════════════════════════
# KMS ENVELOPE ENCRYPTION TESTS
# ══════════════════════════════════════════════════════════════════════════════

class TestEnvelopeEncryptionRoundtrip:
    """Test envelope encryption/decryption round-trip"""
    
    def test_envelope_encrypt_decrypt_roundtrip(self):
        """envelope_encrypt('test') then envelope_decrypt() returns 'test'"""
        from kms import envelope_encrypt, envelope_decrypt
        
        plaintext = "test"
        encrypted = envelope_encrypt(plaintext)
        decrypted = envelope_decrypt(encrypted)
        
        assert decrypted == plaintext
        print("✓ Envelope encryption round-trip works: 'test' -> encrypt -> decrypt -> 'test'")
    
    def test_envelope_encrypt_decrypt_longer_text(self):
        """Test with longer plaintext (Spotify refresh token length)"""
        from kms import envelope_encrypt, envelope_decrypt
        
        plaintext = "AQDQNPTMiS2YBe8J_fake_spotify_refresh_token_12345678901234567890"
        encrypted = envelope_encrypt(plaintext)
        decrypted = envelope_decrypt(encrypted)
        
        assert decrypted == plaintext
        print("✓ Envelope encryption works with longer tokens")


class TestEnvelopeFormat:
    """Test envelope format is base64-of-JSON with correct structure"""
    
    def test_envelope_is_base64_json(self):
        """Encrypted blob is base64-of-JSON starting with {"v":1,"k":"local/v1",...}"""
        from kms import envelope_encrypt
        
        encrypted = envelope_encrypt("test_payload")
        
        # Decode base64
        raw = base64.b64decode(encrypted)
        
        # Should be valid JSON
        envelope = json.loads(raw.decode())
        
        # Check required fields
        assert envelope["v"] == 1, "Envelope version should be 1"
        assert envelope["k"] == "local/v1", "KEK id should be 'local/v1'"
        assert "d" in envelope, "Envelope should have 'd' (wrapped DEK)"
        assert "n" in envelope, "Envelope should have 'n' (payload nonce)"
        assert "c" in envelope, "Envelope should have 'c' (ciphertext)"
        
        # Verify all values are base64 encoded
        base64.b64decode(envelope["d"])  # wrapped DEK
        base64.b64decode(envelope["n"])  # nonce
        base64.b64decode(envelope["c"])  # ciphertext
        
        print(f"✓ Envelope format correct: v={envelope['v']}, k={envelope['k']}, has d/n/c fields")


class TestPerEncryptionDEK:
    """Test that each encryption uses a unique DEK"""
    
    def test_same_plaintext_different_ciphertext_and_dek(self):
        """Encrypting same plaintext twice produces different ciphertexts AND different wrapped DEKs"""
        from kms import envelope_encrypt
        
        plaintext = "same_plaintext_value"
        
        enc1 = envelope_encrypt(plaintext)
        enc2 = envelope_encrypt(plaintext)
        
        # Overall blobs should be different
        assert enc1 != enc2, "Same plaintext should produce different encrypted blobs"
        
        # Parse envelopes
        env1 = json.loads(base64.b64decode(enc1).decode())
        env2 = json.loads(base64.b64decode(enc2).decode())
        
        # Wrapped DEKs should be different (different random DEK each time)
        assert env1["d"] != env2["d"], "Wrapped DEKs should be different for each encryption"
        
        # Nonces should be different
        assert env1["n"] != env2["n"], "Payload nonces should be different"
        
        # Ciphertexts should be different
        assert env1["c"] != env2["c"], "Ciphertexts should be different"
        
        print("✓ Per-encryption DEK: same plaintext produces different DEKs and ciphertexts")


class TestLegacyV0Compatibility:
    """Test backward compatibility with legacy v0 encryption format"""
    
    def test_legacy_v0_blob_decrypts_correctly(self):
        """Legacy v0 format (raw AES-GCM with KEK) should still decrypt"""
        from kms import envelope_decrypt
        from cryptography.hazmat.primitives.ciphers.aead import AESGCM
        from config import settings
        
        # Create legacy v0 blob: 12-byte nonce + ciphertext, base64 encoded
        kek = base64.b64decode(settings.TOKEN_ENCRYPTION_KEY)
        nonce = os.urandom(12)
        plaintext = "legacy_token"
        ct = AESGCM(kek).encrypt(nonce, plaintext.encode(), None)
        legacy_blob = base64.b64encode(nonce + ct).decode()
        
        # envelope_decrypt should handle legacy format
        decrypted = envelope_decrypt(legacy_blob)
        
        assert decrypted == plaintext
        print("✓ Legacy v0 blob decrypts correctly: 'legacy_token' recovered")
    
    def test_legacy_v0_with_different_plaintext(self):
        """Test legacy v0 with a different plaintext"""
        from kms import envelope_decrypt
        from cryptography.hazmat.primitives.ciphers.aead import AESGCM
        from config import settings
        
        kek = base64.b64decode(settings.TOKEN_ENCRYPTION_KEY)
        nonce = os.urandom(12)
        plaintext = "AQDQNPTMiS2YBe8J_old_refresh_token_before_kms"
        ct = AESGCM(kek).encrypt(nonce, plaintext.encode(), None)
        legacy_blob = base64.b64encode(nonce + ct).decode()
        
        decrypted = envelope_decrypt(legacy_blob)
        assert decrypted == plaintext
        print("✓ Legacy v0 with longer token decrypts correctly")


class TestKmsProviderKeyId:
    """Test KMS provider key identification for rotation support"""
    
    def test_kms_provider_key_id_returns_local_v1(self):
        """KmsProvider.key_id() returns 'local/v1'"""
        from kms import get_kms
        
        kms = get_kms()
        key_id = kms.key_id()
        
        assert key_id == "local/v1"
        print(f"✓ KmsProvider.key_id() returns '{key_id}'")
    
    def test_envelope_records_kek_id(self):
        """Envelope records the KEK id used for future rotation support"""
        from kms import envelope_encrypt
        
        encrypted = envelope_encrypt("rotation_test")
        envelope = json.loads(base64.b64decode(encrypted).decode())
        
        assert envelope["k"] == "local/v1", "Envelope should record KEK id"
        print(f"✓ Envelope records KEK id: {envelope['k']}")


class TestSecurityModuleUsesEnvelope:
    """Test that security.encrypt_token/decrypt_token use envelope encryption"""
    
    def test_encrypt_token_uses_envelope_format(self):
        """security.encrypt_token now produces envelope format (v1 JSON)"""
        from security import encrypt_token
        
        encrypted = encrypt_token("test_spotify_refresh_token")
        
        # Should be base64-encoded JSON
        raw = base64.b64decode(encrypted)
        assert raw[:1] == b"{", "encrypt_token should produce JSON envelope"
        
        envelope = json.loads(raw.decode())
        assert envelope["v"] == 1
        assert envelope["k"] == "local/v1"
        print("✓ security.encrypt_token uses envelope format (v1 JSON)")
    
    def test_decrypt_token_handles_envelope(self):
        """security.decrypt_token handles envelope format"""
        from security import encrypt_token, decrypt_token
        
        original = "my_refresh_token_12345"
        encrypted = encrypt_token(original)
        decrypted = decrypt_token(encrypted)
        
        assert decrypted == original
        print("✓ security.decrypt_token handles envelope format correctly")


# ══════════════════════════════════════════════════════════════════════════════
# DROPS FEATURE TESTS
# ══════════════════════════════════════════════════════════════════════════════

class TestDropsCreateEndpoint:
    """POST /api/drops endpoint tests"""
    
    def test_create_drop_success(self):
        """POST /api/drops with valid body returns drop with all expected fields"""
        payload = {
            "track": {
                "title": "Test Song",
                "artist": "Test Artist",
                "cover": "https://example.com/cover.jpg",
                "spotify_id": "spotify:track:123"
            },
            "mood_emoji": "🎵",
            "mood_label": "Vibing",
            "caption": "Great track!",
            "color": "#ff8a00",
            "lat": 40.7128,
            "lng": -74.0060,
            "user_name": "TestUser",
            "user_avatar": "https://example.com/avatar.jpg",
            "user_handle": "testuser"
        }
        
        response = requests.post(f"{BASE_URL}/api/drops", json=payload)
        assert response.status_code == 200
        
        data = response.json()
        assert "drop" in data
        drop = data["drop"]
        
        # Check all required fields
        assert "id" in drop
        assert "user" in drop
        assert drop["user"]["name"] == "TestUser"
        assert drop["user"]["avatar"] == "https://example.com/avatar.jpg"
        assert drop["user"]["handle"] == "testuser"
        
        assert "track" in drop
        assert drop["track"]["title"] == "Test Song"
        assert drop["track"]["artist"] == "Test Artist"
        
        assert "mood" in drop
        assert drop["mood"]["emoji"] == "🎵"
        assert drop["mood"]["label"] == "Vibing"
        
        assert drop["caption"] == "Great track!"
        assert drop["color"] == "#ff8a00"
        assert drop["lat"] == 40.7128
        assert drop["lng"] == -74.0060
        
        assert drop["waves"] == 0
        assert drop["tunes_in"] == 0
        
        assert "created_at" in drop
        assert "expires_at" in drop
        
        print(f"✓ POST /api/drops creates drop with id={drop['id']}")
        
        # Store drop_id for other tests
        TestDropsCreateEndpoint.created_drop_id = drop["id"]
    
    def test_create_drop_missing_track_title_returns_422(self):
        """POST /api/drops missing 'track.title' returns 422"""
        payload = {
            "track": {
                "artist": "Test Artist"
                # Missing title
            },
            "mood_emoji": "🎵",
            "mood_label": "Vibing"
        }
        
        response = requests.post(f"{BASE_URL}/api/drops", json=payload)
        assert response.status_code == 422
        print("✓ POST /api/drops missing track.title returns 422")
    
    def test_create_drop_invalid_lat_returns_422(self):
        """POST /api/drops with invalid lat (>90) returns 422"""
        payload = {
            "track": {
                "title": "Test Song",
                "artist": "Test Artist"
            },
            "mood_emoji": "🎵",
            "mood_label": "Vibing",
            "lat": 100  # Invalid: > 90
        }
        
        response = requests.post(f"{BASE_URL}/api/drops", json=payload)
        assert response.status_code == 422
        print("✓ POST /api/drops with invalid lat (>90) returns 422")
    
    def test_create_drop_invalid_lng_returns_422(self):
        """POST /api/drops with invalid lng (>180) returns 422"""
        payload = {
            "track": {
                "title": "Test Song",
                "artist": "Test Artist"
            },
            "mood_emoji": "🎵",
            "mood_label": "Vibing",
            "lng": 200  # Invalid: > 180
        }
        
        response = requests.post(f"{BASE_URL}/api/drops", json=payload)
        assert response.status_code == 422
        print("✓ POST /api/drops with invalid lng (>180) returns 422")


class TestDropsListEndpoint:
    """GET /api/drops endpoint tests"""
    
    def test_list_drops_returns_array(self):
        """GET /api/drops returns {drops: [...]} sorted by created_at desc"""
        response = requests.get(f"{BASE_URL}/api/drops")
        assert response.status_code == 200
        
        data = response.json()
        assert "drops" in data
        assert isinstance(data["drops"], list)
        
        # If there are drops, verify they have expected structure
        if len(data["drops"]) > 0:
            drop = data["drops"][0]
            assert "id" in drop
            assert "user" in drop
            assert "track" in drop
            assert "mood" in drop
            assert "created_at" in drop
            assert "expires_at" in drop
        
        print(f"✓ GET /api/drops returns {len(data['drops'])} drops")
    
    def test_list_drops_honors_limit(self):
        """GET /api/drops?limit=2 honors the limit"""
        # First create a few drops to ensure we have data
        for i in range(3):
            requests.post(f"{BASE_URL}/api/drops", json={
                "track": {"title": f"Limit Test Song {i}", "artist": "Test Artist"},
                "mood_emoji": "🎵",
                "mood_label": "Testing"
            })
        
        response = requests.get(f"{BASE_URL}/api/drops?limit=2")
        assert response.status_code == 200
        
        data = response.json()
        assert len(data["drops"]) <= 2
        print(f"✓ GET /api/drops?limit=2 returns {len(data['drops'])} drops (max 2)")
    
    def test_list_drops_sorted_by_created_at_desc(self):
        """GET /api/drops returns drops sorted by created_at descending"""
        response = requests.get(f"{BASE_URL}/api/drops?limit=10")
        assert response.status_code == 200
        
        drops = response.json()["drops"]
        if len(drops) >= 2:
            # Verify descending order
            for i in range(len(drops) - 1):
                assert drops[i]["created_at"] >= drops[i+1]["created_at"], \
                    "Drops should be sorted by created_at descending"
        
        print("✓ GET /api/drops returns drops sorted by created_at desc")


class TestDropsWaveEndpoint:
    """POST /api/drops/{id}/wave endpoint tests"""
    
    @pytest.fixture(scope="class")
    def drop_for_wave(self):
        """Create a drop for wave testing"""
        response = requests.post(f"{BASE_URL}/api/drops", json={
            "track": {"title": "Wave Test Song", "artist": "Wave Artist"},
            "mood_emoji": "👋",
            "mood_label": "Waving"
        })
        return response.json()["drop"]
    
    def test_wave_increments_counter(self, drop_for_wave):
        """POST /api/drops/{id}/wave increments waves counter"""
        drop_id = drop_for_wave["id"]
        initial_waves = drop_for_wave["waves"]
        
        response = requests.post(f"{BASE_URL}/api/drops/{drop_id}/wave")
        assert response.status_code == 200
        
        data = response.json()
        assert data["ok"] is True
        assert data["waves"] == initial_waves + 1
        
        # Wave again
        response = requests.post(f"{BASE_URL}/api/drops/{drop_id}/wave")
        assert response.status_code == 200
        assert response.json()["waves"] == initial_waves + 2
        
        print(f"✓ POST /api/drops/{drop_id}/wave increments waves counter")
    
    def test_wave_invalid_objectid_returns_400(self):
        """POST /api/drops/{id}/wave with invalid ObjectId returns 400"""
        response = requests.post(f"{BASE_URL}/api/drops/invalid_id/wave")
        assert response.status_code == 400
        print("✓ POST /api/drops/invalid_id/wave returns 400")
    
    def test_wave_nonexistent_id_returns_404(self):
        """POST /api/drops/{id}/wave with valid-shape but nonexistent id returns 404"""
        # Valid ObjectId format but doesn't exist
        fake_id = "507f1f77bcf86cd799439011"
        response = requests.post(f"{BASE_URL}/api/drops/{fake_id}/wave")
        assert response.status_code == 404
        print("✓ POST /api/drops/{nonexistent_id}/wave returns 404")


class TestDropsTuneInEndpoint:
    """POST /api/drops/{id}/tune-in endpoint tests"""
    
    @pytest.fixture(scope="class")
    def drop_for_tune_in(self):
        """Create a drop for tune-in testing"""
        response = requests.post(f"{BASE_URL}/api/drops", json={
            "track": {"title": "Tune-In Test Song", "artist": "Tune Artist"},
            "mood_emoji": "🎧",
            "mood_label": "Listening"
        })
        return response.json()["drop"]
    
    def test_tune_in_increments_counter(self, drop_for_tune_in):
        """POST /api/drops/{id}/tune-in increments tunes_in counter"""
        drop_id = drop_for_tune_in["id"]
        initial_tunes = drop_for_tune_in["tunes_in"]
        
        response = requests.post(f"{BASE_URL}/api/drops/{drop_id}/tune-in")
        assert response.status_code == 200
        
        data = response.json()
        assert data["ok"] is True
        assert data["tunes_in"] == initial_tunes + 1
        
        # Tune in again
        response = requests.post(f"{BASE_URL}/api/drops/{drop_id}/tune-in")
        assert response.status_code == 200
        assert response.json()["tunes_in"] == initial_tunes + 2
        
        print(f"✓ POST /api/drops/{drop_id}/tune-in increments tunes_in counter")
    
    def test_tune_in_invalid_objectid_returns_400(self):
        """POST /api/drops/{id}/tune-in with invalid ObjectId returns 400"""
        response = requests.post(f"{BASE_URL}/api/drops/invalid_id/tune-in")
        assert response.status_code == 400
        print("✓ POST /api/drops/invalid_id/tune-in returns 400")
    
    def test_tune_in_nonexistent_id_returns_404(self):
        """POST /api/drops/{id}/tune-in with valid-shape but nonexistent id returns 404"""
        fake_id = "507f1f77bcf86cd799439011"
        response = requests.post(f"{BASE_URL}/api/drops/{fake_id}/tune-in")
        assert response.status_code == 404
        print("✓ POST /api/drops/{nonexistent_id}/tune-in returns 404")


class TestDropsTTL:
    """Test drop TTL (expires_at is 24h after created_at)"""
    
    def test_drop_expires_at_is_24h_after_created_at(self):
        """Drop expires_at is 24h after created_at"""
        response = requests.post(f"{BASE_URL}/api/drops", json={
            "track": {"title": "TTL Test Song", "artist": "TTL Artist"},
            "mood_emoji": "⏰",
            "mood_label": "Timing"
        })
        assert response.status_code == 200
        
        drop = response.json()["drop"]
        created_at = datetime.fromisoformat(drop["created_at"].replace("Z", "+00:00"))
        expires_at = datetime.fromisoformat(drop["expires_at"].replace("Z", "+00:00"))
        
        diff = expires_at - created_at
        # Should be approximately 24 hours (allow 1 minute tolerance)
        assert timedelta(hours=23, minutes=59) <= diff <= timedelta(hours=24, minutes=1), \
            f"expires_at should be 24h after created_at, got {diff}"
        
        print(f"✓ Drop TTL: expires_at is {diff} after created_at (expected ~24h)")


class TestDropsMongoDBIndexes:
    """Test MongoDB indexes for drops collection"""
    
    def test_drops_indexes_exist(self):
        """Verify drops.expires_at TTL index + drops.created_at -1 index exist"""
        from motor.motor_asyncio import AsyncIOMotorClient
        
        async def check_indexes():
            client = AsyncIOMotorClient("mongodb://localhost:27017")
            db = client["skapa"]
            indexes = await db.drops.index_information()
            client.close()
            return indexes
        
        indexes = asyncio.get_event_loop().run_until_complete(check_indexes())
        
        # Check expires_at TTL index
        expires_idx = None
        for name, info in indexes.items():
            if info.get("key") == [("expires_at", 1)]:
                expires_idx = info
                break
        
        assert expires_idx is not None, "Missing drops.expires_at index"
        assert "expireAfterSeconds" in expires_idx, "drops.expires_at should be TTL index"
        print(f"✓ drops.expires_at TTL index exists (expireAfterSeconds={expires_idx['expireAfterSeconds']})")
        
        # Check created_at -1 index
        created_idx = None
        for name, info in indexes.items():
            if info.get("key") == [("created_at", -1)]:
                created_idx = info
                break
        
        assert created_idx is not None, "Missing drops.created_at -1 index"
        print("✓ drops.created_at -1 index exists")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
