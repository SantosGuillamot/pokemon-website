import { Hono } from 'hono';
import Layout from '../components/Layout.js';
import IndexPage from '../pages/IndexPage.js';

const app = new Hono();

app.get('/', (c) => {
  return c.html(
    <Layout scripts={['/public/js/index-store.js']}>
      <IndexPage />
    </Layout>
  );
});

export default app;
