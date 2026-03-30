import type {
	LoadPokemonsParams,
	Pokemon,
} from "@pokemon-website/types/pokemons";
import { buildPokemonsSearchParams } from "@pokemon-website/types/pokemons";
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

const { state } = store<PokemonStore>("pokemon", {
	state: {
		get _pokemonId(): string {
			const context = getContext<PokemonContext>("pokemon");
			return context ? context._pokemonId : state._pokemonId;
		},
		get pokemon(): Pokemon | undefined {
			const dexNumber = Number(state._pokemonId);
			return Object.values(state.pokemons).find(
				(p) => p.dexNumber === dexNumber,
			);
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
			const searchParams = buildPokemonsSearchParams(params);
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
