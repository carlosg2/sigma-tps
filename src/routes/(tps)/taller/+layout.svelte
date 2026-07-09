<script lang="ts">
	import { setTallerStore } from '$lib/tps/taller/store.svelte.js';

	let { children } = $props();

	setTallerStore();
</script>
{@render children()}
