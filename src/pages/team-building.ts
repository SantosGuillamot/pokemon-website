import { html } from "hono/html";

const TeamBuildingPage = () => {
	return html`
		<main class="space-y-8">
			<section class="space-y-4">
				<h1>Team Building</h1>
				<p class="text-p-lg text-darker-gray max-w-2xl">
					Build and analyze competitive teams for Pokemon Champions.
					Requires an account to save teams.
				</p>
			</section>

			<!-- Team slots -->
			<section class="space-y-4">
				<h2>Team Composition</h2>
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
			</section>

			<!-- Type coverage -->
			<section class="rounded-lg border-2 border-fog bg-white p-6 space-y-4">
				<h2>Type Coverage Analysis</h2>
				<p class="text-p text-darker-gray">
					See how your team covers every type. Highlights which Pokemon
					handle which types well and where your team has gaps.
				</p>
				<div class="rounded-lg bg-fog p-4">
					<p class="text-center text-p text-darker-gray">
						Add Pokemon to your team to see type coverage.
					</p>
				</div>
			</section>

			<!-- Meta matchups -->
			<section class="rounded-lg border-2 border-fog bg-white p-6 space-y-4">
				<h2>Meta Matchup Analysis</h2>
				<p class="text-p text-darker-gray">
					Compare your team against predefined meta teams and Pokemon.
					Identify strengths, weaknesses, and gaps in your strategy.
				</p>
				<div class="rounded-lg bg-fog p-4">
					<p class="text-center text-p text-darker-gray">
						Build your team first to compare against the meta.
					</p>
				</div>
			</section>
		</main>
	`;
};

export default TeamBuildingPage;
