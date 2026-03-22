import type { Pokemon } from "@pokemon-website/types/pokemon";
import { store } from "@wordpress/interactivity";

export type PokemonStore = {
	state: {
		pokemons: Record<string, Pokemon>;
		pokemonId: string;
		pokemon: Pokemon | undefined;
	};
};

const { state } = store("pokemon", {
	state: {
		pokemons: {} as Record<string, Pokemon>,
		pokemonId: "",
		get pokemon(): Pokemon | undefined {
			return state.pokemons[state.pokemonId];
		},
},
	actions: {
		*loadPokemons(): Generator {
			const res: Response = yield fetch("/api/pokemon");
			if (res.ok) {
				const data: Pokemon[] = yield res.json();
				for (const pokemon of data) {
					state.pokemons[String(pokemon.id)] = pokemon;
				}
			}
		},
	},
});
