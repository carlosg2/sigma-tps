<script lang="ts">
	import {
		getCoreRowModel,
		getFilteredRowModel,
		getPaginationRowModel,
		getSortedRowModel,
		type ColumnFiltersState,
		type PaginationState,
		type SortingState,
		type VisibilityState,
	} from "@tanstack/table-core";
	import { Cog, Download, Grid, Plus, Rows3, Search, SlidersHorizontal } from "@lucide/svelte";

	import { Button } from "$lib/components/ui/button/index.js";
	import * as Card from "$lib/components/ui/card/index.js";
	import * as InputGroup from "$lib/components/ui/input-group/index.js";
	import { Kbd } from "$lib/components/ui/kbd/index.js";
	import * as Select from "$lib/components/ui/select/index.js";
	import * as Tabs from "$lib/components/ui/tabs/index.js";
	import { createSvelteTable } from "$lib/components/ui/data-table/index.js";

	import { filters, type UserRow } from "./data.js";
	import { usersColumns } from "./columns.js";
	import UsersTable from "./UsersTable.svelte";

	interface Props {
		users: UserRow[];
	}

	let { users }: Props = $props();

	let rowSelection = $state<Record<string, boolean>>({});
	let sorting = $state<SortingState>([{ id: "joinedDate", desc: true }]);
	let columnFilters = $state<ColumnFiltersState>([]);
	let columnVisibility = $state<VisibilityState>({ search: false, team: false });
	let pagination = $state<PaginationState>({ pageIndex: 0, pageSize: 10 });

	const table = createSvelteTable({
		get data() {
			return users;
		},
		columns: usersColumns,
		state: {
			get rowSelection() {
				return rowSelection;
			},
			get sorting() {
				return sorting;
			},
			get columnFilters() {
				return columnFilters;
			},
			get columnVisibility() {
				return columnVisibility;
			},
			get pagination() {
				return pagination;
			},
		},
		getRowId: (row) => row.email,
		autoResetPageIndex: false,
		enableRowSelection: true,
		onRowSelectionChange: (updater) => {
			rowSelection = typeof updater === "function" ? updater(rowSelection) : updater;
		},
		onSortingChange: (updater) => {
			sorting = typeof updater === "function" ? updater(sorting) : updater;
		},
		onColumnFiltersChange: (updater) => {
			columnFilters = typeof updater === "function" ? updater(columnFilters) : updater;
		},
		onColumnVisibilityChange: (updater) => {
			columnVisibility = typeof updater === "function" ? updater(columnVisibility) : updater;
		},
		onPaginationChange: (updater) => {
			pagination = typeof updater === "function" ? updater(pagination) : updater;
		},
		getCoreRowModel: getCoreRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getSortedRowModel: getSortedRowModel(),
	});

	const searchQuery = $derived(
		(table.getColumn("search")?.getFilterValue() as string) ?? "",
	);
	const roleFilter = $derived(
		(table.getColumn("role")?.getFilterValue() as string) ?? filters.role[0],
	);
	const teamFilter = $derived(
		(table.getColumn("team")?.getFilterValue() as string) ?? filters.team[0],
	);
	const statusFilter = $derived(
		(table.getColumn("status")?.getFilterValue() as string) ?? filters.status[0],
	);
	const workspaceFilter = $derived(
		(table.getColumn("workspace")?.getFilterValue() as string) ?? filters.workspace[0],
	);
	const selectedCount = $derived(table.getFilteredSelectedRowModel().rows.length);

	function setColumnSelectFilter(columnId: string, value: string) {
		table.getColumn(columnId)?.setFilterValue(value === "All" ? undefined : value);
		table.setPageIndex(0);
	}
</script>

