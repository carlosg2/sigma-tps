<script lang="ts">
	import { cn } from "$lib/utils.js";

	const sections = [
		{ label: "Trending", heights: ["h-52", "h-72", "h-44", "h-64", "h-56", "h-80"] },
		{ label: "For you", heights: ["h-64", "h-48", "h-72", "h-52", "h-60", "h-44", "h-56", "h-72"] },
	];
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
  Feed (Material 3 · canonical C)
  · Un único pane flexible: composición en grilla que fluye con el scroll del <body>.
  · Sin panes secundarios: los encabezados de sección quedan sticky bajo el app bar.
  · Masonry con columnas CSS (break-inside-avoid) que se adapta al ancho disponible.
-->
<div class="p-4 md:p-6">
	{#each sections as section (section.label)}
		<div
			class="bg-background/85 sticky top-16 z-10 -mx-4 mb-4 flex items-center justify-between border-b px-4 py-3 backdrop-blur md:-mx-6 md:px-6"
		>
			{@render line("w-28", "h-4")}
			<div class="bg-muted h-7 w-16 rounded-full"></div>
		</div>
		<div class="columns-1 gap-4 sm:columns-2 lg:columns-3 2xl:columns-4">
			{#each section.heights as h, i (i)}
				<div class="mb-4 break-inside-avoid">
					<div class="bg-card overflow-hidden rounded-xl border">
						<div class={cn("bg-muted/50 w-full", h)}></div>
						<div class="flex flex-col gap-2.5 p-3">
							<div class="flex items-center gap-2">
								<div class="bg-muted size-6 shrink-0 rounded-full"></div>
								{@render line("w-1/3", "h-2.5")}
							</div>
							{@render paragraph(3)}
							<div class="mt-1 flex gap-2">
								<div class="bg-muted h-6 w-12 rounded-full"></div>
								<div class="bg-muted h-6 w-12 rounded-full"></div>
							</div>
						</div>
					</div>
				</div>
			{/each}
		</div>
	{/each}
</div>
