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

const SourceTypeIcon = (type: Type) => html`
	<div
		class="weakness-source-icon"
		data-wp-context='${JSON.stringify({ typeId: type.id })}'
		draggable="true"
		role="button"
		tabindex="0"
		data-wp-on--dragstart="actions.startDrag"
		data-wp-on--dragend="actions.dragEnd"
		data-wp-on--click="actions.selectSourceType"
		data-wp-on--keydown="actions.handleKeydown"
		data-wp-class--weakness-icon-placed="state.isTypePlaced"
		data-wp-class--weakness-icon-selected="state.isTypeSelected"
		data-wp-class--weakness-source-missed="state.isSourceTypeMissed"
	>
		<img src="${type.imageSmall}" alt="${type.name}" width="24" height="24" draggable="false" />
	</div>
`;

const EffectivenessBar = (
	multiplier: number,
	label: string,
	cssClass: string,
	allTypes: Type[],
) => html`
	<div
		class="weakness-bar ${cssClass}"
		data-wp-context='${JSON.stringify({ barMultiplier: multiplier })}'
	>
		<div class="weakness-bar-header">${label}</div>
		<div
			class="weakness-bar-content"
			role="button"
			tabindex="0"
			data-wp-on--dragover="actions.allowDrop"
			data-wp-on--drop="actions.dropOnBar"
			data-wp-on--dragenter="actions.dragEnterBar"
			data-wp-on--dragleave="actions.dragLeaveBar"
			data-wp-on--click="actions.clickBar"
			data-wp-on--keydown="actions.handleKeydown"
			data-wp-class--weakness-bar-dragover="state.isDragOver"
		>
			${allTypes.map(
				(type) => html`
				<img
					src="${type.imageSmall}"
					alt="${type.name}"
					data-wp-context='${JSON.stringify({ typeId: type.id })}'
					data-wp-bind--hidden="!state.isTypeInCurrentBar"
					data-wp-on--click="actions.removeFromBar"
					data-wp-on--dragstart="actions.startDrag"
					data-wp-on--dragend="actions.dragEnd"
					data-wp-on--keydown="actions.handleKeydown"
					data-wp-class--bar-icon-correct="state.isTypeResultCorrect"
					data-wp-class--bar-icon-incorrect="state.isTypeResultIncorrect"
					class="weakness-bar-icon"
					role="button"
					tabindex="0"
					draggable="true"
					width="24"
					height="24"
				/>
			`,
			)}
		</div>
	</div>
`;

