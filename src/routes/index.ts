import { Hono } from "hono";
import { resetServerState } from "iapi-ssr-processor";
import Layout from "../components/Layout.js";
import AboutPage from "../pages/about/page.js";
import HomePage from "../pages/home/page.js";

const app = new Hono();

app.get("/", (c) => {
	resetServerState();
	return c.html(
		Layout({ scripts: ["/public/js/global-stores/pokemon.js"], children: HomePage() }),
	);
});

app.get("/about", (c) => {
	resetServerState();
	return c.html(
		Layout({
			title: "About",
			scripts: ["/public/js/pages/about/store.js"],
			children: AboutPage(),
		}),
	);
});

export default app;
