import type { Session } from '../types/auth';
import { isAuthUser } from '../types/auth';

export const TOKEN_KEY = 'pp_token';
export const USER_KEY = 'pp_user';

function safeRead(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeWrite(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    // El almacenamiento puede no estar disponible (p. ej. modo privado).
    // La sesión simplemente no persiste entre recargas.
  }
}

function safeRemove(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch {
    // Sin efecto.
  }
}

export function readStoredToken(): string | null {
  return safeRead(TOKEN_KEY);
}

export function readStoredSession(): Session | null {
  const token = safeRead(TOKEN_KEY);
  const rawUser = safeRead(USER_KEY);
  if (token === null || rawUser === null) return null;
  try {
    const user: unknown = JSON.parse(rawUser);
    if (!isAuthUser(user)) return null;
    return { token, user };
  } catch {
    return null;
  }
}

export function persistSession(session: Session): void {
  safeWrite(TOKEN_KEY, session.token);
  safeWrite(USER_KEY, JSON.stringify(session.user));
}

export function clearSession(): void {
  safeRemove(TOKEN_KEY);
  safeRemove(USER_KEY);
}