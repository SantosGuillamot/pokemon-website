/**
 * Scrape Pokemon data from pokexperto + pokebase + PokeAPI.
 * Output: data/champions/pokemon.csv and data/champions/diff-pokemon.md
 *
 * Sub-steps:
 *   6a: Scrape pokexperto stats page (Spanish names, stats, abilities)
 *   6b: Build Spanish-to-English ability translation map
 *   6c: Fetch PokeAPI data for each Pokemon (types, weight, height, apiId)
 *   6d: Scrape pokebase learnsets (available moves per Pokemon)
 *   6e: Assemble and write CSV
 *
 * Pokexperto HTML structure:
 *   <tr>
 *     <th class="bazul center">0003</th>           -- dex number (4 digits)
 *     <td class="bazul center"><img ...></td>       -- sprite
 *     <th class="bazul left">Venusaur</th>          -- name (Spanish)
 *     <td class="pkmain left"><img alt="planta">... -- types (from img alt)
 *     <td class="pkmain left">Espesura<br/>...</td> -- abilities (Spanish)
 *     <td class="bordeizdo2 left">80 PS<br/>80 Vel  -- HP & Speed
 *     <td class="bordeambos2 left">82 At<br/>83 Def -- Attack & Defense
 *     <td class="bordedcho2 left">100 At Esp<br/>.. -- SpAtk & SpDef
 *     <td class="bmorado center">...</td>           -- availability date
 *   </tr>
 *   Mega rows use class "bnaranja2" instead of "bazul".
 */

import fs from "node:fs";
import path from "node:path";
import * as cheerio from "cheerio";
import {
	CUSTOM_MEGA_API_IDS,
	getAllChampionPokemon,
	isCustomMega,
	MANUAL_ABILITY_TRANSLATIONS,
	POKEAPI_VARIETY_OVERRIDES,
	SPECIES_NAME_TO_DEX,
} from "./champions-data";
import {
	DATA_DIR,
	fetchWithRetry,
	loadJsonCache,
	POKEAPI_BASE,
	POKEBASE_BASE,
	POKEXPERTO_URL,
	RATE_LIMIT_DELAY,
	readCSV,
	saveJsonCache,
	sleep,
	writeCSV,
} from "./scrape-utils";

const CACHE_PATH = path.join(DATA_DIR, ".pokemon-cache.json");

// ─── Types ──────────────────────────────────────────────────────────────────

type PokexpertoRow = {
	dexNumber: number;
	spanishName: string;
	isMega: boolean;
	types: string[]; // Spanish type names (from img alt attributes)
	abilities: string[]; // Spanish ability names
	hp: number;
	attack: number;
	defense: number;
	spAttack: number;
	spDefense: number;
	speed: number;
};

type PokeAPIData = {
	name: string;
	apiId: number;
	types: string[]; // English type names
	weight: number;
	height: number;
	stats: {
		hp: number;
		attack: number;
		defense: number;
		spAttack: number;
		spDefense: number;
		speed: number;
	};
	abilities: string[]; // English ability slugs
};

type Cache = {
	pokexperto: PokexpertoRow[];
	pokeapi: Record<string, PokeAPIData>;
	learnsets: Record<string, string[]>;
	abilityTranslation: Record<string, string>;
};

// ─── 6a: Scrape pokexperto ──────────────────────────────────────────────────

// Map from Spanish type image alt text to English type names
const SPANISH_TYPE_MAP: Record<string, string> = {
	normal: "normal",
	fuego: "fire",
	agua: "water",
	planta: "grass",
	electrico: "electric",
	eléctrico: "electric",
	hielo: "ice",
	lucha: "fighting",
	veneno: "poison",
	tierra: "ground",
	volador: "flying",
	psiquico: "psychic",
	psíquico: "psychic",
	bicho: "bug",
	roca: "rock",
	fantasma: "ghost",
	dragon: "dragon",
	dragón: "dragon",
	siniestro: "dark",
	acero: "steel",
	hada: "fairy",
};

