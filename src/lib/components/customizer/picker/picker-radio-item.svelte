<script lang="ts">
	import { DropdownMenu as DropdownMenuPrimitive } from "bits-ui";
	import { cn } from "$lib/utils.js";
	import CheckIcon from "@lucide/svelte/icons/check";

	let {
		ref = $bindable(null),
		class: className,
		children: childrenProp,
		...restProps
	}: DropdownMenuPrimitive.RadioItemProps = $props();
</script>

<DropdownMenuPrimitive.RadioItem
	bind:ref
	data-slot="picker-radio-item"
	class={cn(
		"relative flex cursor-default items-center gap-2 rounded-lg py-1.5 pr-8 pl-2 text-sm font-medium outline-hidden select-none **:text-neutral-100 focus:bg-neutral-600 focus:text-neutral-100 focus:**:text-neutral-100 data-disabled:pointer-events-none data-disabled:opacity-50 data-inset:pl-8 dark:focus:bg-neutral-700/80 pointer-coarse:gap-3 pointer-coarse:py-2.5 pointer-coarse:pl-3 pointer-coarse:text-base [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
		className
	)}
	{...restProps}
>
	{#snippet children({ checked })}
		<span
			class="pointer-events-none absolute right-2 flex items-center justify-center"
			data-slot="picker-radio-item-indicator"
		>
			{#if checked}
				<CheckIcon class="size-4 pointer-coarse:size-5" />
			{/if}
		</span>
		{@render childrenProp?.({ checked })}
	{/snippet}
</DropdownMenuPrimitive.RadioItem>
