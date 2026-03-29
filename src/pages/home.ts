import { html } from "hono/html";

const FEATURES = [
	{
		title: "Who's Faster",
		description:
			"Test your speed knowledge! Two Pokemon appear — guess which one moves first.",
		href: "/speeds",
	},
	{
		title: "Will It KO?",
		description:
			"Train your damage intuition. Can this move one-hit KO the defender?",
		href: "/will-it-ko",
	},
	{
		title: "Learn Types",
		description:
			"Master type effectiveness by filling in the chart or guessing weaknesses.",
		href: "/types",
	},
	{
		title: "Damage Calculator",
		description:
			"Full damage calculator — configure moves, stats, abilities, items, and field conditions.",
		href: "/damage-calculator",
	},
	{
		title: "Team Building",
		description:
			"Build competitive teams and analyze type coverage and meta matchups.",
		href: "/team-building",
	},
];

const HomePage = async () => {
	return html`
		<main class="space-y-16">
			<!-- Hero section -->
			<section class="space-y-4 text-center">
				<h1>Pokemon Champions Tools</h1>
				<p class="text-p-lg text-darker-gray mx-auto max-w-2xl">
					Your competitive companion for Pokemon Champions. Train your
					battle instincts, learn type matchups, calculate damage, and
					build winning teams.
				</p>
			</section>

			<!-- Feature cards -->
			<section class="space-y-8">
				<h2 class="text-center">Explore</h2>
				<div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
					${FEATURES.map(
						({ title, description, href }) => html`
							<a
								href="${href}"
								data-wp-interactive="pokemon/router"
								data-wp-on--click="actions.navigateTo"
								data-wp-on--mouseenter="actions.prefetchPage"
								class="block rounded-lg border-2 border-fog bg-white p-6 no-underline transition-shadow hover:shadow-md"
							>
								<h4 class="mb-2">${title}</h4>
								<p class="text-p text-darker-gray">${description}</p>
							</a>
						`,
					)}
				</div>
			</section>
		</main>
	`;
};

export default HomePage;
