<script lang="ts">
	import * as Sidebar from "$lib/components/ui/sidebar/index.js";
	import AppSidebar from "$lib/components/shell/app-sidebar.svelte";
	import SiteHeader from "$lib/components/shell/site-header.svelte";
/* 	import DocsSidebar from "$lib/components/shell/docs-sidebar.svelte"; */
	import SidebarDebug from "$lib/components/shell/sidebar-debug.svelte";
	import { sidebarNavItems } from "$lib/components/shell/navigation.js";

	let { children } = $props();
	
	// Sidebar cerrado por defecto
	let sidebarOpen = $state(false);
</script>

<Sidebar.Provider bind:open={sidebarOpen} style="--sidebar-width: calc(var(--spacing) * 72); --header-height: calc(var(--spacing) * 16);" >
	<AppSidebar variant="inset" />
	{@const sidebar = Sidebar.useSidebar()}
	<!-- {@const debugInfo = {
		open: sidebar.open,
		isMobile: sidebar.isMobile,
		state: sidebar.state,
		openMobile: sidebar.openMobile
	}} -->
	<!-- <DocsSidebar navItems={sidebarNavItems} /> -->

	<Sidebar.Inset class="md:border md:border-border">
		<SiteHeader />
		<!-- <SidebarDebug /> -->
		<!-- <HeaderNav bind:y /> -->
		 <!-- {JSON.stringify(debugInfo, null, 2)} -->
		 

		<main class="transform-origin-top-left overflow-x-auto box-border md:w-[calc(100vw-(--spacing(74)))] md:data-[sidebar-state=collapsed]:w-[calc(100vw-5rem)]" data-sidebar-state={sidebar.state}>
			 <!-- style="width: calc(100vw - calc(0.25rem * 72));" -->
		{@render children()}
		</main>

	</Sidebar.Inset>

</Sidebar.Provider>






