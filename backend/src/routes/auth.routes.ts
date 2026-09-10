import { Router } from 'express';
import type { Container } from '../config/di.js';
import { AuthController } from '../controllers/auth.controller.js';
import { loginRateLimiter } from '../middlewares/rate-limiter.js';

export function createAuthRouter(container: Container): Router {
  const router = Router();
  const authController = new AuthController(container.authService);

  router.post('/login', loginRateLimiter, async (req, res) => {
    const response = await authController.login(req);
    res.status(200).json(response);
  });

  return router;
}