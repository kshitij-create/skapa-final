/**
 * Lightweight fetch wrapper that injects the session JWT from SecureStore.
 */
import * as SecureStore from 'expo-secure-store';

const API = process.env.EXPO_PUBLIC_BACKEND_URL;
const JWT_KEY = 'skapa.jwt';

export async function getStoredToken(): Promise<string | null> {
  return SecureStore.getItemAsync(JWT_KEY);
}

export async function setStoredToken(token: string): Promise<void> {
  await SecureStore.setItemAsync(JWT_KEY, token);
}

export async function clearStoredToken(): Promise<void> {
  await SecureStore.deleteItemAsync(JWT_KEY);
}

export async function apiFetch<T = any>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  if (!API) throw new Error('EXPO_PUBLIC_BACKEND_URL is not set');
  const token = await getStoredToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API}${path}`, { ...options, headers });
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if (!res.ok) {
    const msg = (data && (data.detail || data.message)) || `HTTP ${res.status}`;
    throw new Error(typeof msg === 'string' ? msg : JSON.stringify(msg));
  }
  return data as T;
}
