import type { Role } from '../domain/role.js';

export interface JwtPayload {
  sub: string;
  role: Role;
  rut?: string;
}