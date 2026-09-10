import jwt from 'jsonwebtoken';
import { isRole } from '../domain/role.js';
import type { AuthenticatedUser } from '../domain/user.js';
import { UnauthorizedError } from '../errors/http-errors.js';
import type { JwtPayload } from '../types/jwt-payload.js';

/**
 * Encapsula la emisión y verificación de JWT. Oculta la librería subyacente
 * (jsonwebtoken) al resto de la aplicación y traduce sus errores al modelo de
 * errores de dominio (UnauthorizedError), incluida la expiración.
 */
export class JwtService {
  constructor(
    private readonly secret: string,
    private readonly expiresIn: string,
  ) {}

  sign(payload: JwtPayload): string {
    const options: jwt.SignOptions = {
      expiresIn: this.expiresIn as jwt.SignOptions['expiresIn'],
    };
    return jwt.sign({ ...payload }, this.secret, options);
  }

  verify(token: string): JwtPayload {
    let decoded: unknown;
    try {
      decoded = jwt.verify(token, this.secret);
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new UnauthorizedError('La sesión ha expirado');
      }
      throw new UnauthorizedError('Token inválido');
    }
    if (!isJwtPayload(decoded)) {
      throw new UnauthorizedError('Token inválido');
    }
    return decoded;
  }

  toAuthenticatedUser(payload: JwtPayload): AuthenticatedUser {
    return {
      id: payload.sub,
      role: payload.role,
      ...(payload.rut !== undefined ? { rut: payload.rut } : {}),
    };
  }
}

function isJwtPayload(value: unknown): value is JwtPayload {
  if (typeof value !== 'object' || value === null) return false;
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.sub === 'string' &&
    candidate.sub.length > 0 &&
    isRole(candidate.role) &&
    (candidate.rut === undefined || typeof candidate.rut === 'string')
  );
}