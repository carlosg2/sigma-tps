<script lang="ts" generics="TData">
	import type {
		Row,
		Table,
		ColumnPinningState,
		VisibilityState,
		ColumnSizingState
	} from '@tanstack/table-core';
	import type { SvelteSet } from 'svelte/reactivity';
	import type { HTMLAttributes } from 'svelte/elements';
	import type { CellPosition, RowHeightValue, Direction } from './types.js';
	import { getRowHeightValue } from './types.js';
	import {
		getColumnBorderVisibility,
		getColumnPinningStyle,
		toPinningStyleString
	} from './utils.js';
	import { cn, type WithElementRef } from '$lib/utils.js';
	import FlexRender from '$lib/components/ui/data-table/flex-render.svelte';
	import DataGridCell from './data-grid-cell.svelte';
	import ChevronRight from '@lucide/svelte/icons/chevron-right';
	import ChevronDown from '@lucide/svelte/icons/chevron-down';

	// Use 'any' for VirtualizerReturn to avoid type conflicts between different definitions
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	type VirtualizerReturn = any;

	interface Props extends WithElementRef<Omit<HTMLAttributes<HTMLDivElement>, 'dir'>, HTMLDivElement> {
		row: Row<TData>;
		table: Table<TData>;
		columnPinning: ColumnPinningState;
		columnVisibility: VisibilityState;
		columnSizing: ColumnSizingState;
		/** SvelteSet for fine-grained selection reactivity */
		selectedCellsSet: SvelteSet<string> | undefined;
		/** Version counter that increments when selection changes - triggers re-render */
		selectionVersion: number;
		rowVirtualizer: VirtualizerReturn;
		virtualRowIndex: number;
		virtualStart: number;
		rowMapRef: Map<number, HTMLDivElement>;
		rowHeight: RowHeightValue;
		focusedCell: CellPosition | null;
		dir: Direction;
		adjustLayout: boolean;
		stretchColumns: boolean;
		showSelectColumnBorder?: boolean;
		/** Whether this row is rendered as a sticky overlay (for group headers) */
		stickyOverlay?: boolean;
		/** Vertical offset for sticky overlay (used for push-out when next group approaches) */
		stickyOffsetY?: number;
	}

	let {
		row,
		table,
		columnPinning,
		columnVisibility,
		columnSizing,
		selectedCellsSet,
		selectionVersion,
		virtualRowIndex,
		virtualStart,
		rowVirtualizer,
		rowMapRef,
		rowHeight,
		focusedCell,
		dir,
		adjustLayout,
		stretchColumns,
		showSelectColumnBorder = true,
		stickyOverlay = false,
		stickyOffsetY = 0,
		class: className,
		style: styleProp,
		ref = $bindable(null),
		...restProps
	}: Props = $props();

	let rowRef = $state<HTMLDivElement | null>(null);

	function getRowElement() {
		return rowRef;
	}

	function setRowElement(element: HTMLDivElement | null) {
		rowRef = element;
		ref = element;
	}

	// Handle row ref changes - measure and track in rowMap.
	// Skipped for the sticky overlay clone: it shares a virtualRowIndex with the real
	// body row, so measuring/registering it would clobber the real row's rowMap entry.
	$effect(() => {
		if (stickyOverlay) return;
		if (rowRef) {
			rowVirtualizer.measureElement(rowRef);
			rowMapRef.set(virtualRowIndex, rowRef);
		}

		return () => {
			rowMapRef.delete(virtualRowIndex);
		};
	});

	const rowSelection = $derived(table.getState().rowSelection);
	const isRowSelected = $derived(rowSelection[row.id] ?? false);

	// Grouping: a row produced by the grouped row model that represents a group
	// header (rather than a leaf data row). These render an expand/collapse control,
	// the grouped value, a row count, and aggregated cells.
	const isGroupRow = $derived(row.getIsGrouped?.() ?? false);
	// Read `expanded` from table state so the chevron reliably re-renders when the
	// row is toggled. Reading `row.getIsExpanded()` alone is not tracked by Svelte.
	const expandedState = $derived(table.getState().expanded);
	const groupExpanded = $derived.by(() => {
		// touch expandedState so this recomputes on every expand/collapse
		void expandedState;
		return isGroupRow ? (row.getIsExpanded?.() ?? false) : false;
	});
	const groupColumn = $derived(isGroupRow ? table.getColumn(row.groupingColumnId ?? '') : undefined);
	const groupLabel = $derived(
		isGroupRow ? (groupColumn?.columnDef.meta?.label ?? row.groupingColumnId ?? '') : ''
	);
	const rowStyle = $derived.by(() => {
		const height = getRowHeightValue(rowHeight);
		if (stickyOverlay) {
			// Sticky overlay for group headers: the parent wrapper handles absolute
			// positioning, so this row just needs its height. Optional push-out offset
			// is applied via transform when the next group approaches.
			const offsetStyle = stickyOffsetY !== 0 ? `transform: translateY(${stickyOffsetY}px);` : '';
			return `height: ${height}px; ${offsetStyle}`.trim();
		}
		// Normal virtualized row
		const internalStyle = adjustLayout
			? `top: ${virtualStart}px; height: ${height}px; content-visibility: auto;`
			: `transform: translateY(${virtualStart}px); height: ${height}px; content-visibility: auto;`;
		return styleProp ? `${internalStyle} ${styleProp}` : internalStyle;
	});

	// Same column order as header — pinning-aware (left → center → right) so pinned
	// columns render at the edge immediately instead of only becoming sticky on scroll.
	const visibleCells = $derived.by(() => {
		const _pinning = columnPinning;
		const _visibility = columnVisibility;
		const isVisible = (id: string) => columnVisibility[id] !== false;
		const cellsById = new Map(row.getVisibleCells().map((c) => [c.column.id, c]));
		return [
			...table.getLeftLeafColumns(),
			...table.getCenterLeafColumns(),
			...table.getRightLeafColumns()
		]
			.filter((col) => isVisible(col.id))
			.map((col) => cellsById.get(col.id))
			.filter((cell): cell is NonNullable<typeof cell> => cell != null);
	});

	// Sticky pinning styles for each cell. Computed in a reactive map (rather than
	// inline {@const}) because the sticky left/right offsets depend on the sizes of
	// the other pinned columns — those offsets must recompute while resizing.
	const cellPinningStyles = $derived.by(() => {
		const _pinning = columnPinning;
		const _sizing = columnSizing;
		const _dir = dir;
		const map = new Map<string, string>();
		for (const cell of visibleCells) {
			map.set(
				cell.column.id,
				toPinningStyleString(getColumnPinningStyle({ column: cell.column, dir: _dir }))
			);
		}
		return map;
	});
