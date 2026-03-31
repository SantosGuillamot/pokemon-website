/**
 * Pick a random element from an array and return its dexNumber and formName.
 */
export function pickRandomPokemon(
	pokemons: { dexNumber: number; formName: string | null }[],
): { dexNumber: number; formName: string | null } {
	const pokemon = pokemons[Math.floor(Math.random() * pokemons.length)];
	return { dexNumber: pokemon.dexNumber, formName: pokemon.formName };
}

/**
 * Pick two distinct random elements from an array.
 * Requires arr.length >= 2.
 */
export function pickTwo<T>(arr: T[]): [T, T] {
	const i = Math.floor(Math.random() * arr.length);
	let j: number;
	do {
		j = Math.floor(Math.random() * arr.length);
	} while (j === i);
	return [arr[i], arr[j]];
}
