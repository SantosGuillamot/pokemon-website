import type { InferSelectModel } from "drizzle-orm";
import type { pokemons } from "../db/schema";

export type Pokemon = InferSelectModel<typeof pokemons>;

export type LoadPokemonsParams = {
	ids?: number[];
	limit?: number;
	offset?: number;
};
