export type StatKey =
	| "hp"
	| "attack"
	| "defense"
	| "spAttack"
	| "spDefense"
	| "speed";

export const STAT_KEYS: StatKey[] = [
	"hp",
	"attack",
	"defense",
	"spAttack",
	"spDefense",
	"speed",
];

export const TOTAL_STAT_POINTS = 66;
export const MAX_STAT_POINTS_PER_STAT = 32;

export type StatPoints = Record<StatKey, number>;

export function defaultStatPoints(): StatPoints {
	return { hp: 0, attack: 0, defense: 0, spAttack: 0, spDefense: 0, speed: 0 };
}

/**
 * Returns true when the distribution is complete: total equals 66 and
 * every individual stat is within the 32-point cap.
 *
 * Use this in the UI to show completion warnings (e.g. "34/66 points assigned").
 * Incomplete distributions (total < 66) are allowed to be saved.
 * Over-distribution (total > 66 or any stat > 32) should be prevented by the UI
 * before the user can reach that state.
 */
export function isCompleteStatDistribution(s: StatPoints): boolean {
	const total = STAT_KEYS.reduce((sum, key) => sum + s[key], 0);
	if (total !== TOTAL_STAT_POINTS) return false;
	return STAT_KEYS.every((key) => s[key] <= MAX_STAT_POINTS_PER_STAT);
}

export type MetaPokemon = {
	id: string;
	nickname: string;
	pokemonId: number;
	moveIds: [number | null, number | null, number | null, number | null];
	abilityId: number | null;
	itemId: number | null;
	statPoints: StatPoints;
	createdAt: string;
	updatedAt: string;
};

export type Team = {
	id: string;
	name: string;
	notes: string;
	members: [
		string | null,
		string | null,
		string | null,
		string | null,
		string | null,
		string | null,
	];
	createdAt: string;
	updatedAt: string;
};

export type TeamBuilderStorage = {
	version: 1;
	metaPokemons: Record<string, MetaPokemon>;
	teams: Record<string, Team>;
};
