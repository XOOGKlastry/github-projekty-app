import * as SecureStore from 'expo-secure-store';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { validateToken } from './github';
import type { GitHubUser } from './types';

const TOKEN_KEY = 'github_pat';

type AuthContextValue = {
  token: string | null;
  user: GitHubUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (token: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<GitHubUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const stored = await SecureStore.getItemAsync(TOKEN_KEY);
        if (!stored) {
          if (!cancelled) setIsLoading(false);
          return;
        }
        const me = await validateToken(stored);
        if (!cancelled) {
          setToken(stored);
          setUser(me);
        }
      } catch {
        await SecureStore.deleteItemAsync(TOKEN_KEY).catch(() => undefined);
        if (!cancelled) {
          setToken(null);
          setUser(null);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (rawToken: string) => {
    const cleaned = rawToken.trim();
    if (!cleaned) {
      throw new Error('Wklej token dostępu (PAT).');
    }
    const me = await validateToken(cleaned);
    await SecureStore.setItemAsync(TOKEN_KEY, cleaned);
    setToken(cleaned);
    setUser(me);
  }, []);

  const logout = useCallback(async () => {
    await SecureStore.deleteItemAsync(TOKEN_KEY).catch(() => undefined);
    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      token,
      user,
      isLoading,
      isAuthenticated: Boolean(token && user),
      login,
      logout,
    }),
    [token, user, isLoading, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth musi być używany wewnątrz AuthProvider');
  }
  return ctx;
}
