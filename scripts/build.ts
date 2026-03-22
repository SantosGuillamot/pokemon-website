import * as esbuild from "esbuild";

const isDev = process.argv.includes("--watch");

const entryPoints = [
	"src/client/stores/pokemons.ts",
	"src/client/stores/router.ts",
	"src/client/stores/pages/about.ts",
];

const buildOptions: esbuild.BuildOptions = {
	entryPoints,
	bundle: true,
	splitting: true,
	format: "esm",
	outdir: "public/js",
	outbase: "src/client",
	target: "es2022",
	minify: !isDev,
	sourcemap: isDev,
	external: [
		"@wordpress/interactivity",
		"@wordpress/interactivity-router",
		"@pokemon-website/stores/*",
	],
};

// Vendor builds — run once (only change on `npm install`).
await esbuild.build({
	entryPoints: ["node_modules/@wordpress/interactivity/build-module/index.mjs"],
	bundle: true,
	format: "esm",
	outfile: "public/js/@wordpress/interactivity.js",
	target: "es2022",
	minify: !isDev,
	define: {
		"globalThis.SCRIPT_DEBUG": "false",
	},
});

await esbuild.build({
	entryPoints: [
		"node_modules/@wordpress/interactivity-router/build-module/index.mjs",
	],
	bundle: true,
	format: "esm",
	outfile: "public/js/@wordpress/interactivity-router.js",
	// Don't use @wordpress/a11y for now. It is used for screen reader announcements only.
	external: ["@wordpress/interactivity", "@wordpress/a11y"],
	target: "es2022",
	minify: !isDev,
	define: {
		"globalThis.SCRIPT_DEBUG": "false",
	},
});

// Project code build.
if (isDev) {
	const ctx = await esbuild.context(buildOptions);
	await ctx.watch();
	console.log("esbuild watching...");
} else {
	await esbuild.build(buildOptions);
	console.log("esbuild build complete.");
}
