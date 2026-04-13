/**
 * Scrape abilities from pokebase (pages 1-4).
 * Output: data/champions/abilities.csv
 *
 * Expected HTML structure (pokebase uses CSS table display, not actual <table> tags):
 *   <div class="table-row ...">
 *     <span class="table-cell ...">
 *       <a href="/pokemon-champions/abilities/{slug}">{Name}</a>
 *     </span>
 *     <span class="table-cell ...">
 *       <div class="... whitespace-pre-wrap ...">{Effect}</div>
 *     </span>
 *   </div>
 */

import path from "node:path";
import * as cheerio from "cheerio";
import {
	DATA_DIR,
	fetchWithRetry,
	POKEBASE_BASE,
	RATE_LIMIT_DELAY,
	sleep,
	writeCSV,
} from "./scrape-utils";

const TOTAL_PAGES = 4;

type AbilityEntry = {
	name: string;
	effect: string;
};

async function scrapeAbilities(): Promise<void> {
	console.log("Scraping abilities from pokebase...");

	const abilities: AbilityEntry[] = [];

	for (let page = 1; page <= TOTAL_PAGES; page++) {
		const url = `${POKEBASE_BASE}/abilities?page=${page}`;
		console.log(`  Fetching page ${page}/${TOTAL_PAGES}: ${url}`);

		const res = await fetchWithRetry(url);
		if (!res) {
			throw new Error(`Failed to fetch abilities page ${page}`);
		}

		const html = await res.text();
		const $ = cheerio.load(html);

		// Each ability is in a link matching /pokemon-champions/abilities/{slug}
		const abilityLinks = $('a[href^="/pokemon-champions/abilities/"]').filter(
			function () {
				// Only get the main ability links, not navigation/sidebar links
				return $(this).closest('[class*="table-row"]').length > 0;
			},
		);

		let pageCount = 0;

		abilityLinks.each(function () {
			const href = $(this).attr("href") ?? "";
			const slug = href.replace("/pokemon-champions/abilities/", "");

			if (!slug) return;

			// The effect text is in a sibling table-cell, inside a div with whitespace-pre-wrap
			const row = $(this).closest('[class*="table-row"]');
			const cells = row.find('[class*="table-cell"]');

			let effect = "";
			if (cells.length >= 2) {
				const descCell = cells.eq(1);
				const descDiv = descCell.find('[class*="whitespace-pre-wrap"]');
				effect = descDiv.text().trim() || descCell.text().trim();
			}

			abilities.push({ name: slug, effect });
			pageCount++;
		});

		console.log(`    Found ${pageCount} abilities on page ${page}.`);

		// Check if there is a next page link beyond our expected last page
		if (page === TOTAL_PAGES) {
			const nextPageLink = $(`a[href*="page=${TOTAL_PAGES + 1}"]`);
			if (nextPageLink.length > 0) {
				console.warn(
					`  WARNING: A page ${TOTAL_PAGES + 1} link exists! The script may need updating to scrape more pages.`,
				);
			}
		}

		await sleep(RATE_LIMIT_DELAY);
	}

	// Deduplicate by name (just in case)
	const seen = new Set<string>();
	const unique: AbilityEntry[] = [];
	for (const a of abilities) {
		if (!seen.has(a.name)) {
			seen.add(a.name);
			unique.push(a);
		}
	}

	console.log(
		`\nTotal unique abilities: ${unique.length} (from ${abilities.length} raw entries)`,
	);

	// Write CSV
	const csvPath = path.join(DATA_DIR, "abilities.csv");
	const headers = ["Name", "Effect"];
	const rows = unique.map((a) => [a.name, a.effect]);
	writeCSV(csvPath, headers, rows);

	console.log(`Written to ${csvPath}`);
}

scrapeAbilities().catch((e) => {
	console.error("Fatal error:", e);
	process.exit(1);
});
