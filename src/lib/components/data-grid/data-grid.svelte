<script lang="ts" generics="TData">
	import { browser } from '$app/environment';
	import type { Column, Header, Table, RowSelectionState } from '@tanstack/table-core';
	import type { UseDataGridReturn } from './use-data-grid.svelte.js';
	import type {
		RowHeightValue,
		CellPosition,
		SearchState,
		Direction
	} from './types.js';
	import type { HTMLAttributes } from 'svelte/elements';
	import {
		getColumnBorderVisibility,
		getColumnPinningStyle,
		toPinningStyleString
	} from './utils.js';
	import { cn, type WithElementRef } from '$lib/utils.js';
	import FlexRender from '$lib/components/ui/data-table/flex-render.svelte';
	import DataGridRow from './data-grid-row.svelte';
	import DataGridColumnHeader from './data-grid-column-header.svelte';
	import DataGridSearch from './data-grid-search.svelte';
	import DataGridContextMenu from './data-grid-context-menu.svelte';
	import DataGridPasteDialog from './data-grid-paste-dialog.svelte';
	import { TooltipProvider } from '$lib/components/ui/tooltip/index.js';
	import { DEFAULT_ROW_HEIGHT } from './config.js';
	import { getRowHeightValue } from './types.js';
	import Plus from '@lucide/svelte/icons/plus';
	import { setContext } from 'svelte';
	import { GRID_DIR_CONTEXT_KEY, type GridDirGetter } from './grid-dir-context.js';

	interface Props
		extends Omit<UseDataGridReturn<TData>, 'dir'>,
			WithElementRef<Omit<HTMLAttributes<HTMLDivElement>, 'dir'>, HTMLDivElement> {
		height?: number;
		dir?: Direction;
		stretchColumns?: boolean;
		/**
		 * Whether the `select` column draws an end (trailing) border like the other
		 * columns. Defaults to `true`. Kept as an internal option so it can be exposed
		 * publicly later.
		 */
		showSelectColumnBorder?: boolean;
	}

	let {
		dataGridRef = $bindable(null),
		headerRef = $bindable(null),
		rowMapRef,
		footerRef = $bindable(null),
		table,
		rowVirtualizer,
		selectedCellsSet,
		selectionState,
		getSelectionVersion,
		getRowSelection,
		height = 600,
		searchState,
		columnSizeVars: _, // We compute this ourselves for reactivity
		enableGrouping: _enableGrouping,
		editableWhenGrouped: _editableWhenGrouped,
		grouping: _grouping,
		isGrouped: _isGrouped,
		onRowAdd,
		setDataGridRef,
		setHeaderRef,
		setFooterRef,
		adjustLayout,
		dir = 'ltr',
		stretchColumns = false,
		showSelectColumnBorder = true,
		class: className,
		ref = $bindable(null),
		...restProps
	}: Props = $props();

	// Provide row selection getter via context for header checkbox reactivity
	setContext<() => RowSelectionState>('getRowSelection', () => getRowSelection());
	setContext<GridDirGetter>(GRID_DIR_CONTEXT_KEY, () => dir);

	// Selection version - read from the reactive getter in selectionState
	const selectionVersion = $derived(selectionState?.version ?? 0);

	// Visibility key for {#key} block - forces re-render when visibility changes
	// This is computed locally from table state
	const visibilityKey = $derived.by(() => {
		const visibility = table.getState().columnVisibility;
		return Object.entries(visibility)
			.filter(([_, visible]) => visible === false)
			.map(([id]) => id)
			.sort()
			.join(',');
	});

	function getDataGridElement() {
		return dataGridRef;
	}

	function setDataGridElement(element: HTMLDivElement | null) {
		dataGridRef = element;
		setDataGridRef?.(element);
	}

	function getHeaderElement() {
		return headerRef;
	}

	function setHeaderElement(element: HTMLDivElement | null) {
		headerRef = element;
		setHeaderRef?.(element);
	}

	function getFooterElement() {
		return footerRef;
	}

	function setFooterElement(element: HTMLDivElement | null) {
		footerRef = element;
		setFooterRef?.(element);
	}

	// Reset horizontal scroll when direction changes (RTL scrollLeft can stick negative in LTR).
	let prevDir: Direction | undefined;
	$effect(() => {
		const grid = dataGridRef;
		if (!grid) {
			prevDir = dir;
			return;
		}
		if (prevDir === undefined || dir === prevDir) {
			prevDir = dir;
			return;
		}
		prevDir = dir;
		grid.scrollLeft = 0;
	});

	const rows = $derived(table.getRowModel().rows);
	const columns = $derived(table.getAllColumns());

	const meta = $derived(table.options.meta);
	const readOnly = $derived(meta?.readOnly ?? false);
	const rowHeight = $derived<RowHeightValue>(meta?.rowHeight ?? DEFAULT_ROW_HEIGHT);
	const focusedCell = $derived<CellPosition | null>(meta?.focusedCell ?? null);
	// selectedCellsSet and selectionVersion are now received as props from hook return

	// Get table state reactively for pinning/visibility/sizing
	const tableState = $derived(table.getState());
	const columnPinning = $derived(tableState.columnPinning);
	const columnVisibility = $derived(tableState.columnVisibility);
	const columnSizing = $derived(tableState.columnSizing);
	const columnSizingInfo = $derived(tableState.columnSizingInfo);

	// Get visible headers reactively
	const visibleLeafColumns = $derived(table.getVisibleLeafColumns());

	// Compute total visible width (only visible columns)
	const totalVisibleWidth = $derived.by(() => {
		// Read column sizing to create reactive dependency
		const _ = columnSizing;
		const __ = columnSizingInfo;
		const ___ = columnVisibility;

		let total = 0;
		for (const col of visibleLeafColumns) {
			total += col.getSize();
		}
		return total;
	});

	// Leaf column order (pinning-aware) — keep header/body columns aligned.
	// TanStack's getVisibleLeafColumns() does NOT reorder pinned columns; it keeps
	// definition order. To make pinned columns jump to the left/right edge (instead
	// of only becoming sticky once scrolled into view), we render left → center →
	// right, mirroring how getVisibleCells() orders cells in the body.
	const orderedVisibleColumns = $derived.by(() => {
		const _ = columnVisibility;
		const __ = columnPinning;
		const isVisible = (col: Column<TData, unknown>) => columnVisibility[col.id] !== false;
		return [
			...table.getLeftLeafColumns(),
			...table.getCenterLeafColumns(),
			...table.getRightLeafColumns()
		].filter(isVisible);
	});

	// Header cell pinning styles computed reactively.
	// {#each} with keyed items won't re-evaluate {@const} when column objects are the
	// same references (TanStack reuses them), so we compute styles in a $derived map
	// that explicitly depends on columnPinning and dir.
	const headerCellPinningStyles = $derived.by(() => {
		const _cp = columnPinning;
		const _dir = dir;
		// Sticky left/right offsets depend on the sizes of the other pinned columns,
		// so this must recompute while a column is being resized.
		const _cs = columnSizing;
		const _csi = columnSizingInfo;
		const map = new Map<string, string>();
		for (const col of orderedVisibleColumns) {
			map.set(col.id, toPinningStyleString(getColumnPinningStyle({ column: col, dir: _dir })));
		}
		return map;
	});

	const headerByColumnId = $derived.by(() => {
		const map = new Map<string, Header<TData, unknown>>();
		for (const header of table.getFlatHeaders()) {
			map.set(header.column.id, header);
		}
		return map;
	});

	// Whether any visible column defines a footer (totals row).
	const hasFooter = $derived.by(() => {
		const _ = columnVisibility;
		return orderedVisibleColumns.some((col) => col.columnDef.footer != null);
	});

	function onGridContextMenu(event: MouseEvent) {
		event.preventDefault();
	}

	function onAddRowKeyDown(event: KeyboardEvent) {
		if (!onRowAdd) return;

		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			onRowAdd();
		}
	}

	// Handle mouseup anywhere to end drag selection
	function handleGridMouseUp() {
		meta?.onCellMouseUp?.();
	}

	// Compute column size CSS variables reactively from table state
	// We read both columnSizing and columnSizingInfo to create reactive dependencies
	// columnSizingInfo updates during resize drag, columnSizing updates on release
	const columnSizeStyle = $derived.by(() => {
		// Read both states to ensure reactivity when columns are resized
		const _ = columnSizing;
		const __ = columnSizingInfo;

		const vars: string[] = [];
		try {
			const headers = table.getFlatHeaders();
			for (const header of headers) {
				const size = header.getSize();
				vars.push(`--header-${header.id}-size: ${size}`);
				vars.push(`--col-${header.column.id}-size: ${size}`);
			}
		} catch {
			// Table not ready yet
		}
		return vars.join('; ');
	});

	// Get virtual items - use getters for reactive access
	const virtualItems = $derived(rowVirtualizer?.virtualItems ?? []);
	const totalSize = $derived(rowVirtualizer.totalSize);

	// Sticky group row tracking: grid scroll position and currently visible group
	let gridScrollTop = $state(0);
	// Measured header height so the sticky overlay aligns flush below the header
	let headerHeight = $state(41);

	$effect(() => {
		// Re-measure header height whenever the header element is available
		if (headerRef) {
			headerHeight = headerRef.offsetHeight;
		}
	});
	
	const stickyGroupData = $derived.by(() => {
		// Only compute on the client - virtualItems is not available during SSR
		if (!browser) {
			return null;
		}
		
		// Only compute if grouping is active and virtualizer is initialized
		const grouping = table.getState().grouping;
		// Explicitly touch gridScrollTop to create reactive dependency
		const _scroll = gridScrollTop;
		
		// Guard against undefined virtualItems or rows during initialization
		if (!virtualItems || !rows || !grouping || grouping.length === 0 || virtualItems.length === 0) {
			return null;
		}
		
		// The virtualItems array includes overscan rows rendered ABOVE the visible
		// viewport for smooth scrolling. Using virtualItems[0].index would lag, because
		// that row is still above the top edge. Instead, find the row actually pinned at
		// the top of the visible area using the current scroll offset.
		// Note: vItem.start is relative to the body, which already sits below the sticky
		// header in normal flow, so the header offset cancels out and the threshold is
		// simply gridScrollTop: the first row whose bottom edge passes the scroll top.
		let activeGroup = null;
		let topVisibleIndex = -1;

		for (const vItem of virtualItems) {
			if (vItem.start + vItem.size > gridScrollTop) {
				if (topVisibleIndex === -1 || vItem.index < topVisibleIndex) {
					topVisibleIndex = vItem.index;
				}
			}
		}

		// Fallback: if nothing matched, use the smallest rendered index
		if (topVisibleIndex === -1) {
			for (const vItem of virtualItems) {
				if (topVisibleIndex === -1 || vItem.index < topVisibleIndex) {
					topVisibleIndex = vItem.index;
				}
			}
		}

		// Search backwards from the top visible row to find the group it belongs to
		if (topVisibleIndex >= 0) {
			for (let i = topVisibleIndex; i >= 0; i--) {
				const row = rows[i];
				if (!row) continue;
				
				const isGroup = row.getIsGrouped?.() ?? false;
				if (isGroup) {
					activeGroup = { row, rowIndex: i };
					break;
				}
			}
		}
		
		if (!activeGroup) {
			return null;
		}
		
		// TODO: Calculate push-out offset when we have access to the next group's position
		// For now, push-out is disabled (stickyOffsetY = 0)
		const stickyOffsetY = 0;
		
		return { activeGroup, stickyOffsetY };
	});
	
	function handleGridScroll(event: Event) {
		const target = event.currentTarget as HTMLDivElement;
		gridScrollTop = target.scrollTop;
	}

	// Handler for global mouseup - ends drag selection even when mouse leaves grid
	function handleWindowMouseUp() {
		meta?.onCellMouseUp?.();
	}
