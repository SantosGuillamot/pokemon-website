import type { PokemonStore } from "@pokemon-website/stores/pokemons";
import type { Pokemon, PokemonContext } from "@pokemon-website/types/pokemons";
import { getContext, store } from "@wordpress/interactivity";
import "@pokemon-website/stores/pokemons";

type SpeedsPokemon = {
	dexNumber: number;
	formName: string | null;
};

type PokemonSpeedsContext = {
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

store("pokemon/speeds", {
	actions: {
		randomizePokemons() {
			const context = getContext<PokemonSpeedsContext>("pokemon/speeds");
			const pokemons = Object.values(pokemonState.pokemons);
			if (pokemons.length < 2) return;
			const [pokemonA, pokemonB] = pickTwo(pokemons);
			context.randomPokemons = [
				{ dexNumber: pokemonA.dexNumber, formName: pokemonA.formName },
				{ dexNumber: pokemonB.dexNumber, formName: pokemonB.formName },
			];
		},
	},
	callbacks: {
		updateContext() {
			const context = getContext<PokemonSpeedsContext>("pokemon/speeds");
			if (!context || !context.randomPokemons?.length) return;
			const pokemon = context.randomPokemons[context.pokemonIndex];
			if (!pokemon) return;
			const pokemonContext = getContext<PokemonContext>("pokemon");
			pokemonContext._pokemonDexNumber = pokemon.dexNumber.toString();
			pokemonContext._pokemonFormName = pokemon.formName;
		},
	},
});
