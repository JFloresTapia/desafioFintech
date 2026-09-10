import { describe, expect, it } from 'vitest';
import { Fnv1aScoreCalculator } from '../../src/utils/score-calculator.js';
import { calculateDv, normalizeRut } from '../../src/utils/rut-utils.js';

function buildValidRuts(count: number): string[] {
  const ruts: string[] = [];
  for (let i = 0; i < count; i += 1) {
    const body = String(10000000 + i * 37);
    const dv = calculateDv(body);
    const normalized = normalizeRut(`${body}${dv}`);
    if (normalized !== null) ruts.push(normalized);
  }
  return ruts;
}

describe('Fnv1aScoreCalculator', () => {
  const calculator = new Fnv1aScoreCalculator();

  it('es determinista: mismo RUT, mismo score', () => {
    const ruts = buildValidRuts(20);
    for (const rut of ruts) {
      expect(calculator.calculate(rut)).toBe(calculator.calculate(rut));
    }
  });

  it('retorna siempre un score entre 0 y 100', () => {
    const ruts = buildValidRuts(50);
    for (const rut of ruts) {
      const score = calculator.calculate(rut);
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    }
  });

  it('produce scores distintos para RUT distintos (distribución)', () => {
    const ruts = buildValidRuts(30);
    const scores = new Set(ruts.map((rut) => calculator.calculate(rut)));
    expect(scores.size).toBeGreaterThan(1);
  });

  it('produce el mismo score para formatos equivalentes del mismo RUT', () => {
    const canonical = normalizeRut('12.345.678-5');
    const withoutDots = normalizeRut('12345678-5');
    if (canonical === null || withoutDots === null) throw new Error('RUT inválido de prueba');
    expect(canonical).toBe(withoutDots);
    expect(calculator.calculate(canonical)).toBe(calculator.calculate(withoutDots));
  });
});