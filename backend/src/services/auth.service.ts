import type { LoginRequest, LoginResponse } from '../types/dtos.js';
import type { JwtPayload } from '../types/jwt-payload.js';
import type { UserRepository } from '../repositories/user.repository.js';
import type { JwtService } from './jwt.service.js';
import { BadRequestError, UnauthorizedError } from '../errors/http-errors.js';
import { normalizeRut } from '../utils/rut-utils.js';
import { comparePassword } from '../utils/password.js';

export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
    private readonly jwtExpiresIn: string,
  ) {}

  async authenticate(request: LoginRequest): Promise<LoginResponse> {
    const normalized = normalizeRut(request.rut);
    if (normalized === null) {
      throw new BadRequestError('RUT inválido');
    }

    const user = await this.userRepository.findByRut(normalized);
    if (user === null) {
      throw new UnauthorizedError('Credenciales inválidas');
    }

    const passwordsMatch = await comparePassword(request.password, user.passwordHash);
    if (!passwordsMatch) {
      throw new UnauthorizedError('Credenciales inválidas');
    }

    const payload: JwtPayload = {
      sub: user.id,
      role: user.role,
      ...(user.role === 'user' ? { rut: user.rut } : {}),
    };

    return {
      token: this.jwtService.sign(payload),
      expiresIn: this.jwtExpiresIn,
      user: { id: user.id, rut: user.rut, role: user.role },
    };
  }
}