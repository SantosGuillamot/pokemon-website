import "dotenv/config";
import { eq } from "drizzle-orm";
import { db } from "../src/db/client";
import {
	abilities,
	moves,
	natures,
	pokemons,
	pokemonAbilities,
	pokemonMoves,
	pokemonTypes,
	types,
} from "../src/db/schema/index";

const BASE_URL = "https://pokeapi.co/api/v2";

async function sleep(ms: number) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

// ─── Type Colors ─────────────────────────────────────────────────────────────

const TYPE_COLORS: Record<string, string> = {
	normal: "#A8A77A",
	fire: "#EE8130",
	water: "#6390F0",
	electric: "#F7D02C",
	grass: "#7AC74C",
	ice: "#96D9D6",
	fighting: "#C22E28",
	poison: "#A33EA1",
	ground: "#E2BF65",
	flying: "#A98FF3",
	psychic: "#F95587",
	bug: "#A6B91A",
	rock: "#B6A136",
	ghost: "#735797",
	dragon: "#6F35FC",
	dark: "#705746",
	steel: "#B7B7CE",
	fairy: "#D685AD",
};

// ─── Types ───────────────────────────────────────────────────────────────────

async function seedTypes() {
	console.log("Seeding types...");

	const res = await fetch(`${BASE_URL}/type?limit=100`);
	const data = (await res.json()) as {
		results: { name: string; url: string }[];
	};

	// Filter out non-battle types
	const mainTypes = data.results.filter(
		(t) => t.name !== "unknown" && t.name !== "shadow",
	);

	// Insert all types with name + color
	for (const t of mainTypes) {
		const color = TYPE_COLORS[t.name] ?? "#888888";
		await db
			.insert(types)
			.values({ name: t.name, color })
			.onConflictDoNothing();
		await sleep(100);
	}

	console.log(`  Inserted ${mainTypes.length} types.`);

	// Now fetch type details and update matchup arrays
	console.log("  Fetching type matchup data...");

	const allTypes = await db.select().from(types);
	const typeIdByName = Object.fromEntries(allTypes.map((t) => [t.name, t.id]));

	for (const t of allTypes) {
		const typeRes = await fetch(`${BASE_URL}/type/${t.name}`);
		const typeData = (await typeRes.json()) as {
			damage_relations: {
				double_damage_to: { name: string }[];
				half_damage_to: { name: string }[];
				no_damage_to: { name: string }[];
				double_damage_from: { name: string }[];
				half_damage_from: { name: string }[];
				no_damage_from: { name: string }[];
			};
		};

		const dr = typeData.damage_relations;

		const attackNoEffect = dr.no_damage_to
			.map((x) => typeIdByName[x.name])
			.filter((id): id is number => id !== undefined);
		const attackNotVeryEffective = dr.half_damage_to
			.map((x) => typeIdByName[x.name])
			.filter((id): id is number => id !== undefined);
		const attackVeryEffective = dr.double_damage_to
			.map((x) => typeIdByName[x.name])
			.filter((id): id is number => id !== undefined);
		const defenseNoEffect = dr.no_damage_from
			.map((x) => typeIdByName[x.name])
			.filter((id): id is number => id !== undefined);
		const defenseNotVeryEffective = dr.half_damage_from
			.map((x) => typeIdByName[x.name])
			.filter((id): id is number => id !== undefined);
		const defenseVeryEffective = dr.double_damage_from
			.map((x) => typeIdByName[x.name])
			.filter((id): id is number => id !== undefined);

		await db
			.update(types)
			.set({
				attackNoEffect,
				attackNotVeryEffective,
				attackVeryEffective,
				defenseNoEffect,
				defenseNotVeryEffective,
				defenseVeryEffective,
			})
			.where(eq(types.id, t.id));

		await sleep(100);
	}

	console.log("  Updated type matchup data.");
}

// ─── Abilities ────────────────────────────────────────────────────────────────

