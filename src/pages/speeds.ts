import type { Pokemon } from "@pokemon-website/types/pokemons";
import { html } from "hono/html";
import { getServerData } from "iapi-ssr-processor";
import Card from "../components/Card.js";
import Hero from "../components/Hero.js";
import PokemonCard from "../components/PokemonCard.js";
import Section from "../components/Section.js";
import { pickTwo } from "../utils/array.js";

const SpeedQuizStatus = (restartAction: string) => html`
	<div class="speed-quiz-status font-heading-retro text-h3" aria-live="assertive">
		<p data-wp-bind--hidden="state.isIncorrect">
			Streak: <span data-wp-text="context.streak">0</span>
		</p>
		<div data-wp-bind--hidden="!state.isIncorrect" class="flex flex-wrap items-center gap-4 sm:gap-12">
			<p class="text-primary">GAME OVER</p>
			<p>Final streak: <span data-wp-text="context.finalStreak">0</span></p>
			<button
				type="button"
				class="btn btn-primary"
				data-wp-on--click="${restartAction}"
			>Try again</button>
		</div>
	</div>
`;

const SpeedRevealOverlay = (
	textBinding: string,
	correctBinding: string,
	incorrectBinding: string,
) => html`
	<div
		class="speed-overlay-bg absolute inset-0 z-10 flex items-center justify-center rounded-sm"
		aria-label="Speed stat"
		data-wp-bind--hidden="state.isWaiting"
	>
		<span
			class="text-h1 font-heading-retro flex items-center justify-center w-28 h-28 rounded-full bg-black text-white"
			data-wp-text="${textBinding}"
			data-wp-class--speed-correct="${correctBinding}"
			data-wp-class--speed-incorrect="${incorrectBinding}"
		></span>
	</div>
`;

