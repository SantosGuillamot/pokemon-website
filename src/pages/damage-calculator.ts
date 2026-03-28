import { html } from "hono/html";

const DamageCalculatorPage = () => {
	return html`
		<main class="space-y-8">
			<section class="space-y-4">
				<h1>Damage Calculator</h1>
				<p class="text-p-lg text-darker-gray max-w-2xl">
					Full damage calculator for Pokemon Champions. Configure
					every detail and see the exact damage output.
				</p>
			</section>

			<section class="grid gap-6 lg:grid-cols-2">
				<!-- Attacker config -->
				<div class="rounded-lg border-2 border-fog bg-white p-6 space-y-4">
					<h2>Attacker</h2>

					<div class="space-y-3">
						<label class="block">
							<span class="text-p-sm font-bold">Pokemon</span>
							<select class="mt-1 block w-full rounded border border-fog p-2" disabled>
								<option>Select a Pokemon...</option>
							</select>
						</label>

						<label class="block">
							<span class="text-p-sm font-bold">Move</span>
							<select class="mt-1 block w-full rounded border border-fog p-2" disabled>
								<option>Select a move...</option>
							</select>
						</label>

						<label class="block">
							<span class="text-p-sm font-bold">Ability</span>
							<select class="mt-1 block w-full rounded border border-fog p-2" disabled>
								<option>Select an ability...</option>
							</select>
						</label>

						<label class="block">
							<span class="text-p-sm font-bold">Item</span>
							<select class="mt-1 block w-full rounded border border-fog p-2" disabled>
								<option>Select an item...</option>
							</select>
						</label>

						<div class="grid grid-cols-2 gap-2">
							<label class="block">
								<span class="text-p-sm font-bold">Level</span>
								<input type="number" value="50" class="mt-1 block w-full rounded border border-fog p-2" disabled />
							</label>
							<label class="block">
								<span class="text-p-sm font-bold">Nature</span>
								<select class="mt-1 block w-full rounded border border-fog p-2" disabled>
									<option>Adamant</option>
								</select>
							</label>
						</div>
					</div>
				</div>

				<!-- Defender config -->
				<div class="rounded-lg border-2 border-fog bg-white p-6 space-y-4">
					<h2>Defender</h2>

					<div class="space-y-3">
						<label class="block">
							<span class="text-p-sm font-bold">Pokemon</span>
							<select class="mt-1 block w-full rounded border border-fog p-2" disabled>
								<option>Select a Pokemon...</option>
							</select>
						</label>

						<label class="block">
							<span class="text-p-sm font-bold">Ability</span>
							<select class="mt-1 block w-full rounded border border-fog p-2" disabled>
								<option>Select an ability...</option>
							</select>
						</label>

						<label class="block">
							<span class="text-p-sm font-bold">Item</span>
							<select class="mt-1 block w-full rounded border border-fog p-2" disabled>
								<option>Select an item...</option>
							</select>
						</label>

						<div class="grid grid-cols-2 gap-2">
							<label class="block">
								<span class="text-p-sm font-bold">Level</span>
								<input type="number" value="50" class="mt-1 block w-full rounded border border-fog p-2" disabled />
							</label>
							<label class="block">
								<span class="text-p-sm font-bold">Nature</span>
								<select class="mt-1 block w-full rounded border border-fog p-2" disabled>
									<option>Bold</option>
								</select>
							</label>
						</div>
					</div>
				</div>
			</section>

			<!-- Field conditions -->
			<section class="rounded-lg border-2 border-fog bg-white p-6 space-y-4">
				<h2>Field Conditions</h2>
				<div class="flex flex-wrap gap-4">
					<label class="block">
						<span class="text-p-sm font-bold">Weather</span>
						<select class="mt-1 block rounded border border-fog p-2" disabled>
							<option>None</option>
							<option>Sun</option>
							<option>Rain</option>
							<option>Sand</option>
							<option>Snow</option>
						</select>
					</label>
					<label class="block">
						<span class="text-p-sm font-bold">Terrain</span>
						<select class="mt-1 block rounded border border-fog p-2" disabled>
							<option>None</option>
							<option>Electric</option>
							<option>Grassy</option>
							<option>Misty</option>
							<option>Psychic</option>
						</select>
					</label>
					<label class="flex items-center gap-2">
						<input type="checkbox" disabled />
						<span class="text-p-sm font-bold">Light Screen</span>
					</label>
					<label class="flex items-center gap-2">
						<input type="checkbox" disabled />
						<span class="text-p-sm font-bold">Reflect</span>
					</label>
				</div>
			</section>

			<!-- Results placeholder -->
			<section class="rounded-lg border-2 border-fog bg-white p-6 space-y-4">
				<h2>Results</h2>
				<div class="rounded-lg bg-fog p-4 space-y-2">
					<p class="text-p"><strong>Damage range:</strong> — – —</p>
					<p class="text-p"><strong>Percentage:</strong> —% – —%</p>
					<p class="text-p"><strong>KO chance:</strong> —</p>
				</div>
				<button type="button" class="btn btn-primary" disabled>
					Calculate
				</button>
			</section>
		</main>
	`;
};

export default DamageCalculatorPage;
