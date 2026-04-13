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
				nickname: "Test Charizard",
				pokemonId: 6,
				moveIds: [53, 56, null, null],
				abilityId: null,
				itemId: null,
				statPoints: {
					hp: 0,
					attack: 0,
					defense: 0,
					spAttack: 0,
					spDefense: 0,
					speed: 0,
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