async function seedAbilities() {
	console.log("Seeding abilities...");

	const res = await fetch(`${BASE_URL}/ability?limit=300`);
	const data = (await res.json()) as {
		results: { name: string; url: string }[];
	};

	let count = 0;

	for (const a of data.results) {
		const abilityRes = await fetch(a.url);
		const abilityData = (await abilityRes.json()) as {
			name: string;
			effect_entries: { short_effect: string; language: { name: string } }[];
		};

		const shortEffect =
			abilityData.effect_entries.find((e) => e.language.name === "en")
				?.short_effect ?? null;

		await db
			.insert(abilities)
			.values({ name: abilityData.name, effect: shortEffect })
			.onConflictDoNothing();

		count++;
		await sleep(100);
	}

	console.log(`  Inserted ${count} abilities.`);
}

// ─── Natures ──────────────────────────────────────────────────────────────────

type StatEnumValue =
	| "hp"
	| "attack"
	| "defense"
	| "sp_attack"
	| "sp_defense"
	| "speed"
	| "none";

function mapStat(apiStatName: string | undefined): StatEnumValue {
	if (!apiStatName) return "none";
	const map: Record<string, StatEnumValue> = {
		"special-attack": "sp_attack",
		"special-defense": "sp_defense",
		hp: "hp",
		attack: "attack",
		defense: "defense",
		speed: "speed",
	};
	return map[apiStatName] ?? "none";
}

async function seedNatures() {
	console.log("Seeding natures...");

	const res = await fetch(`${BASE_URL}/nature?limit=50`);
	const data = (await res.json()) as {
		results: { name: string; url: string }[];
	};

	let count = 0;

	for (const n of data.results) {
		const natureRes = await fetch(n.url);
		const natureData = (await natureRes.json()) as {
			name: string;
			increased_stat: { name: string } | null;
			decreased_stat: { name: string } | null;
		};

		const increasedStat = mapStat(natureData.increased_stat?.name);
		const decreasedStat = mapStat(natureData.decreased_stat?.name);

		await db
			.insert(natures)
			.values({
				name: natureData.name,
				increasedStat,
				decreasedStat,
			})
			.onConflictDoNothing();

		count++;
		await sleep(100);
	}

	console.log(`  Inserted ${count} natures.`);
}

// ─── Moves ───────────────────────────────────────────────────────────────────

async function seedMoves() {
	console.log("Seeding moves...");

	const allTypes = await db.select().from(types);
	const typeIdByName = Object.fromEntries(allTypes.map((t) => [t.name, t.id]));

	const res = await fetch(`${BASE_URL}/move?limit=1000`);
	const data = (await res.json()) as {
		results: { name: string; url: string }[];
	};

	let count = 0;

	for (const m of data.results) {
		const moveRes = await fetch(m.url);
		const moveData = (await moveRes.json()) as {
			name: string;
			power: number | null;
			accuracy: number | null;
			pp: number;
			priority: number;
			effect_entries: { short_effect: string; language: { name: string } }[];
			effect_chance: number | null;
			type: { name: string };
			damage_class: { name: string };
			target: { name: string };
			meta: { min_hits: number | null; max_hits: number | null } | null;
			past_values: unknown[];
		};

		const effect =
			moveData.effect_entries.find((e) => e.language.name === "en")
				?.short_effect ?? null;

		const typeId = typeIdByName[moveData.type.name] ?? null;
		const damageClass = moveData.damage_class.name as
			| "physical"
			| "special"
			| "status";

		// Extract flags from the move detail endpoint
		// PokéAPI does not expose flags directly; we skip flags for now (default [])
		// They can be backfilled later from a supplementary data source

		await db
			.insert(moves)
			.values({
				name: moveData.name,
				power: moveData.power,
				accuracy: moveData.accuracy,
				pp: moveData.pp ?? 0,
				priority: moveData.priority ?? 0,
				effect,
				effectChance: moveData.effect_chance,
				typeId,
				damageClass,
				target: moveData.target?.name ?? "selected-pokemon",
				minHits: moveData.meta?.min_hits ?? null,
				maxHits: moveData.meta?.max_hits ?? null,
				flags: [],
			})
			.onConflictDoNothing();

		count++;

		if (count % 100 === 0) {
			console.log(`  Processed ${count}/${data.results.length} moves...`);
		}

		await sleep(100);
	}

	console.log(`  Inserted ${count} moves.`);
}

