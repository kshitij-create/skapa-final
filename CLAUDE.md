# SKAPA — AI Assistant Context

This file gives Claude (or any AI coding assistant) the context needed to work effectively in this codebase.

---

## Project in One Sentence

SKAPA is a **React Native (Expo) social music presence app** — users broadcast their listening status, see friends on a live music map, and join shared listening rooms.

---

## Tech Stack (Quick Reference)

| Concern | Library |
|---|---|
| Runtime | React Native 0.83 + Expo ~55 |
| Language | TypeScript (strict) |
| Navigation | `@react-navigation/native-stack` + `@react-navigation/bottom-tabs` |
| Animations | `react-native-reanimated` v4 + `react-native-worklets` |
| Icons | `@expo/vector-icons` (Ionicons) + `lucide-react-native` |
| Blur | `expo-blur` (`<BlurView>`) |
| Gradients | `expo-linear-gradient` (`<LinearGradient>`) |
| QR / SVG | `react-native-qrcode-svg` + `react-native-svg` |
| Sharing | `react-native-view-shot` + `expo-sharing` + `expo-media-library` |
| Safe area | `react-native-safe-area-context` |

---

## Architecture

### Navigation Tree

```
RootStack (native-stack, no header)
├── Onboarding (OnboardingNavigator — native-stack)
│   ├── EmotionalHook
│   ├── ConnectMusic
│   └── ChooseVibe
└── Main (MainNavigator — bottom-tabs, custom tab bar)
    ├── Home          → HomeScreen
    ├── Discover      → RoomsScreen
    ├── Map           → LivePresenceScreen   ← center uplifted FAB tab
    ├── Rooms         → ListeningRoomScreen
    └── Profile       → ProfileScreen
```

### Key Architectural Patterns

1. **Custom Tab Bar** (`MainNavigator.tsx`): The bottom tab bar is a fully custom component using `<BlurView>` + a floating white circle for the center (Map) tab. Avoid using the default tab bar or adding `tabBarStyle` options — they will break the custom layout.

2. **Design tokens first**: Every color, spacing value, border radius, and shadow **must** come from `src/theme/index.ts`. Never hardcode raw values in screen or component files; extend the theme file instead.

3. **Reanimated v4**: Animations in the codebase use both the `Animated` API from React Native (for `PanResponder`-driven sheets) and `react-native-reanimated` v4 (`useSharedValue`, `useAnimatedStyle`, `withRepeat`, `FadeInDown`, etc.). Do **not** mix the two APIs in the same component unless intentional (as in `LivePresenceScreen`).

4. **Bottom Sheet pattern** (`LivePresenceScreen.tsx`): The draggable sheet uses `Animated.Value` + `PanResponder` with two snap points (`SNAP_COLLAPSED` / `SNAP_EXPANDED`). If adding more sheets, follow this same pattern — do **not** install a third-party sheet library without discussion.

5. **Screen-level StyleSheet**: Every screen and component keeps its `StyleSheet.create({})` at the bottom of its own file. No shared stylesheet files besides the theme.

---

## Design System

All tokens are exported from `src/theme/index.ts`:

```ts
COLORS.background       // '#050505' — root surface
COLORS.primary          // '#ffae45' — warm amber brand
COLORS.accent           // '#ff8a00' — CTA / glow accent
COLORS.text             // '#ffffff'
COLORS.textMuted        // 'rgba(255,255,255,0.5)'
// Mood palette
COLORS.moodNight        // '#8A2BE2'
COLORS.moodFocus        // '#00E5FF'
COLORS.moodHype         // '#f97316'
COLORS.moodChill        // '#0ea5e9'
COLORS.moodMelancholy   // '#64748b'

SPACING.md              // 16
BORDER_RADIUS.pill      // 9999
TYPO.heading            // { fontSize: 22, fontWeight: '600', letterSpacing: -0.4 }
SHADOWS.glow            // amber glow shadow
```

**Rule**: When adding UI, import tokens from `../theme` and never reach for `StyleSheet.create` with raw color strings.

---

## Common Patterns

### Gradient overlay on cards
```tsx
<LinearGradient
  colors={['transparent', 'rgba(0,0,0,0.8)', 'rgba(0,0,0,0.95)']}
  style={StyleSheet.absoluteFillObject}
/>
```

### Glass surface
```tsx
// Background card / surface
backgroundColor: 'rgba(255, 255, 255, 0.045)'
borderWidth: 1,
borderColor: 'rgba(255, 255, 255, 0.06)'
```

### Live badge / pulse indicator
```tsx
<View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: '#ef4444' }} />
// Outer ring at 14×14 with borderColor: 'rgba(239,68,68,0.35)'
```

### Reanimated entrance animation
```tsx
import Animated, { FadeInDown } from 'react-native-reanimated';
<Animated.View entering={FadeInDown.delay(200).springify()}>
```

---

## Environment & Known Issues

| Issue | Fix |
|---|---|
| `SyntaxError: Unexpected token '||='` on `npm start` | Running on **Node 14**. Upgrade to **Node 18 LTS**. `@expo/cli` requires Node ≥ 15. |
| `npm WARN notsup` for `body-parser` | npm v6 + Node 14 mismatch. Resolved once Node 18 is active. |
| `package-lock.json` lockfileVersion 3 with npm v6 | Use npm ≥ 7. Switch Node version to fix both issues at once. |

### Recommended dev setup
```bash
# Use Node 18 LTS (via nvm, fnm, or volta)
node --version   # should be 18.x or 20.x

npx expo start           # Expo Go / simulator
npx expo start --android # Android emulator
npx expo start --ios     # iOS simulator (macOS only)
```

---

## File Naming Conventions

| Type | Convention | Example |
|---|---|---|
| Screen | PascalCase + `Screen` suffix | `HomeScreen.tsx` |
| Component | PascalCase | `ShareProfileCard.tsx` |
| Navigator | PascalCase + `Navigator` suffix | `MainNavigator.tsx` |
| Theme / util | camelCase index | `src/theme/index.ts` |

---

## What to Avoid

- ❌ Installing a third-party navigation library (e.g. `react-navigation` v6 Stack while we use v7)
- ❌ Hardcoding colors or spacing values in screen files
- ❌ Using the default `@react-navigation/bottom-tabs` tab bar options — the custom `CustomTabBar` component owns that entirely
- ❌ Using `StyleSheet` from `react-native` in the theme file — it's plain objects only
- ❌ Adding global state management (Redux, Zustand, etc.) without discussion — screens currently manage local state via `useState`
- ❌ Running `expo build` or `eas build` for local dev — use `expo start` only
