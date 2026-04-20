# SKAPA Test Credentials

## Authentication
- **No password-based auth** — sign-in is exclusively via Spotify OAuth 2.0 (PKCE).

## Spotify Developer App
- **Client ID**: `2911e00f9a0b446fa9af93c38c042766` (public, shipped to Expo bundle via `EXPO_PUBLIC_SPOTIFY_CLIENT_ID`)
- **Client Secret**: stored server-side only in `/app/backend/.env` as `SPOTIFY_CLIENT_SECRET`
- **Redirect URIs** (must be registered in Spotify Dashboard):
  - `skapa://auth/callback`
  - `exp://127.0.0.1:8081/--/auth/callback`
  - `exp://localhost:8081/--/auth/callback`
  - `https://auth.expo.io/@anonymous/skapa-final`

## Backend secrets (in `/app/backend/.env`)
- `JWT_SECRET` — 96-hex-char HS256 signing key (generated Jan 2026)
- `TOKEN_ENCRYPTION_KEY` — 32-byte base64 AES-256-GCM key for encrypting Spotify refresh tokens at rest

## Testing
- Real OAuth code cannot be minted without a browser session. Backend tests simulate post-callback state by inserting users directly + minting JWTs via `backend.security.create_session_jwt`.
- To test as a specific user on device:
  1. Sign in with your own Spotify account from the Expo app
  2. The JWT is stored in `expo-secure-store` under key `skapa.jwt`
  3. Curl with `Authorization: Bearer <jwt>` against `https://1e23550a-aef8-41ec-bafc-7efe3da04521.preview.emergentagent.com/api/me`

## Backend URL
- **External**: `https://1e23550a-aef8-41ec-bafc-7efe3da04521.preview.emergentagent.com`
- **Internal**: `http://localhost:8001` (supervisor-managed)

## Database
- **MongoDB**: `mongodb://localhost:27017`, database name `skapa`
- **Collections**: `users`, `sessions`
