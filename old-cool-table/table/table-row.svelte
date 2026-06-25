<script lang="ts">
	import { cn, type WithElementRef } from "$lib/utils.js";
	import type { HTMLAttributes } from "svelte/elements";
	import { getTableContext } from "./table-context";
	import { setContext } from "svelte";

	interface RowContext {
		href?: string;
		target?: string;
		title?: string;
	}

	let {
		ref = $bindable(null),
		class: className,
		children,
		href = undefined,
		target = undefined,
		title = undefined,
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLTableRowElement>> & RowContext = $props();

	const tableContext = getTableContext();
	setContext<RowContext>('tableRow', { href, target, title });
</script>

<tr
	bind:this={ref}
	data-slot="table-row"
	class={cn(
		"hover:[&,&>svelte-css-wrapper]:[&>th,td]:bg-muted/50 data-[state=selected]:bg-muted transition-colors hover:bg-muted/50 ",
		href && "focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-blue-500 dark:focus-visible:bg-white/[2.5%]",
		tableContext?.striped && [
			"hover:bg-zinc-950/[2.5%] dark:hover:bg-white/[2.5%]",
			"even:bg-zinc-950/[2.5%] dark:even:bg-white/[2.5%]",
		],
		!tableContext?.striped && "hover:bg-zinc-950/[2.5%] dark:hover:bg-white/[2.5%]",
		className
	)}
	{...restProps}
>
	{@render children?.()}
</tr>
