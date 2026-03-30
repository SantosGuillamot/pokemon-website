import type {
	LoadPokemonsParams,
	Pokemon,
} from "@pokemon-website/types/pokemons";
import type { Type } from "@pokemon-website/types/types";
import { getConfig, getContext, store } from "@wordpress/interactivity";

type PokemonContext = {
	_pokemonId: string;
};

export type PokemonStore = {
	state: {
		pokemons: Record<string, Pokemon>;
		_pokemonId: string;
		pokemon: Pokemon | undefined;
		pokemonTypes: Type[];
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
		get _pokemonId(): string {
			const context = getContext<PokemonContext>("pokemon");
			return context ? context._pokemonId : state._pokemonId;
		},
		get pokemon(): Pokemon | undefined {
			return state.pokemons[state._pokemonId];
		},
		get pokemonTypes(): Type[] {
			const pokemon = state.pokemon;
			if (!pokemon) return [];
			const config = getConfig("pokemon") as {
				types: Record<string, Type>;
			};
			return pokemon.typeIds
				.map((id) => config.types[String(id)])
				.filter((t): t is Type => t !== undefined);
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
