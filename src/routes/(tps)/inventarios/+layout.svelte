<script lang="ts">
	import { setInventariosStore } from '$lib/tps/inventarios/store.svelte.js';

	let { children } = $props();

	setInventariosStore();
</script>

{@render children()}
