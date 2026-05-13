# SKAPA

> **Music feels better together.**

🎉 **Demo Mode Active** - This app runs entirely in the frontend with beautiful mock data. No backend, no deployment, no servers needed!

SKAPA is a social music presence app built with React Native (Expo). It lets you see what your friends are listening to in real-time, join shared listening rooms, and discover music happening around you — all wrapped in a polished, dark-mode-first UI.

---

## 🎨 Demo Features

### 🗺️ Music Map (Live Presence)
- Real-time **spatial map** with 8 mock users
- Pulsing avatar bubbles with mood-colored glows
- Tap avatars to see track info and "Tune In"
- Mock locations: Mumbai, Delhi, Bangalore, Tokyo, NYC, London
- Auto-refreshes every 30 seconds

### 📻 Listening Rooms
- Join shared virtual listening rooms
- Rotating vinyl record animation
- Floating emoji reactions
- Live participant counts

### 👤 Profile
- User stats and listening history
- QR code for profile sharing
- Top tracks and artists
- Weekly analytics

### 🏠 Home
- Set your vibe/mood
- Browse recent rooms
- Notification tray

---

## 🚀 Want Real Backend Later?

This demo runs without a backend. To add real Spotify integration:

- **See:** [DEPLOYMENT.md](./DEPLOYMENT.md) for backend setup
- **Or:** Ask me to convert to Firebase (no server needed!)

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

### 🚀 **DEMO MODE - Super Quick Start!**

**Just 2 commands:**

```bash
cd /app
npm install
npx expo start
```

**Then:**
1. Download **Expo Go** on your phone (App Store/Play Store)
2. Scan the QR code
3. **Done!** The app opens in 10 seconds 🎉

**Or use the quick start script:**
```bash
./start-demo.sh
```

---

### 📱 What Works in Demo Mode

✅ **Beautiful UI** - All screens fully functional  
✅ **Music Map** - 8 mock users "listening" in real-time  
✅ **Listening Rooms** - Join virtual spaces with vinyl animations  
✅ **Profile** - Stats, QR codes, top tracks  
✅ **Onboarding** - Polished 3-step flow  

❌ **No backend needed** - Everything is mocked!

---

### Prerequisites (If Not Installed)

- **Node.js ≥ 18** - Download from https://nodejs.org
- **Expo Go** app - Download from your phone's app store

### Run

**Start the demo:**
```bash
npx expo start
```

Or:
```bash
./start-demo.sh
```

**Open on phone:**
- Scan QR code with Expo Go app

**Open in browser:**
- Press `w` key in terminal

---

## 📚 Documentation

- **Quick Start:** [README_DEMO.md](./README_DEMO.md) - Demo guide with tips
- **Full Features:** This README
- **Backend Setup:** [DEPLOYMENT.md](./DEPLOYMENT.md) - If you want real Spotify later

---

## Known Issues

| Issue | Detail |
|---|---|
| **Node 14 incompatibility** | `@expo/cli` uses `||=` (logical OR assignment), which requires Node ≥ 15. Upgrade to Node 18 LTS. |
| **npm v6 lockfile mismatch** | `package-lock.json` is lockfileVersion 3 but the installed npm is v6. Use npm ≥ 7 or switch to the correct Node version. |

---

## License

Private — all rights reserved.
