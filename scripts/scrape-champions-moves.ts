/**
 * Scrape moves from pokebase (pages 1-10) + PokeAPI for detailed data.
 * Output: data/champions/moves.csv and data/champions/diff-moves.md
 *
 * Expected pokebase HTML structure (CSS table display):
 *   <div class="table-row ...">
 *     <span class="table-cell ...">
 *       <img alt="{Type}" .../>            -- type icon
 *       <a href="/pokemon-champions/moves/{slug}">{Name}</a>
 *       <button aria-label="{Category}">   -- damage class
 *     </span>
 *     <span class="table-cell ...">        -- description
 *     <span class="table-cell ...">        -- power (or "—")
 *     <span class="table-cell ...">        -- accuracy (or "—")
 *     <span class="table-cell ...">        -- PP
 *   </div>
 */

import fs from "node:fs";
import path from "node:path";
import * as cheerio from "cheerio";
import {
	DATA_DIR,
	fetchWithRetry,
	POKEAPI_BASE,
	POKEBASE_BASE,
	RATE_LIMIT_DELAY,
	sleep,
	writeCSV,
} from "./scrape-utils";

const TOTAL_PAGES = 10;

type PokebaseMoveEntry = {
	slug: string;
	displayName: string;
	power: string;
	accuracy: string;
	pp: string;
};

type FullMoveEntry = {
	name: string;
	type: string;
	category: string;
	power: string;
	accuracy: string;
	pp: string;
	priority: string;
	effect: string;
	effectChance: string;
	minHits: string;
	maxHits: string;
	target: string;
	contact: string;
	sound: string;
	punch: string;
	bite: string;
	pulse: string;
	bullet: string;
	slicing: string;
	recoil: string;
};

// ─── Scrape pokebase ────────────────────────────────────────────────────────

async function scrapePokebaseMoves(): Promise<PokebaseMoveEntry[]> {
	console.log("Scraping moves from pokebase...");

	const moves: PokebaseMoveEntry[] = [];

	for (let page = 1; page <= TOTAL_PAGES; page++) {
		const url = `${POKEBASE_BASE}/moves?page=${page}`;
		console.log(`  Fetching page ${page}/${TOTAL_PAGES}: ${url}`);

		const res = await fetchWithRetry(url);
		if (!res) {
			throw new Error(`Failed to fetch moves page ${page}`);
		}

		const html = await res.text();
		const $ = cheerio.load(html);

		const moveLinks = $('a[href^="/pokemon-champions/moves/"]').filter(
			function () {
				return $(this).closest('[class*="table-row"]').length > 0;
			},
		);

		let pageCount = 0;

		moveLinks.each(function () {
			const href = $(this).attr("href") ?? "";
			const slug = href.replace("/pokemon-champions/moves/", "");
			if (!slug) return;

			const displayName = $(this).text().trim();

			const row = $(this).closest('[class*="table-row"]');
			const cells = row.find('[class*="table-cell"]');

			// Cells: [0] = name+type+category, [1] = description, [2] = power, [3] = accuracy, [4] = PP
			const powerText = cells.length > 2 ? cells.eq(2).text().trim() : "";
			const accuracyText = cells.length > 3 ? cells.eq(3).text().trim() : "";
			const ppText = cells.length > 4 ? cells.eq(4).text().trim() : "";

			moves.push({
				slug,
				displayName,
				power: powerText === "\u2014" || powerText === "-" ? "" : powerText,
				accuracy:
					accuracyText === "\u2014" || accuracyText === "-"
						? ""
						: accuracyText.replace("%", ""),
				pp: ppText === "\u2014" || ppText === "-" ? "" : ppText,
			});
			pageCount++;
		});

		console.log(`    Found ${pageCount} moves on page ${page}.`);

		if (page === TOTAL_PAGES) {
			const nextPageLink = $(`a[href*="page=${TOTAL_PAGES + 1}"]`);
			if (nextPageLink.length > 0) {
				console.warn(
					`  WARNING: A page ${TOTAL_PAGES + 1} link exists! The script may need updating.`,
				);
			}
		}

		await sleep(RATE_LIMIT_DELAY);
	}

	// Deduplicate
	const seen = new Set<string>();
	const unique: PokebaseMoveEntry[] = [];
	for (const m of moves) {
		if (!seen.has(m.slug)) {
			seen.add(m.slug);
			unique.push(m);
		}
	}

	console.log(
		`\nTotal unique moves from pokebase: ${unique.length} (from ${moves.length} raw)`,
	);
	return unique;
}

