<script lang="ts">
	import * as Sidebar from "$lib/components/ui/sidebar/index.js";
	
	const sidebar = Sidebar.useSidebar();
	
	// Create reactive derived values to force updates
	let debugInfo = $derived({
		open: sidebar.open,
		isMobile: sidebar.isMobile,
		state: sidebar.state,
		openMobile: sidebar.openMobile
	});
</script>

<div class="p-2 bg-background text-xs font-mono border border-border rounded">
	<details>
		<summary class="cursor-pointer hover:bg-muted p-1 rounded">Sidebar Debug Info</summary>
		<div class="mt-2">
			<pre>{JSON.stringify(debugInfo, null, 2)}</pre>
			<div class="mt-2 space-y-1">
				<button 
					type="button"
					onclick={() => sidebar.toggle()}
					class="px-2 py-1 bg-primary text-primary-foreground rounded text-xs"
				>
					Toggle Sidebar
				</button>
				<button 
					type="button"
					onclick={() => sidebar.setOpenMobile(!sidebar.openMobile)}
					class="px-2 py-1 bg-secondary text-secondary-foreground rounded text-xs ml-2"
				>
					Toggle Mobile
				</button>
			</div>
		</div>
	</details>
</div>
