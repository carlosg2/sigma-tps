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
	import { costosRelativos, estadosActivo, disponibilidadUltraligero } from "../data/data.js";
	import { nivelBlindajeSchema, type NivelBlindaje } from "../data/schemas.js";
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
	import * as Select from "$lib/components/ui/select/index.js";
	import type { HTMLAttributes } from "svelte/elements";
	import { cn } from "$lib/utils.js";

	let { data }: { data: NivelBlindaje[] } = $props();

	let rowSelection = $state<RowSelectionState>({});
	let columnVisibility = $state<VisibilityState>({});
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
		tableHeight: "calc(100vh - 14rem)",
	});

	const columns: ColumnDef<NivelBlindaje>[] = [
		{
			id: "select",
			header: ({ table }) =>
				renderComponent(Checkbox, {
					checked: table.getIsAllPageRowsSelected(),
					onCheckedChange: (value) => table.toggleAllPageRowsSelected(value),
					indeterminate:
						table.getIsSomePageRowsSelected() && !table.getIsAllPageRowsSelected(),
					"aria-label": "Select all",
				}),
			cell: ({ row }) =>
				renderComponent(Checkbox, {
					checked: row.getIsSelected(),
					onCheckedChange: (value) => row.toggleSelected(value),
					"aria-label": "Select row",
				}),
			enableSorting: false,
			enableHiding: false,
		},
		{
			accessorKey: "nivel_codigo",
			header: ({ column }) => {
				return renderSnippet(ColumnHeader, {
					column,
					title: "Código",
				});
			},
			cell: ({ row }) => {
				const codeSnippet = createRawSnippet<[string]>((getCode) => {
					const code = getCode();
					return {
						render: () => `<div class="font-mono font-bold text-primary">${code}</div>`,
					};
				});
				return renderSnippet(codeSnippet, row.getValue("nivel_codigo"));
			},
			enableSorting: true,
			enableHiding: false,
		},
		{
			accessorKey: "nivel_nombre",
			header: ({ column }) => renderSnippet(ColumnHeader, { column, title: "Nombre del Nivel" }),
			cell: ({ row }) => {
				return renderSnippet(NombreCell, {
					nombre: row.original.nivel_nombre,
					ultraligero: row.original.disponible_ultraligero,
				});
			},
		},
		{
			accessorKey: "proteccion_contra",
			header: ({ column }) => renderSnippet(ColumnHeader, { column, title: "Protección Contra" }),
			cell: ({ row }) => {
				const proteccionSnippet = createRawSnippet<[string]>((getVal) => {
					const val = getVal();
					return {
						render: () => `<div class="max-w-[250px] truncate text-sm" title="${val}">${val}</div>`,
					};
				});
				return renderSnippet(proteccionSnippet, row.getValue("proteccion_contra"));
			},
		},
		{
			accessorKey: "peso_total_vehiculo_kg",
			header: ({ column }) => renderSnippet(ColumnHeader, { column, title: "Peso (kg)" }),
			cell: ({ row }) => {
				return renderSnippet(PesoCell, {
					value: row.original.peso_total_vehiculo_kg,
				});
			},
		},
		{
			accessorKey: "costo_relativo",
			header: ({ column }) =>
				renderSnippet(ColumnHeader, {
					column,
					title: "Costo",
				}),
			cell: ({ row }) => {
				return renderSnippet(CostoCell, {
					value: row.original.costo_relativo,
				});
			},
			filterFn: (row, id, value) => {
				return value.includes(row.getValue(id));
			},
		},
		{
			accessorKey: "aplicacion",
			header: ({ column }) => renderSnippet(ColumnHeader, { column, title: "Aplicación" }),
			cell: ({ row }) => {
				const aplicacionSnippet = createRawSnippet<[string]>((getVal) => {
					const val = getVal();
					return {
						render: () => `<div class="max-w-[200px] truncate text-sm text-muted-foreground" title="${val}">${val}</div>`,
					};
				});
				return renderSnippet(aplicacionSnippet, row.getValue("aplicacion"));
			},
		},
		{
			accessorKey: "disponible_ultraligero",
			header: ({ column }) => renderSnippet(ColumnHeader, { column, title: "Ultraligero" }),
			cell: ({ row }) => {
				return renderSnippet(UltraligeroCell, {
					value: row.original.disponible_ultraligero,
				});
			},
			filterFn: (row, id, value) => {
				return value.includes(String(row.getValue(id)));
			},
		},
		{
			accessorKey: "activo",
			header: ({ column }) => renderSnippet(ColumnHeader, { column, title: "Estado" }),
			cell: ({ row }) => {
				return renderSnippet(ActivoCell, {
					value: row.original.activo,
				});
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

{#snippet NombreCell({ nombre, ultraligero }: { nombre: string; ultraligero: boolean })}
	<div class="flex flex-col gap-1">
		<span class="font-medium max-w-[300px] truncate" title={nombre}>
			{nombre}
		</span>
		{#if ultraligero}
			<Badge variant="outline" class="w-fit text-xs">Versión UL disponible</Badge>
		{/if}
	</div>
{/snippet}

{#snippet PesoCell({ value }: { value: number })}
	<div class="flex items-center gap-1">
		<span class="font-mono">{value.toLocaleString()}</span>
		<span class="text-muted-foreground text-xs">kg</span>
	</div>
{/snippet}

{#snippet CostoCell({ value }: { value: string })}
	{@const costo = costosRelativos.find((c) => c.value === value)}
	{#if costo}
		<div class="flex items-center">
			<costo.icon class="text-muted-foreground mr-2 size-4" />
			<Badge variant={value === "Muy Alto" ? "destructive" : value === "Alto" ? "secondary" : "outline"}>
				{costo.label}
			</Badge>
		</div>
	{:else}
		<span>{value}</span>
	{/if}
{/snippet}

{#snippet UltraligeroCell({ value }: { value: boolean })}
	{@const disponible = disponibilidadUltraligero.find((d) => d.value === String(value))}
	{#if disponible}
		<div class="flex items-center">
			<disponible.icon class="mr-2 size-4 {value ? 'text-green-500' : 'text-muted-foreground'}" />
			<span class={value ? 'text-green-600' : 'text-muted-foreground'}>{disponible.label}</span>
		</div>
	{/if}
{/snippet}

{#snippet ActivoCell({ value }: { value: boolean })}
	{@const estado = estadosActivo.find((e) => e.value === String(value))}
	{#if estado}
		<Badge variant={value ? "default" : "secondary"} class={value ? "bg-green-600" : ""}>
			<estado.icon class="mr-1 size-3" />
			{estado.label}
		</Badge>
	{/if}
{/snippet}

{#snippet RowActions({ row }: { row: Row<NivelBlindaje> })}
	{@const nivel = nivelBlindajeSchema.parse(row.original)}
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
		<DropdownMenu.Content class="w-[180px]" align="end">
			<DropdownMenu.Item>Ver detalles</DropdownMenu.Item>
			<DropdownMenu.Item>Ver materiales</DropdownMenu.Item>
			<DropdownMenu.Item>Ver certificación</DropdownMenu.Item>
			<DropdownMenu.Separator />
			<DropdownMenu.Item>Editar nivel</DropdownMenu.Item>
			<DropdownMenu.Item>Duplicar</DropdownMenu.Item>
			<DropdownMenu.Separator />
			<DropdownMenu.Item class="text-destructive">
				Desactivar
				<DropdownMenu.Shortcut>⌘⌫</DropdownMenu.Shortcut>
			</DropdownMenu.Item>
		</DropdownMenu.Content>
	</DropdownMenu.Root>
{/snippet}

{#snippet Pagination({ table }: { table: TableType<NivelBlindaje> })}
	<div class="flex items-center justify-between px-2">
		<div class="text-muted-foreground flex-1 text-sm">
			{table.getFilteredSelectedRowModel().rows.length} de
			{table.getFilteredRowModel().rows.length} 
			{table.getFilteredRowModel().rows.length === 1 ? 'fila' : 'filas'} 
			{table.getFilteredSelectedRowModel().rows.length === 1 ? 'seleccionada' : 'seleccionadas'}
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
}: { column: Column<NivelBlindaje>; title: string } & HTMLAttributes<HTMLDivElement>)}
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
