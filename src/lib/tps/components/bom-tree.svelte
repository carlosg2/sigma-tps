<script lang="ts">
	import type { BOMComponent } from '$lib/tps/types.js';
	import { BomTreeController, buildTree } from './bom-tree-controller.svelte.js';
	import BomTreeNode from './bom-tree-node.svelte';
	import Boxes from '@lucide/svelte/icons/boxes';
	import Package from '@lucide/svelte/icons/package';

	let {
		components,
		onReorder,
		readOnly = false,
		cells = [],
		onCellChange
	}: {
		components: BOMComponent[];
		onReorder: (components: BOMComponent[]) => void;
		readOnly?: boolean;
		cells?: string[];
		onCellChange?: (componentId: string, cell: string) => void;
	} = $props();

	const ctrl = new BomTreeController(() => components, onReorder, readOnly);
	const tree = $derived(buildTree(components));
</script>

<div class="flex flex-col gap-2">
	<!-- Toolbar -->
	<div class="flex items-center justify-between px-2">
		<div class="flex items-center gap-2">
			<button onclick={() => ctrl.expandAll()} class="text-muted-foreground hover:text-foreground text-xs">
				Expandir todo
			</button>
			<span class="text-muted-foreground">/</span>
			<button onclick={() => ctrl.collapseAll()} class="text-muted-foreground hover:text-foreground text-xs">
				Colapsar
			</button>
		</div>
		<div class="text-muted-foreground flex items-center gap-4 text-xs">
			<span class="flex items-center gap-1"><Boxes class="text-primary h-3 w-3" /> Kit</span>
			<span class="flex items-center gap-1"><Package class="h-3 w-3" /> Articulo</span>
		</div>
	</div>

	<!-- Header -->
	<div class="border-border text-muted-foreground flex items-center gap-1 border-b px-2 py-1 text-xs">
		<span style="width: 28px"></span>
		<span class="flex-1">Componente</span>
		<span class="w-12 text-right">Cant</span>
		<span class="w-16">UdM</span>
		<span class="w-16">Celda</span>
		<span class="w-4"></span>
	</div>

	<!-- Tree -->
	<div class="min-h-50">
		{#if tree.length > 0}
			{#each tree as node (node.id)}
				<BomTreeNode {node} depth={0} {ctrl} {cells} {onCellChange} />
			{/each}
		{:else}
			<div class="text-muted-foreground flex items-center justify-center py-8 text-sm">
				No hay componentes en este BOM
			</div>
		{/if}
	</div>
</div>
