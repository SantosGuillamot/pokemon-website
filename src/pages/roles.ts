import { html } from "hono/html";
import Section from "../sections/Section.js";

const RolesPage = () => {
	return html`
		<main>
			${Section({
				children: html`
					<div class="space-y-4">
						<h1>Roles</h1>
						<p class="text-p-lg text-darker-gray max-w-2xl">
							A Pokemon appears — decide whether it hits harder physically
							or specially, and whether it walls physical or special
							attacks. One wrong answer ends your streak!
						</p>
					</div>
				`,
			})}

			${Section({
				children: html`
					<!-- Placeholder game area -->
					<div class="rounded-lg border-2 border-fog bg-white p-8">
						<div class="flex flex-col items-center gap-4">
							<div class="flex h-40 w-40 items-center justify-center rounded-lg bg-fog">
								<span class="text-darker-gray">Image</span>
							</div>
							<p class="font-heading text-h3 uppercase">Gengar</p>
						</div>

						<!-- Attack vs Special Attack -->
						<div class="mt-8 space-y-2 text-center">
							<p class="font-heading text-h4 uppercase">
								Attack vs Special Attack
							</p>
							<div class="flex flex-wrap justify-center gap-4">
								<button type="button" class="btn btn-primary" disabled>
									Physical
								</button>
								<button type="button" class="btn btn-secondary" disabled>
									Equal
								</button>
								<button type="button" class="btn btn-primary" disabled>
									Special
								</button>
							</div>
						</div>

						<!-- Defense vs Special Defense -->
						<div class="mt-8 space-y-2 text-center">
							<p class="font-heading text-h4 uppercase">
								Defense vs Special Defense
							</p>
							<div class="flex flex-wrap justify-center gap-4">
								<button type="button" class="btn btn-primary" disabled>
									Physical
								</button>
								<button type="button" class="btn btn-secondary" disabled>
									Equal
								</button>
								<button type="button" class="btn btn-primary" disabled>
									Special
								</button>
							</div>
						</div>

						<p class="mt-6 text-center text-p text-darker-gray">
							Current streak: <strong>0</strong>
						</p>
					</div>
				`,
			})}
		</main>
	`;
};

export default RolesPage;
