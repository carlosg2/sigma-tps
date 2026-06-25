<script lang="ts">
	import { cn, type WithElementRef } from "$lib/utils.js";
	import type { HTMLThAttributes } from "svelte/elements";
	import { getTableContext } from "./table-context";

	let {
		ref = $bindable(null),
		class: className,
		children,
		...restProps
	}: WithElementRef<HTMLThAttributes> = $props();

	const tableContext = getTableContext();
</script>

<th
	bind:this={ref}
	data-slot="table-head"
	class={cn(
		"text-muted-foreground/70 h-10 whitespace-nowrap bg-clip-padding px-2 text-left align-middle font-medium [&:has([role=checkbox])]:pr-0",
		"border-b border-b-zinc-950/10 py-2 first:pl-[var(--gutter,theme(spacing.2))] last:pr-[var(--gutter,theme(spacing.2))] dark:border-b-white/10",
		tableContext?.grid && "border-l border-l-zinc-950/5 first:border-l-0 dark:border-l-white/5",
		!tableContext?.bleed && "sm:first:pl-0 sm:last:pr-0",
		"",
		className
	)}
	{...restProps}
>
	{@render children?.()}
</th>
