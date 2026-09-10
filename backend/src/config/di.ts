import { env } from './env.js';
import { mockUsers } from '../data/mock-users.js';
import { MockUserRepository } from '../repositories/mock-user.repository.js';
import { JwtService } from '../services/jwt.service.js';
import { AuthService } from '../services/auth.service.js';
import { ScoreService } from '../services/score.service.js';
import { Fnv1aScoreCalculator } from '../utils/score-calculator.js';
import type { UserRepository } from '../repositories/user.repository.js';

export interface Container {
  userRepository: UserRepository;
  authService: AuthService;
  scoreService: ScoreService;
  jwtService: JwtService;
}

/**
 * Composition root: construye el grafo de dependencias de la aplicación.
 * Es el único lugar donde se "sabe" qué implementaciones concretas existen.
 */
export function createContainer(): Container {
  const userRepository = new MockUserRepository(mockUsers);
  const jwtService = new JwtService(env.jwtSecret, env.jwtExpiresIn);
  const authService = new AuthService(userRepository, jwtService, env.jwtExpiresIn);
  const scoreService = new ScoreService(new Fnv1aScoreCalculator());
  return { userRepository, authService, scoreService, jwtService };
}