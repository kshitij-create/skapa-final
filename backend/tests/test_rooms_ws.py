"""
SKAPA Backend - Rooms REST + WebSocket Presence Tests
Tests for:
- POST /api/rooms (create room)
- GET /api/rooms (list rooms)
- GET /api/rooms/{code} (get single room)
- WebSocket /ws/rooms/{code} (presence, reactions, now_playing)
- MongoDB indexes for rooms collection
"""
import pytest
import asyncio
import sys
import os
import json
import re
import requests
import websockets
from datetime import datetime, timezone

# Add backend to path
sys.path.insert(0, '/app/backend')

BASE_URL = "https://1e23550a-aef8-41ec-bafc-7efe3da04521.preview.emergentagent.com"
# WebSocket via internal URL (external URL returns 502 due to ingress not supporting WS)
WS_URL = "ws://localhost:8001"


# ══════════════════════════════════════════════════════════════════════════════
# ROOMS REST ENDPOINT TESTS
# ══════════════════════════════════════════════════════════════════════════════

class TestRoomsCreateEndpoint:
    """POST /api/rooms endpoint tests"""
    
    def test_create_room_success(self):
        """POST /api/rooms with valid payload returns room with all expected fields"""
        payload = {
            "name": "Test Room",
            "mood_emoji": "🎵",
            "mood_label": "Vibing",
            "color": "#8A2BE2",
            "host_name": "TestHost",
            "host_avatar": "https://example.com/avatar.jpg",
            "host_id": "test_host_123",
            "track": {
                "title": "Test Song",
                "artist": "Test Artist",
                "cover": "https://example.com/cover.jpg"
            }
        }
        
        response = requests.post(f"{BASE_URL}/api/rooms", json=payload)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "room" in data
        room = data["room"]
        
        # Check room code format: 6 chars alphanumeric uppercase
        assert "code" in room
        assert len(room["code"]) == 6, f"Room code should be 6 chars, got {len(room['code'])}"
        assert room["code"].isalnum(), "Room code should be alphanumeric"
        assert room["code"].isupper() or room["code"].isdigit() or all(c.isupper() or c.isdigit() for c in room["code"]), \
            f"Room code should be uppercase alphanumeric, got {room['code']}"
        
        # Check all required fields
        assert room["name"] == "Test Room"
        assert room["mood"]["emoji"] == "🎵"
        assert room["mood"]["label"] == "Vibing"
        assert room["color"] == "#8A2BE2"
        
        # Host info
        assert room["host"]["id"] == "test_host_123"
        assert room["host"]["name"] == "TestHost"
        assert room["host"]["avatar"] == "https://example.com/avatar.jpg"
        
        # Track info
        assert room["track"]["title"] == "Test Song"
        assert room["track"]["artist"] == "Test Artist"
        
        # Live count and members preview
        assert room["live_count"] == 0  # No WS connections yet
        assert room["members_preview"] == []
        
        # Timestamps
        assert "created_at" in room
        
        print(f"✓ POST /api/rooms creates room with code={room['code']}")
        
        # Store for other tests
        TestRoomsCreateEndpoint.created_room_code = room["code"]
    
    def test_create_room_missing_name_returns_422(self):
        """POST /api/rooms missing 'name' returns 422"""
        payload = {
            "mood_emoji": "🎵",
            "mood_label": "Vibing",
            "host_name": "TestHost",
            "host_id": "test_host_123"
        }
        
        response = requests.post(f"{BASE_URL}/api/rooms", json=payload)
        assert response.status_code == 422
        print("✓ POST /api/rooms missing name returns 422")
    
    def test_create_room_missing_host_id_returns_422(self):
        """POST /api/rooms missing 'host_id' returns 422"""
        payload = {
            "name": "Test Room",
            "mood_emoji": "🎵",
            "mood_label": "Vibing",
            "host_name": "TestHost"
            # Missing host_id
        }
        
        response = requests.post(f"{BASE_URL}/api/rooms", json=payload)
        assert response.status_code == 422
        print("✓ POST /api/rooms missing host_id returns 422")
    
    def test_room_code_uniqueness(self):
        """Creating 3 rooms should all have distinct codes"""
        codes = set()
        for i in range(3):
            payload = {
                "name": f"Unique Test Room {i}",
                "mood_emoji": "🎵",
                "mood_label": "Testing",
                "host_name": f"Host{i}",
                "host_id": f"host_{i}"
            }
            response = requests.post(f"{BASE_URL}/api/rooms", json=payload)
            assert response.status_code == 200
            code = response.json()["room"]["code"]
            codes.add(code)
        
        assert len(codes) == 3, f"Expected 3 unique codes, got {len(codes)}: {codes}"
        print(f"✓ Room code uniqueness: 3 rooms have distinct codes {codes}")


