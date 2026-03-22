import type {
	LoadPokemonsParams,
	Pokemon,
} from "@pokemon-website/types/pokemons";
import { store } from "@wordpress/interactivity";

export type PokemonStore = {
	state: {
		pokemons: Record<string, Pokemon>;
		pokemonId: string;
		pokemon: Pokemon | undefined;
	};
	actions: {
		loadPokemons: (params?: LoadPokemonsParams) => void;
	};
};

function buildSearchParams(params?: LoadPokemonsParams): URLSearchParams {
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
	return searchParams;
}

const { state } = store<PokemonStore>("pokemon", {
	state: {
		pokemons: {} as Record<string, Pokemon>,
		get pokemon(): Pokemon | undefined {
			return state.pokemons[state.pokemonId];
		},
	},
	actions: {
		*loadPokemons(params?: LoadPokemonsParams): Generator {
			const searchParams = buildSearchParams(params);
			const url = searchParams.toString()
				? `/api/pokemons?${searchParams}`
				: "/api/pokemons";
			const res: Response = yield fetch(url);
			if (res.ok) {
				const data: Pokemon[] = yield res.json();
				for (const pokemon of data) {
					state.pokemons[String(pokemon.id)] = pokemon;
				}
			}
		},
	},
});
