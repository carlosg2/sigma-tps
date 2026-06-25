<script lang="ts">
	import { cn, type WithElementRef } from "$lib/utils.js";
	import type { HTMLAttributes } from "svelte/elements";
	import { getTableContext } from "./table-context";

	let {
		ref = $bindable(null),
		class: className,
		children,
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLTableSectionElement>> = $props();

	const tableContext = getTableContext();
</script>

<tbody
	bind:this={ref}
	data-slot="table-body"
	class={cn(className)}
	{...restProps}
>
	{@render children?.()}
</tbody>
