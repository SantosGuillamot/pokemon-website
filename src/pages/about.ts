import { html } from "hono/html";
import { setServerState } from "iapi-ssr-processor";
import { loadPokemons } from "../utils.js";

const AboutPage = async () => {
	await loadPokemons({ ids: [1] });
	setServerState("pokemon", { pokemonId: "1" });

	return html`
		<main>
			<h1 class="text-3xl font-bold mb-4">About</h1>
			<div data-wp-interactive="about">
				<p data-wp-text="state.greeting"></p>
				<img data-wp-bind--src="pokemon::state.pokemon.images.artwork" alt="Pokemon artwork" width="400"/>
			</div>
		</main>
	`;
};

export default AboutPage;
