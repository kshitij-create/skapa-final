# SKAPA — Design Refinement + Shareable Vibe Card + Spotify Auth

## Original Problem Statement
> Refine the whole design of app. Make the app more aesthetic and professional, don't do drastic changes.

Follow-ups:
> Run the Expo app and validate Map/Onboarding/Profile visuals on device
> Build a shareable Profile card (gradient poster with current vibe + top track QR link)
> Enable Spotify-only sign-ups via OAuth — design secure DB + flow

## App Overview
SKAPA — React Native / Expo social music app. Users sign up via Spotify, broadcast what they're listening to, see friends' live music on a map, and join listening rooms.

## Tech Stack
**Mobile**: Expo 55 · React Native 0.83 · React 19 · TypeScript · react-native-reanimated 4 + worklets 0.7.2 · expo-auth-session (PKCE) · expo-secure-store · expo-crypto · expo-web-browser · react-native-view-shot · react-native-qrcode-svg · expo-sharing · expo-media-library

**Backend**: FastAPI · uvicorn · motor (async MongoDB) · pydantic v2 · httpx · python-jose (HS256 JWT) · cryptography (AES-256-GCM) · pydantic-settings

## Architecture

```
Expo app ──(PKCE code + verifier)──► Backend ──► Spotify token exchange
                                       │
                                       ├── MongoDB: users, sessions
                                       └── Issues session JWT (HS256, 30d, jti)
Expo stores JWT in SecureStore (Keychain/Keystore)
```

## What's been implemented

### Phase 1 — design polish (Jan 2026)
Theme tokens, OnboardingProgress & DisplayPill components, refined OnboardingCTA, polished all 3 onboarding screens, polished Map (segmented toggle, search pill, dual-ring avatars, richer sheet), new full Profile screen, wired ProfileScreen into navigator.

### Phase 2 — shareable vibe card
`/app/src/components/ShareProfileCard.tsx` — 9:16 mood-gradient poster with avatar ring, CURRENT VIBE pill, LISTENING NOW row, QR code, Save (Photos) + Share to Stories (system share sheet) actions.

### Phase 3 — Spotify OAuth sign-up
**Backend (new `/app/backend/`)**:
- `server.py` — FastAPI app, `/api/health`, lifespan opens/closes Mongo, CORS
- `config.py` — pydantic-settings pulling MONGO_URL, DB_NAME, SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, JWT_SECRET, TOKEN_ENCRYPTION_KEY
- `security.py` — AES-256-GCM encrypt/decrypt, HS256 JWT with jti+30d exp, `current_user` dependency (bearer + revocation check)
- `db.py` — motor client, indexes (users.spotify_id unique, users.handle unique sparse, sessions.jti unique, sessions.expires_at TTL), `upsert_spotify_user`, `revoke_session`, `public_user`
- `auth.py` — `POST /api/auth/spotify/callback`, `POST /api/auth/refresh`, `POST /api/auth/logout`, `POST /api/auth/spotify/disconnect`
- `me.py` — `GET /api/me`, `GET /api/me/now-playing`, `GET /api/me/top-tracks`, `GET /api/me/top-artists`, `PUT /api/me/vibe` (with transparent Spotify-token refresh)
- Refresh tokens stored **AES-256-GCM encrypted at rest** (`spotify.refresh_token_enc`)
- Session revocation list (`sessions` collection) with TTL auto-cleanup

**Mobile app**:
- `/app/src/auth/api.ts` — fetch wrapper that injects JWT from SecureStore
- `/app/src/auth/AuthContext.tsx` — AuthProvider with `useAuthRequest` PKCE setup, `signInWithSpotify`, `signOut`, `refreshUser`, boot-time `/api/me` hydration
- `App.tsx` — wraps everything in `AuthProvider`; `RootRouter` swaps between Onboarding and Main based on user state; shows spinner during `booting`
- `ConnectMusicScreen` — now triggers the real PKCE flow (loading state, error alerts, disabled state)
- `ProfileScreen` — fully wired to real user data (name/handle/avatar/vibe from `/api/me`), real top-tracks, real top-artists, real now-playing; Log out opens confirm dialog that calls `signOut()`
- `MainNavigator` — tab bar avatar uses live user avatar
- `app.json` — added `"scheme": "skapa"` so `skapa://auth/callback` works for standalone builds

