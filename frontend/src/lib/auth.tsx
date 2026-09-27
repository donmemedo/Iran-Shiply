'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api, TOKEN_KEY, type User } from './api';

type AuthState = {
  user: User | null;
  ready: boolean;
  login: (phone: string, password: string) => Promise<void>;
  register: (body: Record<string, unknown>) => Promise<void>;
  logout: () => void;
};

const Ctx = createContext<AuthState>({} as AuthState);
export const useAuth = () => useContext(Ctx);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem(TOKEN_KEY)) return setReady(true);
    api<User>('/api/auth/me')
      .then(setUser)
      .catch(() => localStorage.removeItem(TOKEN_KEY))
      .finally(() => setReady(true));
  }, []);

  const finish = useCallback((res: { access_token: string; user: User }) => {
    localStorage.setItem(TOKEN_KEY, res.access_token);
    setUser(res.user);
  }, []);

  const value = useMemo<AuthState>(() => ({
    user, ready,
    login: async (phone, password) =>
      finish(await api('/api/auth/login', { method: 'POST', body: JSON.stringify({ phone, password }) })),
    register: async (body) =>
      finish(await api('/api/auth/register', { method: 'POST', body: JSON.stringify(body) })),
    logout: () => { localStorage.removeItem(TOKEN_KEY); setUser(null); },
  }), [user, ready, finish]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
