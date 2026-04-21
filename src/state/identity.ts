/**
 * Guest identity — a persistent anonymous user for pre-auth features
 * like Rooms. Generated once and cached in AsyncStorage.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'skapa.identity';

export interface Identity {
  id: string;
  name: string;
  avatar: string;
}

const ADJECTIVES = ['Neon', 'Velvet', 'Midnight', 'Electric', 'Lunar', 'Amber', 'Indigo', 'Crystal', 'Wild', 'Ghost'];
const NOUNS = ['Echo', 'Pulse', 'Fox', 'Wave', 'Moth', 'Sparrow', 'Comet', 'Phoenix', 'Orbit', 'Tide'];

function randomName() {
  return `${ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)]} ${NOUNS[Math.floor(Math.random() * NOUNS.length)]}`;
}

export async function getOrCreateIdentity(): Promise<Identity> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (raw) return JSON.parse(raw);
  } catch {}

  const id = `g_${Math.random().toString(36).slice(2, 10)}`;
  const identity: Identity = {
    id,
    name: randomName(),
    avatar: `https://i.pravatar.cc/200?u=${id}`,
  };
  await AsyncStorage.setItem(KEY, JSON.stringify(identity));
  return identity;
}

export async function setIdentity(partial: Partial<Identity>) {
  const current = await getOrCreateIdentity();
  const next = { ...current, ...partial };
  await AsyncStorage.setItem(KEY, JSON.stringify(next));
  return next;
}
