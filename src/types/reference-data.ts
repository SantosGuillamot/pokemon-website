import type { abilities } from "../db/schema/abilities.js";
import type { items } from "../db/schema/items.js";
import type { moves } from "../db/schema/moves.js";
import type { natures } from "../db/schema/natures.js";
import type { StatKey } from "./team-builder.js";

export type Move = Pick<
	typeof moves.$inferSelect,
	"id" | "name" | "power" | "accuracy" | "pp" | "typeId" | "damageClass"
>;

export type Ability = Pick<
	typeof abilities.$inferSelect,
	"id" | "name" | "effect"
>;

export type Item = Pick<
	typeof items.$inferSelect,
	"id" | "name" | "imageUrl" | "category"
>;

// `increasedStat` / `decreasedStat` are remapped from the DB's snake_case
// enum values (`sp_attack`, `sp_defense`) to the camelCase `StatKey` values
// used across the app, so they are overridden here instead of inherited.
export type Nature = Omit<
	typeof natures.$inferSelect,
	"increasedStat" | "decreasedStat"
> & {
	increasedStat: StatKey | "none";
	decreasedStat: StatKey | "none";
};

export type MoveMap = Record<string, Move>;
export type AbilityMap = Record<string, Ability>;
export type ItemMap = Record<string, Item>;
export type NatureMap = Record<string, Nature>;
