<script lang="ts">
	import { flip } from 'svelte/animate';
	import { cubicOut } from 'svelte/easing';
	import type { DndEvent } from 'svelte-dnd-action';
	import { dndzone, dragHandle, SHADOW_ITEM_MARKER_PROPERTY_NAME } from 'svelte-dnd-action';

	import GripVertical from '@lucide/svelte/icons/grip-vertical';
	import MoreVertical from '@lucide/svelte/icons/more-vertical';
	import Plus from '@lucide/svelte/icons/plus';

	import { Button } from '$lib/components/ui/button/index.js';
	import { cn } from '$lib/utils.js';

	import { type Column, type Task } from './data.js';
	import TaskCard from './task-card.svelte';
  import Card from '$lib/components/ui/card/card.svelte';

	interface Props {
		column: Column;
		tasks: Task[];
		onconsider: (e: CustomEvent<DndEvent<Task>>) => void;
		onfinalize: (e: CustomEvent<DndEvent<Task>>) => void;
	}

	let { column, tasks, onconsider, onfinalize }: Props = $props();

	function isShadowItem(task: Task): boolean {
		return !!(task as unknown as Record<string, unknown>)[SHADOW_ITEM_MARKER_PROPERTY_NAME];
	}
</script>

<Card class="flex min-h-0 flex-col bg-muted/50 transition-colors">
	<div class="flex items-start justify-between gap-3 px-4 pt-4 pb-3">
		<div class="min-w-0 space-y-1">
			<div class="flex items-center gap-0.5">
				<button
					use:dragHandle
					class="inline-flex -ml-2 size-7 shrink-0 cursor-grab items-center justify-center rounded-md text-foreground/70 hover:bg-accent hover:text-accent-foreground active:cursor-grabbing"
					aria-label="Drag {column.title} column"
					type="button"
				>
					<GripVertical class="size-4" />
				</button>
				<h2 class="truncate font-medium text-base leading-none">{column.title}</h2>
			</div>
			<p class="text-muted-foreground text-sm tabular-nums leading-none">
				{tasks.length}
				{tasks.length === 1 ? 'tarea' : 'tareas'}
			</p>
		</div>
		<div class="-mr-2 flex items-center gap-0.5 text-muted-foreground">
			<Button variant="ghost" size="icon-sm" aria-label="Add task to {column.title}">
				<Plus />
			</Button>
			<Button variant="ghost" size="icon-sm" aria-label="{column.title} column actions">
				<MoreVertical />
			</Button>
		</div>
	</div>

	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		use:dndzone={{ items: tasks, flipDurationMs: 150, dropTargetStyle: {}, type: 'kanban-task', delayTouchStart: true }}
		{onconsider}
		{onfinalize}
		class="scrollbar-thin flex min-h-20 min-w-0 flex-1 flex-col gap-3 overflow-y-auto px-3 pb-3 [scrollbar-color:var(--border)_transparent] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar]:w-1"
	>
		{#each tasks as task (task.id)}
			<div
				animate:flip={{ duration: 150, easing: cubicOut }}
				style={isShadowItem(task) ? undefined : `view-transition-name: task-${task.id}`}
			>
				<TaskCard {task} columnId={column.id} isShadow={isShadowItem(task)} />
			</div>
		{/each}
	</div>
</Card>
