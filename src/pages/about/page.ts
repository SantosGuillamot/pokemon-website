import { html } from "hono/html";
import { setServerState } from "iapi-ssr-processor";
import { loadPokemons } from "../../server/utils.js";

const AboutPage = async () => {
	await loadPokemons({ ids: [1] });
	setServerState("pokemon", { pokemonId: "1" });

	return html`
		<main class="max-w-7xl mx-auto px-4 py-8">
			<h1 class="text-3xl font-bold mb-4">About</h1>
			<div data-wp-interactive="about">
				<p data-wp-text="state.greeting"></p>
			</div>
		</main>
	`;
};

export default AboutPage;