// ─── Fetch PokeAPI move data ────────────────────────────────────────────────

type PokeAPIMoveData = {
	name: string;
	type: string;
	category: string;
	power: number | null;
	accuracy: number | null;
	pp: number;
	priority: number;
	effect: string;
	effectChance: number | null;
	minHits: number | null;
	maxHits: number | null;
	target: string;
	flags: string[];
};

// Known flag names from PokeAPI move metadata
const FLAG_NAMES = [
	"contact",
	"sound",
	"punch",
	"bite",
	"pulse",
	"bullet",
	"slicing",
	"recoil",
];

async function fetchPokeAPIMoveData(
	slug: string,
): Promise<PokeAPIMoveData | null> {
	const url = `${POKEAPI_BASE}/move/${slug}`;
	const res = await fetchWithRetry(url);
	if (!res) return null;

	const data = (await res.json()) as {
		name: string;
		type: { name: string };
		damage_class: { name: string };
		power: number | null;
		accuracy: number | null;
		pp: number;
		priority: number;
		effect_entries: { short_effect: string; language: { name: string } }[];
		effect_chance: number | null;
		meta: { min_hits: number | null; max_hits: number | null } | null;
		target: { name: string };
		past_values: unknown[];
	};

	const effect =
		data.effect_entries.find((e) => e.language.name === "en")?.short_effect ??
		"";

	// PokeAPI does not expose flags directly in the main move endpoint.
	// Flags would need to come from a supplementary source.
	// For now, we leave flag detection empty and they can be populated manually.
	const flags: string[] = [];

	return {
		name: data.name,
		type: data.type.name,
		category: data.damage_class.name,
		power: data.power,
		accuracy: data.accuracy,
		pp: data.pp,
		priority: data.priority,
		effect,
		effectChance: data.effect_chance,
		minHits: data.meta?.min_hits ?? null,
		maxHits: data.meta?.max_hits ?? null,
		target: data.target?.name ?? "selected-pokemon",
		flags,
	};
}

// ─── Cross-check & diff ─────────────────────────────────────────────────────

function buildDiff(
	pokebaseMoves: PokebaseMoveEntry[],
	apiMoves: Map<string, PokeAPIMoveData>,
): string {
	const lines: string[] = [
		"# Moves Diff: pokebase vs PokeAPI",
		"",
		"| Move | Field | Pokebase | PokeAPI |",
		"|------|-------|----------|---------|",
	];

	for (const pb of pokebaseMoves) {
		const api = apiMoves.get(pb.slug);
		if (!api) continue;

		const pbPower = pb.power || "";
		const apiPower = api.power !== null ? String(api.power) : "";
		if (pbPower && apiPower && pbPower !== apiPower) {
			lines.push(`| ${pb.slug} | Power | ${pbPower} | ${apiPower} |`);
		}

		const pbAcc = pb.accuracy || "";
		const apiAcc = api.accuracy !== null ? String(api.accuracy) : "";
		if (pbAcc && apiAcc && pbAcc !== apiAcc) {
			lines.push(`| ${pb.slug} | Accuracy | ${pbAcc} | ${apiAcc} |`);
		}

		const pbPP = pb.pp || "";
		const apiPP = String(api.pp);
		if (pbPP && apiPP && pbPP !== apiPP) {
			lines.push(`| ${pb.slug} | PP | ${pbPP} | ${apiPP} |`);
		}
	}

	if (lines.length === 4) {
		lines.push("| (none) | - | - | - |");
	}

	return lines.join("\n");
}

