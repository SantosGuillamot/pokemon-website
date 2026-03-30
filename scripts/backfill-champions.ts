import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import { and, eq, inArray, isNull, like } from "drizzle-orm";
import { db } from "../src/db/client";
import { pokemons } from "../src/db/schema/pokemons";

/**
 * Mapping from parenthetical form names in CHAMPIONS.md to DB form_name values.
 */
const FORM_NAME_MAP: Record<string, string> = {
	Alolan: "alola",
	Hisuian: "hisui",
	Galarian: "galar",
	e: "eternal",
};

interface ChampionEntry {
	dexNumber: number;
	formName: string | null; // null means default form
}

function parseChampionsMd(content: string): ChampionEntry[] {
	const entries: ChampionEntry[] = [];
	const lines = content.split("\n");

	for (const line of lines) {
		// Match table rows like: | #0006 | Charizard |
		const match = line.match(/^\|\s*#(\d+)\s*\|\s*(.+?)\s*\|$/);
		if (!match) continue;

		const dexNumber = Number.parseInt(match[1], 10);
		const nameField = match[2].trim();

		// Check for parenthetical form indicator
		const formMatch = nameField.match(/\((.+?)\)/);
		let formName: string | null = null;

		if (formMatch) {
			const formLabel = formMatch[1];
			const mapped = FORM_NAME_MAP[formLabel];
			if (!mapped) {
				console.warn(
					`Unknown form label "${formLabel}" for dex #${dexNumber} — skipping`,
				);
				continue;
			}
			formName = mapped;
		}

		entries.push({ dexNumber, formName });
	}

	return entries;
}

async function main() {
	const championsPath = path.resolve(
		import.meta.dirname,
		"..",
		"CHAMPIONS_LIST.md",
	);
	const content = fs.readFileSync(championsPath, "utf-8");
	const entries = parseChampionsMd(content);

	console.log(`Parsed ${entries.length} entries from CHAMPIONS_LIST.md`);

	let updatedCount = 0;
	let notFoundCount = 0;
	const notFoundEntries: string[] = [];

	// Update each specific entry
	for (const entry of entries) {
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
			// No row with formName IS NULL — this Pokemon only has named forms.
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
	const allDexNumbers = [...new Set(entries.map((e) => e.dexNumber))];

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

	console.log(`\nSummary:`);
	console.log(`  Direct entries updated: ${updatedCount}`);
	console.log(`  Mega forms updated: ${megaResult.length}`);
	console.log(`  Total updated: ${updatedCount + megaResult.length}`);

	if (notFoundCount > 0) {
		console.log(`  Not found (${notFoundCount}):`);
		for (const entry of notFoundEntries) {
			console.log(`    - ${entry}`);
		}
	}

	process.exit(0);
}

main().catch((err) => {
	console.error("Backfill failed:", err);
	process.exit(1);
});
