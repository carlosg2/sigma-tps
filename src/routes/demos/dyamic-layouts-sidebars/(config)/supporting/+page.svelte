<script lang="ts">
	import { cn } from "$lib/utils.js";
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
  Supporting pane (Material 3 · canonical B)
  · Focus pane (primary): flexible, ocupa la mayor parte y fluye con el <body>.
  · Supporting pane: ancho fijo, sticky con scroll propio en pantallas anchas.
  · En pantallas medias/compactas el supporting pane se apila debajo del focus.
-->
<div class="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_340px]">
	<!-- Focus / primary pane -->
	<main class="flex min-w-0 flex-col gap-4 p-4 md:p-6">
		<!-- Métricas -->
		<div class="grid grid-cols-2 gap-4 md:grid-cols-4">
			{#each Array(4) as _, i (i)}
				<div class="bg-card flex flex-col gap-2 rounded-xl border p-4">
					{@render line("w-1/2", "h-2.5")}
					{@render line("w-3/4", "h-7")}
					{@render line("w-1/3", "h-2.5")}
				</div>
			{/each}
		</div>

		<!-- Gráfico -->
		<div class="bg-card flex flex-col gap-4 rounded-xl border p-4">
			<div class="flex items-center justify-between">
				{@render line("w-40", "h-4")}
				<div class="flex gap-2">
					<div class="bg-muted h-7 w-16 rounded-md"></div>
					<div class="bg-muted h-7 w-16 rounded-md"></div>
				</div>
			</div>
			<div class="bg-muted/50 h-72 w-full rounded-lg"></div>
		</div>

		<!-- Tabla con encabezado sticky (bajo el app bar) -->
		<div class="bg-card overflow-hidden rounded-xl border">
			<div
				class="bg-background/85 sticky top-16 z-10 flex items-center gap-4 border-b px-4 py-2.5 backdrop-blur"
			>
				{@render line("w-1/4", "h-2.5")}
				{@render line("w-1/4", "h-2.5")}
				{@render line("w-1/5", "h-2.5")}
				<div class="ml-auto">{@render line("w-16", "h-2.5")}</div>
			</div>
			{#each Array(16) as _, i (i)}
				<div class="flex items-center gap-4 border-b px-4 py-3 last:border-0">
					<div class="bg-muted size-8 shrink-0 rounded-full"></div>
					{@render line("w-1/4", "h-2.5")}
					{@render line("w-1/3", "h-2.5")}
					<div class="ml-auto">{@render line("w-16", "h-2.5")}</div>
				</div>
			{/each}
		</div>
	</main>

	<!-- Supporting pane -->
	<aside
		class="flex flex-col gap-4 border-t p-4 xl:sticky xl:top-16 xl:h-[calc(100svh-4rem)] xl:overflow-y-auto xl:border-t-0 xl:border-l"
	>
		<div class="flex items-center justify-between">
			{@render line("w-28", "h-4")}
			<div class="bg-muted size-7 rounded-full"></div>
		</div>
		{#each Array(6) as _, i (i)}
			<div class="bg-card flex flex-col gap-3 rounded-xl border p-4">
				<div class="flex items-center gap-3">
					<div class="bg-muted size-8 shrink-0 rounded-full"></div>
					<div class="flex flex-1 flex-col gap-1.5">
						{@render line("w-1/2", "h-2.5")}
						{@render line("w-1/3", "h-2.5")}
					</div>
				</div>
				{@render paragraph(3)}
			</div>
		{/each}
	</aside>
</div>
