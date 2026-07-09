<script lang="ts">
	import { cn } from "$lib/utils.js";

	const groups = [
		{ label: "Today", count: 6 },
		{ label: "Yesterday", count: 5 },
		{ label: "Last week", count: 8 },
	];
	const selected = { group: 0, index: 1 };
</script>

{#snippet line(w: string, h = "h-3")}
	<div class={cn("bg-muted rounded-full", h, w)}></div>
{/snippet}

{#snippet paragraph(n: number)}
	<div class="flex flex-col gap-2">
		{#each Array(n) as _, i (i)}
			{@render line(i === n - 1 ? "w-2/3" : "w-full")}
		{/each}
	</div>
{/snippet}

<!--
  List-detail (Material 3 · canonical A)
  · Lista: pane de ancho fijo, sticky con scroll propio (patrón "sticky sidebar").
  · Detalle: pane flexible que fluye con el scroll del <body> (body scroll priority).
  · En compacto (<md) los panes se apilan verticalmente.
-->
<div class="grid grid-cols-1 md:grid-cols-[320px_minmax(0,1fr)]">
	<!-- List pane -->
	<aside
		class="flex flex-col border-b md:sticky md:top-16 md:h-[calc(100svh-4rem)] md:overflow-y-auto md:border-r md:border-b-0"
	>
		<div
			class="bg-background/80 sticky top-0 z-10 flex items-center justify-between border-b px-4 py-3 backdrop-blur"
		>
			{@render line("w-24", "h-4")}
			<div class="bg-muted size-7 rounded-full"></div>
		</div>
		{#each groups as group, gi (group.label)}
			<div
				class="bg-muted/40 text-muted-foreground sticky top-12.25 z-10 px-4 py-1.5 text-xs font-medium backdrop-blur"
			>
				{group.label}
			</div>
			{#each Array(group.count) as _, i (i)}
				<button
					type="button"
					class={cn(
						"flex items-center gap-3 border-b px-4 py-3 text-left last:border-0",
						gi === selected.group && i === selected.index
							? "bg-accent"
							: "hover:bg-muted/50"
					)}
				>
					<div class="bg-muted size-9 shrink-0 rounded-full"></div>
					<div class="flex flex-1 flex-col gap-1.5">
						{@render line("w-1/2", "h-2.5")}
						{@render line("w-4/5", "h-2.5")}
					</div>
				</button>
			{/each}
		{/each}
	</aside>

	<!-- Detail pane -->
	<section class="min-w-0">
		<div class="mx-auto flex max-w-3xl flex-col gap-6 p-5 md:p-8">
			<div class="flex items-center gap-4">
				<div class="bg-muted size-14 shrink-0 rounded-full"></div>
				<div class="flex flex-1 flex-col gap-2">
					{@render line("w-1/2", "h-5")}
					{@render line("w-1/3", "h-3")}
				</div>
			</div>

			<div class="bg-muted/50 aspect-16/7 w-full rounded-xl"></div>

			<div class="flex flex-col gap-3">
				{@render line("w-3/4", "h-6")}
				{@render paragraph(5)}
			</div>

			<div class="grid grid-cols-2 gap-4 sm:grid-cols-4">
				{#each Array(4) as _, i (i)}
					<div class="bg-muted/50 aspect-square rounded-lg"></div>
				{/each}
			</div>

			{@render paragraph(6)}
			<div class="bg-muted/50 h-56 w-full rounded-xl"></div>
			{@render paragraph(8)}
			<div class="bg-muted/50 h-40 w-full rounded-xl"></div>
			{@render paragraph(6)}
		</div>
	</section>
</div>
