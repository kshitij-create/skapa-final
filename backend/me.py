"""
/api/me + Spotify-proxied current-playing & top-tracks endpoints.
"""
from datetime import datetime, timezone
from typing import Optional

import httpx
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field

from config import settings
from db import db, public_user, set_user_vibe
from security import current_user, decrypt_token, encrypt_token

router = APIRouter(prefix="/api", tags=["me"])

SPOTIFY_TOKEN_URL = "https://accounts.spotify.com/api/token"


async def _get_access_token(user: dict) -> Optional[str]:
    """Return a valid Spotify access token, refreshing if needed."""
    sp = user.get("spotify") or {}
    if not sp.get("connected"):
        return None

    now_ts = datetime.now(timezone.utc).timestamp()
    if sp.get("access_token") and sp.get("access_expires_at", 0) > now_ts:
        return sp["access_token"]

    enc = sp.get("refresh_token_enc")
    if not enc:
        return None
    refresh = decrypt_token(enc)

    async with httpx.AsyncClient(timeout=10) as c:
        r = await c.post(SPOTIFY_TOKEN_URL, data={
            "grant_type": "refresh_token",
            "refresh_token": refresh,
            "client_id": settings.SPOTIFY_CLIENT_ID,
            "client_secret": settings.SPOTIFY_CLIENT_SECRET,
        })
    if r.status_code != 200:
        return None
    new = r.json()

    update = {
        "spotify.access_token": new["access_token"],
        "spotify.access_expires_at": now_ts + int(new["expires_in"]) - 60,
    }
    if new.get("refresh_token"):
        update["spotify.refresh_token_enc"] = encrypt_token(new["refresh_token"])

    await db().users.update_one({"_id": user["_id"]}, {"$set": update})
    return new["access_token"]


@router.get("/me")
async def me(user: dict = Depends(current_user)):
    return {"user": public_user(user)}


@router.get("/me/now-playing")
async def now_playing(user: dict = Depends(current_user)):
    tok = await _get_access_token(user)
    if not tok:
        raise HTTPException(400, "Spotify not connected")
    async with httpx.AsyncClient(timeout=10) as c:
        r = await c.get(
            "https://api.spotify.com/v1/me/player/currently-playing",
            headers={"Authorization": f"Bearer {tok}"},
        )
    if r.status_code == 204:
        return {"is_playing": False, "track": None}
    if r.status_code != 200:
        raise HTTPException(502, f"Spotify error {r.status_code}")
    data = r.json()
    item = data.get("item") or {}
    return {
        "is_playing": data.get("is_playing", False),
        "track": {
            "id": item.get("id"),
            "title": item.get("name"),
            "artist": ", ".join(a["name"] for a in (item.get("artists") or [])),
            "cover": (item.get("album", {}).get("images") or [{}])[0].get("url"),
            "duration_ms": item.get("duration_ms"),
            "progress_ms": data.get("progress_ms"),
        } if item else None,
    }


@router.get("/me/top-tracks")
async def top_tracks(user: dict = Depends(current_user), limit: int = 10):
    tok = await _get_access_token(user)
    if not tok:
        raise HTTPException(400, "Spotify not connected")
    async with httpx.AsyncClient(timeout=10) as c:
        r = await c.get(
            f"https://api.spotify.com/v1/me/top/tracks?limit={min(max(limit,1),50)}&time_range=short_term",
            headers={"Authorization": f"Bearer {tok}"},
        )
    if r.status_code != 200:
        raise HTTPException(502, f"Spotify error {r.status_code}")
    items = r.json().get("items", [])
    return {"tracks": [{
        "id": t["id"],
        "title": t["name"],
        "artist": ", ".join(a["name"] for a in t["artists"]),
        "cover": (t["album"]["images"] or [{}])[0].get("url"),
        "popularity": t.get("popularity"),
    } for t in items]}


@router.get("/me/top-artists")
async def top_artists(user: dict = Depends(current_user), limit: int = 8):
    tok = await _get_access_token(user)
    if not tok:
        raise HTTPException(400, "Spotify not connected")
    async with httpx.AsyncClient(timeout=10) as c:
        r = await c.get(
            f"https://api.spotify.com/v1/me/top/artists?limit={min(max(limit,1),50)}&time_range=short_term",
            headers={"Authorization": f"Bearer {tok}"},
        )
    if r.status_code != 200:
        raise HTTPException(502, f"Spotify error {r.status_code}")
    items = r.json().get("items", [])
    return {"artists": [{
        "id": a["id"],
        "name": a["name"],
        "image": (a.get("images") or [{}])[0].get("url"),
        "genres": a.get("genres", [])[:2],
    } for a in items]}


class VibeBody(BaseModel):
    emoji: str = Field(..., min_length=1, max_length=8)
    label: str = Field(..., min_length=1, max_length=40)


@router.put("/me/vibe")
async def update_vibe(body: VibeBody, user: dict = Depends(current_user)):
    fresh = await set_user_vibe(str(user["_id"]), body.emoji, body.label)
    return {"user": public_user(fresh)}
