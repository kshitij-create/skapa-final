"""
Rooms — REST + WebSocket presence.

Room lifecycle:
- POST /api/rooms         → create
- GET  /api/rooms         → list live rooms
- GET  /api/rooms/{code}  → single room details
- WS   /ws/rooms/{code}   → presence + reactions + now-playing broadcast

Connection manager is in-memory (per-worker). Acceptable for MVP; for
multi-worker prod, swap the `rooms_conn` dict for Redis pub-sub.
"""
from __future__ import annotations

import asyncio
import json
import secrets
import string
from collections import defaultdict
from datetime import datetime, timezone
from typing import Optional

from bson import ObjectId
from fastapi import APIRouter, HTTPException, WebSocket, WebSocketDisconnect
from pydantic import BaseModel, Field

from db import db


router = APIRouter(tags=["rooms"])


# ─── Models ─────────────────────────────────────────────────────────────────
class TrackIn(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    artist: str = Field(..., min_length=1, max_length=200)
    cover: Optional[str] = None


class RoomCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=40)
    mood_emoji: str = Field(..., min_length=1, max_length=8)
    mood_label: str = Field(..., min_length=1, max_length=40)
    color: Optional[str] = "#8A2BE2"
    host_name: str = Field(..., min_length=1, max_length=40)
    host_avatar: Optional[str] = None
    host_id: str = Field(..., min_length=1, max_length=40)
    track: Optional[TrackIn] = None


def _public_room(r: dict, presence: dict | None = None) -> dict:
    members = (presence or {}).get(r["code"], {})
    return {
        "id": str(r["_id"]),
        "code": r["code"],
        "name": r["name"],
        "mood": {"emoji": r.get("mood_emoji"), "label": r.get("mood_label")},
        "color": r.get("color", "#8A2BE2"),
        "host": {
            "id": r["host_id"],
            "name": r["host_name"],
            "avatar": r.get("host_avatar"),
        },
        "track": r.get("track"),
        "live_count": len(members),
        "members_preview": [
            {"id": m["id"], "name": m["name"], "avatar": m.get("avatar")}
            for m in list(members.values())[:5]
        ],
        "created_at": r["created_at"].isoformat(),
    }


def _gen_code(length: int = 6) -> str:
    alpha = string.ascii_uppercase + string.digits
    return "".join(secrets.choice(alpha) for _ in range(length))


# ─── Connection manager ────────────────────────────────────────────────────
class RoomConnections:
    """In-memory presence per room."""

    def __init__(self):
        # room_code -> {user_id -> {ws, id, name, avatar}}
        self._rooms: dict[str, dict[str, dict]] = defaultdict(dict)
        self._lock = asyncio.Lock()

    def members(self, code: str) -> dict[str, dict]:
        return self._rooms.get(code, {})

    def all_presence(self) -> dict[str, dict]:
        return dict(self._rooms)

    async def connect(self, code: str, user: dict, ws: WebSocket):
        async with self._lock:
            self._rooms[code][user["id"]] = {**user, "ws": ws}

    async def disconnect(self, code: str, user_id: str):
        async with self._lock:
            if code in self._rooms and user_id in self._rooms[code]:
                self._rooms[code].pop(user_id, None)
                if not self._rooms[code]:
                    self._rooms.pop(code, None)

    async def broadcast(self, code: str, message: dict, exclude_id: str | None = None):
        members = list(self._rooms.get(code, {}).values())
        dead: list[str] = []
        for m in members:
            if exclude_id and m["id"] == exclude_id:
                continue
            try:
                await m["ws"].send_json(message)
            except Exception:
                dead.append(m["id"])
        for mid in dead:
            await self.disconnect(code, mid)


conn_mgr = RoomConnections()


# ─── REST endpoints ─────────────────────────────────────────────────────────
@router.post("/api/rooms")
async def create_room(body: RoomCreate):
    code = _gen_code()
    while await db().rooms.find_one({"code": code}, {"_id": 1}):
        code = _gen_code()

    now = datetime.now(timezone.utc)
    doc = {
        "code": code,
        "name": body.name,
        "mood_emoji": body.mood_emoji,
        "mood_label": body.mood_label,
        "color": body.color or "#8A2BE2",
        "host_id": body.host_id,
        "host_name": body.host_name,
        "host_avatar": body.host_avatar,
        "track": body.track.model_dump() if body.track else None,
        "created_at": now,
        "last_active_at": now,
    }
    res = await db().rooms.insert_one(doc)
    doc["_id"] = res.inserted_id
    return {"room": _public_room(doc, conn_mgr.all_presence())}


