# SKAPA — Design Refinement + Shareable Vibe Card

## Original Problem Statement
> Refine the whole design of app. Make the app more aesthetic and professional, don't do drastic changes.

Follow-ups:
> Run the Expo app and validate Map/Onboarding/Profile visuals on device
> Build a shareable Profile card (gradient poster with current vibe + top track QR link) — one-tap export to Instagram stories

## App Overview
SKAPA — React Native / Expo social music app. Users broadcast what they're listening to, see friends' live music on a map, and join listening rooms.

## Tech Stack
- Expo 55 · React Native 0.83 · React 19 · TypeScript
- React Navigation (bottom tabs + native stack)
- react-native-reanimated 4 + react-native-worklets 0.7.2 (for entrance animations)
- expo-linear-gradient, expo-blur
- **New for share card**: `react-native-view-shot`, `react-native-qrcode-svg`, `expo-sharing`, `expo-media-library`

## Design Language (Refined)
- Palette: dark (#050505) + amber gradient (#ffae45 → #f05c00); mood-driven secondary hues (violet / cyan / orange / slate)
- Typography scale: display 34 / title 28 / heading 22 / subhead 17 / body 15 / caption 13 / overline 11
- Radii: 8 · 12 · 16 · 20 · 28
- Glassy surfaces with `rgba(255,255,255,0.035–0.08)` + 1px borders
- Micro-interactions: press scale 0.97, animated glow opacity, spring/fade-in entrance per section

## What's been implemented

### Jan 2026 — Phase 1 (design polish)
- **Theme foundation** — typography scale, shadow presets, mood palette
- **New shared components** — `OnboardingProgress` (animated segmented progress), `DisplayPill` (editorial serif-italic pill)
- **Refined OnboardingCTA** — chevron bubble, press scale + glow, optional subtitle
- **Onboarding (3 screens polished)** — eyebrow labels, floating avatars, central hub with outer ring & under-glow, sparkles on cards, trust row, dynamic CTA label ("Enter with {vibe}"), Sign-in link
- **Map (LivePresenceScreen)** — eyebrow location chip, "Music Map" heading, Nearby/Global segmented toggle with icons, search pill with filter dot, dual-ring pulsing avatars, bubble redesigned (avatar header + track/artist + "Tune In"), live pulse-ring indicator, friend rows w/ distance + artist, gradient FAB labeled "Drop", richer room cards with LIVE/SOON + genre
- **Profile (new complete page)** — gradient cover, 124px avatar w/ tri-color ring + mood badge, stats row (Following / Followers / Day streak), Edit Profile + Share actions, Vibing Now purple card, Your Week analytics, indexed Top Tracks, Top Artists carousel, Friends row w/ invite CTA, Recent Rooms, Account settings, Logout + version footer
- **Tab navigator** — profile tab avatar gets amber ring when focused

### Jan 2026 — Phase 2 (shareable vibe card)
- **ShareProfileCard.tsx** (new)
  - 9:16 poster captured via `react-native-view-shot`
  - Mood-driven gradient bg (8 preset palettes for each vibe)
  - SKAPA wordmark, avatar w/ gradient ring + mood emoji badge, name/handle, big "CURRENT VIBE" pill, "LISTENING NOW" card, QR code linking to profile URL, tagline
  - Action bar: **Save** (to Photos via `expo-media-library`) + **Share to Stories** (orange gradient, opens iOS/Android share sheet via `expo-sharing` → pick Instagram/any app)
  - Permission prompt handled for photo save; graceful alerts on failure
- Wired into `ProfileScreen` — tap top-right share icon OR the "Share" button under the avatar to open
- Validated visually via Expo web (onboarding, map, profile, share modal — all rendering correctly)

## Files Touched
```
/app/package.json                                     (added 5 deps)
/app/src/theme/index.ts                               (refined tokens)
/app/src/components/OnboardingProgress.tsx            (new)
/app/src/components/DisplayPill.tsx                   (new)
/app/src/components/OnboardingCTA.tsx                 (refined)
/app/src/components/ShareProfileCard.tsx              (new)
/app/src/screens/onboarding/EmotionalHookScreen.tsx   (refined)
/app/src/screens/onboarding/ConnectMusicScreen.tsx    (refined)
/app/src/screens/onboarding/ChooseVibeScreen.tsx      (refined)
/app/src/screens/LivePresenceScreen.tsx               (refined)
/app/src/screens/ProfileScreen.tsx                    (new + share wired)
/app/src/navigation/MainNavigator.tsx                 (wired profile)
```

## Prioritized Backlog
- P1: Connect Profile data to real backend (currently mock)
- P1: Apply same polish pass to HomeScreen, RoomsScreen, ListeningRoomScreen
- P2: Deep-link IG Stories directly (instagram-stories:// scheme with background-asset + sticker) for native-feel 1-tap (needs bundle ID whitelist)
- P2: Custom font via expo-font (Clash Display / Söhne)
- P2: Mood-tinted app chrome theming
- P3: Profile edit modal, settings detail screens

## Test Credentials
No auth — app starts on onboarding.

## Notes for next session
- Expo SDK 55 expected react-native-worklets `0.7.2`; we installed that exact version (0.8.x is incompatible with reanimated 4.2.x)
- `react-native-view-shot` captures the hidden-friendly ref; on Android 13+ permission for MediaLibrary is scoped to photos
