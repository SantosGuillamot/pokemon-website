import { store, withSyncEvent } from "@wordpress/interactivity";

store("pokemon/router", {
	actions: {
		navigateTo: withSyncEvent(function* (event: Event) {
			event.preventDefault();
			const { actions } = yield import("@wordpress/interactivity-router");
			yield actions.navigate((event.target as HTMLAnchorElement).href);
		}),
		prefetchPage: function* (event: Event): Generator {
			const { actions } = yield import("@wordpress/interactivity-router");
			yield actions.prefetch((event.target as HTMLAnchorElement).href);
		},
	},
});
