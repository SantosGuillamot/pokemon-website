import fs from "node:fs";
import path from "node:path";

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
	console.log("Downloading Pokemon artwork (1-151)...");

	fs.mkdirSync(OUTPUT_DIR, { recursive: true });

	let downloaded = 0;
	let skipped = 0;
	let failed = 0;

	for (let id = 1; id <= 151; id++) {
		const url = ARTWORK_URL.replace("{id}", String(id));
		const dest = path.join(OUTPUT_DIR, `${id}.png`);

		const result = await downloadImage(url, dest);

		if (result === "downloaded") downloaded++;
		else if (result === "skipped") skipped++;
		else failed++;

		await sleep(100);

		if (id % 25 === 0) {
			console.log(`  Processed ${id}/151 Pokemon...`);
		}
	}

	console.log(
		`Done! Downloaded: ${downloaded}, Skipped: ${skipped}, Failed: ${failed}`,
	);
}

main().catch((e) => {
	console.error(e);
	process.exit(1);
});
