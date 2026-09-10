import type { ApiErrorBody } from '../types/api';
import { readStoredToken } from './sessionStorage';

export const UNAUTHORIZED_EVENT = 'auth:unauthorized';

function resolveBaseUrl(): string {
  const configured = import.meta.env.VITE_API_BASE_URL;
  if (typeof configured === 'string' && configured.trim().length > 0) {
    return configured.replace(/\/$/, '');
  }
  return '';
}

export class ApiClientError extends Error {
  public readonly statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.name = 'ApiClientError';
    this.statusCode = statusCode;
  }
}

/**
 * Cliente HTTP único de la aplicación. Centraliza base URL, headers,
 * Authorization y el manejo de respuestas y errores. Ningún componente
 * realiza fetch directamente.
 */
export class ApiClient {
  constructor(
    private readonly baseUrl: string,
    private readonly getToken: () => string | null,
    private readonly onUnauthorized: () => void,
  ) {}

  async request<T>(path: string, init?: RequestInit): Promise<T> {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    const token = this.getToken();
    if (token !== null) headers.Authorization = `Bearer ${token}`;

    let response: Response;
    try {
      response = await fetch(`${this.baseUrl}${path}`, { ...init, headers });
    } catch {
      throw new ApiClientError(0, 'La API no está disponible');
    }

    const body = (await response.json().catch(() => null)) as ApiErrorBody | null;

    if (response.status === 401) {
      this.onUnauthorized();
    }

    if (!response.ok) {
      throw new ApiClientError(response.status, body?.message ?? `Error ${response.status}`);
    }

    return (body ?? undefined) as T;
  }
}

export const apiClient = new ApiClient(
  resolveBaseUrl(),
  readStoredToken,
  () => window.dispatchEvent(new CustomEvent(UNAUTHORIZED_EVENT)),
);