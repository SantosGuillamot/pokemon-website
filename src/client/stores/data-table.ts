import type {
	DataTableContext,
	DataTableRow,
} from "@pokemon-website/types/data-table";
import { getContext, getElement, store } from "@wordpress/interactivity";

type DataTableStore = {
	state: {
		visibleRows: DataTableRow[];
		hasVisibleRows: boolean;
		ariaSortValue: string;
		isColumnSorted: boolean;
		sortIcon: string;
		isRowSelected: boolean;
		isRowHighlighted: boolean;
	};
};

store("pokemon/data-table", {
	state: {
		get visibleRows() {
			const ctx = getContext<DataTableContext>("pokemon/data-table");
			// When `rowsStore`/`rowsKey` are set on the context (see
			// `DataTable.ts`), source the rows reactively from a
			// page-level store. Reading `store(...).state[key]` inside a
			// getter registers a cross-store dependency, so mutations
			// to that state invalidate this getter and re-run the
			// `<template data-wp-each>`.
			const rawRows: DataTableRow[] =
				ctx.rowsStore && ctx.rowsKey
					? (((
							store(ctx.rowsStore) as {
								state: Record<string, unknown>;
							}
						).state[ctx.rowsKey] as DataTableRow[]) ?? [])
					: ctx.rows;
			let result = [...rawRows];

			// 1. Filter by searchTerm (only in filter mode)
			if (ctx.searchMode !== "scroll" && ctx.searchTerm.trim()) {
				const term = ctx.searchTerm.trim().toLowerCase();
				const searchableKeys = ctx.columns
					.filter((c) => c.searchable)
					.map((c) => c.key);
				result = result.filter((row) =>
					searchableKeys.some((key) => {
						const val = row[key];
						return val != null && String(val).toLowerCase().includes(term);
					}),
				);
			}

			// 2. Sort
			if (ctx.sortColumn) {
				const key = ctx.sortColumn;
				const dir = ctx.sortDirection === "asc" ? 1 : -1;
				result.sort((a, b) => {
					const aVal = a[key];
					const bVal = b[key];
					if (aVal == null && bVal == null) return 0;
					if (aVal == null) return 1;
					if (bVal == null) return -1;
					if (typeof aVal === "number" && typeof bVal === "number") {
						return (aVal - bVal) * dir;
					}
					return String(aVal).localeCompare(String(bVal)) * dir;
				});
			}

			return result;
		},

		get hasVisibleRows(): boolean {
			const { state } = store<DataTableStore>("pokemon/data-table");
			return state.visibleRows.length > 0;
		},

		// -- Per-header getters (read columnKey from merged context) --
		get ariaSortValue(): string {
			const ctx = getContext<DataTableContext>("pokemon/data-table");
			if (ctx.sortColumn !== ctx.columnKey) return "none";
			return ctx.sortDirection === "asc" ? "ascending" : "descending";
		},

		get isColumnSorted(): boolean {
			const ctx = getContext<DataTableContext>("pokemon/data-table");
			return ctx.sortColumn === ctx.columnKey;
		},

		get sortIcon(): string {
			const ctx = getContext<DataTableContext>("pokemon/data-table");
			if (ctx.sortColumn !== ctx.columnKey) return "\u2195"; // up-down arrow (unsorted)
			return ctx.sortDirection === "asc" ? "\u2191" : "\u2193"; // up or down arrow
		},

		// -- Per-row getters --
		get isRowSelected(): boolean {
			const ctx = getContext<DataTableContext>("pokemon/data-table");
			return ctx.selectable && ctx.selectedId === ctx.item?.id;
		},

		get isRowHighlighted(): boolean {
			const ctx = getContext<DataTableContext>("pokemon/data-table");
			if (ctx.searchMode !== "scroll" || !ctx.searchTerm.trim() || !ctx.item)
				return false;
			const term = ctx.searchTerm.trim().toLowerCase();
			const searchableKeys = ctx.columns
				.filter((c) => c.searchable)
				.map((c) => c.key);
			return searchableKeys.some((key) => {
				const val = ctx.item?.[key];
				return val != null && String(val).toLowerCase().includes(term);
			});
		},
	},

	actions: {
		toggleSort() {
			const ctx = getContext<DataTableContext>("pokemon/data-table");
			const key = ctx.columnKey;
			if (!key) return;
			if (ctx.sortColumn === key) {
				ctx.sortDirection = ctx.sortDirection === "asc" ? "desc" : "asc";
			} else {
				ctx.sortColumn = key;
				ctx.sortDirection = "asc";
			}
		},

		handleKeydown(event: KeyboardEvent) {
			if (event.key === "Enter" || event.key === " ") {
				event.preventDefault();
				const { ref } = getElement();
				if (ref) ref.click();
			}
		},

		selectRow() {
			const ctx = getContext<DataTableContext>("pokemon/data-table");
			if (!ctx.selectable || !ctx.item) return;
			ctx.selectedId = ctx.item.id;
		},

		updateSearchTerm() {
			const ctx = getContext<DataTableContext>("pokemon/data-table");
			const { ref } = getElement();
			ctx.searchTerm = (ref as HTMLInputElement).value;
		},
	},

	callbacks: {
		scrollToSearchMatch() {
			const ctx = getContext<DataTableContext>("pokemon/data-table");
			if (ctx.searchMode !== "scroll") return;

			const term = ctx.searchTerm.trim().toLowerCase();
			if (!term) return;

			const { state } = store<DataTableStore>("pokemon/data-table");
			const rows = state.visibleRows;
			const searchableKeys = ctx.columns
				.filter((c) => c.searchable)
				.map((c) => c.key);

			const matchIndex = rows.findIndex((row) =>
				searchableKeys.some((key) => {
					const val = row[key];
					return val != null && String(val).toLowerCase().includes(term);
				}),
			);

			if (matchIndex === -1) return;

			const { ref } = getElement();
			if (!ref) return;
			const tableRows = ref.querySelectorAll(
				"tbody:first-of-type .data-table-row",
			);
			const targetRow = tableRows[matchIndex];
			if (targetRow) {
				targetRow.scrollIntoView({ block: "center", behavior: "smooth" });
			}
		},
	},
});
