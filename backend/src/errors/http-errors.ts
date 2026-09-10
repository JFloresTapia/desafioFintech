import { ApiError } from './api-error.js';

export class BadRequestError extends ApiError {
  constructor(message = 'Solicitud inválida') {
    super(400, message);
    this.name = 'BadRequestError';
  }
}

export class UnauthorizedError extends ApiError {
  constructor(message = 'No autorizado') {
    super(401, message);
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends ApiError {
  constructor(message = 'No tiene permisos para realizar esta acción') {
    super(403, message);
    this.name = 'ForbiddenError';
  }
}

export class NotFoundError extends ApiError {
  constructor(message = 'Recurso no encontrado') {
    super(404, message);
    this.name = 'NotFoundError';
  }
}