function parseStatValue(text: string): number {
	// Format: "80 PS", "82 At", "100 At Esp", etc.
	const match = text.match(/(\d+)/);
	return match ? Number(match[1]) : 0;
}

async function scrapePokexperto(cache: Cache): Promise<PokexpertoRow[]> {
	if (cache.pokexperto.length > 0) {
		console.log(
			`  Using cached pokexperto data (${cache.pokexperto.length} rows)`,
		);
		return cache.pokexperto;
	}

	console.log("Scraping pokexperto stats page...");
	const res = await fetchWithRetry(POKEXPERTO_URL);
	if (!res) {
		throw new Error("Failed to fetch pokexperto page");
	}

	// pokexperto uses latin-1 encoding
	const buffer = await res.arrayBuffer();
	const html = new TextDecoder("latin1").decode(buffer);
	const $ = cheerio.load(html);

	const rows: PokexpertoRow[] = [];

	// Find all data rows (they have th with bazul/bnaranja2 class containing dex numbers)
	$("tr").each(function () {
		const firstTh = $(this).find("th").first();
		const thClass = firstTh.attr("class") ?? "";

		// Data rows use "bazul" for regular, "bnaranja2" for mega
		if (!thClass.includes("bazul") && !thClass.includes("bnaranja2")) {
			return;
		}

		// Check if this is a data row (first th should contain a 4-digit number)
		const dexText = firstTh.text().trim();
		const dexMatch = dexText.match(/^(\d{4})$/);
		if (!dexMatch) return;

		const dexNumber = Number(dexMatch[1]);
		const isMega = thClass.includes("bnaranja2");

		// Get all cells (th and td combined, in order)
		const cells = $(this).children("th, td");

		// Cell layout:
		// [0] = dex number (th)
		// [1] = image (td)
		// [2] = name (th)
		// [3] = types (td with img alt attributes)
		// [4] = abilities (td with text, separated by <br>)
		// [5] = HP + Speed stats (td)
		// [6] = Attack + Defense stats (td)
		// [7] = SpAtk + SpDef stats (td)
		// [8] = availability (td)

		if (cells.length < 8) return;

		const spanishName = cells.eq(2).text().trim();

		// Types from img alt attributes
		const typeImgs = cells.eq(3).find("img");
		const types: string[] = [];
		typeImgs.each(function () {
			const alt = $(this).attr("alt")?.toLowerCase().trim() ?? "";
			if (alt && SPANISH_TYPE_MAP[alt]) {
				types.push(SPANISH_TYPE_MAP[alt]);
			}
		});

		// Abilities from text content, split by <br> tags
		const abilitiesHtml = cells.eq(4).html() ?? "";
		const abilities = abilitiesHtml
			.split(/<br\s*\/?>/)
			.map((a) => cheerio.load(a).text().trim())
			.filter((a) => a.length > 0);

		// Stats
		// Cell 5: "80 PS \n 80 Vel"
		const statsCell5 = cells.eq(5).text().trim();
		const statsCell6 = cells.eq(6).text().trim();
		const statsCell7 = cells.eq(7).text().trim();

		const statLines5 = statsCell5.split(/\n/).map((s) => s.trim());
		const statLines6 = statsCell6.split(/\n/).map((s) => s.trim());
		const statLines7 = statsCell7.split(/\n/).map((s) => s.trim());

		// Cell 5: HP (PS) and Speed (Vel)
		const hp = parseStatValue(statLines5.find((l) => l.includes("PS")) ?? "0");
		const speed = parseStatValue(
			statLines5.find((l) => l.includes("Vel")) ?? "0",
		);

		// Cell 6: Attack (At) and Defense (Def) - but not "At Esp" or "Def Esp"
		const attack = parseStatValue(
			statLines6.find((l) => l.includes("At") && !l.includes("Esp")) ?? "0",
		);
		const defense = parseStatValue(
			statLines6.find((l) => l.includes("Def") && !l.includes("Esp")) ?? "0",
		);

		// Cell 7: Sp.Attack (At Esp) and Sp.Defense (Def Esp)
		const spAttack = parseStatValue(
			statLines7.find((l) => l.includes("At Esp")) ?? "0",
		);
		const spDefense = parseStatValue(
			statLines7.find((l) => l.includes("Def Esp")) ?? "0",
		);

		rows.push({
			dexNumber,
			spanishName,
			isMega,
			types,
			abilities,
			hp,
			attack,
			defense,
			spAttack,
			spDefense,
			speed,
		});
	});

	console.log(`  Found ${rows.length} Pokemon rows on pokexperto.`);

	cache.pokexperto = rows;
	saveJsonCache(CACHE_PATH, cache);
	return rows;
}

