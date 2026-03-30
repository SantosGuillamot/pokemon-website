import type { PokemonStore } from "@pokemon-website/stores/pokemons";
import type { Pokemon } from "@pokemon-website/types/pokemons";
import { getContext, store } from "@wordpress/interactivity";
import "@pokemon-website/stores/pokemons";

type SpeedsPokemon = {
	dexNumber: number;
	formName: string | null;
};

type PokemonContext = {
	_pokemonDexNumber: string;
	_pokemonFormName: string | null;
	pokemonIndex: number;
	randomPokemons: SpeedsPokemon[];
};

const { state: pokemonState } = store<PokemonStore>("pokemon", {});

function pickTwo(arr: Pokemon[]): [Pokemon, Pokemon] {
	const i = Math.floor(Math.random() * arr.length);
	let j: number;
	do {
		j = Math.floor(Math.random() * arr.length);
	} while (j === i);
	return [arr[i], arr[j]];
}

store("pokemon", {
	actions: {
		randomizePokemons() {
			console.log("Hola");
			const context = getContext<PokemonContext>("pokemon");
			const pokemons = Object.values(pokemonState.pokemons);
			if (pokemons.length === 0) return;
			const [pokemonA, pokemonB] = pickTwo(pokemons);
			context.randomPokemons = [
				{ dexNumber: pokemonA.dexNumber, formName: pokemonA.formName },
				{ dexNumber: pokemonB.dexNumber, formName: pokemonB.formName },
			];
		},
	},
	callbacks: {
		updateContext() {
			const context = getContext<PokemonContext>("pokemon");
			if (!context || !context.randomPokemons?.length) return;
			context._pokemonDexNumber =
				context.randomPokemons[context.pokemonIndex].dexNumber.toString();
			context._pokemonFormName =
				context.randomPokemons[context.pokemonIndex].formName;
		},
	},
});