class TestRoomsListEndpoint:
    """GET /api/rooms endpoint tests"""
    
    def test_list_rooms_returns_array(self):
        """GET /api/rooms returns {rooms: [...]} sorted by last_active_at desc"""
        response = requests.get(f"{BASE_URL}/api/rooms")
        assert response.status_code == 200
        
        data = response.json()
        assert "rooms" in data
        assert isinstance(data["rooms"], list)
        
        # If there are rooms, verify they have expected structure
        if len(data["rooms"]) > 0:
            room = data["rooms"][0]
            assert "code" in room
            assert "name" in room
            assert "mood" in room
            assert "host" in room
            assert "live_count" in room
            assert "members_preview" in room
            assert "created_at" in room
        
        print(f"✓ GET /api/rooms returns {len(data['rooms'])} rooms")


class TestRoomsGetSingleEndpoint:
    """GET /api/rooms/{code} endpoint tests"""
    
    @pytest.fixture(scope="class")
    def room_for_get(self):
        """Create a room for GET testing"""
        payload = {
            "name": "Get Test Room",
            "mood_emoji": "🔍",
            "mood_label": "Searching",
            "host_name": "GetTestHost",
            "host_id": "get_test_host"
        }
        response = requests.post(f"{BASE_URL}/api/rooms", json=payload)
        return response.json()["room"]
    
    def test_get_room_by_code(self, room_for_get):
        """GET /api/rooms/{code} returns the room"""
        code = room_for_get["code"]
        
        response = requests.get(f"{BASE_URL}/api/rooms/{code}")
        assert response.status_code == 200
        
        data = response.json()
        assert "room" in data
        assert data["room"]["code"] == code
        assert data["room"]["name"] == "Get Test Room"
        
        print(f"✓ GET /api/rooms/{code} returns the room")
    
    def test_get_room_case_insensitive(self, room_for_get):
        """GET /api/rooms/{code} is case insensitive (uppercase lookup)"""
        code = room_for_get["code"]
        lowercase_code = code.lower()
        
        response = requests.get(f"{BASE_URL}/api/rooms/{lowercase_code}")
        assert response.status_code == 200
        
        data = response.json()
        assert data["room"]["code"] == code  # Returns uppercase code
        
        print(f"✓ GET /api/rooms/{lowercase_code} (lowercase) returns room with code {code}")
    
    def test_get_room_nonexistent_returns_404(self):
        """GET /api/rooms/ABCDEF (nonexistent) returns 404"""
        response = requests.get(f"{BASE_URL}/api/rooms/ZZZZZZ")
        assert response.status_code == 404
        print("✓ GET /api/rooms/ZZZZZZ (nonexistent) returns 404")


# ══════════════════════════════════════════════════════════════════════════════
# WEBSOCKET TESTS
# ══════════════════════════════════════════════════════════════════════════════

