<script lang="ts">
	import { setFinanzasStore } from '$lib/tps/finanzas/store.svelte.js';

	let { children } = $props();

	setFinanzasStore();
</script>

{@render children()}