// ─── Main ───────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
	// 1. Scrape pokebase for the full move list
	const pokebaseMoves = await scrapePokebaseMoves();

	// 2. Fetch PokeAPI data for each move
	console.log("\nFetching PokeAPI data for each move...");
	const apiMoves = new Map<string, PokeAPIMoveData>();
	const fullMoves: FullMoveEntry[] = [];

	for (let i = 0; i < pokebaseMoves.length; i++) {
		const pb = pokebaseMoves[i];
		const apiData = await fetchPokeAPIMoveData(pb.slug);

		if (apiData) {
			apiMoves.set(pb.slug, apiData);

			// Use pokebase values for power/accuracy/pp (Champions may have rebalanced them),
			// fall back to PokeAPI values if pokebase is missing
			const flagsMap: Record<string, string> = {};
			for (const f of FLAG_NAMES) {
				flagsMap[f] = apiData.flags.includes(f) ? "Yes" : "";
			}

			fullMoves.push({
				name: pb.slug,
				type: apiData.type,
				category: apiData.category,
				power:
					pb.power || (apiData.power !== null ? String(apiData.power) : ""),
				accuracy:
					pb.accuracy ||
					(apiData.accuracy !== null ? String(apiData.accuracy) : ""),
				pp: pb.pp || String(apiData.pp),
				priority: String(apiData.priority),
				effect: apiData.effect,
				effectChance:
					apiData.effectChance !== null ? String(apiData.effectChance) : "",
				minHits: apiData.minHits !== null ? String(apiData.minHits) : "",
				maxHits: apiData.maxHits !== null ? String(apiData.maxHits) : "",
				target: apiData.target,
				contact: flagsMap.contact,
				sound: flagsMap.sound,
				punch: flagsMap.punch,
				bite: flagsMap.bite,
				pulse: flagsMap.pulse,
				bullet: flagsMap.bullet,
				slicing: flagsMap.slicing,
				recoil: flagsMap.recoil,
			});
		} else {
			console.warn(`  Could not fetch PokeAPI data for move: ${pb.slug}`);
			// Still include the move with pokebase data only
			fullMoves.push({
				name: pb.slug,
				type: "",
				category: "",
				power: pb.power,
				accuracy: pb.accuracy,
				pp: pb.pp,
				priority: "0",
				effect: "",
				effectChance: "",
				minHits: "",
				maxHits: "",
				target: "selected-pokemon",
				contact: "",
				sound: "",
				punch: "",
				bite: "",
				pulse: "",
				bullet: "",
				slicing: "",
				recoil: "",
			});
		}

		if ((i + 1) % 50 === 0 || i + 1 === pokebaseMoves.length) {
			console.log(`  Processed ${i + 1}/${pokebaseMoves.length} moves...`);
		}

		await sleep(100); // PokeAPI rate limit
	}

	// 3. Write moves CSV
	const csvPath = path.join(DATA_DIR, "moves.csv");
	const headers = [
		"Name",
		"Type",
		"Category",
		"Power",
		"Accuracy",
		"PP",
		"Priority",
		"Effect",
		"EffectChance",
		"MinHits",
		"MaxHits",
		"Target",
		"Contact",
		"Sound",
		"Punch",
		"Bite",
		"Pulse",
		"Bullet",
		"Slicing",
		"Recoil",
	];
	const rows = fullMoves.map((m) => [
		m.name,
		m.type,
		m.category,
		m.power,
		m.accuracy,
		m.pp,
		m.priority,
		m.effect,
		m.effectChance,
		m.minHits,
		m.maxHits,
		m.target,
		m.contact,
		m.sound,
		m.punch,
		m.bite,
		m.pulse,
		m.bullet,
		m.slicing,
		m.recoil,
	]);
	writeCSV(csvPath, headers, rows);
	console.log(`\nWritten ${fullMoves.length} moves to ${csvPath}`);

	// 4. Write diff
	const diffContent = buildDiff(pokebaseMoves, apiMoves);
	const diffPath = path.join(DATA_DIR, "diff-moves.md");
	fs.writeFileSync(diffPath, diffContent, "utf-8");
	console.log(`Written diff to ${diffPath}`);
}

main().catch((e) => {
	console.error("Fatal error:", e);
	process.exit(1);
});
