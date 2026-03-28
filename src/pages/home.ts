import { html } from "hono/html";
import { setServerState } from "iapi-ssr-processor";
import { loadPokemons } from "../utils.js";

const HomePage = async () => {
	await loadPokemons({ ids: [1] });
	setServerState("pokemon", { pokemonId: "1" });

	return html`
		<main>
			<h1>Pokemon Website</h1>
			<div data-wp-interactive="pokemon" class="space-y-4">
				<label class="block">
					<span class="text-sm font-medium">Pokemon ID:</span>
					<input
						type="number"
						min="1"
						data-wp-bind--value="state.pokemonId"
						data-wp-on--input="actions.changePokemonId"
						class="ml-2 border rounded px-2 py-1 w-20"
					/>
				</label>
				<p data-wp-text="state.pokemon.name"></p>
				<img data-wp-bind--src="state.pokemon.images.artwork" alt="Pokemon artwork" width="400"/>
			</div>
		</main>
	`;
};

export default HomePage;