<Card.Root>
	<Card.Header
		class="border-b has-data-[slot=card-action]:grid-cols-1 md:has-data-[slot=card-action]:grid-cols-[1fr_auto]"
	>
		<Card.Title class="text-xl leading-none">Users</Card.Title>
		<Card.Description class="max-w-sm leading-snug">
			Manage your organization members and their access.
		</Card.Description>
		<Card.Action
			class="col-start-1 row-start-auto flex w-full flex-wrap justify-start gap-2 justify-self-stretch md:col-start-2 md:row-span-2 md:row-start-1 md:w-auto md:flex-nowrap md:justify-end md:justify-self-end"
		>
			<InputGroup.Root class="h-7 w-full md:w-64">
				<InputGroup.Addon align="inline-start">
					<Search class="size-3.5" />
				</InputGroup.Addon>
				<InputGroup.Input
					class="h-7"
					placeholder="Search users..."
					value={searchQuery}
					oninput={(e) => {
						table.getColumn("search")?.setFilterValue(e.currentTarget.value || undefined);
						table.setPageIndex(0);
					}}
				/>
				<InputGroup.Addon align="inline-end">
					<Kbd class="h-4 text-[10px]">⌘K</Kbd>
				</InputGroup.Addon>
			</InputGroup.Root>
			<Button variant="outline" size="sm">
				<SlidersHorizontal /> Hide
			</Button>
			<Button variant="outline" size="sm">
				<Cog /> Customize
			</Button>
			<Button variant="outline" size="sm">
				<Download /> Export
			</Button>
			<Button size="sm">
				<Plus /> Add User
			</Button>
		</Card.Action>
	</Card.Header>

	<Card.Content class="flex flex-col gap-4 px-0">
		<div class="flex flex-wrap items-center justify-between gap-3 px-4">
			<div class="flex flex-wrap items-center gap-3">
				<Select.Root
					type="single"
					value={roleFilter}
					onValueChange={(value) => setColumnSelectFilter("role", value || "All")}
				>
					<Select.Trigger size="sm">
						<span class="text-muted-foreground">Role:</span>
						{roleFilter}
					</Select.Trigger>
					<Select.Content align="start">
						<Select.Group>
							{#each filters.role as option}
								<Select.Item value={option}>{option}</Select.Item>
							{/each}
						</Select.Group>
					</Select.Content>
				</Select.Root>

				<Select.Root
					type="single"
					value={teamFilter}
					onValueChange={(value) => setColumnSelectFilter("team", value || "All")}
				>
					<Select.Trigger size="sm">
						<span class="text-muted-foreground">Team:</span>
						{teamFilter}
					</Select.Trigger>
					<Select.Content align="start">
						<Select.Group>
							{#each filters.team as option}
								<Select.Item value={option}>{option}</Select.Item>
							{/each}
						</Select.Group>
					</Select.Content>
				</Select.Root>

				<Select.Root
					type="single"
					value={statusFilter}
					onValueChange={(value) => setColumnSelectFilter("status", value || "All")}
				>
					<Select.Trigger size="sm">
						<span class="text-muted-foreground">Status:</span>
						{statusFilter}
					</Select.Trigger>
					<Select.Content align="start">
						<Select.Group>
							{#each filters.status as option}
								<Select.Item value={option}>{option}</Select.Item>
							{/each}
						</Select.Group>
					</Select.Content>
				</Select.Root>
			</div>

			<Select.Root
				type="single"
				value={workspaceFilter}
				onValueChange={(value) => setColumnSelectFilter("workspace", value || "All")}
			>
				<Select.Trigger size="sm">
					<span class="text-muted-foreground">Workspace:</span>
					{workspaceFilter}
				</Select.Trigger>
				<Select.Content align="end">
					<Select.Group>
						{#each filters.workspace as option}
							<Select.Item value={option}>{option}</Select.Item>
						{/each}
					</Select.Group>
				</Select.Content>
			</Select.Root>
		</div>

		<div class="flex items-center justify-between gap-3 px-4">
			<div class="text-muted-foreground text-sm tabular-nums">{selectedCount} selected</div>

			<Tabs.Root value="list">
				<Tabs.List>
					<Tabs.Trigger value="list" aria-label="List view">
						<Rows3 />
					</Tabs.Trigger>
					<Tabs.Trigger value="grid" aria-label="Grid view">
						<Grid />
					</Tabs.Trigger>
				</Tabs.List>
			</Tabs.Root>
		</div>

		<UsersTable {table} />
	</Card.Content>
</Card.Root>
