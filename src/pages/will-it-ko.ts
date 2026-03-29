import { html } from "hono/html";
import Hero from "../sections/Hero.js";
import Section from "../sections/Section.js";

const KoOrNotPage = () => {
	return html`
		<main>
			${Hero({
				title: "Will it KO?",
				description:
					"A battle scenario appears — attacker, defender, move, and field conditions. Does this attack one-hit KO the defender? One wrong answer ends your streak!",
				image: "/public/icons/Pokeball.svg",
			})}

			${Section({
				children: html`
					<!-- Placeholder scenario -->
					<div class="rounded-lg border-2 border-fog bg-white p-8 space-y-6">
						<h2>Scenario</h2>

						<div class="grid gap-6 sm:grid-cols-2">
							<!-- Attacker -->
							<div class="rounded-lg bg-fog p-4 space-y-2">
								<h3>Attacker</h3>
								<div class="flex h-32 w-32 items-center justify-center rounded-lg bg-white">
									<span class="text-darker-gray text-p-sm">Image</span>
								</div>
								<p><strong>Mega Charizard Y</strong></p>
								<p class="text-p-sm text-darker-gray">Type: Fire / Flying</p>
								<p class="text-p-sm text-darker-gray">Ability: Drought</p>
								<p class="text-p-sm text-darker-gray">Move: Heat Wave</p>
							</div>

							<!-- Defender -->
							<div class="rounded-lg bg-fog p-4 space-y-2">
								<h3>Defender</h3>
								<div class="flex h-32 w-32 items-center justify-center rounded-lg bg-white">
									<span class="text-darker-gray text-p-sm">Image</span>
								</div>
								<p><strong>Blastoise</strong></p>
								<p class="text-p-sm text-darker-gray">Type: Water</p>
								<p class="text-p-sm text-darker-gray">Ability: Torrent</p>
								<p class="text-p-sm text-darker-gray">HP: 75%</p>
							</div>
						</div>

						<div class="rounded-lg bg-fog p-4">
							<p class="text-p-sm"><strong>Field:</strong> Sun (from Drought)</p>
						</div>

						<div class="flex flex-wrap justify-center gap-4">
							<button type="button" class="btn btn-primary" disabled>
								Yes, it KOs!
							</button>
							<button type="button" class="btn btn-secondary" disabled>
								No, it survives
							</button>
						</div>

						<p class="text-center text-p text-darker-gray">
							Current streak: <strong>0</strong>
						</p>
					</div>
				`,
			})}
		</main>
	`;
};

export default KoOrNotPage;
