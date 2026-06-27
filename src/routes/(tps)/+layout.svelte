<script lang="ts">
	import { setTpsStore } from '$lib/tps/store.svelte.js';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import AppSidebar from '$lib/tps/components/app-sidebar.svelte';
	import SiteHeader from '$lib/tps/components/site-header.svelte';

	let { children } = $props();

	setTpsStore();
</script>

<Sidebar.Provider
	style="--sidebar-width: calc(var(--spacing) * 64); --header-height: calc(var(--spacing) * 14);"
>
	<AppSidebar variant="inset" />
	<Sidebar.Inset>
		<SiteHeader />
		<main class="@container/main flex flex-1 flex-col gap-6 p-4 md:p-6">
			{@render children()}
		</main>
	</Sidebar.Inset>
</Sidebar.Provider>
