<script lang="ts">
	import type { ColumnDef } from '@tanstack/table-core';
	import {
		DataGrid,
		DataGridFilterMenu,
		DataGridSortMenu,
		DataGridGroupMenu,
		DataGridRowHeightMenu,
		DataGridViewMenu,
		getDataGridSelectColumn,
		useDataGrid,
		getFilterFn
	} from '$lib/components/data-grid/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import ChevronsDownUp from '@lucide/svelte/icons/chevrons-down-up';
	import ChevronsUpDown from '@lucide/svelte/icons/chevrons-up-down';

	let { data } = $props();

	interface MaterialRow {
		Articulo: string;
		ArticuloDesc: string;
		Material: string;
		MaterialDesc: string;
		Cantidad: number;
		Unidad: string;
		Almacen: string;
		Nivel: number;
		Linea: number;
		Estilo: string;
		GrupoMayor: string;
		GrupoDesc: string;
		Sitio: string;
		TipoDeLinea: string;
		ConjuntoConf: string;
		Categoria: string;
		NoOper: number;
	}

	const rows = $derived<MaterialRow[]>(data.materiales ?? []);

	const filterFn = getFilterFn<MaterialRow>();

	const columns: ColumnDef<MaterialRow, unknown>[] = [
		getDataGridSelectColumn<MaterialRow>({ enableRowMarkers: true }),
		{
			id: 'Articulo',
			accessorKey: 'Articulo',
			header: 'Artículo',
			minSize: 200,
			filterFn,
			enableGrouping: true,
			meta: { label: 'Artículo', cell: { variant: 'short-text' } }
		},
		{
			id: 'ArticuloDesc',
			accessorKey: 'ArticuloDesc',
			header: 'Desc. artículo',
			minSize: 400,
			filterFn,
			enableGrouping: true,
			meta: { label: 'Desc. artículo', cell: { variant: 'short-text' } }
		},
		{
			id: 'Material',
			accessorKey: 'Material',
			header: 'Material',
			minSize: 200,
			filterFn,
			enableGrouping: true,
			meta: { label: 'Material', cell: { variant: 'short-text' } }
		},
		{
			id: 'MaterialDesc',
			accessorKey: 'MaterialDesc',
			header: 'Desc. material',
			minSize: 200,
			filterFn,
			enableGrouping: false,
			meta: { label: 'Desc. material', cell: { variant: 'short-text' } }
		},
		{
			id: 'Cantidad',
			accessorKey: 'Cantidad',
			header: 'Cantidad',
			minSize: 110,
			filterFn,
			enableGrouping: false,
			aggregationFn: 'sum',
			aggregatedCell: ({ getValue }) => {
				const v = getValue<number>();
				return v == null ? '' : `Σ ${v.toLocaleString('es-MX')}`;
			},
			meta: { label: 'Cantidad', cell: { variant: 'number', min: 0, step: 0.001 } }
		},
		{
			id: 'Unidad',
			accessorKey: 'Unidad',
			header: 'Unidad',
			minSize: 100,
			filterFn,
			enableGrouping: true,
			meta: { label: 'Unidad', cell: { variant: 'short-text' } }
		},
		{
			id: 'Almacen',
			accessorKey: 'Almacen',
			header: 'Almacén',
			minSize: 120,
			filterFn,
			enableGrouping: true,
			meta: { label: 'Almacén', cell: { variant: 'short-text' } }
		},
		{
			id: 'Nivel',
			accessorKey: 'Nivel',
			header: 'Nivel',
			minSize: 90,
			filterFn,
			enableGrouping: true,
			meta: { label: 'Nivel', cell: { variant: 'number', min: 0, step: 1 } }
		},
		{
			id: 'Linea',
			accessorKey: 'Linea',
			header: 'Línea',
			minSize: 90,
			filterFn,
			enableGrouping: false,
			meta: { label: 'Línea', cell: { variant: 'number', min: 0, step: 1 } }
		},
		{
			id: 'Estilo',
			accessorKey: 'Estilo',
			header: 'Estilo',
			minSize: 120,
			filterFn,
			enableGrouping: true,
			meta: { label: 'Estilo', cell: { variant: 'short-text' } }
		},
		{
			id: 'GrupoMayor',
			accessorKey: 'GrupoMayor',
			header: 'Grupo mayor',
			minSize: 140,
			filterFn,
			enableGrouping: true,
			meta: { label: 'Grupo mayor', cell: { variant: 'short-text' } }
		},
		{
			id: 'GrupoDesc',
			accessorKey: 'GrupoDesc',
			header: 'Grupo',
			minSize: 180,
			filterFn,
			enableGrouping: true,
			meta: { label: 'Grupo', cell: { variant: 'short-text' } }
		},
		{
			id: 'Sitio',
			accessorKey: 'Sitio',
			header: 'Sitio',
			minSize: 100,
			filterFn,
			enableGrouping: true,
			meta: { label: 'Sitio', cell: { variant: 'short-text' } }
		},
		{
			id: 'TipoDeLinea',
			accessorKey: 'TipoDeLinea',
			header: 'Tipo línea',
			minSize: 120,
			filterFn,
			enableGrouping: true,
			meta: { label: 'Tipo línea', cell: { variant: 'short-text' } }
		},
		{
			id: 'ConjuntoConf',
			accessorKey: 'ConjuntoConf',
			header: 'Conjunto conf.',
			minSize: 140,
			filterFn,
			enableGrouping: true,
			meta: { label: 'Conjunto conf.', cell: { variant: 'short-text' } }
		},
		{
			id: 'Categoria',
			accessorKey: 'Categoria',
			header: 'Categoría',
			minSize: 130,
			filterFn,
			enableGrouping: true,
			meta: { label: 'Categoría', cell: { variant: 'short-text' } }
		},
		{
			id: 'NoOper',
			accessorKey: 'NoOper',
			header: 'No. oper.',
			minSize: 110,
			filterFn,
			enableGrouping: false,
			meta: { label: 'No. oper.', cell: { variant: 'number', min: 0, step: 1 } }
		}
	];

	const { table, ...dataGridProps } = useDataGrid({
		columns,
		data: () => rows,
		getRowId: (_row, index) => String(index),
		enableGrouping: true,
		enableColumnSelection: true,
		initialState: {
			columnPinning: { left: ['select'] },
			grouping: ['GrupoMayor'],
			expanded: true
		}
	});

	const allExpanded = $derived(table.getIsAllRowsExpanded());

	function toggleExpandAll() {
		table.toggleAllRowsExpanded(!table.getIsAllRowsExpanded());
	}

	const groupCountLabel = $derived.by(() => {
		const grouping = table.getState().grouping ?? [];
		return grouping.length === 0
			? 'Sin agrupación'
			: `${grouping.length} ${grouping.length === 1 ? 'nivel' : 'niveles'} de agrupación`;
	});
