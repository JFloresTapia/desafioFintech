import type { PublicUser } from '../domain/user.js';

export interface LoginRequest {
  rut: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  expiresIn: string;
  user: PublicUser;
}

export interface ScoreResponse {
  rut: string;
  score: number;
  fecha: string;
}

export interface ApiErrorBody {
  statusCode: number;
  message: string;
}