</script>

<svelte:window onmouseup={handleWindowMouseUp} />

<TooltipProvider>
	<div
		bind:this={ref}
		data-slot="grid-wrapper"
		{dir}
		class={cn('relative flex w-full min-w-0 max-w-full flex-col', className)}
		{...restProps}
	>
		{#if searchState}
			<DataGridSearch
				searchOpen={searchState.searchOpen}
				searchQuery={searchState.searchQuery}
				searchMatches={searchState.searchMatches}
				matchIndex={searchState.matchIndex}
				onSearchOpenChange={searchState.onSearchOpenChange}
				onSearchQueryChange={searchState.onSearchQueryChange}
				onSearch={searchState.onSearch}
				onNavigateToNextMatch={searchState.onNavigateToNextMatch}
				onNavigateToPrevMatch={searchState.onNavigateToPrevMatch}
			/>
		{/if}

		<DataGridContextMenu {table} />

		<DataGridPasteDialog {table} />

		<div
			data-slot="grid-shell"
			class="flex w-full min-w-0 max-w-full flex-col overflow-hidden rounded-md border bg-background relative"
			style="max-height: {height}px;"
		>
			<div
				role="grid"
				aria-label="Tabla de datos"
				aria-rowcount={rows.length + (onRowAdd ? 1 : 0)}
				aria-colcount={columns.length}
				data-slot="grid"
				{dir}
				tabindex={0}
				bind:this={getDataGridElement, setDataGridElement}
				class={cn(
					'relative min-h-0 w-full min-w-0 flex-1 select-none overflow-auto focus:outline-none',
					'**:data-[slot=grid-cell-content]:text-start',
					'ltr:**:data-[slot=grid-cell-content]:text-left',
					'rtl:**:data-[slot=grid-cell-content]:text-right',
					'ltr:**:data-[slot=grid-header-cell]:text-left',
					'rtl:**:data-[slot=grid-header-cell]:text-right',
					'ltr:[&_input]:text-left',
					'rtl:[&_input]:text-right'
				)}
				style={columnSizeStyle}
				oncontextmenu={onGridContextMenu}
				onmouseup={handleGridMouseUp}
				onscroll={handleGridScroll}
			>
				<!-- Header -->
				<div
					role="rowgroup"
					data-slot="grid-header"
					bind:this={getHeaderElement, setHeaderElement}
					class="sticky top-0 z-10 grid border-b bg-background"
					style="min-width: {totalVisibleWidth}px;"
				>
					{#each table.getHeaderGroups() as headerGroup, rowIndex (headerGroup.id)}
						<div
							role="row"
							aria-rowindex={rowIndex + 1}
							data-slot="grid-header-row"
							tabindex={-1}
							class="flex w-full"
							style="min-width: {totalVisibleWidth}px;"
						>
							{#each orderedVisibleColumns as column, colIndex (column.id)}
								{@const header = headerByColumnId.get(column.id)}
								{#if header}
									{@const sorting = tableState.sorting}
									{@const currentSort = sorting.find((sort) => sort.id === column.id)}
								{@const isSortable = column.getCanSort()}
								{@const nextColumn = orderedVisibleColumns[colIndex + 1]}
								{@const isLastColumn = colIndex === orderedVisibleColumns.length - 1}
								{@const borderVisibility = getColumnBorderVisibility({
										column,
										nextColumn,
										isLastColumn
									})}

									<div
										role="columnheader"
										aria-colindex={colIndex + 1}
										aria-sort={currentSort?.desc === false
											? 'ascending'
											: currentSort?.desc === true
												? 'descending'
												: isSortable
													? 'none'
													: undefined}
										data-slot="grid-header-cell"
										tabindex={-1}
										class={cn('group relative shrink-0', {
											grow: stretchColumns && column.id !== 'select',
											'border-e':
												borderVisibility.showEndBorder &&
												(showSelectColumnBorder || column.id !== 'select'),
											'border-s': borderVisibility.showStartBorder && column.id !== 'select'
										})}
										style="{headerCellPinningStyles.get(column.id) ?? ''}; width: calc(var(--header-{header.id}-size) * 1px);"
									>
										{#if header.isPlaceholder}
											<!-- Empty -->
										{:else if typeof column.columnDef.header === 'function'}
											<div class="size-full px-3 py-1.5">
												<FlexRender
													content={column.columnDef.header}
													context={header.getContext()}
												/>
											</div>
										{:else}
											<DataGridColumnHeader {header} {table} />
										{/if}
									</div>
								{/if}
							{/each}
						</div>
						{/each}
					</div>

					<!-- Sticky group overlay layer: lives inside role="grid" so it inherits the
					     column-size CSS variables and scrolls horizontally with the columns.
					     Uses a zero-height `position: sticky` wrapper pinned below the header so the
					     browser keeps it in sync with native scroll on the compositor thread (no JS
					     reposition per frame -> no jitter / lag). The wrapper has height 0 so it does
					     not push the body content. Width 100% ensures it participates in the grid's
					     horizontal layout flow. -->
					{#if stickyGroupData}
						<div
							data-slot="grid-sticky-group-anchor"
							class="sticky z-[9] h-0 w-full"
							style="top: {headerHeight}px;"
						>
							<div
								role="rowgroup"
								data-slot="grid-sticky-group"
								class="absolute left-0 top-0 grid"
								style="min-width: {totalVisibleWidth}px;"
							>
								<DataGridRow
									row={stickyGroupData.activeGroup.row}
									{table}
									{columnPinning}
									{columnVisibility}
									{columnSizing}
									{selectedCellsSet}
									{selectionVersion}
									{rowMapRef}
									virtualRowIndex={stickyGroupData.activeGroup.rowIndex}
									{rowVirtualizer}
									{rowHeight}
									{focusedCell}
									{dir}
									{adjustLayout}
									{stretchColumns}
									{showSelectColumnBorder}
									virtualStart={0}
									stickyOverlay={true}
									stickyOffsetY={stickyGroupData.stickyOffsetY}
								/>
							</div>
						</div>
					{/if}

					<!-- Body -->
				<div
					role="rowgroup"
					data-slot="grid-body"
					class="relative grid"
					style="height: {totalSize}px; min-width: {totalVisibleWidth}px; contain: {adjustLayout
						? 'layout paint'
						: 'strict'};"
				>
					{#key visibilityKey}
						{#each virtualItems as virtualItem (virtualItem.key)}
							{@const virtualRowIndex = virtualItem.index}
							{@const row = rows[virtualRowIndex]}
							{#if row}
								<DataGridRow
									{row}
									{table}
									{columnPinning}
									{columnVisibility}
									{columnSizing}
									{selectedCellsSet}
									{selectionVersion}
									{rowMapRef}
									{virtualRowIndex}
									{rowVirtualizer}
									{rowHeight}
									{focusedCell}
									{dir}
									{adjustLayout}
									{stretchColumns}
									{showSelectColumnBorder}
									virtualStart={virtualItem.start}
								/>
							{/if}
						{/each}
					{/key}
				</div>

				<!-- Footer with column totals (sticky at bottom, aligned with columns like header) -->
				{#if hasFooter}
					<div
						role="rowgroup"
						data-slot="grid-footer"
						bind:this={getFooterElement, setFooterElement}
						class="sticky bottom-0 z-10 grid border-t bg-background"
						style="min-width: {totalVisibleWidth}px;"
					>
						<div
							role="row"
							aria-rowindex={rows.length + 2}
							data-slot="grid-footer-row"
							tabindex={-1}
							class="flex w-full"
							style="min-width: {totalVisibleWidth}px;"
						>
							{#each orderedVisibleColumns as column, colIndex (column.id)}
								{@const header = headerByColumnId.get(column.id)}
								{#if header}
									{@const nextColumn = orderedVisibleColumns[colIndex + 1]}
									{@const isLastColumn = colIndex === orderedVisibleColumns.length - 1}
									{@const borderVisibility = getColumnBorderVisibility({
										column,
										nextColumn,
										isLastColumn
									})}

									<div
										role="gridcell"
										aria-colindex={colIndex + 1}
										data-slot="grid-footer-cell"
										tabindex={-1}
										class={cn('relative flex shrink-0 items-center text-sm font-medium', {
											grow: stretchColumns && column.id !== 'select',
											'border-e':
												borderVisibility.showEndBorder &&
												(showSelectColumnBorder || column.id !== 'select'),
											'border-s': borderVisibility.showStartBorder && column.id !== 'select'
										})}
										style="{headerCellPinningStyles.get(column.id) ?? ''}; width: calc(var(--header-{header.id}-size) * 1px);"
									>
										{#if column.columnDef.footer}
											<div class="size-full px-3 py-1.5">
												<FlexRender
													content={column.columnDef.footer}
													context={header.getContext()}
												/>
											</div>
										{/if}
									</div>
								{/if}
							{/each}
						</div>
					</div>
				{/if}
			</div>

			<!-- Add row (outside scroll area, always full-width, never scrolls horizontally) -->
			{#if !readOnly && onRowAdd}
				<div
					role="row"
					aria-rowindex={rows.length + (hasFooter ? 3 : 2)}
					data-slot="grid-add-row"
					tabindex={0}
					class="flex h-9 w-full items-center gap-2 border-t bg-muted/30 px-3 text-muted-foreground transition-colors hover:bg-muted/50 focus:bg-muted/50 focus:outline-none"
					onclick={(event) => void onRowAdd?.(event)}
					onkeydown={onAddRowKeyDown}
				>
					<Plus class="size-3.5" />
					<span class="text-sm">Agregar fila</span>
				</div>
			{/if}
		</div>
	</div>
</TooltipProvider>
