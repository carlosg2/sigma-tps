<script lang="ts">
	import { useStore } from '$lib/tps/store.svelte.js';
	import StatusBadge from '$lib/tps/components/status-badge.svelte';
	import {
		BOM_MATURITY_LABELS,
		BOM_MATURITY_COLORS,
		BOM_MATURITY_DESCRIPTIONS,
		ARMOR_LEVEL_LABELS
	} from '$lib/tps/constants.js';
	import type { BOMMaturityStatus } from '$lib/tps/types.js';
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
</script>

<div class="flex flex-col gap-6">
	<!-- Header -->
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-foreground text-2xl font-bold">Especificaciones Tecnicas</h1>
			<p class="text-muted-foreground text-sm">{total} especificaciones, {filtered.length} mostradas</p>
		</div>
		<a href="/lmat/ecn" class="border-border text-foreground hover:bg-secondary flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs transition-colors">
			<GitBranch class="h-3.5 w-3.5" /> ECN
		</a>
	</div>

	<!-- Stats -->
	<div class="grid grid-cols-2 gap-4 md:grid-cols-4">
		<div class="border-border bg-card rounded-lg border p-3">
			<span class="text-muted-foreground text-xs">Total Especificaciones</span>
			<p class="text-card-foreground text-xl font-bold">{total}</p>
		</div>
		<div class="border-border bg-card rounded-lg border p-3">
			<span class="text-muted-foreground text-xs">Liberadas para Serie</span>
			<p class="text-primary text-xl font-bold">{released}</p>
		</div>
		<div class="border-border bg-card rounded-lg border p-3">
			<span class="text-muted-foreground text-xs">En Desarrollo</span>
			<p class="text-chart-4 text-xl font-bold">{inDevelopment}</p>
		</div>
		<div class="border-border bg-card rounded-lg border p-3">
			<span class="text-muted-foreground text-xs">BOMs Asociados</span>
			<p class="text-card-foreground text-xl font-bold">{totalBOMs}</p>
		</div>
	</div>

	<!-- Maturity Legend -->
	<div class="border-border bg-card rounded-lg border p-4">
		<h3 class="text-card-foreground mb-3 text-sm font-semibold">Ciclo de Vida de Especificaciones (LMAT 2.0)</h3>
		<div class="flex flex-wrap gap-4">
			{#each maturityKeys as status (status)}
				<div class="flex min-w-[200px] items-start gap-2">
					<StatusBadge label={BOM_MATURITY_LABELS[status]} colorClass={BOM_MATURITY_COLORS[status]} />
					<span class="text-muted-foreground text-xs leading-relaxed">{BOM_MATURITY_DESCRIPTIONS[status]}</span>
				</div>
			{/each}
		</div>
	</div>

	<!-- Filters -->
	<div class="flex flex-wrap items-center gap-3">
		<div class="border-border bg-card flex max-w-sm min-w-[200px] flex-1 items-center gap-1.5 rounded-md border px-3 py-1.5">
			<Search class="text-muted-foreground h-3.5 w-3.5" />
			<input type="text" placeholder="Buscar por codigo, marca o modelo..." bind:value={query}
				class="text-foreground placeholder:text-muted-foreground w-full border-none bg-transparent text-sm outline-none" />
		</div>
		<select bind:value={statusFilter} class="border-border bg-card text-foreground rounded-md border px-2 py-1.5 text-xs outline-none">
			<option value="todos">Todos los estatus</option>
			{#each Object.entries(BOM_MATURITY_LABELS) as [k, v] (k)}
				<option value={k}>{v}</option>
			{/each}
		</select>
		<select bind:value={brandFilter} class="border-border bg-card text-foreground rounded-md border px-2 py-1.5 text-xs outline-none">
			<option value="todos">Todas las marcas</option>
			{#each brands as brand (brand)}
				<option value={brand}>{brand}</option>
			{/each}
		</select>
	</div>

	<!-- Specifications Grid -->
	<div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
		{#each filtered as spec (spec.id)}
			{@const linkedBOMs = app.boms.filter((b) => spec.bomIds.includes(b.id))}
			<a href="/lmat/especificaciones/{spec.id}" class="group border-border bg-card hover:border-primary/50 hover:bg-secondary/30 rounded-lg border p-4 transition-all">
				<div class="mb-3 flex items-start justify-between">
					<div class="flex items-center gap-2">
						<div class="bg-primary/10 flex h-8 w-8 items-center justify-center rounded-md">
							<Car class="text-primary h-4 w-4" />
						</div>
						<div>
							<p class="text-muted-foreground font-mono text-xs">{spec.code}</p>
							<p class="text-card-foreground font-semibold">{spec.brand} {spec.model}</p>
						</div>
					</div>
					<ChevronRight class="text-muted-foreground h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100" />
				</div>

				<div class="mb-3 flex flex-wrap gap-2">
					<StatusBadge label={BOM_MATURITY_LABELS[spec.status]} colorClass={BOM_MATURITY_COLORS[spec.status]} />
					<div class="bg-secondary flex items-center gap-1 rounded-full px-2 py-0.5">
						<Shield class="text-muted-foreground h-3 w-3" />
						<span class="text-muted-foreground text-xs">{ARMOR_LEVEL_LABELS[spec.armorLevel]}</span>
					</div>
				</div>

				<div class="text-muted-foreground border-border/50 flex items-center justify-between border-t pt-2 text-xs">
					<div class="flex items-center gap-3">
						<span class="flex items-center gap-1"><Clock class="h-3 w-3" />{spec.year}</span>
						<span class="flex items-center gap-1"><Layers class="h-3 w-3" />{linkedBOMs.length} BOMs</span>
					</div>
					<span class="font-mono">v{spec.version}</span>
				</div>

				{#if spec.protectionByZone.length > 0}
					<div class="border-border/50 mt-3 border-t pt-2">
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
			</a>
		{/each}
	</div>

	{#if filtered.length === 0}
		<div class="flex flex-col items-center justify-center py-12 text-center">
			<FileStack class="text-muted-foreground/30 mb-4 h-12 w-12" />
			<p class="text-muted-foreground text-sm">No se encontraron especificaciones con los filtros seleccionados.</p>
		</div>
	{/if}
</div>
