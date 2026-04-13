/**
 * Generate items CSV from CHAMPION_ITEMS + MEGA_STONE_MAP + PokeAPI metadata.
 * Output: data/champions/items.csv
 */

import path from "node:path";
import { CHAMPION_ITEMS, MEGA_STONE_MAP } from "./champions-data";
import {
	DATA_DIR,
	fetchWithRetry,
	POKEAPI_BASE,
	sleep,
	writeCSV,
} from "./scrape-utils";

type ItemEntry = {
	name: string;
	category: string;
	effect: string;
	isMegaStone: string;
	megaPokemon: string;
};

async function main(): Promise<void> {
	console.log("Generating items CSV...");

	// Collect all item slugs: CHAMPION_ITEMS union keys of MEGA_STONE_MAP
	const allItemSlugs = new Set([
		...CHAMPION_ITEMS,
		...Object.keys(MEGA_STONE_MAP),
	]);

	console.log(`  Total unique items: ${allItemSlugs.size}`);

	const items: ItemEntry[] = [];

	const slugsArray = [...allItemSlugs].sort();

	for (let i = 0; i < slugsArray.length; i++) {
		const slug = slugsArray[i];

		// Fetch PokeAPI item data
		const url = `${POKEAPI_BASE}/item/${slug}`;
		const res = await fetchWithRetry(url);

		let category = "unknown";
		let effect = "";

		if (res) {
			const data = (await res.json()) as {
				name: string;
				category: { name: string };
				effect_entries: {
					short_effect: string;
					language: { name: string };
				}[];
			};

			category = data.category?.name ?? "unknown";
			effect =
				data.effect_entries.find((e) => e.language.name === "en")
					?.short_effect ?? "";
		} else {
			console.warn(
				`  Could not fetch PokeAPI data for item: ${slug}. Using defaults.`,
			);
		}

		// Determine mega stone status
		const megaVarietyName = MEGA_STONE_MAP[slug] ?? null;
		const isMegaStone = megaVarietyName !== null;

		items.push({
			name: slug,
			category,
			effect,
			isMegaStone: isMegaStone ? "Yes" : "",
			megaPokemon: megaVarietyName ?? "",
		});

		if ((i + 1) % 20 === 0 || i + 1 === slugsArray.length) {
			console.log(`  Processed ${i + 1}/${slugsArray.length} items...`);
		}

		await sleep(100);
	}

	// Write CSV
	const csvPath = path.join(DATA_DIR, "items.csv");
	const headers = ["Name", "Category", "Effect", "IsMegaStone", "MegaPokemon"];
	const rows = items.map((item) => [
		item.name,
		item.category,
		item.effect,
		item.isMegaStone,
		item.megaPokemon,
	]);
	writeCSV(csvPath, headers, rows);

	console.log(`\nWritten ${items.length} items to ${csvPath}`);
}

main().catch((e) => {
	console.error("Fatal error:", e);
	process.exit(1);
});
