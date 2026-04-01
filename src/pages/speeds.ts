import type { Pokemon } from "@pokemon-website/types/pokemons";
import { html } from "hono/html";
import { getServerData } from "iapi-ssr-processor";
import Hero from "../components/Hero.js";
import PokemonCard from "../components/PokemonCard.js";
import QuizModeCard from "../components/QuizModeCard.js";
import QuizSection from "../components/QuizSection.js";
import Section from "../components/Section.js";
import { pickRandomPokemon, pickTwo } from "../utils/array.js";
import { defaultQuizContext } from "../utils/quiz.js";

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
	const guessSpeedInitial = pickRandomPokemon(pokemons);
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
							${QuizModeCard({
								title: "Who's Faster?",
								description: "Guess which Pokemon has the higher speed stat.",
								sectionId: "whos-faster",
							})}
							${QuizModeCard({
								title: "Guess Speed",
								description: "Guess the base speed of a Pokemon.",
								sectionId: "guess-speed",
							})}
							${QuizModeCard({
								title: "Speeds Table",
								description: "Browse all Pokemon sorted by their speed stat.",
								sectionId: "speeds-table",
							})}
						</div>
					`,
				})}

				${QuizSection({
					sectionId: "whos-faster",
					sectionContext: { randomPokemons },
					quizContext: {
						...defaultQuizContext(),
						randomPokemons,
						animationProgress: 0,
						guessedIndex: null,
					},
					watchCallback: "callbacks.storeAnswer",
					restartAction: "actions.restart",
					children: html`
					<h3 class="sr-only">Which Pokemon is faster?</h3>
					<div class="flex flex-col sm:flex-row items-center justify-center gap-4 py-10 px-6">
						${SpeedPokemonCard(0, pokemonA)}
						<p class="text-h1 font-heading-retro px-12" aria-hidden="true">VS</p>
						${SpeedPokemonCard(1, pokemonB)}
					</div>
					`,
				})}

				${QuizSection({
					sectionId: "guess-speed",
					quizContext: {
						...defaultQuizContext(guessSpeedInitial),
						animationProgress: 0,
						speedGuess: "",
						correctSpeed: null,
					},
					watchCallback: "callbacks.storeGuessSpeedAnswer",
					restartAction: "actions.restartGuessSpeed",
					children: html`
					<h3 class="sr-only">Guess the speed</h3>
					<div class="flex flex-col items-center justify-center gap-6 py-10 px-6">
						<div
							class="w-full max-w-[25rem] relative"
							data-wp-context---pokemon='pokemon::${JSON.stringify({ _pokemonDexNumber: String(guessSpeedInitial.dexNumber), _pokemonFormName: guessSpeedInitial.formName })}'
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
					`,
				})}

				${Section({
					class: "section-diagonal py-32",
					attrs: `data-wp-context='${JSON.stringify({ sectionId: "speeds-table" })}' data-wp-bind--hidden="!state.isCurrentSection"`,
					children: html`
					<div class="rounded-lg p-6 quiz-bg">
						<p>Table with all pokemons sorted by speed</p>
					</div>
				`,
				})}

				${Section({
					class: "section-diagonal py-32",
					attrs: `data-wp-context='${JSON.stringify({ sectionId: "moves-priority" })}' data-wp-bind--hidden="!state.isCurrentSection"`,
					children: html`
					<div class="rounded-lg p-6 quiz-bg">
						<p>Table with all moves sorted by priority</p>
					</div>
				`,
				})}
			</div>



		</main>
	`;
};

export default WhosFasterPage;
