# SKAPA

> **Music feels better together.**

SKAPA is a social music presence app built with React Native (Expo). It lets you broadcast what you're listening to, see what your friends are vibing to in real time, join shared listening rooms, and discover music happening around you — all wrapped in a polished, dark-mode-first UI.

---

## Features

### 🏠 Home
- Set your current **vibe** (Deep Focus, High Energy, Late Night, Chill)
- View your **Spotify connection** status and live broadcast indicator
- Browse and join **Recent Rooms** from friends
- In-app **notification tray** for room and friend activity

### 🗺️ Music Map (Live Presence)
- A real-time **spatial map** of friends listening nearby
- Pulsing avatar bubbles with mood-colored glows
- Tap an avatar to see a **preview bubble** with track info and a "Tune In" action
- **Nearby / Global** toggle to switch between local and worldwide views
- Draggable **bottom sheet** with friends list, active rooms, and live stats
- Gradient FAB to drop your own presence pin

### 📻 Rooms (Listening Rooms)
- Browse and join shared listening rooms
- Live participant counts with badge notifications

### 📡 Discover
- Grid view of rooms and new music drops
- Filter by genre, mood, or activity

### 👤 Profile
- Full user profile with avatar, bio, vibe badge, and follower/following stats
- **Now Playing** card with animated waveform
- **Weekly analytics** — hours listened, top genre, today's minutes
- Top Tracks and Top Artists sections
- Recent Rooms history
- **Share Profile** card with QR code (exportable via `expo-media-library`)
- Account settings and logout

### 🚀 Onboarding
A 3-step animated onboarding flow:
1. **Emotional Hook** — animated central hub with floating avatars and orbit rings
2. **Connect Music** — Spotify and Apple Music platform connection
3. **Choose Your Vibe** — initial mood selection

---

## Tech Stack

| Layer | Library / Tool |
|---|---|
| Framework | [Expo](https://expo.dev) ~55 |
| Language | TypeScript |
| Navigation | `@react-navigation/native` + `@react-navigation/bottom-tabs` + `@react-navigation/native-stack` |
| Animations | `react-native-reanimated` 4 + `react-native-worklets` |
| UI / Icons | `@expo/vector-icons` (Ionicons), `lucide-react-native` |
| Blur | `expo-blur` |
| Gradients | `expo-linear-gradient` |
| QR Codes | `react-native-qrcode-svg` |
| SVG | `react-native-svg` |
| Screenshot / Share | `react-native-view-shot`, `expo-sharing`, `expo-media-library` |
| Safe Area | `react-native-safe-area-context` |

---

## Project Structure

```
skapa-final/
├── App.tsx                    # Root — NavigationContainer + RootStack (Onboarding → Main)
├── index.ts                   # Expo entry point
├── app.json                   # Expo config (icons, splash, orientation)
├── src/
│   ├── theme/
│   │   └── index.ts           # Design tokens: COLORS, SPACING, BORDER_RADIUS, TYPO, SHADOWS
│   ├── navigation/
│   │   ├── MainNavigator.tsx  # Bottom-tab navigator with custom blur pill tab bar
│   │   └── OnboardingNavigator.tsx
│   ├── screens/
│   │   ├── HomeScreen.tsx
│   │   ├── LivePresenceScreen.tsx   # Music Map with pulsing avatars & bottom sheet
│   │   ├── ListeningRoomScreen.tsx
│   │   ├── RoomsScreen.tsx
│   │   ├── ProfileScreen.tsx
│   │   └── onboarding/
│   │       ├── EmotionalHookScreen.tsx
│   │       ├── ConnectMusicScreen.tsx
│   │       ├── ChooseVibeScreen.tsx
│   │       └── index.ts
│   └── components/
│       ├── DisplayPill.tsx
│       ├── FilterChip.tsx
│       ├── FriendCard.tsx
│       ├── GlassCard.tsx
│       ├── MoodChip.tsx
│       ├── OnboardingBackground.tsx
│       ├── OnboardingCTA.tsx
│       ├── OnboardingProgress.tsx
│       ├── PlatformButton.tsx
│       ├── RoomCard.tsx
│       ├── ShareProfileCard.tsx   # QR code card with save/share actions
│       ├── StartRoomCard.tsx
│       ├── UpcomingDropCard.tsx
│       ├── VibeButton.tsx
│       └── Waveform.tsx
└── assets/                    # App icons, splash screen, favicon
```

---

## Design System

All tokens live in `src/theme/index.ts`:

- **`COLORS`** — Deep `#050505` background, warm amber brand (`#ffae45` / `#ff8a00`), mood palette (Night, Focus, Hype, Melancholy, Chill)
- **`SPACING`** — `xxs` → `xxxl` scale (2 → 64)
- **`BORDER_RADIUS`** — `xs` → `pill` (4 → 9999)
- **`TYPO`** — `display` → `overline` type scale with tight letter-spacing
- **`SHADOWS`** — `soft`, `glow` (amber), `lifted`

---

## Getting Started

### Prerequisites

- **Node.js ≥ 18** (required by Expo 55 and its CLI)
- **npm ≥ 9** or Yarn
- Expo Go app on a physical device **or** Android/iOS simulator

> ⚠️ The project currently fails to start on Node 14 because `@expo/cli` uses modern JS syntax (`||=`). Upgrade Node first.

### Install

```bash
npm install
```

### Run

```bash
# Start the Expo dev server (scan QR with Expo Go)
npx expo start

# Run directly on Android
npx expo start --android

# Run directly on iOS
npx expo start --ios
```

---

## Known Issues

| Issue | Detail |
|---|---|
| **Node 14 incompatibility** | `@expo/cli` uses `||=` (logical OR assignment), which requires Node ≥ 15. Upgrade to Node 18 LTS. |
| **npm v6 lockfile mismatch** | `package-lock.json` is lockfileVersion 3 but the installed npm is v6. Use npm ≥ 7 or switch to the correct Node version. |

---

## License

Private — all rights reserved.
