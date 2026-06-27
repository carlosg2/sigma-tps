<script lang="ts">
	import { useStore } from '$lib/tps/store.svelte.js';
	import {
		UDM_LABELS,
		ARMOR_LEVEL_LABELS,
		BOM_STATUS_LABELS,
		BOM_STATUS_COLORS
	} from '$lib/tps/constants.js';
	import StatusBadge from '$lib/tps/components/status-badge.svelte';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Table from '$lib/components/ui/table/index.js';
	import * as Empty from '$lib/components/ui/empty/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import Search from '@lucide/svelte/icons/search';
	import ArrowLeft from '@lucide/svelte/icons/arrow-left';
	import PackageSearch from '@lucide/svelte/icons/package-search';

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

<div class="mx-auto flex w-full max-w-4xl flex-col gap-6">
	<div class="flex items-center gap-3">
		<Button href="/lmat/boms" variant="outline" size="icon">
			<ArrowLeft />
		</Button>
		<p class="text-muted-foreground text-sm">Busca un articulo para ver en que BOMs aparece</p>
	</div>

	<!-- Search -->
	<Card.Root>
		<Card.Header>
			<Card.Title>Buscar articulo</Card.Title>
			<Card.Description>Escribe al menos dos caracteres del codigo o la descripcion.</Card.Description>
		</Card.Header>
		<Card.Content class="flex flex-col gap-3">
			<div class="relative w-full">
				<Search class="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
				<Input
					placeholder="Buscar articulo por codigo o descripcion..."
					bind:value={query}
					oninput={() => (selectedArticleId = null)}
					class="pl-8"
				/>
			</div>

			{#if matchingArticles.length > 0 && !selectedArticleId}
				<div class="flex flex-col overflow-hidden rounded-md border">
					{#each matchingArticles as a (a.id)}
						<button
							onclick={() => {
								selectedArticleId = a.id;
								query = a.code;
							}}
							class="hover:bg-accent border-border/40 flex items-center gap-3 border-b px-3 py-2 text-left transition-colors last:border-0"
						>
							<span class="text-primary font-mono text-xs">{a.code}</span>
							<span class="text-foreground truncate text-sm">{a.description}</span>
						</button>
					{/each}
				</div>
			{/if}
		</Card.Content>
	</Card.Root>

	<!-- Results -->
	{#if selectedArticle}
		<Card.Root>
			<Card.Header>
				<Card.Title class="font-mono text-sm">{selectedArticle.code}</Card.Title>
				<Card.Description>{selectedArticle.description}</Card.Description>
				<Card.Action>
					<div class="text-right">
						<p class="text-2xl font-bold tabular-nums">{whereUsed.length}</p>
						<p class="text-muted-foreground text-xs">BOMs que usan este articulo</p>
					</div>
				</Card.Action>
			</Card.Header>
		</Card.Root>

		{#if whereUsed.length > 0}
			<Card.Root>
				<Card.Content>
					<Table.Root>
						<Table.Header>
							<Table.Row>
								<Table.Head>Especificacion</Table.Head>
								<Table.Head>Modelo</Table.Head>
								<Table.Head>Nivel</Table.Head>
								<Table.Head>Estatus</Table.Head>
								<Table.Head class="text-right">Cantidad</Table.Head>
								<Table.Head>UdM</Table.Head>
								<Table.Head>Celda</Table.Head>
								<Table.Head>Operacion</Table.Head>
							</Table.Row>
						</Table.Header>
						<Table.Body>
							{#each whereUsed as { bom, comp } (bom.id)}
								<Table.Row>
									<Table.Cell>
										<a href="/lmat/boms/{bom.id}" class="text-primary font-mono text-xs hover:underline">{bom.specificationCode}</a>
									</Table.Cell>
									<Table.Cell>{bom.vehicleModel}</Table.Cell>
									<Table.Cell class="text-muted-foreground text-xs">{ARMOR_LEVEL_LABELS[bom.armorLevel]}</Table.Cell>
									<Table.Cell>
										<StatusBadge label={BOM_STATUS_LABELS[bom.status]} colorClass={BOM_STATUS_COLORS[bom.status]} />
									</Table.Cell>
									<Table.Cell class="text-right font-mono tabular-nums">{comp.quantity}</Table.Cell>
									<Table.Cell class="text-muted-foreground text-xs">{UDM_LABELS[comp.udm]}</Table.Cell>
									<Table.Cell class="text-muted-foreground text-xs">{comp.cell}</Table.Cell>
									<Table.Cell class="text-muted-foreground text-xs">{comp.operation || '---'}</Table.Cell>
								</Table.Row>
							{/each}
						</Table.Body>
					</Table.Root>
				</Card.Content>
			</Card.Root>
		{:else}
			<Card.Root>
				<Card.Content>
					<Empty.Root class="border-0">
						<Empty.Header>
							<Empty.Media variant="icon">
								<PackageSearch />
							</Empty.Media>
							<Empty.Title>Sin coincidencias</Empty.Title>
							<Empty.Description>Este articulo no aparece en ningun BOM.</Empty.Description>
						</Empty.Header>
					</Empty.Root>
				</Card.Content>
			</Card.Root>
		{/if}
	{/if}
</div>
