<script lang="ts">
	import { Button } from "$lib/components/ui/button/index.js";
	import { Separator } from "$lib/components/ui/separator/index.js";
	import * as Sidebar from "$lib/components/ui/sidebar/index.js";
	import { RefreshCcw } from "@lucide/svelte";
	import MobileNav from "$lib/components/shell/mobile-nav.svelte";
	import HueControls from "$lib/components/shell/hue-controls.svelte";
	import ThemeSelector from "$lib/components/shell/theme-selector.svelte";
</script>

<header
	class="h-(--header-height) sticky top-0 rounded-t-3xl bg-background/40 backdrop-blur-lg z-50 group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height) flex shrink-0 items-center gap-2 border-b-[.5px] transition-[width,height] ease-linear"
>
	<div class="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
		<Sidebar.Trigger class="-ml-1" />
		<!-- <MobileNav class="md:hidden"/> -->
		<!-- <Sidebar.Trigger class="-ml-1 hidden md:flex" /> -->
		<Separator orientation="vertical" class="mx-2 data-[orientation=vertical]:h-4" />
		<!-- <h1 class="text-base font-medium">Documento</h1> -->
		<div class="ml-auto flex items-center gap-2">
			<Button
				
				variant="ghost"
				size="sm"
				class="dark:text-foreground hidden sm:flex"
				target="_blank"
				rel="noopener noreferrer"
			>
				<RefreshCcw class="size-4" />
			</Button>

				<!-- <ThemeSelector class="mr-4 " />

				<HueControls  /> -->
		</div>
	</div>
</header>
