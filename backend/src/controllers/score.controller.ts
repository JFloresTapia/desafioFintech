import type { Request } from 'express';
import type { ScoreService } from '../services/score.service.js';
import type { ScoreResponse } from '../types/dtos.js';

export class ScoreController {
  constructor(private readonly scoreService: ScoreService) {}

  getScore(req: Request): ScoreResponse {
    const rawRut = Array.isArray(req.params.rut) ? req.params.rut[0] : req.params.rut;
    return this.scoreService.getScore(rawRut ?? '');
  }
}