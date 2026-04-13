import type { InferSelectModel } from "drizzle-orm";
import type { pokemons } from "../db/schema";

export type Pokemon = InferSelectModel<typeof pokemons>;

export type PokemonContext = {
	_pokemonDexNumber: string;
	_pokemonFormName: string | null;
};

export type LoadPokemonsParams = {
	ids?: number[];
	dexNumbers?: number[];
};

export function buildPokemonsSearchParams(
	params?: LoadPokemonsParams,
): URLSearchParams {
	const searchParams = new URLSearchParams();
	if (params?.ids?.length) {
		searchParams.set("ids", params.ids.join(","));
	}
	if (params?.dexNumbers?.length) {
		searchParams.set("dex_numbers", params.dexNumbers.join(","));
	}
	return searchParams;
}
