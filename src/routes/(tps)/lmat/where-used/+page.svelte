<script lang="ts">
	import { useStore } from '$lib/tps/store.svelte.js';
	import {
		UDM_LABELS,
		ARMOR_LEVEL_LABELS,
		BOM_STATUS_LABELS,
		BOM_STATUS_COLORS
	} from '$lib/tps/constants.js';
	import StatusBadge from '$lib/tps/components/status-badge.svelte';
	import Search from '@lucide/svelte/icons/search';
	import ArrowLeft from '@lucide/svelte/icons/arrow-left';

	const store = useStore();
	const app = $derived(store.state);

	let query = $state('');
	let selectedArticleId = $state<string | null>(null);

	const matchingArticles = $derived.by(() => {
		if (!query || query.length < 2) return [];
		return app.articles
			.filter((a) => `${a.code} ${a.description}`.toLowerCase().includes(query.toLowerCase()))
			.slice(0, 10);
	});

	const selectedArticle = $derived(app.articles.find((a) => a.id === selectedArticleId));

	const whereUsed = $derived.by(() => {
		if (!selectedArticleId) return [];
		return app.boms
			.filter((b) => b.components.some((c) => c.articleId === selectedArticleId))
			.map((bom) => {
				const comp = bom.components.find((c) => c.articleId === selectedArticleId)!;
				return { bom, comp };
			});
	});
</script>

<div class="flex max-w-4xl flex-col gap-6">
	<div class="flex items-center gap-3">
		<a
			href="/lmat/boms"
			class="border-border hover:bg-secondary flex h-8 w-8 items-center justify-center rounded-md border transition-colors"
		>
			<ArrowLeft class="text-foreground h-4 w-4" />
		</a>
		<div>
			<h1 class="text-foreground text-xl font-bold">Where-Used (Donde se usa)</h1>
			<p class="text-muted-foreground text-sm">Busca un articulo para ver en que BOMs aparece</p>
		</div>
	</div>

	<!-- Search -->
	<div class="border-border bg-card rounded-lg border p-4">
		<div class="border-border bg-secondary flex items-center gap-2 rounded-md border px-3 py-2">
			<Search class="text-muted-foreground h-4 w-4" />
			<input
				type="text"
				placeholder="Buscar articulo por codigo o descripcion..."
				bind:value={query}
				oninput={() => (selectedArticleId = null)}
				class="text-foreground placeholder:text-muted-foreground w-full border-none bg-transparent text-sm outline-none"
			/>
		</div>

		{#if matchingArticles.length > 0 && !selectedArticleId}
			<div class="border-border bg-secondary mt-2 flex flex-col overflow-hidden rounded-md border">
				{#each matchingArticles as a (a.id)}
					<button
						onclick={() => {
							selectedArticleId = a.id;
							query = a.code;
						}}
						class="hover:bg-accent border-border/30 flex items-center gap-3 border-b px-3 py-2 text-left transition-colors last:border-0"
					>
						<span class="text-primary font-mono text-xs">{a.code}</span>
						<span class="text-foreground truncate text-sm">{a.description}</span>
					</button>
				{/each}
			</div>
		{/if}
	</div>

	<!-- Results -->
	{#if selectedArticle}
		<div class="border-border bg-card rounded-lg border p-4">
			<div class="flex items-center justify-between">
				<div>
					<h3 class="text-card-foreground font-mono text-sm font-semibold">{selectedArticle.code}</h3>
					<p class="text-muted-foreground text-xs">{selectedArticle.description}</p>
				</div>
				<div class="text-right">
					<p class="text-card-foreground text-2xl font-bold">{whereUsed.length}</p>
					<p class="text-muted-foreground text-xs">BOMs que usan este articulo</p>
				</div>
			</div>
		</div>

		{#if whereUsed.length > 0}
			<div class="border-border bg-card overflow-hidden rounded-lg border">
				<table class="w-full text-sm">
					<thead>
						<tr class="border-border bg-secondary/50 border-b text-left">
							<th class="text-muted-foreground px-4 py-2 text-xs font-medium">Especificacion</th>
							<th class="text-muted-foreground px-4 py-2 text-xs font-medium">Modelo</th>
							<th class="text-muted-foreground px-4 py-2 text-xs font-medium">Nivel</th>
							<th class="text-muted-foreground px-4 py-2 text-xs font-medium">Estatus</th>
							<th class="text-muted-foreground px-4 py-2 text-right text-xs font-medium">Cantidad</th>
							<th class="text-muted-foreground px-4 py-2 text-xs font-medium">UdM</th>
							<th class="text-muted-foreground px-4 py-2 text-xs font-medium">Celda</th>
							<th class="text-muted-foreground px-4 py-2 text-xs font-medium">Operacion</th>
						</tr>
					</thead>
					<tbody>
						{#each whereUsed as { bom, comp } (bom.id)}
							<tr class="border-border/50 hover:bg-secondary/30 border-b transition-colors">
								<td class="px-4 py-2">
									<a href="/lmat/boms/{bom.id}" class="text-primary font-mono text-xs hover:underline">{bom.specificationCode}</a>
								</td>
								<td class="text-card-foreground px-4 py-2">{bom.vehicleModel}</td>
								<td class="text-muted-foreground px-4 py-2 text-xs">{ARMOR_LEVEL_LABELS[bom.armorLevel]}</td>
								<td class="px-4 py-2">
									<StatusBadge label={BOM_STATUS_LABELS[bom.status]} colorClass={BOM_STATUS_COLORS[bom.status]} />
								</td>
								<td class="text-card-foreground px-4 py-2 text-right font-mono">{comp.quantity}</td>
								<td class="text-muted-foreground px-4 py-2 text-xs">{UDM_LABELS[comp.udm]}</td>
								<td class="text-muted-foreground px-4 py-2 text-xs">{comp.cell}</td>
								<td class="text-muted-foreground px-4 py-2 text-xs">{comp.operation || '---'}</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{:else}
			<div class="border-border bg-card text-muted-foreground rounded-lg border px-4 py-8 text-center text-sm">
				Este articulo no aparece en ningun BOM.
			</div>
		{/if}
	{/if}
</div>
