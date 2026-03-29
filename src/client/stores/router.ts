import { store, withSyncEvent } from "@wordpress/interactivity";

const { state } = store("pokemon/router", {
	state: {
		currentPath: "",
	},
	callbacks: {
		init() {
			state.currentPath = window.location.pathname;
			window.addEventListener("popstate", () => {
				state.currentPath = window.location.pathname;
			});
		},
	},
	actions: {
		navigateTo: withSyncEvent(function* (event: Event) {
			event.preventDefault();
			const href = (event.currentTarget as HTMLAnchorElement).href;
			const { actions } = yield import("@wordpress/interactivity-router");
			yield actions.navigate(href);
			state.currentPath = window.location.pathname;
		}),
		prefetchPage: function* (event: Event): Generator {
			const href = (event.currentTarget as HTMLAnchorElement).href;
			const { actions } = yield import("@wordpress/interactivity-router");
			yield actions.prefetch(href);
		},
	},
});
