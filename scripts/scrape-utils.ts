import fs from "node:fs";
import path from "node:path";
import { parse } from "csv-parse/sync";
import { stringify } from "csv-stringify/sync";

// ─── Constants ──────────────────────────────────────────────────────────────

export const RATE_LIMIT_DELAY = 200; // ms between requests (polite default)
export const POKEAPI_BASE = "https://pokeapi.co/api/v2";
export const POKEBASE_BASE = "https://pokebase.app/pokemon-champions";
export const POKEXPERTO_URL =
	"https://www.pokexperto.net/index2.php?seccion=pokemonchampions/seleccionMA";
export const DATA_DIR = path.resolve("data/champions");

// ─── Sleep ──────────────────────────────────────────────────────────────────

export function sleep(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

// ─── Fetch with Retry ───────────────────────────────────────────────────────

export async function fetchWithRetry(
	url: string,
	maxRetries = 3,
	delayMs = 1000,
): Promise<Response | null> {
	const MAX_RATE_LIMIT_RETRIES = 5;
	let rateLimitRetries = 0;
	let attempt = 0;

	while (attempt < maxRetries) {
		attempt++;
		try {
			const res = await fetch(url);

			if (res.ok) {
				return res;
			}

			if (res.status === 429) {
				// Rate limited -- wait longer before retry.
				// 429 retries do not count against the max retry budget.
				rateLimitRetries++;
				if (rateLimitRetries > MAX_RATE_LIMIT_RETRIES) {
					console.warn(
						`  Rate limited (429) ${rateLimitRetries} times on ${url}. Giving up.`,
					);
					return null;
				}
				console.warn(
					`  Rate limited (429) on ${url}. Waiting 10s before retry (${rateLimitRetries}/${MAX_RATE_LIMIT_RETRIES})...`,
				);
				await sleep(10_000);
				attempt--; // Do not count this against max retries
				continue;
			}

			if (res.status >= 500) {
				// Server error -- retry with exponential backoff
				console.warn(
					`  Server error (${res.status}) on ${url}. Attempt ${attempt}/${maxRetries}.`,
				);
				if (attempt < maxRetries) {
					await sleep(delayMs * 2 ** (attempt - 1));
				}
				continue;
			}

			// Client error (4xx other than 429) -- do not retry
			console.warn(
				`  HTTP ${res.status} for ${url}. Not retrying (client error).`,
			);
			return null;
		} catch (err) {
			console.warn(
				`  Network error fetching ${url} (attempt ${attempt}/${maxRetries}):`,
				err instanceof Error ? err.message : err,
			);
			if (attempt < maxRetries) {
				await sleep(delayMs * 2 ** (attempt - 1));
			}
		}
	}

	console.warn(`  All ${maxRetries} retries exhausted for ${url}.`);
	return null;
}

// ─── CSV I/O ────────────────────────────────────────────────────────────────

export function writeCSV(
	filePath: string,
	headers: string[],
	rows: (string | number | boolean | null | undefined)[][],
): void {
	ensureDir(path.dirname(filePath));
	const output = stringify([headers, ...rows], {
		quoted_string: true,
	});
	fs.writeFileSync(filePath, output, "utf-8");
}

export function readCSV<
	T extends Record<string, string> = Record<string, string>,
>(filePath: string): T[] {
	const content = fs.readFileSync(filePath, "utf-8");
	return parse(content, {
		columns: true,
		skip_empty_lines: true,
		trim: true,
	}) as T[];
}

// ─── Directory ──────────────────────────────────────────────────────────────

export function ensureDir(dirPath: string): void {
	fs.mkdirSync(dirPath, { recursive: true });
}

// ─── JSON Cache ─────────────────────────────────────────────────────────────

export function loadJsonCache<T>(filePath: string): T | null {
	try {
		if (fs.existsSync(filePath)) {
			const content = fs.readFileSync(filePath, "utf-8");
			return JSON.parse(content) as T;
		}
	} catch {
		console.warn(
			`  Warning: Could not load cache from ${filePath}. Starting fresh.`,
		);
	}
	return null;
}

export function saveJsonCache(filePath: string, data: unknown): void {
	ensureDir(path.dirname(filePath));
	fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
}

// ─── Name Normalization ─────────────────────────────────────────────────────

/**
 * Convert a display name to kebab-case slug.
 * Examples: "Thunder Punch" -> "thunder-punch", "Will-O-Wisp" -> "will-o-wisp"
 *
 * Note: This strips all characters that are not a-z, 0-9, or hyphens.
 * Periods, apostrophes, and other punctuation are silently removed.
 * This is intentional for slug generation (e.g., "Mr. Rime" -> "mr-rime").
 * Only use this function for display-name-to-slug conversion where the
 * source does not contain meaningful punctuation.
 */
export function toKebabCase(name: string): string {
	return name
		.trim()
		.toLowerCase()
		.replace(/\s+/g, "-")
		.replace(/[^a-z0-9-]/g, "");
}
