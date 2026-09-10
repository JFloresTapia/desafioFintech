import { describe, expect, it } from 'vitest';
import { calculateDv, formatRutTyping, isValidRut, normalizeRut } from '../src/utils/rut';

describe('utils/rut (validación de UX del frontend)', () => {
  it('normaliza formatos equivalentes', () => {
    expect(normalizeRut('12.345.678-5')).toBe('12.345.678-5');
    expect(normalizeRut('12345678-5')).toBe('12.345.678-5');
    expect(normalizeRut('123456785')).toBe('12.345.678-5');
  });

  it('rechaza RUT con DV inválido', () => {
    expect(normalizeRut('12.345.678-9')).toBeNull();
    expect(isValidRut('12.345.678-9')).toBe(false);
  });

  it('acepta un RUT válido', () => {
    expect(isValidRut('11.111.111-1')).toBe(true);
  });

  it('calcula el dígito verificador', () => {
    expect(calculateDv('12345678')).toBe('5');
  });

  it('formatea en vivo mientras se escribe', () => {
    expect(formatRutTyping('1')).toBe('1');
    expect(formatRutTyping('123456')).toBe('12.345-6');
    expect(formatRutTyping('123456785')).toBe('12.345.678-5');
    expect(formatRutTyping('12.345.678-k')).toBe('12.345.678-K');
  });
});