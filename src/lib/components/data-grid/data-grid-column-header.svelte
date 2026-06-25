<script lang="ts" generics="TData, TValue">
	import type {
		Header,
		Table,
		ColumnSort,
		SortDirection,
		SortingState
	} from '@tanstack/table-core';
	import { getColumnVariant } from './utils.js';
	import { cn } from '$lib/utils.js';
	import {
		DropdownMenu,
		DropdownMenuCheckboxItem,
		DropdownMenuContent,
		DropdownMenuItem,
		DropdownMenuSeparator,
		DropdownMenuTrigger
	} from '$lib/components/ui/dropdown-menu/index.js';
	import { Tooltip, TooltipContent, TooltipTrigger } from '$lib/components/ui/tooltip/index.js';
	import type { ComponentProps } from 'svelte';

	// Icons
	import ChevronDown from '@lucide/svelte/icons/chevron-down';
	import ChevronUp from '@lucide/svelte/icons/chevron-up';
	import EyeOff from '@lucide/svelte/icons/eye-off';
	import Pin from '@lucide/svelte/icons/pin';
	import PinOff from '@lucide/svelte/icons/pin-off';
	import X from '@lucide/svelte/icons/x';
	import Group from '@lucide/svelte/icons/group';
	import Ungroup from '@lucide/svelte/icons/ungroup';

	interface Props extends ComponentProps<typeof DropdownMenuTrigger> {
		header: Header<TData, TValue>;
		table: Table<TData>;
	}

	let {
		header,
		table,
		class: className,
		onpointerdown: onPointerDownProp,
		...triggerProps
	}: Props = $props();

	const column = $derived(header.column);
	const label = $derived.by(() => {
		if (column.columnDef.meta?.label) {
			return column.columnDef.meta.label;
		}
		if (typeof column.columnDef.header === 'string') {
			return column.columnDef.header;
		}
		return column.id;
	});

	const isAnyColumnResizing = $derived(
		table.getState().columnSizingInfo?.isResizingColumn ?? false
	);

	const cellVariant = $derived(column.columnDef.meta?.cell);
	const columnVariant = $derived.by(() => getColumnVariant(cellVariant?.variant));

	// Get pinning state reactively from table state
	const columnPinning = $derived(table.getState().columnPinning);
	const pinnedPosition = $derived.by(() => {
		// Read columnPinning to create dependency, then call column method
		const _ = columnPinning;
		return column.getIsPinned();
	});
	const isPinnedLeft = $derived(pinnedPosition === 'left');
	const isPinnedRight = $derived(pinnedPosition === 'right');

	// Grouping state (reactive via table.getState().grouping). Only surface the
	// quick action when grouping is actually enabled on this grid.
	const groupingEnabled = $derived(table.options.enableGrouping === true);
	const grouping = $derived(table.getState().grouping ?? []);
	const isColumnGrouped = $derived(grouping.includes(column.id));

	// Safe getter for column size that handles SSR edge cases
	const columnSize = $derived.by(() => {
		try {
			return column.getSize();
		} catch {
			return column.columnDef.size ?? 150;
		}
	});

	// Safe getter for resizing state that handles SSR edge cases.
	// Read from the reactive table.getState() (not header.column.getIsResizing(),
	// which reads the core table directly and is NOT reactive) so the resizer
	// returns to its idle style once the drag ends.
	const isColumnResizing = $derived.by(() => {
		try {
			return (table.getState().columnSizingInfo?.isResizingColumn ?? false) === column.id;
		} catch {
			return false;
		}
	});

	// Safe getter for canResize that handles SSR edge cases
	const canResize = $derived.by(() => {
		try {
			return header.column.getCanResize();
		} catch {
			return false;
		}
	});

	function onSortingChange(direction: SortDirection) {
		table.setSorting((prev: SortingState) => {
			const existingSortIndex = prev.findIndex((sort) => sort.id === column.id);
			const newSort: ColumnSort = {
				id: column.id,
				desc: direction === 'desc'
			};

			if (existingSortIndex >= 0) {
				const updated = [...prev];
				updated[existingSortIndex] = newSort;
				return updated;
			} else {
				return [...prev, newSort];
			}
		});
	}

	function onSortRemove() {
		table.setSorting((prev: SortingState) => prev.filter((sort) => sort.id !== column.id));
	}

	function onLeftPin() {
		column.pin('left');
	}

	function onRightPin() {
		column.pin('right');
	}

	function onUnpin() {
		column.pin(false);
	}

	function onTriggerPointerDown(event: Parameters<NonNullable<Props['onpointerdown']>>[0]) {
		onPointerDownProp?.(event);
		if (event.defaultPrevented) return;

		if (event.button !== 0) {
			return;
		}
		table.options.meta?.onColumnClick?.(column.id);
	}

	// Resizer
	const defaultColumnDef = $derived(table._getDefaultColumnDef());

	function onResizerDoubleClick() {
		header.column.resetSize();
	}
</script>

