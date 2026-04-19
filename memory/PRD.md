# SKAPA — Design Refinement

## Original Problem Statement
> Refine the whole design of app. Make the app more aesthetic and professional, don't do drastic changes.

User preferences (Jan 2026):
- Aesthetic direction: keep current vibe but polish it
- Color theme: keep existing palette, just refine
- Focus areas: Map page, Onboarding pages, Profile page (complete)
- Micro-interactions/animations: yes
- Design references: Spotify, Snapchat

## App Overview
SKAPA — React Native / Expo social music app. Users broadcast what they're listening to, see friends' live music on a map, and join listening rooms.

## Tech Stack
- Expo 55 · React Native 0.83 · React 19
- React Navigation (bottom tabs + native stack)
- react-native-reanimated 4 for entrance/micro animations
- expo-linear-gradient, expo-blur for glassy surfaces
- lucide-react-native + @expo/vector-icons
- TypeScript

## Design Language (Refined)
- **Palette**: dark (#050505) + amber gradient (#ffae45 → #f05c00) accent; mood-driven secondary hues (violet, cyan, orange, slate) for map/rooms
- **Typography scale**: display 34 / title 28 / heading 22 / subhead 17 / body 15 / caption 13 / overline 11 — tightened letter-spacing on display weights for editorial feel
- **Radii**: 8 · 12 · 16 · 20 · 28 — rounded, Snapchat-like
- **Glassy surfaces** with `rgba(255,255,255,0.035-0.08)` + 1px borders
- **Micro-interactions**: press scale 0.97, animated glow opacity on primary CTA, spring/fade-in entrance on each section

## What's been implemented (Jan 2026)

### Theme foundation
- `/app/src/theme/index.ts` → extended tokens: typography scale, shadow presets, mood palette, refined spacing/radii

### New shared components
- `OnboardingProgress.tsx` — reusable animated 3-step progress with glowing active segment
- `DisplayPill.tsx` — serif-italic gradient-filled inline pill for headlines

### Refined components
- `OnboardingCTA.tsx` — gradient button with chevron bubble, animated press scale & glow, optional subtitle
- MainNavigator tab — profile avatar gets an amber ring when active

### Onboarding (3 screens polished)
- `EmotionalHookScreen` — eyebrow label, animated orbits, floating avatars (reanimated looped float), central hub with outer ring + under-glow, softer pill typography, sign-in link
- `ConnectMusicScreen` — layered gradient shape stack with sparkles, trust row (ShieldCheck), primary CTA + Skip link hierarchy
- `ChooseVibeScreen` — eyebrow, subtitle helper copy, dynamic CTA label reflecting selected mood, entrance animations

### Map (LivePresenceScreen)
- Refined header: eyebrow location chip, "Music Map" title, Nearby/Global segmented toggle (white pill when active), search pill with filter dot
- Map avatars: dual-ring (glow + accent outline), smoother pulse timing
- Preview bubble redesigned: avatar header row, track + artist on separate lines, "Tune In" gradient CTA
- Bottom sheet: pulse-ring live indicator, stats cards with color dots, friend rows with distance + artist, "Tune In/Wave" action, richer room cards with genre + LIVE/SOON badge and people count
- FAB: multi-stop gradient (purple→indigo→cyan) with "Drop" label below

### Profile (new complete page)
- Gradient cover header with mood-color blobs, subtle grid lines, fade to background
- Hero: 124px avatar with triple-color gradient ring + mood emoji badge, name, handle, bio
- Actions: Edit Profile (gradient) + Share (glass)
- Stats row: Following / Followers / Day streak (with divider bars)
- Now Playing card (purple-tinted): album art + live waveform badge, "VIBING NOW" overline, track/artist, vibe chip
- Your Week: 3-card analytics (hours, top genre, today)
- Top Tracks: indexed list with cover, title, artist, plays count
- Top Artists: horizontal circle carousel
- Friends: stacked avatars + invite CTA
- Recent Rooms: colored emoji tile + meta
- Account settings group: Personal info / Notifications / Privacy / Appearance / Help — Logout (danger tint) — version footer

### Wiring
- `MainNavigator` wires real `ProfileScreen` (removed DummyScreen), profile tab avatar animates on focus

## Files Touched
```
/app/src/theme/index.ts                               (refined)
/app/src/components/OnboardingProgress.tsx            (new)
/app/src/components/DisplayPill.tsx                   (new)
/app/src/components/OnboardingCTA.tsx                 (refined)
/app/src/screens/onboarding/EmotionalHookScreen.tsx   (refined)
/app/src/screens/onboarding/ConnectMusicScreen.tsx    (refined)
/app/src/screens/onboarding/ChooseVibeScreen.tsx      (refined)
/app/src/screens/LivePresenceScreen.tsx               (refined)
/app/src/screens/ProfileScreen.tsx                    (new)
/app/src/navigation/MainNavigator.tsx                 (wired profile)
```

## Prioritized Backlog
- P1: Connect Profile data to a real backend (currently static mock data)
- P1: Apply the same polish pass to HomeScreen, RoomsScreen, ListeningRoomScreen for consistency
- P2: Add custom font (e.g., Söhne / Clash Display) via expo-font for a more distinctive feel
- P2: Light-mode variant
- P2: Dark-to-vibe theming — let the user's current mood tint the app chrome
- P3: Profile edit modal, settings detail screens

## Test Credentials
No auth implemented — app starts on onboarding flow.

## Next Tasks
- User review of refined design on device / simulator
- Apply same polish pattern to Home / Rooms / Listening Room screens
- Wire real data for profile sections
