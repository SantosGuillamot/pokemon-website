import { asc } from "drizzle-orm";
import { Hono } from "hono";
import { resetServerState, setServerConfig } from "iapi-ssr-processor";
import Layout from "../components/Layout.js";
import { db } from "../db/client.js";
import { types } from "../db/schema/index.js";
import DamageCalculatorPage from "../pages/damage-calculator.js";
import DesignSystemPage from "../pages/design-system.js";
import HomePage from "../pages/home.js";
import RolesPage from "../pages/roles.js";
import SpecialAttackPage from "../pages/special-attack.js";
import SpeedsPage from "../pages/speeds.js";
import TeamBuildingPage from "../pages/team-building.js";
import TypesPage from "../pages/types.js";
import WillItKoPage from "../pages/will-it-ko.js";
import {
	loadAbilities,
	loadItems,
	loadMoves,
	loadNatures,
} from "../utils/load-reference-data.js";
import { loadPokemons } from "../utils.js";

const app = new Hono();

const pages = [
	{ path: "/", title: undefined, render: HomePage },
	{
		path: "/types",
		title: "Types",
		render: TypesPage,
		scripts: ["/js/stores/pages/types.js"],
	},
	{
		path: "/speeds",
		title: "Speeds",
		render: SpeedsPage,
		scripts: ["/js/stores/pages/speeds.js"],
	},
	{
		path: "/special-attack",
		title: "Special Attack",
		render: SpecialAttackPage,
		scripts: ["/js/stores/pages/special-attack.js"],
	},
	{ path: "/roles", title: "Roles", render: RolesPage },
	{ path: "/will-it-ko", title: "Will It KO", render: WillItKoPage },
	{
		path: "/damage-calculator",
		title: "Damage Calculator",
		render: DamageCalculatorPage,
	},
	{
		path: "/design-system",
		title: "Design System",
		render: DesignSystemPage,
		scripts: ["/js/stores/pages/design-system.js"],
	},
];

for (const { path, title, render, scripts } of pages) {
	app.get(path, async (c) => {
		resetServerState();
		await loadTypes();
		await loadPokemons();
		return c.html(Layout({ title, scripts, children: await render() }));
	});
}

app.get("/team-building", async (c) => {
	resetServerState();
	await Promise.all([
		loadTypes(),
		loadPokemons(),
		loadMoves(),
		loadAbilities(),
		loadItems(),
		loadNatures(),
	]);
	return c.html(
		Layout({
			title: "Team Builder",
			scripts: ["/js/stores/pages/team-building.js"],
			children: await TeamBuildingPage(),
		}),
	);
});

// Load types once — cache in memory across requests.
let typesConfig: Record<string, unknown> | undefined;
async function loadTypes() {
	if (!typesConfig) {
		const typesList = await db.select().from(types).orderBy(asc(types.id));
		const typesMap: Record<string, (typeof typesList)[number]> = {};
		for (const type of typesList) {
			if (type.name === "stellar") continue;
			typesMap[String(type.id)] = type;
		}
		typesConfig = typesMap;
	}
	setServerConfig("pokemon", { types: typesConfig });
}

export default app;
