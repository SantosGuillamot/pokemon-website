import type { PokemonStore } from "@pokemon-website/stores/pokemons";
import type { Type } from "@pokemon-website/types/types";
import {
	getConfig,
	getContext,
	getElement,
	store,
} from "@wordpress/interactivity";
import "@pokemon-website/stores/pokemons";
import {
	isCurrentSection,
	isIncorrect,
	isWaiting,
	type QuizPokemon,
	randomizeSingle,
	selectSection,
	syncPokemonContext,
} from "@pokemon-website/stores/quiz-utils";

type PokemonTypesContext = {
	currentSection: string;
	sectionId: string;
	// Weakness game
	randomPokemon: QuizPokemon | null;
	streak: number;
	quizState: "waiting" | "correct" | "incorrect";
	guesses: Record<string, number>;
	finalStreak: number;
	// Fill chart game
	chartGuesses: Record<string, number>;
	chartState: "waiting" | "checked";
	// Per-type-row context (injected by TypeRow)
	typeId?: number;
	// Per-chart-cell context (injected by ChartCell)
	atkTypeId?: number;
	defTypeId?: number;
};

const { state: pokemonState } = store<PokemonStore>("pokemon", {});

function computeEffectiveness(
	pokemonTypeIds: number[],
): Record<string, number> {
	const cfg = getConfig("pokemon") as { types: Record<string, Type> };
	const allTypes = cfg.types;
	const result: Record<string, number> = {};
	for (const atkTypeIdStr of Object.keys(allTypes)) {
		const atkTypeId = Number(atkTypeIdStr);
		let multiplier = 1;
		for (const defTypeId of pokemonTypeIds) {
			const defType = allTypes[String(defTypeId)];
			if (!defType) continue;
			if (defType.defenseNoEffect.includes(atkTypeId)) {
				multiplier *= 0;
			} else if (defType.defenseNotVeryEffective.includes(atkTypeId)) {
				multiplier *= 0.5;
			} else if (defType.defenseVeryEffective.includes(atkTypeId)) {
				multiplier *= 2;
			}
		}
		result[atkTypeIdStr] = multiplier;
	}
	return result;
}

function getTypeMatchup(
	atkTypeId: number,
	defTypeId: number,
	cfg?: { types: Record<string, Type> },
): number {
	const { types } =
		cfg ?? (getConfig("pokemon") as { types: Record<string, Type> });
	const atkType = types[String(atkTypeId)];
	if (!atkType) return 1;
	if (atkType.attackNoEffect.includes(defTypeId)) return 0;
	if (atkType.attackNotVeryEffective.includes(defTypeId)) return 0.5;
	if (atkType.attackVeryEffective.includes(defTypeId)) return 2;
	return 1;
}

/**
 * Single pass over all type pairs to compute both score and total,
 * excluding neutral (correct === 1) cells to match the green highlights.
 */
function computeChartResults(chartGuesses: Record<string, number>): {
	score: number;
	total: number;
} {
	const cfg = getConfig("pokemon") as { types: Record<string, Type> };
	const typeIds = Object.keys(cfg.types).map(Number);
	let score = 0;
	let total = 0;
	for (const atkId of typeIds) {
		for (const defId of typeIds) {
			const correct = getTypeMatchup(atkId, defId, cfg);
			if (correct === 1) continue;
			total++;
			const key = `${atkId}-${defId}`;
			if ((chartGuesses[key] ?? 1) === correct) score++;
		}
	}
	return { score, total };
}

