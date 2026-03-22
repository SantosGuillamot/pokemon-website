import { html } from "hono/html";

const HomePage = () => {
	return html`
		<main class="max-w-7xl mx-auto px-4 py-8">
			<h1 class="text-3xl font-bold mb-4">Pokemon Website</h1>
			<div data-wp-interactive="pokemon" class="space-y-4">
				<p data-wp-text="state.pokemon.name"></p>
			</div>
		</main>
	`;
};

export default HomePage;
