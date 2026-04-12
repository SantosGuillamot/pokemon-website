import type { DataTableContext } from "@pokemon-website/types/data-table";
import { getContext, store } from "@wordpress/interactivity";
import "../data-table.js";

store("pokemon/design-system", {
	callbacks: {
		onPokemonSelected() {
			const ctx = getContext<DataTableContext>("pokemon/data-table");
			if (!ctx.selectedId) return;
			const selected = ctx.rows.find((r) => r.id === ctx.selectedId);
			if (selected) {
				console.log("Selected:", selected.name);
			}
		},
	},
});