const SpeedPokemonCard = (index: number, pokemon: Pokemon) => html`
	<button
		type="button"
		class="speed-pokemon-btn w-full max-w-[25rem] sm:flex-1 cursor-pointer disabled:cursor-default relative"
		aria-label="Select ${pokemon.name.replaceAll("-", " ")} as faster"
		data-wp-context='{"pokemonIndex": ${index}}'
		data-wp-context---pokemon='pokemon::${JSON.stringify({ _pokemonDexNumber: String(pokemon.dexNumber), _pokemonFormName: pokemon.formName })}'
		data-wp-watch="callbacks.updateContext"
		data-wp-on--click="actions.guessSpeed"
		data-wp-bind--disabled="!state.isWaiting"
	>
		${SpeedRevealOverlay(
			"state.displayedSpeed",
			"state.isGuessedCorrect",
			"state.isGuessedIncorrect",
		)}
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
	if (pokemons.length < 2) {
		return html`<main><p>Not enough Pokemon loaded.</p></main>`;
	}
	const [pokemonA, pokemonB] = pickTwo(pokemons);
	const randomPokemons = [
		{ dexNumber: pokemonA.dexNumber, formName: pokemonA.formName },
		{ dexNumber: pokemonB.dexNumber, formName: pokemonB.formName },
	];
	const guessSpeedPokemon =
		pokemons[Math.floor(Math.random() * pokemons.length)];
	const guessSpeedInitial = {
		dexNumber: guessSpeedPokemon.dexNumber,
		formName: guessSpeedPokemon.formName,
	};
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
								title: "Guess Speed",
								description: "Guess the base speed of a Pokemon.",
								element: "button",
								className: "max-w-sm w-full sm:max-w-none sm:flex-1",
								attrs: `type="button" data-wp-context='${JSON.stringify({ sectionId: "guess-speed" })}' data-wp-class--card-squared-active="state.isCurrentSection" data-wp-on--click="actions.selectSection"`,
							})}
							${Card({
								title: "Speeds Table",
								description: "Browse all Pokemon sorted by their speed stat.",
								element: "button",
								className: "max-w-sm w-full sm:max-w-none sm:flex-1",
								attrs: `type="button" data-wp-context='${JSON.stringify({ sectionId: "speeds-table" })}' data-wp-class--card-squared-active="state.isCurrentSection" data-wp-on--click="actions.selectSection"`,
							})}
						</div>
					`,
				})}

				${Section({
					class: "section-diagonal py-32",
					attrs: `data-wp-context='${JSON.stringify({ sectionId: "whos-faster", randomPokemons })}' data-wp-bind--hidden="!state.isCurrentSection"`,
					children: html`
					<div
						class="speed-quiz speed-quiz-bg overflow-hidden"
						data-wp-context='${JSON.stringify({ randomPokemons, streak: 0, quizState: "waiting", animationProgress: 0, guessedIndex: null, finalStreak: 0 })}'
						data-wp-watch="callbacks.storeAnswer"
					>
						${SpeedQuizStatus("actions.restart")}
						<h3 class="sr-only">Which Pokemon is faster?</h3>
						<div class="flex flex-col sm:flex-row items-center justify-center gap-4 py-10 px-6">
							${SpeedPokemonCard(0, pokemonA)}
							<p class="text-h1 font-heading-retro px-12" aria-hidden="true">VS</p>
							${SpeedPokemonCard(1, pokemonB)}
						</div>
					</div>
				`,
				})}

				${Section({
					class: "section-diagonal py-32",
					attrs: `data-wp-context='${JSON.stringify({ sectionId: "guess-speed" })}' data-wp-bind--hidden="!state.isCurrentSection"`,
					children: html`
					<div
						class="speed-quiz speed-quiz-bg overflow-hidden"
						data-wp-context='${JSON.stringify({ randomPokemon: guessSpeedInitial, streak: 0, quizState: "waiting", animationProgress: 0, speedGuess: "", correctSpeed: null, finalStreak: 0 })}'
						data-wp-watch="callbacks.storeGuessSpeedAnswer"
					>
						${SpeedQuizStatus("actions.restartGuessSpeed")}
						<h3 class="sr-only">Guess the speed</h3>
						<div class="flex flex-col items-center justify-center gap-6 py-10 px-6">
							<div
								class="w-full max-w-[25rem] relative"
								data-wp-context---pokemon='pokemon::${JSON.stringify({ _pokemonDexNumber: String(guessSpeedPokemon.dexNumber), _pokemonFormName: guessSpeedPokemon.formName })}'
								data-wp-watch="callbacks.updateGuessSpeedContext"
							>
								${SpeedRevealOverlay(
									"state.displayedGuessSpeed",
									"state.isCorrect",
									"state.isIncorrect",
								)}
								${PokemonCard()}
							</div>
							<form
								class="flex items-center gap-4"
								data-wp-on--submit="actions.submitGuessSpeed"
							>
								<label class="sr-only" for="speed-guess-input">Enter speed guess</label>
								<input
									id="speed-guess-input"
									type="number"
									placeholder="Speed?"
									min="0"
									max="255"
									class="w-24 px-4 py-[12px] text-center font-heading text-paragraph leading-paragraph border border-black [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
									data-wp-on--input="actions.updateSpeedGuess"
									data-wp-bind--value="context.speedGuess"
									data-wp-bind--disabled="!state.isWaiting"
								/>
								<button
									type="submit"
									class="btn btn-primary"
									data-wp-bind--disabled="!state.isWaiting"
								>Guess</button>
							</form>
						</div>
					</div>
				`,
				})}

				${Section({
					class: "section-diagonal py-32",
					attrs: `data-wp-context='${JSON.stringify({ sectionId: "speeds-table" })}' data-wp-bind--hidden="!state.isCurrentSection"`,
					children: html`
					<div class="rounded-lg p-6 speed-quiz-bg">
						<p>Table with all pokemons sorted by speed</p>
					</div>
				`,
				})}

				${Section({
					class: "section-diagonal py-32",
					attrs: `data-wp-context='${JSON.stringify({ sectionId: "moves-priority" })}' data-wp-bind--hidden="!state.isCurrentSection"`,
					children: html`
					<div class="rounded-lg p-6 speed-quiz-bg">
						<p>Table with all moves sorted by priority</p>
					</div>
				`,
				})}
			</div>




		</main>
	`;
};

export default WhosFasterPage;
