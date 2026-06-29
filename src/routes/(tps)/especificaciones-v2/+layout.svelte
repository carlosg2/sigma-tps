<script lang="ts">
	import { setSpecV2Store } from '$lib/tps/spec-v2/store.svelte.js';

	let { children } = $props();

	setSpecV2Store();
</script>

{@render children()}
