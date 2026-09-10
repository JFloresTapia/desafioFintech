import { beforeAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import { createApp } from '../../src/app.js';
import { env } from '../../src/config/env.js';
import { JwtService } from '../../src/services/jwt.service.js';

const app = createApp();

let userToken: string;
let adminToken: string;

async function login(rut: string, password: string): Promise<string> {
  const res = await request(app).post('/login').send({ rut, password });
  if (res.status !== 200) {
    throw new Error(`Login de prueba falló: ${JSON.stringify(res.body)}`);
  }
  return res.body.token as string;
}

beforeAll(async () => {
  userToken = await login('12.345.678-5', 'password');
  adminToken = await login('99.999.999-9', 'admin123');
});

describe('GET /score/:rut — autenticación (JWT)', () => {
  it('rechaza la petición sin token con 401', async () => {
    const res = await request(app).get('/score/12.345.678-5');
    expect(res.status).toBe(401);
    expect(res.body.statusCode).toBe(401);
  });

  it('rechaza un header Authorization sin formato Bearer', async () => {
    const res = await request(app)
      .get('/score/12.345.678-5')
      .set('Authorization', 'Basic abc123');
    expect(res.status).toBe(401);
  });

  it('rechaza un token malformado', async () => {
    const res = await request(app)
      .get('/score/12.345.678-5')
      .set('Authorization', 'Bearer token-invalido');
    expect(res.status).toBe(401);
  });

  it('rechaza un token con firma alterada', async () => {
    const tampered = new JwtService('secreto-distinto-para-el-test-2026', '1h').sign({
      sub: 'user-001',
      role: 'user',
      rut: '12.345.678-5',
    });
    const res = await request(app)
      .get('/score/12.345.678-5')
      .set('Authorization', `Bearer ${tampered}`);
    expect(res.status).toBe(401);
  });

  it('rechaza un token expirado', async () => {
    const expired = new JwtService(env.jwtSecret, '-10s').sign({
      sub: 'user-001',
      role: 'user',
      rut: '12.345.678-5',
    });
    const res = await request(app)
      .get('/score/12.345.678-5')
      .set('Authorization', `Bearer ${expired}`);
    expect(res.status).toBe(401);
    expect(res.body.message).toBe('La sesión ha expirado');
  });
});

describe('GET /score/:rut — autorización (RBAC)', () => {
  it('permite a user consultar su propio RUT', async () => {
    const res = await request(app)
      .get('/score/12.345.678-5')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      rut: '12.345.678-5',
      score: expect.any(Number),
    });
    expect(res.body.score).toBeGreaterThanOrEqual(0);
    expect(res.body.score).toBeLessThanOrEqual(100);
    expect(res.body.fecha).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
  });

  it('prohíbe a user consultar un RUT de otro', async () => {
    const res = await request(app)
      .get('/score/11.111.111-1')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(403);
    expect(res.body).toEqual({
      statusCode: 403,
      message: 'El usuario no tiene permisos para consultar este RUT',
    });
  });

  it('rechaza con 400 el RUT malformado para user', async () => {
    const res = await request(app)
      .get('/score/no-es-un-rut')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(400);
    expect(res.body.statusCode).toBe(400);
  });

  it('permite a admin consultar cualquier RUT', async () => {
    const res1 = await request(app)
      .get('/score/12.345.678-5')
      .set('Authorization', `Bearer ${adminToken}`);
    const res2 = await request(app)
      .get('/score/11.111.111-1')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res1.status).toBe(200);
    expect(res2.status).toBe(200);
    expect(res2.body.rut).toBe('11.111.111-1');
  });

  it('rechaza con 400 el RUT malformado para admin', async () => {
    const res = await request(app)
      .get('/score/12345')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(400);
    expect(res.body.statusCode).toBe(400);
  });
});

describe('GET /score/:rut — score determinista', () => {
  it('devuelve el mismo score en consultas repetidas', async () => {
    const call = (): Promise<number> =>
      request(app)
        .get('/score/12.345.678-5')
        .set('Authorization', `Bearer ${userToken}`)
        .then((res) => res.body.score as number);

    expect(await call()).toBe(await call());
  });

  it('normaliza el RUT de la respuesta aunque venga en otro formato', async () => {
    const res = await request(app)
      .get('/score/123456785')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(res.body.rut).toBe('12.345.678-5');
  });
});

describe('Rutas inexistentes', () => {
  it('responde 404 con el shape de error', async () => {
    const res = await request(app)
      .get('/ruta-inexistente')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(404);
    expect(res.body.statusCode).toBe(404);
  });
});