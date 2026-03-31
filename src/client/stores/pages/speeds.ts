import type { PokemonStore } from "@pokemon-website/stores/pokemons";
import type { Pokemon, PokemonContext } from "@pokemon-website/types/pokemons";
import { getContext, store } from "@wordpress/interactivity";
import "@pokemon-website/stores/pokemons";

type SpeedsPokemon = {
	dexNumber: number;
	formName: string | null;
};

type PokemonSpeedsContext = {
	correctAnswer: number | "tie" | null;
	currentSection: string;
	streak: number;
	quizState: "waiting" | "correct" | "incorrect";
	pokemonIndex: number;
	randomPokemons: SpeedsPokemon[];
	sectionId: string;
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
	state: {
		get isCurrentSection() {
			const context = getContext<PokemonSpeedsContext>("pokemon/speeds");
			return context.currentSection === context.sectionId;
		},
		get isWaiting() {
			const context = getContext<PokemonSpeedsContext>("pokemon/speeds");
			return context.quizState === "waiting";
		},
	},
	actions: {
		guessSpeed() {
			const context = getContext<PokemonSpeedsContext>("pokemon/speeds");
			if (
				context.correctAnswer === "tie" ||
				context.correctAnswer === context.pokemonIndex
			) {
				context.streak = (context.streak || 0) + 1;
				context.quizState = "correct";
			} else {
				context.streak = 0;
				context.quizState = "incorrect";
			}
		},
		selectSection() {
			const ctx = getContext<PokemonSpeedsContext>("pokemon/speeds");
			ctx.currentSection = ctx.sectionId;
		},
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
		storeAnswer() {
			const context = getContext<PokemonSpeedsContext>("pokemon/speeds");
			const pokemonA = pokemonState.getPokemon(
				context.randomPokemons[0].dexNumber,
				context.randomPokemons[0].formName,
			);
			const pokemonB = pokemonState.getPokemon(
				context.randomPokemons[1].dexNumber,
				context.randomPokemons[1].formName,
			);
			if (!pokemonA || !pokemonB) return;
			if (pokemonA.speed === pokemonB.speed) {
				context.correctAnswer = "tie";
			} else {
				context.correctAnswer = pokemonA.speed > pokemonB.speed ? 0 : 1;
			}
		},
	},
});
