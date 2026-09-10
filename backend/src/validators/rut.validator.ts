import { normalizeRut } from '../utils/rut-utils.js';
import type { Rut } from '../domain/rut.js';

export interface RutValidation {
  valid: boolean;
  normalized?: string;
}

export function validateRut(value: unknown): RutValidation {
  const normalized = normalizeRut(value);
  return normalized === null ? { valid: false } : { valid: true, normalized };
}

export function isValidRut(value: unknown): value is Rut {
  return normalizeRut(value) !== null;
}