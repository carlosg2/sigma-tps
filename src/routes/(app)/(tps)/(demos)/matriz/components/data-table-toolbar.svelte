<script lang="ts" generics="TData">
	import XIcon from "@lucide/svelte/icons/x";
	import type { Table } from "@tanstack/table-core";
	import { DataTableFacetedFilter, DataTableViewOptions } from "./index.js";
	import Button from "$lib/components/ui/button/button.svelte";
	import { Input } from "$lib/components/ui/input/index.js";
	import { categorias, especificaciones } from "../data/data.js";
	import PdfDownloadButton from "./pdf-download-button.svelte";
	import AddSpecificationButton from "./add-specification-button.svelte";
	import type { MatrizMaterial, Revision } from "../data/schemas.js";

	interface TableConfig {
		bleed: boolean;
		dense: boolean;
		grid: boolean;
		striped: boolean;
		stickyHeader: boolean;
		stickyFooter: boolean;
		tableHeight: string;
	}

	let { 
		table,
		tableConfig = $bindable(),
		pdfData = [],
		pdfRevisiones = [],
		onAddSpecification
	}: { 
		table: Table<TData>;
		tableConfig?: TableConfig;
		pdfData?: MatrizMaterial[];
		pdfRevisiones?: Revision[];
		onAddSpecification?: (material: MatrizMaterial) => void;
	} = $props();

	const isFiltered = $derived(
		table.getState().columnFilters.length > 0 || table.getState().globalFilter
	);
	const categoriaCol = $derived(table.getColumn("categoria"));
	const especificacionCol = $derived(table.getColumn("especificacion"));
	
	// Obtener el vehículo base del primer elemento de los datos
	const vehiculoBase = $derived(pdfData.length > 0 ? pdfData[0] : null);
</script>

<div class="space-y-4 px-4 pt-4">
	<!-- Main Toolbar -->
	<div class="flex items-center justify-between">
		<div class="flex flex-1 items-center space-x-2">
			<Input
				placeholder="Buscar materiales..."
				value={table.getState().globalFilter ?? ""}
				oninput={(e) => {
					table.setGlobalFilter(e.currentTarget.value);
				}}
				onchange={(e) => {
					table.setGlobalFilter(e.currentTarget.value);
				}}
				class="h-8 w-[150px] lg:w-[300px]"
			/>

			{#if categoriaCol}
				<DataTableFacetedFilter column={categoriaCol} title="Categoría" options={categorias} />
			{/if}
			{#if especificacionCol}
				<DataTableFacetedFilter column={especificacionCol} title="Material" options={especificaciones} />
			{/if}

			{#if isFiltered}
				<Button
					variant="ghost"
					onclick={() => {
						table.resetColumnFilters();
						table.setGlobalFilter("");
					}}
					class="h-8 px-2 lg:px-3"
				>
					Reiniciar
					<XIcon />
				</Button>
			{/if}
		</div>
		<div class="flex items-center space-x-2">
			<AddSpecificationButton 
				onAdd={onAddSpecification ?? (() => {})} 
				{vehiculoBase} 
			/>
			<PdfDownloadButton data={pdfData} revisiones={pdfRevisiones} />
			<DataTableViewOptions {table} bind:tableConfig />
		</div>
	</div>
</div>
