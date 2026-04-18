import type { TeamBuilderStore } from "@pokemon-website/stores/pages/team-building";
import type { DataTableContext } from "@pokemon-website/types/data-table";
import type { MetaPokemon, Team } from "@pokemon-website/types/team-builder";
import { getContext, store } from "@wordpress/interactivity";
import "@pokemon-website/stores/data-table";
import "@pokemon-website/stores/pages/team-building";

const { actions: teamBuilderActions } = store(
	"pokemon/team-builder",
) as TeamBuilderStore;

store("pokemon/design-system", {
	actions: {
		createSampleMetaPokemon() {
			teamBuilderActions.createMetaPokemon({
				nickname: `Test Charizard ${Date.now()}`,
				pokemonId: 4402,
				moveIds: [53, 56, null, null],
				abilityId: null,
				itemId: 2239,
				natureId: 5,
				statPoints: {
					hp: 6,
					attack: 4,
					defense: 8,
					spAttack: 20,
					spDefense: 10,
					speed: 18,
				},
			});
		},
		deleteMetaPokemon() {
			const ctx = getContext<{ item: MetaPokemon }>("pokemon/team-builder");
			teamBuilderActions.deleteMetaPokemon(ctx.item.id);
		},
		createSampleTeam() {
			teamBuilderActions.createTeam({
				name: "Test Team Alpha",
				notes: "Created from the design system test section.",
				members: [null, null, null, null, null, null],
			});
		},
		deleteTeam() {
			const ctx = getContext<{ item: Team }>("pokemon/team-builder");
			teamBuilderActions.deleteTeam(ctx.item.id);
		},
	},
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
