"""
MongoDB data access — users, sessions, handles.
All Spotify refresh tokens are stored encrypted.
"""
from datetime import datetime, timezone
from typing import Any, Optional

from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase

from config import settings
from security import encrypt_token


_client: Optional[AsyncIOMotorClient] = None
_db: Optional[AsyncIOMotorDatabase] = None


async def init_db():
    global _client, _db
    _client = AsyncIOMotorClient(settings.MONGO_URL)
    _db = _client[settings.DB_NAME]
    # Indexes
    await _db.users.create_index("spotify_id", unique=True)
    await _db.users.create_index("handle", unique=True, sparse=True)
    await _db.sessions.create_index("jti", unique=True)
    await _db.sessions.create_index("expires_at", expireAfterSeconds=0)
    # Drops: TTL + recent-first query
    await _db.drops.create_index("expires_at", expireAfterSeconds=0)
    await _db.drops.create_index([("created_at", -1)])


async def close_db():
    global _client
    if _client:
        _client.close()


def db() -> AsyncIOMotorDatabase:
    assert _db is not None, "DB not initialised"
    return _db


# ── User helpers ────────────────────────────────────────────────────────────
def _public_user(doc: dict) -> dict:
    """Safe dict to return to client (no tokens, no _id)."""
    return {
        "id": str(doc["_id"]),
        "spotify_id": doc["spotify_id"],
        "handle": doc.get("handle"),
        "display_name": doc.get("display_name"),
        "email": doc.get("email"),
        "avatar_url": doc.get("avatar_url"),
        "country": doc.get("country"),
        "product": doc.get("product"),
        "vibe": doc.get("vibe"),
        "profile": doc.get("profile"),
        "stats": doc.get("stats", {"following": 0, "followers": 0, "streak_days": 0}),
        "spotify_connected": doc.get("spotify", {}).get("connected", False),
        "created_at": doc.get("created_at"),
    }


async def _unique_handle(base: str) -> str:
    base = "".join(c for c in base.lower() if c.isalnum() or c in "_-") or "user"
    handle = base
    i = 0
    while await db().users.find_one({"handle": handle}, {"_id": 1}):
        i += 1
        handle = f"{base}{i}"
    return handle


async def upsert_spotify_user(profile: dict, tokens: dict) -> dict:
    """
    profile: https://api.spotify.com/v1/me response
    tokens:  https://accounts.spotify.com/api/token response
    Returns the user document (internal shape incl. _id).
    """
    now = datetime.now(timezone.utc)
    spotify_id = profile["id"]

    existing = await db().users.find_one({"spotify_id": spotify_id})

    images = profile.get("images") or []
    avatar_url = images[0]["url"] if images else None

    spotify_block = {
        "connected": True,
        "connected_at": existing["spotify"].get("connected_at") if existing and existing.get("spotify") else now,
        "scopes": tokens.get("scope", "").split(" "),
        "access_token": tokens["access_token"],
        "access_expires_at": now.timestamp() + int(tokens["expires_in"]) - 60,
        "refresh_token_enc": encrypt_token(tokens["refresh_token"]) if tokens.get("refresh_token")
            else (existing["spotify"].get("refresh_token_enc") if existing and existing.get("spotify") else None),
    }

    doc = {
        "spotify_id": spotify_id,
        "display_name": profile.get("display_name") or "Listener",
        "email": (profile.get("email") or "").lower() or None,
        "avatar_url": avatar_url,
        "country": profile.get("country"),
        "product": profile.get("product"),
        "spotify": spotify_block,
        "last_login_at": now,
        "updated_at": now,
    }

    if existing:
        await db().users.update_one({"_id": existing["_id"]}, {"$set": doc})
        return await db().users.find_one({"_id": existing["_id"]})

    # New user — seed defaults
    handle = await _unique_handle(
        profile.get("display_name") or profile.get("id") or "user"
    )
    doc.update({
        "handle": handle,
        "created_at": now,
        "vibe": {"emoji": "🌊", "label": "Late Night", "set_at": now},
        "profile": {"bio": "", "private": False, "share_slug": handle},
        "stats": {"following": 0, "followers": 0, "streak_days": 1},
    })
    res = await db().users.insert_one(doc)
    return await db().users.find_one({"_id": res.inserted_id})


async def get_user_by_id(user_id: str) -> Optional[dict]:
    try:
        oid = ObjectId(user_id)
    except Exception:
        return None
    return await db().users.find_one({"_id": oid})


async def set_user_vibe(user_id: str, emoji: str, label: str) -> dict:
    now = datetime.now(timezone.utc)
    await db().users.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": {"vibe": {"emoji": emoji, "label": label, "set_at": now}, "updated_at": now}},
    )
    return await get_user_by_id(user_id)


async def disconnect_spotify(user_id: str):
    await db().users.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": {
            "spotify.connected": False,
            "spotify.refresh_token_enc": None,
            "spotify.access_token": None,
            "spotify.access_expires_at": 0,
            "updated_at": datetime.now(timezone.utc),
        }},
    )


# ── Session revocation ─────────────────────────────────────────────────────
async def revoke_session(jti: str, user_id: str, expires_at: datetime):
    await db().sessions.update_one(
        {"jti": jti},
        {"$set": {"jti": jti, "user_id": user_id, "expires_at": expires_at, "revoked": True}},
        upsert=True,
    )


async def is_session_revoked(jti: str) -> bool:
    doc = await db().sessions.find_one({"jti": jti}, {"revoked": 1})
    return bool(doc and doc.get("revoked"))


# Public helper
public_user = _public_user
