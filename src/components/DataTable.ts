import type {
	DataTableColumn,
	DataTableContext,
	DataTableRow,
} from "@pokemon-website/types/data-table";
import { html, raw } from "hono/html";

type DataTableProps = {
	/** Column definitions. */
	columns: DataTableColumn[];
	/** Initial row data. */
	rows: DataTableRow[];
	/** Enable single-selection mode. Defaults to false. */
	selectable?: boolean;
	/** Optional CSS class for the outer wrapper. */
	className?: string;
	/** Accessible caption for the table. */
	caption?: string;
	/** Maximum height for the scroll container (CSS value). Defaults to none (parent controls height). */
	maxHeight?: string;
	/** If provided, renders a search input above the table with this placeholder text. */
	searchPlaceholder?: string;
	/**
	 * A fully-qualified `data-wp-watch` callback reference to place on the
	 * context wrapper, e.g. "pokemon/design-system::callbacks.onPokemonSelected".
	 * Because the watch is rendered inside the DataTable's `data-wp-context`,
	 * the callback can read the table's context via `getContext("pokemon/data-table")`.
	 */
	watchCallback?: string;
	/** Initial sort column key. When provided, the table starts sorted by this column. */
	sortColumn?: string | null;
	/** Initial sort direction. Defaults to "asc". Only meaningful when `sortColumn` is set. */
	sortDirection?: "asc" | "desc";
	/**
	 * How search behaves:
	 * - "filter": hide non-matching rows (default)
	 * - "scroll": keep all rows visible, scroll to and highlight matches
	 */
	searchMode?: "filter" | "scroll";
};

const renderCell = (col: DataTableColumn) => {
	const cls = `data-table-td ${col.cellClass || ""}`;
	switch (col.render) {
		case "image":
			return html`<td class="${cls}">
				<img
					data-wp-bind--src="context.item.${col.key}"
					${col.altKey ? raw(`data-wp-bind--alt="context.item.${col.altKey}"`) : 'alt=""'}
					width="48"
					height="48"
				/>
			</td>`;
		default:
			return html`<td class="${cls}" data-wp-text="context.item.${col.key}"></td>`;
	}
};

const DataTable = ({
	columns,
	rows,
	selectable = false,
	className,
	caption,
	maxHeight,
	searchPlaceholder,
	watchCallback,
	sortColumn: initialSortColumn = null,
	sortDirection: initialSortDirection = "asc",
	searchMode = "filter",
}: DataTableProps) => {
	const context: DataTableContext = {
		columns,
		rows,
		sortColumn: initialSortColumn,
		sortDirection: initialSortDirection,
		searchTerm: "",
		searchMode,
		selectable,
		selectedId: null,
	};

	const selectableAttrs = selectable
		? `role="button" tabindex="0"
		   data-wp-on--click="actions.selectRow"
		   data-wp-on--keydown="actions.handleKeydown"
		   data-wp-class--data-table-row-selected="state.isRowSelected"`
		: "";

	const watchAttr = watchCallback ? `data-wp-watch="${watchCallback}"` : "";
	const scrollWatchAttr =
		searchMode === "scroll"
			? 'data-wp-watch--scroll="callbacks.scrollToSearchMatch"'
			: "";

	return html`
		<div
			data-wp-context='${JSON.stringify(context)}'
			class="data-table-wrapper ${className || ""}"
			${raw(watchAttr)}
			${raw(scrollWatchAttr)}
		>
			${
				searchPlaceholder
					? html`<input
							type="text"
							placeholder="${searchPlaceholder}"
							class="mb-4 w-full max-w-sm px-4 py-2 bg-fog text-paragraph font-body outline-none"
							data-wp-on--input="actions.updateSearchTerm"
						/>`
					: ""
			}
			<div
				class="data-table-scroll"
				role="region"
				aria-label="${caption || "Data table"}"
				tabindex="0"
				${maxHeight ? raw(`style="max-height: ${maxHeight}"`) : ""}
			>
				<table class="data-table">
					${caption ? html`<caption class="sr-only">${caption}</caption>` : ""}
					<thead>
						<tr>
							${columns.map((col) => {
								const sortableAttrs = col.sortable
									? `role="button" tabindex="0"
									   data-wp-on--click="actions.toggleSort"
									   data-wp-on--keydown="actions.handleKeydown"
									   data-wp-bind--aria-sort="state.ariaSortValue"
									   data-wp-class--data-table-th-sorted="state.isColumnSorted"`
									: "";
								return html`
									<th
										scope="col"
										class="data-table-th ${col.headerClass || ""}"
										data-wp-context='${JSON.stringify({ columnKey: col.key })}'
										${raw(sortableAttrs)}
									>
										<span>${col.label}</span>
										${
											col.sortable
												? html`<span class="data-table-sort-icon" data-wp-text="state.sortIcon"></span>`
												: ""
										}
									</th>
								`;
							})}
						</tr>
					</thead>
					<tbody>
						<template data-wp-each="state.visibleRows">
							<tr class="data-table-row" ${raw(selectableAttrs)} data-wp-class--data-table-row-highlighted="state.isRowHighlighted">
								${columns.map((col) => renderCell(col))}
							</tr>
						</template>
					</tbody>
					<!-- Empty state in a separate tbody so it is never
					     confused with data-wp-each generated rows -->
					<tbody>
						<tr
							class="data-table-empty-row"
							data-wp-bind--hidden="state.hasVisibleRows"
						>
							<td
								class="data-table-td data-table-empty-cell"
								colspan="${columns.length}"
							>
								No results found.
							</td>
						</tr>
					</tbody>
				</table>
			</div>
		</div>
	`;
};

export default DataTable;
