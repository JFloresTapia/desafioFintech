import { env } from '../config/env.js';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

function chooseMethod(level: LogLevel, message: string, meta?: unknown): void {
  const prefix = `[${new Date().toISOString()}] [${level.toUpperCase()}] ${message}`;
  const details = meta instanceof Error ? (meta.stack ?? meta.message) : JSON.stringify(meta);
  const output = meta === undefined ? prefix : `${prefix} ${details}`;
  if (level === 'error') console.error(output);
  else if (level === 'warn') console.warn(output);
  else console.log(output);
}

export const logger = {
  debug: (message: string, meta?: unknown): void => {
    if (!env.isProduction) chooseMethod('debug', message, meta);
  },
  info: (message: string, meta?: unknown): void => chooseMethod('info', message, meta),
  warn: (message: string, meta?: unknown): void => chooseMethod('warn', message, meta),
  error: (message: string, meta?: unknown): void => chooseMethod('error', message, meta),
};