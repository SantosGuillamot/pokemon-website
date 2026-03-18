import { Hono } from 'hono';
import { db } from '../db/client';
import { pokemon } from '../db/schema';
import { eq } from 'drizzle-orm';

const app = new Hono();

const route = app.get('/:id', async (c) => {
  const id = Number(c.req.param('id'));

  if (Number.isNaN(id)) {
    return c.json({ error: 'Invalid ID' }, 400);
  }

  const [found] = await db
    .select()
    .from(pokemon)
    .where(eq(pokemon.id, id));

  if (!found) {
    return c.json({ error: 'Pokemon not found' }, 404);
  }

  return c.json(found);
});

export type PokemonRouteType = typeof route;
export default app;
