/**
 * Sync Champions data from CSV files into the database.
 * Reads abilities.csv, moves.csv, pokemon.csv, items.csv from data/champions/
 * and upserts them into the database tables.
 *
 * This script assumes types and natures have already been seeded.
 * It truncates Champions data tables before inserting (clean replace strategy).
 */

import path from "node:path";
import { sql } from "drizzle-orm";
import { db } from "../src/db/client";
import {
	abilities,
	items,
	moves,
	pokemons,
	types,
} from "../src/db/schema/index";
import { CHAMPION_POKEMON } from "./champions-data";
import { DATA_DIR, readCSV } from "./scrape-utils";

// ─── Helpers ────────────────────────────────────────────────────────────────

function toNullableInt(value: string): number | null {
	if (!value || value.trim() === "") return null;
	const n = Number(value);
	return Number.isNaN(n) ? null : n;
}

// Build a set of dex numbers that have a base form (formName: null) in CHAMPION_POKEMON.
// Used to derive isDefault: for Pokemon that only have named forms (e.g., Basculegion
// with only "male"/"female", Meowstic with only "male"/"female"), the first named form
// is marked as default since there is no null-formName entry.
const DEX_WITH_BASE_FORM = new Set<number>();
for (const entry of CHAMPION_POKEMON) {
	if (entry.formName === null) {
		DEX_WITH_BASE_FORM.add(entry.dexNumber);
	}
}

// For dex numbers without a base form, determine which named form is the "first"
// (i.e., the default). We use the order in CHAMPION_POKEMON.
const FIRST_NAMED_FORM_BY_DEX = new Map<number, string>();
for (const entry of CHAMPION_POKEMON) {
	if (entry.formName !== null && !DEX_WITH_BASE_FORM.has(entry.dexNumber)) {
		if (!FIRST_NAMED_FORM_BY_DEX.has(entry.dexNumber)) {
			FIRST_NAMED_FORM_BY_DEX.set(entry.dexNumber, entry.formName);
		}
	}
}

// ─── Sync Functions ─────────────────────────────────────────────────────────

async function syncAbilities(): Promise<Map<string, number>> {
	console.log("Syncing abilities...");
	const rows = readCSV(path.join(DATA_DIR, "abilities.csv"));

	const values = rows.map((row) => ({
		name: row.Name,
		effect: row.Effect || null,
	}));

	if (values.length > 0) {
		await db.insert(abilities).values(values);
	}

	// Build name->id lookup
	const allAbilities = await db.select().from(abilities);
	const map = new Map<string, number>();
	for (const a of allAbilities) {
		map.set(a.name, a.id);
	}

	console.log(`  Inserted ${values.length} abilities.`);
	return map;
}

async function syncMoves(
	typeIdByName: Map<string, number>,
): Promise<Map<string, number>> {
	console.log("Syncing moves...");
	const rows = readCSV(path.join(DATA_DIR, "moves.csv"));

	const FLAG_COLUMNS = [
		"Contact",
		"Sound",
		"Punch",
		"Bite",
		"Pulse",
		"Bullet",
		"Slicing",
		"Recoil",
	] as const;

	const FLAG_VALUES = [
		"contact",
		"sound",
		"punch",
		"bite",
		"pulse",
		"bullet",
		"slicing",
		"recoil",
	] as const;

	const values = rows.map((row) => {
		const typeId = row.Type ? (typeIdByName.get(row.Type) ?? null) : null;

		// Build flags array from flag columns
		const flags: string[] = [];
		for (let i = 0; i < FLAG_COLUMNS.length; i++) {
			if (row[FLAG_COLUMNS[i]] === "Yes") {
				flags.push(FLAG_VALUES[i]);
			}
		}

		return {
			name: row.Name,
			typeId,
			damageClass: (row.Category || "status") as
				| "physical"
				| "special"
				| "status",
			power: toNullableInt(row.Power) as number | null,
			accuracy: toNullableInt(row.Accuracy) as number | null,
			pp: Number(row.PP) || 0,
			priority: Number(row.Priority) || 0,
			effect: row.Effect || null,
			effectChance: toNullableInt(row.EffectChance) as number | null,
			minHits: toNullableInt(row.MinHits) as number | null,
			maxHits: toNullableInt(row.MaxHits) as number | null,
			target: row.Target || "selected-pokemon",
			flags,
		};
	});

	// Insert in batches to avoid exceeding parameter limits
	const BATCH_SIZE = 100;
	for (let i = 0; i < values.length; i += BATCH_SIZE) {
		const batch = values.slice(i, i + BATCH_SIZE);
		await db.insert(moves).values(batch);
	}

	// Build name->id lookup
	const allMoves = await db.select().from(moves);
	const map = new Map<string, number>();
	for (const m of allMoves) {
		map.set(m.name, m.id);
	}

	console.log(`  Inserted ${values.length} moves.`);
	return map;
}

