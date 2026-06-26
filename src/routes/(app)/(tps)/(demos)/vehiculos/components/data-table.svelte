<script lang="ts">
	import {
		type ColumnDef,
		type ColumnFiltersState,
		type PaginationState,
		type Row,
		type RowSelectionState,
		type SortingState,
		type VisibilityState,
		type Table as TableType,
		getCoreRowModel,
		getFacetedRowModel,
		getFacetedUniqueValues,
		getFilteredRowModel,
		getPaginationRowModel,
		getSortedRowModel,
		type Column,
	} from "@tanstack/table-core";
	import DataTableToolbar from "./data-table-toolbar.svelte";
	import { createSvelteTable } from "$lib/components/ui/data-table/data-table.svelte.js";
	import FlexRender from "$lib/components/ui/data-table/flex-render.svelte";
	import * as Table from "$lib/components/ui/table/index.js";
	import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js";
	import { marcas, estadosActivo, tiposMotor } from "../data/data.js";
	import { vehiculoSchema, type Vehiculo } from "../data/schemas.js";
	import { renderComponent, renderSnippet } from "$lib/components/ui/data-table/render-helpers.js";
	import Checkbox from "$lib/components/ui/checkbox/checkbox.svelte";
	import { createRawSnippet } from "svelte";
	import { Badge } from "$lib/components/ui/badge/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import EllipsisIcon from "@lucide/svelte/icons/ellipsis";
	import ChevronRightIcon from "@lucide/svelte/icons/chevron-right";
	import ChevronLeftIcon from "@lucide/svelte/icons/chevron-left";
	import ChevronsLeftIcon from "@lucide/svelte/icons/chevrons-left";
	import ChevronsRightIcon from "@lucide/svelte/icons/chevrons-right";
	import ArrowUpIcon from "@lucide/svelte/icons/arrow-up";
	import ArrowDownIcon from "@lucide/svelte/icons/arrow-down";
	import ChevronsUpDownIcon from "@lucide/svelte/icons/chevrons-up-down";
	import EyeOffIcon from "@lucide/svelte/icons/eye-off";
	import CheckCircleIcon from "@lucide/svelte/icons/check-circle";
	import XCircleIcon from "@lucide/svelte/icons/x-circle";
	import * as Select from "$lib/components/ui/select/index.js";
	import type { HTMLAttributes } from "svelte/elements";
	import { cn } from "$lib/utils.js";

	let { data }: { data: Vehiculo[] } = $props();

	let rowSelection = $state<RowSelectionState>({});
	let columnVisibility = $state<VisibilityState>({
		motor_cilindrada: false,
		motor_torque_nm: false,
		largo_mm: false,
		ancho_mm: false,
		alto_mm: false,
		capacidad_tanque_litros: false,
	});
	let columnFilters = $state<ColumnFiltersState>([]);
	let sorting = $state<SortingState>([]);
	let pagination = $state<PaginationState>({ pageIndex: 0, pageSize: 10 });
	let globalFilter = $state<string>("");

	// Table configuration state
	let tableConfig = $state({
		bleed: true,
		dense: false,
		grid: false,
		striped: false,
		stickyHeader: true,
		stickyFooter: true,
		tableHeight: "calc(100vh - 18rem)",
	});

	const columns: ColumnDef<Vehiculo>[] = [
		{
			id: "select",
			header: ({ table }) =>
				renderComponent(Checkbox, {
					checked: table.getIsAllPageRowsSelected(),
					onCheckedChange: (value) => table.toggleAllPageRowsSelected(value),
					indeterminate:
						table.getIsSomePageRowsSelected() && !table.getIsAllPageRowsSelected(),
					"aria-label": "Seleccionar todo",
				}),
			cell: ({ row }) =>
				renderComponent(Checkbox, {
					checked: row.getIsSelected(),
					onCheckedChange: (value) => row.toggleSelected(value),
					"aria-label": "Seleccionar fila",
				}),
			enableSorting: false,
			enableHiding: false,
		},
		{
			accessorKey: "clave_vehiculo",
			header: ({ column }) => renderSnippet(ColumnHeader, { column, title: "Clave" }),
			cell: ({ row }) => {
				const claveSnippet = createRawSnippet<[string]>((getClave) => {
					const clave = getClave();
					return {
						render: () => `<div class="font-mono text-xs">${clave}</div>`,
					};
				});
				return renderSnippet(claveSnippet, row.getValue("clave_vehiculo"));
			},
			enableSorting: true,
			enableHiding: false,
		},
		{
			accessorKey: "marca",
			header: ({ column }) => renderSnippet(ColumnHeader, { column, title: "Marca" }),
			cell: ({ row }) => {
				return renderSnippet(MarcaCell, { value: row.original.marca });
			},
			filterFn: (row, id, value) => {
				return value.includes(row.getValue(id));
			},
		},
		{
			accessorKey: "modelo",
			header: ({ column }) => renderSnippet(ColumnHeader, { column, title: "Modelo" }),
			cell: ({ row }) => {
				return renderSnippet(ModeloVersionCell, {
					modelo: row.original.modelo,
					version: row.original.version,
				});
			},
		},
		{
			accessorKey: "año",
			header: ({ column }) => renderSnippet(ColumnHeader, { column, title: "Año" }),
			cell: ({ row }) => {
				const añoSnippet = createRawSnippet<[number]>((getAño) => {
					const año = getAño();
					return {
						render: () => `<div class="text-center font-medium">${año}</div>`,
					};
				});
				return renderSnippet(añoSnippet, row.getValue("año"));
			},
			filterFn: (row, id, value) => {
				return value.includes(String(row.getValue(id)));
			},
		},
		{
			accessorKey: "motor_tipo",
			header: ({ column }) => renderSnippet(ColumnHeader, { column, title: "Motor" }),
			cell: ({ row }) => {
				return renderSnippet(MotorCell, {
					tipo: row.original.motor_tipo,
					cilindrada: row.original.motor_cilindrada,
					potencia: row.original.motor_potencia_hp,
				});
			},
			filterFn: (row, id, value) => {
				return value.includes(row.getValue(id));
			},
		},
		{
			accessorKey: "motor_cilindrada",
			header: ({ column }) => renderSnippet(ColumnHeader, { column, title: "Cilindrada (L)" }),
			cell: ({ row }) => {
				const cilindradaSnippet = createRawSnippet<[number]>((getCilindrada) => {
					const cilindrada = getCilindrada();
					return {
						render: () => `<div class="text-right">${cilindrada} L</div>`,
					};
				});
				return renderSnippet(cilindradaSnippet, row.getValue("motor_cilindrada"));
			},
		},
		{
			accessorKey: "motor_potencia_hp",
			header: ({ column }) => renderSnippet(ColumnHeader, { column, title: "Potencia" }),
			cell: ({ row }) => {
				const potenciaSnippet = createRawSnippet<[number]>((getPotencia) => {
					const potencia = getPotencia();
					return {
						render: () => `<div class="text-right font-medium">${potencia} HP</div>`,
					};
				});
				return renderSnippet(potenciaSnippet, row.getValue("motor_potencia_hp"));
			},
		},
		{
			accessorKey: "motor_torque_nm",
			header: ({ column }) => renderSnippet(ColumnHeader, { column, title: "Torque" }),
			cell: ({ row }) => {
				const torqueSnippet = createRawSnippet<[number]>((getTorque) => {
					const torque = getTorque();
					return {
						render: () => `<div class="text-right">${torque} Nm</div>`,
					};
				});
				return renderSnippet(torqueSnippet, row.getValue("motor_torque_nm"));
			},
		},
		{
			accessorKey: "transmision",
			header: ({ column }) => renderSnippet(ColumnHeader, { column, title: "Transmisión" }),
			cell: ({ row }) => {
				const transmisionSnippet = createRawSnippet<[string]>((getTransmision) => {
					const transmision = getTransmision();
					return {
						render: () => `<div class="text-sm">${transmision}</div>`,
					};
				});
				return renderSnippet(transmisionSnippet, row.getValue("transmision"));
			},
		},
		{
			accessorKey: "traccion",
			header: ({ column }) => renderSnippet(ColumnHeader, { column, title: "Tracción" }),
			cell: ({ row }) => {
				const traccionSnippet = createRawSnippet<[string]>((getTraccion) => {
					const traccion = getTraccion();
					return {
						render: () => `<span class="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-blue-700/10 ring-inset dark:bg-blue-400/10 dark:text-blue-400 dark:ring-blue-400/30">${traccion}</span>`,
					};
				});
				return renderSnippet(traccionSnippet, row.getValue("traccion"));
			},
		},
		{
			accessorKey: "peso_original_kg",
			header: ({ column }) => renderSnippet(ColumnHeader, { column, title: "Peso (kg)" }),
			cell: ({ row }) => {
				const pesoSnippet = createRawSnippet<[number]>((getPeso) => {
					const peso = getPeso();
					return {
						render: () => `<div class="text-right font-medium">${peso.toLocaleString('es-MX')} kg</div>`,
					};
				});
				return renderSnippet(pesoSnippet, row.getValue("peso_original_kg"));
			},
		},
		{
			accessorKey: "largo_mm",
			header: ({ column }) => renderSnippet(ColumnHeader, { column, title: "Largo (mm)" }),
			cell: ({ row }) => {
				const largoSnippet = createRawSnippet<[number]>((getLargo) => {
					const largo = getLargo();
					return {
						render: () => `<div class="text-right">${largo.toLocaleString('es-MX')}</div>`,
					};
				});
				return renderSnippet(largoSnippet, row.getValue("largo_mm"));
			},
		},
		{
			accessorKey: "ancho_mm",
			header: ({ column }) => renderSnippet(ColumnHeader, { column, title: "Ancho (mm)" }),
			cell: ({ row }) => {
				const anchoSnippet = createRawSnippet<[number]>((getAncho) => {
					const ancho = getAncho();
					return {
						render: () => `<div class="text-right">${ancho.toLocaleString('es-MX')}</div>`,
					};
				});
				return renderSnippet(anchoSnippet, row.getValue("ancho_mm"));
			},
		},
		{
			accessorKey: "alto_mm",
			header: ({ column }) => renderSnippet(ColumnHeader, { column, title: "Alto (mm)" }),
			cell: ({ row }) => {
				const altoSnippet = createRawSnippet<[number]>((getAlto) => {
					const alto = getAlto();
					return {
						render: () => `<div class="text-right">${alto.toLocaleString('es-MX')}</div>`,
					};
				});
				return renderSnippet(altoSnippet, row.getValue("alto_mm"));
			},
		},
		{
			accessorKey: "capacidad_tanque_litros",
			header: ({ column }) => renderSnippet(ColumnHeader, { column, title: "Tanque (L)" }),
			cell: ({ row }) => {
				const tanqueSnippet = createRawSnippet<[number]>((getTanque) => {
					const tanque = getTanque();
					return {
						render: () => `<div class="text-right">${tanque} L</div>`,
					};
				});
				return renderSnippet(tanqueSnippet, row.getValue("capacidad_tanque_litros"));
			},
		},
		{
			accessorKey: "activo",
			header: ({ column }) => renderSnippet(ColumnHeader, { column, title: "Estado" }),
			cell: ({ row }) => {
				return renderSnippet(ActivoCell, { value: row.original.activo });
			},
			filterFn: (row, id, value) => {
				return value.includes(String(row.getValue(id)));
			},
		},
		{
			id: "actions",
			cell: ({ row }) => renderSnippet(RowActions, { row }),
		},
	];

	const table = createSvelteTable({
		get data() {
			return data;
		},
		state: {
			get sorting() {
				return sorting;
			},
			get columnVisibility() {
				return columnVisibility;
			},
			get rowSelection() {
				return rowSelection;
			},
			get columnFilters() {
				return columnFilters;
			},
			get pagination() {
				return pagination;
			},
			get globalFilter() {
				return globalFilter;
			},
		},
		columns,
		enableRowSelection: true,
		onRowSelectionChange: (updater) => {
			if (typeof updater === "function") {
				rowSelection = updater(rowSelection);
			} else {
				rowSelection = updater;
			}
		},
		onSortingChange: (updater) => {
			if (typeof updater === "function") {
				sorting = updater(sorting);
			} else {
				sorting = updater;
			}
		},
		onColumnFiltersChange: (updater) => {
			if (typeof updater === "function") {
				columnFilters = updater(columnFilters);
			} else {
				columnFilters = updater;
			}
		},
		onColumnVisibilityChange: (updater) => {
			if (typeof updater === "function") {
				columnVisibility = updater(columnVisibility);
			} else {
				columnVisibility = updater;
			}
		},
		onPaginationChange: (updater) => {
			if (typeof updater === "function") {
				pagination = updater(pagination);
			} else {
				pagination = updater;
			}
		},
		onGlobalFilterChange: (updater) => {
			if (typeof updater === "function") {
				globalFilter = updater(globalFilter);
			} else {
				globalFilter = updater;
			}
		},
		getCoreRowModel: getCoreRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFacetedRowModel: getFacetedRowModel(),
		getFacetedUniqueValues: getFacetedUniqueValues(),
	});
