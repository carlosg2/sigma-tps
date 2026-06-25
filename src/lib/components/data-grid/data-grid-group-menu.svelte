<script lang="ts" generics="TData">
	import type { Table, GroupingState } from '@tanstack/table-core';
	import type { Direction } from './types.js';
	import { cn } from '$lib/utils.js';
	import { Button, buttonVariants } from '$lib/components/ui/button/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { Popover, PopoverContent, PopoverTrigger } from '$lib/components/ui/popover/index.js';
	import {
		Command,
		CommandEmpty,
		CommandGroup,
		CommandInput,
		CommandItem,
		CommandList
	} from '$lib/components/ui/command/index.js';
	import {
		Sortable,
		SortableContent,
		SortableItem,
		SortableItemHandle,
		SortableOverlay
	} from '$lib/components/ui/sortable/index.js';
	import { useId } from 'bits-ui';
	import type { ComponentProps } from 'svelte';

	// Icons
	import Group from '@lucide/svelte/icons/group';
	import ChevronsUpDown from '@lucide/svelte/icons/chevrons-up-down';
	import GripVertical from '@lucide/svelte/icons/grip-vertical';
	import Trash2 from '@lucide/svelte/icons/trash-2';

	const GROUP_SHORTCUT_KEY = 'g';
	const REMOVE_GROUP_SHORTCUTS = ['backspace', 'delete'];

	interface Props extends ComponentProps<typeof PopoverContent> {
		table: Table<TData>;
		disabled?: boolean;
		dir?: Direction;
	}

	let { table, disabled = false, dir = 'ltr', class: className, ...contentProps }: Props = $props();

	const id = useId();
	const labelId = `${id}-label`;
	const descriptionId = `${id}-description`;
	let open = $state(false);

	const grouping = $derived(table.getState().grouping ?? []);

	let openFieldSelectors = $state<Set<string>>(new Set());

	// Columns that can be grouped, split into the active grouping order and the
	// remaining available columns (used to add a new grouping level).
	const { columnLabels, availableColumns } = $derived.by(() => {
		const labels = new Map<string, string>();
		const groupedIds = new Set(grouping);
		const available: { id: string; label: string }[] = [];

		for (const column of table.getAllColumns()) {
			if (!column.getCanGroup()) continue;

			const label = column.columnDef.meta?.label ?? column.id;
			labels.set(column.id, label);

			if (!groupedIds.has(column.id)) {
				available.push({ id: column.id, label });
			}
		}

		return { columnLabels: labels, availableColumns: available };
	});

	function onGroupAdd() {
		const firstColumn = availableColumns[0];
		if (!firstColumn) return;
		table.setGrouping((prev: GroupingState) => [...prev, firstColumn.id]);
	}

	function onGroupUpdate(currentId: string, nextId: string) {
		table.setGrouping((prev: GroupingState) =>
			prev.map((columnId) => (columnId === currentId ? nextId : columnId))
		);
	}

	function onGroupRemove(columnId: string) {
		table.setGrouping((prev: GroupingState) => prev.filter((item) => item !== columnId));
	}

	function onGroupingReset() {
		table.setGrouping([]);
	}

	function handleKeyDown(event: KeyboardEvent) {
		if (
			event.target instanceof HTMLInputElement ||
			event.target instanceof HTMLTextAreaElement ||
			(event.target instanceof HTMLElement && event.target.contentEditable === 'true')
		) {
			return;
		}

		if (
			event.key.toLowerCase() === GROUP_SHORTCUT_KEY &&
			(event.ctrlKey || event.metaKey) &&
			event.shiftKey
		) {
			event.preventDefault();
			open = !open;
		}
	}

	function onTriggerKeyDown(event: KeyboardEvent) {
		if (REMOVE_GROUP_SHORTCUTS.includes(event.key.toLowerCase()) && grouping.length > 0) {
			event.preventDefault();
			onGroupingReset();
		}
	}

	function setFieldSelectorOpen(columnId: string, isOpen: boolean) {
		const next = new Set(openFieldSelectors);
		if (isOpen) next.add(columnId);
		else next.delete(columnId);
		openFieldSelectors = next;
	}

	function onGroupItemKeyDown(event: KeyboardEvent, columnId: string) {
		if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
			return;
		}
		if (openFieldSelectors.has(columnId)) return;
		if (REMOVE_GROUP_SHORTCUTS.includes(event.key.toLowerCase())) {
			event.preventDefault();
			onGroupRemove(columnId);
		}
	}

	function getSortableValue(columnId: string): string {
		return columnId;
	}
</script>

<svelte:window onkeydown={handleKeyDown} />

<Sortable
	value={grouping}
	getItemValue={getSortableValue}
	onValueChange={(items) => table.setGrouping(items as GroupingState)}
