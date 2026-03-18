import type { Hono } from 'hono';
import { logger } from 'hono/logger';
import { secureHeaders } from 'hono/secure-headers';
import { serveStatic } from '@hono/node-server/serve-static';

export function registerMiddleware(app: Hono): void {
  app.use(logger());
  app.use(secureHeaders());

  app.use('/public/*', serveStatic({ root: './' }));

  app.onError((err, c) => {
    console.error(err);
    const message =
      process.env['NODE_ENV'] === 'production'
        ? 'Internal Server Error'
        : err.message;
    return c.text(message, 500);
  });
}
