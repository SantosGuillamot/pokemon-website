import type {
	DataTableColumn,
	DataTableRow,
} from "@pokemon-website/types/data-table";
import type { Pokemon } from "@pokemon-website/types/pokemons";
import { html } from "hono/html";
import { getServerData } from "iapi-ssr-processor";
import { Crosshair, Gauge, Grid2x2 } from "lucide-static";
import Card from "../components/Card.js";
import DataTable from "../components/DataTable.js";
import Hero from "../components/Hero.js";
import PokemonCard from "../components/PokemonCard.js";
import Section from "../components/Section.js";

const DesignSystemPage = () => {
	const { state } = getServerData() as unknown as {
		state: { pokemon: { pokemons: Record<string, Pokemon> } };
	};
	const pokemons = Object.values(state.pokemon.pokemons);

	const speedRows: DataTableRow[] = pokemons.map((p) => ({
		id: String(p.id),
		name: p.name.replaceAll("-", " "),
		speed: p.speed,
		hp: p.hp,
		attack: p.attack,
		defense: p.defense,
		spAttack: p.spAttack,
		spDefense: p.spDefense,
	}));

	const nameRows: DataTableRow[] = pokemons.map((p) => ({
		id: String(p.id),
		name: p.name.replaceAll("-", " "),
		speed: p.speed,
		hp: p.hp,
		attack: p.attack,
	}));
	return html`
		<main>
			${Hero({
				title: "Design System",
				description:
					"A living reference of all design elements. Use this page to test, compare, and make decisions.",
				image: "/images/pokemon/artwork/25.png",
				imageBg: "/images/pokemon/artwork/9.png",
			})}

			<!-- Typography -->
			${Section({
				children: html`
					<div>
						<h2 class="mb-8 pb-2 border-b border-fog">Typography</h2>

						<!-- Headings -->
						<div class="mb-12">
							<h3 class="mb-4">Headings</h3>

							<div class="space-y-6">
								<div>
									<p class="text-paragraph-sm text-darker-gray mb-1">
										H1 — DotGothic16 48/72
									</p>
									<h1>The quick brown Vulpix</h1>
								</div>
								<div>
									<p class="text-paragraph-sm text-darker-gray mb-1">
										H2 — DotGothic16 32/40
									</p>
									<h2>The quick brown Vulpix jumps</h2>
								</div>
								<div>
									<p class="text-paragraph-sm text-darker-gray mb-1">
										H3 — DotGothic16 24/32
									</p>
									<h3>
										The quick brown Vulpix jumps over the lazy
										Snorlax
									</h3>
								</div>
								<div>
									<p class="text-paragraph-sm text-darker-gray mb-1">
										H4 — DotGothic16 16/20 — Uppercase
									</p>
									<h4>
										The quick brown Vulpix jumps over the lazy
										Snorlax
									</h4>
								</div>
							</div>
						</div>

						<!-- Paragraphs -->
						<div class="mb-12">
							<h3 class="mb-4">Paragraphs</h3>

							<div class="space-y-8">
								<div>
									<p class="text-paragraph-sm text-darker-gray mb-1">
										Paragraph Large — Space Mono 20/32
									</p>
									<p class="text-paragraph-lg">
										Pikachu is an Electric-type Pokemon introduced
										in Generation I. It is the most iconic Pokemon
										and serves as the franchise mascot. Pikachu can
										store electricity in the electric sacs on its
										cheeks.
									</p>
								</div>
								<div>
									<p class="text-paragraph-sm text-darker-gray mb-1">
										Paragraph Regular — Space Mono 16/24
									</p>
									<p>
										Pikachu is an Electric-type Pokemon introduced
										in Generation I. It is the most iconic Pokemon
										and serves as the franchise mascot. Pikachu can
										store electricity in the electric sacs on its
										cheeks. When it releases pent-up energy in a
										burst, the electric power is equal to a
										lightning bolt.
									</p>
								</div>
								<div>
									<p class="text-paragraph-sm text-darker-gray mb-1">
										Paragraph Small — Space Mono 14/20
									</p>
									<p class="text-paragraph-sm">
										Pikachu is an Electric-type Pokemon introduced
										in Generation I. It is the most iconic Pokemon
										and serves as the franchise mascot. Pikachu can
										store electricity in the electric sacs on its
										cheeks. When it releases pent-up energy in a
										burst, the electric power is equal to a
										lightning bolt.
									</p>
								</div>
								<div>
									<p class="text-paragraph-sm text-darker-gray mb-1">
										Bold / Emphasis
									</p>
									<p>
										This is regular text with
										<strong>bold emphasis</strong> and
										<em>italic emphasis</em> and
										<strong><em>bold italic</em></strong> together.
									</p>
								</div>
							</div>
						</div>
					</div>
				`,
			})}

			<!-- Buttons -->
			${Section({
				children: html`
					<div>
						<h2 class="mb-8 pb-2 border-b border-fog">Buttons</h2>

						<div class="space-y-8">
							<div>
								<h3 class="mb-4">Primary</h3>
								<div class="flex flex-wrap items-center gap-4">
									<button class="btn btn-primary">Default</button>
									<button class="btn btn-primary" disabled>
										Disabled
									</button>
								</div>
							</div>
							<div>
								<h3 class="mb-4">Secondary</h3>
								<div class="flex flex-wrap items-center gap-4">
									<button class="btn btn-secondary">Default</button>
									<button class="btn btn-secondary" disabled>
										Disabled
									</button>
								</div>
							</div>
							<div>
								<h3 class="mb-4">Text</h3>
								<div class="flex flex-wrap items-center gap-4">
									<a href="#" class="btn-text">Learn more</a>
								</div>
							</div>
						</div>
					</div>
				`,
			})}

			<!-- Cards -->
			${Section({
				children: html`
					<div>
						<h2 class="mb-8 pb-2 border-b border-fog">Cards</h2>

						<div class="space-y-8">
							<div>
								<h3 class="mb-4">Static</h3>
								<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
									${Card({
										title: "Static card",
										children: html`
											<p class="text-paragraph-sm text-darker-gray">
												A non-interactive card. Used to
												display content without linking
												anywhere.
											</p>
										`,
									})}
								</div>
							</div>
							<div>
								<h3 class="mb-4">Link with icon</h3>
								<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
									${Card({
										title: "Who's Faster?",
										href: "#",
										icon: Gauge,
										children: html`
											<p class="text-paragraph-sm text-darker-gray">
												Guess which Pokemon is faster. Test
												your knowledge in a streak game.
											</p>
										`,
									})}
									${Card({
										title: "KO or Not?",
										href: "#",
										icon: Crosshair,
										children: html`
											<p class="text-paragraph-sm text-darker-gray">
												Given a scenario, guess if it's a
												one-hit KO. How long can you keep
												your streak?
											</p>
										`,
									})}
									${Card({
										title: "Learn Types",
										href: "#",
										icon: Grid2x2,
										children: html`
											<p class="text-paragraph-sm text-darker-gray">
												Master the type chart. Fill it
												from memory or guess a Pokemon's
												weaknesses.
											</p>
										`,
									})}
								</div>
							</div>
							<div>
								<h3 class="mb-4">Link without icon</h3>
								<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
									${Card({
										title: "Damage Calculator",
										href: "#",
										children: html`
											<p class="text-paragraph-sm text-darker-gray">
												Calculate damage output for any
												matchup. Full support for items,
												abilities, and field conditions.
											</p>
										`,
									})}
								</div>
							</div>
						</div>
					</div>
				`,
			})}

			<!-- Pokemon Cards -->
			${Section({
				children: html`
					<div>
						<h2 class="mb-8 pb-2 border-b border-fog">Pokemon Cards</h2>

						<div class="flex flex-wrap gap-6">
							<div data-wp-context='{"_pokemonDexNumber": "25"}'>${PokemonCard()}</div>
							<div data-wp-context='{"_pokemonDexNumber": "6", "_pokemonFormName": "mega-x"}'>${PokemonCard()}</div>
							<div data-wp-context='{"_pokemonDexNumber": "3"}'>${PokemonCard()}</div>
						</div>
					</div>
				`,
			})}

			<!-- Links -->
			${Section({
				children: html`
					<div>
						<h2 class="mb-8 pb-2 border-b border-fog">Links</h2>

						<div class="space-y-6">
							<div>
								<p class="text-paragraph-sm text-darker-gray mb-1">
									Inline link
								</p>
								<p>
									Learn more about
									<a href="#" class="link">Pikachu's abilities</a>
									and how they work in battle.
								</p>
							</div>
							<div>
								<p class="text-paragraph-sm text-darker-gray mb-1">
									Standalone link
								</p>
								<a href="#" class="link">View all Pokemon →</a>
							</div>
						</div>
					</div>
				`,
			})}

			<!-- Lists -->
			${Section({
				children: html`
					<div>
						<h2 class="mb-8 pb-2 border-b border-fog">Lists</h2>

						<div class="space-y-8">
							<div>
								<h3 class="mb-4">Unordered List</h3>
								<ul class="list-disc list-inside space-y-1">
									<li>Pikachu — Electric type</li>
									<li>Charizard — Fire / Flying type</li>
									<li>Bulbasaur — Grass / Poison type</li>
									<li>Squirtle — Water type</li>
									<li>Gengar — Ghost / Poison type</li>
								</ul>
							</div>
						</div>
					</div>
				`,
			})}

			<!-- Colors -->
			${Section({
				children: html`
					<div>
						<h2 class="mb-8 pb-2 border-b border-fog">Color Palette</h2>

						<div class="space-y-8">
							<div>
								<h3 class="mb-4">Brand</h3>
								<div class="flex flex-wrap gap-4">
									<div class="text-center">
										<div
											class="w-20 h-20 rounded-lg bg-primary border border-fog"
										></div>
										<p class="text-paragraph-sm mt-1">Primary</p>
										<p class="text-paragraph-sm text-darker-gray">#FFDE00</p>
									</div>
									<div class="text-center">
										<div
											class="w-20 h-20 rounded-lg bg-secondary"
										></div>
										<p class="text-paragraph-sm mt-1">Secondary</p>
										<p class="text-paragraph-sm text-darker-gray">#C41425</p>
									</div>
									<div class="text-center">
										<div
											class="w-20 h-20 rounded-lg bg-success"
										></div>
										<p class="text-paragraph-sm mt-1">Success</p>
										<p class="text-paragraph-sm text-darker-gray">#15803D</p>
									</div>
								</div>
							</div>

							<div>
								<h3 class="mb-4">Neutrals</h3>
								<div class="flex flex-wrap gap-4">
									<div class="text-center">
										<div
											class="w-20 h-20 rounded-lg bg-black border border-fog"
										></div>
										<p class="text-paragraph-sm mt-1">Black</p>
										<p class="text-paragraph-sm text-darker-gray">#111111</p>
									</div>
									<div class="text-center">
										<div
											class="w-20 h-20 rounded-lg bg-darker-gray"
										></div>
										<p class="text-paragraph-sm mt-1">Darker Gray</p>
										<p class="text-paragraph-sm text-darker-gray">#666666</p>
									</div>
									<div class="text-center">
										<div
											class="w-20 h-20 rounded-lg bg-fog border border-darker-gray/20"
										></div>
										<p class="text-paragraph-sm mt-1">Fog</p>
										<p class="text-paragraph-sm text-darker-gray">#EEEEEE</p>
									</div>
									<div class="text-center">
										<div
											class="w-20 h-20 rounded-lg bg-white border border-fog"
										></div>
										<p class="text-paragraph-sm mt-1">White</p>
										<p class="text-paragraph-sm text-darker-gray">#FFFFFF</p>
									</div>
								</div>
							</div>
						</div>
					</div>
				`,
			})}
			<!-- Item Images -->
			${Section({
				children: html`
					<div>
						<h2 class="mb-8 pb-2 border-b border-fog">Item Images</h2>

						<div class="flex flex-wrap gap-8">
							<div class="text-center">
								<img
									src="/images/items/kings-rock.png"
									alt="King's Rock"
									class="w-16 h-16"
								/>
								<p class="text-paragraph-sm mt-2">King's Rock</p>
							</div>
							<div class="text-center">
								<img
									src="/images/items/never-melt-ice.png"
									alt="Never-Melt Ice"
									class="w-16 h-16"
								/>
								<p class="text-paragraph-sm mt-2">Never-Melt Ice</p>
							</div>
							<div class="text-center">
								<img
									src="/images/items/dragoninite.png"
									alt="Dragoninite"
									class="w-16 h-16"
								/>
								<p class="text-paragraph-sm mt-2">Dragoninite</p>
								<p class="text-paragraph-sm text-darker-gray">Mega Stone</p>
							</div>
						</div>
					</div>
				`,
			})}

			<!-- Data Tables -->
			${Section({
				children: html`
					<div>
						<h2 class="mb-8 pb-2 border-b border-fog">Data Tables</h2>

						<div class="space-y-12">
							<!-- Standalone table -->
							<div>
								<h3 class="mb-4">Standalone — Speed Table</h3>
								<p class="text-paragraph-sm text-darker-gray mb-4">
									All Pokemon in Champions sorted by speed. Click column headers to re-sort.
								</p>
								<div data-wp-interactive="pokemon/data-table">
									${DataTable({
										columns: [
											{
												key: "name",
												label: "Name",
												sortable: true,
												searchable: true,
											},
											{ key: "speed", label: "Speed", sortable: true },
											{ key: "hp", label: "HP", sortable: true },
											{ key: "attack", label: "Atk", sortable: true },
											{ key: "defense", label: "Def", sortable: true },
											{ key: "spAttack", label: "SpA", sortable: true },
											{ key: "spDefense", label: "SpD", sortable: true },
										] satisfies DataTableColumn[],
										rows: speedRows,
										caption: "Pokemon speeds",
										maxHeight: "32rem",
										searchPlaceholder: "Search Pokemon...",
										sortColumn: "speed",
										sortDirection: "desc",
									})}
								</div>
							</div>

							<!-- Selectable (picker mode) -->
							<div>
								<h3 class="mb-4">Selectable — Picker Mode</h3>
								<p class="text-paragraph-sm text-darker-gray mb-4">
									Click a row to select it. Check the console for the selected name.
								</p>
								<div data-wp-interactive="pokemon/data-table">
									${DataTable({
										columns: [
											{
												key: "name",
												label: "Name",
												sortable: true,
												searchable: true,
											},
											{ key: "speed", label: "Speed", sortable: true },
											{ key: "hp", label: "HP", sortable: true },
											{ key: "attack", label: "Atk", sortable: true },
										] satisfies DataTableColumn[],
										rows: nameRows,
										selectable: true,
										maxHeight: "24rem",
										caption: "Select a Pokemon",
										searchPlaceholder: "Search Pokemon...",
										sortColumn: "name",
										sortDirection: "asc",
										watchCallback:
											"pokemon/design-system::callbacks.onPokemonSelected",
									})}
								</div>
							</div>
						</div>
					</div>
				`,
			})}
		</main>
	`;
};

export default DesignSystemPage;
