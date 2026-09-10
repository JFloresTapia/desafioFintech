import type { NextFunction, Request, RequestHandler, Response } from 'express';
import { NotFoundError } from '../errors/http-errors.js';

export const notFoundHandler: RequestHandler = (
  req: Request,
  _res: Response,
  next: NextFunction,
): void => {
  next(new NotFoundError(`Ruta ${req.method} ${req.originalUrl} no encontrada`));
};