const ChartCell = (atkType: Type, defType: Type) => html`
	<td data-wp-context='${JSON.stringify({ atkTypeId: atkType.id, defTypeId: defType.id })}'>
		<select
			aria-label="${atkType.name} vs ${defType.name}"
			class="chart-cell-select"
			data-wp-on--change="actions.setChartGuess"
			data-wp-bind--value="state.chartGuessValue"
			data-wp-bind--disabled="!state.isChartWaiting"
			data-wp-class--chart-cell-correct="state.isChartCellCorrect"
			data-wp-class--chart-cell-incorrect="state.isChartCellIncorrect"
		>
			<option value="1">\u2014</option>
			<option value="0">0</option>
			<option value="0.5">\u00bd</option>
			<option value="2">2</option>
		</select>
	</td>
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
						draggedTypeId: null,
						selectedTypeId: null,
					},
					watchCallback: "callbacks.storeWeaknessAnswer",
					restartAction: "actions.restartWeakness",
					children: html`
					<div class="flex flex-col lg:flex-row items-center lg:items-stretch justify-center gap-8 lg:gap-12 py-10 px-6">
						<!-- Left: Pokemon Card -->
						<div
							class="w-full max-w-[25rem] mx-auto lg:mx-0 flex-shrink-0"
							data-wp-context---pokemon='pokemon::${JSON.stringify({ _pokemonDexNumber: String(initialPokemon.dexNumber), _pokemonFormName: initialPokemon.formName })}'
							data-wp-watch="callbacks.updateWeaknessContext"
						>
							${PokemonCard()}
						</div>
						<!-- Right: Source icons + Effectiveness bars + Button -->
						<div class="flex flex-col items-center justify-center gap-3 w-full lg:w-auto">
							<div class="flex flex-row items-center gap-4">
								<!-- Source type icons -->
								<div
									class="weakness-source-grid"
									data-wp-on--dragover="actions.allowDrop"
									data-wp-on--drop="actions.dropOnSource"
								>
									${allTypes.map((type) => SourceTypeIcon(type))}
								</div>
								<!-- Effectiveness bars -->
								<div class="weakness-bars flex-1">
									${EffectivenessBar(4, "4\u00d7", "weakness-bar-4x", allTypes)}
									${EffectivenessBar(2, "2\u00d7", "weakness-bar-2x", allTypes)}
									${EffectivenessBar(0.5, "1 / 2\u00d7", "weakness-bar-half", allTypes)}
									${EffectivenessBar(0.25, "1 / 4\u00d7", "weakness-bar-quarter", allTypes)}
									${EffectivenessBar(0, "0\u00d7", "weakness-bar-0x", allTypes)}
								</div>
							</div>
							<!-- Button + Score -->
							<div class="flex items-center gap-4">
								<button type="button" class="btn btn-primary" data-wp-on--click="actions.submitWeaknessGuess" data-wp-bind--hidden="!state.isWaiting">Guess</button>
								<button type="button" class="btn btn-primary" data-wp-on--click="actions.nextPokemon" data-wp-bind--hidden="!state.isCorrect">Next</button>
								<button type="button" class="btn btn-primary" data-wp-on--click="actions.tryAgainWeakness" data-wp-bind--hidden="!state.isRetry">Try Again</button>
								<button type="button" class="btn btn-secondary" data-wp-on--click="actions.skipPokemon" data-wp-bind--hidden="!state.isRetry">Skip</button>
								<span class="font-heading text-p-sm text-darker-gray" role="status" aria-live="polite" data-wp-bind--hidden="state.isWaiting"><span data-wp-text="state.correctCount">0</span>/${allTypes.length}</span>
							</div>
						</div>
					</div>
					`,
				})}

				<section
					class="px-6 py-32 section-diagonal"
					data-wp-context='${JSON.stringify({ sectionId: "fill-chart", chartGuesses: {}, chartState: "waiting" })}'
					data-wp-bind--hidden="!state.isCurrentSection"
				>
					<div class="max-w-content mx-auto chart-scroll-container" role="region" aria-label="Type effectiveness chart" tabindex="0">
						<table class="type-chart-table mx-auto">
							<caption class="sr-only">Rows are attacking types, columns are defending types. Select the effectiveness multiplier for each matchup.</caption>
							<thead>
								<tr>
									<th class="chart-corner-cell">
										<span class="chart-corner-def">DEF →</span>
										<span class="chart-corner-atk">ATK ↓</span>
									</th>
									${allTypes.map(
										(type) => html`
										<th scope="col" class="chart-header-cell">
											<img src="${type.imageSmall}" alt="${type.name}" width="32" height="32" />
										</th>
									`,
									)}
								</tr>
							</thead>
							<tbody>
								${allTypes.map(
									(atkType) => html`
									<tr>
										<th scope="row" class="chart-row-header">
											<img src="${atkType.imageSmall}" alt="${atkType.name}" width="32" height="32" />
										</th>
										${allTypes.map((defType) => ChartCell(atkType, defType))}
									</tr>
								`,
								)}
							</tbody>
						</table>
						<div class="flex items-center justify-center gap-4 py-6">
							<button type="button" class="btn btn-primary" data-wp-on--click="actions.submitChartGuess" data-wp-bind--hidden="!state.isChartWaiting">Guess</button>
							<button type="button" class="btn btn-primary" data-wp-on--click="actions.restartChart" data-wp-bind--hidden="state.isChartWaiting">Try again</button>
							<span class="font-heading text-p-sm text-darker-gray" role="status" aria-live="polite" data-wp-bind--hidden="state.isChartWaiting"><span data-wp-text="state.chartScore">0</span>/<span data-wp-text="state.chartTotal">0</span></span>
						</div>
					</div>
				</section>
			</div>
		</main>
	`;
};

export default LearnTypesPage;
