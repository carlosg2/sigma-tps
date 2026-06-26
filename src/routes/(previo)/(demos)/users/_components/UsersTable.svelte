<script lang="ts">
	import type { Table as TanstackTable } from "@tanstack/table-core";
	import { Check, Clock, MoreHorizontal, X } from "@lucide/svelte";

	import * as Avatar from "$lib/components/ui/avatar/index.js";
	import { Badge } from "$lib/components/ui/badge/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import { Checkbox } from "$lib/components/ui/checkbox/index.js";
	import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js";
	import * as Pagination from "$lib/components/ui/pagination/index.js";
	import * as Select from "$lib/components/ui/select/index.js";
	import { Separator } from "$lib/components/ui/separator/index.js";
	import * as DataTable from "$lib/components/ui/table/index.js";
	import { cn } from "$lib/utils.js";

	import {
		getAvatarTone,
		getInitials,
		statusMeta,
		type UserRow,
		type UserStatus,
	} from "./data.js";

	interface Props {
		table: TanstackTable<UserRow>;
	}

	let { table }: Props = $props();

	const rowsPerPage = $derived(`${table.getState().pagination.pageSize}`);
	const pageCount = $derived(Math.max(table.getPageCount(), 1));
	const currentPage = $derived(table.getState().pagination.pageIndex + 1);
	function getLastActiveBadge(lastActive: number) {
		if (lastActive < 1) return { className: "bg-green-600 text-green-950 [&>svg]:text-white", Icon: Check };
		if (lastActive < 4 * 60) return { className: "bg-amber-500 text-amber-950", Icon: Clock };
		if (lastActive < 7 * 24 * 60) return { className: "bg-destructive", Icon: null };
		return { className: "bg-muted-foreground text-muted", Icon: X };
	}
</script>

