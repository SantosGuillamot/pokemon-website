import { html } from "hono/html";

const IndexPage = () => {
	return html`
		<main class="max-w-7xl mx-auto px-4 py-8">
			<h1 class="text-3xl font-bold mb-4">Pokemon Website</h1>
			<div data-wp-interactive="pokemon" class="space-y-4">
				<div class="flex gap-2">
					<input
						type="number"
						min="1"
						value="1"
						data-wp-on--input="actions.updateId"
						class="px-3 py-2 bg-gray-800 border border-gray-700 rounded text-gray-100 w-24"
					/>
					<button
						type="button"
						data-wp-on--click="actions.fetchPokemon"
						class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
					>
						Fetch
					</button>
				</div>
				<p data-wp-text="state.pokemon.name"></p>
			</div>
		</main>
	`;
};

export default IndexPage;
