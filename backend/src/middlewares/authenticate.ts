import type { NextFunction, Request, RequestHandler, Response } from 'express';
import type { JwtService } from '../services/jwt.service.js';
import { UnauthorizedError } from '../errors/http-errors.js';

export function createAuthenticate(jwtService: JwtService): RequestHandler {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      const authorization = req.headers.authorization;
      if (authorization === undefined || !authorization.startsWith('Bearer ')) {
        throw new UnauthorizedError('Token no proporcionado o formato inválido');
      }

      const token = authorization.slice('Bearer '.length).trim();
      if (token.length === 0) {
        throw new UnauthorizedError('Token no proporcionado o formato inválido');
      }

      const payload = jwtService.verify(token);
      req.user = jwtService.toAuthenticatedUser(payload);
      next();
    } catch (error) {
      next(error);
    }
  };
}