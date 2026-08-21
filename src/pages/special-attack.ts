import type {
	DataTableColumn,
	DataTableRow,
} from "@pokemon-website/types/data-table";
import type { Pokemon } from "@pokemon-website/types/pokemons";
import { html } from "hono/html";
import { getServerData } from "iapi-ssr-processor";
import DataTable from "../components/DataTable.js";
import Hero from "../components/Hero.js";
import PokemonCard from "../components/PokemonCard.js";
import QuizSection from "../components/QuizSection.js";
import Section from "../components/Section.js";
import SectionCard from "../components/SectionCard.js";
import { pickTwo } from "../utils/array.js";
import { defaultQuizContext } from "../utils/quiz.js";

/**
 * The revealable overlay shown over a Pokemon card in the head-to-head game.
 * Reuses the shared `.speed-*` reveal classes as-is (they are stat-agnostic
 * visual utilities), while announcing the Special Attack stat to assistive tech.
 *
 * @param textBinding - Store reference bound to the displayed stat value.
 * @param correctBinding - Store reference toggling the "correct" styling.
 * @param incorrectBinding - Store reference toggling the "incorrect" styling.
 * @returns The overlay markup.
 */
const SpAttackRevealOverlay = (
	textBinding: string,
	correctBinding: string,
	incorrectBinding: string,
) => html`
	<div
		class="speed-overlay-bg absolute inset-0 z-10 flex items-center justify-center rounded-sm"
		aria-label="Special Attack stat"
		data-wp-bind--hidden="state.isWaiting"
		data-wp-class--speed-overlay-correct="${correctBinding}"
		data-wp-class--speed-overlay-incorrect="${incorrectBinding}"
	>
		<span
			class="text-h1 font-heading-retro flex items-center justify-center w-28 h-28 rounded-full bg-black text-white"
			data-wp-text="${textBinding}"
			data-wp-class--speed-correct="${correctBinding}"
			data-wp-class--speed-incorrect="${incorrectBinding}"
		></span>
	</div>
`;

/**
 * A selectable Pokemon card for the "higher Special Attack" head-to-head game.
 * Reuses the shared `speed-pokemon-btn` class as-is and wires the card to the
 * `pokemon/special-attack` store's guess action and reveal state.
 *
 * @param index - Position of this Pokemon within the current pair (0 or 1).
 * @param pokemon - The Pokemon rendered by this card.
 * @returns The selectable card markup.
 */
const SpAttackPokemonCard = (index: number, pokemon: Pokemon) => html`
	<button
		type="button"
		class="speed-pokemon-btn w-full max-w-[25rem] sm:flex-1 cursor-pointer disabled:cursor-default relative"
		aria-label="Select ${pokemon.name.replaceAll("-", " ")} as higher special attack"
		data-wp-context='{"pokemonIndex": ${index}}'
		data-wp-context---pokemon='pokemon::${JSON.stringify({ _pokemonDexNumber: String(pokemon.dexNumber), _pokemonFormName: pokemon.formName })}'
		data-wp-watch="callbacks.updateContext"
		data-wp-on--click="actions.guessSpAttack"
		data-wp-bind--disabled="!state.isWaiting"
	>
		${SpAttackRevealOverlay(
			"state.displayedSpAttack",
			"state.isGuessedCorrect",
			"state.isGuessedIncorrect",
		)}
		${PokemonCard()}
	</button>
`;

/**
 * Server-rendered `/special-attack` page: a hero, a "Learn Special Attack"
 * section selector, a head-to-head "which Pokemon has the higher Special
 * Attack" streak game, and a sortable/searchable table of all Pokemon by
 * Special Attack. All interactive markup lives inside the distinct
 * `pokemon/special-attack` Interactivity namespace.
 *
 * @returns The page markup, or a graceful message when fewer than two Pokemon
 * are available server-side.
 */
const SpecialAttackPage = () => {
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

	const capitalize = (s: string) => s.replace(/\b\w/g, (c) => c.toUpperCase());

	const spAttackRows: DataTableRow[] = pokemons.map((p) => ({
		id: String(p.id),
		sprite: p.imageUrl ?? "",
		name: capitalize(p.name.replaceAll("-", " ")),
		spAttack: p.spAttack,
	}));

	return html`
		<main>
			${Hero({
				title: "Special Attack",
				description:
					"Two Pokemon appear side by side. Guess which one has the higher Special Attack stat — or if they're tied. One wrong answer ends your streak!",
				image: "/images/pokemon/artwork/25.png",
				imageBg: "/images/pokemon/artwork/9.png",
			})}

			<div
				data-wp-interactive="pokemon/special-attack"
				data-wp-context='{"currentSection": null}'
			>
				${Section({
					children: html`
						<h2 class="text-center mb-8">Learn Special Attack</h2>
						<div class="flex flex-wrap justify-center gap-4">
							${SectionCard({
								title: "Higher Special Attack",
								description:
									"Guess which Pokemon has the higher Special Attack stat.",
								sectionId: "whos-higher-special-attack",
							})}
							${SectionCard({
								title: "Special Attack Table",
								description:
									"Browse all Pokemon sorted by their Special Attack stat.",
								sectionId: "special-attack-table",
							})}
						</div>
					`,
				})}

				${QuizSection({
					sectionId: "whos-higher-special-attack",
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
					<h3 class="sr-only">Which Pokemon has the higher Special Attack?</h3>
					<div class="flex flex-col sm:flex-row items-center justify-center gap-4 py-10 px-6">
						${SpAttackPokemonCard(0, pokemonA)}
						<p class="text-h1 font-heading-retro px-12" aria-hidden="true">VS</p>
						${SpAttackPokemonCard(1, pokemonB)}
					</div>
					`,
				})}

				${Section({
					class: "section-diagonal py-32",
					attrs: `data-wp-context='${JSON.stringify({ sectionId: "special-attack-table" })}' data-wp-bind--hidden="!state.isCurrentSection"`,
					children: html`
					<div class="rounded-lg p-6" data-wp-interactive="pokemon/data-table">
						${DataTable({
							columns: [
								{
									key: "sprite",
									label: "",
									render: "image",
									altKey: "name",
									cellClass: "w-20",
								},
								{
									key: "name",
									label: "Name",
									sortable: true,
									searchable: true,
								},
								{ key: "spAttack", label: "Special Attack", sortable: true },
							] satisfies DataTableColumn[],
							rows: spAttackRows,
							caption: "Pokemon sorted by special attack",
							maxHeight: "70vh",
							searchPlaceholder: "Search Pokemon...",
							searchMode: "scroll",
							sortColumn: "spAttack",
							sortDirection: "desc",
						})}
					</div>
				`,
				})}
			</div>
		</main>
	`;
};

export default SpecialAttackPage;
