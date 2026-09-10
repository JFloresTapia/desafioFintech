import { Router } from 'express';
import type { Container } from '../config/di.js';
import { createAuthRouter } from './auth.routes.js';
import { createScoreRouter } from './score.routes.js';

export function createRoutes(container: Container): Router {
  const router = Router();
  router.use(createAuthRouter(container));
  router.use(createScoreRouter(container));
  return router;
}