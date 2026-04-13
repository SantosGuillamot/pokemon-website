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
				<link rel="preload" as="font" href="/fonts/dotgothic16.woff2" type="font/woff2" crossorigin />
				<link rel="preload" as="font" href="/fonts/space-mono.woff2" type="font/woff2" crossorigin />
				<link rel="preload" as="font" href="/fonts/karla-regular.woff2" type="font/woff2" crossorigin />
				<link rel="icon" href="/icons/logo.svg" type="image/svg+xml" />
				<link rel="stylesheet" href="/css/app.css" />
				<script type="application/json" id="wp-interactivity-data">${raw(serverData)}</script>
				<script type="importmap" id="wp-importmap">
					{
						"imports": {
							"@wordpress/interactivity": "/js/@wordpress/interactivity.js",
							"@wordpress/interactivity-router": "/js/@wordpress/interactivity-router.js",
							"@pokemon-website/stores/pokemons": "/js/stores/pokemons.js",
							"@pokemon-website/stores/router": "/js/stores/router.js",
							"@pokemon-website/stores/nav": "/js/stores/nav.js",
							"@pokemon-website/stores/quiz-utils": "/js/stores/quiz-utils.js",
							"@pokemon-website/stores/pages/team-building": "/js/stores/pages/team-building.js"
						}
					}
				</script>
				<script type="module" src="/js/@wordpress/interactivity.js"></script>
				<script type="module" src="/js/stores/router.js" data-wp-router-options='{"loadOnClientNavigation":true}'></script>
				<script type="module" src="/js/stores/nav.js" data-wp-router-options='{"loadOnClientNavigation":true}'></script>
				<script type="module" src="/js/stores/pokemons.js" data-wp-router-options='{"loadOnClientNavigation":true}'></script>
				${scripts?.map((src) => html`<script type="module" src="${src}" data-wp-router-options='{"loadOnClientNavigation":true}'></script>`)}
			</head>
			<body data-wp-interactive="pokemon" data-wp-context="{}" data-wp-router-region="full-page-csn" class="min-h-screen font-body antialiased">
				${Nav()}
				<div class="pt-20 pb-12">
					${children}
				</div>
			</body>
		</html>
	`;

	return processDirectives(pageHtml.toString());
};

export default Layout;
