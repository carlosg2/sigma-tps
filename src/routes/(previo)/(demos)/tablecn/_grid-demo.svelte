<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import type { ColumnDef } from '@tanstack/table-core';
	import {
		DataGrid,
		DataGridActionBar,
		DataGridFilterMenu,
		DataGridSortMenu,
		DataGridGroupMenu,
		DataGridRowHeightMenu,
		DataGridViewMenu,
		DataGridKeyboardShortcuts,
		DataGridSkeleton,
		DataGridSkeletonGrid,
		DataGridSkeletonToolbar,
		getDataGridSelectColumn,
		useDataGrid,
		useDataGridUndoRedoNative,
		getFilterFn,
		exportTableToCSV,
		parseCellKey
	} from '$lib/components/data-grid/index.js';
	import type { Direction } from '$lib/components/data-grid/types.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import Download from '@lucide/svelte/icons/download';
	import Languages from '@lucide/svelte/icons/languages';
	import Undo2 from '@lucide/svelte/icons/undo-2';
	import Redo2 from '@lucide/svelte/icons/redo-2';
	import ChevronsDownUp from '@lucide/svelte/icons/chevrons-down-up';
	import ChevronsUpDown from '@lucide/svelte/icons/chevrons-up-down';
	import { toast } from 'svelte-sonner';
	import { cn } from '$lib/utils.js';
	import {
		departments,
		scheduleDemoPeopleLoad,
		skills,
		statuses,
		type DemoPerson
	} from './_demo-data.js';

	interface Props {
		height: number;
	}

	let { height }: Props = $props();

	/** Demo seed size only — the grid virtualizes any length; there is no 10k engine cap. */
	const DEMO_ROW_COUNT = import.meta.env.MODE === 'test' || import.meta.env.VITEST ? 200 : 10_000;

	let data = $state<DemoPerson[]>([]);
	let isLoading = $state(true);
	let dir = $state<Direction>('ltr');

	onMount(() => {
		return scheduleDemoPeopleLoad(DEMO_ROW_COUNT, (people) => {
			data = people;
			isLoading = false;
		});
	});

	const undoRedo = useDataGridUndoRedoNative<DemoPerson>({
		data: () => data,
		onDataChange: (newData) => {
			data = newData;
		},
		getRowId: (row) => row.id
	});

	const filterFn = getFilterFn<DemoPerson>();

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const columns: ColumnDef<DemoPerson, any>[] = [
		getDataGridSelectColumn<DemoPerson>({ enableRowMarkers: true }),
		{
			id: 'name',
			accessorKey: 'name',
			header: 'Name',
			minSize: 180,
			filterFn,
			meta: { label: 'Name', cell: { variant: 'short-text' } }
		},
		{
			id: 'age',
			accessorKey: 'age',
			header: 'Age',
			minSize: 100,
			filterFn,
			aggregationFn: 'mean',
			aggregatedCell: ({ getValue }) => {
				const value = getValue<number>();
				return value == null ? '' : `~${Math.round(value)} years`;
			},
			meta: { label: 'Age', cell: { variant: 'number', min: 18, max: 100, step: 1 } }
		},
		{
			id: 'email',
			accessorKey: 'email',
			header: 'Email',
			minSize: 240,
			filterFn,
			meta: { label: 'Email', cell: { variant: 'short-text' } }
		},
		{
			id: 'website',
			accessorKey: 'website',
			header: 'Website',
			minSize: 240,
			filterFn,
			meta: { label: 'Website', cell: { variant: 'url' } }
		},
		{
			id: 'notes',
			accessorKey: 'notes',
			header: 'Notes',
			minSize: 200,
			filterFn,
			meta: { label: 'Notes', cell: { variant: 'long-text' } }
		},
		{
			id: 'salary',
			accessorKey: 'salary',
			header: 'Salary',
			minSize: 180,
			filterFn,
			aggregationFn: 'sum',
			aggregatedCell: ({ getValue }) => {
				const value = getValue<number>();
				const formatter = new Intl.NumberFormat('en-US', {
					style: 'currency',
					currency: 'USD',
					maximumFractionDigits: 0
				});
				return value == null ? '' : `Σ ${formatter.format(value)}`;
			},
			meta: { label: 'Salary', cell: { variant: 'number', min: 0, step: 1000 } }
		},
		{
			id: 'department',
			accessorKey: 'department',
			header: 'Department',
			minSize: 180,
			filterFn,
			meta: {
				label: 'Department',
				cell: {
					variant: 'select',
					options: departments.map((dept) => ({ label: dept, value: dept }))
				}
			}
		},
		{
			id: 'status',
			accessorKey: 'status',
			header: 'Status',
			minSize: 180,
			filterFn,
			meta: {
				label: 'Status',
				cell: {
					variant: 'select',
					options: statuses.map((status) => ({ label: status, value: status }))
				}
			}
		},
		{
			id: 'skills',
			accessorKey: 'skills',
			header: 'Skills',
			minSize: 240,
			filterFn,
			meta: {
				label: 'Skills',
				cell: {
					variant: 'multi-select',
					options: skills.map((skill) => ({ label: skill, value: skill }))
				}
			}
		},
		{
			id: 'isActive',
			accessorKey: 'isActive',
			header: 'Active',
			minSize: 140,
			filterFn,
			meta: { label: 'Active', cell: { variant: 'checkbox' } }
		},
		{
			id: 'startDate',
			accessorKey: 'startDate',
			header: 'Start Date',
			minSize: 150,
			filterFn,
			meta: { label: 'Start Date', cell: { variant: 'date' } }
		},
		{
			id: 'attachments',
			accessorKey: 'attachments',
			header: 'Attachments',
			minSize: 240,
			filterFn,
			meta: {
				label: 'Attachments',
				cell: {
					variant: 'file',
					maxFileSize: 10 * 1024 * 1024,
					maxFiles: 5,
					accept: 'image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx',
					multiple: true
				}
			}
		}
	];

	function createBlankRow(): DemoPerson {
		return { id: crypto.randomUUID() };
	}

	function onRowAdd() {
		const newRowIndex = data.length;
		const newRow = createBlankRow();
		const nextData = [...data, newRow];
		data = nextData;
		// Tracking is handled by onDataChange diff
		return { rowIndex: newRowIndex, rowId: newRow.id, columnId: 'name' };
	}

	function onRowsAdd(count: number) {
		const newRows = Array.from({ length: count }, () => createBlankRow());
		const nextData = [...data, ...newRows];
		data = nextData;
		// Tracking is handled by onDataChange diff
	}

	function onRowsDelete(rows: DemoPerson[]) {
		data = data.filter((row) => !rows.includes(row));
		// Tracking is handled by onDataChange diff
	}

	function onDataChange(newData: DemoPerson[]) {
		const previous = data;
		const updates: {
			rowId: string;
			columnId: string;
			previousValue: unknown;
			newValue: unknown;
		}[] = [];

		// Diff cell changes for undo tracking
		const len = Math.min(previous.length, newData.length);
		for (let i = 0; i < len; i++) {
			const before = previous[i];
			const after = newData[i];
			if (!before || !after || before.id !== after.id) continue;

			const keys = new Set([...Object.keys(before), ...Object.keys(after)]);
			for (const key of keys) {
				const prevValue = before[key as keyof DemoPerson];
				const newValue = after[key as keyof DemoPerson];

				if (!Object.is(prevValue, newValue)) {
					updates.push({
						rowId: after.id,
						columnId: key,
						previousValue: prevValue,
						newValue: newValue
					});
				}
			}
		}

		data = newData;

		if (updates.length > 0) {
			undoRedo.trackCellsUpdate(updates);
		}
	}

	async function onFilesUpload({ files }: { files: File[] }) {
		await new Promise((resolve) => setTimeout(resolve, 800));
		return files.map((file) => ({
			id: crypto.randomUUID(),
			name: file.name,
			size: file.size,
			type: file.type,
			url: URL.createObjectURL(file)
		}));
	}

	async function onFilesDelete({
		fileIds,
		rowIndex,
		columnId
	}: {
		fileIds: string[];
		rowIndex: number;
		columnId: string;
	}) {
		console.log(
			`Deleting ${fileIds.length} file(s) from row ${rowIndex}, column ${columnId}:`,
			fileIds
		);
	}

	const {
		table,
		onRowAdd: addRow,
		...dataGridProps
	} = useDataGrid({
		columns,
		data: () => data,
		dir: () => dir,
		onDataChange,
		onRowAdd,
		onRowsAdd,
		onRowsDelete,
		onFilesUpload,
		onFilesDelete,
		getRowId: (row) => row.id,
		enableGrouping: true,
		editableWhenGrouped: true,
		initialState: {
			columnPinning: {
				left: ['select']
			},
			grouping: [],
			expanded: true
		},
		enableSearch: true,
		enablePaste: true,
		enableColumnSelection: true
	});

	const displayedRowCount = $derived(isLoading ? 0 : table.getRowModel().rows.length);

	const rowCountLabel = $derived.by(() => {
		if (isLoading) {
			return `Loading ${DEMO_ROW_COUNT.toLocaleString('en-US')}…`;
		}
		if (data.length === displayedRowCount) {
			return `${data.length.toLocaleString('en-US')} rows`;
		}
		return `${displayedRowCount.toLocaleString('en-US')} visible · ${data.length.toLocaleString('en-US')} total`;
	});

	const groupCountLabel = $derived.by(() => {
		const grouping = table.getState().grouping ?? [];
		return grouping.length === 0
			? 'No grouping'
			: `${grouping.length} grouping ${grouping.length === 1 ? 'level' : 'levels'}`;
	});

	const allExpanded = $derived(table.getIsAllRowsExpanded());

	function toggleExpandAll() {
		table.toggleAllRowsExpanded(!table.getIsAllRowsExpanded());
	}

	const tableMeta = $derived(table.options.meta!);
	const selectedCellCount = $derived(dataGridProps.selectedCellsSet.size);

	const statusOptions = statuses.map((status) => ({ label: status, value: status }));
	const departmentOptions = departments.map((dept) => ({ label: dept, value: dept }));

	function getSelectedRowIndices(): number[] {
		const rowIndices = new Set<number>();
		for (const cellKey of dataGridProps.selectedCellsSet) {
			rowIndices.add(parseCellKey(cellKey).rowIndex);
		}
		return [...rowIndices];
	}

	function onStatusUpdate(value: string) {
		const rowIndices = getSelectedRowIndices();
		if (rowIndices.length === 0) {
			toast.error('No cells selected');
			return;
		}

		tableMeta.onDataUpdate?.(
			rowIndices.map((rowIndex) => ({ rowIndex, columnId: 'status', value }))
		);
		toast.success(`${rowIndices.length} row${rowIndices.length === 1 ? '' : 's'} updated`);
	}

	function onDepartmentUpdate(value: string) {
		const rowIndices = getSelectedRowIndices();
		if (rowIndices.length === 0) {
			toast.error('No cells selected');
			return;
		}

		tableMeta.onDataUpdate?.(
			rowIndices.map((rowIndex) => ({ rowIndex, columnId: 'department', value }))
		);
		toast.success(`${rowIndices.length} row${rowIndices.length === 1 ? '' : 's'} updated`);
	}

	function onBulkDelete() {
		const rowIndices = getSelectedRowIndices();
		if (rowIndices.length === 0) {
			toast.error('No cells selected');
			return;
		}

		tableMeta.onRowsDelete?.(rowIndices);
		table.toggleAllRowsSelected(false);
		tableMeta.onSelectionClear?.();
		toast.success(`${rowIndices.length} row${rowIndices.length === 1 ? '' : 's'} deleted`);
	}

	function onExport() {
		exportTableToCSV(table, {
			filename: 'people',
			excludeColumns: ['select']
		});
	}

	onDestroy(() => {
		dataGridProps.setDataGridRef(null);
		dataGridProps.setHeaderRef(null);
		dataGridProps.setFooterRef(null);
	});
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
				enableUndoRedo
				enablePaste
				enableRowAdd
				enableRowsDelete
			/>
			<Badge variant="secondary" class="font-mono tabular-nums">{rowCountLabel}</Badge>
			<Badge variant="secondary" class="font-mono tabular-nums">{groupCountLabel}</Badge>
			<Badge variant={undoRedo.isNativeActive ? 'default' : 'destructive'}>
				{undoRedo.isNativeActive ? 'Native undo active' : 'Undo unavailable'}
			</Badge>
		</div>
		<div class="flex items-center gap-2">
			<Button
				variant="outline"
				size="sm"
				disabled={!undoRedo.canUndo}
				onclick={() => undoRedo.onUndo()}
				title="Ctrl+Z / Cmd+Z"
			>
				<Undo2 class="text-muted-foreground" />
				Undo
			</Button>
			<Button
				variant="outline"
				size="sm"
				disabled={!undoRedo.canRedo}
				onclick={() => undoRedo.onRedo()}
				title="Ctrl+Y / Cmd+Shift+Z"
			>
				<Redo2 class="text-muted-foreground" />
				Redo
			</Button>
			<Button variant="outline" size="sm" onclick={toggleExpandAll}>
				{#if allExpanded}
					<ChevronsDownUp class="text-muted-foreground" />
					Collapse all
				{:else}
					<ChevronsUpDown class="text-muted-foreground" />
					Expand all
				{/if}
			</Button>
			<Button
				aria-label="Toggle text direction"
				{dir}
				variant="outline"
				size="sm"
				aria-pressed={dir === 'rtl'}
				class={cn(
					'bg-background dark:bg-input/30 dark:hover:bg-input/50',
					dir === 'rtl' && 'bg-accent'
				)}
				onclick={() => {
					dir = dir === 'ltr' ? 'rtl' : 'ltr';
				}}
			>
				<Languages class="text-muted-foreground" />
				{dir === 'ltr' ? 'LTR' : 'RTL'}
			</Button>
			<Button variant="outline" size="sm" onclick={onExport}>
				<Download />
				Export
			</Button>
			<DataGridGroupMenu {table} {dir} />
			<DataGridFilterMenu {table} {dir} />
			<DataGridSortMenu {table} {dir} />
			<DataGridRowHeightMenu {table} />
			<DataGridViewMenu {table} {dir} />
		</div>
	</div>

	{#if isLoading}
		<DataGridSkeleton>
			<DataGridSkeletonToolbar actionCount={5} />
			<DataGridSkeletonGrid />
		</DataGridSkeleton>
		<p class="text-center text-sm text-muted-foreground">
			Loading {DEMO_ROW_COUNT.toLocaleString('en-US')} rows…
		</p>
	{:else}
		<DataGrid {...dataGridProps} onRowAdd={addRow} {table} {height} {dir} />
		<DataGridActionBar
			{table}
			{tableMeta}
			{selectedCellCount}
			{statusOptions}
			{departmentOptions}
			{onStatusUpdate}
			{onDepartmentUpdate}
			onDelete={onBulkDelete}
		/>
	{/if}
</div>
