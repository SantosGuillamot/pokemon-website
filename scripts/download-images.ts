import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import { eq } from "drizzle-orm";
import { db } from "../src/db/client";
import { pokemons } from "../src/db/schema/index";

const ARTWORK_URL =
	"https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/{id}.png";

const OUTPUT_DIR = path.resolve("public/images/pokemon/artwork");

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

	process.exit(0);
}

main().catch((e) => {
	console.error(e);
	process.exit(1);
});
