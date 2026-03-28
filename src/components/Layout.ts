import { html, raw } from "hono/html";
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
				<link rel="icon" href="/public/icons/logo.svg" type="image/svg+xml" />
				<link rel="stylesheet" href="/public/css/app.css" />
				<script type="application/json" id="wp-interactivity-data">${raw(serverData)}</script>
				<script type="importmap" id="wp-importmap">
					{
						"imports": {
							"@wordpress/interactivity": "/public/js/@wordpress/interactivity.js",
							"@wordpress/interactivity-router": "/public/js/@wordpress/interactivity-router.js",
							"@pokemon-website/stores/pokemons": "/public/js/stores/pokemons.js",
							"@pokemon-website/stores/router": "/public/js/stores/router.js",
							"@pokemon-website/stores/nav": "/public/js/stores/nav.js"
						}
					}
				</script>
				<script type="module" src="/public/js/@wordpress/interactivity.js"></script>
				<script type="module" src="/public/js/stores/router.js" data-wp-router-options='{"loadOnClientNavigation":true}'></script>
				<script type="module" src="/public/js/stores/nav.js" data-wp-router-options='{"loadOnClientNavigation":true}'></script>
				${scripts?.map((src) => html`<script type="module" src="${src}" data-wp-router-options='{"loadOnClientNavigation":true}'></script>`)}
			</head>
			<body data-wp-interactive="pokemon" data-wp-router-region="full-page-csn" class="min-h-screen font-body antialiased">
				${Nav()}
				<div class="max-w-7xl mx-auto px-6 pt-28 pb-12">
					${children}
				</div>
			</body>
		</html>
	`;

	return processDirectives(pageHtml.toString());
};

export default Layout;