// ─── 6b: Spanish-to-English ability translation ─────────────────────────────

async function buildAbilityTranslationMap(
	cache: Cache,
): Promise<Record<string, string>> {
	if (Object.keys(cache.abilityTranslation).length > 0) {
		console.log(
			`  Using cached ability translation map (${Object.keys(cache.abilityTranslation).length} entries)`,
		);
		return cache.abilityTranslation;
	}

	console.log("Building Spanish-to-English ability translation map...");

	// Load abilities from CSV
	const abilitiesCSV = readCSV(path.join(DATA_DIR, "abilities.csv"));
	console.log(`  Loaded ${abilitiesCSV.length} abilities from CSV`);

	const spanishToEnglish: Record<string, string> = {};

	// Start with manual overrides
	for (const [spanish, english] of Object.entries(
		MANUAL_ABILITY_TRANSLATIONS,
	)) {
		spanishToEnglish[spanish.toLowerCase()] = english;
	}

	// Fetch PokeAPI for each ability to get its Spanish name
	for (let i = 0; i < abilitiesCSV.length; i++) {
		const ability = abilitiesCSV[i];
		const slug = ability.Name;

		const url = `${POKEAPI_BASE}/ability/${slug}`;
		const res = await fetchWithRetry(url);

		if (res) {
			const data = (await res.json()) as {
				name: string;
				names: { name: string; language: { name: string } }[];
			};

			const spanishEntry = data.names.find((n) => n.language.name === "es");
			if (spanishEntry) {
				spanishToEnglish[spanishEntry.name.toLowerCase()] = slug;
			} else {
				console.warn(`  No Spanish translation found for ability: ${slug}`);
			}
		} else {
			console.warn(`  Could not fetch PokeAPI data for ability: ${slug}`);
		}

		if ((i + 1) % 20 === 0 || i + 1 === abilitiesCSV.length) {
			console.log(
				`  Processed ${i + 1}/${abilitiesCSV.length} ability translations...`,
			);
		}

		await sleep(100);
	}

	console.log(
		`  Built translation map with ${Object.keys(spanishToEnglish).length} entries.`,
	);

	cache.abilityTranslation = spanishToEnglish;
	saveJsonCache(CACHE_PATH, cache);
	return spanishToEnglish;
}

function translateAbility(
	spanishName: string,
	translationMap: Record<string, string>,
): string | null {
	const normalized = spanishName.toLowerCase().trim();

	// Try auto-built map
	if (translationMap[normalized]) {
		return translationMap[normalized];
	}

	// Try manual overrides (already in the map, but check explicit map too)
	const manual = MANUAL_ABILITY_TRANSLATIONS[normalized];
	if (manual) {
		return manual;
	}

	console.error(
		`  ERROR: Cannot translate Spanish ability "${spanishName}" to English. Add it to MANUAL_ABILITY_TRANSLATIONS if needed.`,
	);
	return null;
}

// ─── 6c: Fetch PokeAPI data for each Pokemon ────────────────────────────────

