<script lang="ts" generics="TData">
	import XIcon from "@lucide/svelte/icons/x";
	import type { Table } from "@tanstack/table-core";
	import { DataTableFacetedFilter, DataTableViewOptions } from "./index.js";
	import Button from "$lib/components/ui/button/button.svelte";
	import { Input } from "$lib/components/ui/input/index.js";
	import { nivelesComplejidad, costosRelativos } from "../data/data.js";

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
		tableConfig = $bindable()
	}: { 
		table: Table<TData>;
		tableConfig?: TableConfig;
	} = $props();

	const isFiltered = $derived(
		table.getState().columnFilters.length > 0 || table.getState().globalFilter
	);
	const complejidadCol = $derived(table.getColumn("nivel_complejidad"));
	const costoCol = $derived(table.getColumn("costo_relativo"));
</script>

<div class="space-y-4 px-4 pt-4">
	<!-- Main Toolbar -->
	<div class="flex items-center justify-between">
		<div class="flex flex-1 items-center space-x-2">
			<Input
				placeholder="Buscar diseños..."
				value={table.getState().globalFilter ?? ""}
				oninput={(e) => {
					table.setGlobalFilter(e.currentTarget.value);
				}}
				onchange={(e) => {
					table.setGlobalFilter(e.currentTarget.value);
				}}
				class="h-8 w-[150px] lg:w-[250px]"
			/>

			{#if complejidadCol}
				<DataTableFacetedFilter column={complejidadCol} title="Complejidad" options={nivelesComplejidad} />
			{/if}
			{#if costoCol}
				<DataTableFacetedFilter column={costoCol} title="Costo" options={costosRelativos} />
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
		<DataTableViewOptions {table} bind:tableConfig />
	</div>
</div>
