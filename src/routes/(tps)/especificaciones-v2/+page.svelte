<script lang="ts">
	import { useSpecV2Store } from '$lib/tps/spec-v2/store.svelte.js';
	import {
		SPEC_V2_STATUS_LABELS,
		SPEC_V2_STATUS_COLORS,
		SPEC_DESIGN_TYPE_LABELS
	} from '$lib/tps/spec-v2/constants.js';
	import { SPEC_COMPONENT_COUNT } from '$lib/tps/spec-v2/catalog-sections.js';
	import { ARMOR_LEVEL_LABELS } from '$lib/tps/constants.js';
	import type { SpecV2Status } from '$lib/tps/spec-v2/types.js';
	import StatusBadge from '$lib/tps/components/status-badge.svelte';
	import StatCard from '$lib/tps/components/stat-card.svelte';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import * as Empty from '$lib/components/ui/empty/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import Search from '@lucide/svelte/icons/search';
	import Plus from '@lucide/svelte/icons/plus';
	import Car from '@lucide/svelte/icons/car';
	import Shield from '@lucide/svelte/icons/shield';
	import Clock from '@lucide/svelte/icons/clock';
	import ChevronRight from '@lucide/svelte/icons/chevron-right';
	import Boxes from '@lucide/svelte/icons/boxes';
	import ListChecks from '@lucide/svelte/icons/list-checks';
	import FileStack from '@lucide/svelte/icons/file-stack';

	const store = useSpecV2Store();
	const data = $derived(store.state);

	let query = $state('');
	let statusFilter = $state<SpecV2Status | 'todos'>('todos');
	let brandFilter = $state<string>('todos');

	const brands = $derived.by(() => Array.from(new Set(data.specifications.map((s) => s.brand))).sort());

	const filtered = $derived.by(() => {
		let items = data.specifications;
		if (query) items = items.filter((s) => `${s.code} ${s.brand} ${s.model}`.toLowerCase().includes(query.toLowerCase()));
		if (statusFilter !== 'todos') items = items.filter((s) => s.status === statusFilter);
		if (brandFilter !== 'todos') items = items.filter((s) => s.brand === brandFilter);
		return items;
	});

	const total = $derived(data.specifications.length);
	const authorized = $derived(data.specifications.filter((s) => s.status === 'autorizada').length);
	const inReview = $derived(data.specifications.filter((s) => s.status === 'en_revision').length);
	const articleCount = $derived(data.specArticles.length);

	const statusLabel = $derived(statusFilter === 'todos' ? 'Todos los estatus' : SPEC_V2_STATUS_LABELS[statusFilter]);
	const brandLabel = $derived(brandFilter === 'todos' ? 'Todas las marcas' : brandFilter);
</script>

<!-- Header -->
<div class="flex flex-wrap items-center justify-between gap-3">
	<p class="text-muted-foreground text-sm">
		{total} especificaciones · catalogo de {SPEC_COMPONENT_COUNT} componentes
	</p>
	<div class="flex items-center gap-2">
		<Button href="/especificaciones-v2/articulos" variant="outline" size="sm">
			<Boxes data-icon="inline-start" /> Catalogo de Articulos
		</Button>
		<Button href="/especificaciones-v2/nueva" size="sm">
			<Plus data-icon="inline-start" /> Nueva Especificacion
		</Button>
	</div>
</div>

<!-- Stats -->
<div class="grid grid-cols-2 gap-4 md:grid-cols-4">
	<StatCard label="Especificaciones" value={total} subtitle="En catalogo v2" icon={Car} />
	<StatCard label="Autorizadas" value={authorized} subtitle="Liberadas" icon={ListChecks} />
	<StatCard label="En Revision" value={inReview} subtitle="Pendientes de autorizar" />
	<StatCard label="Articulos de Espec." value={articleCount} subtitle="Catalogo propio" icon={Boxes} />
</div>

