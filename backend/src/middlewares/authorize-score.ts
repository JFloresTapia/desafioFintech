import type { NextFunction, Request, RequestHandler, Response } from 'express';
import { BadRequestError, ForbiddenError, UnauthorizedError } from '../errors/http-errors.js';
import { validateRut } from '../validators/rut.validator.js';

/**
 * Autorización basada en roles para GET /score/:rut.
 * - admin: puede consultar cualquier RUT.
 * - user:  solo puede consultar su propio RUT (el del token).
 * Un RUT con formato inválido se rechaza con 400 para todos los roles.
 */
export function createAuthorizeScore(): RequestHandler {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const user = req.user;
    if (user === undefined) {
      next(new UnauthorizedError());
      return;
    }

    if (user.role === 'admin') {
      next();
      return;
    }

    const validation = validateRut(req.params.rut);
    if (!validation.valid) {
      next(new BadRequestError('RUT inválido'));
      return;
    }

    if (user.rut !== undefined && validation.normalized === user.rut) {
      next();
      return;
    }

    next(new ForbiddenError('El usuario no tiene permisos para consultar este RUT'));
  };
}