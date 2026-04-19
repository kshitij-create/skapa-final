"""
Auth router — Spotify OAuth PKCE callback, refresh, disconnect, logout.
"""
from datetime import datetime, timezone

import httpx
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field

from config import settings
from db import (
    db,
    disconnect_spotify,
    get_user_by_id,
    public_user,
    revoke_session,
    upsert_spotify_user,
)
from security import (
    create_session_jwt,
    current_user,
    decode_session_jwt,
    encrypt_token,
    decrypt_token,
)


router = APIRouter(prefix="/api/auth", tags=["auth"])

SPOTIFY_TOKEN_URL = "https://accounts.spotify.com/api/token"
SPOTIFY_ME_URL = "https://api.spotify.com/v1/me"


class SpotifyCallbackBody(BaseModel):
    code: str = Field(..., min_length=10)
    code_verifier: str = Field(..., min_length=43, max_length=128)
    redirect_uri: str = Field(..., min_length=8)


@router.post("/spotify/callback")
async def spotify_callback(body: SpotifyCallbackBody):
    """
    Exchange authorization_code (+ PKCE verifier) for tokens, fetch profile,
    upsert user, issue our session JWT.
    """
    form = {
        "grant_type": "authorization_code",
        "code": body.code,
        "redirect_uri": body.redirect_uri,
        "client_id": settings.SPOTIFY_CLIENT_ID,
        "client_secret": settings.SPOTIFY_CLIENT_SECRET,
        "code_verifier": body.code_verifier,
    }

    async with httpx.AsyncClient(timeout=15) as client:
        tok_r = await client.post(SPOTIFY_TOKEN_URL, data=form)
        if tok_r.status_code != 200:
            raise HTTPException(400, f"Spotify token exchange failed: {tok_r.text}")
        tokens = tok_r.json()

        me_r = await client.get(
            SPOTIFY_ME_URL,
            headers={"Authorization": f"Bearer {tokens['access_token']}"},
        )
        if me_r.status_code != 200:
            raise HTTPException(502, f"Spotify /me failed: {me_r.text}")
        profile = me_r.json()

    user_doc = await upsert_spotify_user(profile, tokens)
    jwt_token, _jti = create_session_jwt(str(user_doc["_id"]))

    return {"token": jwt_token, "user": public_user(user_doc)}


@router.post("/refresh")
async def refresh_session(user: dict = Depends(current_user)):
    """Rotate our session JWT — client calls this ~once a day."""
    # Revoke old session first
    from datetime import timedelta
    exp = datetime.now(timezone.utc) + timedelta(days=1)
    await revoke_session(user["_jti"], str(user["_id"]), exp)

    jwt_token, _jti = create_session_jwt(str(user["_id"]))
    return {"token": jwt_token, "user": public_user(user)}


@router.post("/logout")
async def logout(user: dict = Depends(current_user)):
    from datetime import timedelta
    exp = datetime.now(timezone.utc) + timedelta(days=30)
    await revoke_session(user["_jti"], str(user["_id"]), exp)
    return {"ok": True}


@router.post("/spotify/disconnect")
async def spotify_disconnect(user: dict = Depends(current_user)):
    await disconnect_spotify(str(user["_id"]))
    fresh = await get_user_by_id(str(user["_id"]))
    return {"ok": True, "user": public_user(fresh)}
