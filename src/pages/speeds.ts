import type { Pokemon } from "@pokemon-website/types/pokemons";
import { html } from "hono/html";
import { getServerData } from "iapi-ssr-processor";
import PokemonCard from "../components/PokemonCard.js";
import Hero from "../sections/Hero.js";
import Section from "../sections/Section.js";

function pickTwo(arr: Pokemon[]): [Pokemon, Pokemon] {
	const i = Math.floor(Math.random() * arr.length);
	let j: number;
	do {
		j = Math.floor(Math.random() * arr.length);
	} while (j === i);
	return [arr[i], arr[j]];
}

const WhosFasterPage = () => {
	// Get pokemons from server.
	// Randomize two pokemons on page load.
	const { state } = getServerData() as unknown as {
		state: { pokemon: { pokemons: Record<string, Pokemon> } };
	};
	const pokemons = Object.values(state.pokemon.pokemons);
	const [pokemonA, pokemonB] = pickTwo(pokemons);
	const randomPokemons = [
		{ dexNumber: pokemonA.dexNumber, formName: pokemonA.formName },
		{ dexNumber: pokemonB.dexNumber, formName: pokemonB.formName },
	];
	return html`
		<main>
			${Hero({
				title: "Who's Faster?",
				description:
					"Two Pokemon appear side by side. Guess which one is faster based on their speed stat — or if they're tied. One wrong answer ends your streak!",
				image: "/images/pokemon/artwork/8.png",
				imageBg: "/images/pokemon/artwork/9.png",
			})}

			${Section({
				children: html`
					<p>Buttons to select the mode</p>
				`,
			})}

			${Section({
				children: html`
					<div
						data-wp-interactive="pokemon/speeds"
						data-wp-context='${JSON.stringify({ randomPokemons })}'
					>
						<div>
							<div
								data-wp-context='{"pokemonIndex": 0}'
								data-wp-context---pokemon='pokemon::${JSON.stringify({ _pokemonDexNumber: String(pokemonA.dexNumber), _pokemonFormName: pokemonA.formName })}'
								data-wp-watch="callbacks.updateContext"
							>
								${PokemonCard()}
							</div>
							<p>VS</p>
							<div
								data-wp-context='{"pokemonIndex": 1}'
								data-wp-context---pokemon='pokemon::${JSON.stringify({ _pokemonDexNumber: String(pokemonB.dexNumber), _pokemonFormName: pokemonB.formName })}'
								data-wp-watch="callbacks.updateContext"
							>
								${PokemonCard()}
							</div>
						</div>
						<div>
							<button type="button" class="btn btn-primary" data-wp-on--click="actions.randomizePokemons">
								Change Pokemons
							</button>
							<button type="button" class="btn btn-secondary" disabled>
								They're equal
							</button>
							<button type="button" class="btn btn-primary" disabled>
								Pokemon B is faster
							</button>
						</div>
						<p>Current streak: <strong>0</strong></p>
					</div>
				`,
			})}
		</main>
	`;
};

export default WhosFasterPage;
