<script lang="ts">
	import type { TreeNode, BomTreeController } from './bom-tree-controller.svelte.js';
	import { UDM_LABELS } from '$lib/tps/constants.js';
	import { cn } from '$lib/utils.js';
	import Self from './bom-tree-node.svelte';
	import ChevronRight from '@lucide/svelte/icons/chevron-right';
	import ChevronDown from '@lucide/svelte/icons/chevron-down';
	import GripVertical from '@lucide/svelte/icons/grip-vertical';
	import Package from '@lucide/svelte/icons/package';
	import Boxes from '@lucide/svelte/icons/boxes';
	import AlertTriangle from '@lucide/svelte/icons/triangle-alert';
	import CheckCircle2 from '@lucide/svelte/icons/circle-check-big';

	let {
		node,
		depth,
		ctrl,
		cells = [],
		onCellChange
	}: { node: TreeNode; depth: number; ctrl: BomTreeController; cells?: string[]; onCellChange?: (componentId: string, cell: string) => void } = $props();

	const hasChildren = $derived(node.children.length > 0 || node.isKit);
	const isExpanded = $derived(ctrl.expanded.has(node.id));
	const isDragging = $derived(ctrl.draggedId === node.id);
	const isDropTarget = $derived(ctrl.dragOverId === node.id);
</script>

<div class="select-none">
	<div
		draggable={!ctrl.readOnly}
		role="treeitem"
		aria-selected={isDragging}
		tabindex="-1"
		ondragstart={() => ctrl.dragStart(node.id)}
		ondragover={(e) => ctrl.dragOver(e, node.id)}
		ondragend={() => ctrl.dragEnd()}
		ondrop={() => ctrl.drop(node.id)}
		class={cn(
			'group flex items-center gap-1 rounded-md px-2 py-1.5 transition-colors',
			isDragging && 'opacity-50',
			isDropTarget && ctrl.dragPosition === 'before' && 'border-primary border-t-2',
			isDropTarget && ctrl.dragPosition === 'after' && 'border-primary border-b-2',
			isDropTarget && ctrl.dragPosition === 'inside' && 'bg-primary/10 ring-primary ring-1',
			!isDragging && !isDropTarget && 'hover:bg-secondary/50'
		)}
		style="padding-left: {depth * 20 + 8}px"
	>
		<!-- Drag handle -->
		{#if !ctrl.readOnly}
			<GripVertical
				class="text-muted-foreground h-3.5 w-3.5 cursor-grab opacity-0 transition-opacity group-hover:opacity-100"
			/>
		{/if}

		<!-- Expand/collapse -->
		{#if hasChildren}
			<button
				onclick={() => ctrl.toggle(node.id)}
				class="hover:bg-secondary flex h-5 w-5 items-center justify-center rounded"
			>
				{#if isExpanded}
					<ChevronDown class="text-muted-foreground h-3.5 w-3.5" />
				{:else}
					<ChevronRight class="text-muted-foreground h-3.5 w-3.5" />
				{/if}
			</button>
		{:else}
			<span class="w-5"></span>
		{/if}

		<!-- Icon -->
		{#if node.isKit}
			<Boxes class="text-primary h-4 w-4 shrink-0" />
		{:else}
			<Package class="text-muted-foreground h-4 w-4 shrink-0" />
		{/if}

		<!-- Content -->
		<div class="flex min-w-0 flex-1 items-center gap-3">
			{#if node.isKit}
				<span class="text-foreground truncate text-sm font-medium">{node.articleDescription}</span>
			{:else}
				<a
					href="/articulos/{node.articleId}"
					class="text-primary shrink-0 font-mono text-xs hover:underline"
					onclick={(e) => e.stopPropagation()}
				>
					{node.articleCode}
				</a>
				<span class="text-foreground truncate text-sm">{node.articleDescription}</span>
			{/if}
		</div>

		<!-- Quantity + UdM -->
		{#if !node.isKit}
			<div class="flex shrink-0 items-center gap-2">
				<span class="text-muted-foreground w-12 text-right font-mono text-xs">{node.quantity}</span>
				<span class="text-muted-foreground w-16 text-xs">{UDM_LABELS[node.udm]}</span>
			</div>
		{/if}

		<!-- Cell -->
		{#if !node.isKit && !ctrl.readOnly && cells.length > 0 && onCellChange}
			<select
				value={node.cell}
				onclick={(e) => e.stopPropagation()}
				onchange={(e) => onCellChange(node.id, e.currentTarget.value)}
				class="border-border bg-background text-foreground w-20 shrink-0 rounded border px-1 py-0.5 text-xs"
			>
				{#each cells as c (c)}<option value={c}>{c}</option>{/each}
			</select>
		{:else}
			<span class="text-muted-foreground w-16 shrink-0 text-xs">{node.cell}</span>
		{/if}

		<!-- Data status -->
		{#if !node.isKit}
			<span class="shrink-0">
				{#if node.hasCompleteData}
					<CheckCircle2 class="h-3.5 w-3.5 text-emerald-400" />
				{:else}
					<AlertTriangle class="text-chart-4 h-3.5 w-3.5" />
				{/if}
			</span>
		{/if}
	</div>

	<!-- Children -->
	{#if hasChildren && isExpanded}
		<div>
			{#each node.children as child (child.id)}
				<Self node={child} depth={depth + 1} {ctrl} {cells} {onCellChange} />
			{/each}
		</div>
	{/if}
</div>
