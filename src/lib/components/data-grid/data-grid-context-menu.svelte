<script lang="ts" generics="TData">
	import type { Table } from '@tanstack/table-core';
	import type { UpdateCell } from './types.js';
	import { parseCellKey } from './types.js';
	import {
		DropdownMenu,
		DropdownMenuContent,
		DropdownMenuItem,
		DropdownMenuSeparator,
		DropdownMenuTrigger
	} from '$lib/components/ui/dropdown-menu/index.js';
	import Copy from '@lucide/svelte/icons/copy';
	import Scissors from '@lucide/svelte/icons/scissors';
	import Eraser from '@lucide/svelte/icons/eraser';
	import Trash2 from '@lucide/svelte/icons/trash-2';
	import { toast } from 'svelte-sonner';

	interface Props {
		table: Table<TData>;
	}

	let { table }: Props = $props();

	const meta = $derived(table.options.meta);
	const contextMenu = $derived(meta?.contextMenu);
	const onContextMenuOpenChange = $derived(meta?.onContextMenuOpenChange);
	const selectionState = $derived(meta?.selectionState);
	const dataGridRef = $derived(meta?.dataGridRef);
	const onDataUpdate = $derived(meta?.onDataUpdate);
	const onRowsDelete = $derived(meta?.onRowsDelete);
	const onCellsCopy = $derived(meta?.onCellsCopy);
	const onCellsCut = $derived(meta?.onCellsCut);
	const readOnly = $derived(meta?.readOnly ?? false);

	// Trigger style to position the menu at the context menu coordinates
	const triggerStyle = $derived.by(() => {
		if (!contextMenu) return '';
		return `position: fixed; left: ${contextMenu.x}px; top: ${contextMenu.y}px; width: 1px; height: 1px; padding: 0; margin: 0; border: none; background: transparent; pointer-events: none; opacity: 0;`;
	});

	function onCloseAutoFocus(event: Event) {
		event.preventDefault();
		if (dataGridRef instanceof HTMLElement) {
			dataGridRef.focus();
		}
	}

	function onCopy() {
		onCellsCopy?.();
	}

	function onCut() {
		onCellsCut?.();
	}

	function onClear() {
		if (!selectionState?.selectedCells || selectionState.selectedCells.size === 0) return;

		const updates: UpdateCell[] = [];
		const tableColumns = table.getAllColumns();

		for (const cellKey of selectionState.selectedCells) {
			const { rowIndex, columnId } = parseCellKey(cellKey);

			const column = tableColumns.find((col) => col.id === columnId);
			const cellVariant = column?.columnDef?.meta?.cell?.variant;

			let emptyValue: unknown = '';
			if (cellVariant === 'multi-select' || cellVariant === 'file') {
				emptyValue = [];
			} else if (cellVariant === 'number' || cellVariant === 'date') {
				emptyValue = null;
			} else if (cellVariant === 'checkbox') {
				emptyValue = false;
			}

			updates.push({ rowIndex, columnId, value: emptyValue });
		}

		onDataUpdate?.(updates);
		const cellCount = updates.length;
		toast.success(`${cellCount} celda${cellCount !== 1 ? 's' : ''} limpiada${cellCount !== 1 ? 's' : ''}`);
	}

	async function onDelete() {
		if (!selectionState?.selectedCells || selectionState.selectedCells.size === 0) return;

		const rowIndices = new Set<number>();
		for (const cellKey of selectionState.selectedCells) {
			const { rowIndex } = parseCellKey(cellKey);
			rowIndices.add(rowIndex);
		}

		const rowIndicesArray = Array.from(rowIndices).sort((a, b) => a - b);
		await onRowsDelete?.(rowIndicesArray);
		const rowCount = rowIndicesArray.length;
		toast.success(`${rowCount} fila${rowCount !== 1 ? 's' : ''} eliminada${rowCount !== 1 ? 's' : ''}`);
	}
</script>

{#if contextMenu?.open}
	<DropdownMenu open={contextMenu.open} onOpenChange={onContextMenuOpenChange}>
		<DropdownMenuTrigger style={triggerStyle}></DropdownMenuTrigger>
		<DropdownMenuContent
			data-grid-popover=""
			align="start"
			class="w-48"
			onCloseAutoFocus={onCloseAutoFocus}
		>
			<DropdownMenuItem onSelect={onCopy}>
				<Copy />
				Copiar
			</DropdownMenuItem>
			<DropdownMenuItem onSelect={onCut} disabled={readOnly}>
				<Scissors />
				Cortar
			</DropdownMenuItem>
			<DropdownMenuItem onSelect={onClear} disabled={readOnly}>
				<Eraser />
				Limpiar
			</DropdownMenuItem>
			{#if onRowsDelete}
				<DropdownMenuSeparator />
				<DropdownMenuItem variant="destructive" onSelect={onDelete}>
					<Trash2 />
					Eliminar filas
				</DropdownMenuItem>
			{/if}
		</DropdownMenuContent>
	</DropdownMenu>
{/if}
