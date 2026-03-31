import type { Pokemon } from "@pokemon-website/types/pokemons";
import type { Type } from "@pokemon-website/types/types";
import { html } from "hono/html";
import { getServerData } from "iapi-ssr-processor";
import Hero from "../components/Hero.js";
import PokemonCard from "../components/PokemonCard.js";
import QuizModeCard from "../components/QuizModeCard.js";
import QuizSection from "../components/QuizSection.js";
import Section from "../components/Section.js";
import { pickRandomPokemon } from "../utils/array.js";
import { defaultQuizContext } from "../utils/quiz.js";

const TypeRow = (type: Type) => html`
	<div
		class="type-guess-row"
		data-wp-context='${JSON.stringify({ typeId: type.id })}'
	>
		<img src="${type.imageSmall}" alt="${type.name}" class="type-guess-icon" width="32" height="32" />
		<span class="type-guess-name">${type.name}</span>
		<select
			class="type-guess-select"
			data-wp-on--change="actions.setTypeGuess"
			data-wp-bind--value="state.typeGuessValue"
			data-wp-bind--disabled="!state.isWaiting"
			data-wp-class--type-result-correct="state.isTypeResultCorrect"
			data-wp-class--type-result-incorrect="state.isTypeResultIncorrect"
		>
			<option value="1">—</option>
			<option value="0">0</option>
			<option value="0.25">¼</option>
			<option value="0.5">½</option>
			<option value="2">2</option>
			<option value="4">4</option>
		</select>
		<span
			class="type-correct-label"
			data-wp-text="state.typeCorrectLabel"
			data-wp-bind--hidden="state.isWaiting"
		></span>
	</div>
`;

const LearnTypesPage = () => {
	const { state, config } = getServerData() as unknown as {
		state: { pokemon: { pokemons: Record<string, Pokemon> } };
		config: { pokemon: { types: Record<string, Type> } };
	};
	const pokemons = Object.values(state.pokemon.pokemons);
	const allTypes = Object.values(config.pokemon.types).sort(
		(a, b) => a.id - b.id,
	);
	const initialPokemon = pickRandomPokemon(pokemons);

	return html`
		<main>
			${Hero({
				title: "Learn Types",
				description:
					"Master type effectiveness with two different modes. Fill in the full type chart or guess a Pokemon's weaknesses in a streak challenge.",
				image: "/images/pokemon/artwork/8.png",
				imageBg: "/images/pokemon/artwork/9.png",
			})}

			<div
				data-wp-interactive="pokemon/types"
				data-wp-context='{"currentSection": null}'
			>
				${Section({
					children: html`
						<h2 class="text-center mb-8">Learn Types</h2>
						<div class="flex flex-wrap justify-center gap-4">
							${QuizModeCard({
								title: "Pokemon Weaknesses",
								description:
									"Given a random Pokemon, guess all its weaknesses.",
								sectionId: "pokemon-weaknesses",
								ariaPressed: true,
							})}
							${QuizModeCard({
								title: "Fill the Type Chart",
								description:
									"Fill an empty type effectiveness table cell by cell.",
								sectionId: "fill-chart",
								ariaPressed: true,
							})}
						</div>
					`,
				})}

				${QuizSection({
					sectionId: "pokemon-weaknesses",
					quizContext: {
						...defaultQuizContext(initialPokemon),
						guesses: {},
					},
					watchCallback: "callbacks.storeWeaknessAnswer",
					restartAction: "actions.restartWeakness",
					children: html`
					<div class="flex flex-col lg:flex-row items-center justify-center gap-12 py-10 px-6">
						<!-- Left: Pokemon Card -->
						<div
							class="w-full max-w-[25rem] mx-auto sm:mx-0 sm:flex-shrink-0"
							data-wp-context---pokemon='pokemon::${JSON.stringify({ _pokemonDexNumber: String(initialPokemon.dexNumber), _pokemonFormName: initialPokemon.formName })}'
							data-wp-watch="callbacks.updateWeaknessContext"
						>
							${PokemonCard()}
						</div>
						<!-- Right: Type list + Guess button -->
						<div class="flex flex-col items-center gap-6">
							<div class="grid grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-1">
								${allTypes.map((type) => TypeRow(type))}
							</div>
							<div class="flex items-center gap-4">
								<button type="button" class="btn btn-primary" data-wp-on--click="actions.submitWeaknessGuess" data-wp-bind--disabled="!state.isWaiting">Guess</button>
								<span class="font-heading text-p-sm text-darker-gray" data-wp-bind--hidden="state.isWaiting"><span data-wp-text="state.correctCount">0</span>/18</span>
							</div>
						</div>
					</div>
					`,
				})}

				${Section({
					class: "section-diagonal py-32",
					attrs: `data-wp-context='${JSON.stringify({ sectionId: "fill-chart" })}' data-wp-bind--hidden="!state.isCurrentSection"`,
					children: html`
					<div class="rounded-lg p-6 quiz-bg" aria-label="Fill the Type Chart">
						<p>Fill the type chart quiz coming soon</p>
					</div>
				`,
				})}
			</div>
		</main>
	`;
};

export default LearnTypesPage;
