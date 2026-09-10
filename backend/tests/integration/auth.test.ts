import { describe, expect, it } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { createApp } from '../../src/app.js';

type DecodedToken = { sub: string; role: string; rut?: string };

const app = createApp();

function decodeToken(token: string): DecodedToken {
  const decoded = jwt.decode(token);
  if (decoded === null || typeof decoded === 'string') {
    throw new Error('El token no pudo decodificarse');
  }
  return decoded as DecodedToken;
}

describe('POST /login', () => {
  it('autentica a un usuario user y devuelve un JWT con sub, role y rut', async () => {
    const res = await request(app)
      .post('/login')
      .send({ rut: '12.345.678-5', password: 'password' });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeTypeOf('string');
    expect(res.body.expiresIn).toBeTypeOf('string');
    expect(res.body.user).toEqual({
      id: 'user-001',
      rut: '12.345.678-5',
      role: 'user',
    });

    const payload = decodeToken(res.body.token);
    expect(payload.sub).toBe('user-001');
    expect(payload.role).toBe('user');
    expect(payload.rut).toBe('12.345.678-5');
  });

  it('autentica a un usuario admin sin incluir rut en el token', async () => {
    const res = await request(app)
      .post('/login')
      .send({ rut: '99.999.999-9', password: 'admin123' });

    expect(res.status).toBe(200);
    const payload = decodeToken(res.body.token);
    expect(payload.sub).toBe('admin-001');
    expect(payload.role).toBe('admin');
    expect(payload.rut).toBeUndefined();
  });

  it('nunca expone el hash o password en la respuesta', async () => {
    const res = await request(app)
      .post('/login')
      .send({ rut: '12.345.678-5', password: 'password' });

    const serialized = JSON.stringify(res.body);
    expect(serialized).not.toContain('password');
    expect(serialized).not.toContain('$2b$');
  });

  it('rechaza credenciales incorrectas con 401 y mensaje genérico', async () => {
    const res = await request(app)
      .post('/login')
      .send({ rut: '12.345.678-5', password: 'clave-incorrecta' });

    expect(res.status).toBe(401);
    expect(res.body).toEqual({ statusCode: 401, message: 'Credenciales inválidas' });
  });

  it('rechaza un RUT no registrado con el mismo mensaje genérico (sin enumeración)', async () => {
    const res = await request(app)
      .post('/login')
      .send({ rut: '11.111.111-1', password: 'password' });

    expect(res.status).toBe(401);
    expect(res.body).toEqual({ statusCode: 401, message: 'Credenciales inválidas' });
  });

  it('rechaza un body sin los campos requeridos con 400', async () => {
    const res = await request(app).post('/login').send({});

    expect(res.status).toBe(400);
    expect(res.body.statusCode).toBe(400);
  });

  it('rechaza un RUT inválido con 400', async () => {
    const res = await request(app)
      .post('/login')
      .send({ rut: '12.345.678-9', password: 'password' });

    expect(res.status).toBe(400);
    expect(res.body).toMatchObject({ statusCode: 400, message: 'RUT inválido' });
  });

  it('responde 404 para GET /login', async () => {
    const res = await request(app).get('/login');
    expect(res.status).toBe(404);
    expect(res.body.statusCode).toBe(404);
  });
});