</script>

{#snippet MarcaCell({ value }: { value: string })}
	<div class="flex items-center">
		<Badge variant="outline" class="font-medium">{value}</Badge>
	</div>
{/snippet}

{#snippet ModeloVersionCell({ modelo, version }: { modelo: string; version: string })}
	<div class="flex flex-col">
		<span class="font-medium">{modelo}</span>
		<span class="text-muted-foreground text-xs">{version}</span>
	</div>
{/snippet}

{#snippet MotorCell({ tipo, cilindrada, potencia }: { tipo: string; cilindrada: number; potencia: number })}
	<div class="flex flex-col">
		<span class="text-sm font-medium">{tipo}</span>
		<span class="text-muted-foreground text-xs">{cilindrada}L · {potencia} HP</span>
	</div>
{/snippet}

{#snippet ActivoCell({ value }: { value: boolean })}
	{#if value}
		<div class="flex items-center">
			<CheckCircleIcon class="text-green-500 mr-2 size-4" />
			<span class="text-green-600 dark:text-green-400">Activo</span>
		</div>
	{:else}
		<div class="flex items-center">
			<XCircleIcon class="text-red-500 mr-2 size-4" />
			<span class="text-red-600 dark:text-red-400">Inactivo</span>
		</div>
	{/if}
{/snippet}

{#snippet RowActions({ row }: { row: Row<Vehiculo> })}
	{@const vehiculo = vehiculoSchema.parse(row.original)}
	<DropdownMenu.Root>
		<DropdownMenu.Trigger>
			{#snippet child({ props })}
				<Button
					{...props}
					variant="ghost"
					class="data-[state=open]:bg-muted flex h-8 w-8 p-0"
				>
					<EllipsisIcon />
					<span class="sr-only">Abrir Menú</span>
				</Button>
			{/snippet}
		</DropdownMenu.Trigger>
		<DropdownMenu.Content class="w-[160px]" align="end">
			<DropdownMenu.Item>Ver Detalles</DropdownMenu.Item>
			<DropdownMenu.Item>Editar</DropdownMenu.Item>
			<DropdownMenu.Separator />
			<DropdownMenu.Item>Configurar Blindaje</DropdownMenu.Item>
			<DropdownMenu.Item>Ver Historial</DropdownMenu.Item>
			<DropdownMenu.Separator />
			<DropdownMenu.Item class="text-red-600">
				Desactivar
				<DropdownMenu.Shortcut>⌘⌫</DropdownMenu.Shortcut>
			</DropdownMenu.Item>
		</DropdownMenu.Content>
	</DropdownMenu.Root>
{/snippet}

{#snippet Pagination({ table }: { table: TableType<Vehiculo> })}
	<div class="flex items-center justify-between px-2">
		<div class="text-muted-foreground flex-1 text-sm">
			{table.getFilteredSelectedRowModel().rows.length} de
			{table.getFilteredRowModel().rows.length} 
			{table.getFilteredRowModel().rows.length === 1 ? 'vehículo' : 'vehículos'} 
			{table.getFilteredSelectedRowModel().rows.length === 1 ? 'seleccionado' : 'seleccionados'}
		</div>
		<div class="flex items-center space-x-6 lg:space-x-8">
			<div class="flex items-center space-x-2">
				<p class="text-sm font-medium">Filas por página</p>
				<Select.Root
					allowDeselect={false}
					type="single"
					value={`${table.getState().pagination.pageSize}`}
					onValueChange={(value) => {
						table.setPageSize(Number(value));
					}}
				>
					<Select.Trigger class="h-8 w-[70px]">
						{String(table.getState().pagination.pageSize)}
					</Select.Trigger>
					<Select.Content side="top">
						{#each [10, 20, 30, 40, 50] as pageSize (pageSize)}
							<Select.Item value={`${pageSize}`}>
								{pageSize}
							</Select.Item>
						{/each}
					</Select.Content>
				</Select.Root>
			</div>
			<div class="flex w-[100px] items-center justify-center text-sm font-medium">
				Página {table.getState().pagination.pageIndex + 1} de
				{table.getPageCount()}
			</div>
			<div class="flex items-center space-x-2">
				<Button
					variant="outline"
					class="hidden size-8 p-0 lg:flex"
					onclick={() => table.setPageIndex(0)}
					disabled={!table.getCanPreviousPage()}
				>
					<span class="sr-only">Ir a la primera página</span>
					<ChevronsLeftIcon />
				</Button>
				<Button
					variant="outline"
					class="size-8 p-0"
					onclick={() => table.previousPage()}
					disabled={!table.getCanPreviousPage()}
				>
					<span class="sr-only">Ir a la página anterior</span>
					<ChevronLeftIcon />
				</Button>
				<Button
					variant="outline"
					class="size-8 p-0"
					onclick={() => table.nextPage()}
					disabled={!table.getCanNextPage()}
				>
					<span class="sr-only">Ir a la página siguiente</span>
					<ChevronRightIcon />
				</Button>
				<Button
					variant="outline"
					class="hidden size-8 p-0 lg:flex"
					onclick={() => table.setPageIndex(table.getPageCount() - 1)}
					disabled={!table.getCanNextPage()}
				>
					<span class="sr-only">Ir a la última página</span>
					<ChevronsRightIcon />
				</Button>
			</div>
		</div>
	</div>
{/snippet}

{#snippet ColumnHeader({
	column,
	title,
	class: className,
	...restProps
}: { column: Column<Vehiculo>; title: string } & HTMLAttributes<HTMLDivElement>)}
	{#if !column?.getCanSort()}
		<div class={className} {...restProps}>
			{title}
		</div>
	{:else}
		<div class={cn("flex items-center", className)} {...restProps}>
			<DropdownMenu.Root>
				<DropdownMenu.Trigger>
					{#snippet child({ props })}
						<Button
							{...props}
							variant="ghost"
							size="sm"
							class="data-[state=open]:bg-accent -ml-3 h-8"
						>
							<span>
								{title}
							</span>
							{#if column.getIsSorted() === "desc"}
								<ArrowDownIcon />
							{:else if column.getIsSorted() === "asc"}
								<ArrowUpIcon />
							{:else}
								<ChevronsUpDownIcon />
							{/if}
						</Button>
					{/snippet}
				</DropdownMenu.Trigger>
				<DropdownMenu.Content align="start">
					<DropdownMenu.Item onclick={() => column.toggleSorting(false)}>
						<ArrowUpIcon class="text-muted-foreground/70 mr-2 size-3.5" />
						Ascendente
					</DropdownMenu.Item>
					<DropdownMenu.Item onclick={() => column.toggleSorting(true)}>
						<ArrowDownIcon class="text-muted-foreground/70 mr-2 size-3.5" />
						Descendente
					</DropdownMenu.Item>
					<DropdownMenu.Separator />
					<DropdownMenu.Item onclick={() => column.toggleVisibility(false)}>
						<EyeOffIcon class="text-muted-foreground/70 mr-2 size-3.5" />
						Ocultar
					</DropdownMenu.Item>
				</DropdownMenu.Content>
			</DropdownMenu.Root>
		</div>
	{/if}
{/snippet}

<div class="space-y-4">
	<DataTableToolbar {table} bind:tableConfig />
	<div class="">
		<Table.Root 
			height={tableConfig.tableHeight}
			bleed={tableConfig.bleed} 
			dense={tableConfig.dense}
			grid={tableConfig.grid}
			striped={tableConfig.striped}
			class="gutter-sm md:gutter-xl"
		>
			<Table.Header sticky={tableConfig.stickyHeader} class="bg-background/50 backdrop-blur-lg">
				{#each table.getHeaderGroups() as headerGroup (headerGroup.id)}
					<Table.Row>
						{#each headerGroup.headers as header (header.id)}
							<Table.Head colspan={header.colSpan}>
								{#if !header.isPlaceholder}
									<FlexRender
										content={header.column.columnDef.header}
										context={header.getContext()}
									/>
								{/if}
							</Table.Head>
						{/each}
					</Table.Row>
				{/each}
			</Table.Header>
			<Table.Body>
				{#each table.getRowModel().rows as row (row.id)}
					<Table.Row data-state={row.getIsSelected() && "selected"}>
						{#each row.getVisibleCells() as cell (cell.id)}
							<Table.Cell>
								<FlexRender
									content={cell.column.columnDef.cell}
									context={cell.getContext()}
								/>
							</Table.Cell>
						{/each}
					</Table.Row>
				{:else}
					<Table.Row>
						<Table.Cell colspan={columns.length} class="h-24 text-center">
							Sin resultados.
						</Table.Cell>
					</Table.Row>
				{/each}
			</Table.Body>
			<!-- <Table.Footer sticky={tableConfig.stickyFooter} class="bg-background/50 backdrop-blur-lg">
				<Table.Row>
					<Table.Cell colspan={2} class="font-medium">
						Total: {table.getFilteredRowModel().rows.length} tareas
					</Table.Cell>
					<Table.Cell class="font-medium">
						Seleccionadas: {table.getFilteredSelectedRowModel().rows.length}
					</Table.Cell>
					<Table.Cell colspan={3}></Table.Cell>
				</Table.Row>
			</Table.Footer> -->
		</Table.Root>
	</div>
	{@render Pagination({ table })}
</div>
