<script lang="ts">
	import { appState } from '../state.svelte.js';

	const crumbs = $derived(appState.activeBreadcrumbs);
</script>

{#if crumbs.length > 0}
	<nav class="flex items-center gap-1 px-4 py-1.5 text-xs text-muted-foreground border-b">
		{#each crumbs as crumb, i (i)}
			{#if i < crumbs.length - 1}
				<span class="hover:text-foreground transition-colors">{crumb}</span>
				<span class="select-none">/</span>
			{:else}
				<span class="text-foreground font-medium">{crumb}</span>
			{/if}
		{/each}
	</nav>
{/if}
