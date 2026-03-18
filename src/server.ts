import 'dotenv/config';
import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { registerMiddleware } from './middleware.js';
import routes from './routes/index.js';
import api from './api/index.js';

const app = new Hono();

registerMiddleware(app);

app.route('/', routes);
app.route('/', api);

const port = Number(process.env['PORT'] ?? 3000);

serve({ fetch: app.fetch, port }, () => {
  console.log(`Server running at http://localhost:${port}`);
});

export default app;