class TestWebSocketBasicConnection:
    """WebSocket basic connection and handshake tests"""
    
    @pytest.fixture(scope="class")
    def room_for_ws(self):
        """Create a room for WebSocket testing"""
        payload = {
            "name": "WS Test Room",
            "mood_emoji": "🔌",
            "mood_label": "Connected",
            "host_name": "WSTestHost",
            "host_id": "ws_test_host",
            "track": {
                "title": "Initial Track",
                "artist": "Initial Artist",
                "cover": "https://example.com/initial.jpg"
            }
        }
        response = requests.post(f"{BASE_URL}/api/rooms", json=payload)
        return response.json()["room"]
    
    def test_ws_connect_and_hello(self, room_for_ws):
        """WebSocket: connect and send hello, receive room_state"""
        code = room_for_ws["code"]
        
        async def ws_test():
            async with websockets.connect(f"{WS_URL}/ws/rooms/{code}") as ws:
                # Send hello
                await ws.send(json.dumps({
                    "type": "hello",
                    "user": {
                        "id": "test_user_1",
                        "name": "Test User 1",
                        "avatar": "https://example.com/avatar1.jpg"
                    }
                }))
                
                # Receive room_state
                msg = json.loads(await asyncio.wait_for(ws.recv(), timeout=5))
                
                assert msg["type"] == "room_state"
                assert "room" in msg
                assert "track" in msg
                assert "members" in msg
                
                # Should have at least 1 member (self)
                assert len(msg["members"]) >= 1
                
                # Find self in members
                self_member = next((m for m in msg["members"] if m["id"] == "test_user_1"), None)
                assert self_member is not None, "Self should be in members list"
                assert self_member["name"] == "Test User 1"
                
                return msg
        
        result = asyncio.get_event_loop().run_until_complete(ws_test())
        print(f"✓ WebSocket hello handshake works, received room_state with {len(result['members'])} member(s)")
    
    def test_ws_hello_without_user_closes_4000(self, room_for_ws):
        """WebSocket: send hello without user field, connection closes with code 4000"""
        code = room_for_ws["code"]
        
        async def ws_test():
            async with websockets.connect(f"{WS_URL}/ws/rooms/{code}") as ws:
                # Send hello without user
                await ws.send(json.dumps({"type": "hello"}))
                
                # Should close with code 4000
                try:
                    await asyncio.wait_for(ws.recv(), timeout=5)
                    # If we get here, connection didn't close
                    return None
                except websockets.exceptions.ConnectionClosed as e:
                    return e.code
        
        close_code = asyncio.get_event_loop().run_until_complete(ws_test())
        assert close_code == 4000, f"Expected close code 4000, got {close_code}"
        print("✓ WebSocket hello without user closes with code 4000")
    
    def test_ws_connect_invalid_room_closes(self):
        """WebSocket: connect to invalid room, receive error and close"""
        async def ws_test():
            async with websockets.connect(f"{WS_URL}/ws/rooms/INVALID") as ws:
                # Send hello
                await ws.send(json.dumps({
                    "type": "hello",
                    "user": {"id": "test", "name": "Test"}
                }))
                
                # Should receive error
                msg = json.loads(await asyncio.wait_for(ws.recv(), timeout=5))
                
                if msg["type"] == "error":
                    # Connection should close
                    try:
                        await asyncio.wait_for(ws.recv(), timeout=2)
                    except websockets.exceptions.ConnectionClosed:
                        return msg
                
                return msg
        
        result = asyncio.get_event_loop().run_until_complete(ws_test())
        assert result["type"] == "error"
        print("✓ WebSocket connect to invalid room receives error and closes")
    
    def test_ws_ping_pong(self, room_for_ws):
        """WebSocket: client sends ping, server responds pong"""
        code = room_for_ws["code"]
        
        async def ws_test():
            async with websockets.connect(f"{WS_URL}/ws/rooms/{code}") as ws:
                # Send hello first
                await ws.send(json.dumps({
                    "type": "hello",
                    "user": {"id": "ping_user", "name": "Ping User"}
                }))
                
                # Receive room_state
                await asyncio.wait_for(ws.recv(), timeout=5)
                
                # Send ping
                await ws.send(json.dumps({"type": "ping"}))
                
                # Receive pong
                msg = json.loads(await asyncio.wait_for(ws.recv(), timeout=5))
                
                return msg
        
        result = asyncio.get_event_loop().run_until_complete(ws_test())
        assert result["type"] == "pong"
        print("✓ WebSocket ping/pong works")


