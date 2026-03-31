import type { Pokemon } from "@pokemon-website/types/pokemons";
import { html } from "hono/html";
import { getServerData } from "iapi-ssr-processor";
import Card from "../components/Card.js";
import PokemonCard from "../components/PokemonCard.js";
import Hero from "../components/Hero.js";
import Section from "../components/Section.js";

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

			<div
				data-wp-interactive="pokemon/speeds"
				data-wp-context='{"currentSection": "whos-faster"}'
			>
				${Section({
					children: html`
						<h2 class="text-center mb-8">Learn Speeds</h2>
						<div class="flex flex-wrap justify-center gap-4">
							${Card({
								title: "Who's Faster?",
								description: "Guess which Pokemon has the higher speed stat.",
								element: "button",
								className: "max-w-sm w-full sm:max-w-none sm:flex-1",
								attrs: `type="button" data-wp-context='${JSON.stringify({ sectionId: "whos-faster" })}' data-wp-class--card-squared-active="state.isCurrentSection" data-wp-on--click="actions.selectSection"`,
							})}
							${Card({
								title: "Speeds Table",
								description: "Browse all Pokemon sorted by their speed stat.",
								element: "button",
								className: "max-w-sm w-full sm:max-w-none sm:flex-1",
								attrs: `type="button" data-wp-context='${JSON.stringify({ sectionId: "speeds-table" })}' data-wp-class--card-squared-active="state.isCurrentSection" data-wp-on--click="actions.selectSection"`,
							})}
							${Card({
								title: "Moves Priority",
								description: "See all moves sorted by their priority bracket.",
								element: "button",
								className: "max-w-sm w-full sm:max-w-none sm:flex-1",
								attrs: `type="button" data-wp-context='${JSON.stringify({ sectionId: "moves-priority" })}' data-wp-class--card-squared-active="state.isCurrentSection" data-wp-on--click="actions.selectSection"`,
							})}
						</div>
					`,
				})}

				${Section({
					bgColor: "rgb(from var(--color-black) r g b / 0.05)",
					class: "section-diagonal py-32",
					attrs: `data-wp-context='${JSON.stringify({ sectionId: "whos-faster", randomPokemons })}' data-wp-bind--hidden="!state.isCurrentSection"`,
					children: html`
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
				`,
				})}

				${Section({
					bgColor: "rgb(from var(--color-black) r g b / 0.05)",
					class: "section-diagonal py-32",
					attrs: `data-wp-context='${JSON.stringify({ sectionId: "speeds-table" })}' data-wp-bind--hidden="!state.isCurrentSection"`,
					children: html`
						<p>Table with all pokemons sorted by speed</p>
				`,
				})}

				${Section({
					bgColor: "rgb(from var(--color-black) r g b / 0.05)",
					class: "section-diagonal py-32",
					attrs: `data-wp-context='${JSON.stringify({ sectionId: "moves-priority" })}' data-wp-bind--hidden="!state.isCurrentSection"`,
					children: html`
						<p>Table with all moves sorted by priority</p>
				`,
				})}
			</div>

			

			
		</main>
	`;
};

export default WhosFasterPage;
