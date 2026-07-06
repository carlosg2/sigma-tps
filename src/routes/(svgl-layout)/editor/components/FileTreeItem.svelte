<script lang="ts">
	import ChevronRight from '@lucide/svelte/icons/chevron-right';
	import ChevronDown from '@lucide/svelte/icons/chevron-down';
	import Folder from '@lucide/svelte/icons/folder';
	import FolderOpen from '@lucide/svelte/icons/folder-open';
	import { appState, type FileId } from '../state.svelte.js';
	import { getFileIcon } from '../file-icons.js';
	import { cn } from '$lib/utils.js';
	// eslint-disable-next-line import/no-self-import
	import FileTreeItem from './FileTreeItem.svelte';

	let { id, depth = 0 }: { id: FileId; depth?: number } = $props();

	const INDENT = 1; // px por nivel de profundidad

	const row = $derived(appState.getFile(id));
	const isFolder = $derived(row?.type === 'folder');
	const isExpanded = $derived(appState.isExpanded(id));
	const isSelected = $derived(appState.activeFileId === id);
	const children = $derived(isFolder ? appState.getChildren(id) : []);
</script>

{#if row}
	{#if isFolder}
		<div class="text-xs">
			<button
				class={cn(
					'flex w-full cursor-pointer items-center gap-1 rounded-sm px-2 py-1 text-left hover:bg-accent hover:text-accent-foreground',
					isSelected && 'bg-accent text-accent-foreground'
				)}
				style="padding-left: {depth * INDENT + 8}px"
				onclick={() => appState.toggleExpand(id)}
				type="button"
			>
				<span class="">
					{#if isExpanded}
						<ChevronDown class="size-3" />
					{:else}
						<ChevronRight class="size-3" />
					{/if}
				</span>
				{#if isExpanded}
					<FolderOpen class="size-3.5 shrink-0" />
				{:else}
					<Folder class="size-3.5 shrink-0" />
				{/if}
				<span class="truncate">{row.name}</span>
			</button>
			{#if isExpanded}
				<div class="border-l border-border" style="margin-left: {depth * INDENT + 14}px">
					{#each children as childId (childId)}
						<FileTreeItem id={childId} depth={depth + 1} />
					{/each}
				</div>
			{/if}
		</div>
	{:else}
		{@const Icon = getFileIcon(row.name)}
		<button
			class={cn(
				'flex w-full cursor-pointer items-center gap-1.5 rounded-sm px-2 py-1 text-left text-xs hover:bg-accent hover:text-accent-foreground rounded-l-none!',
				isSelected && 'bg-accent text-accent-foreground'
			)}
			style="padding-left: {depth * INDENT + 8 + 16}px"
			onclick={() => appState.selectFile(id)}
			type="button"
		>
			<Icon class="size-3.5 shrink-0" />
			<span class="truncate">{row.name}</span>
		</button>
	{/if}
{/if}
