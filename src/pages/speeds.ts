import { html } from "hono/html";

const WhosFasterPage = () => {
	return html`
		<main class="space-y-8">
			<section class="space-y-4">
				<h1>Who's Faster?</h1>
				<p class="text-p-lg text-darker-gray max-w-2xl">
					Two Pokemon appear side by side. Guess which one is faster
					based on their speed stat — or if they're tied. One wrong
					answer ends your streak!
				</p>
			</section>

			<!-- Placeholder game area -->
			<section class="rounded-lg border-2 border-fog bg-white p-8">
				<div class="flex flex-col items-center gap-8 sm:flex-row sm:justify-center">
					<div class="flex flex-col items-center gap-2">
						<div class="flex h-40 w-40 items-center justify-center rounded-lg bg-fog">
							<span class="text-darker-gray">Pokemon A</span>
						</div>
						<p class="font-heading text-h4 uppercase">Pikachu</p>
					</div>

					<p class="font-heading text-h2">VS</p>

					<div class="flex flex-col items-center gap-2">
						<div class="flex h-40 w-40 items-center justify-center rounded-lg bg-fog">
							<span class="text-darker-gray">Pokemon B</span>
						</div>
						<p class="font-heading text-h4 uppercase">Bulbasaur</p>
					</div>
				</div>

				<div class="mt-8 flex flex-wrap justify-center gap-4">
					<button type="button" class="btn btn-primary" disabled>
						Pokemon A is faster
					</button>
					<button type="button" class="btn btn-secondary" disabled>
						They're equal
					</button>
					<button type="button" class="btn btn-primary" disabled>
						Pokemon B is faster
					</button>
				</div>

				<p class="mt-6 text-center text-p text-darker-gray">
					Current streak: <strong>0</strong>
				</p>
			</section>
		</main>
	`;
};

export default WhosFasterPage;
