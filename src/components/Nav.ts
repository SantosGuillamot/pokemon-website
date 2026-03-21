import { html } from "hono/html";

const Nav = () => {
	return html`
		<nav class="sticky top-0 z-50 bg-gray-900 px-6 py-4 flex items-center">
			<a
				href="/"
				data-wp-on--click="pokemon/router::actions.navigateTo"
				data-wp-on--mouseenter="pokemon/router::actions.prefetchPage"
				class="text-xl font-bold text-white hover:text-gray-300 transition-colors"
			>
				Pokemon
			</a>
			<a
				href="/about"
				data-wp-on--click="pokemon/router::actions.navigateTo"
				data-wp-on--mouseenter="pokemon/router::actions.prefetchPage"
				class="ml-6 text-gray-400 hover:text-gray-200 transition-colors"
			>
				About
			</a>
		</nav>
	`;
};

export default Nav;
