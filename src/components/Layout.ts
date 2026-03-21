import { html } from "hono/html";
import type { HtmlEscapedString } from "hono/utils/html";
import { getServerData, processDirectives } from "iapi-ssr-processor";
import Nav from "./Nav.js";

type LayoutProps = {
	title?: string;
	scripts?: string[];
	children: HtmlEscapedString | Promise<HtmlEscapedString>;
};

const Layout = ({
	title = "Pokemon Website",
	scripts,
	children,
}: LayoutProps) => {
	const serverData = JSON.stringify(getServerData());

	const pageHtml = html`
		<!doctype html>
		<html lang="en">
			<head>
				<meta charset="UTF-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1.0" />
				<title>${title}</title>
				<link rel="stylesheet" href="/public/css/app.css" />
				<script type="application/json" id="wp-interactivity-data">${serverData}</script>
				<script type="module" src="/public/js/global-stores/router.js" data-wp-router-options='{"loadOnClientNavigation":true}'></script>
				${scripts?.map((src) => html`<script type="module" src="${src}" data-wp-router-options='{"loadOnClientNavigation":true}'></script>`)}
			</head>
			<body data-wp-interactive="pokemon/router" data-wp-router-region="full-page-csn" class="bg-gray-950 text-gray-100 min-h-screen font-sans antialiased">
				${Nav()}
				${children}
			</body>
		</html>
	`;

	return processDirectives(pageHtml.toString());
};

export default Layout;
