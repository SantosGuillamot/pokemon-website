import { and, asc, desc, eq, inArray } from "drizzle-orm";
import { Hono } from "hono";
import { db } from "../db/client";
import { pokemons } from "../db/schema";

const app = new Hono();

const route = app
	.get("/", async (c) => {
		const idsParam = c.req.query("ids");
		const dexNumbersParam = c.req.query("dex_numbers");

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

		const list = await db
			.select()
			.from(pokemons)
			.where(conditions.length > 0 ? and(...conditions) : undefined)
			.orderBy(
				asc(pokemons.dexNumber),
				desc(pokemons.isDefault),
				asc(pokemons.id),
			);

		return c.json(list);
	})
	.get("/:dexNumber", async (c) => {
		const dexNumber = Number(c.req.param("dexNumber"));

		if (Number.isNaN(dexNumber)) {
			return c.json({ error: "Invalid dex number" }, 400);
		}

		const list = await db
			.select()
			.from(pokemons)
			.where(eq(pokemons.dexNumber, dexNumber))
			.orderBy(asc(pokemons.dexNumber), desc(pokemons.isDefault));

		if (list.length === 0) {
			return c.json({ error: "Pokemon not found" }, 404);
		}

		return c.json(list);
	});

export type PokemonRouteType = typeof route;
export default app;
