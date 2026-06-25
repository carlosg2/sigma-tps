<script lang="ts" module>
	import { tv, type VariantProps } from "tailwind-variants";

	export const tableVariants = tv({
		base: "w-full caption-bottom text-sm",
		variants: {
			// Compact rows: reduce vertical cell padding via descendant selectors.
			// Override the th's fixed `h-10` with `h-8` and shrink any inner header
			// trigger button (`h-8` by default) so the header is visibly compact too.
			dense: {
				true: "[&_td]:py-1 [&_th]:h-8 [&_th]:py-0 [&_th_button]:h-7"
			},
			// Zebra striping on body rows. A translucent overlay of the foreground
			// colour adapts to both light and dark themes (the theme's `muted` token
			// is too close to the background to be visible here).
			striped: {
				true: "[&_tbody_tr:nth-child(even)]:bg-foreground/5"
			},
			// Vertical borders between columns for a grid-like look.
			grid: {
				true: "[&_td]:border-l [&_th]:border-l [&_tr>*:first-child]:border-l-0"
			},
			// Full-bleed: edge cells lose their side padding so content reaches the edge.
			bleed: {
				true: "[&_td:first-child]:pl-0 [&_td:last-child]:pr-0 [&_th:first-child]:pl-0 [&_th:last-child]:pr-0"
			}
		},
		defaultVariants: {
			dense: false,
			striped: false,
			grid: false,
			bleed: false
		}
	});

	export type TableVariantProps = VariantProps<typeof tableVariants>;
</script>

<script lang="ts">
	import type { HTMLTableAttributes } from "svelte/elements";
	import { cn, type WithElementRef } from "$lib/utils.js";

	let {
		ref = $bindable(null),
		class: className,
		children,
		dense = false,
		striped = false,
		grid = false,
		bleed = false,
		height,
		...restProps
	}: WithElementRef<HTMLTableAttributes> &
		TableVariantProps & {
			/** Constrain the table to a fixed height and make it vertically scrollable. */
			height?: string;
		} = $props();
</script>

<div
	data-slot="table-container"
	class={cn("relative w-full overflow-x-auto", height && "overflow-y-auto")}
	style={height ? `height: ${height};` : undefined}
>
	<table
		bind:this={ref}
		data-slot="table"
		class={cn(
			tableVariants({ dense, striped, grid, bleed }),
			// In a fixed-height (scrollable) table we switch to `border-separate` so the
			// sticky header works; that mode does not paint `<tr>` borders, so restore
			// the horizontal row separators on the body cells instead.
			height && "border-separate border-spacing-0 [&_tbody_td]:border-b",
			className
		)}
		{...restProps}
	>
		{@render children?.()}
	</table>
</div>
