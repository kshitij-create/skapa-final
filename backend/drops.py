"""
Drops router — "Drop a Vibe" pins on the map.

A drop is a short-lived (24h TTL) pin a user leaves on the map: a track,
a mood, an optional caption, coordinates. Others can see them and "wave"
or "tune in".

For MVP: no real geolocation filtering — returns the latest N drops.
"""
from datetime import datetime, timedelta, timezone
from typing import Optional

from bson import ObjectId
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field

from db import db


router = APIRouter(prefix="/api/drops", tags=["drops"])


# ── Models ──────────────────────────────────────────────────────────────────
class TrackIn(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    artist: str = Field(..., min_length=1, max_length=200)
    cover: Optional[str] = None
    spotify_id: Optional[str] = None


class DropCreate(BaseModel):
    track: TrackIn
    mood_emoji: str = Field(..., min_length=1, max_length=8)
    mood_label: str = Field(..., min_length=1, max_length=40)
    caption: Optional[str] = Field(default=None, max_length=180)
    color: Optional[str] = Field(default="#ff8a00")
    lat: Optional[float] = Field(default=None, ge=-90, le=90)
    lng: Optional[float] = Field(default=None, ge=-180, le=180)

    # Mock user identity — until auth lands
    user_name: str = Field(default="You", min_length=1, max_length=40)
    user_avatar: Optional[str] = None
    user_handle: Optional[str] = None


def _public(d: dict) -> dict:
    return {
        "id": str(d["_id"]),
        "user": {
            "name": d["user_name"],
            "avatar": d.get("user_avatar"),
            "handle": d.get("user_handle"),
        },
        "track": d["track"],
        "mood": {"emoji": d["mood_emoji"], "label": d["mood_label"]},
        "caption": d.get("caption"),
        "color": d.get("color", "#ff8a00"),
        "lat": d.get("lat"),
        "lng": d.get("lng"),
        "waves": d.get("waves", 0),
        "tunes_in": d.get("tunes_in", 0),
        "created_at": d["created_at"].isoformat(),
        "expires_at": d["expires_at"].isoformat(),
    }


@router.post("")
async def create_drop(body: DropCreate):
    now = datetime.now(timezone.utc)
    doc = {
        **body.model_dump(),
        "track": body.track.model_dump(),
        "created_at": now,
        "expires_at": now + timedelta(hours=24),
        "waves": 0,
        "tunes_in": 0,
    }
    res = await db().drops.insert_one(doc)
    doc["_id"] = res.inserted_id
    return {"drop": _public(doc)}


@router.get("")
async def list_drops(limit: int = Query(50, ge=1, le=200)):
    # TTL index on expires_at auto-removes, but guard defensively
    cursor = db().drops.find({
        "expires_at": {"$gt": datetime.now(timezone.utc)},
    }).sort("created_at", -1).limit(limit)
    drops = await cursor.to_list(length=limit)
    return {"drops": [_public(d) for d in drops]}


@router.post("/{drop_id}/wave")
async def wave_drop(drop_id: str):
    try:
        oid = ObjectId(drop_id)
    except Exception:
        raise HTTPException(400, "invalid drop id")
    res = await db().drops.find_one_and_update(
        {"_id": oid}, {"$inc": {"waves": 1}}, return_document=True
    )
    if not res:
        raise HTTPException(404, "drop not found")
    return {"ok": True, "waves": res.get("waves", 0)}


@router.post("/{drop_id}/tune-in")
async def tune_in_drop(drop_id: str):
    try:
        oid = ObjectId(drop_id)
    except Exception:
        raise HTTPException(400, "invalid drop id")
    res = await db().drops.find_one_and_update(
        {"_id": oid}, {"$inc": {"tunes_in": 1}}, return_document=True
    )
    if not res:
        raise HTTPException(404, "drop not found")
    return {"ok": True, "tunes_in": res.get("tunes_in", 0)}