<!-- Catalog card -->
<Card.Root>
	<Card.Header>
		<Card.Title>Catalogo de Especificaciones v2</Card.Title>
		<Card.Description>Especificaciones estructuradas por seccion, subseccion y componente.</Card.Description>
	</Card.Header>
	<Card.Content class="flex flex-col gap-4">
		<div class="flex flex-wrap items-center gap-2">
			<div class="relative w-full max-w-sm flex-1">
				<Search class="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
				<Input placeholder="Buscar por codigo, marca o modelo..." bind:value={query} class="pl-8" />
			</div>
			<Select.Root type="single" bind:value={statusFilter}>
				<Select.Trigger size="sm" class="w-44">{statusLabel}</Select.Trigger>
				<Select.Content>
					<Select.Item value="todos">Todos los estatus</Select.Item>
					{#each Object.entries(SPEC_V2_STATUS_LABELS) as [k, v] (k)}
						<Select.Item value={k}>{v}</Select.Item>
					{/each}
				</Select.Content>
			</Select.Root>
			<Select.Root type="single" bind:value={brandFilter}>
				<Select.Trigger size="sm" class="w-44">{brandLabel}</Select.Trigger>
				<Select.Content>
					<Select.Item value="todos">Todas las marcas</Select.Item>
					{#each brands as brand (brand)}
						<Select.Item value={brand}>{brand}</Select.Item>
					{/each}
				</Select.Content>
			</Select.Root>
		</div>

		<div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
			{#each filtered as spec (spec.id)}
				{@const captured = spec.components.length}
				{@const authCount = spec.authorizations.filter((a) => a.status === 'autorizado').length}
				<a href="/especificaciones-v2/{spec.id}" class="group">
					<Card.Root class="hover:border-primary/50 hover:bg-muted/50 h-full gap-3 py-4 transition-all">
						<Card.Header class="px-4">
							<div class="flex items-start justify-between gap-2">
								<div class="flex items-center gap-2">
									<div class="bg-primary/10 flex size-8 items-center justify-center rounded-md">
										<Car class="text-primary size-4" />
									</div>
									<div>
										<p class="text-muted-foreground font-mono text-xs">{spec.code}</p>
										<p class="font-semibold">{spec.brand} {spec.model}</p>
									</div>
								</div>
								<ChevronRight class="text-muted-foreground size-4 opacity-0 transition-opacity group-hover:opacity-100" />
							</div>
						</Card.Header>
						<Card.Content class="flex flex-col gap-3 px-4">
							<div class="flex flex-wrap gap-2">
								<StatusBadge label={SPEC_V2_STATUS_LABELS[spec.status]} colorClass={SPEC_V2_STATUS_COLORS[spec.status]} />
								<div class="bg-secondary flex items-center gap-1 rounded-full px-2 py-0.5">
									<Shield class="text-muted-foreground size-3" />
									<span class="text-muted-foreground text-xs">{ARMOR_LEVEL_LABELS[spec.armorLevel]}</span>
								</div>
								<div class="bg-secondary text-muted-foreground rounded-full px-2 py-0.5 text-xs">
									{SPEC_DESIGN_TYPE_LABELS[spec.designType]}
								</div>
							</div>

							<div class="text-muted-foreground border-border/50 flex items-center justify-between border-t pt-2 text-xs">
								<div class="flex items-center gap-3">
									<span class="flex items-center gap-1"><Clock class="size-3" />{spec.year}</span>
									<span class="flex items-center gap-1"><FileStack class="size-3" />{captured} comp.</span>
									<span class="flex items-center gap-1"><ListChecks class="size-3" />{authCount}/{spec.authorizations.length}</span>
								</div>
								<span class="font-mono">v{spec.version}</span>
							</div>
						</Card.Content>
					</Card.Root>
				</a>
			{/each}
		</div>

		{#if filtered.length === 0}
			<Empty.Root class="border-0">
				<Empty.Header>
					<Empty.Media variant="icon">
						<Car />
					</Empty.Media>
					<Empty.Title>Sin resultados</Empty.Title>
					<Empty.Description>No se encontraron especificaciones con los filtros seleccionados.</Empty.Description>
				</Empty.Header>
			</Empty.Root>
		{/if}
	</Card.Content>
</Card.Root>
