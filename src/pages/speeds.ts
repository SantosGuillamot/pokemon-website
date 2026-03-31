import type { Pokemon } from "@pokemon-website/types/pokemons";
import { html } from "hono/html";
import { getServerData } from "iapi-ssr-processor";
import Card from "../components/Card.js";
import Hero from "../components/Hero.js";
import PokemonCard from "../components/PokemonCard.js";
import Section from "../components/Section.js";

function pickTwo(arr: Pokemon[]): [Pokemon, Pokemon] {
	const i = Math.floor(Math.random() * arr.length);
	let j: number;
	do {
		j = Math.floor(Math.random() * arr.length);
	} while (j === i);
	return [arr[i], arr[j]];
}

const SpeedPokemonCard = (index: number, pokemon: Pokemon) => html`
	<button
		type="button"
		class="w-full sm:flex-1 cursor-pointer disabled:cursor-default relative"
		aria-label="Select this Pokemon as faster"
		data-wp-context='{"pokemonIndex": ${index}}'
		data-wp-context---pokemon='pokemon::${JSON.stringify({ _pokemonDexNumber: String(pokemon.dexNumber), _pokemonFormName: pokemon.formName })}'
		data-wp-watch="callbacks.updateContext"
		data-wp-on--click="actions.guessSpeed"
		data-wp-bind--disabled="!state.isWaiting"
	>
		<div
			class="absolute inset-0 z-10 flex items-center justify-center rounded-sm"
			style="background-color: rgb(from var(--color-black) r g b / 0.2)"
			role="status"
			aria-label="Speed stat"
			data-wp-bind--hidden="state.isWaiting"
		>
			<span
				class="text-h1 font-heading-retro flex items-center justify-center w-28 h-28 rounded-full bg-black text-primary"
				data-wp-text="state.displayedSpeed"
				data-wp-class--speed-correct="state.isGuessedCorrect"
				data-wp-class--speed-incorrect="state.isGuessedIncorrect"
			></span>
		</div>
		${PokemonCard()}
	</button>
`;

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
				data-wp-context='{"currentSection": null}'
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
					class: "section-diagonal py-32",
					attrs: `data-wp-context='${JSON.stringify({ sectionId: "whos-faster", randomPokemons })}' data-wp-bind--hidden="!state.isCurrentSection"`,
					children: html`
					<div
						class="speed-quiz rounded-lg py-10 px-6 flex flex-col items-center gap-6"
						style="background-color: rgb(from var(--color-fog) r g b / 0.6)"
						data-wp-context='${JSON.stringify({ randomPokemons, streak: 0, quizState: "waiting", animationProgress: 0, guessedIndex: null })}'
						data-wp-watch="callbacks.storeAnswer"
					>
						<h3>Who's Faster?</h3>
						<div class="flex flex-col sm:flex-row items-center justify-center gap-4">
							${SpeedPokemonCard(0, pokemonA)}
							<p class="text-h1 font-heading-retro" aria-hidden="true">VS</p>
							<span class="sr-only">versus</span>
							${SpeedPokemonCard(1, pokemonB)}
						</div>
						<p>Current streak: <strong data-wp-text="context.streak">0</strong></p>
					</div>
				`,
				})}

				${Section({
					class: "section-diagonal py-32",
					attrs: `data-wp-context='${JSON.stringify({ sectionId: "speeds-table" })}' data-wp-bind--hidden="!state.isCurrentSection"`,
					children: html`
					<div class="rounded-lg p-6" style="background-color: rgb(from var(--color-fog) r g b / 0.6)">
						<p>Table with all pokemons sorted by speed</p>
					</div>
				`,
				})}

				${Section({
					class: "section-diagonal py-32",
					attrs: `data-wp-context='${JSON.stringify({ sectionId: "moves-priority" })}' data-wp-bind--hidden="!state.isCurrentSection"`,
					children: html`
					<div class="rounded-lg p-6" style="background-color: rgb(from var(--color-fog) r g b / 0.6)">
						<p>Table with all moves sorted by priority</p>
					</div>
				`,
				})}
			</div>

			

			
		</main>
	`;
};

export default WhosFasterPage;
