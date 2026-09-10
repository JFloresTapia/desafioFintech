import { createApp } from './app.js';
import { createContainer } from './config/di.js';
import { env } from './config/env.js';
import { logger } from './utils/logger.js';

const app = createApp(createContainer());

app.listen(env.port, () => {
  logger.info(`API disponible en http://localhost:${env.port} (entorno: ${env.nodeEnv})`);
});