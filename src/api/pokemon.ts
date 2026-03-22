import { asc, eq, inArray } from "drizzle-orm";
import { Hono } from "hono";
import { db } from "../db/client";
import { pokemon } from "../db/schema";

const app = new Hono();

const route = app
	.get("/", async (c) => {
		const idsParam = c.req.query("ids");

		if (idsParam) {
			const ids = idsParam
				.split(",")
				.map(Number)
				.filter((n) => !Number.isNaN(n));

			if (ids.length === 0) {
				return c.json([]);
			}

			const list = await db
				.select()
				.from(pokemon)
				.where(inArray(pokemon.id, ids))
				.orderBy(asc(pokemon.id));

			return c.json(list);
		}

		const rawLimit = Number(c.req.query("limit"));
		const limit = Number.isNaN(rawLimit)
			? 20
			: Math.max(0, Math.min(100, rawLimit));
		const rawOffset = Number(c.req.query("offset"));
		const offset = Number.isNaN(rawOffset) ? 0 : Math.max(0, rawOffset);

		const list = await db
			.select()
			.from(pokemon)
			.orderBy(asc(pokemon.id))
			.limit(limit)
			.offset(offset);

		return c.json(list);
	})
	.get("/:id", async (c) => {
		const id = Number(c.req.param("id"));

		if (Number.isNaN(id)) {
			return c.json({ error: "Invalid ID" }, 400);
		}

		const [found] = await db.select().from(pokemon).where(eq(pokemon.id, id));

		if (!found) {
			return c.json({ error: "Pokemon not found" }, 404);
		}

		return c.json(found);
	});

export type PokemonRouteType = typeof route;
export default app;
