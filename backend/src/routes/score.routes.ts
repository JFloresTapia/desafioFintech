import { Router } from 'express';
import type { Container } from '../config/di.js';
import { ScoreController } from '../controllers/score.controller.js';
import { createAuthenticate } from '../middlewares/authenticate.js';
import { createAuthorizeScore } from '../middlewares/authorize-score.js';
import { scoreRateLimiter } from '../middlewares/rate-limiter.js';

export function createScoreRouter(container: Container): Router {
  const router = Router();
  const scoreController = new ScoreController(container.scoreService);

  router.get(
    '/score/:rut',
    scoreRateLimiter,
    createAuthenticate(container.jwtService),
    createAuthorizeScore(),
    (req, res) => {
      const response = scoreController.getScore(req);
      res.status(200).json(response);
    },
  );

  return router;
}