class TestWebSocketPresence:
    """WebSocket presence broadcasting tests"""
    
    @pytest.fixture(scope="class")
    def room_for_presence(self):
        """Create a room for presence testing"""
        payload = {
            "name": "Presence Test Room",
            "mood_emoji": "👥",
            "mood_label": "Presence",
            "host_name": "PresenceHost",
            "host_id": "presence_host"
        }
        response = requests.post(f"{BASE_URL}/api/rooms", json=payload)
        return response.json()["room"]
    
    def test_ws_member_joined_broadcast(self, room_for_presence):
        """WebSocket: when A joins, B receives member_joined"""
        code = room_for_presence["code"]
        
        async def ws_test():
            # B connects first
            async with websockets.connect(f"{WS_URL}/ws/rooms/{code}") as ws_b:
                await ws_b.send(json.dumps({
                    "type": "hello",
                    "user": {"id": "user_b", "name": "User B", "avatar": "https://b.jpg"}
                }))
                # B receives room_state
                await asyncio.wait_for(ws_b.recv(), timeout=5)
                
                # A connects
                async with websockets.connect(f"{WS_URL}/ws/rooms/{code}") as ws_a:
                    await ws_a.send(json.dumps({
                        "type": "hello",
                        "user": {"id": "user_a", "name": "User A", "avatar": "https://a.jpg"}
                    }))
                    # A receives room_state
                    await asyncio.wait_for(ws_a.recv(), timeout=5)
                    
                    # B should receive member_joined for A
                    msg = json.loads(await asyncio.wait_for(ws_b.recv(), timeout=5))
                    
                    return msg
        
        result = asyncio.get_event_loop().run_until_complete(ws_test())
        assert result["type"] == "member_joined"
        assert result["member"]["id"] == "user_a"
        assert result["member"]["name"] == "User A"
        print("✓ WebSocket member_joined broadcast works")
    
    def test_ws_member_left_on_disconnect(self, room_for_presence):
        """WebSocket: when A disconnects, B receives member_left"""
        code = room_for_presence["code"]
        
        async def ws_test():
            # B connects first
            async with websockets.connect(f"{WS_URL}/ws/rooms/{code}") as ws_b:
                await ws_b.send(json.dumps({
                    "type": "hello",
                    "user": {"id": "user_b_left", "name": "User B Left"}
                }))
                await asyncio.wait_for(ws_b.recv(), timeout=5)
                
                # A connects
                ws_a = await websockets.connect(f"{WS_URL}/ws/rooms/{code}")
                await ws_a.send(json.dumps({
                    "type": "hello",
                    "user": {"id": "user_a_left", "name": "User A Left"}
                }))
                await asyncio.wait_for(ws_a.recv(), timeout=5)
                
                # B receives member_joined
                await asyncio.wait_for(ws_b.recv(), timeout=5)
                
                # A disconnects
                await ws_a.close()
                
                # B should receive member_left
                msg = json.loads(await asyncio.wait_for(ws_b.recv(), timeout=5))
                
                return msg
        
        result = asyncio.get_event_loop().run_until_complete(ws_test())
        assert result["type"] == "member_left"
        assert result["id"] == "user_a_left"
        print("✓ WebSocket member_left on disconnect works")


class TestWebSocketReactions:
    """WebSocket reaction broadcasting tests"""
    
    @pytest.fixture(scope="class")
    def room_for_reactions(self):
        """Create a room for reaction testing"""
        payload = {
            "name": "Reaction Test Room",
            "mood_emoji": "🔥",
            "mood_label": "Fire",
            "host_name": "ReactionHost",
            "host_id": "reaction_host"
        }
        response = requests.post(f"{BASE_URL}/api/rooms", json=payload)
        return response.json()["room"]
    
    def test_ws_reaction_broadcast(self, room_for_reactions):
        """WebSocket: A sends reaction, B receives it with by info"""
        code = room_for_reactions["code"]
        
        async def ws_test():
            # B connects first
            async with websockets.connect(f"{WS_URL}/ws/rooms/{code}") as ws_b:
                await ws_b.send(json.dumps({
                    "type": "hello",
                    "user": {"id": "react_b", "name": "React B"}
                }))
                await asyncio.wait_for(ws_b.recv(), timeout=5)
                
                # A connects
                async with websockets.connect(f"{WS_URL}/ws/rooms/{code}") as ws_a:
                    await ws_a.send(json.dumps({
                        "type": "hello",
                        "user": {"id": "react_a", "name": "React A", "avatar": "https://a.jpg"}
                    }))
                    await asyncio.wait_for(ws_a.recv(), timeout=5)
                    
                    # B receives member_joined
                    await asyncio.wait_for(ws_b.recv(), timeout=5)
                    
                    # A sends reaction
                    await ws_a.send(json.dumps({
                        "type": "reaction",
                        "emoji": "🔥"
                    }))
                    
                    # B should receive reaction
                    msg = json.loads(await asyncio.wait_for(ws_b.recv(), timeout=5))
                    
                    return msg
        
        result = asyncio.get_event_loop().run_until_complete(ws_test())
        assert result["type"] == "reaction"
        assert result["emoji"] == "🔥"
        assert result["by"]["id"] == "react_a"
        assert result["by"]["name"] == "React A"
        print("✓ WebSocket reaction broadcast works with by info")


