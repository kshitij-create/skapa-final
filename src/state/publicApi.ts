/**
 * Thin fetch wrapper for PUBLIC endpoints (no auth required).
 * Uses the same EXPO_PUBLIC_BACKEND_URL as the authed api.
 */
const API = process.env.EXPO_PUBLIC_BACKEND_URL;

export async function publicFetch<T = any>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  if (!API) throw new Error('EXPO_PUBLIC_BACKEND_URL is not set');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) || {}),
  };
  const res = await fetch(`${API}${path}`, { ...options, headers });
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if (!res.ok) {
    throw new Error((data && (data.detail || data.message)) || `HTTP ${res.status}`);
  }
  return data as T;
}
