# SKAPA — Session 4 (Drops + KMS + ChooseVibe polish)

## Original Problem Statement
> Refine the whole design of app (done) → shareable vibe card (done) → Spotify auth (blocked by Spotify Premium policy — deferred)
> Session 4: "Add one full feature from Backlog, move TOKEN_ENCRYPTION_KEY to KMS, polish ChooseVibe"
> Feature chosen: **(b) "Drop a Vibe" on Map** + **(c) Design polish for Home/Rooms/ListeningRoom**

## App Overview
SKAPA — React Native / Expo social music app. Users see who's vibing around them on a live map, drop tracks with a mood as pins others can tune into, and (when Spotify OAuth is unblocked) sign up with Spotify.

## Tech Stack
**Mobile**: Expo 55 · RN 0.83 · React 19 · TypeScript · reanimated 4 · expo-auth-session (deferred) · expo-secure-store · react-native-view-shot · react-native-qrcode-svg · **@react-native-async-storage/async-storage** (new)

**Backend**: FastAPI · motor (Mongo) · httpx · python-jose (HS256 JWT) · cryptography (AES-256-GCM) · pydantic v2

## Architecture

```
Expo app ──► Backend (FastAPI) ──► Mongo
                 │
                 ├── KMS (LocalKmsProvider) ──► envelope encrypt/decrypt
                 └── Drops TTL'd (24h) via Mongo TTL index
```

## This session's delivery

### 1. KMS envelope encryption (`/app/backend/kms.py` — NEW)
- Pluggable `KmsProvider` interface with `LocalKmsProvider` as the default
- **Envelope encryption**: every encrypt generates a fresh DEK, encrypts payload with DEK, wraps DEK with KEK. Forward-secrecy: leaking one DEK exposes just one token, never the whole DB.
- Envelope format: `base64(json({v:1, k:key_id, d:wrapped_dek, n:nonce, c:ciphertext}))`
- **Backward compatible**: `envelope_decrypt` transparently falls back to the legacy v0 raw-AES-GCM format for data written before KMS was added → zero-downtime migration
- **Rotation-ready**: `key_id` stored per blob; add `KEK_local_v2=<base64>` to env to rotate — old blobs still decrypt
- Cloud path: swap `LocalKmsProvider` with `AwsKmsProvider` / `GcpKmsProvider` one day — one line in `kms.py`
- `security.encrypt_token` / `decrypt_token` now delegate to `envelope_encrypt/decrypt` — drop-in replacement

### 2. Drop a Vibe — core social feature
**Backend** (`/app/backend/drops.py` — NEW):
- `POST /api/drops` create a drop (track + mood + caption + coords + mock user)
- `GET /api/drops?limit=50` list recent (TTL-filtered)
- `POST /api/drops/{id}/wave` increment waves counter
- `POST /api/drops/{id}/tune-in` increment tune-ins
- Mongo indexes: `drops.expires_at` TTL (auto-deletes after 24h) + `drops.created_at -1`
- Validates lat/lng bounds, caption length (180), field presence → 422 on bad payload, 404 on missing drop, 400 on bad ObjectId

**Frontend**:
- **`DropVibeModal.tsx`** — bottom-sheet composer: horizontal track carousel (curated list for MVP; swap for Spotify search once auth is unblocked) → mood picker → optional caption → gradient "Drop it" CTA. Mood-tinted gradient background. Loading + error states handled.
- **`LivePresenceScreen`**: FAB now opens the Drop modal; map renders live drops as pulsing diamond pins colored by mood; tapping shows a glass preview bubble with user/track/caption + Wave & Tune In actions (both POST to backend)
- Auto-refreshes drops every 20 s
- `/app/src/state/publicApi.ts` — tiny fetch wrapper for unauthed endpoints

### 3. ChooseVibe polish
- Persists to `AsyncStorage` via `/app/src/state/localStore.ts` (`getVibe` / `setVibe`)
- **Confetti burst** (`VibeConfetti.tsx` — 24 radial particles w/ reanimated) triggers on each mood select
- Subtle scale pulse on the grid when a new mood is picked
- CTA label reflects selection ("Enter with Late Night")
- **Reusable as a modal** (`ChooseVibeModal.tsx`) — accessible from Profile: tap the "🌊 Late Night" chip → mood grid opens in a sheet → pick + save
- Profile hydrates the vibe from AsyncStorage on mount, so picking in onboarding immediately reflects on Profile

### 4. Design-polish pass on Home + Rooms
- Both screens now use the unified dark palette (`#050505`) instead of warm-brown
- Consistent eyebrow pattern (orange `HOME · LIVE` / `LISTENING ROOMS · LIVE` w/ pulse dot)
- Typography harmonised: 700 weight + -0.6 letter-spacing on page titles to match Map/Profile
- `ListeningRoomScreen` already aligned with refined aesthetic — no change
- Ambient-glow colors swapped to the mood palette (violet/amber instead of the old warm orange)

## Files (new or modified this session)
```
NEW:
/app/backend/kms.py
/app/backend/drops.py
/app/src/state/localStore.ts
/app/src/state/publicApi.ts
/app/src/components/DropVibeModal.tsx
/app/src/components/VibeConfetti.tsx
/app/src/components/ChooseVibeModal.tsx

MODIFIED:
/app/backend/security.py         (encrypt_token → envelope_encrypt)
/app/backend/server.py           (mounts drops_router)
/app/backend/db.py               (drops indexes)
/app/src/screens/onboarding/ChooseVibeScreen.tsx
/app/src/screens/LivePresenceScreen.tsx
/app/src/screens/ProfileScreen.tsx
/app/src/screens/HomeScreen.tsx
/app/src/screens/RoomsScreen.tsx
/app/package.json                (async-storage 2.2.0)
```

## Testing
- **49/49 backend tests passed** via `testing_agent_v3` (24 regression from iteration_1 + 25 new)
- KMS: round-trip, per-encryption DEK uniqueness, legacy v0 compatibility, key-id recording
- Drops: all CRUD + validation + TTL + indexes + wave/tune-in counters + 400/404 handling
- Test files: `/app/backend/tests/test_kms_and_drops.py`

## Prioritized Backlog (remaining)
- P1: Spotify Premium sub OR pivot to Google/Apple sign-in so auth ships
- P1: Listening-events ingestion (poll /me/now-playing → Mongo → real users on map)
- P1: Friend graph (follow / followers / friends-nearby)
- P2: Real Listening Rooms (WebSocket presence + synced now-playing)
- P2: Move DropVibeModal's curated track list → real Spotify search (once auth lands)
- P3: Move `TOKEN_ENCRYPTION_KEY` → AWS KMS / GCP KMS (plumbing is already pluggable)
- P3: Rate-limiting on `/api/drops` and `/api/auth/*`
- P3: Profile edit modal

## Notes
- Drops auto-expire after 24h via Mongo TTL index — no cron needed
- DropVibeModal posts with a hardcoded "You" mock user (no auth yet); easy swap to real user when auth lands
- Backend URL: https://1e23550a-aef8-41ec-bafc-7efe3da04521.preview.emergentagent.com
