import rateLimit from 'express-rate-limit';
import { env } from '../config/env.js';

function skipOnTest(): boolean {
  return env.nodeEnv === 'test';
}

export const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { statusCode: 429, message: 'Demasiados intentos de login. Intente nuevamente más tarde.' },
  skip: skipOnTest,
});

export const scoreRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 120,
  standardHeaders: true,
  legacyHeaders: false,
  message: { statusCode: 429, message: 'Demasiadas consultas de score. Intente nuevamente más tarde.' },
  skip: skipOnTest,
});