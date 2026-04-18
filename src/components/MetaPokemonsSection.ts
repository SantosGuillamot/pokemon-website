import type {
	DataTableColumn,
	DataTableRow,
} from "@pokemon-website/types/data-table";
import { html } from "hono/html";
import { Trash2 } from "lucide-static";
import DataTable from "./DataTable.js";

const MetaPokemonsSection = () => {
	const columns: DataTableColumn[] = [
		{
			key: "sprite",
			label: "",
			render: "image",
			altKey: "nickname",
			cellClass: "w-20",
		},
		{
			key: "itemName",
			label: "Item",
			render: "image",
			imageKey: "itemImage",
			imageSize: 32,
			sortable: true,
			cellClass: "w-12",
		},
		{
			key: "nickname",
			label: "Name",
			sortable: true,
			searchable: true,
		},
		{
			key: "type1Name",
			label: "Types",
			render: "types",
			sortable: true,
			cellClass: "w-20",
		},
		{
			key: "natureName",
			label: "Nature",
			sortable: true,
		},
		{ key: "hp", label: "HP", sortable: true },
		{ key: "attack", label: "Atk", sortable: true },
		{ key: "defense", label: "Def", sortable: true },
		{ key: "spAttack", label: "SpA", sortable: true },
		{ key: "spDefense", label: "SpD", sortable: true },
		{ key: "speed", label: "Spe", sortable: true },
		{
			key: "_actions",
			label: "",
			render: "action",
			cellClass: "w-12 text-right",
			action: {
				icon: Trash2,
				label: "Delete meta pokemon",
				callback: "pokemon/team-builder::actions.deleteMetaPokemonWithConfirm",
			},
		},
	];

	const rows: DataTableRow[] = [];

	const addNewButton = html`<button
		type="button"
		class="btn btn-primary"
		data-wp-on--click="pokemon/team-builder::actions.openNewEditor"
	>+ Add New</button>`;

	return html`
		<div class="space-y-4">
			<h3>Meta Pokemons</h3>
			<p class="text-p text-darker-gray">
				Define the Pokemon configurations that represent the current meta.
				These will be used to analyze your team's matchups and coverage.
			</p>
			<div data-wp-interactive="pokemon/data-table">
				${DataTable({
					columns,
					rows,
					caption: "Meta Pokemons",
					searchPlaceholder: "Search meta pokemons...",
					sortColumn: "nickname",
					sortDirection: "asc",
					rowsStore: "pokemon/team-builder",
					rowsKey: "metaPokemonRows",
					emptyMessage: "No meta pokemons yet. Click + Add New to create one.",
					headerEnd: addNewButton,
				})}
			</div>
		</div>
	`;
};

export default MetaPokemonsSection;
