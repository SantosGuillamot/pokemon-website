import { Hono } from 'hono';
import Layout from '../components/Layout.js';
import IndexPage from '../pages/IndexPage.js';

const app = new Hono();

app.get('/', (c) => {
  return c.html(
    <Layout>
      <IndexPage />
    </Layout>
  );
});

export default app;