class TestWebSocketNowPlaying:
    """WebSocket now_playing broadcasting tests"""
    
    @pytest.fixture(scope="class")
    def room_for_now_playing(self):
        """Create a room for now_playing testing"""
        payload = {
            "name": "Now Playing Test Room",
            "mood_emoji": "🎵",
            "mood_label": "Playing",
            "host_name": "NowPlayingHost",
            "host_id": "now_playing_host"
        }
        response = requests.post(f"{BASE_URL}/api/rooms", json=payload)
        return response.json()["room"]
    
    def test_ws_now_playing_broadcast_and_db_update(self, room_for_now_playing):
        """WebSocket: A sends now_playing, B receives it, AND MongoDB is updated"""
        code = room_for_now_playing["code"]
        
        async def ws_test():
            # B connects first
            async with websockets.connect(f"{WS_URL}/ws/rooms/{code}") as ws_b:
                await ws_b.send(json.dumps({
                    "type": "hello",
                    "user": {"id": "np_b", "name": "NP B"}
                }))
                await asyncio.wait_for(ws_b.recv(), timeout=5)
                
                # A connects
                async with websockets.connect(f"{WS_URL}/ws/rooms/{code}") as ws_a:
                    await ws_a.send(json.dumps({
                        "type": "hello",
                        "user": {"id": "np_a", "name": "NP A"}
                    }))
                    await asyncio.wait_for(ws_a.recv(), timeout=5)
                    
                    # B receives member_joined
                    await asyncio.wait_for(ws_b.recv(), timeout=5)
                    
                    # A sends now_playing
                    new_track = {
                        "title": "New Track Title",
                        "artist": "New Artist",
                        "cover": "https://example.com/new_cover.jpg"
                    }
                    await ws_a.send(json.dumps({
                        "type": "now_playing",
                        "track": new_track
                    }))
                    
                    # B should receive now_playing
                    msg = json.loads(await asyncio.wait_for(ws_b.recv(), timeout=5))
                    
                    return msg, new_track
        
        result, new_track = asyncio.get_event_loop().run_until_complete(ws_test())
        
        assert result["type"] == "now_playing"
        assert result["track"]["title"] == new_track["title"]
        assert result["track"]["artist"] == new_track["artist"]
        assert result["by"] == "np_a"
        
        # Verify MongoDB was updated
        response = requests.get(f"{BASE_URL}/api/rooms/{code}")
        room = response.json()["room"]
        assert room["track"]["title"] == new_track["title"]
        assert room["track"]["artist"] == new_track["artist"]
        
        print("✓ WebSocket now_playing broadcast works AND MongoDB updated")


class TestRoomsLiveCount:
    """Test that live_count reflects WebSocket connections"""
    
    def test_live_count_reflects_ws_connections(self):
        """GET /api/rooms after WS connection shows live_count > 0"""
        # Create a new room
        payload = {
            "name": "Live Count Test Room",
            "mood_emoji": "📊",
            "mood_label": "Counting",
            "host_name": "CountHost",
            "host_id": "count_host"
        }
        response = requests.post(f"{BASE_URL}/api/rooms", json=payload)
        code = response.json()["room"]["code"]
        
        async def ws_test():
            async with websockets.connect(f"{WS_URL}/ws/rooms/{code}") as ws:
                await ws.send(json.dumps({
                    "type": "hello",
                    "user": {"id": "count_user", "name": "Count User"}
                }))
                await asyncio.wait_for(ws.recv(), timeout=5)
                
                # While connected, check live_count via REST
                response = requests.get(f"{BASE_URL}/api/rooms/{code}")
                room = response.json()["room"]
                
                return room["live_count"]
        
        live_count = asyncio.get_event_loop().run_until_complete(ws_test())
        assert live_count >= 1, f"Expected live_count >= 1, got {live_count}"
        print(f"✓ live_count reflects WS connections: {live_count}")


# ══════════════════════════════════════════════════════════════════════════════
# MONGODB INDEXES TESTS
# ══════════════════════════════════════════════════════════════════════════════

class TestRoomsMongoDBIndexes:
    """Test MongoDB indexes for rooms collection"""
    
    def test_rooms_indexes_exist(self):
        """Verify rooms.code unique index + rooms.last_active_at desc index exist"""
        from motor.motor_asyncio import AsyncIOMotorClient
        
        async def check_indexes():
            client = AsyncIOMotorClient("mongodb://localhost:27017")
            db = client["skapa"]
            indexes = await db.rooms.index_information()
            client.close()
            return indexes
        
        indexes = asyncio.get_event_loop().run_until_complete(check_indexes())
        
        # Check code unique index
        code_idx = None
        for name, info in indexes.items():
            if info.get("key") == [("code", 1)]:
                code_idx = info
                break
        
        assert code_idx is not None, "Missing rooms.code index"
        assert code_idx.get("unique") is True, "rooms.code should be unique index"
        print("✓ rooms.code unique index exists")
        
        # Check last_active_at -1 index
        active_idx = None
        for name, info in indexes.items():
            if info.get("key") == [("last_active_at", -1)]:
                active_idx = info
                break
        
        assert active_idx is not None, "Missing rooms.last_active_at -1 index"
        print("✓ rooms.last_active_at -1 index exists")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
