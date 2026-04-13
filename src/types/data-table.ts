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
	 */
	render?: "text" | "image";
	/** For image columns: row property key to use for alt text. Falls back to empty string if omitted. */
	altKey?: string;
	/** Optional CSS class(es) to add to all <td> elements in this column. */
	cellClass?: string;
	/** Optional CSS class(es) to add to the <th> element for this column. */
	headerClass?: string;
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
};
