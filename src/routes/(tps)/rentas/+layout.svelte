<script lang="ts">
	import { setRentasStore } from '$lib/tps/rentas/store.svelte.js';

	let { children } = $props();

	setRentasStore();
</script>

{@render children()}
