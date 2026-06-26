<script lang="ts">
	import {
		type ColumnDef,
		type ColumnFiltersState,
		// type PaginationState, // Paginación deshabilitada
		type Row,
		type RowSelectionState,
		type SortingState,
		type VisibilityState,
		type Table as TableType,
		getCoreRowModel,
		getFacetedRowModel,
		getFacetedUniqueValues,
		getFilteredRowModel,
		// getPaginationRowModel, // Paginación deshabilitada
		getSortedRowModel,
		type Column,
	} from "@tanstack/table-core";
	import {
		useSensors,
		MouseSensor,
		TouchSensor,
		KeyboardSensor,
		useSensor,
		type DragEndEvent,
		type UniqueIdentifier,
		DndContext,
		closestCenter,
	} from "@dnd-kit-svelte/core";
	import {
		arrayMove,
		SortableContext,
		useSortable,
		verticalListSortingStrategy,
	} from "@dnd-kit-svelte/sortable";
	import { restrictToVerticalAxis } from "@dnd-kit-svelte/modifiers";
	import { CSS } from "@dnd-kit-svelte/utilities";
	import DataTableToolbar from "./data-table-toolbar.svelte";
	import { createSvelteTable } from "$lib/components/ui/data-table/data-table.svelte.js";
	import FlexRender from "$lib/components/ui/data-table/flex-render.svelte";
	import * as Table from "$lib/components/ui/table/index.js";
	import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js";
	import * as Drawer from "$lib/components/ui/drawer/index.js";
	import * as AlertDialog from "$lib/components/ui/alert-dialog/index.js";
	import { categorias, especificaciones } from "../data/data.js";
	import { matrizMaterialSchema, type MatrizMaterial, type Revision } from "../data/schemas.js";
	import { renderComponent, renderSnippet } from "$lib/components/ui/data-table/render-helpers.js";
	import Checkbox from "$lib/components/ui/checkbox/checkbox.svelte";
	import { createRawSnippet } from "svelte";
	import { Badge } from "$lib/components/ui/badge/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import { Label } from "$lib/components/ui/label/index.js";
	import * as Select from "$lib/components/ui/select/index.js";
	import { Separator } from "$lib/components/ui/separator/index.js";
	import EllipsisIcon from "@lucide/svelte/icons/ellipsis";
	import EyeIcon from "@lucide/svelte/icons/eye";
	import PencilIcon from "@lucide/svelte/icons/pencil";
	import CopyIcon from "@lucide/svelte/icons/copy";
	import TrashIcon from "@lucide/svelte/icons/trash";
	import ArrowUpIcon from "@lucide/svelte/icons/arrow-up";
	import ArrowDownIcon from "@lucide/svelte/icons/arrow-down";
	import ChevronsUpDownIcon from "@lucide/svelte/icons/chevrons-up-down";
	import EyeOffIcon from "@lucide/svelte/icons/eye-off";
	import GripVerticalIcon from "@lucide/svelte/icons/grip-vertical";
	import type { HTMLAttributes } from "svelte/elements";
	import { cn } from "$lib/utils.js";
	import { toast } from "svelte-sonner";

	let { data: initialData, currentData = $bindable() }: { data: MatrizMaterial[], currentData?: MatrizMaterial[] } = $props();

	// Estado local mutable de los datos
	let localData = $state<MatrizMaterial[]>([...initialData]);

	// Historial de revisiones
	let revisiones = $state<Revision[]>([
		{
			numero: 1,
			descripcion: "DOCUMENTO GENERADO DESDE SISTEMA TPS INTELISIS",
			fecha: new Date().toLocaleDateString("es-MX", { day: "2-digit", month: "2-digit", year: "numeric" }),
			usuario: "Sistema",
		}
	]);

	// Función para agregar una nueva revisión
	function addRevision(descripcion: string, usuario: string = "Usuario") {
		const nuevaRevision: Revision = {
			numero: revisiones.length + 1,
			descripcion: descripcion.toUpperCase(),
			fecha: new Date().toLocaleDateString("es-MX", { day: "2-digit", month: "2-digit", year: "numeric" }),
			usuario,
		};
		revisiones = [...revisiones, nuevaRevision];
	}

	// Mantener sincronizado con el padre
	$effect(() => {
		currentData = localData;
	});

	// Estados para el Drawer
	let drawerOpen = $state(false);
	let drawerMode = $state<'view' | 'edit'>('view');
	let selectedMaterial = $state<MatrizMaterial | null>(null);
	
	// Estados para edición
	let editForm = $state({
		categoria: '',
		descripcion: '',
		codigo_material: '',
		especificacion: ''
	});

	// Estado para el AlertDialog de eliminación
	let deleteDialogOpen = $state(false);
	let materialToDelete = $state<MatrizMaterial | null>(null);

	// Funciones de acciones
	function handleViewDetails(material: MatrizMaterial) {
		selectedMaterial = material;
		drawerMode = 'view';
		drawerOpen = true;
	}

	function handleEdit(material: MatrizMaterial) {
		selectedMaterial = material;
		editForm = {
			categoria: material.categoria,
			descripcion: material.descripcion,
			codigo_material: material.codigo_material,
			especificacion: material.especificacion
		};
		drawerMode = 'edit';
		drawerOpen = true;
	}

	function handleSaveEdit() {
		if (!selectedMaterial) return;
		
		const index = localData.findIndex(m => m.id_matriz === selectedMaterial!.id_matriz);
		if (index !== -1) {
			const descripcion = editForm.descripcion;
			localData[index] = {
				...localData[index],
				categoria: editForm.categoria,
				descripcion: editForm.descripcion,
				codigo_material: editForm.codigo_material,
				especificacion: editForm.especificacion
			};
			localData = [...localData]; // Trigger reactivity
			addRevision(`SE MODIFICÓ ESPECIFICACIÓN: ${descripcion}`);
			toast.success("Especificación actualizada", {
				description: descripcion,
			});
		}
		drawerOpen = false;
		selectedMaterial = null;
	}

	function handleDuplicate(material: MatrizMaterial) {
		const index = localData.findIndex(m => m.id_matriz === material.id_matriz);
		if (index !== -1) {
			// Crear nuevo ID temporal negativo para evitar colisiones
			const newId = -Date.now();
			const duplicatedMaterial: MatrizMaterial = {
				...material,
				id_matriz: newId,
				fecha_creacion: new Date().toISOString()
			};
			// Insertar justo después del material original
			localData = [
				...localData.slice(0, index + 1),
				duplicatedMaterial,
				...localData.slice(index + 1)
			];
			addRevision(`SE DUPLICÓ ESPECIFICACIÓN: ${material.descripcion}`);
			toast.success("Especificación duplicada", {
				description: material.descripcion,
			});
		}
	}

	function handleAddSpecification(material: MatrizMaterial) {
		// Agregar al final de la lista
		localData = [...localData, material];
		addRevision(`SE AGREGÓ ESPECIFICACIÓN: ${material.descripcion}`);
		toast.success("Especificación agregada", {
			description: material.descripcion,
		});
	}

	function handleDeleteConfirm(material: MatrizMaterial) {
		materialToDelete = material;
		deleteDialogOpen = true;
	}

	function handleDelete() {
		if (!materialToDelete) return;
		
		const descripcion = materialToDelete.descripcion;
		localData = localData.filter(m => m.id_matriz !== materialToDelete!.id_matriz);
		deleteDialogOpen = false;
		materialToDelete = null;
		addRevision(`SE ELIMINÓ ESPECIFICACIÓN: ${descripcion}`);
		toast.success("Especificación eliminada", {
			description: descripcion,
		});
	}

	// ===== Drag and Drop Configuration =====
	const sortableId = $props.id();
	const dataIds = $derived<UniqueIdentifier[]>(localData.map((item) => item.id_matriz));

	const sensors = useSensors(
		useSensor(MouseSensor, {}),
		useSensor(TouchSensor, {}),
		useSensor(KeyboardSensor, {})
	);

	function handleDragEnd(event: DragEndEvent) {
		const { active, over } = event;
		if (active && over && active.id !== over.id) {
			const oldIndex = localData.findIndex((item) => item.id_matriz === active.id);
			const newIndex = localData.findIndex((item) => item.id_matriz === over.id);
			localData = arrayMove(localData, oldIndex, newIndex);
			addRevision(`SE REORDENÓ ESPECIFICACIÓN: ${localData[newIndex].descripcion}`);
			toast.info("Orden actualizado", {
				description: `Elemento movido de posición ${oldIndex + 1} a ${newIndex + 1}`,
			});
		}
	}

	let rowSelection = $state<RowSelectionState>({});
	let columnVisibility = $state<VisibilityState>({
		id_matriz: false,
		clave_vehiculo: false,
		nombre_vehiculo: false,
		marca: false,
		modelo: false,
		anio: false,
		nivel_codigo: false,
		nivel_nombre: false,
		norma: false,
		diseno_codigo: false,
		diseno_nombre: false,
		activo: false,
		fecha_creacion: false,
		cantidad: false,
		unidad: false,
	});
	let columnFilters = $state<ColumnFiltersState>([]);
	let sorting = $state<SortingState>([]);
	// Paginación deshabilitada - se muestran todos los registros
	// let pagination = $state<PaginationState>({ pageIndex: 0, pageSize: 20 });
	let globalFilter = $state<string>("");

	// Table configuration state
	let tableConfig = $state({
		bleed: true,
		dense: true,
		grid: false,
		striped: true,
		stickyHeader: true,
		stickyFooter: true,
		tableHeight: "calc(100vh - 22rem)",
	});

	const columns: ColumnDef<MatrizMaterial>[] = [
		{
			id: "drag",
			header: () => null,
			cell: ({ row }) => renderSnippet(DragHandle, { id: row.original.id_matriz }),
			size: 32,
			minSize: 32,
			maxSize: 32,
			enableSorting: false,
			enableHiding: false,
			enableResizing: false,
		},
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
			size: 32,
			minSize: 32,
			maxSize: 32,
			enableSorting: false,
			enableHiding: false,
			enableResizing: false,
		},
		{
			accessorKey: "id_matriz",
			header: ({ column }) => renderSnippet(ColumnHeader, { column, title: "ID" }),
			cell: ({ row }) => {
				const idSnippet = createRawSnippet<[number]>((getId) => {
					const id = getId();
					return {
						render: () => `<div class="font-mono text-xs text-muted-foreground">${id}</div>`,
					};
				});
				return renderSnippet(idSnippet, row.getValue("id_matriz"));
			},
			enableHiding: true,
		},
		{
			accessorKey: "categoria",
			header: ({ column }) => renderSnippet(ColumnHeader, { column, title: "Categoría" }),
			cell: ({ row }) => {
				return renderSnippet(CategoriaCell, { value: row.original.categoria });
			},
			filterFn: (row, id, value) => {
				return value.includes(row.getValue(id));
			},
		},
		{
			accessorKey: "descripcion",
			header: ({ column }) => renderSnippet(ColumnHeader, { column, title: "Descripción" }),
			cell: ({ row }) => {
				const descSnippet = createRawSnippet<[string]>((getDesc) => {
					const desc = getDesc();
					return {
						render: () => `<div class="max-w-[300px] truncate font-medium">${desc}</div>`,
					};
				});
				return renderSnippet(descSnippet, row.getValue("descripcion"));
			},
		},
		{
			accessorKey: "codigo_material",
			header: ({ column }) => renderSnippet(ColumnHeader, { column, title: "Código Material" }),
			cell: ({ row }) => {
				const codeSnippet = createRawSnippet<[string]>((getCode) => {
					const code = getCode();
					return {
						render: () => `<code class="bg-muted px-2 py-1 rounded text-xs font-mono">${code}</code>`,
					};
				});
				return renderSnippet(codeSnippet, row.getValue("codigo_material"));
			},
		},
		{
			accessorKey: "especificacion",
			header: ({ column }) => renderSnippet(ColumnHeader, { column, title: "Especificación" }),
			cell: ({ row }) => {
				return renderSnippet(EspecificacionCell, { value: row.original.especificacion });
			},
			filterFn: (row, id, value) => {
				return value.includes(row.getValue(id));
			},
		},
		{
			accessorKey: "cantidad",
			header: ({ column }) => renderSnippet(ColumnHeader, { column, title: "Cantidad" }),
			cell: ({ row }) => {
				const cantSnippet = createRawSnippet<[number | null]>((getCant) => {
					const cant = getCant();
					return {
						render: () => `<div class="text-center">${cant ?? '-'}</div>`,
					};
				});
				return renderSnippet(cantSnippet, row.getValue("cantidad"));
			},
		},
		{
			accessorKey: "unidad",
			header: ({ column }) => renderSnippet(ColumnHeader, { column, title: "Unidad" }),
			cell: ({ row }) => {
				const unidadSnippet = createRawSnippet<[string | null]>((getUnidad) => {
					const unidad = getUnidad();
					return {
						render: () => `<div class="text-center">${unidad ?? '-'}</div>`,
					};
				});
				return renderSnippet(unidadSnippet, row.getValue("unidad"));
			},
		},
		{
			accessorKey: "clave_vehiculo",
			header: ({ column }) => renderSnippet(ColumnHeader, { column, title: "Clave Vehículo" }),
			enableHiding: true,
		},
		{
			accessorKey: "nombre_vehiculo",
			header: ({ column }) => renderSnippet(ColumnHeader, { column, title: "Vehículo" }),
			enableHiding: true,
		},
		{
			accessorKey: "marca",
			header: ({ column }) => renderSnippet(ColumnHeader, { column, title: "Marca" }),
			enableHiding: true,
		},
		{
			accessorKey: "modelo",
			header: ({ column }) => renderSnippet(ColumnHeader, { column, title: "Modelo" }),
			enableHiding: true,
		},
		{
			accessorKey: "anio",
			header: ({ column }) => renderSnippet(ColumnHeader, { column, title: "Año" }),
			enableHiding: true,
		},
		{
			accessorKey: "nivel_codigo",
			header: ({ column }) => renderSnippet(ColumnHeader, { column, title: "Nivel Código" }),
			enableHiding: true,
		},
		{
			accessorKey: "nivel_nombre",
			header: ({ column }) => renderSnippet(ColumnHeader, { column, title: "Nivel" }),
			enableHiding: true,
		},
		{
			accessorKey: "norma",
			header: ({ column }) => renderSnippet(ColumnHeader, { column, title: "Norma" }),
			enableHiding: true,
		},
		{
			accessorKey: "diseno_codigo",
			header: ({ column }) => renderSnippet(ColumnHeader, { column, title: "Diseño Código" }),
			enableHiding: true,
		},
		{
			accessorKey: "diseno_nombre",
			header: ({ column }) => renderSnippet(ColumnHeader, { column, title: "Diseño" }),
			enableHiding: true,
		},
		{
			accessorKey: "activo",
			header: ({ column }) => renderSnippet(ColumnHeader, { column, title: "Activo" }),
			cell: ({ row }) => {
				return renderSnippet(ActivoCell, { value: row.original.activo });
			},
			enableHiding: true,
		},
		{
			accessorKey: "fecha_creacion",
			header: ({ column }) => renderSnippet(ColumnHeader, { column, title: "Fecha Creación" }),
			cell: ({ row }) => {
				const fechaSnippet = createRawSnippet<[string]>((getFecha) => {
					const fecha = getFecha();
					const formatted = new Date(fecha).toLocaleDateString('es-MX', {
						year: 'numeric',
						month: 'short',
						day: 'numeric'
					});
					return {
						render: () => `<div class="text-xs text-muted-foreground">${formatted}</div>`,
					};
				});
				return renderSnippet(fechaSnippet, row.getValue("fecha_creacion"));
			},
			enableHiding: true,
		},
		{
			id: "actions",
			cell: ({ row }) => renderSnippet(RowActions, { row }),
		},
	];

	const table = createSvelteTable({
		get data() {
			return localData;
		},
		getRowId: (row) => String(row.id_matriz),
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
			// Paginación deshabilitada
			// get pagination() {
			// 	return pagination;
			// },
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
		// Paginación deshabilitada
		// onPaginationChange: (updater) => {
		// 	if (typeof updater === "function") {
		// 		pagination = updater(pagination);
		// 	} else {
		// 		pagination = updater;
		// 	}
		// },
		onGlobalFilterChange: (updater) => {
			if (typeof updater === "function") {
				globalFilter = updater(globalFilter);
			} else {
				globalFilter = updater;
			}
		},
		getCoreRowModel: getCoreRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		// Paginación deshabilitada - se usa getFilteredRowModel para mostrar todos
		// getPaginationRowModel: getPaginationRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFacetedRowModel: getFacetedRowModel(),
		getFacetedUniqueValues: getFacetedUniqueValues(),
	});
