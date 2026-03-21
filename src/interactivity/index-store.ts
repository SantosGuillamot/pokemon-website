import { getElement, store } from "@wordpress/interactivity";

export type PokemonStore = {
	state: {
		pokemon: {
			name: string;
		};
	};
};

const { state } = store("pokemon", {
	state: {
		pokemonId: "1",
		pokemon: {
			name: "Pikachu",
		},
	},
	actions: {
		updateId: () => {
			const { ref } = getElement();
			state.pokemonId = (ref as HTMLInputElement).value;
		},
		*fetchPokemon(): Generator {
			const res: Response = yield fetch(`/api/pokemon/${state.pokemonId}`);
			if (res.ok) {
				const data: { name: string } = yield res.json();
				state.pokemon.name = data.name;
			} else {
				state.pokemon.name = "Not found";
			}
		},
	},
});
