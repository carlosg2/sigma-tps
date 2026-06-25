<script lang="ts">
	import { cn, type WithElementRef } from "$lib/utils.js";
	import type { HTMLAttributes } from "svelte/elements";
	import { setRowLink } from "./row-link-context.js";

	let {
		ref = $bindable(null),
		class: className,
		children,
		href,
		target,
		title,
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLTableRowElement>> & {
		/** Make the whole row a clickable link (overlay anchor rendered in each cell). */
		href?: string;
		target?: string;
		title?: string;
	} = $props();

	// Always set context so getters stay reactive to prop changes.
	setRowLink({
		get href() {
			return href;
		},
		get target() {
			return target;
		},
		get title() {
			return title;
		}
	});
</script>

<tr
	bind:this={ref}
	data-slot="table-row"
	class={cn(
		"hover:bg-muted/50 data-[state=selected]:bg-muted border-b transition-colors",
		href && "focus-within:bg-muted/50 cursor-pointer",
		className
	)}
	{...restProps}
>
	{@render children?.()}
</tr>
