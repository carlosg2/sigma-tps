<script lang="ts">
	import { setTpsStore } from '$lib/tps/store.svelte.js';
	import AppSidebar from '$lib/tps/components/app-sidebar.svelte';
	import Header from '$lib/tps/components/header.svelte';

	let { children } = $props();

	setTpsStore();
</script>

<div class="flex h-screen overflow-hidden">
	<AppSidebar />
	<div class="flex flex-1 flex-col overflow-hidden">
		<Header />
		<main class="flex-1 overflow-y-auto p-6">
			{@render children()}
		</main>
	</div>
</div>
