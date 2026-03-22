import type {
	LoadPokemonsParams,
	Pokemon,
} from "@pokemon-website/types/pokemon";
import { setServerState } from "iapi-ssr-processor";
import api from "../api/index.js";

export async function loadPokemons(params?: LoadPokemonsParams): Promise<void> {
	const searchParams = new URLSearchParams();
	if (params?.ids?.length) {
		searchParams.set("ids", params.ids.join(","));
	}
	if (params?.limit !== undefined) {
		searchParams.set("limit", String(params.limit));
	}
	if (params?.offset !== undefined) {
		searchParams.set("offset", String(params.offset));
	}

	const query = searchParams.toString();
	const url = query ? `/api/pokemon?${query}` : "/api/pokemon";
	const res = await api.request(url);
	if (res.ok) {
		const pokemons = (await res.json()) as Pokemon[];
		const pokemonsMap: Record<string, Pokemon> = {};
		for (const pokemon of pokemons) {
			pokemonsMap[String(pokemon.id)] = pokemon;
		}
		setServerState("pokemon", { pokemons: pokemonsMap });
	}
}
