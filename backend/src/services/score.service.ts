import type { ScoreResponse } from '../types/dtos.js';
import type { ScoreCalculator } from '../utils/score-calculator.js';
import { validateRut } from '../validators/rut.validator.js';
import { BadRequestError } from '../errors/http-errors.js';

export class ScoreService {
  constructor(private readonly calculator: ScoreCalculator) {}

  getScore(rut: string): ScoreResponse {
    const validation = validateRut(rut);
    if (!validation.valid || validation.normalized === undefined) {
      throw new BadRequestError('RUT inválido');
    }

    const normalized = validation.normalized;
    const score = this.calculator.calculate(normalized);

    return {
      rut: normalized,
      score,
      fecha: new Date().toISOString(),
    };
  }
}