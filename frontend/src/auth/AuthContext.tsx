import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { authApi, usersApi } from '@/api/endpoints';
import { setAuthLostHandler } from '@/api/client';
import { tokenStore } from '@/api/tokens';
import type { User } from '@/api/types';

interface AuthState {
  user: User | null;
  loading: boolean;
  login(login: string, password: string): Promise<void>;
  register(login: string, password: string): Promise<void>;
  logout(): Promise<void>;
  setUser(u: User | null): void;
}
const Ctx = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const qc = useQueryClient();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(!!tokenStore.get());

  const reset = useCallback(() => { setUser(null); qc.clear(); }, [qc]);

  useEffect(() => {
    setAuthLostHandler(reset);
    if (!tokenStore.get()) return;
    usersApi.me().then(setUser).catch(() => {}).finally(() => setLoading(false));
  }, [reset]);

  const login = useCallback(async (l: string, p: string) => {
    const t = await authApi.login(l.trim().toLowerCase(), p);
    tokenStore.set({ access: t.access_token, refresh: t.refresh_token });
    setUser(await usersApi.me());
  }, []);

  const register = useCallback(async (l: string, p: string) => {
    await authApi.register(l.trim().toLowerCase(), p);
    await login(l, p);
  }, [login]);

  const logout = useCallback(async () => {
    const t = tokenStore.get();
    try { if (t) await authApi.logout(t.refresh); } catch {}
    tokenStore.clear();
    reset();
  }, [reset]);

  const value = useMemo(() => ({ user, loading, login, register, logout, setUser }), [user, loading, login, register, logout]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useAuth = () => {
  const c = useContext(Ctx);
  if (!c) throw new Error('useAuth вне AuthProvider');
  return c;
};
