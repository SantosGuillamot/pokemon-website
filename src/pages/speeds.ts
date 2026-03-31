import { html } from "hono/html";
import { getServerData } from "iapi-ssr-processor";
import PokemonCard from "../components/PokemonCard.js";
import Hero from "../sections/Hero.js";
import Section from "../sections/Section.js";

const WhosFasterPage = () => {
	// Get pokemons from server.
	// Randomize two pokemons on page load.
	const { state } = getServerData();
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
						data-wp-context='{"randomPokemons":[{"dexNumber":9,"formName":null},{"dexNumber":6,"formName":null}]}'
					>
						<div>
							<div
								data-wp-context='{"pokemonIndex": 0}'
								data-wp-context---pokemon='pokemon::{"_pokemonDexNumber": "9"}'
								data-wp-watch="callbacks.updateContext"
							>
								${PokemonCard()}
							</div>
							<p>VS</p>
							<div
								data-wp-context='{"pokemonIndex": 1}'
								data-wp-context---pokemon='pokemon::{"_pokemonDexNumber": "6"}'
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
