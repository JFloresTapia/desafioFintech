import type { Role } from './role.js';

export interface User {
  id: string;
  rut: string;
  passwordHash: string;
  role: Role;
}

export interface AuthenticatedUser {
  id: string;
  role: Role;
  rut?: string;
}

export interface PublicUser {
  id: string;
  rut: string;
  role: Role;
}