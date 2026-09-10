import type { LoginRequest } from '../types/dtos.js';
import { BadRequestError } from '../errors/http-errors.js';
import { validateRut } from './rut.validator.js';

export function validateLoginRequest(body: unknown): LoginRequest {
  if (typeof body !== 'object' || body === null) {
    throw new BadRequestError('El cuerpo de la solicitud debe ser un objeto JSON');
  }
  const candidate = body as Record<string, unknown>;
  const { rut, password } = candidate;

  if (typeof rut !== 'string' || typeof password !== 'string') {
    throw new BadRequestError('Los campos rut y password son obligatorios');
  }
  if (password.trim() === '') {
    throw new BadRequestError('El campo password no puede estar vacío');
  }

  const validation = validateRut(rut);
  if (!validation.valid || validation.normalized === undefined) {
    throw new BadRequestError('RUT inválido');
  }

  return { rut: validation.normalized, password };
}