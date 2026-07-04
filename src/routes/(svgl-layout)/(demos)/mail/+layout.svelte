<script lang="ts">
	import * as Sidebar from "$lib/components/ui/sidebar/index.js";
	import MailSidebar from "./_components/MailSidebar.svelte";

	let { children } = $props();
</script>

<div class="relative h-full">
	<Sidebar.Provider class="h-full min-h-0">
		<MailSidebar />
		<div class="size-full">{@render children()}</div>
	</Sidebar.Provider>
</div>
