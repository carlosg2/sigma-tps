<script lang="ts">
	import type { ColumnDef } from '@tanstack/table-core';
	import {
		DataGrid,
		DataGridFilterMenu,
		DataGridSortMenu,
		DataGridRowHeightMenu,
		DataGridViewMenu,
		DataGridKeyboardShortcuts,
		getDataGridSelectColumn,
		useDataGrid,
		getFilterFn
	} from '$lib/components/data-grid/index.js';
	import type { Direction } from '$lib/components/data-grid/types.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import Languages from '@lucide/svelte/icons/languages';

	interface DemoRow {
		id: string;
		name: string;
		email: string;
		age: number;
		department: string;
		status: string;
		website: string;
		notes: string;
		isActive: boolean;
		startDate: string;
	}

	interface Props {
		height: number;
	}

	let { height }: Props = $props();
	let dir = $state<Direction>('ltr');

	const departments = ['Ingeniería', 'Marketing', 'Ventas', 'RRHH', 'Finanzas'];
	const statuses = ['Activo', 'De baja', 'Remoto', 'Presencial'];

	function seedRows(): DemoRow[] {
		return [
			{
				id: crypto.randomUUID(),
				name: 'Ada Lovelace',
				email: 'ada@example.com',
				age: 32,
				department: 'Ingeniería',
				status: 'Activo',
				website: 'ada.dev',
				notes: 'Responsable de la plataforma central',
				isActive: true,
				startDate: '2022-03-15'
			},
			{
				id: crypto.randomUUID(),
				name: 'Grace Hopper',
				email: 'grace@example.com',
				age: 41,
				department: 'Investigación',
				status: 'Remoto',
				website: 'grace.dev',
				notes: 'Mejora el tooling de desarrollo',
				isActive: true,
				startDate: '2021-08-04'
			},
			{
				id: crypto.randomUUID(),
				name: 'Linus Torvalds',
				email: 'linus@example.com',
				age: 38,
				department: 'Ingeniería',
				status: 'Presencial',
				website: 'kernel.dev',
				notes: 'Mantiene los controles de calidad',
				isActive: true,
				startDate: '2020-12-01'
			},
			{
				id: crypto.randomUUID(),
				name: 'Margaret Hamilton',
				email: 'margaret@example.com',
				age: 45,
				department: 'RRHH',
				status: 'De baja',
				website: 'apollo.team',
				notes: 'Mentora de líderes de equipo',
				isActive: false,
				startDate: '2019-05-20'
			},
			{
				id: crypto.randomUUID(),
				name: 'Ada Lovelace',
				email: 'ada@example.com',
				age: 32,
				department: 'Ingeniería',
				status: 'Activo',
				website: 'ada.dev',
				notes: 'Responsable de la plataforma central',
				isActive: true,
				startDate: '2022-03-15'
			},
			{
				id: crypto.randomUUID(),
				name: 'Grace Hopper',
				email: 'grace@example.com',
				age: 41,
				department: 'Investigación',
				status: 'Remoto',
				website: 'grace.dev',
				notes: 'Mejora el tooling de desarrollo',
				isActive: true,
				startDate: '2021-08-04'
			},
			{
				id: crypto.randomUUID(),
				name: 'Linus Torvalds',
				email: 'linus@example.com',
				age: 38,
				department: 'Ingeniería',
				status: 'Presencial',
				website: 'kernel.dev',
				notes: 'Mantiene los controles de calidad',
				isActive: true,
				startDate: '2020-12-01'
			},
			{
				id: crypto.randomUUID(),
				name: 'Margaret Hamilton',
				email: 'margaret@example.com',
				age: 45,
				department: 'RRHH',
				status: 'De baja',
				website: 'apollo.team',
				notes: 'Mentora de líderes de equipo',
				isActive: false,
				startDate: '2019-05-20'
			}
		];
	}

	let data = $state<DemoRow[]>(seedRows());

	const filterFn = getFilterFn<DemoRow>();
	const columns: ColumnDef<DemoRow, unknown>[] = [
		getDataGridSelectColumn<DemoRow>({ enableRowMarkers: true }),
		{
			id: 'name',
			accessorKey: 'name',
			header: 'Nombre',
			footer: ({ table }) =>
				`${table.getRowModel().rows.length.toLocaleString('es-MX')} filas`,
			minSize: 180,
			filterFn,
			meta: { label: 'Nombre', cell: { variant: 'short-text' } }
		},
		{
			id: 'age',
			accessorKey: 'age',
			header: 'Edad',
			footer: ({ table }) => {
				const rows = table.getRowModel().rows;
				if (!rows.length) return '';
				const avg =
					rows.reduce((sum, row) => sum + (Number(row.getValue('age')) || 0), 0) / rows.length;
				return `Prom. ${avg.toLocaleString('es-MX', { maximumFractionDigits: 1 })}`;
			},
			minSize: 100,
			filterFn,
			meta: { label: 'Edad', cell: { variant: 'number', min: 18, max: 100, step: 1 } }
		},
		{
			id: 'email',
			accessorKey: 'email',
			header: 'Correo',
			minSize: 220,
			filterFn,
			meta: { label: 'Correo', cell: { variant: 'short-text' } }
		},
		{
			id: 'website',
			accessorKey: 'website',
			header: 'Sitio web',
			minSize: 220,
			filterFn,
			meta: { label: 'Sitio web', cell: { variant: 'url' } }
		},
		{
			id: 'department',
			accessorKey: 'department',
			header: 'Departamento',
			minSize: 180,
			filterFn,
			meta: {
				label: 'Departamento',
				cell: {
					variant: 'select',
					options: departments.map((value) => ({ label: value, value }))
				}
			}
		},
		{
			id: 'status',
			accessorKey: 'status',
			header: 'Estado',
			minSize: 180,
			filterFn,
			meta: {
				label: 'Estado',
				cell: {
					variant: 'select',
					options: statuses.map((value) => ({ label: value, value }))
				}
			}
		},
		{
			id: 'notes',
			accessorKey: 'notes',
			header: 'Notas',
			minSize: 220,
			filterFn,
			meta: { label: 'Notas', cell: { variant: 'long-text' } }
		},
		{
			id: 'isActive',
			accessorKey: 'isActive',
			header: 'Activo',
			minSize: 120,
			filterFn,
			meta: { label: 'Activo', cell: { variant: 'checkbox' } }
		},
		{
			id: 'startDate',
			accessorKey: 'startDate',
			header: 'Fecha de inicio',
			minSize: 150,
			filterFn,
			meta: { label: 'Fecha de inicio', cell: { variant: 'date' } }
		}
	];

	function createBlankRow(): DemoRow {
		return {
			id: crypto.randomUUID(),
			name: '',
			email: '',
			age: 18,
			department: departments[0] ?? 'Ingeniería',
			status: statuses[0] ?? 'Activo',
			website: '',
			notes: '',
			isActive: true,
			startDate: '2026-01-01'
		};
	}

	function onDataChange(newData: DemoRow[]) {
		data = newData;
	}

	function onRowAdd() {
		const newRow = createBlankRow();
		const newRowIndex = data.length;
		data = [...data, newRow];
		return { rowIndex: newRowIndex, rowId: newRow.id, columnId: 'name' };
	}

	const { table, onRowAdd: addRow, ...dataGridProps } = useDataGrid({
		columns,
		data: () => data,
		dir: () => dir,
		onDataChange,
		onRowAdd,
		getRowId: (row) => row.id,
		initialState: {
			columnPinning: {
				left: ['select']
			}
		},
		enableSearch: true,
		enablePaste: true,
		enableColumnSelection: true
	});

	const rowCountLabel = $derived(`${table.getRowModel().rows.length.toLocaleString('es-MX')} filas`);
</script>

<div class="flex flex-col gap-4">
	<div role="toolbar" aria-orientation="horizontal" class="flex flex-wrap items-center justify-between gap-2">
		<div class="flex flex-wrap items-center gap-2">
			<DataGridKeyboardShortcuts {dir} enableSearch={!!dataGridProps.searchState} enablePaste enableRowAdd />
			<Badge variant="secondary" class="font-mono tabular-nums">{rowCountLabel}</Badge>
		</div>
		<div class="flex items-center gap-2">
			<Button
				aria-label="Cambiar dirección de texto"
				{dir}
				variant="outline"
				size="sm"
				onclick={() => {
					dir = dir === 'ltr' ? 'rtl' : 'ltr';
				}}
			>
				<Languages class="text-muted-foreground" />
				{dir === 'ltr' ? 'Izq→Der' : 'Der→Izq'}
			</Button>
			<DataGridFilterMenu {table} {dir} />
			<DataGridSortMenu {table} {dir} />
			<DataGridRowHeightMenu {table} />
			<DataGridViewMenu {table} {dir} />
		</div>
	</div>

	<DataGrid {...dataGridProps} onRowAdd={addRow} {table} {height} {dir} />
</div>
