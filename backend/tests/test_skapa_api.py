"""
SKAPA Backend API Tests
Tests for Spotify OAuth PKCE authentication, session management, and user endpoints.
"""
import pytest
import requests
import sys
import os

# Add backend to path for importing security module
sys.path.insert(0, '/app/backend')

BASE_URL = "https://1e23550a-aef8-41ec-bafc-7efe3da04521.preview.emergentagent.com"


class TestHealthEndpoint:
    """Health check endpoint tests"""
    
    def test_health_returns_ok(self):
        """GET /api/health should return {ok: true, service: 'skapa'}"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data["ok"] is True
        assert data["service"] == "skapa"
        print("✓ Health endpoint returns correct response")


class TestSpotifyCallbackValidation:
    """POST /api/auth/spotify/callback validation tests"""
    
    def test_callback_missing_fields_returns_422(self):
        """POST /api/auth/spotify/callback with missing fields should return 422"""
        response = requests.post(f"{BASE_URL}/api/auth/spotify/callback", json={})
        assert response.status_code == 422
        print("✓ Missing fields returns 422")
    
    def test_callback_short_code_verifier_returns_422(self):
        """POST /api/auth/spotify/callback with too-short code_verifier (<43 chars) should return 422"""
        response = requests.post(f"{BASE_URL}/api/auth/spotify/callback", json={
            "code": "valid_code_12345",
            "code_verifier": "short",  # Less than 43 chars
            "redirect_uri": "https://example.com/callback"
        })
        assert response.status_code == 422
        data = response.json()
        # Verify it's a validation error for code_verifier
        assert "detail" in data
        print("✓ Short code_verifier returns 422")
    
    def test_callback_fake_code_returns_400(self):
        """POST /api/auth/spotify/callback with valid-shape but fake code should return 400 (invalid_grant)"""
        # Valid shape: code >= 10 chars, code_verifier 43-128 chars
        response = requests.post(f"{BASE_URL}/api/auth/spotify/callback", json={
            "code": "fake_authorization_code_12345",
            "code_verifier": "a" * 43,  # Exactly 43 chars (minimum)
            "redirect_uri": "https://example.com/callback"
        })
        assert response.status_code == 400
        data = response.json()
        assert "detail" in data
        # Should contain Spotify error about invalid_grant
        print(f"✓ Fake code returns 400 with message: {data['detail'][:100]}...")


class TestUnauthenticatedEndpoints:
    """Tests for endpoints that require authentication - should return 401 when unauthenticated"""
    
    def test_me_without_auth_returns_401(self):
        """GET /api/me without Authorization header should return 401"""
        response = requests.get(f"{BASE_URL}/api/me")
        assert response.status_code == 401
        data = response.json()
        assert "Missing bearer token" in data.get("detail", "")
        print("✓ GET /api/me without auth returns 401 'Missing bearer token'")
    
    def test_me_with_malformed_token_returns_401(self):
        """GET /api/me with malformed token should return 401"""
        response = requests.get(f"{BASE_URL}/api/me", headers={
            "Authorization": "Bearer not_a_valid_jwt_token"
        })
        assert response.status_code == 401
        data = response.json()
        assert "Invalid session" in data.get("detail", "")
        print("✓ GET /api/me with malformed token returns 401 'Invalid session'")
    
    def test_me_now_playing_unauthenticated_returns_401(self):
        """GET /api/me/now-playing unauthenticated should return 401"""
        response = requests.get(f"{BASE_URL}/api/me/now-playing")
        assert response.status_code == 401
        print("✓ GET /api/me/now-playing unauthenticated returns 401")
    
    def test_me_top_tracks_unauthenticated_returns_401(self):
        """GET /api/me/top-tracks unauthenticated should return 401"""
        response = requests.get(f"{BASE_URL}/api/me/top-tracks")
        assert response.status_code == 401
        print("✓ GET /api/me/top-tracks unauthenticated returns 401")
    
    def test_me_top_artists_unauthenticated_returns_401(self):
        """GET /api/me/top-artists unauthenticated should return 401"""
        response = requests.get(f"{BASE_URL}/api/me/top-artists")
        assert response.status_code == 401
        print("✓ GET /api/me/top-artists unauthenticated returns 401")
    
    def test_auth_refresh_unauthenticated_returns_401(self):
        """POST /api/auth/refresh unauthenticated should return 401"""
        response = requests.post(f"{BASE_URL}/api/auth/refresh")
        assert response.status_code == 401
        print("✓ POST /api/auth/refresh unauthenticated returns 401")
    
    def test_auth_logout_unauthenticated_returns_401(self):
        """POST /api/auth/logout unauthenticated should return 401"""
        response = requests.post(f"{BASE_URL}/api/auth/logout")
        assert response.status_code == 401
        print("✓ POST /api/auth/logout unauthenticated returns 401")
    
    def test_spotify_disconnect_unauthenticated_returns_401(self):
        """POST /api/auth/spotify/disconnect unauthenticated should return 401"""
        response = requests.post(f"{BASE_URL}/api/auth/spotify/disconnect")
        assert response.status_code == 401
        print("✓ POST /api/auth/spotify/disconnect unauthenticated returns 401")
    
    def test_me_vibe_unauthenticated_returns_401(self):
        """PUT /api/me/vibe unauthenticated should return 401"""
        response = requests.put(f"{BASE_URL}/api/me/vibe", json={
            "emoji": "🎵",
            "label": "Vibing"
        })
        assert response.status_code == 401
        print("✓ PUT /api/me/vibe unauthenticated returns 401")


class TestExpiredTamperedToken:
    """Tests for expired/tampered JWT tokens"""
    
    def test_expired_jwt_returns_401(self):
        """GET /api/me with an expired JWT should return 401"""
        # Create an expired token manually
        from jose import jwt
        from datetime import datetime, timedelta, timezone
        
        # Load JWT_SECRET from env
        jwt_secret = "9b6734cd78d620e5cede6de19a3596c656b860edb1eca709323d6b6f74692a67ab222cc20c106d51fbd3ab433002ebf2"
        
        # Create expired token
        now = datetime.now(timezone.utc)
        payload = {
            "sub": "507f1f77bcf86cd799439011",  # Fake user ID
            "jti": "expired_jti_12345",
            "iat": int((now - timedelta(days=60)).timestamp()),
            "exp": int((now - timedelta(days=30)).timestamp()),  # Expired 30 days ago
        }
        expired_token = jwt.encode(payload, jwt_secret, algorithm="HS256")
        
        response = requests.get(f"{BASE_URL}/api/me", headers={
            "Authorization": f"Bearer {expired_token}"
        })
        assert response.status_code == 401
        print("✓ Expired JWT returns 401")
    
    def test_tampered_jwt_returns_401(self):
        """GET /api/me with a tampered JWT should return 401"""
        # Create a valid-looking token but with wrong secret
        from jose import jwt
        from datetime import datetime, timedelta, timezone
        
        now = datetime.now(timezone.utc)
        payload = {
            "sub": "507f1f77bcf86cd799439011",
            "jti": "tampered_jti_12345",
            "iat": int(now.timestamp()),
            "exp": int((now + timedelta(days=30)).timestamp()),
        }
        # Sign with wrong secret
        tampered_token = jwt.encode(payload, "wrong_secret", algorithm="HS256")
        
        response = requests.get(f"{BASE_URL}/api/me", headers={
            "Authorization": f"Bearer {tampered_token}"
        })
        assert response.status_code == 401
        print("✓ Tampered JWT returns 401")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
