import type { Pokemon } from "@pokemon-website/types/pokemon";
import { Hono } from "hono";
import { resetServerState, setServerState } from "iapi-ssr-processor";
import api from "../api/index.js";
import Layout from "../components/Layout.js";
import AboutPage from "../pages/about/page.js";
import HomePage from "../pages/home/page.js";

const app = new Hono();

app.get("/", async (c) => {
	resetServerState();
	const res = await api.request("/api/pokemon?limit=20");
	if (res.ok) {
		const pokemons = (await res.json()) as Pokemon[];
		const pokemonsMap: Record<string, Pokemon> = {};
		for (const pokemon of pokemons) {
			pokemonsMap[String(pokemon.id)] = pokemon;
		}
		setServerState("pokemon", {
			pokemons: pokemonsMap,
			pokemonId: pokemons.length > 0 ? String(pokemons[0].id) : "",
		});
	}
	return c.html(
		Layout({
			scripts: ["/public/js/global-stores/pokemon.js"],
			children: HomePage(),
		}),
	);
});

app.get("/about", (c) => {
	resetServerState();
	return c.html(
		Layout({
			title: "About",
			scripts: ["/public/js/pages/about/store.js"],
			children: AboutPage(),
		}),
	);
});

export default app;