async function fetchPokeAPIData(
	identifier: string,
	cache: Cache,
): Promise<PokeAPIData | null> {
	if (cache.pokeapi[identifier]) {
		return cache.pokeapi[identifier];
	}

	const url = `${POKEAPI_BASE}/pokemon/${identifier}`;
	const res = await fetchWithRetry(url);
	if (!res) return null;

	const data = (await res.json()) as {
		id: number;
		name: string;
		types: { slot: number; type: { name: string } }[];
		weight: number;
		height: number;
		stats: { base_stat: number; stat: { name: string } }[];
		abilities: {
			is_hidden: boolean;
			slot: number;
			ability: { name: string };
		}[];
	};

	const statsRecord: Record<string, number> = {};
	for (const s of data.stats) {
		statsRecord[s.stat.name] = s.base_stat;
	}

	const result: PokeAPIData = {
		name: data.name,
		apiId: data.id,
		types: data.types.sort((a, b) => a.slot - b.slot).map((t) => t.type.name),
		weight: data.weight,
		height: data.height,
		stats: {
			hp: statsRecord.hp ?? 0,
			attack: statsRecord.attack ?? 0,
			defense: statsRecord.defense ?? 0,
			spAttack: statsRecord["special-attack"] ?? 0,
			spDefense: statsRecord["special-defense"] ?? 0,
			speed: statsRecord.speed ?? 0,
		},
		abilities: data.abilities
			.sort((a, b) => a.slot - b.slot)
			.map((a) => a.ability.name),
	};

	cache.pokeapi[identifier] = result;
	saveJsonCache(CACHE_PATH, cache);
	return result;
}

// ─── 6d: Scrape pokebase learnsets ──────────────────────────────────────────

async function scrapeLearnset(
	speciesSlug: string,
	cache: Cache,
): Promise<string[]> {
	if (cache.learnsets[speciesSlug]) {
		return cache.learnsets[speciesSlug];
	}

	const url = `${POKEBASE_BASE}/pokemon/${speciesSlug}`;
	const res = await fetchWithRetry(url);
	if (!res) {
		console.warn(`  Could not fetch learnset for ${speciesSlug}`);
		return [];
	}

	const html = await res.text();
	const $ = cheerio.load(html);

	// Move slugs are links: /pokemon-champions/moves/{slug}
	const moveSlugs = new Set<string>();
	$('a[href^="/pokemon-champions/moves/"]').each(function () {
		const href = $(this).attr("href") ?? "";
		const slug = href.replace("/pokemon-champions/moves/", "");
		if (slug) {
			moveSlugs.add(slug);
		}
	});

	const moves = [...moveSlugs];
	cache.learnsets[speciesSlug] = moves;
	saveJsonCache(CACHE_PATH, cache);
	return moves;
}

// ─── 6e: Assemble and write CSV ─────────────────────────────────────────────

type PokemonCSVRow = {
	dexNumber: number;
	name: string;
	form: string;
	type1: string;
	type2: string;
	hp: number;
	attack: number;
	defense: number;
	spAttack: number;
	spDefense: number;
	speed: number;
	ability1: string;
	ability2: string;
	hiddenAbility: string;
	weight: string;
	height: string;
	apiId: number;
	moves: string;
};

// Build a reverse map from dex number -> species name for efficient lookups.
// This is built once at module load time instead of scanning SPECIES_NAME_TO_DEX on every call.
const DEX_TO_SPECIES: Record<number, string> = {};
for (const [name, dex] of Object.entries(SPECIES_NAME_TO_DEX)) {
	DEX_TO_SPECIES[dex] = name;
}

function getPokeAPIIdentifier(
	dexNumber: number,
	formName: string | null,
): string {
	const speciesName = DEX_TO_SPECIES[dexNumber];

	if (!speciesName) {
		throw new Error(`Cannot find species name for dex number ${dexNumber}`);
	}

	if (!formName) {
		return POKEAPI_VARIETY_OVERRIDES[speciesName] ?? speciesName;
	}

	// For forms, the variety name is "{species}-{formName}" e.g. "venusaur-mega", "rotom-heat"
	const varietyName = `${speciesName}-${formName}`;

	// Some form names don't match PokeAPI's naming convention
	return POKEAPI_VARIETY_OVERRIDES[varietyName] ?? varietyName;
}

