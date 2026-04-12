import "dotenv/config";
import { and, eq, inArray, isNull, like } from "drizzle-orm";
import { db } from "../src/db/client";
import {
	abilities,
	items,
	moves,
	natures,
	pokemons,
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
		// PokeAPI does not expose flags directly; we skip flags for now (default [])
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
	console.log("Seeding all Pokemon (all species + forms)...");

	const allTypes = await db.select().from(types);
	const typeIdByName = Object.fromEntries(allTypes.map((t) => [t.name, t.id]));

	const allAbilities = await db.select().from(abilities);
	const abilityIdByName = Object.fromEntries(
		allAbilities.map((a) => [a.name, a.id]),
	);

	const allMoves = await db.select().from(moves);
	const moveIdByName = Object.fromEntries(allMoves.map((m) => [m.name, m.id]));

	// Step 1: Fetch the full species list
	console.log("  Fetching species list...");
	const speciesListRes = await fetch(
		`${BASE_URL}/pokemon-species?limit=100000`,
	);
	if (!speciesListRes.ok) {
		console.warn(
			`  Warning: Failed to fetch species list (HTTP ${speciesListRes.status}). Skipping Pokemon seeding.`,
		);
		return;
	}
	const speciesListData = (await speciesListRes.json()) as {
		count: number;
		results: { name: string; url: string }[];
	};
	const speciesList = speciesListData.results;
	console.log(`  Found ${speciesList.length} species.`);

	let totalVarieties = 0;

	// Step 2: For each species, fetch its varieties
	for (let i = 0; i < speciesList.length; i++) {
		const speciesUrl = speciesList[i].url;
		const speciesRes = await fetch(speciesUrl);
		if (!speciesRes.ok) {
			console.warn(
				`  Warning: Failed to fetch species at ${speciesUrl} (HTTP ${speciesRes.status}). Skipping.`,
			);
			continue;
		}
		const speciesData = (await speciesRes.json()) as {
			id: number;
			name: string;
			varieties: {
				is_default: boolean;
				pokemon: { name: string; url: string };
			}[];
		};

		const dexNumber = speciesData.id;
		const speciesName = speciesData.name;

		await sleep(100);

		// Step 3: For each variety, fetch the pokemon data
		for (const variety of speciesData.varieties) {
			try {
				const varietyName = variety.pokemon.name;
				const varietyUrl = variety.pokemon.url;
				const isDefault = variety.is_default;

				// Extract apiId from the variety URL: ".../pokemon/10034/" -> 10034
				const apiId = Number(varietyUrl.split("/").filter(Boolean).pop());

				// Validate apiId
				if (!Number.isFinite(apiId) || apiId <= 0) {
					console.warn(
						`  Warning: Invalid apiId "${apiId}" extracted from URL ${varietyUrl}. Skipping variety "${varietyName}".`,
					);
					continue;
				}

				// Derive formName by stripping species name prefix
				const formName =
					varietyName === speciesName
						? null
						: varietyName.startsWith(`${speciesName}-`)
							? varietyName.slice(speciesName.length + 1)
							: varietyName;

				// Determine if this is a mega form
				const isMega = formName?.startsWith("mega") ?? false;

				// Fetch the pokemon endpoint for stats, types, abilities, moves
				const pokemonRes = await fetch(`${BASE_URL}/pokemon/${apiId}`);
				if (!pokemonRes.ok) {
					console.warn(
						`  Warning: Failed to fetch pokemon ${apiId} (HTTP ${pokemonRes.status}). Skipping variety "${varietyName}".`,
					);
					continue;
				}
				const data = (await pokemonRes.json()) as {
					id: number;
					name: string;
					sprites: {
						front_default: string | null;
						back_default: string | null;
						front_shiny: string | null;
						other: {
							"official-artwork": { front_default: string | null };
						};
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

				const imageUrl = `/images/pokemon/artwork/${apiId}.png`;

				const [inserted] = await db
					.insert(pokemons)
					.values({
						dexNumber,
						name: varietyName,
						formName,
						isDefault,
						isMega,
						apiId,
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

				// If the row already existed, look it up by name
				let pokemonId: number;
				if (inserted) {
					pokemonId = inserted.id;
				} else {
					const existing = await db
						.select({ id: pokemons.id })
						.from(pokemons)
						.where(eq(pokemons.name, varietyName))
						.limit(1);
					pokemonId = existing[0].id;
				}

				// Pokemon types
				const typeIds = data.types
					.sort((a, b) => a.slot - b.slot)
					.map((t) => typeIdByName[t.type.name])
					.filter((id): id is number => id !== undefined);

				// Pokemon abilities
				const abilityIds = data.abilities
					.sort((a, b) => a.slot - b.slot)
					.map((a) => abilityIdByName[a.ability.name])
					.filter((id): id is number => id !== undefined);

				// Pokemon moves
				const moveIds = data.moves
					.map((m) => moveIdByName[m.move.name])
					.filter((id): id is number => id !== undefined);

				await db
					.update(pokemons)
					.set({ typeIds, abilityIds, moveIds })
					.where(eq(pokemons.id, pokemonId));

				totalVarieties++;
				await sleep(100);
			} catch (error) {
				console.error(
					`  Error processing variety "${variety.pokemon.name}" for species "${speciesName}":`,
					error,
				);
			}
		}

		if ((i + 1) % 50 === 0) {
			console.log(
				`  Processed ${i + 1}/${speciesList.length} species (${totalVarieties} varieties so far)...`,
			);
		}
	}

	console.log(
		`  Inserted ${totalVarieties} Pokemon varieties across ${speciesList.length} species.`,
	);
}

// ─── Items ────────────────────────────────────────────────────────────────────

const CHAMPION_ITEMS = new Set([
	"silk-scarf",
	"miracle-seed",
	"charcoal",
	"mystic-water",
	"magnet",
	"silver-powder",
	"sharp-beak",
	"hard-stone",
	"poison-barb",
	"never-melt-ice",
	"black-belt",
	"twisted-spoon",
	"spell-tag",
	"dragon-fang",
	"metal-coat",
	"soft-sand",
	"black-glasses",
	"fairy-feather",
	"mental-herb",
	"shell-bell",
	"cheri-berry",
	"chesto-berry",
	"pecha-berry",
	"rawst-berry",
	"aspear-berry",
	"persim-berry",
	"leppa-berry",
	"oran-berry",
	"chilan-berry",
	"rindo-berry",
	"occa-berry",
	"passho-berry",
	"wacan-berry",
	"tanga-berry",
	"coba-berry",
	"charti-berry",
	"kebia-berry",
	"shuca-berry",
	"yache-berry",
	"payapa-berry",
	"kasib-berry",
	"haban-berry",
	"colbur-berry",
	"babiri-berry",
	"roseli-berry",
	"chople-berry",
	"scope-lens",
	"light-ball",
	"white-herb",
	"choice-scarf",
	"focus-band",
	"focus-sash",
	"leftovers",
	"lum-berry",
	"sitrus-berry",
	"bright-powder",
	"quick-claw",
	"kings-rock",
]);

// This project includes custom mega evolutions beyond the official games
// (e.g. Dragonite-Mega, Starmie-Mega, Greninja-Mega, etc.).
// All entries below exist in the project's PokeAPI instance.
const MEGA_STONE_MAP: Record<string, string> = {
	venusaurite: "venusaur-mega",
	"charizardite-x": "charizard-mega-x",
	"charizardite-y": "charizard-mega-y",
	blastoisinite: "blastoise-mega",
	beedrillite: "beedrill-mega",
	pidgeotite: "pidgeot-mega",
	clefablite: "clefable-mega",
	alakazite: "alakazam-mega",
	victreebelite: "victreebel-mega",
	slowbronite: "slowbro-mega",
	gengarite: "gengar-mega",
	kangaskhanite: "kangaskhan-mega",
	starminite: "starmie-mega",
	pinsirite: "pinsir-mega",
	gyaradosite: "gyarados-mega",
	aerodactylite: "aerodactyl-mega",
	dragoninite: "dragonite-mega",
	meganiumite: "meganium-mega",
	feraligite: "feraligatr-mega",
	ampharosite: "ampharos-mega",
	steelixite: "steelix-mega",
	scizorite: "scizor-mega",
	heracronite: "heracross-mega",
	skarmorite: "skarmory-mega",
	houndoominite: "houndoom-mega",
	tyranitarite: "tyranitar-mega",
	gardevoirite: "gardevoir-mega",
	sablenite: "sableye-mega",
	aggronite: "aggron-mega",
	medichamite: "medicham-mega",
	manectite: "manectric-mega",
	sharpedonite: "sharpedo-mega",
	cameruptite: "camerupt-mega",
	altarianite: "altaria-mega",
	banettite: "banette-mega",
	chimechite: "chimecho-mega",
	absolite: "absol-mega",
	glalitite: "glalie-mega",
	lopunnite: "lopunny-mega",
	garchompite: "garchomp-mega",
	lucarionite: "lucario-mega",
	abomasite: "abomasnow-mega",
	galladite: "gallade-mega",
	froslassite: "froslass-mega",
	emboarite: "emboar-mega",
	excadrite: "excadrill-mega",
	audinite: "audino-mega",
	chandelurite: "chandelure-mega",
	golurkite: "golurk-mega",
	chesnaughtite: "chesnaught-mega",
	delphoxite: "delphox-mega",
	greninjite: "greninja-mega",
	floettite: "floette-mega",
	meowsticite: "meowstic-mega",
	hawluchanite: "hawlucha-mega",
	crabominite: "crabominable-mega",
	drampanite: "drampa-mega",
	scovillainite: "scovillain-mega",
	glimmoranite: "glimmora-mega",
};

async function seedItems() {
	console.log("Seeding items from PokeAPI...");

	// Build a lookup of Pokemon name -> id for mega stone FK resolution
	const allPokemon = await db
		.select({ id: pokemons.id, name: pokemons.name })
		.from(pokemons);
	const pokemonIdByName = Object.fromEntries(
		allPokemon.map((p) => [p.name, p.id]),
	);

	// Fetch the complete item catalog
	const listRes = await fetch(`${BASE_URL}/item?limit=10000`);
	const listData = (await listRes.json()) as {
		count: number;
		results: { name: string; url: string }[];
	};

	console.log(`  Found ${listData.results.length} items in PokeAPI.`);

	let count = 0;
	const CHUNK_SIZE = 20;

	for (let i = 0; i < listData.results.length; i += CHUNK_SIZE) {
		const chunk = listData.results.slice(i, i + CHUNK_SIZE);

		// Process all items within a chunk in parallel
		await Promise.all(
			chunk.map(async (item) => {
				try {
					const itemRes = await fetch(item.url);
					if (!itemRes.ok) {
						console.warn(
							`  Warning: Failed to fetch item ${item.name} (HTTP ${itemRes.status}). Skipping.`,
						);
						return;
					}
					const itemData = (await itemRes.json()) as {
						name: string;
						category: { name: string };
						effect_entries: {
							short_effect: string;
							language: { name: string };
						}[];
						sprites: { default: string | null };
					};

					const slug = itemData.name;
					const effect =
						itemData.effect_entries.find((e) => e.language.name === "en")
							?.short_effect ?? null;
					const imageUrl = itemData.sprites?.default ?? null;
					const category = itemData.category?.name ?? "unknown";

					// Determine flags
					const isChampionItem = CHAMPION_ITEMS.has(slug);
					const megaVarietyName = MEGA_STONE_MAP[slug] ?? null;
					const isMegaStone = megaVarietyName !== null;
					const inChampions = isChampionItem || isMegaStone;

					// Resolve mega Pokemon FK if applicable
					let megaPokemonId: number | null = null;
					if (megaVarietyName) {
						megaPokemonId = pokemonIdByName[megaVarietyName] ?? null;
						if (megaPokemonId === null) {
							console.warn(
								`  Warning: Mega Pokemon "${megaVarietyName}" not found in DB for item "${slug}".`,
							);
						}
					}

					await db
						.insert(items)
						.values({
							name: slug,
							imageUrl,
							category,
							effect,
							inChampions,
							isMegaStone,
							megaPokemonId,
						})
						.onConflictDoNothing();
				} catch (error) {
					console.error(`  Error processing item "${item.name}":`, error);
				}
			}),
		);

		count += chunk.length;

		if (
			(i + CHUNK_SIZE) % 100 === 0 ||
			i + CHUNK_SIZE >= listData.results.length
		) {
			console.log(
				`  Processed ${Math.min(i + CHUNK_SIZE, listData.results.length)}/${listData.results.length} items...`,
			);
		}

		// Brief delay between chunks to avoid rate limiting
		await sleep(200);
	}

	console.log(`  Processed ${count} items.`);
}

// ─── Champions ────────────────────────────────────────────────────────────────

// Static list of all champion Pokemon. formName uses DB values; null = base form.
const CHAMPION_POKEMON: Array<{ dexNumber: number; formName: string | null }> =
	[
		{ dexNumber: 3, formName: null }, // Venusaur
		{ dexNumber: 6, formName: null }, // Charizard
		{ dexNumber: 9, formName: null }, // Blastoise
		{ dexNumber: 15, formName: null }, // Beedrill
		{ dexNumber: 18, formName: null }, // Pidgeot
		{ dexNumber: 24, formName: null }, // Arbok
		{ dexNumber: 25, formName: null }, // Pikachu
		{ dexNumber: 26, formName: null }, // Raichu
		{ dexNumber: 26, formName: "alola" }, // Raichu (Alolan)
		{ dexNumber: 36, formName: null }, // Clefable
		{ dexNumber: 38, formName: null }, // Ninetales
		{ dexNumber: 38, formName: "alola" }, // Ninetales (Alolan)
		{ dexNumber: 59, formName: null }, // Arcanine
		{ dexNumber: 59, formName: "hisui" }, // Arcanine (Hisuian)
		{ dexNumber: 65, formName: null }, // Alakazam
		{ dexNumber: 68, formName: null }, // Machamp
		{ dexNumber: 71, formName: null }, // Victreebel
		{ dexNumber: 80, formName: null }, // Slowbro
		{ dexNumber: 80, formName: "galar" }, // Slowbro (Galarian)
		{ dexNumber: 94, formName: null }, // Gengar
		{ dexNumber: 115, formName: null }, // Kangaskhan
		{ dexNumber: 121, formName: null }, // Starmie
		{ dexNumber: 127, formName: null }, // Pinsir
		{ dexNumber: 128, formName: null }, // Tauros
		{ dexNumber: 128, formName: "paldea-aqua-breed" }, // Tauros (Paldea Aqua)
		{ dexNumber: 128, formName: "paldea-blaze-breed" }, // Tauros (Paldea Blaze)
		{ dexNumber: 128, formName: "paldea-combat-breed" }, // Tauros (Paldea Combat)
		{ dexNumber: 130, formName: null }, // Gyarados
		{ dexNumber: 132, formName: null }, // Ditto
		{ dexNumber: 134, formName: null }, // Vaporeon
		{ dexNumber: 135, formName: null }, // Jolteon
		{ dexNumber: 136, formName: null }, // Flareon
		{ dexNumber: 142, formName: null }, // Aerodactyl
		{ dexNumber: 143, formName: null }, // Snorlax
		{ dexNumber: 149, formName: null }, // Dragonite
		{ dexNumber: 154, formName: null }, // Meganium
		{ dexNumber: 157, formName: null }, // Typhlosion
		{ dexNumber: 157, formName: "hisui" }, // Typhlosion (Hisuian)
		{ dexNumber: 160, formName: null }, // Feraligatr
		{ dexNumber: 168, formName: null }, // Ariados
		{ dexNumber: 181, formName: null }, // Ampharos
		{ dexNumber: 184, formName: null }, // Azumarill
		{ dexNumber: 186, formName: null }, // Politoed
		{ dexNumber: 196, formName: null }, // Espeon
		{ dexNumber: 197, formName: null }, // Umbreon
		{ dexNumber: 199, formName: null }, // Slowking
		{ dexNumber: 199, formName: "galar" }, // Slowking (Galarian)
		{ dexNumber: 205, formName: null }, // Forretress
		{ dexNumber: 208, formName: null }, // Steelix
		{ dexNumber: 212, formName: null }, // Scizor
		{ dexNumber: 214, formName: null }, // Heracross
		{ dexNumber: 227, formName: null }, // Skarmory
		{ dexNumber: 229, formName: null }, // Houndoom
		{ dexNumber: 248, formName: null }, // Tyranitar
		{ dexNumber: 279, formName: null }, // Pelipper
		{ dexNumber: 282, formName: null }, // Gardevoir
		{ dexNumber: 302, formName: null }, // Sableye
		{ dexNumber: 306, formName: null }, // Aggron
		{ dexNumber: 308, formName: null }, // Medicham
		{ dexNumber: 310, formName: null }, // Manectric
		{ dexNumber: 319, formName: null }, // Sharpedo
		{ dexNumber: 323, formName: null }, // Camerupt
		{ dexNumber: 324, formName: null }, // Torkoal
		{ dexNumber: 334, formName: null }, // Altaria
		{ dexNumber: 350, formName: null }, // Milotic
		{ dexNumber: 351, formName: null }, // Castform
		{ dexNumber: 354, formName: null }, // Banette
		{ dexNumber: 358, formName: null }, // Chimecho
		{ dexNumber: 359, formName: null }, // Absol
		{ dexNumber: 362, formName: null }, // Glalie
		{ dexNumber: 389, formName: null }, // Torterra
		{ dexNumber: 392, formName: null }, // Infernape
		{ dexNumber: 395, formName: null }, // Empoleon
		{ dexNumber: 405, formName: null }, // Luxray
		{ dexNumber: 407, formName: null }, // Roserade
		{ dexNumber: 409, formName: null }, // Rampardos
		{ dexNumber: 411, formName: null }, // Bastiodon
		{ dexNumber: 428, formName: null }, // Lopunny
		{ dexNumber: 442, formName: null }, // Spiritomb
		{ dexNumber: 445, formName: null }, // Garchomp
		{ dexNumber: 448, formName: null }, // Lucario
		{ dexNumber: 450, formName: null }, // Hippowdon
		{ dexNumber: 454, formName: null }, // Toxicroak
		{ dexNumber: 460, formName: null }, // Abomasnow
		{ dexNumber: 461, formName: null }, // Weavile
		{ dexNumber: 464, formName: null }, // Rhyperior
		{ dexNumber: 470, formName: null }, // Leafeon
		{ dexNumber: 471, formName: null }, // Glaceon
		{ dexNumber: 472, formName: null }, // Gliscor
		{ dexNumber: 473, formName: null }, // Mamoswine
		{ dexNumber: 475, formName: null }, // Gallade
		{ dexNumber: 478, formName: null }, // Froslass
		{ dexNumber: 479, formName: null }, // Rotom
		{ dexNumber: 479, formName: "heat" }, // Rotom (Heat)
		{ dexNumber: 479, formName: "wash" }, // Rotom (Wash)
		{ dexNumber: 479, formName: "frost" }, // Rotom (Frost)
		{ dexNumber: 479, formName: "fan" }, // Rotom (Fan)
		{ dexNumber: 479, formName: "mow" }, // Rotom (Mow)
		{ dexNumber: 497, formName: null }, // Serperior
		{ dexNumber: 500, formName: null }, // Emboar
		{ dexNumber: 503, formName: null }, // Samurott
		{ dexNumber: 503, formName: "hisui" }, // Samurott (Hisuian)
		{ dexNumber: 505, formName: null }, // Watchog
		{ dexNumber: 510, formName: null }, // Liepard
		{ dexNumber: 512, formName: null }, // Simisage
		{ dexNumber: 514, formName: null }, // Simisear
		{ dexNumber: 516, formName: null }, // Simipour
		{ dexNumber: 530, formName: null }, // Excadrill
		{ dexNumber: 531, formName: null }, // Audino
		{ dexNumber: 534, formName: null }, // Conkeldurr
		{ dexNumber: 547, formName: null }, // Whimsicott
		{ dexNumber: 553, formName: null }, // Krookodile
		{ dexNumber: 563, formName: null }, // Cofagrigus
		{ dexNumber: 569, formName: null }, // Garbodor
		{ dexNumber: 571, formName: null }, // Zoroark
		{ dexNumber: 571, formName: "hisui" }, // Zoroark (Hisuian)
		{ dexNumber: 579, formName: null }, // Reuniclus
		{ dexNumber: 584, formName: null }, // Vanilluxe
		{ dexNumber: 587, formName: null }, // Emolga
		{ dexNumber: 609, formName: null }, // Chandelure
		{ dexNumber: 614, formName: null }, // Beartic
		{ dexNumber: 618, formName: null }, // Stunfisk
		{ dexNumber: 618, formName: "galar" }, // Stunfisk (Galarian)
		{ dexNumber: 623, formName: null }, // Golurk
		{ dexNumber: 635, formName: null }, // Hydreigon
		{ dexNumber: 637, formName: null }, // Volcarona
		{ dexNumber: 652, formName: null }, // Chesnaught
		{ dexNumber: 655, formName: null }, // Delphox
		{ dexNumber: 658, formName: null }, // Greninja
		{ dexNumber: 660, formName: null }, // Diggersby
		{ dexNumber: 663, formName: null }, // Talonflame
		{ dexNumber: 666, formName: null }, // Vivillon
		{ dexNumber: 670, formName: "eternal" }, // Floette (Eternal)
		{ dexNumber: 671, formName: null }, // Florges
		{ dexNumber: 675, formName: null }, // Pangoro
		{ dexNumber: 676, formName: null }, // Furfrou
		{ dexNumber: 678, formName: "male" }, // Meowstic (Male)
		{ dexNumber: 678, formName: "female" }, // Meowstic (Female)
		{ dexNumber: 681, formName: null }, // Aegislash
		{ dexNumber: 683, formName: null }, // Aromatisse
		{ dexNumber: 685, formName: null }, // Slurpuff
		{ dexNumber: 693, formName: null }, // Clawitzer
		{ dexNumber: 695, formName: null }, // Heliolisk
		{ dexNumber: 697, formName: null }, // Tyrantrum
		{ dexNumber: 699, formName: null }, // Aurorus
		{ dexNumber: 700, formName: null }, // Sylveon
		{ dexNumber: 701, formName: null }, // Hawlucha
		{ dexNumber: 702, formName: null }, // Dedenne
		{ dexNumber: 706, formName: null }, // Goodra
		{ dexNumber: 706, formName: "hisui" }, // Goodra (Hisuian)
		{ dexNumber: 707, formName: null }, // Klefki
		{ dexNumber: 709, formName: null }, // Trevenant
		{ dexNumber: 711, formName: null }, // Gourgeist
		{ dexNumber: 711, formName: "large" }, // Gourgeist (Large)
		{ dexNumber: 711, formName: "small" }, // Gourgeist (Small)
		{ dexNumber: 711, formName: "super" }, // Gourgeist (Super)
		{ dexNumber: 713, formName: null }, // Avalugg
		{ dexNumber: 713, formName: "hisui" }, // Avalugg (Hisuian)
		{ dexNumber: 715, formName: null }, // Noivern
		{ dexNumber: 724, formName: null }, // Decidueye
		{ dexNumber: 724, formName: "hisui" }, // Decidueye (Hisuian)
		{ dexNumber: 727, formName: null }, // Incineroar
		{ dexNumber: 730, formName: null }, // Primarina
		{ dexNumber: 733, formName: null }, // Toucannon
		{ dexNumber: 740, formName: null }, // Crabominable
		{ dexNumber: 745, formName: null }, // Lycanroc
		{ dexNumber: 745, formName: "dusk" }, // Lycanroc (Dusk)
		{ dexNumber: 745, formName: "midnight" }, // Lycanroc (Midnight)
		{ dexNumber: 748, formName: null }, // Toxapex
		{ dexNumber: 750, formName: null }, // Mudsdale
		{ dexNumber: 752, formName: null }, // Araquanid
		{ dexNumber: 758, formName: null }, // Salazzle
		{ dexNumber: 763, formName: null }, // Tsareena
		{ dexNumber: 765, formName: null }, // Oranguru
		{ dexNumber: 766, formName: null }, // Passimian
		{ dexNumber: 778, formName: null }, // Mimikyu
		{ dexNumber: 780, formName: null }, // Drampa
		{ dexNumber: 784, formName: null }, // Kommo-o
		{ dexNumber: 823, formName: null }, // Corviknight
		{ dexNumber: 841, formName: null }, // Flapple
		{ dexNumber: 842, formName: null }, // Appletun
		{ dexNumber: 844, formName: null }, // Sandaconda
		{ dexNumber: 855, formName: null }, // Polteageist
		{ dexNumber: 858, formName: null }, // Hatterene
		{ dexNumber: 866, formName: null }, // Mr. Rime
		{ dexNumber: 867, formName: null }, // Runerigus
		{ dexNumber: 869, formName: null }, // Alcremie
		{ dexNumber: 877, formName: null }, // Morpeko
		{ dexNumber: 887, formName: null }, // Dragapult
		{ dexNumber: 899, formName: null }, // Wyrdeer
		{ dexNumber: 900, formName: null }, // Kleavor
		{ dexNumber: 902, formName: "male" }, // Basculegion (Male)
		{ dexNumber: 902, formName: "female" }, // Basculegion (Female)
		{ dexNumber: 903, formName: null }, // Sneasler
		{ dexNumber: 908, formName: null }, // Meowscarada
		{ dexNumber: 911, formName: null }, // Skeledirge
		{ dexNumber: 914, formName: null }, // Quaquaval
		{ dexNumber: 925, formName: null }, // Maushold
		{ dexNumber: 925, formName: "four" }, // Maushold (Four)
		{ dexNumber: 934, formName: null }, // Garganacl
		{ dexNumber: 936, formName: null }, // Armarouge
		{ dexNumber: 937, formName: null }, // Ceruledge
		{ dexNumber: 939, formName: null }, // Bellibolt
		{ dexNumber: 952, formName: null }, // Scovillain
		{ dexNumber: 956, formName: null }, // Espathra
		{ dexNumber: 959, formName: null }, // Tinkaton
		{ dexNumber: 964, formName: null }, // Palafin
		{ dexNumber: 964, formName: "hero" }, // Palafin (Hero)
		{ dexNumber: 968, formName: null }, // Orthworm
		{ dexNumber: 970, formName: null }, // Glimmora
		{ dexNumber: 981, formName: null }, // Farigiraf
		{ dexNumber: 983, formName: null }, // Kingambit
		{ dexNumber: 1013, formName: null }, // Sinistcha
		{ dexNumber: 1018, formName: null }, // Archaludon
		{ dexNumber: 1019, formName: null }, // Hydrapple
	];

async function seedChampions() {
	console.log("Seeding champions...");
	console.log(`  Processing ${CHAMPION_POKEMON.length} champion entries...`);

	let updatedCount = 0;
	let notFoundCount = 0;
	const notFoundEntries: string[] = [];

	// Update each specific entry
	for (const entry of CHAMPION_POKEMON) {
		const conditions = [eq(pokemons.dexNumber, entry.dexNumber)];

		if (entry.formName === null) {
			conditions.push(isNull(pokemons.formName));
		} else {
			conditions.push(eq(pokemons.formName, entry.formName));
		}

		const result = await db
			.update(pokemons)
			.set({ inChampions: true })
			.where(and(...conditions))
			.returning({ id: pokemons.id, name: pokemons.name });

		if (result.length === 0 && entry.formName === null) {
			// No row with formName IS NULL -- this Pokemon only has named forms.
			// Update all non-mega forms for this dex number.
			const fallbackResult = await db
				.update(pokemons)
				.set({ inChampions: true })
				.where(eq(pokemons.dexNumber, entry.dexNumber))
				.returning({ id: pokemons.id, name: pokemons.name });

			if (fallbackResult.length === 0) {
				notFoundEntries.push(`#${entry.dexNumber}`);
				notFoundCount++;
			} else {
				updatedCount += fallbackResult.length;
				for (const row of fallbackResult) {
					console.log(`  Updated (all forms): ${row.name} (id=${row.id})`);
				}
			}
		} else if (result.length === 0) {
			const label = `#${entry.dexNumber} (${entry.formName})`;
			notFoundEntries.push(label);
			notFoundCount++;
		} else {
			updatedCount += result.length;
			for (const row of result) {
				console.log(`  Updated: ${row.name} (id=${row.id})`);
			}
		}
	}

	// Also set inChampions for all mega forms of any dex number in the list
	const allDexNumbers = [...new Set(CHAMPION_POKEMON.map((e) => e.dexNumber))];

	const megaResult = await db
		.update(pokemons)
		.set({ inChampions: true })
		.where(
			and(
				inArray(pokemons.dexNumber, allDexNumbers),
				like(pokemons.formName, "mega%"),
			),
		)
		.returning({ id: pokemons.id, name: pokemons.name });

	for (const row of megaResult) {
		console.log(`  Updated mega: ${row.name} (id=${row.id})`);
	}

	console.log(`  Summary:`);
	console.log(`    Direct entries updated: ${updatedCount}`);
	console.log(`    Mega forms updated: ${megaResult.length}`);
	console.log(`    Total updated: ${updatedCount + megaResult.length}`);

	if (notFoundCount > 0) {
		console.log(`    Not found (${notFoundCount}):`);
		for (const entry of notFoundEntries) {
			console.log(`      - ${entry}`);
		}
	}
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
	console.log("Seeding...");
	await seedTypes();
	await seedAbilities();
	await seedNatures();
	await seedMoves();
	await seedPokemon();
	await seedItems();
	await seedChampions();
	console.log("Done!");
	process.exit(0);
}

main().catch((e) => {
	console.error(e);
	process.exit(1);
});
