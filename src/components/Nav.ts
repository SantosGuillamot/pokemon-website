import { html, raw } from "hono/html";
import { setServerState } from "iapi-ssr-processor";
import { ChevronDown, Globe, Menu, X } from "lucide-static";
import { githubIcon, twitterIcon } from "../icons.js";

const GAME_LINKS = [
	{ label: "TYPES", href: "/types" },
	{ label: "SPEEDS", href: "/speeds" },
	{ label: "ROLES", href: "/roles" },
	{ label: "WILL IT KO?", href: "/will-it-ko" },
];

const TOOL_LINKS = [
	{ label: "CALCULATOR", href: "/damage-calculator" },
	{ label: "TEAM BUILDER", href: "/team-building" },
];

const SOCIAL_LINKS = [
	{
		label: "Website (opens in a new tab)",
		href: "https://mariosantos.es",
		icon: Globe,
	},
	{
		label: "X (opens in a new tab)",
		href: "https://x.com/SantosGuillamot",
		icon: twitterIcon,
	},
	{
		label: "GitHub (opens in a new tab)",
		href: "https://github.com/SantosGuillamot",
		icon: githubIcon,
	},
];

const Nav = () => {
	setServerState("pokemon/nav", {
		isMenuOpen: false,
		isGamesDropdownOpen: false,
	});
	setServerState("pokemon/router", {
		currentPath: "",
	});

	return html`
		<nav data-wp-interactive="pokemon/nav" data-wp-init="pokemon/router::callbacks.init" aria-label="Main navigation" class="nav-header fixed top-0 left-0 right-0 z-50 h-20 bg-primary font-bold">
			<div class="mx-auto flex h-full max-w-7xl items-center justify-between px-6">
				<!-- Logo + site name -->
				<a
					href="/"
					data-wp-on--click="pokemon/router::actions.navigateTo"
					data-wp-on--mouseenter="pokemon/router::actions.prefetchPage"
					class="flex items-center gap-2 font-heading text-h4 uppercase tracking-[0.1em] text-black no-underline"
				>
					<img
						src="/public/icons/logo.svg"
						alt="Pokemon Website logo"
						width="40"
						height="40"
					/>
					POKEMON
				</a>

				<!-- Desktop nav links -->
				<div class="hidden items-center gap-8 md:flex">
					${TOOL_LINKS.map(
						({ label, href }) => html`
							<a
								href="${href}"
								data-wp-on--click="pokemon/router::actions.navigateTo"
								data-wp-on--mouseenter="pokemon/router::actions.prefetchPage"
								data-wp-class--nav-link-active="callbacks.isActive"
								data-wp-bind--aria-current="callbacks.ariaCurrent"
								class="nav-link font-heading text-h4 uppercase tracking-[0.1em] text-black no-underline transition-colors hover:text-black/70"
							>
								${label}
							</a>
						`,
					)}

					<!-- Games dropdown -->
					<div
						class="relative"
						data-wp-on--mouseenter="actions.openGamesDropdown"
						data-wp-on--mouseleave="actions.closeGamesDropdown"
					>
						<button
							type="button"
							class="nav-link flex items-center gap-1 font-heading text-h4 uppercase tracking-[0.1em] text-black transition-colors hover:text-black/70"
							data-wp-on--click="actions.toggleGamesDropdown"
							data-wp-bind--aria-expanded="state.isGamesDropdownOpen"
							aria-haspopup="true"
						>
							GAMES
							<span class="nav-dropdown-chevron inline-flex transition-transform duration-200" data-wp-class--nav-dropdown-chevron-open="state.isGamesDropdownOpen">${raw(ChevronDown)}</span>
						</button>
						<div
							class="nav-dropdown flex flex-col rounded bg-white shadow-nav"
							data-wp-bind--hidden="!state.isGamesDropdownOpen"
							role="menu"
						>
							${GAME_LINKS.map(
								({ label, href }) => html`
									<a
										href="${href}"
										data-wp-on--click="pokemon/router::actions.navigateTo"
										data-wp-on--mouseenter="pokemon/router::actions.prefetchPage"
										data-wp-class--nav-link-active="callbacks.isActive"
										data-wp-bind--aria-current="callbacks.ariaCurrent"
										class="nav-dropdown-item font-heading uppercase tracking-[0.1em] text-black no-underline whitespace-nowrap px-5 py-2.5 first:rounded-t last:rounded-b hover:bg-fog"
										role="menuitem"
									>
										${label}
									</a>
								`,
							)}
						</div>
					</div>

					<!-- Social icons -->
					<div class="flex items-center gap-4 border-l border-black/20 pl-6">
						${SOCIAL_LINKS.map(
							({ label, href, icon }) => html`
								<a
									href="${href}"
									target="_blank"
									rel="noopener noreferrer"
									class="text-black transition-colors hover:text-black/70"
									aria-label="${label}"
								>
									${raw(icon)}
								</a>
							`,
						)}
					</div>
				</div>

				<!-- Mobile hamburger button -->
				<button
					type="button"
					class="nav-btn flex items-center justify-center text-black md:hidden"
					data-wp-on--click="actions.openMenu"
					data-wp-bind--aria-expanded="state.isMenuOpen"
					aria-label="Menu"
				>
					${raw(Menu)}
				</button>
			</div>

			<!-- Mobile menu overlay -->
			<div
				class="fixed inset-0 z-[60] flex flex-col bg-white md:hidden"
				data-wp-bind--hidden="!state.isMenuOpen"
				data-wp-on--keydown="actions.handleKeydown"
				role="dialog"
				aria-modal="true"
				aria-label="Navigation menu"
			>
				<!-- Close button -->
				<div class="flex h-20 items-center justify-end px-6">
					<button
						type="button"
						class="nav-btn flex items-center justify-center text-black"
						data-wp-on--click="actions.closeMenu"
						aria-label="Close menu"
					>
						${raw(X)}
					</button>
				</div>

				<!-- Mobile nav links -->
				<div class="flex flex-1 flex-col items-center justify-center gap-8">
					<!-- Games group -->
					<div class="flex flex-col items-center gap-4">
						<span class="font-heading text-sm uppercase tracking-[0.15em] text-darker-gray">Games</span>
						${GAME_LINKS.map(
							({ label, href }) => html`
								<a
									href="${href}"
									data-wp-on--click---close="actions.closeMenu"
									data-wp-on--click---navigate="pokemon/router::actions.navigateTo"
									data-wp-on--mouseenter="pokemon/router::actions.prefetchPage"
									data-wp-class--nav-link-active="callbacks.isActive"
									data-wp-bind--aria-current="callbacks.ariaCurrent"
									class="nav-link font-heading text-2xl uppercase tracking-[0.1em] text-black no-underline"
								>
									${label}
								</a>
							`,
						)}
					</div>

					<!-- Separator -->
					<div class="h-px w-16 bg-black/20"></div>

					<!-- Tool links -->
					${TOOL_LINKS.map(
						({ label, href }) => html`
							<a
								href="${href}"
								data-wp-on--click---close="actions.closeMenu"
								data-wp-on--click---navigate="pokemon/router::actions.navigateTo"
								data-wp-on--mouseenter="pokemon/router::actions.prefetchPage"
								data-wp-class--nav-link-active="callbacks.isActive"
								data-wp-bind--aria-current="callbacks.ariaCurrent"
								class="nav-link font-heading text-2xl uppercase tracking-[0.1em] text-black no-underline"
							>
								${label}
							</a>
						`,
					)}
				</div>

				<!-- Mobile social icons -->
				<div class="flex items-center justify-center gap-6 pb-12">
					${SOCIAL_LINKS.map(
						({ label, href, icon }) => html`
							<a
								href="${href}"
								target="_blank"
								rel="noopener noreferrer"
								class="text-black transition-colors hover:text-black/70"
								aria-label="${label}"
							>
								${raw(icon)}
							</a>
						`,
					)}
				</div>
			</div>
		</nav>
	`;
};

export default Nav;
