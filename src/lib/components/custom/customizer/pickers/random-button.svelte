<script lang="ts">
	import { Button } from "$lib/components/ui/button/index.js";
	import { useDesignSystem } from "$lib/ds/index.js";
	import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js";
	import ShuffleIcon from "@lucide/svelte/icons/shuffle";

	type Props = { submenu?: boolean };
	let { submenu = false }: Props = $props();

	const designSystem = useDesignSystem();
</script>

{#if submenu}
	<DropdownMenu.Item
		onSelect={designSystem.randomize}
		closeOnSelect={false}
		class="border-foreground/10 bg-muted/50 h-[calc(--spacing(13.5))] w-35 touch-manipulation justify-between rounded-xl border select-none focus-visible:border-transparent focus-visible:ring-1 sm:rounded-lg md:w-full md:rounded-lg md:border-transparent md:bg-transparent md:pr-3.5! md:pl-2!"
	>
		<div class="flex flex-col justify-start text-left">
			<div class="text-muted-foreground text-xs">Aleatorio</div>
			<div class="text-foreground text-sm font-medium">Probar aleatorio</div>
		</div>
		<ShuffleIcon class="size-4" />
	</DropdownMenu.Item>
{:else}
	<Button
		variant="outline"
		onclick={designSystem.randomize}
		class="hover:bg-muted! flex-1 touch-manipulation bg-transparent! px-2! py-0! text-sm! transition-none select-none md:flex-none pointer-coarse:h-10!"
	>
		<ShuffleIcon class="size-4" />
		<span class="w-full text-center font-medium">Aleatorio</span>
	</Button>
{/if}