async function main(): Promise<void> {
	// Load cache
	const cache: Cache = loadJsonCache<Cache>(CACHE_PATH) ?? {
		pokexperto: [],
		pokeapi: {},
		learnsets: {},
		abilityTranslation: {},
	};

	// 6a: Scrape pokexperto
	const pokexpertoRows = await scrapePokexperto(cache);

	// 6b: Build ability translation map
	const abilityTranslation = await buildAbilityTranslationMap(cache);

	// Verify ability translations against abilities CSV
	const abilitiesCSV = readCSV(path.join(DATA_DIR, "abilities.csv"));
	const abilitySlugs = new Set(abilitiesCSV.map((a) => a.Name));

	// Load moves CSV for validation later
	const movesCSV = readCSV(path.join(DATA_DIR, "moves.csv"));
	const moveSlugs = new Set(movesCSV.map((m) => m.Name));

	// Get all champion Pokemon (base + mega forms)
	const allChampions = getAllChampionPokemon();
	console.log(
		`\nProcessing ${allChampions.length} champion Pokemon entries...`,
	);

	// Build lookup from pokexperto rows.
	//
	// pokexpertoRowsByDex: groups all rows by dex number, preserving the order
	//   pokexperto lists them. Used for multi-form Pokemon (Rotom, Gourgeist,
	//   Tauros breeds, Charizard Mega-X/Y, etc.) where we match forms by position.
	const pokexpertoRowsByDex = new Map<number, PokexpertoRow[]>();

	for (const row of pokexpertoRows) {
		const existing = pokexpertoRowsByDex.get(row.dexNumber);
		if (existing) {
			existing.push(row);
		} else {
			pokexpertoRowsByDex.set(row.dexNumber, [row]);
		}
	}

	// For multi-form Pokemon, build a mapping from (dexNumber, formName) to
	// the pokexperto row index. We group CHAMPION_POKEMON entries by dex number
	// and match their forms in order to the pokexperto rows for that dex number.
	// This is done separately for non-mega and mega forms, since pokexperto uses
	// different row classes for each (bazul vs bnaranja2).
	const pokexpertoByDexAndForm = new Map<string, PokexpertoRow>();

	// Group champion entries by dex number, separately for non-mega and mega forms
	const championFormsByDex = new Map<number, (string | null)[]>();
	const championMegaFormsByDex = new Map<number, string[]>();
	for (const entry of allChampions) {
		const isMega = entry.formName?.startsWith("mega") ?? false;
		if (isMega) {
			const existingForms = championMegaFormsByDex.get(entry.dexNumber);
			if (existingForms) {
				existingForms.push(entry.formName as string);
			} else {
				championMegaFormsByDex.set(entry.dexNumber, [
					entry.formName as string,
				]);
			}
		} else {
			const existingForms = championFormsByDex.get(entry.dexNumber);
			if (existingForms) {
				existingForms.push(entry.formName);
			} else {
				championFormsByDex.set(entry.dexNumber, [entry.formName]);
			}
		}
	}

	// Match non-mega forms positionally
	for (const [dex, forms] of championFormsByDex.entries()) {
		const pxRows = pokexpertoRowsByDex.get(dex) ?? [];
		const nonMegaRows = pxRows.filter((r) => !r.isMega);

		if (forms.length === 1) {
			// Single form -- use the first non-mega pokexperto row
			if (nonMegaRows.length > 0) {
				pokexpertoByDexAndForm.set(
					`${dex}-${forms[0] ?? "null"}`,
					nonMegaRows[0],
				);
			}
		} else if (nonMegaRows.length === forms.length) {
			// Multi-form with matching count -- match positionally.
			// Pokexperto lists forms in the same order as the game data,
			// and CHAMPION_POKEMON is ordered to match.
			for (let j = 0; j < forms.length; j++) {
				pokexpertoByDexAndForm.set(
					`${dex}-${forms[j] ?? "null"}`,
					nonMegaRows[j],
				);
			}
		} else if (nonMegaRows.length > 0) {
			// Mismatched count -- assign what we can, log a warning
			console.warn(
				`  Warning: Dex ${dex} has ${forms.length} champion forms but ${nonMegaRows.length} pokexperto non-mega rows. Matching positionally.`,
			);
			for (let j = 0; j < forms.length; j++) {
				if (j < nonMegaRows.length) {
					pokexpertoByDexAndForm.set(
						`${dex}-${forms[j] ?? "null"}`,
						nonMegaRows[j],
					);
				}
			}
		}
	}

	// Match mega forms positionally (handles Charizard-Mega-X / Mega-Y which
	// are two distinct mega rows on pokexperto for the same dex number)
	for (const [dex, megaForms] of championMegaFormsByDex.entries()) {
		const pxRows = pokexpertoRowsByDex.get(dex) ?? [];
		const megaRows = pxRows.filter((r) => r.isMega);

		if (megaForms.length === 1) {
			// Single mega form -- use the first mega pokexperto row
			if (megaRows.length > 0) {
				pokexpertoByDexAndForm.set(`${dex}-${megaForms[0]}`, megaRows[0]);
			}
		} else if (megaRows.length === megaForms.length) {
			// Multi-mega with matching count -- match positionally.
			// Pokexperto lists Mega-X before Mega-Y, and MEGA_STONE_MAP
			// iteration order produces the same ordering.
			for (let j = 0; j < megaForms.length; j++) {
				pokexpertoByDexAndForm.set(`${dex}-${megaForms[j]}`, megaRows[j]);
			}
		} else if (megaRows.length > 0) {
			// Mismatched count -- assign what we can, log a warning
			console.warn(
				`  Warning: Dex ${dex} has ${megaForms.length} champion mega forms but ${megaRows.length} pokexperto mega rows. Matching positionally.`,
			);
			for (let j = 0; j < megaForms.length; j++) {
				if (j < megaRows.length) {
					pokexpertoByDexAndForm.set(`${dex}-${megaForms[j]}`, megaRows[j]);
				}
			}
		}
	}

	const csvRows: PokemonCSVRow[] = [];
	const diffLines: string[] = [
		"# Pokemon Diff: pokexperto/Champions vs PokeAPI",
		"",
		"## Stats Differences",
		"",
		"| Pokemon | Stat | Champions | PokeAPI |",
		"|---------|------|-----------|---------|",
	];

	for (let i = 0; i < allChampions.length; i++) {
		const entry = allChampions[i];
		const { dexNumber, formName } = entry;

		const varietyName = getPokeAPIIdentifier(dexNumber, formName);

		// Find pokexperto data using the form-aware lookup which handles
		// multi-form Pokemon by positional matching. This works for both
		// non-mega forms (Rotom, Gourgeist, Tauros breeds, etc.) and
		// mega forms (Charizard-Mega-X vs Charizard-Mega-Y).
		const pxRow = pokexpertoByDexAndForm.get(
			`${dexNumber}-${formName ?? "null"}`,
		);

		// 6c: Fetch PokeAPI data
		let apiData: PokeAPIData | null = null;

		if (isCustomMega(varietyName)) {
			// Custom megas do not exist in the public PokeAPI
			// Try to fetch from the project's PokeAPI (same URL pattern)
			// If it fails, fall back to pokexperto data + CUSTOM_MEGA_API_IDS
			apiData = await fetchPokeAPIData(varietyName, cache);
			if (!apiData) {
				// Use custom API ID from the map
				const customApiId = CUSTOM_MEGA_API_IDS[varietyName];
				if (customApiId === undefined) {
					console.error(
						`  ERROR: Custom mega "${varietyName}" has no entry in CUSTOM_MEGA_API_IDS. Skipping.`,
					);
					continue;
				}

				// Get base form data for types/weight/height fallback
				const baseName = varietyName.slice(0, varietyName.indexOf("-mega"));
				const baseApiData = cache.pokeapi[baseName] ?? null;

				apiData = {
					name: varietyName,
					apiId: customApiId,
					types: pxRow?.types ?? baseApiData?.types ?? [],
					weight: baseApiData?.weight ?? 0,
					height: baseApiData?.height ?? 0,
					stats: pxRow
						? {
								hp: pxRow.hp,
								attack: pxRow.attack,
								defense: pxRow.defense,
								spAttack: pxRow.spAttack,
								spDefense: pxRow.spDefense,
								speed: pxRow.speed,
							}
						: {
								hp: 0,
								attack: 0,
								defense: 0,
								spAttack: 0,
								spDefense: 0,
								speed: 0,
							},
					abilities: [],
				};
			}
		} else {
			apiData = await fetchPokeAPIData(varietyName, cache);
		}

		// Fallback: if name-based fetch failed and this is a base form (formName is null),
		// try fetching by dex number. Some Pokemon have default varieties with suffixed names
		// (e.g., "aegislash-shield", "mimikyu-disguised") that don't match the species name.
		if (!apiData && !formName) {
			console.log(
				`  Retrying ${varietyName} by dex number ${dexNumber}...`,
			);
			apiData = await fetchPokeAPIData(String(dexNumber), cache);
		}

		if (!apiData) {
			console.warn(
				`  Warning: No PokeAPI data for ${varietyName}. Using pokexperto data only.`,
			);
		}

		// Determine stats (pokexperto takes precedence for Champions stats)
		const hp = pxRow?.hp ?? apiData?.stats.hp ?? 0;
		const attack = pxRow?.attack ?? apiData?.stats.attack ?? 0;
		const defense = pxRow?.defense ?? apiData?.stats.defense ?? 0;
		const spAttack = pxRow?.spAttack ?? apiData?.stats.spAttack ?? 0;
		const spDefense = pxRow?.spDefense ?? apiData?.stats.spDefense ?? 0;
		const speed = pxRow?.speed ?? apiData?.stats.speed ?? 0;

		// Types from PokeAPI (more reliable for English names)
		const type1 = apiData?.types[0] ?? "";
		const type2 = apiData?.types[1] ?? "";

		// Weight/height from PokeAPI
		const weight = apiData ? String(apiData.weight) : "0";
		const height = apiData ? String(apiData.height) : "0";

		// apiId
		const apiId = apiData?.apiId ?? CUSTOM_MEGA_API_IDS[varietyName] ?? 0;
		if (apiId === 0) {
			console.error(`  ERROR: No apiId found for ${varietyName}. Skipping.`);
			continue;
		}

		// Translate abilities from pokexperto (Spanish -> English)
		const translatedAbilities: string[] = [];
		if (pxRow) {
			for (const spanishAbility of pxRow.abilities) {
				const english = translateAbility(spanishAbility, abilityTranslation);
				if (english) {
					// Verify it exists in abilities CSV
					if (!abilitySlugs.has(english)) {
						console.warn(
							`  Warning: Translated ability "${english}" (from "${spanishAbility}") not found in abilities.csv`,
						);
					}
					translatedAbilities.push(english);
				}
			}
		} else if (apiData) {
			// Fall back to PokeAPI abilities
			translatedAbilities.push(...apiData.abilities);
		}

		// Stats diff for logging
		if (apiData && pxRow) {
			const statNames = [
				"hp",
				"attack",
				"defense",
				"spAttack",
				"spDefense",
				"speed",
			] as const;
			for (const stat of statNames) {
				const champVal = pxRow[stat];
				const apiVal = apiData.stats[stat];
				if (champVal !== apiVal) {
					diffLines.push(
						`| ${varietyName} | ${stat} | ${champVal} | ${apiVal} |`,
					);
				}
			}
		}

		csvRows.push({
			dexNumber,
			name: varietyName,
			form: formName ?? "",
			type1,
			type2,
			hp,
			attack,
			defense,
			spAttack,
			spDefense,
			speed,
			ability1: translatedAbilities[0] ?? "",
			ability2: translatedAbilities[1] ?? "",
			hiddenAbility: translatedAbilities[2] ?? "",
			weight,
			height,
			apiId,
			moves: "", // Will be populated in learnset step
		});

		if ((i + 1) % 20 === 0 || i + 1 === allChampions.length) {
			console.log(
				`  Processed ${i + 1}/${allChampions.length} Pokemon (PokeAPI)...`,
			);
		}

		await sleep(100);
	}

	// 6d: Scrape pokebase learnsets
	console.log("\nScraping pokebase learnsets...");

	// Build unique species slugs (base form names) for learnset fetching
	const speciesSlugsToFetch = new Set<string>();
	for (const row of csvRows) {
		// For megas, the learnset page is the base form's page
		const baseName = row.form.startsWith("mega")
			? row.name.slice(0, row.name.indexOf("-mega"))
			: row.name;
		speciesSlugsToFetch.add(baseName);
	}

	const learnsetMap = new Map<string, string[]>();
	const slugsArray = [...speciesSlugsToFetch];

	for (let i = 0; i < slugsArray.length; i++) {
		const slug = slugsArray[i];
		const moves = await scrapeLearnset(slug, cache);
		learnsetMap.set(slug, moves);

		// Validate moves against moves.csv
		for (const move of moves) {
			if (!moveSlugs.has(move)) {
				console.warn(
					`  Warning: Move "${move}" from ${slug}'s learnset not found in moves.csv`,
				);
			}
		}

		if ((i + 1) % 20 === 0 || i + 1 === slugsArray.length) {
			console.log(`  Scraped ${i + 1}/${slugsArray.length} learnsets...`);
		}

		await sleep(RATE_LIMIT_DELAY);
	}

	// Assign learnsets to CSV rows
	for (const row of csvRows) {
		const baseName = row.form.startsWith("mega")
			? row.name.slice(0, row.name.indexOf("-mega"))
			: row.name;
		const moves = learnsetMap.get(baseName) ?? [];
		row.moves = moves.join(",");
	}

	// Write CSV
	const csvPath = path.join(DATA_DIR, "pokemon.csv");
	const headers = [
		"DexNumber",
		"Name",
		"Form",
		"Type1",
		"Type2",
		"HP",
		"Attack",
		"Defense",
		"SpAttack",
		"SpDefense",
		"Speed",
		"Ability1",
		"Ability2",
		"HiddenAbility",
		"Weight",
		"Height",
		"ApiId",
		"Moves",
	];
	const rows = csvRows.map((r) => [
		String(r.dexNumber),
		r.name,
		r.form,
		r.type1,
		r.type2,
		String(r.hp),
		String(r.attack),
		String(r.defense),
		String(r.spAttack),
		String(r.spDefense),
		String(r.speed),
		r.ability1,
		r.ability2,
		r.hiddenAbility,
		r.weight,
		r.height,
		String(r.apiId),
		r.moves,
	]);
	writeCSV(csvPath, headers, rows);
	console.log(`\nWritten ${csvRows.length} Pokemon to ${csvPath}`);

	// Write diff
	if (diffLines.length === 6) {
		diffLines.push("| (none) | - | - | - |");
	}
	const diffPath = path.join(DATA_DIR, "diff-pokemon.md");
	fs.writeFileSync(diffPath, diffLines.join("\n"), "utf-8");
	console.log(`Written diff to ${diffPath}`);
}

main().catch((e) => {
	console.error("Fatal error:", e);
	process.exit(1);
});
