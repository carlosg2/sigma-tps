<script lang="ts">
	import { useStore } from '$lib/tps/store.svelte.js';
	import StatusBadge from '$lib/tps/components/status-badge.svelte';
	import StatCard from '$lib/tps/components/stat-card.svelte';
	import {
		BOM_MATURITY_LABELS,
		BOM_MATURITY_COLORS,
		BOM_MATURITY_DESCRIPTIONS,
		ARMOR_LEVEL_LABELS
	} from '$lib/tps/constants.js';
	import type { BOMMaturityStatus } from '$lib/tps/types.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import * as Empty from '$lib/components/ui/empty/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import FileStack from '@lucide/svelte/icons/file-stack';
	import Search from '@lucide/svelte/icons/search';
	import Plus from '@lucide/svelte/icons/plus';
	import Car from '@lucide/svelte/icons/car';
	import Shield from '@lucide/svelte/icons/shield';
	import GitBranch from '@lucide/svelte/icons/git-branch';
	import Clock from '@lucide/svelte/icons/clock';
	import ChevronRight from '@lucide/svelte/icons/chevron-right';
	import Layers from '@lucide/svelte/icons/layers';

	const store = useStore();
	const app = $derived(store.state);

	let query = $state('');
	let statusFilter = $state<BOMMaturityStatus | 'todos'>('todos');
	let brandFilter = $state<string>('todos');

	const brands = $derived.by(() => {
		const unique = new Set(app.specifications.map((s) => s.brand));
		return Array.from(unique).sort();
	});

	const filtered = $derived.by(() => {
		let items = app.specifications;
		if (query) items = items.filter((s) => `${s.code} ${s.brand} ${s.model}`.toLowerCase().includes(query.toLowerCase()));
		if (statusFilter !== 'todos') items = items.filter((s) => s.status === statusFilter);
		if (brandFilter !== 'todos') items = items.filter((s) => s.brand === brandFilter);
		return items;
	});

	const total = $derived(app.specifications.length);
	const released = $derived(app.specifications.filter((s) => s.status === 'liberado').length);
	const inDevelopment = $derived(
		app.specifications.filter((s) => s.status === 'en_desarrollo' || s.status === 'preliminar').length
	);
	const totalBOMs = $derived(app.specifications.reduce((s, spec) => s + spec.bomIds.length, 0));

	const maturityKeys = Object.keys(BOM_MATURITY_LABELS) as BOMMaturityStatus[];

	const statusLabel = $derived(
		statusFilter === 'todos' ? 'Todos los estatus' : BOM_MATURITY_LABELS[statusFilter]
	);
	const brandLabel = $derived(brandFilter === 'todos' ? 'Todas las marcas' : brandFilter);
</script>

<!-- Header -->
<div class="flex flex-wrap items-center justify-between gap-3">
	<p class="text-muted-foreground text-sm">{total} especificaciones · {filtered.length} mostradas</p>
	<Button href="/lmat/ecn" variant="outline" size="sm">
		<GitBranch data-icon="inline-start" /> ECN
	</Button>
</div>

<!-- Stats -->
<div class="grid grid-cols-2 gap-4 md:grid-cols-4">
	<StatCard label="Total Especificaciones" value={total} subtitle="En catalogo" icon={Car} />
	<StatCard label="Liberadas para Serie" value={released} subtitle="Madurez liberada" />
	<StatCard label="En Desarrollo" value={inDevelopment} subtitle="Desarrollo o preliminar" />
	<StatCard label="BOMs Asociados" value={totalBOMs} subtitle="Listas vinculadas" icon={Layers} />
</div>

<!-- Maturity Legend -->
<Card.Root>
	<Card.Header>
		<Card.Title>Ciclo de Vida de Especificaciones (LMAT 2.0)</Card.Title>
	</Card.Header>
	<Card.Content>
		<div class="flex flex-wrap gap-4">
			{#each maturityKeys as status (status)}
				<div class="flex min-w-50 items-start gap-2">
					<StatusBadge label={BOM_MATURITY_LABELS[status]} colorClass={BOM_MATURITY_COLORS[status]} />
					<span class="text-muted-foreground text-xs leading-relaxed">{BOM_MATURITY_DESCRIPTIONS[status]}</span>
				</div>
			{/each}
		</div>
	</Card.Content>
</Card.Root>

<!-- Catalog card -->
<Card.Root>
	<Card.Header>
		<Card.Title>Catalogo de Especificaciones</Card.Title>
		<Card.Description>Busca y filtra las especificaciones tecnicas.</Card.Description>
	</Card.Header>
	<Card.Content class="flex flex-col gap-4">
		<!-- Filters -->
		<div class="flex flex-wrap items-center gap-2">
			<div class="relative w-full max-w-sm flex-1">
				<Search class="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
				<Input placeholder="Buscar por codigo, marca o modelo..." bind:value={query} class="pl-8" />
			</div>
			<Select.Root type="single" bind:value={statusFilter}>
				<Select.Trigger size="sm" class="w-44">{statusLabel}</Select.Trigger>
				<Select.Content>
					<Select.Item value="todos">Todos los estatus</Select.Item>
					{#each Object.entries(BOM_MATURITY_LABELS) as [k, v] (k)}
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

		<!-- Grid -->
		<div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
			{#each filtered as spec (spec.id)}
				{@const linkedBOMs = app.boms.filter((b) => spec.bomIds.includes(b.id))}
				<a href="/lmat/especificaciones/{spec.id}" class="group">
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
								<StatusBadge label={BOM_MATURITY_LABELS[spec.status]} colorClass={BOM_MATURITY_COLORS[spec.status]} />
								<div class="bg-secondary flex items-center gap-1 rounded-full px-2 py-0.5">
									<Shield class="text-muted-foreground size-3" />
									<span class="text-muted-foreground text-xs">{ARMOR_LEVEL_LABELS[spec.armorLevel]}</span>
								</div>
							</div>

							<div class="text-muted-foreground border-border/50 flex items-center justify-between border-t pt-2 text-xs">
								<div class="flex items-center gap-3">
									<span class="flex items-center gap-1"><Clock class="size-3" />{spec.year}</span>
									<span class="flex items-center gap-1"><Layers class="size-3" />{linkedBOMs.length} BOMs</span>
								</div>
								<span class="font-mono">v{spec.version}</span>
							</div>

							{#if spec.protectionByZone.length > 0}
								<div class="border-border/50 border-t pt-2">
									<p class="text-muted-foreground mb-1 text-[10px] tracking-wider uppercase">Zonas de Proteccion</p>
									<div class="flex flex-wrap gap-1">
										{#each spec.protectionByZone.slice(0, 3) as zone, idx (idx)}
											<span class="bg-secondary text-muted-foreground rounded px-1.5 py-0.5 text-[10px]">{zone.zone}: {zone.thickness}</span>
										{/each}
										{#if spec.protectionByZone.length > 3}
											<span class="bg-secondary text-muted-foreground rounded px-1.5 py-0.5 text-[10px]">+{spec.protectionByZone.length - 3} mas</span>
										{/if}
									</div>
								</div>
							{/if}
						</Card.Content>
					</Card.Root>
				</a>
			{/each}
		</div>

		{#if filtered.length === 0}
			<Empty.Root class="border-0">
				<Empty.Header>
					<Empty.Media variant="icon">
						<FileStack />
					</Empty.Media>
					<Empty.Title>Sin resultados</Empty.Title>
					<Empty.Description>No se encontraron especificaciones con los filtros seleccionados.</Empty.Description>
				</Empty.Header>
			</Empty.Root>
		{/if}
	</Card.Content>
</Card.Root>