@router.get("/api/rooms")
async def list_rooms(limit: int = 50):
    cursor = db().rooms.find().sort("last_active_at", -1).limit(limit)
    rooms = await cursor.to_list(length=limit)
    presence = conn_mgr.all_presence()
    return {"rooms": [_public_room(r, presence) for r in rooms]}


@router.get("/api/rooms/{code}")
async def get_room(code: str):
    room = await db().rooms.find_one({"code": code.upper()})
    if not room:
        raise HTTPException(404, "Room not found")
    return {"room": _public_room(room, conn_mgr.all_presence())}


# ─── WebSocket ─────────────────────────────────────────────────────────────
@router.websocket("/ws/rooms/{code}")
async def ws_room(websocket: WebSocket, code: str):
    """
    Expected first client message: {"type":"hello","user":{"id","name","avatar"}}

    Messages server → client:
    - {"type":"room_state","members":[...],"track":{...}}
    - {"type":"member_joined","member":{id,name,avatar}}
    - {"type":"member_left","id":"..."}
    - {"type":"now_playing","track":{...},"by":"<id>"}
    - {"type":"reaction","emoji":"🔥","by":{id,name,avatar}}
    """
    await websocket.accept()
    code = code.upper()
    user: dict | None = None

    try:
        # Handshake
        hello = await asyncio.wait_for(websocket.receive_json(), timeout=10)
        if hello.get("type") != "hello" or "user" not in hello:
            await websocket.close(code=4000)
            return
        u = hello["user"]
        if not all(k in u for k in ("id", "name")):
            await websocket.close(code=4000)
            return
        user = {"id": str(u["id"])[:40], "name": str(u["name"])[:40], "avatar": u.get("avatar")}

        # Ensure room exists
        room = await db().rooms.find_one({"code": code})
        if not room:
            await websocket.send_json({"type": "error", "message": "room not found"})
            await websocket.close(code=4004)
            return

        await conn_mgr.connect(code, user, websocket)

        # Send current state
        members = [
            {"id": m["id"], "name": m["name"], "avatar": m.get("avatar")}
            for m in conn_mgr.members(code).values()
        ]
        await websocket.send_json({
            "type": "room_state",
            "room": {
                "code": room["code"],
                "name": room["name"],
                "mood": {"emoji": room.get("mood_emoji"), "label": room.get("mood_label")},
                "color": room.get("color", "#8A2BE2"),
                "host": {
                    "id": room["host_id"],
                    "name": room["host_name"],
                    "avatar": room.get("host_avatar"),
                },
            },
            "track": room.get("track"),
            "members": members,
        })
        # Notify others
        await conn_mgr.broadcast(
            code,
            {"type": "member_joined", "member": user},
            exclude_id=user["id"],
        )

        # Message loop
        while True:
            try:
                msg = await websocket.receive_json()
            except (WebSocketDisconnect, json.JSONDecodeError):
                break

            t = msg.get("type")

            if t == "now_playing":
                track = msg.get("track")
                if track and isinstance(track, dict):
                    await db().rooms.update_one(
                        {"code": code},
                        {"$set": {
                            "track": {
                                "title": str(track.get("title", ""))[:200],
                                "artist": str(track.get("artist", ""))[:200],
                                "cover": track.get("cover"),
                            },
                            "last_active_at": datetime.now(timezone.utc),
                        }},
                    )
                    await conn_mgr.broadcast(code, {
                        "type": "now_playing",
                        "track": track,
                        "by": user["id"],
                    })

            elif t == "reaction":
                emoji = str(msg.get("emoji", ""))[:8]
                if emoji:
                    await conn_mgr.broadcast(code, {
                        "type": "reaction",
                        "emoji": emoji,
                        "by": user,
                    })

            elif t == "ping":
                await websocket.send_json({"type": "pong"})

    except WebSocketDisconnect:
        pass
    except Exception as e:
        try:
            await websocket.send_json({"type": "error", "message": str(e)})
        except Exception:
            pass
    finally:
        if user:
            await conn_mgr.disconnect(code, user["id"])
            await conn_mgr.broadcast(code, {"type": "member_left", "id": user["id"]})