<div class="flex flex-1 flex-col gap-4">
	<div>
		<DataTable.Root class="**:data-[slot='table-cell']:px-4 **:data-[slot='table-head']:px-4">
			<DataTable.Header class="[&_tr]:border-t">
				{#each table.getHeaderGroups() as headerGroup}
					<DataTable.Row>
						{#each headerGroup.headers as header}
							<DataTable.Head class="py-4 font-normal">
								{#if header.column.id === "select"}
									<div class="flex items-center justify-center">
										<Checkbox
											aria-label="Select all users"
										checked={table.getIsAllPageRowsSelected()}
										indeterminate={table.getIsSomePageRowsSelected() && !table.getIsAllPageRowsSelected()}
											onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
										/>
									</div>
								{:else if header.column.id === "actions"}
									<div class="text-right">Actions</div>
								{:else if !header.isPlaceholder}
									{header.column.columnDef.header as string}
								{/if}
							</DataTable.Head>
						{/each}
					</DataTable.Row>
				{/each}
			</DataTable.Header>

			<DataTable.Body>
				{#if table.getRowModel().rows.length}
					{#each table.getRowModel().rows as row}
						<DataTable.Row
							class="border-border/60 hover:bg-white/2.5"
							data-state={row.getIsSelected() ? "selected" : undefined}
						>
							{#each row.getVisibleCells() as cell}
								{@const col = cell.column.id}
								<DataTable.Cell class="px-3 py-4 align-middle">
									{#if col === "select"}
										<div class="flex items-center justify-center">
											<Checkbox
												aria-label="Select {row.original.name}"
												checked={row.getIsSelected()}
												onCheckedChange={(value) => row.toggleSelected(!!value)}
											/>
										</div>
									{:else if col === "name"}
										{@const badge = getLastActiveBadge(row.original.lastActive)}
										<div class="flex items-center gap-3">
											<Avatar.Root
												size="lg"
												class={cn("font-medium", getAvatarTone(row.original.name))}
											>
												<Avatar.Fallback>{getInitials(row.original.name)}</Avatar.Fallback>
												<Avatar.Badge class={badge.className}>
													{#if badge.Icon}
														<badge.Icon />
													{/if}
												</Avatar.Badge>
											</Avatar.Root>
											<div class="min-w-0">
												<div class="truncate font-medium text-foreground text-sm">
													{row.original.name}
												</div>
												<div class="truncate text-muted-foreground text-sm">
													{row.original.email}
												</div>
											</div>
										</div>
									{:else if col === "role"}
										<div class="grid gap-0.5">
											<span class="whitespace-nowrap">{row.original.role}</span>
											<span class="text-muted-foreground text-xs">{row.original.team}</span>
										</div>
									{:else if col === "workspace"}
										{@const [first, ...rest] = row.original.workspace}
										<Avatar.Group class="*:data-[slot=avatar]:ring-0">
											{#if first}
												<Avatar.Root class="after:rounded-sm">
													<Avatar.Fallback class="rounded-sm ring-0"
														>{getInitials(first)}</Avatar.Fallback
													>
												</Avatar.Root>
											{/if}
											{#if rest.length > 0}
												<Avatar.GroupCount class="rounded-sm border ring-card"
													>+{rest.length}</Avatar.GroupCount
												>
											{/if}
										</Avatar.Group>
									{:else if col === "status"}
										{@const meta = statusMeta[row.original.status as UserStatus]}
										<Badge
											class={cn("gap-1.5 border px-2 py-1 font-medium", meta.badgeClass)}
											variant="outline"
										>
											<span class={cn("size-1.5 rounded-full", meta.dotClass)}></span>
											{row.original.status}
										</Badge>
									{:else if col === "joinedDate"}
										<div class="text-foreground text-sm">{row.original.joinedDate}</div>
									{:else if col === "actions"}
										<div class="text-right">
											<DropdownMenu.Root>
												<DropdownMenu.Trigger>
													{#snippet child({ props })}
														<Button
															{...props}
															aria-label="Open actions for {row.original.name}"
															class="size-8 rounded-md text-muted-foreground hover:bg-muted/50"
															size="icon-sm"
															variant="ghost"
														>
															<MoreHorizontal class="size-4" />
														</Button>
													{/snippet}
												</DropdownMenu.Trigger>
												<DropdownMenu.Content align="end">
													<DropdownMenu.Item>View profile</DropdownMenu.Item>
													<DropdownMenu.Item>Edit user</DropdownMenu.Item>
													<DropdownMenu.Item>Manage team</DropdownMenu.Item>
													<DropdownMenu.Item>Resend invite</DropdownMenu.Item>
													<DropdownMenu.Separator />
													<DropdownMenu.Item variant="destructive"
														>Deactivate user</DropdownMenu.Item
													>
												</DropdownMenu.Content>
											</DropdownMenu.Root>
										</div>
									{:else if col !== "search" && col !== "team"}
										{String(cell.getValue() ?? "")}
									{/if}
								</DataTable.Cell>
							{/each}
						</DataTable.Row>
					{/each}
				{:else}
					<DataTable.Row>
						<DataTable.Cell
							colspan={table.getVisibleLeafColumns().length}
							class="h-24 text-center"
						>
							No results.
						</DataTable.Cell>
					</DataTable.Row>
				{/if}
			</DataTable.Body>
		</DataTable.Root>
	</div>

	<Separator />

	<div class="flex items-center justify-between px-4">
		<div class="flex items-center gap-4 text-muted-foreground text-sm">
			<div class="flex items-center gap-2">
				<span>Rows per page</span>
				<Select.Root
					type="single"
					value={rowsPerPage}
					onValueChange={(value) => table.setPageSize(Number(value))}
				>
					<Select.Trigger size="sm" class="w-20">
						{rowsPerPage}
					</Select.Trigger>
					<Select.Content side="top">
						<Select.Group>
							{#each [10, 20, 30, 40, 50] as size}
								<Select.Item value={`${size}`}>{size}</Select.Item>
							{/each}
						</Select.Group>
					</Select.Content>
				</Select.Root>
			</div>
			<span>Page {currentPage} of {pageCount}</span>
		</div>

		<Pagination.Root
			count={table.getFilteredRowModel().rows.length}
			perPage={table.getState().pagination.pageSize}
			page={table.getState().pagination.pageIndex + 1}
			onPageChange={(p) => table.setPageIndex(p - 1)}
			class="mx-0 w-auto justify-end"
		>
			{#snippet children({ pages, currentPage })}
				<Pagination.Content>
					<Pagination.Item>
						<Pagination.Previous />
					</Pagination.Item>
					{#each pages as page (page.key)}
						{#if page.type === "ellipsis"}
							<Pagination.Item>
								<Pagination.Ellipsis />
							</Pagination.Item>
						{:else}
							<Pagination.Item>
								<Pagination.Link {page} isActive={currentPage === page.value}>
									{page.value}
								</Pagination.Link>
							</Pagination.Item>
						{/if}
					{/each}
					<Pagination.Item>
						<Pagination.Next />
					</Pagination.Item>
				</Pagination.Content>
			{/snippet}
		</Pagination.Root>
	</div>
</div>
