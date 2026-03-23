import { html } from "hono/html";
import { setServerState } from "iapi-ssr-processor";
import { loadPokemons } from "../utils.js";

const HomePage = async () => {
	await loadPokemons({ ids: [1] });
	setServerState("pokemon", { pokemonId: "1" });

	return html`
		<main class="max-w-7xl mx-auto px-4 py-8">
			<h1 class="text-3xl font-bold mb-4">Pokemon Website</h1>
			<div data-wp-interactive="pokemon" class="space-y-4">
				<p data-wp-text="state.pokemon.name"></p>
				<img src="public/images/logo.svg" alt="Pokemon Website logo" width="400"/>
			</div>
		</main>
	`;
};

export default HomePage;
