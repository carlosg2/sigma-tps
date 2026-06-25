<script lang="ts">
	import { Button } from "$lib/components/ui/button/index.js";
	import { useDesignSystem } from "$lib/ds/index.js";
	import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js";
	import Undo2Icon from "@lucide/svelte/icons/undo-2";

	type Props = { submenu?: boolean };
	let { submenu = false }: Props = $props();

	const designSystem = useDesignSystem();
</script>

{#if submenu}
	<DropdownMenu.Item
		onSelect={designSystem.reset}
		closeOnSelect={false}
		class="border-foreground/10 bg-muted/50 h-[calc(--spacing(13.5))] w-35 touch-manipulation justify-between rounded-xl border select-none focus-visible:border-transparent focus-visible:ring-1 sm:rounded-lg md:w-full md:rounded-lg md:border-transparent md:bg-transparent md:pr-3.5! md:pl-2!"
	>
		<div class="flex flex-col justify-start text-left">
			<div class="text-muted-foreground text-xs">Reset</div>
			<div class="text-foreground text-sm font-medium">Start Over</div>
		</div>
		<Undo2Icon class="size-4" />
	</DropdownMenu.Item>
{:else}
	<Button
		variant="ghost"
		size="sm"
		onclick={designSystem.reset}
		class="border-foreground/10 bg-muted/50 h-[calc(--spacing(13.5))] w-35 touch-manipulation justify-between rounded-xl border select-none focus-visible:border-transparent focus-visible:ring-1 sm:rounded-lg md:flex-none md:border-transparent md:bg-transparent md:pr-3.5! md:pl-2!"
	>
		<div class="flex flex-col justify-start text-left">
			<div class="text-muted-foreground text-xs">Reset</div>
			<div class="text-foreground text-sm font-medium">Start Over</div>
		</div>
		<Undo2Icon class="size-4" />
	</Button>
{/if}
