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
	quizState: "waiting" | "correct" | "retry";
	guesses: Record<string, number>;
	finalStreak: number;
	draggedTypeId: number | null;
	selectedTypeId: number | null;
	isDragOver?: boolean;
	// Fill chart game
	chartGuesses: Record<string, number>;
	chartState: "waiting" | "checked";
	// Per-type context
	typeId?: number;
	// Per-bar context
	barMultiplier?: number;
	// Per-chart-cell context
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
		get isCorrect() {
			const context = getContext<PokemonTypesContext>("pokemon/types");
			return context.quizState === "correct";
		},
		get isRetry() {
			const context = getContext<PokemonTypesContext>("pokemon/types");
			return context.quizState === "retry";
		},
		get isIncorrect() {
			// Always false — the weakness game uses "retry" instead of "incorrect",
			// so QuizStatus always shows the streak, never GAME OVER.
			return false;
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
		// Source icon getters
		get isTypePlaced() {
			const context = getContext<PokemonTypesContext>("pokemon/types");
			const guess = context.guesses?.[String(context.typeId)];
			return guess != null && guess !== 1;
		},
		get isTypeSelected() {
			const context = getContext<PokemonTypesContext>("pokemon/types");
			return context.selectedTypeId === context.typeId;
		},
		// Bar getter
		get isTypeInCurrentBar() {
			const context = getContext<PokemonTypesContext>("pokemon/types");
			const guess = context.guesses?.[String(context.typeId)];
			return guess === context.barMultiplier;
		},
		// Source type missed (should have been placed but wasn't)
		get isSourceTypeMissed() {
			const context = getContext<PokemonTypesContext>("pokemon/types");
			if (context.quizState === "waiting") return false;
			const guess = context.guesses?.[String(context.typeId)];
			if (guess != null && guess !== 1) return false;
			if (!context.randomPokemon) return false;
			const pokemon = pokemonState.getPokemon(
				context.randomPokemon.dexNumber,
				context.randomPokemon.formName,
			);
			if (!pokemon) return false;
			const correct = computeEffectiveness(pokemon.typeIds);
			return (correct[String(context.typeId)] ?? 1) !== 1;
		},
		// Per-type result getters (used by bar icons)
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
		get isDragOver() {
			const context = getContext<PokemonTypesContext>("pokemon/types");
			return context.isDragOver === true;
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
		// Drag and drop
		startDrag(event: DragEvent) {
			const context = getContext<PokemonTypesContext>("pokemon/types");
			if (context.quizState !== "waiting") return;
			context.draggedTypeId = context.typeId ?? null;
			context.selectedTypeId = null;
			if (event.dataTransfer) {
				event.dataTransfer.effectAllowed = "move";
			}
		},
		dragEnd() {
			const context = getContext<PokemonTypesContext>("pokemon/types");
			context.draggedTypeId = null;
		},
		dragEnterBar() {
			const context = getContext<PokemonTypesContext>("pokemon/types");
			if (context.quizState !== "waiting" || context.draggedTypeId == null)
				return;
			context.isDragOver = true;
		},
		dragLeaveBar() {
			const context = getContext<PokemonTypesContext>("pokemon/types");
			context.isDragOver = false;
		},
		allowDrop(event: DragEvent) {
			event.preventDefault();
			if (event.dataTransfer) {
				event.dataTransfer.dropEffect = "move";
			}
		},
		dropOnBar(event: DragEvent) {
			event.preventDefault();
			const context = getContext<PokemonTypesContext>("pokemon/types");
			if (context.draggedTypeId == null || context.quizState !== "waiting")
				return;
			const typeId = String(context.draggedTypeId);
			const multiplier = context.barMultiplier ?? 1;
			context.guesses = {
				...context.guesses,
				[typeId]: multiplier,
			};
			context.isDragOver = false;
			context.draggedTypeId = null;
		},
		dropOnSource(event: DragEvent) {
			event.preventDefault();
			const context = getContext<PokemonTypesContext>("pokemon/types");
			if (context.draggedTypeId == null || context.quizState !== "waiting")
				return;
			const typeId = String(context.draggedTypeId);
			const newGuesses = { ...context.guesses };
			delete newGuesses[typeId];
			context.guesses = newGuesses;
			context.isDragOver = false;
			context.draggedTypeId = null;
		},
		// Click interactions
		selectSourceType() {
			const context = getContext<PokemonTypesContext>("pokemon/types");
			if (context.quizState !== "waiting") return;
			const typeId = context.typeId ?? null;
			context.selectedTypeId =
				context.selectedTypeId === typeId ? null : typeId;
		},
		clickBar() {
			const context = getContext<PokemonTypesContext>("pokemon/types");
			if (context.quizState !== "waiting" || context.selectedTypeId == null)
				return;
			const typeId = String(context.selectedTypeId);
			const multiplier = context.barMultiplier ?? 1;
			context.guesses = {
				...context.guesses,
				[typeId]: multiplier,
			};
			context.selectedTypeId = null;
		},
		removeFromBar(event: Event) {
			event.stopPropagation();
			const context = getContext<PokemonTypesContext>("pokemon/types");
			if (context.quizState !== "waiting") return;
			const typeId = String(context.typeId);
			const newGuesses = { ...context.guesses };
			delete newGuesses[typeId];
			context.guesses = newGuesses;
		},
		handleKeydown(event: KeyboardEvent) {
			if (event.key === "Enter" || event.key === " ") {
				event.preventDefault();
				const { ref } = getElement();
				if (ref) ref.click();
			}
		},
		// Weakness game
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
			} else {
				context.streak = 0;
				context.quizState = "retry";
			}
			context.selectedTypeId = null;
		},
		nextPokemon() {
			const context = getContext<PokemonTypesContext>("pokemon/types");
			if (context.quizState !== "correct") return;
			randomizeSingle(context);
			context.guesses = {};
			context.quizState = "waiting";
			context.selectedTypeId = null;
			context.draggedTypeId = null;
		},
		tryAgainWeakness() {
			const context = getContext<PokemonTypesContext>("pokemon/types");
			if (context.quizState !== "retry") return;
			context.guesses = {};
			context.quizState = "waiting";
			context.selectedTypeId = null;
			context.draggedTypeId = null;
		},
		// Full restart — callable from any state via QuizStatus.
		restartWeakness() {
			const context = getContext<PokemonTypesContext>("pokemon/types");
			randomizeSingle(context);
			context.streak = 0;
			context.quizState = "waiting";
			context.guesses = {};
			context.selectedTypeId = null;
			context.draggedTypeId = null;
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
		storeWeaknessAnswer() {},
	},
});
