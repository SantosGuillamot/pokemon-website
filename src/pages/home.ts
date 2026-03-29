import { html } from "hono/html";
import {
	Calculator,
	Grid2x2,
	Shield,
	Swords,
	Timer,
	Users,
} from "lucide-static";
import Card from "../components/Card.js";
import Hero from "../sections/Hero.js";
import Section from "../sections/Section.js";

const GAMES = [
	{
		title: "Learn Types",
		description:
			"Master type effectiveness by filling in the chart or guessing weaknesses.",
		href: "/types",
		icon: Grid2x2,
	},
	{
		title: "Who's Faster",
		description:
			"Test your speed knowledge! Two Pokemon appear — guess which one moves first.",
		href: "/speeds",
		icon: Timer,
	},
	{
		title: "Roles",
		description:
			"Does it hit harder physically or specially? Learn each Pokemon's offensive and defensive role.",
		href: "/roles",
		icon: Shield,
	},
	{
		title: "Will It KO?",
		description:
			"Train your damage intuition. Can this move one-hit KO the defender?",
		href: "/will-it-ko",
		icon: Swords,
	},
];

const TOOLS = [
	{
		title: "Damage Calculator",
		description:
			"Full damage calculator — configure moves, stats, abilities, items, and field conditions.",
		href: "/damage-calculator",
		icon: Calculator,
	},
	{
		title: "Team Building",
		description:
			"Build competitive teams and analyze type coverage and meta matchups.",
		href: "/team-building",
		icon: Users,
	},
];

const HomePage = async () => {
	return html`
		<main>
			${Hero({
				title: "Pokemon Champions",
				description:
					"Your competitive companion for Pokemon Champions. Train your battle instincts, learn type matchups, calculate damage, and build winning teams.",
				image:
					"https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png",
				imageBg:
					"https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/6.png",
			})}

			${Section({
				children: html`
					<div class="space-y-8">
						<h2 class="text-center">Tools</h2>
						<div class="flex flex-wrap justify-center gap-6">
							${TOOLS.map(({ title, description, href, icon }) =>
								Card({ title, description, href, icon }),
							)}
						</div>
					</div>
				`,
			})}

			${Section({
				children: html`
					<div class="space-y-8">
						<h2 class="text-center">Games</h2>
						<div class="flex flex-wrap justify-center gap-6">
							${GAMES.map(({ title, description, href, icon }) =>
								Card({ title, description, href, icon }),
							)}
						</div>
					</div>
				`,
			})}
		</main>
	`;
};

export default HomePage;
