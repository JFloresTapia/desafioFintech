import { describe, expect, it } from 'vitest';
import request from 'supertest';
import { createApp } from '../../src/app.js';

const app = createApp();

describe('Documentación OpenAPI', () => {
  it('sirve la spec en GET /openapi.json con los dos endpoints', async () => {
    const res = await request(app).get('/openapi.json');

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toContain('application/json');
    expect(res.body.openapi).toBe('3.0.3');
    expect(res.body.info.title).toContain('Fintech');
    expect(Object.keys(res.body.paths)).toContain('/login');
    expect(Object.keys(res.body.paths)).toContain('/score/{rut}');
  });

  it('expone la UI de Swagger en GET /api-docs', async () => {
    const res = await request(app).get('/api-docs/');

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toContain('text/html');
    expect(res.text).toContain('swagger-ui');
  });

  it('responde 404 para GET /openapi.json en un método inexistente', async () => {
    const res = await request(app).post('/openapi.json');
    expect(res.status).toBe(404);
  });
});