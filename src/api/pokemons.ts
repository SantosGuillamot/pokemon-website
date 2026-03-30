import { and, asc, desc, eq, inArray } from "drizzle-orm";
import { Hono } from "hono";
import { db } from "../db/client";
import { pokemons } from "../db/schema";

const app = new Hono();

const route = app
	.get("/", async (c) => {
		const idsParam = c.req.query("ids");
		const dexNumbersParam = c.req.query("dex_numbers");
		const inChampionsParam = c.req.query("in_champions");

		const rawLimit = Number(c.req.query("limit"));
		const limit = Number.isNaN(rawLimit)
			? 20
			: Math.max(0, Math.min(100, rawLimit));
		const rawOffset = Number(c.req.query("offset"));
		const offset = Number.isNaN(rawOffset) ? 0 : Math.max(0, rawOffset);

		const conditions = [];

		if (idsParam) {
			const ids = idsParam
				.split(",")
				.map(Number)
				.filter((n) => !Number.isNaN(n));

			if (ids.length === 0) {
				return c.json({ error: "Invalid ids" }, 400);
			}

			if (ids.length > 100) {
				return c.json({ error: "Too many ids (max 100)" }, 400);
			}

			conditions.push(inArray(pokemons.id, ids));
		}

		if (dexNumbersParam) {
			const dexNumbers = dexNumbersParam
				.split(",")
				.map(Number)
				.filter((n) => !Number.isNaN(n));

			if (dexNumbers.length === 0) {
				return c.json({ error: "Invalid dex_numbers" }, 400);
			}

			if (dexNumbers.length > 100) {
				return c.json({ error: "Too many dex_numbers (max 100)" }, 400);
			}

			conditions.push(inArray(pokemons.dexNumber, dexNumbers));
		}

		if (inChampionsParam === "true") {
			conditions.push(eq(pokemons.inChampions, true));
		}

		const list = await db
			.select()
			.from(pokemons)
			.where(conditions.length > 0 ? and(...conditions) : undefined)
			.orderBy(
				asc(pokemons.dexNumber),
				desc(pokemons.isDefault),
				asc(pokemons.id),
			)
			.limit(limit)
			.offset(offset);

		return c.json(list);
	})
	.get("/:dexNumber", async (c) => {
		const dexNumber = Number(c.req.param("dexNumber"));
		const inChampionsParam = c.req.query("in_champions");

		if (Number.isNaN(dexNumber)) {
			return c.json({ error: "Invalid dex number" }, 400);
		}

		const conditions = [eq(pokemons.dexNumber, dexNumber)];

		if (inChampionsParam === "true") {
			conditions.push(eq(pokemons.inChampions, true));
		}

		const list = await db
			.select()
			.from(pokemons)
			.where(and(...conditions))
			.orderBy(asc(pokemons.dexNumber), desc(pokemons.isDefault));

		if (list.length === 0) {
			return c.json({ error: "Pokemon not found" }, 404);
		}

		return c.json(list);
	});

export type PokemonRouteType = typeof route;
export default app;
