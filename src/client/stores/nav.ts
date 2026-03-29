import { getContext, store } from "@wordpress/interactivity";

type NavContext = {
	navHref: string;
};

const { state, actions } = store("pokemon/nav", {
	state: {
		isMenuOpen: false,
		isGamesDropdownOpen: false,
	},
	actions: {
		openMenu() {
			state.isMenuOpen = true;
			document.body.style.overflow = "hidden";
		},
		closeMenu() {
			state.isMenuOpen = false;
			document.body.style.overflow = "";
		},
		toggleGamesDropdown() {
			state.isGamesDropdownOpen = !state.isGamesDropdownOpen;
		},
		openGamesDropdown() {
			state.isGamesDropdownOpen = true;
		},
		closeGamesDropdown() {
			state.isGamesDropdownOpen = false;
		},
		handleKeydown(event: KeyboardEvent) {
			if (event.key === "Escape") {
				actions.closeMenu();
				actions.closeGamesDropdown();
			}
		},
	},
	callbacks: {
		isActive() {
			const context = getContext<NavContext>();
			const path = window.location.pathname;
			if (context.navHref === "/") return path === "/";
			return path === context.navHref || path.startsWith(`${context.navHref}/`);
		},
		ariaCurrent() {
			const context = getContext<NavContext>();
			const path = window.location.pathname;
			if (context.navHref === "/") return path === "/" ? "page" : false;
			const active =
				path === context.navHref || path.startsWith(`${context.navHref}/`);
			return active ? "page" : false;
		},
	},
});
