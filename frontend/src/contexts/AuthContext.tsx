import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { AuthContextValue, Session } from '../types/auth';
import { authService } from '../services/authService';
import { UNAUTHORIZED_EVENT } from '../services/apiClient';
import { clearSession, persistSession, readStoredSession } from '../services/sessionStorage';

export const AuthContext = createContext<AuthContextValue | null>(null);

const EXPIRED_SESSION_MESSAGE = 'Tu sesión ha expirado. Inicia sesión nuevamente.';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(() => readStoredSession());
  const [sessionMessage, setSessionMessage] = useState<string | null>(null);

  useEffect(() => {
    const handleUnauthorized = (): void => {
      clearSession();
      setSession(null);
      setSessionMessage(EXPIRED_SESSION_MESSAGE);
    };
    window.addEventListener(UNAUTHORIZED_EVENT, handleUnauthorized);
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, handleUnauthorized);
  }, []);

  const login = useCallback(async (rut: string, password: string) => {
    const response = await authService.login(rut, password);
    const nextSession: Session = { token: response.token, user: response.user };
    persistSession(nextSession);
    setSession(nextSession);
    setSessionMessage(null);
  }, []);

  const logout = useCallback((message?: string) => {
    clearSession();
    setSession(null);
    setSessionMessage(message ?? null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      isAuthenticated: session !== null,
      sessionMessage,
      login,
      logout,
    }),
    [session, sessionMessage, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}