// ─── Pokemon ──────────────────────────────────────────────────────────────────

async function seedPokemon() {
	console.log("Seeding first 151 Pokemon...");

	const allTypes = await db.select().from(types);
	const typeIdByName = Object.fromEntries(allTypes.map((t) => [t.name, t.id]));

	const allAbilities = await db.select().from(abilities);
	const abilityIdByName = Object.fromEntries(
		allAbilities.map((a) => [a.name, a.id]),
	);

	const allMoves = await db.select().from(moves);
	const moveIdByName = Object.fromEntries(allMoves.map((m) => [m.name, m.id]));

	for (let id = 1; id <= 151; id++) {
		const res = await fetch(`${BASE_URL}/pokemon/${id}`);
		const data = (await res.json()) as {
			id: number;
			name: string;
			sprites: {
				front_default: string | null;
				back_default: string | null;
				front_shiny: string | null;
				other: { "official-artwork": { front_default: string | null } };
			};
			stats: { base_stat: number; stat: { name: string } }[];
			types: { slot: number; type: { name: string } }[];
			abilities: {
				is_hidden: boolean;
				slot: number;
				ability: { name: string };
			}[];
			moves: { move: { name: string } }[];
			weight: number;
			height: number;
		};

		const statsRecord: Record<string, number> = {};
		for (const s of data.stats) {
			statsRecord[s.stat.name] = s.base_stat;
		}

		const imageUrl = data.sprites.other["official-artwork"].front_default
			? `/public/images/pokemon/artwork/${id}.png`
			: null;

		const [inserted] = await db
			.insert(pokemons)
			.values({
				dexNumber: data.id,
				name: data.name,
				imageUrl,
				hp: statsRecord.hp ?? 0,
				attack: statsRecord.attack ?? 0,
				defense: statsRecord.defense ?? 0,
				spAttack: statsRecord["special-attack"] ?? 0,
				spDefense: statsRecord["special-defense"] ?? 0,
				speed: statsRecord.speed ?? 0,
				weight: String(data.weight),
				height: String(data.height),
			})
			.onConflictDoNothing()
			.returning({ id: pokemons.id });

		// If the row already existed, look it up
		let pokemonId: number;
		if (inserted) {
			pokemonId = inserted.id;
		} else {
			const existing = await db
				.select({ id: pokemons.id })
				.from(pokemons)
				.where(eq(pokemons.dexNumber, data.id))
				.limit(1);
			pokemonId = existing[0].id;
		}

		// Pokemon types
		for (const t of data.types) {
			const typeId = typeIdByName[t.type.name];
			if (typeId !== undefined) {
				await db
					.insert(pokemonTypes)
					.values({ pokemonId, typeId, slot: t.slot })
					.onConflictDoNothing();
			}
		}

		// Pokemon abilities
		for (const a of data.abilities) {
			const abilityId = abilityIdByName[a.ability.name];
			if (abilityId !== undefined) {
				await db
					.insert(pokemonAbilities)
					.values({
						pokemonId,
						abilityId,
						isHidden: a.is_hidden,
						slot: a.slot,
					})
					.onConflictDoNothing();
			}
		}

		// Pokemon moves
		for (const m of data.moves) {
			const moveId = moveIdByName[m.move.name];
			if (moveId !== undefined) {
				await db
					.insert(pokemonMoves)
					.values({ pokemonId, moveId })
					.onConflictDoNothing();
			}
		}

		if (id % 25 === 0) {
			console.log(`  Processed ${id}/151 Pokemon...`);
		}

		await sleep(100);
	}

	console.log("  Inserted up to 151 Pokemon with types, abilities, and moves.");
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
	console.log("Seeding...");
	await seedTypes();
	await seedAbilities();
	await seedNatures();
	await seedMoves();
	await seedPokemon();
	console.log("Done!");
	process.exit(0);
}

main().catch((e) => {
	console.error(e);
	process.exit(1);
});
