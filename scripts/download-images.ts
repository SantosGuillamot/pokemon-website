import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import { eq } from "drizzle-orm";
import { db } from "../src/db/client";
import { items, pokemons } from "../src/db/schema/index";

const ARTWORK_URL =
	"https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/{id}.png";

const OUTPUT_DIR = path.resolve("public/images/pokemon/artwork");

const ITEM_SPRITE_URL =
	"https://www.serebii.net/itemdex/sprites/sv/{name}.png";

const MEGA_STONE_SPRITE_URL =
	"https://www.serebii.net/itemdex/sprites/za/{name}.png";

const ITEMS_OUTPUT_DIR = path.resolve("public/images/items");

function sleep(ms: number) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

async function downloadImage(
	url: string,
	dest: string,
): Promise<"downloaded" | "skipped" | "failed"> {
	if (fs.existsSync(dest)) {
		return "skipped";
	}

	try {
		const res = await fetch(url);
		if (!res.ok) {
			console.warn(`  Failed to fetch ${url} (status ${res.status})`);
			return "failed";
		}

		const buffer = Buffer.from(await res.arrayBuffer());
		fs.writeFileSync(dest, buffer);
		return "downloaded";
	} catch (err) {
		console.warn(`  Error downloading ${url}:`, err);
		return "failed";
	}
}

async function main() {
	console.log("Fetching Pokemon list from database...");

	const pokemonRows = await db
		.select({
			id: pokemons.id,
			apiId: pokemons.apiId,
			name: pokemons.name,
			formName: pokemons.formName,
		})
		.from(pokemons);

	const total = pokemonRows.length;
	console.log(`Found ${total} Pokemon. Downloading artwork...`);

	fs.mkdirSync(OUTPUT_DIR, { recursive: true });

	let downloaded = 0;
	let skipped = 0;
	let failed = 0;

	for (let i = 0; i < total; i++) {
		const pokemon = pokemonRows[i];
		const label = pokemon.formName
			? `${pokemon.name} (${pokemon.formName})`
			: pokemon.name;

		const url = ARTWORK_URL.replace("{id}", String(pokemon.apiId));
		const dest = path.join(OUTPUT_DIR, `${pokemon.apiId}.png`);

		const result = await downloadImage(url, dest);

		if (result === "downloaded") {
			downloaded++;
			const imageUrl = `/images/pokemon/artwork/${pokemon.apiId}.png`;
			await db
				.update(pokemons)
				.set({ imageUrl })
				.where(eq(pokemons.id, pokemon.id));
		} else if (result === "skipped") {
			skipped++;
		} else {
			failed++;
			console.warn(
				`  No artwork available for ${label} (api_id=${pokemon.apiId})`,
			);
			await db
				.update(pokemons)
				.set({ imageUrl: null })
				.where(eq(pokemons.id, pokemon.id));
		}

		await sleep(100);

		if ((i + 1) % 25 === 0 || i + 1 === total) {
			console.log(`  Processed ${i + 1}/${total} Pokemon...`);
		}
	}

	console.log(
		`Done! Downloaded: ${downloaded}, Skipped: ${skipped}, Failed: ${failed}`,
	);

	// --- Item sprites ---
	console.log("\nFetching item list from database...");

	const itemRows = await db
		.select({
			id: items.id,
			name: items.name,
			isMegaStone: items.isMegaStone,
		})
		.from(items);

	const itemTotal = itemRows.length;
	console.log(`Found ${itemTotal} items. Downloading sprites...`);

	fs.mkdirSync(ITEMS_OUTPUT_DIR, { recursive: true });

	let itemDownloaded = 0;
	let itemSkipped = 0;
	let itemFailed = 0;

	for (let i = 0; i < itemTotal; i++) {
		const item = itemRows[i];

		const baseUrl = item.isMegaStone ? MEGA_STONE_SPRITE_URL : ITEM_SPRITE_URL;
		const url = baseUrl.replace("{name}", item.name.replace(/-/g, ""));
		const dest = path.join(ITEMS_OUTPUT_DIR, `${item.name}.png`);

		const result = await downloadImage(url, dest);

		if (result === "downloaded") {
			itemDownloaded++;
			const imageUrl = `/images/items/${item.name}.png`;
			await db.update(items).set({ imageUrl }).where(eq(items.id, item.id));
		} else if (result === "skipped") {
			itemSkipped++;
			const imageUrl = `/images/items/${item.name}.png`;
			await db.update(items).set({ imageUrl }).where(eq(items.id, item.id));
		} else {
			itemFailed++;
			console.warn(`  No sprite available for item "${item.name}"`);
			await db
				.update(items)
				.set({ imageUrl: null })
				.where(eq(items.id, item.id));
		}

		await sleep(100);

		if ((i + 1) % 25 === 0 || i + 1 === itemTotal) {
			console.log(`  Processed ${i + 1}/${itemTotal} items...`);
		}
	}

	console.log(
		`Done! Downloaded: ${itemDownloaded}, Skipped: ${itemSkipped}, Failed: ${itemFailed}`,
	);

	process.exit(0);
}

main().catch((e) => {
	console.error(e);
	process.exit(1);
});
