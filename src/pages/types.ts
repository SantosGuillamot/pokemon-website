import { html } from "hono/html";
import Hero from "../sections/Hero.js";
import Section from "../sections/Section.js";

const LearnTypesPage = () => {
	return html`
		<main>
			${Hero({
				title: "Learn Types",
				description:
					"Master type effectiveness with two different modes. Fill in the full type chart or guess a Pokemon's weaknesses in a streak challenge.",
				image: "/public/images/pokemon/artwork/8.png",
				imageBg: "/public/images/pokemon/artwork/9.png",
			})}

			${Section({
				children: html`
					<div class="grid gap-6 sm:grid-cols-2">
						<!-- Mode A -->
						<div class="rounded-lg border-2 border-fog bg-white p-6 space-y-4">
							<h2>Fill the Type Chart</h2>
							<p class="text-p text-darker-gray">
								An empty type effectiveness table appears. Fill in each
								cell — super effective, not very effective, no effect, or
								neutral. See your score at the end!
							</p>

							<!-- Placeholder mini chart -->
							<div class="overflow-x-auto">
								<table class="w-full text-p-sm">
									<thead>
										<tr>
											<th class="p-2 text-left"></th>
											<th class="p-2">Normal</th>
											<th class="p-2">Fire</th>
											<th class="p-2">Water</th>
											<th class="p-2">Grass</th>
										</tr>
									</thead>
									<tbody>
										<tr>
											<td class="p-2 font-bold">Normal</td>
											<td class="p-2 text-center text-darker-gray">—</td>
											<td class="p-2 text-center text-darker-gray">—</td>
											<td class="p-2 text-center text-darker-gray">—</td>
											<td class="p-2 text-center text-darker-gray">—</td>
										</tr>
										<tr>
											<td class="p-2 font-bold">Fire</td>
											<td class="p-2 text-center text-darker-gray">—</td>
											<td class="p-2 text-center text-darker-gray">—</td>
											<td class="p-2 text-center text-darker-gray">—</td>
											<td class="p-2 text-center text-darker-gray">—</td>
										</tr>
										<tr>
											<td class="p-2 font-bold">Water</td>
											<td class="p-2 text-center text-darker-gray">—</td>
											<td class="p-2 text-center text-darker-gray">—</td>
											<td class="p-2 text-center text-darker-gray">—</td>
											<td class="p-2 text-center text-darker-gray">—</td>
										</tr>
										<tr>
											<td class="p-2 font-bold">Grass</td>
											<td class="p-2 text-center text-darker-gray">—</td>
											<td class="p-2 text-center text-darker-gray">—</td>
											<td class="p-2 text-center text-darker-gray">—</td>
											<td class="p-2 text-center text-darker-gray">—</td>
										</tr>
									</tbody>
								</table>
							</div>

							<button type="button" class="btn btn-primary" disabled>
								Start Quiz
							</button>
						</div>

						<!-- Mode B -->
						<div class="rounded-lg border-2 border-fog bg-white p-6 space-y-4">
							<h2>Guess the Weaknesses</h2>
							<p class="text-p text-darker-gray">
								A Pokemon appears with its type(s). Guess what types it
								is weak to. One wrong answer ends your streak!
							</p>

							<!-- Placeholder Pokemon -->
							<div class="flex flex-col items-center gap-2">
								<div class="flex h-32 w-32 items-center justify-center rounded-lg bg-fog">
									<span class="text-darker-gray text-p-sm">Image</span>
								</div>
								<p class="font-heading text-h4 uppercase">Charizard</p>
								<p class="text-p-sm text-darker-gray">Fire / Flying</p>
							</div>

							<p class="text-p text-darker-gray">
								Weak to: <strong>???</strong>
							</p>

							<button type="button" class="btn btn-primary" disabled>
								Start Streak
							</button>
						</div>
					</div>
				`,
			})}
		</main>
	`;
};

export default LearnTypesPage;
