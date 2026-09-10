import type { Request } from 'express';
import type { AuthService } from '../services/auth.service.js';
import type { LoginResponse } from '../types/dtos.js';
import { validateLoginRequest } from '../validators/login.validator.js';

export class AuthController {
  constructor(private readonly authService: AuthService) {}

  async login(req: Request): Promise<LoginResponse> {
    const credentials = validateLoginRequest(req.body);
    return this.authService.authenticate(credentials);
  }
}