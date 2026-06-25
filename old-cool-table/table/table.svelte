<script lang="ts">
	import type { HTMLTableAttributes } from "svelte/elements";
	import { cn, type WithElementRef } from "$lib/utils.js";
	import { setContext } from "svelte";
	import type { TableContext } from "./table-context";

	let {
		ref = $bindable(null),
		class: className,
		children,
		bleed = false,
		dense = false,
		grid = false,
		striped = false,
		height,
		...restProps
	}: WithElementRef<HTMLTableAttributes> & Partial<TableContext> & {
		height?: string;
	} = $props();

	// Create reactive table context to share state with child components
	let tableContext = $state({
		bleed,
		dense,
		grid,
		striped
	});
	
	// Update context when props change
	$effect(() => {
		tableContext.bleed = bleed;
		tableContext.dense = dense;
		tableContext.grid = grid;
		tableContext.striped = striped;
	});
	
	// Set context for child components
	setContext('TABLE_CONTEXT_KEY', tableContext);
</script>

<div class="flow-root">
	<div class={cn("overflow-x-auto whitespace-nowrap ", className)}>
		<div 
			data-slot="table" 
			class={cn(
				"inline-block min-w-full align-middle",
				!bleed && "sm:px-[--gutter]",
				"relative w-full overflow-x-auto",
				height && "overflow-y-auto"
			)}
			style={height ? `height: ${height};` : undefined}
		>
			<table 
				bind:this={ref}
				data-slot="table"
				class={cn(
					"min-w-full caption-bottom text-sm",
					height ? "border-separate border-spacing-0" : "border-collapse"
				)}
				{...restProps}
			>
				{@render children?.()}
			</table>
		</div>
	</div>
</div>
