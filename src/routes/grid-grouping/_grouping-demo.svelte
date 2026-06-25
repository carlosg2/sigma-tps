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
	import type { Direction } from '$lib/components/data-grid/types.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import ChevronsDownUp from '@lucide/svelte/icons/chevrons-down-up';
	import ChevronsUpDown from '@lucide/svelte/icons/chevrons-up-down';

	interface DemoRow {
		id: string;
		name: string;
		department: string;
		city: string;
		level: string;
		status: string;
		age: number;
		salary: number;
	}

	interface Props {
		height?: number;
	}

	let { height = 560 }: Props = $props();
	let dir = $state<Direction>('ltr');

	const departments = ['Ingeniería', 'Marketing', 'Ventas', 'RRHH', 'Finanzas', 'Investigación'];
	const statuses = ['Activo', 'De baja', 'Remoto', 'Presencial'];
	const cities = ['CDMX', 'Guadalajara', 'Monterrey', 'Puebla', 'Querétaro', 'Mérida'];
	const levels = ['Becario', 'Junior', 'Semi-senior', 'Senior', 'Líder técnico'];

	const firstNames = [
		'Sofía', 'Mateo', 'Valentina', 'Santiago', 'Regina', 'Diego', 'Ximena', 'Emiliano',
		'Camila', 'Sebastián', 'Renata', 'Leonardo', 'Fernanda', 'Alejandro', 'Daniela', 'José',
		'María', 'Luis', 'Guadalupe', 'Ángel', 'Andrea', 'Miguel', 'Paola', 'Juan'
	];
	const lastNames = [
		'García', 'Hernández', 'Martínez', 'López', 'González', 'Rodríguez', 'Pérez',
		'Sánchez', 'Ramírez', 'Cruz', 'Flores', 'Gómez', 'Morales', 'Vázquez',
		'Reyes', 'Jiménez', 'Torres', 'Díaz', 'Ortiz', 'Mendoza', 'Ruiz'
	];

	function pick<T>(list: T[], i: number): T {
		return list[i % list.length] as T;
	}

	function seedRows(count = 600): DemoRow[] {
		return Array.from({ length: count }, (_, i) => {
			const first = pick(firstNames, i);
			const last = pick(lastNames, i * 7 + 3);
			return {
				id: `row-${i}`,
				name: `${first} ${last}`,
				department: pick(departments, i),
				city: pick(cities, i * 2),
				level: pick(levels, i),
				status: pick(statuses, i * 3),
				age: 24 + (i % 38),
				salary: 18000 + (i % 25) * 4500
			} satisfies DemoRow;
		});
	}

	let data = $state<DemoRow[]>(seedRows());

	const currency = new Intl.NumberFormat('es-MX', {
		style: 'currency',
		currency: 'MXN',
		maximumFractionDigits: 0
	});

	function onDataChange(newData: DemoRow[]) {
		data = newData;
	}

	const filterFn = getFilterFn<DemoRow>();
	const columns: ColumnDef<DemoRow, unknown>[] = [
		getDataGridSelectColumn<DemoRow>({ enableRowMarkers: true }),
		{
			id: 'name',
			accessorKey: 'name',
			header: 'Nombre',
			minSize: 200,
			filterFn,
			// Disable grouping on the free-text identity column.
			enableGrouping: false,
			meta: { label: 'Nombre', cell: { variant: 'short-text' } }
		},
		{
			id: 'department',
			accessorKey: 'department',
			header: 'Departamento',
			minSize: 200,
			filterFn,
			// Group header cell shows the grouped value (the department name).
			cell: ({ getValue }) => getValue<string>(),
			meta: {
				label: 'Departamento',
				cell: {
					variant: 'select',
					options: departments.map((value) => ({ label: value, value }))
				}
			}
		},
		{
			id: 'city',
			accessorKey: 'city',
			header: 'Ciudad',
			minSize: 180,
			filterFn,
			cell: ({ getValue }) => getValue<string>(),
			meta: {
				label: 'Ciudad',
				cell: { variant: 'select', options: cities.map((value) => ({ label: value, value })) }
			}
		},
		{
			id: 'level',
			accessorKey: 'level',
			header: 'Nivel',
			minSize: 170,
			filterFn,
			cell: ({ getValue }) => getValue<string>(),
			meta: {
				label: 'Nivel',
				cell: { variant: 'select', options: levels.map((value) => ({ label: value, value })) }
			}
		},
		{
			id: 'status',
			accessorKey: 'status',
			header: 'Estado',
			minSize: 160,
			filterFn,
			cell: ({ getValue }) => getValue<string>(),
			meta: {
				label: 'Estado',
				cell: { variant: 'select', options: statuses.map((value) => ({ label: value, value })) }
			}
		},
		{
			id: 'age',
			accessorKey: 'age',
			header: 'Edad',
			minSize: 120,
			filterFn,
			// Aggregate ages as a mean for each group.
			aggregationFn: 'mean',
			aggregatedCell: ({ getValue }) => {
				const value = getValue<number>();
				return value == null ? '' : `~${Math.round(value)} años`;
			},
			meta: { label: 'Edad', cell: { variant: 'number', min: 18, max: 100, step: 1 } }
		},
		{
			id: 'salary',
			accessorKey: 'salary',
			header: 'Salario',
			minSize: 160,
			filterFn,
			// Aggregate salary as a sum for each group.
			aggregationFn: 'sum',
			aggregatedCell: ({ getValue }) => {
				const value = getValue<number>();
				return value == null ? '' : `Σ ${currency.format(value)}`;
			},
			meta: { label: 'Salario', cell: { variant: 'number', min: 0, max: 500000, step: 500 } }
		}
	];

	const { table, ...dataGridProps } = useDataGrid({
		columns,
		data: () => data,
		dir: () => dir,
		onDataChange,
		getRowId: (row) => row.id,
		enableGrouping: true,
		// Always allow editing in leaf cells even while grouping (spreadsheet behavior).
		// Rows automatically reorganize to the correct group when grouped-column values change.
		editableWhenGrouped: true,
		enableColumnSelection: true,
		initialState: {
			columnPinning: { left: ['select'] },
			grouping: ['department'],
			expanded: true
		}
	});

	const groupCountLabel = $derived.by(() => {
		const grouping = table.getState().grouping ?? [];
		return grouping.length === 0
			? 'Sin agrupación'
			: `${grouping.length} ${grouping.length === 1 ? 'nivel' : 'niveles'} de agrupación`;
	});

	const allExpanded = $derived(table.getIsAllRowsExpanded());

	function toggleExpandAll() {
		table.toggleAllRowsExpanded(!table.getIsAllRowsExpanded());
	}
</script>

<div class="flex flex-col gap-4">
	<div
		role="toolbar"
		aria-orientation="horizontal"
		class="flex flex-wrap items-center justify-between gap-2"
	>
		<div class="flex flex-wrap items-center gap-2">
			<Badge variant="secondary" class="font-mono tabular-nums">{groupCountLabel}</Badge>
		</div>
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
			<DataGridGroupMenu {table} {dir} />
			<DataGridRowHeightMenu {table} />
			<DataGridFilterMenu {table} {dir} />
			<DataGridSortMenu {table} {dir} />
			<DataGridViewMenu {table} {dir} />
		</div>
	</div>

	<DataGrid {...dataGridProps} {table} {height} {dir} />
</div>