### Environment files
- `/app/backend/.env` — MONGO_URL, DB_NAME=skapa, SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, JWT_SECRET (96 hex chars), TOKEN_ENCRYPTION_KEY (32-byte base64), CORS_ORIGINS=*
- `/app/.env` — EXPO_PUBLIC_BACKEND_URL, EXPO_PUBLIC_SPOTIFY_CLIENT_ID (public, Client Secret never shipped)

## Testing
- Phase 3 backend tested end-to-end by `testing_agent_v3`: **24/24 tests pass (100%)**
- Validated: validation errors (422), auth errors (401), revocation-after-logout (401), encrypted-at-rest refresh tokens, JWT HS256+jti+30d, indexes, CORS, Spotify error passthrough
- Test suites preserved at `/app/backend/tests/test_skapa_api.py`, `/app/backend/tests/test_authenticated_flows.py`

## Spotify Developer Dashboard — user action required
In <https://developer.spotify.com/dashboard> → app Settings → Redirect URIs, add:
```
skapa://auth/callback
exp://127.0.0.1:8081/--/auth/callback
exp://localhost:8081/--/auth/callback
https://auth.expo.io/@anonymous/skapa-final
```

## Files (new/modified this session)
```
/app/backend/server.py                                (new)
/app/backend/config.py                                (new)
/app/backend/security.py                              (new)
/app/backend/db.py                                    (new)
/app/backend/auth.py                                  (new)
/app/backend/me.py                                    (new)
/app/backend/requirements.txt                         (new)
/app/backend/.env                                     (new)
/app/.env                                             (new)
/app/app.json                                         (scheme added)
/app/App.tsx                                          (auth provider + router)
/app/src/auth/api.ts                                  (new)
/app/src/auth/AuthContext.tsx                         (new)
/app/src/screens/onboarding/ConnectMusicScreen.tsx    (real Spotify sign-in)
/app/src/screens/ProfileScreen.tsx                    (real data + logout)
/app/src/navigation/MainNavigator.tsx                 (live avatar)
/app/src/theme/index.ts                               (phase 1)
/app/src/components/OnboardingProgress.tsx            (phase 1)
/app/src/components/DisplayPill.tsx                   (phase 1)
/app/src/components/OnboardingCTA.tsx                 (phase 1)
/app/src/components/ShareProfileCard.tsx              (phase 2)
/app/src/screens/onboarding/EmotionalHookScreen.tsx   (phase 1)
/app/src/screens/onboarding/ChooseVibeScreen.tsx      (phase 1)
/app/src/screens/LivePresenceScreen.tsx               (phase 1)
```

## Prioritized Backlog
- P1: Listening-events ingestion — poll `/me/now-playing` every 30-60s while app is foregrounded, write to MongoDB, power the Map page with real users
- P1: Friend graph, follow/unfollow, friends-nearby
- P2: Apply design polish to HomeScreen, RoomsScreen, ListeningRoomScreen
- P2: Real Listening Rooms (WebSocket-based presence + synced playback state, not audio)
- P2: Rotate `TOKEN_ENCRYPTION_KEY` & `SPOTIFY_CLIENT_SECRET` (user pasted secret in chat — should rotate)
- P3: Move `TOKEN_ENCRYPTION_KEY` to a KMS for envelope encryption
- P3: Add rate limiting on `/api/auth/*`
- P3: Profile edit modal

## Credentials
- Spotify test credentials are in `/app/backend/.env` (user-provided). Recommend rotation after development.
- No password-based auth — Spotify OAuth is the sole login method.
