import { describe, expect, it } from 'vitest';
import { calculateDv, normalizeRut } from '../../src/utils/rut-utils.js';

describe('calculateDv', () => {
  it('calcula el DV para el cuerpo sin dígito verificador', () => {
    expect(calculateDv('12345678')).toBe('5');
    expect(calculateDv('11111111')).toBe('1');
    expect(calculateDv('22222222')).toBe('2');
    expect(calculateDv('99999999')).toBe('9');
  });
});

describe('normalizeRut', () => {
  it('acepta el formato canónico con puntos y guión', () => {
    expect(normalizeRut('12.345.678-5')).toBe('12.345.678-5');
  });

  it('normaliza formatos sin puntos y/o sin guión', () => {
    expect(normalizeRut('12345678-5')).toBe('12.345.678-5');
    expect(normalizeRut('123456785')).toBe('12.345.678-5');
  });

  it('normaliza RUT con DV K en mayúscula y minúscula', () => {
    expect(normalizeRut('12345670K')).toBe('12.345.670-K');
    expect(normalizeRut('12345670-k')).toBe('12.345.670-K');
  });

  it('rechaza un DV incorrecto (renderizado 12.345.678-9 es inválido)', () => {
    expect(normalizeRut('12.345.678-9')).toBeNull();
  });

  it('rechaza entradas sin formato de RUT', () => {
    expect(normalizeRut('')).toBeNull();
    expect(normalizeRut('hola')).toBeNull();
    expect(normalizeRut('12345')).toBeNull();
    expect(normalizeRut('1234567890-1')).toBeNull();
  });

  it('rechaza valores que no son string', () => {
    expect(normalizeRut(12345678 as unknown)).toBeNull();
    expect(normalizeRut(null)).toBeNull();
    expect(normalizeRut(undefined)).toBeNull();
  });
});