import { getElement, store } from "@wordpress/interactivity";

const routerStore = store("pokemon/router") as {
	state: { currentPath: string };
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
			const path = routerStore.state.currentPath;
			const { ref } = getElement();
			if (!ref) return false;
			const href = ref.getAttribute("href");
			if (!href) return false;
			if (href === "/") return path === "/";
			return path === href || path.startsWith(`${href}/`);
		},
		ariaCurrent() {
			const path = routerStore.state.currentPath;
			const { ref } = getElement();
			if (!ref) return false;
			const href = ref.getAttribute("href");
			if (!href) return false;
			if (href === "/") return path === "/" ? "page" : false;
			const active = path === href || path.startsWith(`${href}/`);
			return active ? "page" : false;
		},
	},
});
