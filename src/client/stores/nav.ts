import { getContext, store } from "@wordpress/interactivity";

type NavContext = {
	navHref: string;
};

const { state, actions } = store("pokemon/nav", {
	state: {
		isMenuOpen: false,
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
		handleKeydown(event: KeyboardEvent) {
			if (event.key === "Escape") {
				actions.closeMenu();
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
