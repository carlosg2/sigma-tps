<script lang="ts">
	import { cn, type WithElementRef } from "$lib/utils.js";
	import type { HTMLAttributes } from "svelte/elements";

	let {
		ref = $bindable(null),
		class: className,
		children,
		sticky = false,
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLTableSectionElement>> & {
		/** Stick the footer to the bottom while the table body scrolls. */
		sticky?: boolean;
	} = $props();
</script>

<tfoot
	bind:this={ref}
	data-slot="table-footer"
	class={cn(
		"bg-muted/50 border-t font-medium [&>tr]:last:border-b-0",
		sticky && "[&_td]:bg-background sticky bottom-0 z-10 [&_td]:border-t",
		className
	)}
	{...restProps}
>
	{@render children?.()}
</tfoot>
