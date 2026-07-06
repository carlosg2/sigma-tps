<script lang="ts">
	import { appState } from '../state.svelte.js';
	import FileTreeItem from './FileTreeItem.svelte';

	const rootIds = $derived(appState.getChildren(null));
</script>

<div class="py-1">
	{#each rootIds as id (id)}
		<FileTreeItem {id} depth={0} />
	{/each}
</div>
