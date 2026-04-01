/**
 * Returns the base quiz context fields (streak, quizState, etc.) shared by all
 * quiz sections. Section-specific fields (e.g. `randomPokemons`,
 * `animationProgress`, `guesses`) should be spread on top by the caller:
 *
 * ```ts
 * { ...defaultQuizContext(initialPokemon), guesses: {} }
 * ```
 */
export function defaultQuizContext(randomPokemon?: {
	dexNumber: number;
	formName: string | null;
}) {
	return {
		streak: 0,
		quizState: "waiting" as const,
		finalStreak: 0,
		...(randomPokemon !== undefined && { randomPokemon }),
	};
}
