import type {
	LoadPokemonsParams,
	Pokemon,
	PokemonContext,
} from "@pokemon-website/types/pokemons";
import { buildPokemonsSearchParams } from "@pokemon-website/types/pokemons";
import type { Type } from "@pokemon-website/types/types";
import { getContext, getServerData, setServerState } from "iapi-ssr-processor";

import api from "./api/index.js";

type PokemonState = {
	pokemons: Pokemon[];
	_pokemonDexNumber: string;
	_pokemonFormName: string | null;
	pokemon: Pokemon | undefined;
	pokemonName: string;
	pokemonTypes: Type[];
};

export async function loadPokemons(params?: LoadPokemonsParams): Promise<void> {
	const query = buildPokemonsSearchParams(params).toString();
	const url = query ? `/api/pokemons?${query}` : "/api/pokemons";
	const res = await api.request(url);
	if (res.ok) {
		const pokemons = (await res.json()) as Pokemon[];
		const state = setServerState("pokemon", {
			pokemons,
			get _pokemonDexNumber(): string {
				const context = getContext<PokemonContext>("pokemon");
				return context ? context._pokemonDexNumber : state._pokemonDexNumber;
			},
			get _pokemonFormName(): string | null {
				const context = getContext<PokemonContext>("pokemon");
				return context ? context._pokemonFormName : state._pokemonFormName;
			},
			get pokemon(): Pokemon | undefined {
				const dexNumber = Number(state._pokemonDexNumber);
				const formName = state._pokemonFormName || null;
				return Object.values(state.pokemons).find(
					(p) => p.dexNumber === dexNumber && p.formName === formName,
				);
			},
			get pokemonName(): string {
				const pokemon = state.pokemon;
				if (!pokemon) return "";
				return pokemon.name.replaceAll("-", " ");
			},
			get pokemonTypes(): Type[] {
				const pokemon = state.pokemon;
				if (!pokemon) return [];
				const { config } = getServerData();
				console.log("Config in pokemonTypes getter:", config);
				return pokemon.typeIds
					.map((id) => config.pokemon.types[String(id)])
					.filter((t): t is Type => t !== undefined);
			},
		}) as PokemonState;
	}
}
