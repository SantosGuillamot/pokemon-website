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
	quizState: "waiting" | "revealing" | "correct" | "incorrect";
	pokemonIndex: number;
	randomPokemons: SpeedsPokemon[];
	sectionId: string;
	animationProgress: number;
	guessedIndex: number | null;
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
		get isGuessedCorrect() {
			const context = getContext<PokemonSpeedsContext>("pokemon/speeds");
			return (
				context.quizState === "correct" &&
				context.pokemonIndex === context.guessedIndex
			);
		},
		get isGuessedIncorrect() {
			const context = getContext<PokemonSpeedsContext>("pokemon/speeds");
			return (
				context.quizState === "incorrect" &&
				context.pokemonIndex === context.guessedIndex
			);
		},
		get displayedSpeed() {
			const context = getContext<PokemonSpeedsContext>("pokemon/speeds");
			const pokemonData = context.randomPokemons?.[context.pokemonIndex];
			if (!pokemonData) return 0;
			const pokemon = pokemonState.getPokemon(
				pokemonData.dexNumber,
				pokemonData.formName,
			);
			if (!pokemon) return 0;
			return Math.round(context.animationProgress * pokemon.speed);
		},
	},
	actions: {
		guessSpeed() {
			const context = getContext<PokemonSpeedsContext>("pokemon/speeds");
			const isCorrect =
				context.correctAnswer === "tie" ||
				context.correctAnswer === context.pokemonIndex;

			context.guessedIndex = context.pokemonIndex;
			context.quizState = "revealing";
			context.animationProgress = 0;

			const duration = 1000;
			const startTime = performance.now();

			const step = () => {
				const elapsed = performance.now() - startTime;
				const progress = Math.min(elapsed / duration, 1);
				context.animationProgress = 1 - (1 - progress) ** 3;
				if (progress < 1) {
					requestAnimationFrame(step);
				} else {
					if (isCorrect) {
						context.streak = (context.streak || 0) + 1;
						context.quizState = "correct";
						setTimeout(() => {
							const pokemons = Object.values(pokemonState.pokemons);
							if (pokemons.length < 2) return;
							const [a, b] = pickTwo(pokemons);
							context.randomPokemons = [
								{ dexNumber: a.dexNumber, formName: a.formName },
								{ dexNumber: b.dexNumber, formName: b.formName },
							];
							context.quizState = "waiting";
							context.animationProgress = 0;
							context.guessedIndex = null;
						}, 1000);
					} else {
						context.streak = 0;
						context.quizState = "incorrect";
					}
				}
			};

			requestAnimationFrame(step);
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
