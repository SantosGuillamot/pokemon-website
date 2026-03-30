import type {
	LoadPokemonsParams,
	Pokemon,
} from "@pokemon-website/types/pokemons";
import { buildPokemonsSearchParams } from "@pokemon-website/types/pokemons";
import type { Type } from "@pokemon-website/types/types";
import { getConfig, getContext, store } from "@wordpress/interactivity";

type PokemonContext = {
	_pokemonDexNumber: string;
	_pokemonFormName: string | null;
};

export type PokemonStore = {
	state: {
		pokemons: Record<string, Pokemon>;
		_pokemonDexNumber: string;
		_pokemonFormName: string | null;
		pokemon: Pokemon | undefined;
		pokemonName: string;
		pokemonTypes: Type[];
	};
	actions: {
		loadPokemons: (params?: LoadPokemonsParams) => void;
	};
};

const { state } = store<PokemonStore>("pokemon", {
	state: {
		get _pokemonDexNumber(): string {
			const context = getContext<PokemonContext>("pokemon");
			console.log("Context", context);

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