</script>

{#snippet CategoriaCell({ value }: { value: string })}
	{@const categoria = categorias.find((cat) => cat.value === value)}
	<div class="flex items-center gap-2">
		{#if categoria}
			<categoria.icon class="size-4 text-muted-foreground shrink-0" />
			<span class="truncate max-w-[210px]" title={categoria.label}>{categoria.label}</span>
		{:else}
			<span class="truncate max-w-[210px]" title={value}>{value}</span>
		{/if}
	</div>
{/snippet}

{#snippet EspecificacionCell({ value }: { value: string })}
	{@const espec = especificaciones.find((e) => e.value === value)}
	<div class="flex items-center gap-2">
		{#if espec}
			<Badge variant="outline" class="text-xs whitespace-nowrap">
				<espec.icon class="size-3 mr-1" />
				{espec.label}
			</Badge>
		{:else}
			<Badge variant="outline" class="text-xs">{value}</Badge>
		{/if}
	</div>
{/snippet}

{#snippet ActivoCell({ value }: { value: boolean })}
	<Badge variant={value ? "default" : "secondary"} class="text-xs">
		{value ? "Activo" : "Inactivo"}
	</Badge>
{/snippet}

{#snippet DragHandle({ id }: { id: number })}
	{@const { attributes, listeners } = useSortable({ id: () => id })}
	<Button
		{...attributes.current}
		{...listeners.current}
		variant="ghost"
		size="icon"
		class="text-muted-foreground size-7 hover:bg-transparent cursor-grab"
	>
		<GripVerticalIcon class="text-muted-foreground size-3" />
		<span class="sr-only">Arrastrar para reordenar</span>
	</Button>
{/snippet}

{#snippet DraggableRow({ row }: { row: Row<MatrizMaterial> })}
	{@const { transform, transition, node, isDragging } = useSortable({
		id: () => row.original.id_matriz,
	})}
	<Table.Row
		data-state={row.getIsSelected() && "selected"}
		data-dragging={isDragging.current}
		bind:ref={node.current}
		class="relative z-0 data-[dragging=true]:z-10 data-[dragging=true]:opacity-80"
		style="transition: {transition.current}; transform: {CSS.Transform.toString(transform.current)}"
	>
		{#each row.getVisibleCells() as cell (cell.id)}
			<Table.Cell
				style={cell.column.columnDef.size ? `width: ${cell.column.getSize()}px; min-width: ${cell.column.getSize()}px; max-width: ${cell.column.getSize()}px;` : undefined}
			>
				<FlexRender content={cell.column.columnDef.cell} context={cell.getContext()} />
			</Table.Cell>
		{/each}
	</Table.Row>
{/snippet}

{#snippet RowActions({ row }: { row: Row<MatrizMaterial> })}
	{@const material = matrizMaterialSchema.parse(row.original)}
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
			<DropdownMenu.Item onclick={() => handleViewDetails(material)}>
				<EyeIcon class="mr-2 size-4" />
				Ver Detalles
			</DropdownMenu.Item>
			<DropdownMenu.Item onclick={() => handleEdit(material)}>
				<PencilIcon class="mr-2 size-4" />
				Editar
			</DropdownMenu.Item>
			<DropdownMenu.Separator />
			<DropdownMenu.Item onclick={() => handleDuplicate(material)}>
				<CopyIcon class="mr-2 size-4" />
				Duplicar
			</DropdownMenu.Item>
			<DropdownMenu.Separator />
			<DropdownMenu.Item class="text-destructive" onclick={() => handleDeleteConfirm(material)}>
				<TrashIcon class="mr-2 size-4" />
				Eliminar
				<DropdownMenu.Shortcut>⌘⌫</DropdownMenu.Shortcut>
			</DropdownMenu.Item>
		</DropdownMenu.Content>
	</DropdownMenu.Root>
{/snippet}

<!-- Paginación deshabilitada - se muestran todos los registros -->
{#snippet TableInfo({ table }: { table: TableType<MatrizMaterial> })}
	<div class="flex items-center justify-between px-2 py-2">
		<div class="text-muted-foreground flex-1 text-sm">
			{table.getFilteredSelectedRowModel().rows.length} de
			{table.getFilteredRowModel().rows.length} 
			{table.getFilteredRowModel().rows.length === 1 ? 'material' : 'materiales'} 
			{table.getFilteredSelectedRowModel().rows.length === 1 ? 'seleccionado' : 'seleccionados'}
		</div>
	</div>
{/snippet}

{#snippet ColumnHeader({
	column,
	title,
	class: className,
	...restProps
}: { column: Column<MatrizMaterial>; title: string } & HTMLAttributes<HTMLDivElement>)}
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
	<DataTableToolbar {table} bind:tableConfig pdfData={localData} pdfRevisiones={revisiones} onAddSpecification={handleAddSpecification} />
	<div class="">
		<DndContext
			id={sortableId}
			collisionDetection={closestCenter}
			modifiers={[restrictToVerticalAxis]}
			sensors={sensors}
			onDragEnd={handleDragEnd}
		>
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
							<Table.Head 
								colspan={header.colSpan}
								style={header.column.columnDef.size ? `width: ${header.column.getSize()}px; min-width: ${header.column.getSize()}px; max-width: ${header.column.getSize()}px;` : undefined}
							>
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
			<SortableContext items={dataIds} strategy={verticalListSortingStrategy}>
			<Table.Body>
				{#each table.getRowModel().rows as row (row.id)}
					{@render DraggableRow({ row })}
				{:else}
					<Table.Row>
						<Table.Cell colspan={columns.length} class="h-24 text-center">
							Sin resultados.
						</Table.Cell>
					</Table.Row>
				{/each}
			</Table.Body>
			</SortableContext>
		</Table.Root>
		</DndContext>
	</div>
	{@render TableInfo({ table })}
</div>

<!-- Drawer para Ver Detalles / Editar -->
<Drawer.Root bind:open={drawerOpen} direction="right" >
	<Drawer.Content>
		<div class="mx-auto w-full max-w-lg">
			<Drawer.Header>
				<Drawer.Title>
					{drawerMode === 'view' ? 'Detalles del Material' : 'Editar Material'}
				</Drawer.Title>
				<Drawer.Description>
					{#if selectedMaterial}
						ID: {selectedMaterial.id_matriz}
					{/if}
				</Drawer.Description>
			</Drawer.Header>
			
			{#if selectedMaterial}
				{@const material = selectedMaterial}
				<div class="p-4 pb-0">
					{#if drawerMode === 'view'}
						{@const categoria = categorias.find((cat) => cat.value === material.categoria)}
						{@const espec = especificaciones.find((e) => e.value === material.especificacion)}
						<!-- Modo Ver Detalles -->
						<div class="space-y-4">
							<div class="grid gap-2">
								<Label class="text-muted-foreground text-xs uppercase">Categoría</Label>
								<div class="flex items-center gap-2">
									{#if categoria}
										<categoria.icon class="size-4 text-muted-foreground" />
										<span class="font-medium">{categoria.label}</span>
									{:else}
										<span class="font-medium">{material.categoria}</span>
									{/if}
								</div>
							</div>
							
							<Separator />
							
							<div class="grid gap-2">
								<Label class="text-muted-foreground text-xs uppercase">Descripción</Label>
								<p class="font-medium">{material.descripcion}</p>
							</div>
							
							<Separator />
							
							<div class="grid gap-2">
								<Label class="text-muted-foreground text-xs uppercase">Código Material</Label>
								<code class="bg-muted px-2 py-1 rounded text-sm font-mono w-fit">
									{material.codigo_material}
								</code>
							</div>
							
							<Separator />
							
							<div class="grid gap-2">
								<Label class="text-muted-foreground text-xs uppercase">Especificación</Label>
								{#if espec}
									<Badge variant="outline" class="w-fit">
										<espec.icon class="size-3 mr-1" />
										{espec.label}
									</Badge>
								{:else}
									<Badge variant="outline" class="w-fit">{material.especificacion}</Badge>
								{/if}
							</div>
						</div>
					{:else}
						<!-- Modo Editar -->
						<div class="space-y-4">
							<div class="grid gap-2">
								<Label for="edit-categoria">Categoría</Label>
								<Select.Root 
									type="single" 
									value={editForm.categoria}
									onValueChange={(value) => editForm.categoria = value ?? ''}
								>
									<Select.Trigger id="edit-categoria" class="w-full">
										{@const cat = categorias.find(c => c.value === editForm.categoria)}
										{cat?.label ?? 'Seleccionar categoría'}
									</Select.Trigger>
									<Select.Content>
										{#each categorias as cat (cat.value)}
											<Select.Item value={cat.value}>
												<cat.icon class="size-4 mr-2 inline" />
												{cat.label}
											</Select.Item>
										{/each}
									</Select.Content>
								</Select.Root>
							</div>
							
							<div class="grid gap-2">
								<Label for="edit-descripcion">Descripción</Label>
								<Input 
									id="edit-descripcion" 
									bind:value={editForm.descripcion}
									placeholder="Descripción del material"
								/>
							</div>
							
							<div class="grid gap-2">
								<Label for="edit-codigo">Código Material</Label>
								<Input 
									id="edit-codigo" 
									bind:value={editForm.codigo_material}
									placeholder="Código del material"
									class="font-mono"
								/>
							</div>
							
							<div class="grid gap-2">
								<Label for="edit-especificacion">Especificación</Label>
								<Select.Root 
									type="single" 
									value={editForm.especificacion}
									onValueChange={(value) => editForm.especificacion = value ?? ''}
								>
									<Select.Trigger id="edit-especificacion" class="w-full">
										{@const espec = especificaciones.find(e => e.value === editForm.especificacion)}
										{espec?.label ?? 'Seleccionar especificación'}
									</Select.Trigger>
									<Select.Content>
										{#each especificaciones as espec (espec.value)}
											<Select.Item value={espec.value}>
												<espec.icon class="size-4 mr-2 inline" />
												{espec.label}
											</Select.Item>
										{/each}
									</Select.Content>
								</Select.Root>
							</div>
						</div>
					{/if}
				</div>
			{/if}
			
			<Drawer.Footer>
				{#if drawerMode === 'edit'}
					<Button onclick={handleSaveEdit}>Guardar Cambios</Button>
				{/if}
				<Drawer.Close>
					<Button variant="outline" class="w-full">
						{drawerMode === 'view' ? 'Cerrar' : 'Cancelar'}
					</Button>
				</Drawer.Close>
			</Drawer.Footer>
		</div>
	</Drawer.Content>
</Drawer.Root>

<!-- AlertDialog para confirmar eliminación -->
<AlertDialog.Root bind:open={deleteDialogOpen}>
	<AlertDialog.Content>
		<AlertDialog.Header>
			<AlertDialog.Title>¿Eliminar material?</AlertDialog.Title>
			<AlertDialog.Description>
				{#if materialToDelete}
					<p class="mb-2">Esta acción no se puede deshacer. Se eliminará el siguiente material:</p>
					<div class="bg-muted p-3 rounded-md space-y-1">
						<p><strong>Descripción:</strong> {materialToDelete.descripcion}</p>
						<p><strong>Código:</strong> <code class="bg-background px-1 rounded">{materialToDelete.codigo_material}</code></p>
					</div>
				{/if}
			</AlertDialog.Description>
		</AlertDialog.Header>
		<AlertDialog.Footer>
			<AlertDialog.Cancel>Cancelar</AlertDialog.Cancel>
			<AlertDialog.Action onclick={handleDelete} class="bg-destructive text-destructive-foreground hover:bg-destructive/90">
				Eliminar
			</AlertDialog.Action>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>
