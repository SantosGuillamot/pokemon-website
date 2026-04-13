import { html } from "hono/html";
import Hero from "../components/Hero.js";
import SectionCard from "../components/SectionCard.js";
import Section from "../components/Section.js";

const TeamBuildingPage = () => {
	return html`
		<main>
			${Hero({
				title: "Team Builder",
				description:
					"Build and analyze competitive teams for Pokemon Champions. Requires an account to save teams.",
				image: "/images/pokemon/artwork/25.png",
				imageBg: "/images/pokemon/artwork/9.png",
			})}

			<div
				data-wp-interactive="pokemon/team-builder"
				data-wp-context='{"currentSection": null}'
			>
				${Section({
					children: html`
						<h2 class="text-center mb-8">Choose a Mode</h2>
						<div class="flex flex-wrap justify-center gap-4">
							${SectionCard({
								title: "Team Builder",
								description: "Build your competitive team and analyze type coverage and meta matchups.",
								sectionId: "team-builder",
							})}
							${SectionCard({
								title: "Meta Pokemons",
								description: "Define the meta Pokemon configurations used for team comparisons.",
								sectionId: "meta-pokemons",
							})}
						</div>
					`,
				})}

				${Section({
					attrs: `data-wp-context='{"sectionId": "team-builder"}' data-wp-bind--hidden="!state.isCurrentSection"`,
					children: html`
						<div class="space-y-12">
							<div class="space-y-4">
								<h3>Team Composition</h3>
								<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
									${[1, 2, 3, 4, 5, 6].map(
										(slot) => html`
											<div class="rounded-lg border-2 border-dashed border-fog bg-white p-4 space-y-2">
												<p class="font-heading text-h4 uppercase text-darker-gray">
													Slot ${slot}
												</p>
												<div class="flex h-24 w-24 items-center justify-center rounded-lg bg-fog">
													<span class="text-p-sm text-darker-gray">?</span>
												</div>
												<select class="block w-full rounded border border-fog p-2" disabled>
													<option>Select a Pokemon...</option>
												</select>
											</div>
										`,
									)}
								</div>
							</div>
							<div class="rounded-lg border-2 border-fog bg-white p-6 space-y-4">
								<h3>Type Coverage Analysis</h3>
								<p class="text-p text-darker-gray">
									See how your team covers every type. Highlights which Pokemon
									handle which types well and where your team has gaps.
								</p>
								<div class="rounded-lg bg-fog p-4">
									<p class="text-center text-p text-darker-gray">
										Add Pokemon to your team to see type coverage.
									</p>
								</div>
							</div>
							<div class="rounded-lg border-2 border-fog bg-white p-6 space-y-4">
								<h3>Meta Matchup Analysis</h3>
								<p class="text-p text-darker-gray">
									Compare your team against predefined meta teams and Pokemon.
									Identify strengths, weaknesses, and gaps in your strategy.
								</p>
								<div class="rounded-lg bg-fog p-4">
									<p class="text-center text-p text-darker-gray">
										Build your team first to compare against the meta.
									</p>
								</div>
							</div>
						</div>
					`,
				})}

				${Section({
					attrs: `data-wp-context='{"sectionId": "meta-pokemons"}' data-wp-bind--hidden="!state.isCurrentSection"`,
					children: html`
						<div class="space-y-4">
							<h3>Meta Pokemons</h3>
							<p class="text-p text-darker-gray">
								Define the Pokemon configurations that represent the current meta.
								These will be used to analyze your team's matchups and coverage.
							</p>
							<div class="rounded-lg border-2 border-fog bg-white p-6 space-y-4">
								<p class="text-center text-p text-darker-gray">
									No meta Pokemon defined yet. Meta Pokemon management coming soon.
								</p>
							</div>
						</div>
					`,
				})}
			</div>
		</main>
	`;
};

export default TeamBuildingPage;
