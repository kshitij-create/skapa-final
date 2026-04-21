/**
 * Local persistence helpers — AsyncStorage-backed key/value for a small
 * set of values we want to survive app restarts (currently: chosen vibe).
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY_VIBE = 'skapa.vibe';
const KEY_DROPS_SEEN = 'skapa.drops.seen';

export interface Vibe {
  id: string;
  emoji: string;
  label: string;
  setAt: number;
}

export const VIBES: Vibe[] = [
  { id: 'latenight',  emoji: '🌊', label: 'Late Night',  setAt: 0 },
  { id: 'highenergy', emoji: '🔥', label: 'High Energy', setAt: 0 },
  { id: 'focus',      emoji: '🔮', label: 'Focus',       setAt: 0 },
  { id: 'chill',      emoji: '☁️', label: 'Chill',       setAt: 0 },
  { id: 'sadhours',   emoji: '💔', label: 'Sad Hours',   setAt: 0 },
  { id: 'indie',      emoji: '🎧', label: 'Indie',       setAt: 0 },
];

export async function getVibe(): Promise<Vibe | null> {
  try {
    const raw = await AsyncStorage.getItem(KEY_VIBE);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export async function setVibe(v: Omit<Vibe, 'setAt'>): Promise<Vibe> {
  const full: Vibe = { ...v, setAt: Date.now() };
  await AsyncStorage.setItem(KEY_VIBE, JSON.stringify(full));
  return full;
}

export async function markDropSeen(id: string) {
  try {
    const raw = (await AsyncStorage.getItem(KEY_DROPS_SEEN)) || '[]';
    const arr = new Set<string>(JSON.parse(raw));
    arr.add(id);
    await AsyncStorage.setItem(KEY_DROPS_SEEN, JSON.stringify([...arr].slice(-200)));
  } catch {}
}
