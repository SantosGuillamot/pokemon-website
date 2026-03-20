import { Hono } from "hono";
import Layout from "../components/Layout.js";
import AboutPage from "../pages/AboutPage.js";
import IndexPage from "../pages/IndexPage.js";

const app = new Hono();

app.get("/", (c) => {
	return c.html(
		Layout({ scripts: ["/public/js/index-store.js"], children: IndexPage() }),
	);
});

app.get("/about", (c) => {
	return c.html(
		Layout({
			title: "About",
			scripts: ["/public/js/about-store.js"],
			children: AboutPage(),
		}),
	);
});

export default app;
