import type {
	LoadPokemonsParams,
	Pokemon,
} from "@pokemon-website/types/pokemons";
import { buildPokemonsSearchParams } from "@pokemon-website/types/pokemons";
import { setServerState } from "iapi-ssr-processor";
import api from "./api/index.js";

export async function loadPokemons(params?: LoadPokemonsParams): Promise<void> {
	const query = buildPokemonsSearchParams(params).toString();
	const url = query ? `/api/pokemons?${query}` : "/api/pokemons";
	const res = await api.request(url);
	if (res.ok) {
		const pokemons = (await res.json()) as Pokemon[];
		const state = setServerState("pokemon", {
			pokemons,
			get pokemon(): Pokemon | undefined {
				return state.pokemons[state.pokemonId];
			},
		}) as { pokemons: Record<string, Pokemon>; pokemonId: string };
	}
}
