import { store, withSyncEvent } from "@wordpress/interactivity";

store("pokemon/router", {
	actions: {
		navigateTo: withSyncEvent(function* (event: Event) {
			event.preventDefault();
			const href = (event.currentTarget as HTMLAnchorElement).href;
			const { actions } = yield import("@wordpress/interactivity-router");
			yield actions.navigate(href);
		}),
		prefetchPage: function* (event: Event): Generator {
			const href = (event.currentTarget as HTMLAnchorElement).href;
			const { actions } = yield import("@wordpress/interactivity-router");
			yield actions.prefetch(href);
		},
	},
});
