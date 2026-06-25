<script lang="ts">
	import { cn } from "$lib/utils.js";
	import { DropdownMenu as DropdownMenuPrimitive } from "bits-ui";

	let {
		ref = $bindable(null),
		sideOffset = 20,
		class: className,
		submenu = false,
		...restProps
	}: DropdownMenuPrimitive.ContentProps & { submenu?: boolean } = $props();
</script>

{#if submenu}
	<DropdownMenuPrimitive.Portal>
		<DropdownMenuPrimitive.SubContent
			bind:ref
			data-slot="picker-sub-content"
			{sideOffset}
			class={cn(
				"no-scrollbar z-50 max-h-(--available-height) w-auto min-w-24 origin-(--transform-origin) overflow-x-hidden overflow-y-auto rounded-xl border-0 bg-neutral-950/80 p-1.5 text-neutral-100 ring-1 ring-neutral-950/80 backdrop-blur-xl outline-none data-[state=closed]:overflow-hidden dark:bg-neutral-800/90 dark:ring-neutral-700/50",
				className
			)}
			{...restProps}
		/>
	</DropdownMenuPrimitive.Portal>
{:else}
	<DropdownMenuPrimitive.Portal>
		<DropdownMenuPrimitive.Content
			bind:ref
			data-slot="picker-content"
			{sideOffset}
			class={cn(
				"no-scrollbar z-50 max-h-(--available-height) min-w-32 origin-(--transform-origin) translate-y-2 overflow-x-hidden overflow-y-auto rounded-xl border-0 bg-neutral-950/80 p-1.5 text-neutral-100 ring-1 ring-neutral-950/80 backdrop-blur-xl outline-none data-[state=closed]:overflow-hidden md:w-52 dark:bg-neutral-800/90 dark:ring-neutral-700/50",
				className
			)}
			{...restProps}
		/>
	</DropdownMenuPrimitive.Portal>
{/if}
