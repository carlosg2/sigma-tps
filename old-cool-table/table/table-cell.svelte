<script lang="ts">
	import { cn, type WithElementRef } from "$lib/utils.js";
	import type { HTMLTdAttributes } from "svelte/elements";
	import { getTableContext } from "./table-context";
	import { getContext } from "svelte";

	let {
		ref = $bindable(null),
		class: className,
		children,
		...restProps
	}: WithElementRef<HTMLTdAttributes> = $props();

	const tableContext = getTableContext();
	const rowContext = getContext('tableRow') as { href?: string; target?: string; title?: string } | undefined;
</script>

<td
	bind:this={ref}
	data-slot="table-cell"
	class={cn(
		"relative px-2 first:pl-[var(--gutter,theme(spacing.6))] last:pr-[var(--gutter,theme(spacing.6))]",
		"border-b border-zinc-950/5 dark:border-white/5",
		"whitespace-nowrap bg-clip-padding align-middle [&:has([role=checkbox])]:pr-0",
		tableContext?.grid && "border-l border-l-zinc-950/5 first:border-l-0 dark:border-l-white/5",
		tableContext?.dense ? "py-1.5" : "py-4",
		!tableContext?.bleed && "sm:first:pl-0 sm:last:pr-0",
		className
	)}
	{...restProps}
>
	{#if rowContext?.href}
		<a
			data-row-link
			href={rowContext.href}
			target={rowContext.target}
			aria-label={rowContext.title}
			tabindex={-1}
			class="absolute inset-0 focus:outline-none"
		></a>
	{/if}
	{@render children?.()}
</td>
