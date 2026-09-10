import { describe, expect, it } from 'vitest';
import jwt from 'jsonwebtoken';
import { JwtService } from '../../src/services/jwt.service.js';
import { UnauthorizedError } from '../../src/errors/http-errors.js';

const SECRET = 'test-secret-para-vitest-2026';

describe('JwtService', () => {
  const service = new JwtService(SECRET, '1h');

  it('firma un token que contiene sub, role y rut', () => {
    const token = service.sign({ sub: 'user-001', role: 'user', rut: '12.345.678-5' });
    const decoded = jwt.decode(token);
    expect(typeof token).toBe('string');
    expect(token.split('.')).toHaveLength(3);
    expect(decoded).toMatchObject({
      sub: 'user-001',
      role: 'user',
      rut: '12.345.678-5',
    });
  });

  it('firma un token sin rut cuando el rol es admin', () => {
    const token = service.sign({ sub: 'admin-001', role: 'admin' });
    const decoded = jwt.decode(token);
    expect(decoded).toMatchObject({ sub: 'admin-001', role: 'admin' });
    expect((decoded as Record<string, unknown>).rut).toBeUndefined();
  });

  it('verifica un token válido y devuelve el payload', () => {
    const token = service.sign({ sub: 'user-001', role: 'user', rut: '12.345.678-5' });
    expect(service.verify(token)).toMatchObject({
      sub: 'user-001',
      role: 'user',
      rut: '12.345.678-5',
    });
  });

  it('rechaza un token con firma alterada', () => {
    const other = new JwtService('otro-secreto-muy-distinto-2026', '1h');
    const foreign = other.sign({ sub: 'user-001', role: 'user' });
    expect(() => service.verify(foreign)).toThrow(UnauthorizedError);
  });

  it('rechaza un token expirado', () => {
    const expired = new JwtService(SECRET, '-10s').sign({ sub: 'user-001', role: 'user' });
    expect(() => service.verify(expired)).toThrow('La sesión ha expirado');
  });

  it('rechaza un token cuyo payload no tiene la forma esperada', () => {
    const malformed = jwt.sign({ sub: 'user-001' }, SECRET, { expiresIn: '1h' });
    expect(() => service.verify(malformed)).toThrow(UnauthorizedError);
  });
});