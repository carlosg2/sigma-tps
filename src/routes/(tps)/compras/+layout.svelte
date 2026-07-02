<script lang="ts">
	import { setComprasStore } from '$lib/tps/compras/store.svelte.js';

	let { children } = $props();

	setComprasStore();
</script>

{@render children()}
