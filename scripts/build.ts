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
};

if (isDev) {
	const ctx = await esbuild.context(buildOptions);
	await ctx.watch();
	console.log("esbuild watching...");
} else {
	await esbuild.build(buildOptions);
	console.log("esbuild build complete.");
}
