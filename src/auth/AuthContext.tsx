/**
 * AuthContext — holds signed-in user + session JWT.
 *
 * On mount: if a JWT is present in SecureStore, call /api/me to hydrate user.
 * Exposes signInWithSpotify + signOut.
 */
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import {
  apiFetch,
  clearStoredToken,
  getStoredToken,
  setStoredToken,
} from './api';

WebBrowser.maybeCompleteAuthSession();

export interface SkapaUser {
  id: string;
  spotify_id: string;
  handle: string | null;
  display_name: string;
  email: string | null;
  avatar_url: string | null;
  country?: string;
  product?: string;
  vibe?: { emoji: string; label: string } | null;
  profile?: { bio?: string; share_slug?: string };
  stats?: { following: number; followers: number; streak_days: number };
  spotify_connected?: boolean;
}

interface AuthContextValue {
  user: SkapaUser | null;
  booting: boolean;
  signingIn: boolean;
  error: string | null;
  signInWithSpotify: () => Promise<SkapaUser | null>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const DISCOVERY: AuthSession.DiscoveryDocument = {
  authorizationEndpoint: 'https://accounts.spotify.com/authorize',
  tokenEndpoint: 'https://accounts.spotify.com/api/token',
};

const SCOPES = [
  'user-read-email',
  'user-read-private',
  'user-read-currently-playing',
  'user-read-recently-played',
  'user-top-read',
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<SkapaUser | null>(null);
  const [booting, setBooting] = useState(true);
  const [signingIn, setSigningIn] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Compute redirect URI — works for both Expo Go (via exp:// or auth proxy) and standalone (skapa://).
  const redirectUri = useMemo(
    () =>
      AuthSession.makeRedirectUri({
        scheme: 'skapa',
        path: 'auth/callback',
      }),
    [],
  );

  const [request, , promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: process.env.EXPO_PUBLIC_SPOTIFY_CLIENT_ID!,
      scopes: SCOPES,
      usePKCE: true,
      redirectUri,
      responseType: AuthSession.ResponseType.Code,
      extraParams: { show_dialog: 'false' },
    },
    DISCOVERY,
  );

  // ── Bootstrap existing session on app start ─────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const token = await getStoredToken();
        if (!token) return;
        const data = await apiFetch<{ user: SkapaUser }>('/api/me');
        setUser(data.user);
      } catch (e) {
        await clearStoredToken();
      } finally {
        setBooting(false);
      }
    })();
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const data = await apiFetch<{ user: SkapaUser }>('/api/me');
      setUser(data.user);
    } catch (e: any) {
      // token invalid
      await clearStoredToken();
      setUser(null);
    }
  }, []);

  const signInWithSpotify = useCallback(async (): Promise<SkapaUser | null> => {
    setError(null);
    if (!request) {
      setError('Auth not ready yet, please try again.');
      return null;
    }
    setSigningIn(true);
    try {
      const result = await promptAsync();
      if (result.type !== 'success' || !result.params.code) {
        setSigningIn(false);
        if (result.type === 'error') setError(result.error?.message || 'Auth error');
        return null;
      }
      const { code } = result.params;
      const codeVerifier = request.codeVerifier!;

      const data = await apiFetch<{ token: string; user: SkapaUser }>(
        '/api/auth/spotify/callback',
        {
          method: 'POST',
          body: JSON.stringify({
            code,
            code_verifier: codeVerifier,
            redirect_uri: redirectUri,
          }),
        },
      );
      await setStoredToken(data.token);
      setUser(data.user);
      return data.user;
    } catch (e: any) {
      setError(e?.message || 'Sign-in failed');
      return null;
    } finally {
      setSigningIn(false);
    }
  }, [request, promptAsync, redirectUri]);

  const signOut = useCallback(async () => {
    try {
      await apiFetch('/api/auth/logout', { method: 'POST' });
    } catch {
      /* ignore */
    }
    await clearStoredToken();
    setUser(null);
  }, []);

  const value: AuthContextValue = {
    user,
    booting,
    signingIn,
    error,
    signInWithSpotify,
    signOut,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
