import 'dotenv/config';

export interface AppEnv {
  nodeEnv: string;
  isProduction: boolean;
  port: number;
  jwtSecret: string;
  jwtExpiresIn: string;
  corsOrigin: string | string[];
}

function parsePort(raw: string | undefined): number {
  const port = Number(raw ?? '3000');
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error(`Configuración inválida: PORT="${raw ?? ''}" no es un puerto válido.`);
  }
  return port;
}

function parseCorsOrigin(raw: string | undefined): string | string[] {
  if (raw === undefined || raw.trim() === '') {
    return 'http://localhost:5173';
  }
  return raw
    .split(',')
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0);
}

function assertSecret(): void {
  const secret = process.env.JWT_SECRET;
  if (process.env.NODE_ENV === 'test') return;
  if (secret === undefined || secret.trim() === '') {
    throw new Error(
      'Configuración inválida: falta la variable de entorno JWT_SECRET. Copia .env.example a .env.',
    );
  }
  if (secret.length < 16) {
    throw new Error('Configuración inválida: JWT_SECRET debe tener al menos 16 caracteres.');
  }
}

assertSecret();

export const env: AppEnv = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  isProduction: process.env.NODE_ENV === 'production',
  port: parsePort(process.env.PORT),
  jwtSecret: process.env.JWT_SECRET ?? 'test-secret-para-vitest-2026',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '1h',
  corsOrigin: parseCorsOrigin(process.env.CORS_ORIGIN),
};