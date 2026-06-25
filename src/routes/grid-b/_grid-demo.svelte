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
		useDataGridUndoRedoNative,
		getFilterFn
	} from '$lib/components/data-grid/index.js';
	import type { Direction, FileCellData } from '$lib/components/data-grid/types.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import Languages from '@lucide/svelte/icons/languages';
	import Undo2 from '@lucide/svelte/icons/undo-2';
	import Redo2 from '@lucide/svelte/icons/redo-2';

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
		skills: string[];
		documents: FileCellData[];
		phone: string;
		city: string;
		level: string;
		salary: number;
	}

	interface Props {
		height: number;
	}

	let { height }: Props = $props();
	let dir = $state<Direction>('ltr');

	const departments = ['Ingeniería', 'Marketing', 'Ventas', 'RRHH', 'Finanzas', 'Investigación'];
	const statuses = ['Activo', 'De baja', 'Remoto', 'Presencial'];
	const cities = ['CDMX', 'Guadalajara', 'Monterrey', 'Puebla', 'Querétaro', 'Mérida', 'Remoto'];
	const levels = ['Becario', 'Junior', 'Semi-senior', 'Senior', 'Líder técnico'];

	const skillsOptions = ['TypeScript', 'Rust', 'Go', 'Python', 'SQL', 'Diseño', 'DevOps'];

	const firstNames = [
		'Sofía', 'Mateo', 'Valentina', 'Santiago', 'Regina', 'Diego', 'Ximena', 'Emiliano',
		'Camila', 'Sebastián', 'Renata', 'Leonardo', 'Fernanda', 'Alejandro', 'Daniela', 'José',
		'María', 'Luis', 'Guadalupe', 'Ángel', 'Andrea', 'Miguel', 'Paola', 'Juan'
	];
	const lastNames = [
		'García', 'Hernández', 'Martínez', 'López', 'González', 'Rodríguez', 'Pérez',
		'Sánchez', 'Ramírez', 'Cruz', 'Flores', 'Gómez', 'Morales', 'Vázquez',
		'Reyes', 'Jiménez', 'Torres', 'Díaz', 'Ortiz', 'Mendoza', 'Ruiz',
		'Aguilar', 'Castillo', 'Romero'
	];
	const sampleDocs: FileCellData[][] = [
		[{ id: 'doc-a', name: 'contrato.pdf', size: 184320, type: 'application/pdf' }],
		[],
		[
			{ id: 'doc-b', name: 'cv.docx', size: 51200, type: 'application/msword' },
			{ id: 'doc-c', name: 'foto.png', size: 230400, type: 'image/png' }
		],
		[{ id: 'doc-d', name: 'informe.xlsx', size: 92160, type: 'application/vnd.ms-excel' }]
	];

	function pick<T>(list: T[], i: number): T {
		return list[i % list.length] as T;
	}

	// ID seguro: usa crypto.randomUUID cuando está disponible (secure context),
	// con fallback para contextos no seguros (p. ej. dev server por IP sobre HTTP).
	let uidCounter = 0;
	function uid(): string {
		if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
			return crypto.randomUUID();
		}
		return `uid-${(++uidCounter).toString(36)}-${(performance.now() | 0).toString(36)}`;
	}

	/**
	 * Genera una cantidad grande de filas variadas para que el contenido
	 * desborde el alto/ancho del grid y se aprecie el scroll y la virtualización.
	 */
	function seedRows(count = 6000): DemoRow[] {
		return Array.from({ length: count }, (_, i) => {
			const first = pick(firstNames, i);
			const last = pick(lastNames, i * 7 + 3);
			const name = `${first} ${last}`;
			const handle = `${first}.${last}`.toLowerCase().replace(/[^a-z.]/g, '');
			const skillCount = (i % 3) + 1;
			const skills = Array.from({ length: skillCount }, (_, s) =>
				pick(skillsOptions, i + s * 2)
			).filter((skill, idx, arr) => arr.indexOf(skill) === idx);

			return {
				id: `seed-row-${i}`,
				name,
				email: `${handle}@example.com`,
				age: 24 + (i % 38),
				department: pick(departments, i),
				status: pick(statuses, i * 3),
				website: `${handle}.dev`,
				notes: `Nota de ejemplo para ${first} (#${i + 1})`,
				isActive: i % 4 !== 0,
				startDate: `20${String(18 + (i % 8)).padStart(2, '0')}-${String((i % 12) + 1).padStart(2, '0')}-${String((i % 27) + 1).padStart(2, '0')}`,
				skills,
				documents: pick(sampleDocs, i).map((doc, j) => ({ ...doc, id: `seed-doc-${i}-${j}` })),
				phone: `+52 55 ${String(1000 + (i * 137) % 9000)} ${String(1000 + (i * 53) % 9000)}`,
				city: pick(cities, i * 2),
				level: pick(levels, i),
				salary: 18000 + (i % 25) * 4500
			} satisfies DemoRow;
		});
	}

	let data = $state<DemoRow[]>(seedRows());

	// Columns that participate in cell-level diffing for undo tracking.
	const editableColumns: (keyof DemoRow)[] = [
		'name',
		'email',
		'age',
		'department',
		'status',
		'website',
		'notes',
		'isActive',
		'startDate',
		'skills',
		'documents',
		'phone',
		'city',
		'level',
		'salary'
	];

	// Option B: undo/redo backed by the browser's native undo stack.
	const undoRedo = useDataGridUndoRedoNative<DemoRow>({
		data: () => data,
		onDataChange: (newData) => {
			// History application path — apply restored snapshot directly.
			data = newData;
		},
		getRowId: (row) => row.id
	});

	/**
	 * The grid emits the full next data array on cell edits/paste. We diff it
	 * against the current snapshot to derive the cell-level updates the undo
	 * tracker needs, then commit the new data.
	 */
	function onDataChange(newData: DemoRow[]) {
		const previous = data;
		const updates: {
			rowId: string;
			columnId: string;
			previousValue: unknown;
			newValue: unknown;
		}[] = [];

		// Cell edits/paste preserve row identity and order; diff by index.
		const len = Math.min(previous.length, newData.length);
		for (let i = 0; i < len; i++) {
			const before = previous[i];
			const after = newData[i];
			if (!before || !after || before.id !== after.id) continue;

			for (const col of editableColumns) {
				if (!Object.is(before[col], after[col])) {
					updates.push({
						rowId: after.id,
						columnId: col as string,
						previousValue: before[col],
						newValue: after[col]
					});
				}
			}
		}

		data = newData;

		if (updates.length > 0) {
			undoRedo.trackCellsUpdate(updates);
		}
	}

	const filterFn = getFilterFn<DemoRow>();
	const columns: ColumnDef<DemoRow, unknown>[] = [
		getDataGridSelectColumn<DemoRow>({ enableRowMarkers: true }),
		{
			id: 'name',
			accessorKey: 'name',
			header: 'Nombre',
			footer: ({ table }) => `${table.getRowModel().rows.length.toLocaleString('es-MX')} filas`,
			minSize: 180,
			filterFn,
			meta: { label: 'Nombre', cell: { variant: 'short-text' } }
		},
		{
			id: 'age',
			accessorKey: 'age',
			header: 'Edad',
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
		},
		{
			id: 'skills',
			accessorKey: 'skills',
			header: 'Habilidades',
			minSize: 220,
			filterFn,
			meta: {
				label: 'Habilidades',
				cell: {
					variant: 'multi-select',
					options: skillsOptions.map((value) => ({ label: value, value }))
				}
			}
		},
		{
			id: 'phone',
			accessorKey: 'phone',
			header: 'Teléfono',
			minSize: 180,
			filterFn,
			meta: { label: 'Teléfono', cell: { variant: 'short-text' } }
		},
		{
			id: 'city',
			accessorKey: 'city',
			header: 'Ciudad',
			minSize: 160,
			filterFn,
			meta: {
				label: 'Ciudad',
				cell: {
					variant: 'select',
					options: cities.map((value) => ({ label: value, value }))
				}
			}
		},
		{
			id: 'level',
			accessorKey: 'level',
			header: 'Nivel',
			minSize: 160,
			filterFn,
			meta: {
				label: 'Nivel',
				cell: {
					variant: 'select',
					options: levels.map((value) => ({ label: value, value }))
				}
			}
		},
		{
			id: 'salary',
			accessorKey: 'salary',
			header: 'Salario',
			minSize: 140,
			filterFn,
			meta: { label: 'Salario', cell: { variant: 'number', min: 0, max: 500000, step: 500 } }
		},
		{
			id: 'documents',
			accessorKey: 'documents',
			header: 'Documentos',
			minSize: 240,
			filterFn,
			meta: {
				label: 'Documentos',
				cell: { variant: 'file', multiple: true, maxFiles: 5 }
			}
		}
	];

	function createBlankRow(): DemoRow {
		return {
			id: uid(),
			name: '',
			email: '',
			age: 18,
			department: departments[0] ?? 'Ingeniería',
			status: statuses[0] ?? 'Activo',
			website: '',
			notes: '',
			isActive: true,
			startDate: '2026-01-01',
			skills: [],
			documents: [],
			phone: '',
			city: cities[0] ?? 'CDMX',
			level: levels[0] ?? 'Junior',
			salary: 18000
		};
	}

	function onRowAdd() {
		const newRow = createBlankRow();
		const newRowIndex = data.length;
		data = [...data, newRow];
		undoRedo.trackRowsAdd([newRow]);
		return { rowIndex: newRowIndex, rowId: newRow.id, columnId: 'name' };
	}

	function onRowsDelete(rows: DemoRow[]) {
		if (rows.length === 0) return;
		// Record before mutating so the undo can re-insert at original positions.
		undoRedo.trackRowsDelete(rows);
		const removedIds = new Set(rows.map((row) => row.id));
		data = data.filter((row) => !removedIds.has(row.id));
	}

	const { table, onRowAdd: addRow, ...dataGridProps } = useDataGrid({
		columns,
		data: () => data,
		dir: () => dir,
		onDataChange,
		onRowAdd,
		onRowsDelete,
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

	const rowCountLabel = $derived(
		`${table.getRowModel().rows.length.toLocaleString('es-MX')} filas`
	);
</script>

<div class="flex flex-col gap-4" use:undoRedo.gridAction>
	<div
		role="toolbar"
		aria-orientation="horizontal"
		class="flex flex-wrap items-center justify-between gap-2"
	>
		<div class="flex flex-wrap items-center gap-2">
			<DataGridKeyboardShortcuts
				{dir}
				enableSearch={!!dataGridProps.searchState}
				enablePaste
				enableRowAdd
			/>
			<Badge variant="secondary" class="font-mono tabular-nums">{rowCountLabel}</Badge>
			<Badge variant={undoRedo.isNativeActive ? 'default' : 'destructive'}>
				{undoRedo.isNativeActive ? 'Undo nativo activo' : 'Undo nativo no disponible'}
			</Badge>
		</div>
		<div class="flex items-center gap-2">
			<Button
				aria-label="Deshacer"
				variant="outline"
				size="sm"
				disabled={!undoRedo.canUndo}
				onclick={() => undoRedo.onUndo()}
			>
				<Undo2 class="text-muted-foreground" />
				Deshacer
			</Button>
			<Button
				aria-label="Rehacer"
				variant="outline"
				size="sm"
				disabled={!undoRedo.canRedo}
				onclick={() => undoRedo.onRedo()}
			>
				<Redo2 class="text-muted-foreground" />
				Rehacer
			</Button>
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