async function syncPokemon(
	typeIdByName: Map<string, number>,
	abilityIdByName: Map<string, number>,
	moveIdByName: Map<string, number>,
): Promise<Map<string, number>> {
	console.log("Syncing Pokemon...");
	const rows = readCSV(path.join(DATA_DIR, "pokemon.csv"));

	const values = rows.map((row) => {
		const formName = row.Form || null;
		const dexNumber = Number(row.DexNumber);

		// Derive isDefault:
		// - If formName is null, this is the base form -> isDefault = true
		// - If this dex number has NO base form in CHAMPION_POKEMON (e.g., Basculegion
		//   only has "male"/"female", Meowstic only has "male"/"female"), mark the
		//   first named form as the default so every species has at least one default.
		// - Otherwise, named forms are not default.
		let isDefault: boolean;
		if (!formName) {
			isDefault = true;
		} else if (!DEX_WITH_BASE_FORM.has(dexNumber)) {
			// No base form exists -- check if this is the first named form
			isDefault = FIRST_NAMED_FORM_BY_DEX.get(dexNumber) === formName;
		} else {
			isDefault = false;
		}

		// Derive isMega
		const isMega = formName?.startsWith("mega") ?? false;

		// Resolve typeIds
		const typeIds: number[] = [];
		if (row.Type1) {
			const id = typeIdByName.get(row.Type1);
			if (id !== undefined) typeIds.push(id);
		}
		if (row.Type2) {
			const id = typeIdByName.get(row.Type2);
			if (id !== undefined) typeIds.push(id);
		}

		// Resolve abilityIds
		const abilityIds: number[] = [];
		for (const col of ["Ability1", "Ability2", "HiddenAbility"] as const) {
			if (row[col]) {
				const id = abilityIdByName.get(row[col]);
				if (id !== undefined) {
					abilityIds.push(id);
				} else {
					console.warn(
						`  Warning: Ability "${row[col]}" not found in DB for Pokemon "${row.Name}"`,
					);
				}
			}
		}

		// Resolve moveIds
		const moveNames = row.Moves
			? row.Moves.split(",").filter((m) => m.trim())
			: [];
		const moveIds: number[] = [];
		for (const moveName of moveNames) {
			const id = moveIdByName.get(moveName.trim());
			if (id !== undefined) {
				moveIds.push(id);
			}
			// Silent skip for moves not found -- warnings were logged during scraping
		}

		return {
			dexNumber,
			name: row.Name,
			formName,
			isDefault,
			isMega,
			apiId: Number(row.ApiId),
			imageUrl: null as string | null,
			hp: Number(row.HP),
			attack: Number(row.Attack),
			defense: Number(row.Defense),
			spAttack: Number(row.SpAttack),
			spDefense: Number(row.SpDefense),
			speed: Number(row.Speed),
			weight: row.Weight,
			height: row.Height,
			typeIds,
			abilityIds,
			moveIds,
		};
	});

	// Insert in batches
	const BATCH_SIZE = 50;
	for (let i = 0; i < values.length; i += BATCH_SIZE) {
		const batch = values.slice(i, i + BATCH_SIZE);
		await db.insert(pokemons).values(batch);
	}

	// Build name->id lookup
	const allPokemon = await db.select().from(pokemons);
	const map = new Map<string, number>();
	for (const p of allPokemon) {
		map.set(p.name, p.id);
	}

	console.log(`  Inserted ${values.length} Pokemon.`);
	return map;
}

async function syncItems(pokemonIdByName: Map<string, number>): Promise<void> {
	console.log("Syncing items...");
	const rows = readCSV(path.join(DATA_DIR, "items.csv"));

	const values = rows.map((row) => {
		const isMegaStone = row.IsMegaStone === "Yes";

		// Resolve megaPokemonId from the variety name
		let megaPokemonId: number | null = null;
		if (row.MegaPokemon) {
			megaPokemonId = pokemonIdByName.get(row.MegaPokemon) ?? null;
			if (megaPokemonId === null) {
				console.warn(
					`  Warning: Mega Pokemon "${row.MegaPokemon}" not found in DB for item "${row.Name}".`,
				);
			}
		}

		return {
			name: row.Name,
			imageUrl: null as string | null,
			category: row.Category || "unknown",
			effect: row.Effect || null,
			meta: null,
			isMegaStone,
			megaPokemonId,
		};
	});

	if (values.length > 0) {
		await db.insert(items).values(values);
	}

	console.log(`  Inserted ${values.length} items.`);
}

// ─── Main ───────────────────────────────────────────────────────────────────

export async function syncChampions(): Promise<void> {
	console.log("Syncing Champions data from CSVs...");

	// Build type lookup (types are already seeded)
	const allTypes = await db.select().from(types);
	const typeIdByName = new Map<string, number>();
	for (const t of allTypes) {
		typeIdByName.set(t.name, t.id);
	}

	if (typeIdByName.size === 0) {
		throw new Error("No types found in database. Run seedTypes() first.");
	}

	// Truncate all Champions tables in a single statement so PostgreSQL
	// can verify FK constraints are satisfied (items.megaPokemonId -> pokemons.id).
	console.log("Truncating existing Champions data...");
	await db.execute(sql`TRUNCATE TABLE items, pokemons, moves, abilities`);

	// Sync in FK-dependency order
	const abilityIdByName = await syncAbilities();
	const moveIdByName = await syncMoves(typeIdByName);
	const pokemonIdByName = await syncPokemon(
		typeIdByName,
		abilityIdByName,
		moveIdByName,
	);
	await syncItems(pokemonIdByName);

	console.log("Champions data sync complete!");
}

// Allow running directly
if (
	process.argv[1]?.endsWith("sync-champions.ts") ||
	process.argv[1]?.endsWith("sync-champions.js")
) {
	import("dotenv/config").then(() => {
		syncChampions()
			.then(() => process.exit(0))
			.catch((e) => {
				console.error("Fatal error:", e);
				process.exit(1);
			});
	});
}
