import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiClient, ApiClientError, UNAUTHORIZED_EVENT } from '../src/services/apiClient';

function jsonResponse(status: number, body: unknown): Response {
  return {
    status,
    ok: status >= 200 && status < 300,
    json: async () => body,
  } as unknown as Response;
}

describe('ApiClient', () => {
  const fetchMock = vi.fn();
  const onUnauthorized = vi.fn();

  beforeEach(() => {
    fetchMock.mockReset();
    onUnauthorized.mockReset();
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  const createClient = (token: string | null = null): ApiClient =>
    new ApiClient('', () => token, onUnauthorized);

  it('agrega Authorization cuando existe token y parsea la respuesta', async () => {
    fetchMock.mockResolvedValue(jsonResponse(200, { score: 33 }));

    const result = await createClient('mi-token').request<{ score: number }>('/score/x');

    const [url, init] = fetchMock.mock.calls[0] ?? [];
    expect(url).toBe('/score/x');
    expect((init as RequestInit).headers).toMatchObject({ Authorization: 'Bearer mi-token' });
    expect(result).toEqual({ score: 33 });
  });

  it('omite Authorization cuando no hay token', async () => {
    fetchMock.mockResolvedValue(jsonResponse(200, {}));

    await createClient(null).request('/x');

    const [, init] = fetchMock.mock.calls[0] ?? [];
    expect((init as RequestInit).headers).not.toHaveProperty('Authorization');
  });

  it('lanza ApiClientError y notifica al 401', async () => {
    fetchMock.mockResolvedValue(
      jsonResponse(401, { statusCode: 401, message: 'La sesión ha expirado' }),
    );

    const error = await createClient()
      .request('/score/x')
      .catch((err: unknown) => err);

    expect(error).toBeInstanceOf(ApiClientError);
    expect((error as ApiClientError).statusCode).toBe(401);
    expect(onUnauthorized).toHaveBeenCalledTimes(1);
  });

  it('propaga el mensaje del servidor en errores como 403', async () => {
    fetchMock.mockResolvedValue(jsonResponse(403, { statusCode: 403, message: 'Prohibido' }));

    const error = await createClient()
      .request('/score/x')
      .catch((err: unknown) => err);

    expect(error).toBeInstanceOf(ApiClientError);
    expect((error as ApiClientError).statusCode).toBe(403);
    expect((error as ApiClientError).message).toBe('Prohibido');
    expect(onUnauthorized).not.toHaveBeenCalled();
  });

  it('traduce una falla de red a ApiClientError sin notificar 401', async () => {
    fetchMock.mockRejectedValue(new TypeError('fetch failed'));

    const error = await createClient()
      .request('/score/x')
      .catch((err: unknown) => err);

    expect(error).toBeInstanceOf(ApiClientError);
    expect((error as ApiClientError).statusCode).toBe(0);
    expect((error as ApiClientError).message).toBe('La API no está disponible');
    expect(onUnauthorized).not.toHaveBeenCalled();
  });
});

describe('apiClient (singleton) — evento de sesión no autorizada', () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('dispara el evento global auth:unauthorized ante un 401', async () => {
    fetchMock.mockResolvedValue(jsonResponse(401, { statusCode: 401, message: 'x' }));

    const listener = vi.fn();
    window.addEventListener(UNAUTHORIZED_EVENT, listener);

    const { apiClient } = await import('../src/services/apiClient');
    await apiClient.request('/score/x').catch(() => undefined);

    expect(listener).toHaveBeenCalledTimes(1);
    window.removeEventListener(UNAUTHORIZED_EVENT, listener);
  });
});