export type Role = 'user' | 'admin';

export interface LoginRequest {
  rut: string;
  password: string;
}

export interface AuthUser {
  id: string;
  rut: string;
  role: Role;
}

export interface LoginResponse {
  token: string;
  expiresIn: string;
  user: AuthUser;
}

export interface Session {
  token: string;
  user: AuthUser;
}

export interface AuthContextValue {
  session: Session | null;
  isAuthenticated: boolean;
  sessionMessage: string | null;
  login: (rut: string, password: string) => Promise<void>;
  logout: (message?: string) => void;
}

export function isRole(value: unknown): value is Role {
  return value === 'user' || value === 'admin';
}

export function isAuthUser(value: unknown): value is AuthUser {
  if (typeof value !== 'object' || value === null) return false;
  const candidate = value as Record<string, unknown>;
  return typeof candidate.id === 'string' && typeof candidate.rut === 'string' && isRole(candidate.role);
}