</script>

<div class="mx-auto flex w-full max-w-350 flex-col gap-4 px-6 py-6">
	<div>
		<h1 class="text-2xl font-bold tracking-tight">Lista de Materiales</h1>
		<p class="text-sm text-muted-foreground">
			Estructura de componentes por artículo · spWebArtMaterialLista
		</p>
	</div>

	<div class="flex flex-col gap-4">
		<div
			role="toolbar"
			aria-orientation="horizontal"
			class="flex flex-wrap items-center justify-between gap-2"
		>
			<Badge variant="secondary" class="font-mono tabular-nums">{groupCountLabel}</Badge>
			<div class="flex flex-wrap items-center gap-2">
				<Button variant="outline" size="sm" onclick={toggleExpandAll}>
					{#if allExpanded}
						<ChevronsDownUp class="text-muted-foreground" />
						Colapsar todo
					{:else}
						<ChevronsUpDown class="text-muted-foreground" />
						Expandir todo
					{/if}
				</Button>
				<DataGridGroupMenu {table} />
				<DataGridRowHeightMenu {table} />
				<DataGridFilterMenu {table} />
				<DataGridSortMenu {table} />
				<DataGridViewMenu {table} />
			</div>
		</div>

		<DataGrid {...dataGridProps} {table} height={600} />
	</div>
</div>
