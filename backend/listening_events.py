"""
Listening events ingestion & API — polls Spotify now-playing for all users,
stores events in MongoDB, and exposes them for the live map.

Background polling runs every 30s, fetching now-playing for all connected users.
"""
from datetime import datetime, timedelta, timezone
from typing import Optional
import asyncio
import random

import httpx
from fastapi import APIRouter, Query
from bson import ObjectId

from config import settings
from db import db
from security import decrypt_token

router = APIRouter(prefix="/api/listening", tags=["listening"])

# Mock coordinates (Gen Z hotspots around the world)
MOCK_LOCATIONS = [
    # Mumbai, India
    {"lat": 19.0760, "lng": 72.8777, "city": "Mumbai"},
    {"lat": 19.1136, "lng": 72.8697, "city": "Andheri"},
    {"lat": 18.9220, "lng": 72.8347, "city": "Bandra"},
    # Delhi NCR
    {"lat": 28.5355, "lng": 77.3910, "city": "Noida"},
    {"lat": 28.4595, "lng": 77.0266, "city": "Gurugram"},
    {"lat": 28.7041, "lng": 77.1025, "city": "Delhi"},
    # Bangalore
    {"lat": 12.9716, "lng": 77.5946, "city": "Bangalore"},
    {"lat": 12.9352, "lng": 77.6245, "city": "Indiranagar"},
    # New York
    {"lat": 40.7580, "lng": -73.9855, "city": "Times Square"},
    {"lat": 40.7489, "lng": -73.9680, "city": "Williamsburg"},
    # Los Angeles
    {"lat": 34.0522, "lng": -118.2437, "city": "LA"},
    {"lat": 34.1015, "lng": -118.3416, "city": "West Hollywood"},
    # London
    {"lat": 51.5074, "lng": -0.1278, "city": "London"},
    {"lat": 51.5155, "lng": -0.0922, "city": "Shoreditch"},
    # Tokyo
    {"lat": 35.6762, "lng": 139.6503, "city": "Shibuya"},
    {"lat": 35.6598, "lng": 139.7006, "city": "Roppongi"},
    # Seoul
    {"lat": 37.5665, "lng": 126.9780, "city": "Seoul"},
    {"lat": 37.5172, "lng": 127.0473, "city": "Gangnam"},
]

SPOTIFY_TOKEN_URL = "https://accounts.spotify.com/api/token"


async def _refresh_access_token(user: dict) -> Optional[str]:
    """Refresh Spotify access token if needed, return valid token or None."""
    sp = user.get("spotify") or {}
    if not sp.get("connected"):
        return None

    now_ts = datetime.now(timezone.utc).timestamp()
    
    # Return cached token if still valid
    if sp.get("access_token") and sp.get("access_expires_at", 0) > now_ts:
        return sp["access_token"]

    # Refresh token
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
    
    # Update user's tokens in DB
    update = {
        "spotify.access_token": new["access_token"],
        "spotify.access_expires_at": now_ts + int(new["expires_in"]) - 60,
    }
    if new.get("refresh_token"):
        from security import encrypt_token
        update["spotify.refresh_token_enc"] = encrypt_token(new["refresh_token"])
    
    await db().users.update_one({"_id": user["_id"]}, {"$set": update})
    return new["access_token"]


async def _fetch_now_playing(user: dict) -> Optional[dict]:
    """Fetch currently playing track from Spotify for a user."""
    tok = await _refresh_access_token(user)
    if not tok:
        return None
    
    try:
        async with httpx.AsyncClient(timeout=10) as c:
            r = await c.get(
                "https://api.spotify.com/v1/me/player/currently-playing",
                headers={"Authorization": f"Bearer {tok}"},
            )
        
        if r.status_code == 204:  # Nothing playing
            return None
        if r.status_code != 200:
            return None
        
        data = r.json()
        if not data.get("is_playing"):
            return None
        
        item = data.get("item") or {}
        if not item:
            return None
        
        return {
            "spotify_id": item.get("id"),
            "title": item.get("name", "Unknown Track"),
            "artist": ", ".join(a["name"] for a in (item.get("artists") or [])) or "Unknown Artist",
            "cover": (item.get("album", {}).get("images") or [{}])[0].get("url"),
            "duration_ms": item.get("duration_ms"),
            "progress_ms": data.get("progress_ms"),
        }
    except Exception:
        return None


def _random_location() -> dict:
    """Return a random mock location."""
    loc = random.choice(MOCK_LOCATIONS)
    # Add small random offset for variety (±0.01 degrees ≈ 1km)
    return {
        "lat": loc["lat"] + random.uniform(-0.01, 0.01),
        "lng": loc["lng"] + random.uniform(-0.01, 0.01),
        "city": loc["city"],
    }


