import "dotenv/config";
import { eq } from "drizzle-orm";
import { db } from "../src/db/client";
import { natures, types } from "../src/db/schema/index";
import { syncChampions } from "./sync-champions";

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
		(t) => t.name !== "unknown" && t.name !== "shadow" && t.name !== "stellar",
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
				imageSmall: `/images/types/small/${t.id}.png`,
				imageLarge: `/images/types/large/${t.id}.png`,
			})
			.where(eq(types.id, t.id));

		await sleep(100);
	}

	console.log("  Updated type matchup data.");
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

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
	console.log("Seeding...");
	await seedTypes();
	await seedNatures();
	await syncChampions();
	console.log("Done!");
	process.exit(0);
}

main().catch((e) => {
	console.error(e);
	process.exit(1);
});
