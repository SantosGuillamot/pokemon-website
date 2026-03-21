import * as esbuild from "esbuild";

const isDev = process.argv.includes("--watch");

const entryPoints = [
	"src/global-stores/pokemon.ts",
	"src/global-stores/router.ts",
	"src/pages/about/store.ts",
];

const buildOptions: esbuild.BuildOptions = {
	entryPoints,
	bundle: true,
	splitting: true,
	format: "esm",
	outdir: "public/js",
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
	entryPoints: [
		"node_modules/@wordpress/interactivity/build-module/index.mjs",
	],
	bundle: true,
	format: "esm",
	outfile: "public/js/@wordpress/interactivity.js",
	target: "es2022",
	minify: !isDev,
});

await esbuild.build({
	entryPoints: [
		"node_modules/@wordpress/interactivity-router/build-module/index.mjs",
	],
	bundle: true,
	format: "esm",
	outfile: "public/js/@wordpress/interactivity-router.js",
	external: ["@wordpress/interactivity"],
	target: "es2022",
	minify: !isDev,
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