</script>

	<div
		role="row"
		aria-rowindex={virtualRowIndex + 2}
		aria-selected={isRowSelected}
		data-index={virtualRowIndex}
		data-slot="grid-row"
		tabindex={-1}
		{...restProps}
		bind:this={getRowElement, setRowElement}
		{dir}
		class={cn(
			'flex w-full border-b [content-visibility:auto]',
			!stickyOverlay && 'absolute',
			!adjustLayout && 'will-change-transform',
			stickyOverlay && 'bg-background',
			className
		)}
		style={rowStyle}
	>
	{#each visibleCells as cell, colIndex (cell.id)}
		{@const isCellFocused =
			focusedCell?.rowIndex === virtualRowIndex && focusedCell?.columnId === cell.column.id}
		{@const nextCell = visibleCells[colIndex + 1]}
		{@const isLastColumn = colIndex === visibleCells.length - 1}
		{@const borderVisibility = getColumnBorderVisibility({
			column: cell.column,
			nextColumn: nextCell?.column,
			isLastColumn
		})}
		{@const pinningStyle = cellPinningStyles.get(cell.column.id) ?? ''}
		{@const isCustomRenderCell = typeof cell.column.columnDef.header === 'function'}

		<div
			role="gridcell"
			aria-colindex={colIndex + 1}
			data-highlighted={isCellFocused ? '' : undefined}
			data-slot="grid-cell"
			{dir}
			tabindex={-1}
			class={cn('shrink-0', {
				grow: stretchColumns && cell.column.id !== 'select',
				'border-e':
					borderVisibility.showEndBorder &&
					(showSelectColumnBorder || cell.column.id !== 'select'),
				'border-s': borderVisibility.showStartBorder && cell.column.id !== 'select'
			})}
			style="{pinningStyle}; width: calc(var(--col-{cell.column.id}-size) * 1px);"
		>
			{#if isGroupRow && cell.getIsGrouped()}
				<!-- Grouped cell: expand/collapse control + value + row count.
				     No depth-based indentation: with groupedColumnMode 'reorder' each
				     group level renders in its own (already shifted) column, so the
				     column position conveys nesting. Adding depth padding would double it. -->
				<div
					class={cn(
						'flex size-full items-center gap-1.5 px-2 py-1.5 font-medium',
						isRowSelected && 'bg-primary/10'
					)}
				>
						<button
							type="button"
							class="flex items-center gap-1.5 text-start hover:text-foreground"
							onclick={(e) => {
								e.stopPropagation();
								row.toggleExpanded();
							}}
							aria-expanded={groupExpanded}
							aria-label={groupExpanded ? 'Colapsar grupo' : 'Expandir grupo'}
						>
							{#if groupExpanded}
								<ChevronDown class="size-4 shrink-0 text-muted-foreground" />
							{:else}
								<ChevronRight class="size-4 shrink-0 text-muted-foreground" />
							{/if}
							<span class="truncate text-sm">
								<FlexRender
									content={cell.column.columnDef.cell}
									context={{ ...cell.getContext(), table }}
								/>
							</span>
						</button>
					<span class="text-xs text-muted-foreground tabular-nums">({row.subRows.length})</span>
				</div>
			{:else if isGroupRow && cell.getIsAggregated()}
				<!-- Aggregated cell within a group header row -->
				<div
					class={cn(
						'flex size-full items-center px-2 py-1.5 text-sm text-muted-foreground',
						isRowSelected && 'bg-primary/10'
					)}
				>
					<FlexRender
						content={cell.column.columnDef.aggregatedCell ?? cell.column.columnDef.cell}
						context={{ ...cell.getContext(), table }}
					/>
				</div>
			{:else if isGroupRow && cell.getIsPlaceholder()}
				<!-- Placeholder cell in a group header row: render nothing -->
				<div class={cn('size-full', isRowSelected && 'bg-primary/10')}></div>
			{:else if isCustomRenderCell}
				<div class={cn('size-full px-3 py-1.5', isRowSelected && 'bg-primary/10')}>
					<FlexRender
						content={cell.column.columnDef.cell}
						context={{ ...cell.getContext(), table }}
					/>
				</div>
			{:else}
				<DataGridCell {cell} {table} {selectedCellsSet} {selectionVersion} />
			{/if}
		</div>
	{/each}
</div>
