# SKAPA — Session 5 (Real Listening Rooms + WebSocket presence)

## Original Problem Statement / Session ask
> Real Listening Rooms (WebSocket presence) do it and make the design playful and aesthetic

## App Overview
SKAPA — Expo / React Native social music app. Dark + amber aesthetic. Features so far:
- Polished onboarding · Map with live avatars + "Drop a Vibe" pins · Profile with shareable vibe card · Spotify sign-up (built, deferred pending Premium) · KMS envelope-encryption · **Real Listening Rooms** (new)

## Tech Stack (adds)
- Backend: FastAPI WebSockets (native), in-memory connection manager, MongoDB rooms collection
- Mobile: `@react-native-async-storage/async-storage`, new hook `useRoomSocket`, `FloatingReaction` + `RoomOrbit` animated components

## Architecture

```
App (Expo) ──(WebSocket, wss://.../ws/rooms/{code})──► Backend
                                                           │
                                                           ├── /api/rooms (REST CRUD)
                                                           ├── RoomConnections (in-memory per-pod)
                                                           └── MongoDB.rooms (persisted metadata)
```

## Session 5 delivery

### Backend (`/app/backend/rooms.py` NEW)
- **REST**:
  - `POST /api/rooms` create (auto-gen 6-char uppercase code, unique-indexed)
  - `GET /api/rooms` list (sorted by `last_active_at` desc; merges live presence counts)
  - `GET /api/rooms/{code}` single lookup (case-insensitive)
- **WebSocket** `/ws/rooms/{code}`:
  - Handshake: `{type:"hello", user:{id,name,avatar}}` (rejects if missing, close code 4000)
  - Server broadcasts: `room_state` (initial), `member_joined`, `member_left`, `reaction`, `now_playing`
  - Client can send: `reaction`, `now_playing` (persists to Mongo), `ping` → `pong`
- `RoomConnections` — async-safe, per-room member dict; dead-socket cleanup on broadcast failure
- Mongo indexes: `rooms.code` unique, `rooms.last_active_at -1`

### Mobile

**New pieces**
- `/app/src/state/identity.ts` — persistent guest identity (random "Neon Echo / Midnight Phoenix" style names, pravatar)
- `/app/src/hooks/useRoomSocket.ts` — connect + handshake + event dispatcher + helper senders
- `/app/src/components/FloatingReaction.tsx` — reanimated particle that drifts upward, wiggles, fades
- `/app/src/components/RoomOrbit.tsx` — member avatars orbit on a dashed ring, host wears 👑
- `/app/src/components/CreateRoomModal.tsx` — name + mood + opening track composer
- `/app/src/navigation/RoomsStack.tsx` — stack: RoomsList (root) → ListeningRoom (bottom-sheet animation)

**Full rewrites**
- `/app/src/screens/RoomsScreen.tsx` — live list with pulsing LIVE dot, mood-colored hero card (blurred album cover behind), compact list rows with member-avatar stack, join-by-code input, multi-stop gradient "New Room" FAB
- `/app/src/screens/ListeningRoomScreen.tsx` — rotating vinyl record (with grooves + center hole) at the stage center, orbiting members around it, mood-gradient sky, floating emoji reactions layer, 8-button quick-reaction bar, now-playing card with live-listener count pulse, share + leave controls, graceful error state explaining the WS-ingress caveat when connections fail

**Playful / aesthetic touches**
- Vinyl rotates continuously + pulse-bumps on every `now_playing` change
- Members orbit slowly (45s/rev) around the vinyl
- Reactions float with random drift and rotation, echo locally for the sender
- Hero card on RoomsList uses blurred album cover as ambient background → atmosphere
- Crown emoji on the host avatar inside the orbit
- FAB gradient: `a855f7 → ec4899 → ff8a00` for a Snapchat-ish pop

### Navigator change
- "Discover" tab now shows `HomeScreen` (was RoomsScreen)
- "Rooms" tab is now a **stack** (RoomsList → ListeningRoom), replacing the old standalone ListeningRoomScreen

## Testing
- **67/67 backend tests passed** (49 regression + 18 new) via `testing_agent_v3`
  - REST: create, list, get (case-insensitive), 404, 422 validation, code uniqueness
  - WebSocket: handshake, reject bad hello, invalid room, ping/pong, member_joined, member_left, reaction broadcast, now_playing broadcast + Mongo persistence, live_count from REST reflects WS presence
- Test file: `/app/backend/tests/test_rooms_ws.py`

## ⚠️ Platform caveat — WebSocket on the Emergent preview URL
The Kubernetes ingress in front of `https://…preview.emergentagent.com` does **not proxy WebSocket connections** (HTTP 502 on the `wss://` upgrade). Consequences:
- REST endpoints (drops, rooms CRUD, /api/me, etc.) work fine on the preview URL
- **`/ws/rooms/{code}` only works when the client connects directly to the FastAPI pod** (`ws://localhost:8001/ws/...` during backend test) or to a host that supports WS upgrades (Railway / Fly.io / Render / a cloud VM)
- The in-app error state shows a tip telling the user to run backend locally or deploy somewhere WS-capable
- 67/67 backend tests pass against `ws://localhost:8001` — the code is correct; only infra is limited

## Files (new / modified this session)
```
NEW:
/app/backend/rooms.py
/app/src/state/identity.ts
/app/src/hooks/useRoomSocket.ts
/app/src/components/FloatingReaction.tsx
/app/src/components/RoomOrbit.tsx
/app/src/components/CreateRoomModal.tsx
/app/src/navigation/RoomsStack.tsx

MODIFIED:
/app/backend/server.py     (mount rooms_router)
/app/backend/db.py         (rooms indexes)
/app/src/screens/RoomsScreen.tsx            (full rewrite)
/app/src/screens/ListeningRoomScreen.tsx    (full rewrite)
/app/src/navigation/MainNavigator.tsx       (RoomsStack; Discover → HomeScreen)
```

## Prioritized Backlog (remaining)
- P1: WebSocket-capable deploy target (Railway/Fly.io) so the mobile app can talk to rooms in production
- P1: Spotify Premium sub OR pivot to Google sign-in
- P1: Listening-events ingestion (poll `/me/now-playing` → Mongo → real users on Map)
- P2: Multi-worker rooms — swap the in-memory `RoomConnections` for Redis pub/sub
- P2: Friend graph (follow + friends-nearby)
- P2: Room search & discovery filters by mood
- P3: Chat in rooms (server side is ready for another message type)
- P3: Cloud KMS provider (AWS/GCP); rate limits; profile edit modal

## Notes for next session
- Running Expo on your laptop + backend on same machine: in `/app/.env` set `EXPO_PUBLIC_BACKEND_URL=http://<your-LAN-ip>:8001` — device on the same Wi-Fi can then do WebSockets.
- All REST endpoints remain functional on the preview URL so Drops, Profile, Rooms CRUD, etc. work regardless of WS.
