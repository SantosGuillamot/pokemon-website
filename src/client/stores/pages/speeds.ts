import type { PokemonStore } from "@pokemon-website/stores/pokemons";
import type { PokemonContext } from "@pokemon-website/types/pokemons";
import { getContext, getElement, store } from "@wordpress/interactivity";
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
	finalStreak: number;
	// Guess Speed
	randomPokemon: SpeedsPokemon | null;
	speedGuess: string;
	correctSpeed: number | null;
};

const { state: pokemonState } = store<PokemonStore>("pokemon", {});

function toSpeedsPokemon(p: { dexNumber: number; formName: string | null }): SpeedsPokemon {
	return { dexNumber: p.dexNumber, formName: p.formName };
}

function randomize(context: PokemonSpeedsContext) {
	const pokemons = pokemonState.getRandomPokemons(2);
	if (pokemons.length < 2) return;
	context.randomPokemons = pokemons.map(toSpeedsPokemon);
}

function randomizeSingle(context: PokemonSpeedsContext) {
	const pokemons = pokemonState.getRandomPokemons(1);
	if (pokemons.length < 1) return;
	context.randomPokemon = toSpeedsPokemon(pokemons[0]);
}

function resetQuizState(context: PokemonSpeedsContext) {
	context.streak = 0;
	context.quizState = "waiting";
	context.animationProgress = 0;
}

function getDisplayedSpeed(pokemonData: SpeedsPokemon | null | undefined, animationProgress: number): number {
	if (!pokemonData) return 0;
	const pokemon = pokemonState.getPokemon(
		pokemonData.dexNumber,
		pokemonData.formName,
	);
	if (!pokemon) return 0;
	return Math.round(animationProgress * pokemon.speed);
}

function syncPokemonContext(data: SpeedsPokemon) {
	const pokemonContext = getContext<PokemonContext>("pokemon");
	pokemonContext._pokemonDexNumber = data.dexNumber.toString();
	pokemonContext._pokemonFormName = data.formName;
}

function revealAnswer(
	context: PokemonSpeedsContext,
	isCorrect: boolean,
	onNextRound: () => void,
) {
	context.quizState = "revealing";
	context.animationProgress = 0;

	const prefersReducedMotion = window.matchMedia(
		"(prefers-reduced-motion: reduce)",
	).matches;

	if (prefersReducedMotion) {
		context.animationProgress = 1;
		if (isCorrect) {
			context.streak += 1;
			context.quizState = "correct";
			setTimeout(() => {
				onNextRound();
				context.quizState = "waiting";
				context.animationProgress = 0;
			}, 1000);
		} else {
			context.finalStreak = context.streak;
			context.streak = 0;
			context.quizState = "incorrect";
		}
		return;
	}

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
				context.streak += 1;
				context.quizState = "correct";
				setTimeout(() => {
					onNextRound();
					context.quizState = "waiting";
					context.animationProgress = 0;
				}, 1000);
			} else {
				context.finalStreak = context.streak;
				context.streak = 0;
				context.quizState = "incorrect";
			}
		}
	};

	requestAnimationFrame(step);
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
		get isIncorrect() {
			const context = getContext<PokemonSpeedsContext>("pokemon/speeds");
			return context.quizState === "incorrect";
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
			return getDisplayedSpeed(
				context.randomPokemons?.[context.pokemonIndex],
				context.animationProgress,
			);
		},
		get displayedGuessSpeed() {
			const context = getContext<PokemonSpeedsContext>("pokemon/speeds");
			return getDisplayedSpeed(
				context.randomPokemon,
				context.animationProgress,
			);
		},
		get isCorrect() {
			const context = getContext<PokemonSpeedsContext>("pokemon/speeds");
			return context.quizState === "correct";
		},
	},
	actions: {
		guessSpeed() {
			const context = getContext<PokemonSpeedsContext>("pokemon/speeds");
			if (context.quizState !== "waiting") return;

			const isCorrect =
				context.correctAnswer === "tie" ||
				context.correctAnswer === context.pokemonIndex;

			context.guessedIndex = context.pokemonIndex;
			revealAnswer(context, isCorrect, () => {
				randomize(context);
				context.guessedIndex = null;
			});
		},
		restart() {
			const context = getContext<PokemonSpeedsContext>("pokemon/speeds");
			randomize(context);
			resetQuizState(context);
			context.guessedIndex = null;
		},
		updateSpeedGuess() {
			const context = getContext<PokemonSpeedsContext>("pokemon/speeds");
			const { ref } = getElement();
			context.speedGuess = (ref as HTMLInputElement).value;
		},
		submitGuessSpeed(event: SubmitEvent) {
			event.preventDefault();
			const context = getContext<PokemonSpeedsContext>("pokemon/speeds");
			const guess = parseInt(context.speedGuess, 10);
			if (Number.isNaN(guess) || context.quizState !== "waiting") return;

			const isCorrect = guess === context.correctSpeed;

			revealAnswer(context, isCorrect, () => {
				randomizeSingle(context);
				context.speedGuess = "";
			});
		},
		restartGuessSpeed() {
			const context = getContext<PokemonSpeedsContext>("pokemon/speeds");
			randomizeSingle(context);
			resetQuizState(context);
			context.speedGuess = "";
		},
		selectSection() {
			const ctx = getContext<PokemonSpeedsContext>("pokemon/speeds");
			ctx.currentSection = ctx.sectionId;
		},
	},
	callbacks: {
		updateContext() {
			const context = getContext<PokemonSpeedsContext>("pokemon/speeds");
			if (!context || !context.randomPokemons?.length) return;
			const pokemon = context.randomPokemons[context.pokemonIndex];
			if (!pokemon) return;
			syncPokemonContext(pokemon);
		},
		storeAnswer() {
			const context = getContext<PokemonSpeedsContext>("pokemon/speeds");
			if (!context.randomPokemons?.length) return;
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
		updateGuessSpeedContext() {
			const context = getContext<PokemonSpeedsContext>("pokemon/speeds");
			if (!context.randomPokemon) return;
			syncPokemonContext(context.randomPokemon);
		},
		storeGuessSpeedAnswer() {
			const context = getContext<PokemonSpeedsContext>("pokemon/speeds");
			if (!context.randomPokemon) return;
			const pokemon = pokemonState.getPokemon(
				context.randomPokemon.dexNumber,
				context.randomPokemon.formName,
			);
			if (!pokemon) return;
			context.correctSpeed = pokemon.speed;
		},
	},
});
