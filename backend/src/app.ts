import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import type { Express } from 'express';
import swaggerUi from 'swagger-ui-express';
import { createContainer, type Container } from './config/di.js';
import { env } from './config/env.js';
import { errorHandler } from './middlewares/error-handler.js';
import { notFoundHandler } from './middlewares/not-found.js';
import { openApiSpec } from './openapi/spec.js';
import { createRoutes } from './routes/index.js';

export function createApp(container: Container = createContainer()): Express {
  const app = express();

  app.use(helmet());
  app.use(cors({ origin: env.corsOrigin }));
  app.use(express.json());

  app.use(createRoutes(container));

  app.get('/openapi.json', (_req, res) => {
    res.json(openApiSpec);
  });
  app.use(
    '/api-docs',
    swaggerUi.serve,
    swaggerUi.setup(openApiSpec as Parameters<typeof swaggerUi.setup>[0], {
      customSiteTitle: 'ProntoPaga · Score API',
    }),
  );

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}