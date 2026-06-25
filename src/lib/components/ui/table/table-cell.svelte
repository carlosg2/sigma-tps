<script lang="ts">
	import { cn, type WithElementRef } from "$lib/utils.js";
	import type { HTMLTdAttributes } from "svelte/elements";
	import { getRowLink } from "./row-link-context.js";

	let {
		ref = $bindable(null),
		class: className,
		children,
		...restProps
	}: WithElementRef<HTMLTdAttributes> = $props();

	const rowLink = getRowLink();
</script>

<td
	bind:this={ref}
	data-slot="table-cell"
	class={cn(
		"p-2 align-middle whitespace-nowrap has-[[role=checkbox]]:pr-0",
		rowLink && "relative",
		className
	)}
	{...restProps}
>
	{#if rowLink?.href}
		<a
			href={rowLink.href}
			target={rowLink.target}
			aria-label={rowLink.title}
			tabindex={-1}
			class="absolute inset-0 focus:outline-none"
		></a>
	{/if}
	{@render children?.()}
</td>