store("pokemon/types", {
	state: {
		get isCurrentSection() {
			return isCurrentSection("pokemon/types");
		},
		get isWaiting() {
			return isWaiting("pokemon/types");
		},
		get isIncorrect() {
			return isIncorrect("pokemon/types");
		},
		get correctCount() {
			const context = getContext<PokemonTypesContext>("pokemon/types");
			if (context.quizState === "waiting" || !context.randomPokemon) return 0;
			const pokemon = pokemonState.getPokemon(
				context.randomPokemon.dexNumber,
				context.randomPokemon.formName,
			);
			if (!pokemon) return 0;
			const correct = computeEffectiveness(pokemon.typeIds);
			return Object.keys(correct).filter(
				(typeId) => (context.guesses?.[typeId] ?? 1) === correct[typeId],
			).length;
		},
		// Per-type-row getters
		get typeGuessValue() {
			const context = getContext<PokemonTypesContext>("pokemon/types");
			const guess = context.guesses?.[String(context.typeId)] ?? 1;
			return String(guess);
		},
		get isTypeResultCorrect() {
			const context = getContext<PokemonTypesContext>("pokemon/types");
			if (context.quizState === "waiting") return false;
			if (!context.randomPokemon) return false;
			const pokemon = pokemonState.getPokemon(
				context.randomPokemon.dexNumber,
				context.randomPokemon.formName,
			);
			if (!pokemon) return false;
			const correct = computeEffectiveness(pokemon.typeIds);
			const guess = context.guesses?.[String(context.typeId)] ?? 1;
			return guess === (correct[String(context.typeId)] ?? 1);
		},
		get isTypeResultIncorrect() {
			const context = getContext<PokemonTypesContext>("pokemon/types");
			if (context.quizState === "waiting") return false;
			if (!context.randomPokemon) return false;
			const pokemon = pokemonState.getPokemon(
				context.randomPokemon.dexNumber,
				context.randomPokemon.formName,
			);
			if (!pokemon) return false;
			const correct = computeEffectiveness(pokemon.typeIds);
			const guess = context.guesses?.[String(context.typeId)] ?? 1;
			return guess !== (correct[String(context.typeId)] ?? 1);
		},
		get typeCorrectLabel() {
			const context = getContext<PokemonTypesContext>("pokemon/types");
			if (context.quizState === "waiting" || !context.randomPokemon) return "";
			const pokemon = pokemonState.getPokemon(
				context.randomPokemon.dexNumber,
				context.randomPokemon.formName,
			);
			if (!pokemon) return "";
			const correct = computeEffectiveness(pokemon.typeIds);
			const multiplier = correct[String(context.typeId)] ?? 1;
			const labels: Record<number, string> = {
				1: "\u2014",
				0: "0",
				0.25: "\u00bc",
				0.5: "\u00bd",
				2: "2",
				4: "4",
			};
			return labels[multiplier] ?? "\u2014";
		},
		// Fill chart getters
		get isChartWaiting() {
			const context = getContext<PokemonTypesContext>("pokemon/types");
			return context.chartState === "waiting";
		},
		get chartGuessValue() {
			const context = getContext<PokemonTypesContext>("pokemon/types");
			const key = `${context.atkTypeId}-${context.defTypeId}`;
			const guess = context.chartGuesses?.[key] ?? 1;
			return String(guess);
		},
		get isChartCellCorrect() {
			const context = getContext<PokemonTypesContext>("pokemon/types");
			if (context.chartState === "waiting") return false;
			const key = `${context.atkTypeId}-${context.defTypeId}`;
			const guess = context.chartGuesses?.[key] ?? 1;
			const correct = getTypeMatchup(
				context.atkTypeId ?? 0,
				context.defTypeId ?? 0,
			);
			// Exclude normal-effectiveness (1) cells from highlighting to avoid
			// turning 200+ neutral cells green, which would be visually noisy.
			return guess === correct && correct !== 1;
		},
		get isChartCellIncorrect() {
			const context = getContext<PokemonTypesContext>("pokemon/types");
			if (context.chartState === "waiting") return false;
			const key = `${context.atkTypeId}-${context.defTypeId}`;
			const guess = context.chartGuesses?.[key] ?? 1;
			const correct = getTypeMatchup(
				context.atkTypeId ?? 0,
				context.defTypeId ?? 0,
			);
			return guess !== correct;
		},
		get chartScore() {
			const context = getContext<PokemonTypesContext>("pokemon/types");
			if (context.chartState === "waiting") return 0;
			return computeChartResults(context.chartGuesses).score;
		},
		get chartTotal() {
			return computeChartResults({}).total;
		},
	},
	actions: {
		selectSection() {
			selectSection("pokemon/types");
		},
		setTypeGuess() {
			const context = getContext<PokemonTypesContext>("pokemon/types");
			if (context.quizState !== "waiting") return;
			const { ref } = getElement();
			const value = parseFloat((ref as HTMLSelectElement).value);
			const typeId = String(context.typeId);
			context.guesses = { ...context.guesses, [typeId]: value };
		},
		submitWeaknessGuess() {
			const context = getContext<PokemonTypesContext>("pokemon/types");
			if (context.quizState !== "waiting" || !context.randomPokemon) return;
			const pokemon = pokemonState.getPokemon(
				context.randomPokemon.dexNumber,
				context.randomPokemon.formName,
			);
			if (!pokemon) return;
			const correct = computeEffectiveness(pokemon.typeIds);
			const allCorrect = Object.keys(correct).every(
				(typeId) => (context.guesses?.[typeId] ?? 1) === correct[typeId],
			);
			if (allCorrect) {
				context.streak += 1;
				context.quizState = "correct";
				setTimeout(() => {
					randomizeSingle(context);
					context.guesses = {};
					context.quizState = "waiting";
				}, 1500);
			} else {
				context.finalStreak = context.streak;
				context.streak = 0;
				context.quizState = "incorrect";
			}
		},
		restartWeakness() {
			const context = getContext<PokemonTypesContext>("pokemon/types");
			randomizeSingle(context);
			context.streak = 0;
			context.quizState = "waiting";
			context.guesses = {};
		},
		// Fill chart actions
		setChartGuess() {
			const context = getContext<PokemonTypesContext>("pokemon/types");
			if (context.chartState !== "waiting") return;
			const { ref } = getElement();
			const value = parseFloat((ref as HTMLSelectElement).value);
			const key = `${context.atkTypeId}-${context.defTypeId}`;
			context.chartGuesses = {
				...context.chartGuesses,
				[key]: value,
			};
		},
		submitChartGuess() {
			const context = getContext<PokemonTypesContext>("pokemon/types");
			if (context.chartState !== "waiting") return;
			context.chartState = "checked";
		},
		restartChart() {
			const context = getContext<PokemonTypesContext>("pokemon/types");
			context.chartGuesses = {};
			context.chartState = "waiting";
		},
	},
	callbacks: {
		updateWeaknessContext() {
			const context = getContext<PokemonTypesContext>("pokemon/types");
			if (!context.randomPokemon) return;
			syncPokemonContext(context.randomPokemon);
		},
		storeWeaknessAnswer() {
			// This callback runs when context changes. We don't need to pre-compute
			// the answer since we compute it on-demand in submitWeaknessGuess.
			// But we keep it as a hook point for future use.
		},
	},
});
