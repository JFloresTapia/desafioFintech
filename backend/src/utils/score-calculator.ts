/**
 * Abstracción del algoritmo que produce el score financiero a partir de un RUT canónico.
 * Permite reemplazar el cálculo por una base de datos, servicio externo o modelo de
 * scoring sin modificar Service ni Controller (Dependency Inversion).
 */
export interface ScoreCalculator {
  calculate(rut: string): number;
}

const FNV32_OFFSET_BASIS = 2166136261;
const FNV32_PRIME = 16777619;
const SCORE_MAX = 100;

function fnv1a32(input: string): number {
  let hash = FNV32_OFFSET_BASIS;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, FNV32_PRIME);
  }
  return hash >>> 0;
}

/**
 * Implementación determinista basada en el hash FNV-1a de 32 bits.
 * Mismo RUT normalizado -> mismo hash -> mismo score (0-100).
 */
export class Fnv1aScoreCalculator implements ScoreCalculator {
  calculate(rut: string): number {
    return fnv1a32(rut) % (SCORE_MAX + 1);
  }
}