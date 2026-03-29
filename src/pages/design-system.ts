import { html } from "hono/html";
import { Gauge, Crosshair, Grid2x2 } from "lucide-static";
import Card from "../components/Card.js";
import Hero from "../sections/Hero.js";
import Section from "../sections/Section.js";

const DesignSystemPage = () => {
	return html`
		<main>
			${Hero({
				title: "Design System",
				description:
					"A living reference of all design elements. Use this page to test, compare, and make decisions.",
				image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/1.png",
				imageBg: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/9.png",
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
		</main>
	`;
};

export default DesignSystemPage;
