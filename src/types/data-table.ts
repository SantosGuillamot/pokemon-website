export type DataTableColumn = {
	/** Unique key matching a property on row objects. */
	key: string;
	/** Display label for the column header. */
	label: string;
	/** Whether this column is sortable. Defaults to false. */
	sortable?: boolean;
	/** Whether text search should match against this column. Defaults to false. */
	searchable?: boolean;
	/**
	 * How to render the cell value.
	 * - "text": display as plain text (default)
	 * - "image": render an <img> tag (value should be a URL string)
	 * - "action": render a button (e.g. delete) using `action` config below
	 * - "types": render two small type icons side-by-side (reads
	 *   `type1` / `type1Name` / `type2` / `type2Name` from the row)
	 */
	render?: "text" | "image" | "action" | "types";
	/** For image columns: row property key to use for alt text. Falls back to empty string if omitted. */
	altKey?: string;
	/** Optional CSS class(es) to add to all <td> elements in this column. */
	cellClass?: string;
	/** Optional CSS class(es) to add to the <th> element for this column. */
	headerClass?: string;
	/**
	 * For `render: "image"` only. When set, the `<img src>` is bound to
	 * `context.item[imageKey]` while sort and search keep using `key`.
	 * Required when the value rendered as an image is not meaningful to
	 * sort on (e.g. type icons keyed by numeric id in the URL).
	 */
	imageKey?: string;
	/** For `render: "image"` only. Pixel width/height override. Defaults to 48. */
	imageSize?: number;
	/**
	 * Action-cell config. Only read when `render === "action"`.
	 * `callback` is a fully-qualified store reference (e.g.
	 * "pokemon/team-builder::actions.deleteMetaPokemonWithConfirm") because
	 * the button is rendered inside the DataTable's own
	 * `data-wp-interactive="pokemon/data-table"` scope.
	 */
	action?: {
		/** HTML string for the button's inner content (inline SVG). */
		icon: string;
		/** aria-label for the button. */
		label: string;
		/** Fully-qualified store action reference. */
		callback: string;
	};
};

export type DataTableRow = Record<string, unknown> & {
	/**
	 * A unique identifier for the row.
	 * Used as a stable key for data-wp-each iteration (the Interactivity API
	 * defaults to using each item's `id` property) and for selection tracking.
	 * Required even when selection is disabled.
	 */
	id: string;
};

export type DataTableContext = {
	// -- Top-level table state (set on the wrapper div) --
	/** The column definitions (serialized into context by the server component). */
	columns: DataTableColumn[];
	/** The full row dataset. */
	rows: DataTableRow[];
	/** Current sort column key, or null for no sort. */
	sortColumn: string | null;
	/** Current sort direction. */
	sortDirection: "asc" | "desc";
	/** Text search filter. Empty string means no filter. */
	searchTerm: string;
	/**
	 * How search behaves:
	 * - "filter": hide non-matching rows (default)
	 * - "scroll": keep all rows visible, scroll to and highlight matches
	 */
	searchMode: "filter" | "scroll";
	/** Whether single-selection mode is enabled. */
	selectable: boolean;
	/** The id of the currently selected row, or null. */
	selectedId: string | null;

	// -- Per-element properties (set via nested data-wp-context or data-wp-each) --
	/** Column key, present when inside a <th> with data-wp-context='{ "columnKey": "..." }'. */
	columnKey?: string;
	/** Current iteration item, present when inside a data-wp-each template. */
	item?: DataTableRow;

	// -- Cross-store row source (optional) --
	/**
	 * Fully-qualified name of the Interactivity store that owns the row
	 * list (e.g. "pokemon/team-builder"). When both `rowsStore` and
	 * `rowsKey` are present, `state.visibleRows` sources its rows from
	 * `store(rowsStore).state[rowsKey]` instead of `rows`, and reactivity
	 * tracks the source store. Omitted for callers that serialize the
	 * full row list into `rows` (the fallback path).
	 */
	rowsStore?: string;
	/** Property name on the external store's `state` that holds the row list. */
	rowsKey?: string;
};
