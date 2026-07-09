<script lang="ts">
	import { useSidebar } from "$lib/components/ui/sidebar/index.js";
	import { cn } from "$lib/utils.js";

	let { class: className }: { class?: string } = $props();

	const sidebar = useSidebar();
</script>

<!-- Lee el estado en vivo del Sidebar mediante `useSidebar` (debe vivir dentro del Provider) -->
<div
	class={cn(
		"text-muted-foreground hidden items-center gap-2 text-[11px] font-medium sm:flex",
		className
	)}
>
	<span
		class={cn(
			"inline-flex items-center gap-1 rounded-full border px-2 py-0.5",
			sidebar.state === "expanded"
				? "border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
				: "border-amber-500/30 text-amber-600 dark:text-amber-400"
		)}
	>
		<span
			class={cn(
				"size-1.5 rounded-full",
				sidebar.state === "expanded" ? "bg-emerald-500" : "bg-amber-500"
			)}
		></span>
		{sidebar.state}
	</span>
	<span class="bg-muted rounded-full px-2 py-0.5">
		{sidebar.isMobile ? "mobile" : "desktop"}
	</span>
	<kbd
		class="bg-muted hidden rounded px-1.5 py-0.5 font-mono text-[10px] md:inline-block"
	>
		⌘B
	</kbd>
</div>
