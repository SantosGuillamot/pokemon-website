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
