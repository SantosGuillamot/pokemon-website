import { Hono } from "hono";
import { resetServerState } from "iapi-ssr-processor";
import Layout from "../components/Layout.js";
import AboutPage from "../pages/about.js";
import HomePage from "../pages/home.js";

const app = new Hono();

app.get("/", async (c) => {
	resetServerState();
	return c.html(
		Layout({
			scripts: ["/public/js/stores/pokemons.js"],
			children: await HomePage(),
		}),
	);
});

app.get("/about", async (c) => {
	resetServerState();
	return c.html(
		Layout({
			title: "About",
			scripts: ["/public/js/stores/pages/about.js"],
			children: await AboutPage(),
		}),
	);
});

export default app;
