"""
Crypto + JWT helpers. AES-GCM at-rest encryption for Spotify refresh tokens,
HS256 JWTs for our own session tokens.
"""
import base64
import os
import uuid
from datetime import datetime, timedelta, timezone
from typing import Optional

from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from fastapi import Depends, Header, HTTPException, status
from jose import JWTError, jwt

from config import settings


# ── AES-256-GCM ──────────────────────────────────────────────────────────────
_KEY = base64.b64decode(settings.TOKEN_ENCRYPTION_KEY)
if len(_KEY) != 32:
    raise RuntimeError("TOKEN_ENCRYPTION_KEY must decode to 32 bytes")
_AES = AESGCM(_KEY)


def encrypt_token(plaintext: str) -> str:
    nonce = os.urandom(12)
    ct = _AES.encrypt(nonce, plaintext.encode(), None)
    return base64.b64encode(nonce + ct).decode()


def decrypt_token(blob: str) -> str:
    raw = base64.b64decode(blob)
    return _AES.decrypt(raw[:12], raw[12:], None).decode()


# ── JWT session tokens ──────────────────────────────────────────────────────
JWT_ALG = "HS256"
JWT_TTL_DAYS = 30


def create_session_jwt(user_id: str) -> tuple[str, str]:
    """Returns (token, jti)."""
    now = datetime.now(timezone.utc)
    jti = uuid.uuid4().hex
    payload = {
        "sub": user_id,
        "jti": jti,
        "iat": int(now.timestamp()),
        "exp": int((now + timedelta(days=JWT_TTL_DAYS)).timestamp()),
    }
    token = jwt.encode(payload, settings.JWT_SECRET, algorithm=JWT_ALG)
    return token, jti


def decode_session_jwt(token: str) -> dict:
    try:
        return jwt.decode(token, settings.JWT_SECRET, algorithms=[JWT_ALG])
    except JWTError as e:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, f"Invalid session: {e}")


# ── FastAPI dependency — extracts current user from Authorization header ────
async def current_user(authorization: Optional[str] = Header(default=None)) -> dict:
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Missing bearer token")
    token = authorization.split(" ", 1)[1].strip()
    claims = decode_session_jwt(token)

    # Import locally to avoid circular
    from db import get_user_by_id, is_session_revoked

    if await is_session_revoked(claims["jti"]):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Session revoked")

    user = await get_user_by_id(claims["sub"])
    if not user:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "User not found")
    user["_jti"] = claims["jti"]
    return user
