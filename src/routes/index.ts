import { Hono } from "hono";
import { resetServerState } from "iapi-ssr-processor";
import Layout from "../components/Layout.js";
import DamageCalculatorPage from "../pages/damage-calculator.js";
import DesignSystemPage from "../pages/design-system.js";
import HomePage from "../pages/home.js";
import SpeedsPage from "../pages/speeds.js";
import TeamBuildingPage from "../pages/team-building.js";
import TypesPage from "../pages/types.js";
import RolesPage from "../pages/roles.js";
import WillItKoPage from "../pages/will-it-ko.js";

const app = new Hono();

app.get("/", async (c) => {
	resetServerState();
	return c.html(
		Layout({
			children: await HomePage(),
		}),
	);
});

app.get("/types", (c) => {
	resetServerState();
	return c.html(
		Layout({
			title: "Types",
			children: TypesPage(),
		}),
	);
});

app.get("/speeds", (c) => {
	resetServerState();
	return c.html(
		Layout({
			title: "Speeds",
			children: SpeedsPage(),
		}),
	);
});

app.get("/roles", (c) => {
	resetServerState();
	return c.html(
		Layout({
			title: "Roles",
			children: RolesPage(),
		}),
	);
});

app.get("/will-it-ko", (c) => {
	resetServerState();
	return c.html(
		Layout({
			title: "Will It KO",
			children: WillItKoPage(),
		}),
	);
});

app.get("/damage-calculator", (c) => {
	resetServerState();
	return c.html(
		Layout({
			title: "Damage Calculator",
			children: DamageCalculatorPage(),
		}),
	);
});

app.get("/team-building", (c) => {
	resetServerState();
	return c.html(
		Layout({
			title: "Team Building",
			children: TeamBuildingPage(),
		}),
	);
});

app.get("/design-system", (c) => {
	resetServerState();
	return c.html(
		Layout({
			title: "Design System",
			children: DesignSystemPage(),
		}),
	);
});

export default app;
