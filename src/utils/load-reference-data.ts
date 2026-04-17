import { setServerConfig } from "iapi-ssr-processor";
import { db } from "../db/client.js";
import { abilities } from "../db/schema/abilities.js";
import { items } from "../db/schema/items.js";
import { moves } from "../db/schema/moves.js";
import { natures, type statEnum } from "../db/schema/natures.js";
import type {
	AbilityMap,
	ItemMap,
	MoveMap,
	NatureMap,
} from "../types/reference-data.js";
import type { StatKey } from "../types/team-builder.js";

/**
 * Map the DB stat enum (snake_case) to the `StatKey` used in the UI
 * (camelCase), with `"none"` for neutral natures.
 *
 * The `satisfies` constraint makes this an exhaustive mapping over
 * `statEnum.enumValues` — adding a new enum value to the schema will fail
 * the type-check here until `STAT_MAP` is updated.
 */
const STAT_MAP = {
	hp: "hp",
	attack: "attack",
	defense: "defense",
	sp_attack: "spAttack",
	sp_defense: "spDefense",
	speed: "speed",
	none: "none",
} as const satisfies Record<
	(typeof statEnum.enumValues)[number],
	StatKey | "none"
>;

// Module-level caches. Populated on first request per-loader; survive across
// requests within a single server process. `resetServerState()` clears the
// in-request config each request, so `setServerConfig` is called on every
// request (not only on cache miss).
let movesCache: MoveMap | undefined;
let abilitiesCache: AbilityMap | undefined;
let itemsCache: ItemMap | undefined;
let naturesCache: NatureMap | undefined;

export async function loadMoves(): Promise<void> {
	if (!movesCache) {
		const rows = await db
			.select({
				id: moves.id,
				name: moves.name,
				power: moves.power,
				accuracy: moves.accuracy,
				pp: moves.pp,
				typeId: moves.typeId,
				damageClass: moves.damageClass,
			})
			.from(moves);
		const map: MoveMap = {};
		for (const row of rows) {
			map[String(row.id)] = {
				id: row.id,
				name: row.name,
				power: row.power,
				accuracy: row.accuracy,
				pp: row.pp,
				typeId: row.typeId,
				damageClass: row.damageClass,
			};
		}
		movesCache = map;
	}
	setServerConfig("pokemon", { moves: movesCache });
}

export async function loadAbilities(): Promise<void> {
	if (!abilitiesCache) {
		const rows = await db
			.select({
				id: abilities.id,
				name: abilities.name,
				effect: abilities.effect,
			})
			.from(abilities);
		const map: AbilityMap = {};
		for (const row of rows) {
			map[String(row.id)] = {
				id: row.id,
				name: row.name,
				effect: row.effect,
			};
		}
		abilitiesCache = map;
	}
	setServerConfig("pokemon", { abilities: abilitiesCache });
}

export async function loadItems(): Promise<void> {
	if (!itemsCache) {
		const rows = await db
			.select({
				id: items.id,
				name: items.name,
				imageUrl: items.imageUrl,
				category: items.category,
			})
			.from(items);
		const map: ItemMap = {};
		for (const row of rows) {
			map[String(row.id)] = {
				id: row.id,
				name: row.name,
				imageUrl: row.imageUrl,
				category: row.category,
			};
		}
		itemsCache = map;
	}
	setServerConfig("pokemon", { items: itemsCache });
}

export async function loadNatures(): Promise<void> {
	if (!naturesCache) {
		const rows = await db
			.select({
				id: natures.id,
				name: natures.name,
				increasedStat: natures.increasedStat,
				decreasedStat: natures.decreasedStat,
			})
			.from(natures);
		const map: NatureMap = {};
		for (const row of rows) {
			map[String(row.id)] = {
				id: row.id,
				name: row.name,
				increasedStat: STAT_MAP[row.increasedStat],
				decreasedStat: STAT_MAP[row.decreasedStat],
			};
		}
		naturesCache = map;
	}
	setServerConfig("pokemon", { natures: naturesCache });
}
