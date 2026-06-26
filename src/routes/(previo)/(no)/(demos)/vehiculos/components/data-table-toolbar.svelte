<script lang="ts" generics="TData">
	import XIcon from "@lucide/svelte/icons/x";
	import type { Table } from "@tanstack/table-core";
	import { DataTableFacetedFilter, DataTableViewOptions } from "./index.js";
	import Button from "$lib/components/ui/button/button.svelte";
	import { Input } from "$lib/components/ui/input/index.js";
	import { marcas, estadosActivo, tiposMotor, años } from "../data/data.js";

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
	const marcaCol = $derived(table.getColumn("marca"));
	const añoCol = $derived(table.getColumn("año"));
	const activoCol = $derived(table.getColumn("activo"));
	const motorTipoCol = $derived(table.getColumn("motor_tipo"));
</script>

<div class="space-y-4 px-4 pt-4">
	<!-- Main Toolbar -->
	<div class="flex items-center justify-between">
		<div class="flex flex-1 items-center space-x-2">
			<Input
				placeholder="Buscar vehículos..."
				value={table.getState().globalFilter ?? ""}
				oninput={(e) => {
					table.setGlobalFilter(e.currentTarget.value);
				}}
				onchange={(e) => {
					table.setGlobalFilter(e.currentTarget.value);
				}}
				class="h-8 w-[150px] lg:w-[250px]"
			/>

			{#if marcaCol}
				<DataTableFacetedFilter column={marcaCol} title="Marca" options={marcas} />
			{/if}
			{#if añoCol}
				<DataTableFacetedFilter column={añoCol} title="Año" options={años} />
			{/if}
			{#if motorTipoCol}
				<DataTableFacetedFilter column={motorTipoCol} title="Motor" options={tiposMotor} />
			{/if}
			{#if activoCol}
				<DataTableFacetedFilter column={activoCol} title="Estado" options={estadosActivo} />
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