>
	<Popover bind:open>
		<PopoverTrigger>
			{#snippet child({ props })}
				<Button
					{...props}
					{dir}
					variant="outline"
					size="sm"
					class="font-normal"
					onkeydown={onTriggerKeyDown}
					{disabled}
				>
					<Group class="text-muted-foreground" />
					Agrupar
					{#if grouping.length > 0}
						<Badge
							variant="secondary"
							class="h-[18.24px] rounded-md px-[5.12px] font-mono font-normal text-[10.4px]"
						>
							{grouping.length}
						</Badge>
					{/if}
				</Button>
			{/snippet}
		</PopoverTrigger>
		<PopoverContent
			aria-labelledby={labelId}
			aria-describedby={descriptionId}
			{dir}
			class={cn(
				'flex w-full max-w-(--bits-popover-content-available-width) flex-col gap-3.5 p-4 sm:min-w-95',
				className
			)}
			{...contentProps}
		>
			<div class="flex flex-col gap-1">
				<h4 id={labelId} class="font-medium leading-none">
					{grouping.length > 0 ? 'Agrupar por' : 'Sin agrupación aplicada'}
				</h4>
				<p
					id={descriptionId}
					class={cn('text-muted-foreground text-sm', grouping.length > 0 && 'sr-only')}
				>
					{grouping.length > 0
						? 'Reordena los niveles para anidar los grupos.'
						: 'Agrega una columna para agrupar las filas.'}
				</p>
			</div>
			{#if grouping.length > 0}
				<SortableContent
					role="list"
					class="flex max-h-75 flex-col gap-2 overflow-y-auto p-1"
					type="data-grid-group-items"
				>
					{#each grouping as columnId, index (columnId)}
						{@const groupItemId = `${id}-group-${columnId}`}
						{@const fieldListboxId = `${groupItemId}-field-listbox`}
						{@const fieldTriggerId = `${groupItemId}-field-trigger`}
						<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
						<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
						<SortableItem
							value={columnId}
							role="listitem"
							id={groupItemId}
							tabindex={-1}
							class="flex items-center gap-2"
							onkeydown={(event) => onGroupItemKeyDown(event, columnId)}
						>
							<Badge
								variant="secondary"
								class="size-6 shrink-0 justify-center rounded p-0 font-mono tabular-nums"
							>
								{index + 1}
							</Badge>
							<Popover
								open={openFieldSelectors.has(columnId)}
								onOpenChange={(isOpen) => setFieldSelectorOpen(columnId, isOpen)}
							>
								<PopoverTrigger>
									{#snippet child({ props })}
										<Button
											{...props}
											id={fieldTriggerId}
											aria-controls={fieldListboxId}
											variant="outline"
											size="sm"
											class="flex-1 justify-between rounded font-normal"
										>
											<span class="truncate">{columnLabels.get(columnId)}</span>
											<ChevronsUpDown class="opacity-50" />
										</Button>
									{/snippet}
								</PopoverTrigger>
								<PopoverContent id={fieldListboxId} {dir} class="w-(--bits-popover-anchor-width) p-0">
									<Command>
										<CommandInput placeholder="Buscar campos..." />
										<CommandList>
											<CommandEmpty>Sin campos encontrados.</CommandEmpty>
											<CommandGroup>
												{#each availableColumns as column (column.id)}
													<CommandItem
														value={column.id}
														onSelect={() => {
															onGroupUpdate(columnId, column.id);
															setFieldSelectorOpen(columnId, false);
														}}
													>
														<span class="truncate">{column.label}</span>
													</CommandItem>
												{/each}
											</CommandGroup>
										</CommandList>
									</Command>
								</PopoverContent>
							</Popover>
							<Button
								aria-controls={groupItemId}
								variant="outline"
								size="icon"
								class="size-8 shrink-0 rounded"
								onclick={() => onGroupRemove(columnId)}
							>
								<Trash2 />
							</Button>
							<SortableItemHandle
								aria-label="Mango de arrastre para agrupación"
								class={cn(
									buttonVariants({ variant: 'outline', size: 'icon' }),
									'size-8 shrink-0 cursor-grab rounded'
								)}
							>
								<GripVertical class="size-4" />
							</SortableItemHandle>
						</SortableItem>
					{/each}
				</SortableContent>
			{/if}
			<div class="flex w-full items-center gap-2">
				<Button
					size="sm"
					class="rounded"
					onclick={onGroupAdd}
					disabled={availableColumns.length === 0}
				>
					Agregar grupo
				</Button>
				{#if grouping.length > 0}
					<Button variant="outline" size="sm" class="rounded" onclick={onGroupingReset}>
						Restablecer
					</Button>
				{/if}
			</div>
		</PopoverContent>
	</Popover>
	<SortableOverlay>
		<div {dir} class="flex items-center gap-2">
			<div class="size-6 shrink-0 rounded-sm bg-primary/10"></div>
			<div class="h-8 flex-1 rounded-sm bg-primary/10"></div>
			<div class="size-8 shrink-0 rounded-sm bg-primary/10"></div>
			<div class="size-8 shrink-0 rounded-sm bg-primary/10"></div>
		</div>
	</SortableOverlay>
</Sortable>
