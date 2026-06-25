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
		/** Stick the header to the top while the table body scrolls. */
		sticky?: boolean;
	} = $props();
</script>

<thead
	bind:this={ref}
	data-slot="table-header"
	class={cn(
		"[&_tr]:border-b",
		sticky && "[&_th]:bg-background sticky top-0 z-10 [&_th]:border-b",
		className
	)}
	{...restProps}
>
	{@render children?.()}
</thead>
