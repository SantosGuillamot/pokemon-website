import type { PokemonStore } from "@pokemon-website/stores/pokemons";
import { getContext, store } from "@wordpress/interactivity";
import "@pokemon-website/stores/pokemons";
import "../data-table.js";
import {
	isCurrentSection,
	isIncorrect,
	isWaiting,
	type QuizPokemon,
	selectSection,
	syncPokemonContext,
} from "@pokemon-website/stores/quiz-utils";

type PokemonSpecialAttackContext = {
	correctAnswer: number | "tie" | null;
	currentSection: string;
	streak: number;
	quizState: "waiting" | "revealing" | "correct" | "incorrect";
	pokemonIndex: number;
	randomPokemons: QuizPokemon[];
	sectionId: string;
	animationProgress: number;
	guessedIndex: number | null;
	finalStreak: number;
};

const { state: pokemonState } = store<PokemonStore>("pokemon", {});

function toQuizPokemon(p: {
	dexNumber: number;
	formName: string | null;
}): QuizPokemon {
	return { dexNumber: p.dexNumber, formName: p.formName };
}

function randomize(context: PokemonSpecialAttackContext) {
	const pokemons = pokemonState.getRandomPokemons(2);
	if (pokemons.length < 2) return;
	context.randomPokemons = pokemons.map(toQuizPokemon);
}

function resetQuizState(context: PokemonSpecialAttackContext) {
	context.streak = 0;
	context.quizState = "waiting";
	context.animationProgress = 0;
}

function getDisplayedSpAttack(
	pokemonData: QuizPokemon | null | undefined,
	animationProgress: number,
): number {
	if (!pokemonData) return 0;
	const pokemon = pokemonState.getPokemon(
		pokemonData.dexNumber,
		pokemonData.formName,
	);
	if (!pokemon) return 0;
	return Math.round(animationProgress * pokemon.spAttack);
}

function revealAnswer(
	context: PokemonSpecialAttackContext,
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

store("pokemon/special-attack", {
	state: {
		get isCurrentSection() {
			return isCurrentSection("pokemon/special-attack");
		},
		get isWaiting() {
			return isWaiting("pokemon/special-attack");
		},
		get isIncorrect() {
			return isIncorrect("pokemon/special-attack");
		},
		get isGuessedCorrect() {
			const context = getContext<PokemonSpecialAttackContext>(
				"pokemon/special-attack",
			);
			return (
				context.quizState === "correct" &&
				context.pokemonIndex === context.guessedIndex
			);
		},
		get isGuessedIncorrect() {
			const context = getContext<PokemonSpecialAttackContext>(
				"pokemon/special-attack",
			);
			return (
				context.quizState === "incorrect" &&
				context.pokemonIndex === context.guessedIndex
			);
		},
		get displayedSpAttack() {
			const context = getContext<PokemonSpecialAttackContext>(
				"pokemon/special-attack",
			);
			return getDisplayedSpAttack(
				context.randomPokemons?.[context.pokemonIndex],
				context.animationProgress,
			);
		},
	},
	actions: {
		guessSpAttack() {
			const context = getContext<PokemonSpecialAttackContext>(
				"pokemon/special-attack",
			);
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
			const context = getContext<PokemonSpecialAttackContext>(
				"pokemon/special-attack",
			);
			randomize(context);
			resetQuizState(context);
			context.guessedIndex = null;
		},
		selectSection() {
			selectSection("pokemon/special-attack");
		},
	},
	callbacks: {
		updateContext() {
			const context = getContext<PokemonSpecialAttackContext>(
				"pokemon/special-attack",
			);
			if (!context || !context.randomPokemons?.length) return;
			const pokemon = context.randomPokemons[context.pokemonIndex];
			if (!pokemon) return;
			syncPokemonContext(pokemon);
		},
		storeAnswer() {
			const context = getContext<PokemonSpecialAttackContext>(
				"pokemon/special-attack",
			);
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
			if (pokemonA.spAttack === pokemonB.spAttack) {
				context.correctAnswer = "tie";
			} else {
				context.correctAnswer = pokemonA.spAttack > pokemonB.spAttack ? 0 : 1;
			}
		},
	},
});