<DropdownMenu>
	<DropdownMenuTrigger
		class={cn(
			'flex size-full items-center justify-between gap-2 p-2 text-sm hover:bg-accent/40 data-[state=open]:bg-accent/40 [&_svg]:size-4',
			isAnyColumnResizing && 'pointer-events-none',
			className
		)}
		onpointerdown={onTriggerPointerDown}
		{...triggerProps}
	>
		<!-- Left side: icon + label -->
		<div class="flex min-w-0 flex-1 items-center gap-1.5">
			{#if columnVariant}
				{@const Icon = columnVariant.icon}
				<Tooltip delayDuration={100}>
					<TooltipTrigger>
						{#snippet child({ props })}
							<Icon {...props} class="size-3.5 shrink-0 text-muted-foreground" />
						{/snippet}
					</TooltipTrigger>
					<TooltipContent side="top">
						<p>{columnVariant.label}</p>
					</TooltipContent>
				</Tooltip>
			{/if}
			<span class="truncate">{label}</span>
		</div>
		<!-- Right side: chevron -->
		<ChevronDown class="shrink-0 text-muted-foreground" />
	</DropdownMenuTrigger>
	<DropdownMenuContent align="start" sideOffset={0} preventScroll={false} class="w-60">
		{#if column.getCanSort()}
			<DropdownMenuCheckboxItem
				class="relative ltr:pr-8 ltr:pl-2 rtl:pr-2 rtl:pl-8 [&>span:first-child]:ltr:right-2 [&>span:first-child]:ltr:left-auto [&>span:first-child]:rtl:right-auto [&>span:first-child]:rtl:left-2 [&_svg]:text-muted-foreground"
				checked={column.getIsSorted() === 'asc'}
				onCheckedChange={() => onSortingChange('asc')}
			>
				<ChevronUp />
				Orden asc
			</DropdownMenuCheckboxItem>
			<DropdownMenuCheckboxItem
				class="relative ltr:pr-8 ltr:pl-2 rtl:pr-2 rtl:pl-8 [&>span:first-child]:ltr:right-2 [&>span:first-child]:ltr:left-auto [&>span:first-child]:rtl:right-auto [&>span:first-child]:rtl:left-2 [&_svg]:text-muted-foreground"
				checked={column.getIsSorted() === 'desc'}
				onCheckedChange={() => onSortingChange('desc')}
			>
				<ChevronDown />
				Orden desc
			</DropdownMenuCheckboxItem>
			{#if column.getIsSorted()}
				<DropdownMenuItem onclick={onSortRemove}>
					<X />
					Quitar orden
				</DropdownMenuItem>
			{/if}
		{/if}
		{#if column.getCanPin()}
			{#if column.getCanSort()}
				<DropdownMenuSeparator />
			{/if}

			{#if isPinnedLeft}
				<DropdownMenuItem class="[&_svg]:text-muted-foreground" onclick={onUnpin}>
					<PinOff />
					Desfijar de izquierda
				</DropdownMenuItem>
			{:else}
				<DropdownMenuItem class="[&_svg]:text-muted-foreground" onclick={onLeftPin}>
					<Pin />
					Fijar a izquierda
				</DropdownMenuItem>
			{/if}
			{#if isPinnedRight}
				<DropdownMenuItem class="[&_svg]:text-muted-foreground" onclick={onUnpin}>
					<PinOff />
					Desfijar de derecha
				</DropdownMenuItem>
			{:else}
				<DropdownMenuItem class="[&_svg]:text-muted-foreground" onclick={onRightPin}>
					<Pin />
					Fijar a derecha
				</DropdownMenuItem>
			{/if}
		{/if}
		{#if groupingEnabled && column.getCanGroup()}
			<DropdownMenuSeparator />
			{#if isColumnGrouped}
				<DropdownMenuItem
					class="[&_svg]:text-muted-foreground"
					onclick={() => column.toggleGrouping()}
				>
					<Ungroup />
					Quitar agrupación
				</DropdownMenuItem>
			{:else}
				<DropdownMenuItem
					class="[&_svg]:text-muted-foreground"
					onclick={() => column.toggleGrouping()}
				>
					<Group />
					Agrupar por esta columna
				</DropdownMenuItem>
			{/if}
		{/if}
		{#if column.getCanHide()}
			<DropdownMenuSeparator />
			<DropdownMenuItem class="[&_svg]:text-muted-foreground" onclick={() => column.toggleVisibility(false)}>
				<EyeOff />
				Ocultar columna
			</DropdownMenuItem>
		{/if}
	</DropdownMenuContent>
</DropdownMenu>

{#if canResize}
	<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
	<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
	<div
		role="separator"
		aria-orientation="vertical"
		aria-label={`Redimensionar columna ${label}`}
		aria-valuenow={columnSize}
		aria-valuemin={defaultColumnDef.minSize}
		aria-valuemax={defaultColumnDef.maxSize}
		tabindex={0}
		class={cn(
			"absolute -inset-e-px top-0 z-50 h-full w-0.5 cursor-ew-resize touch-none select-none bg-border transition-opacity after:absolute after:inset-y-0 after:inset-s-1/2 after:h-full after:w-4.5 after:-translate-x-1/2 after:content-[''] hover:bg-primary focus:bg-primary focus:outline-none",
			isColumnResizing ? 'bg-primary' : 'opacity-0 hover:opacity-100'
		)}
		ondblclick={onResizerDoubleClick}
		onmousedown={header.getResizeHandler()}
		ontouchstart={header.getResizeHandler()}
	></div>
{/if}
