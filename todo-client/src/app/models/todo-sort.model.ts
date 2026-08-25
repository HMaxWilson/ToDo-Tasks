/**
 * Sort options offered in the UI.
 *
 * `value` is an OData $orderby expression sent straight to the API, so the
 * ordering is decided server-side rather than in the browser.
 */
export interface TodoSortOption {
    label: string;
    value: string;
}

export const TODO_SORT_OPTIONS: readonly TodoSortOption[] = [
    // The manual ordering. Ties break on id so records created before
    // displayOrder existed still come back in creation order.
    { label: 'Default', value: 'displayOrder asc,id asc' },
    { label: 'Newest first', value: 'createdAt desc' },
    { label: 'Oldest first', value: 'createdAt asc' },
    { label: 'Title (A–Z)', value: 'title asc' },
    { label: 'Title (Z–A)', value: 'title desc' },
    // OData accepts a comma-separated list, applied in order.
    { label: 'Incomplete first', value: 'isComplete asc,createdAt desc' },
];

export const DEFAULT_TODO_SORT = TODO_SORT_OPTIONS[0].value;

/** Drag-and-drop is only meaningful while this sort is active. */
export const MANUAL_SORT = DEFAULT_TODO_SORT;
