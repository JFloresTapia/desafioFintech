import type { NextFunction, Request, Response } from 'express';
import { ApiError } from '../errors/api-error.js';
import { logger } from '../utils/logger.js';
import type { ApiErrorBody } from '../types/dtos.js';

/**
 * Middleware central de errores. Responde el mismo shape { statusCode, message }
 * para cualquier error. Los errores conocidos (ApiError) devuelven su código y
 * mensaje; los errores no manejados se registran y responden 500 genérico sin
 * exponer detalles internos ni stack traces.
 */
export function errorHandler(
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (error instanceof ApiError) {
    const body: ApiErrorBody = { statusCode: error.statusCode, message: error.message };
    res.status(error.statusCode).json(body);
    return;
  }

  logger.error('Error no manejado:', error);
  const body: ApiErrorBody = { statusCode: 500, message: 'Error interno del servidor' };
  res.status(500).json(body);
}