async def poll_listening_events():
    """
    Background task: poll all connected users' now-playing, store in DB.
    Runs every 30 seconds.
    """
    while True:
        try:
            now = datetime.now(timezone.utc)
            
            # Find all users with active Spotify connection
            users = await db().users.find({
                "spotify.connected": True,
            }).to_list(length=None)
            
            print(f"[Listening Events] Polling {len(users)} users...")
            
            for user in users:
                track = await _fetch_now_playing(user)
                if not track:
                    continue
                
                # Get or create user location (mock for now)
                user_id = str(user["_id"])
                
                # Check if user already has a location in recent events
                recent_event = await db().listening_events.find_one(
                    {"user_id": user_id},
                    sort=[("timestamp", -1)]
                )
                
                if recent_event and recent_event.get("location"):
                    location = recent_event["location"]
                else:
                    location = _random_location()
                
                # Create listening event
                event = {
                    "user_id": user_id,
                    "user": {
                        "id": user_id,
                        "display_name": user.get("display_name", "Listener"),
                        "avatar_url": user.get("avatar_url"),
                        "handle": user.get("handle"),
                    },
                    "track": track,
                    "vibe": user.get("vibe"),
                    "location": location,
                    "timestamp": now,
                    "expires_at": now + timedelta(minutes=5),  # Auto-cleanup old events
                }
                
                # Upsert: replace old event for this user with new one
                await db().listening_events.update_one(
                    {"user_id": user_id},
                    {"$set": event},
                    upsert=True
                )
            
            print(f"[Listening Events] Poll complete. Sleeping 30s...")
            
        except Exception as e:
            print(f"[Listening Events] Error: {e}")
        
        await asyncio.sleep(30)


# ── REST API ────────────────────────────────────────────────────────────────

@router.get("/events")
async def get_listening_events(
    limit: int = Query(100, ge=1, le=500),
    lat: Optional[float] = Query(None, ge=-90, le=90),
    lng: Optional[float] = Query(None, ge=-180, le=180),
    radius_km: Optional[float] = Query(None, ge=0.1, le=10000),
):
    """
    Get active listening events (users currently playing music).
    
    Params:
    - limit: max number of events to return
    - lat, lng, radius_km: optional geo-filter (not implemented yet, returns all)
    """
    now = datetime.now(timezone.utc)
    
    # Find all active listening events (not expired)
    cursor = db().listening_events.find({
        "expires_at": {"$gt": now},
    }).sort("timestamp", -1).limit(limit)
    
    events = await cursor.to_list(length=limit)
    
    return {
        "events": [
            {
                "id": str(e["_id"]),
                "user": e["user"],
                "track": e["track"],
                "vibe": e.get("vibe"),
                "location": e.get("location"),
                "timestamp": e["timestamp"].isoformat(),
            }
            for e in events
        ],
        "count": len(events),
    }


@router.get("/events/nearby")
async def get_nearby_events(
    lat: float = Query(..., ge=-90, le=90),
    lng: float = Query(..., ge=-180, le=180),
    radius_km: float = Query(10, ge=0.1, le=100),
    limit: int = Query(50, ge=1, le=200),
):
    """
    Get listening events near a location.
    For now, returns all events (geo-filtering to be implemented).
    """
    # TODO: Implement proper geo-spatial queries with MongoDB $geoNear
    # For MVP, just return recent events
    now = datetime.now(timezone.utc)
    
    cursor = db().listening_events.find({
        "expires_at": {"$gt": now},
    }).sort("timestamp", -1).limit(limit)
    
    events = await cursor.to_list(length=limit)
    
    return {
        "events": [
            {
                "id": str(e["_id"]),
                "user": e["user"],
                "track": e["track"],
                "vibe": e.get("vibe"),
                "location": e.get("location"),
                "timestamp": e["timestamp"].isoformat(),
            }
            for e in events
        ],
        "count": len(events),
        "filter": {"lat": lat, "lng": lng, "radius_km": radius_km},
    }


@router.get("/stats")
async def get_listening_stats():
    """Get overall listening statistics."""
    now = datetime.now(timezone.utc)
    
    # Count active listeners
    active_count = await db().listening_events.count_documents({
        "expires_at": {"$gt": now},
    })
    
    # Get total users with Spotify connected
    total_users = await db().users.count_documents({
        "spotify.connected": True,
    })
    
    # Sample recent tracks
    recent_cursor = db().listening_events.find({
        "expires_at": {"$gt": now},
    }).sort("timestamp", -1).limit(5)
    recent = await recent_cursor.to_list(length=5)
    
    return {
        "active_listeners": active_count,
        "total_connected_users": total_users,
        "recent_tracks": [
            {
                "user": e["user"]["display_name"],
                "track": f"{e['track']['title']} - {e['track']['artist']}",
                "timestamp": e["timestamp"].isoformat(),
            }
            for e in recent
        ],
    }
