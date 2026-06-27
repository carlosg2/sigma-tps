<script lang="ts">
	import { useStore } from '$lib/tps/store.svelte.js';
	import StatusBadge from '$lib/tps/components/status-badge.svelte';
	import {
		BOM_STATUS_LABELS,
		ARMOR_LEVEL_LABELS,
		PLANT_LABELS,
		BOM_MATURITY_LABELS,
		BOM_MATURITY_COLORS
	} from '$lib/tps/constants.js';
	import type { BOMStatus, BOMMaturityStatus } from '$lib/tps/types.js';
	import Search from '@lucide/svelte/icons/search';
	import ArrowUpDown from '@lucide/svelte/icons/arrow-up-down';
	import ChevronUp from '@lucide/svelte/icons/chevron-up';
	import ChevronDown from '@lucide/svelte/icons/chevron-down';
	import Plus from '@lucide/svelte/icons/plus';
	import ArrowLeft from '@lucide/svelte/icons/arrow-left';

	type SortField =
		| 'specificationCode'
		| 'vehicleModel'
		| 'armorLevel'
		| 'version'
		| 'healthPercent'
		| 'components';
	type SortDir = 'asc' | 'desc';

	const store = useStore();
	const app = $derived(store.state);

	let query = $state('');
	let statusFilter = $state<BOMStatus | 'todos'>('todos');
	let maturityFilter = $state<BOMMaturityStatus | 'todos'>('todos');
	let sortField = $state<SortField>('specificationCode');
	let sortDir = $state<SortDir>('asc');

	const filtered = $derived.by(() => {
		let items = app.boms;
		if (app.currentPlant !== 'todas') items = items.filter((b) => b.plant === app.currentPlant);
		if (query)
			items = items.filter((b) =>
				`${b.specificationCode} ${b.vehicleModel}`.toLowerCase().includes(query.toLowerCase())
			);
		if (statusFilter !== 'todos') items = items.filter((b) => b.status === statusFilter);
		if (maturityFilter !== 'todos') items = items.filter((b) => b.maturityStatus === maturityFilter);

		return [...items].sort((a, b) => {
			let cmp = 0;
			switch (sortField) {
				case 'specificationCode': cmp = a.specificationCode.localeCompare(b.specificationCode); break;
				case 'vehicleModel': cmp = a.vehicleModel.localeCompare(b.vehicleModel); break;
				case 'armorLevel': cmp = a.armorLevel.localeCompare(b.armorLevel); break;
				case 'version': cmp = a.version - b.version; break;
				case 'healthPercent': cmp = a.healthPercent - b.healthPercent; break;
				case 'components': cmp = a.components.length - b.components.length; break;
			}
			return sortDir === 'asc' ? cmp : -cmp;
		});
	});

	function toggleSort(field: SortField) {
		if (sortField === field) sortDir = sortDir === 'asc' ? 'desc' : 'asc';
		else {
			sortField = field;
			sortDir = 'asc';
		}
	}

	const totalBOMs = $derived(app.boms.length);
	const released = $derived(app.boms.filter((b) => b.maturityStatus === 'liberado').length);
	const avgHealth = $derived(
		Math.round(app.boms.reduce((s, b) => s + b.healthPercent, 0) / (totalBOMs || 1))
	);
	const totalComponents = $derived(app.boms.reduce((s, b) => s + b.components.length, 0));
</script>

<div class="flex flex-col gap-6">
	<div class="flex items-center justify-between">
		<div class="flex items-center gap-3">
			<a href="/lmat" class="border-border hover:bg-secondary flex h-8 w-8 items-center justify-center rounded-lg border transition-colors">
				<ArrowLeft class="h-4 w-4" />
			</a>
			<div>
				<h1 class="text-foreground text-2xl font-bold">Listas de Materiales (BOMs)</h1>
				<p class="text-muted-foreground text-sm">{totalBOMs} especificaciones, {filtered.length} mostradas</p>
			</div>
		</div>
		<div class="flex items-center gap-2">
			<a href="/lmat/where-used" class="border-border text-foreground hover:bg-secondary rounded-md border px-3 py-1.5 text-xs transition-colors">Where-Used</a>
			<a href="/lmat/boms/cambio-masivo" class="border-border text-foreground hover:bg-secondary rounded-md border px-3 py-1.5 text-xs transition-colors">Cambio Masivo</a>
			<a href="/lmat/boms/importar" class="border-border text-foreground hover:bg-secondary rounded-md border px-3 py-1.5 text-xs transition-colors">Importar</a>
			<a href="/lmat/boms/nuevo" class="bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors">
				<Plus class="h-3.5 w-3.5" /> Nuevo BOM
			</a>
		</div>
	</div>

	<!-- Stats -->
	<div class="grid grid-cols-2 gap-4 md:grid-cols-4">
		<div class="border-border bg-card rounded-lg border p-3">
			<span class="text-muted-foreground text-xs">Total BOMs</span>
			<p class="text-card-foreground text-xl font-bold">{totalBOMs}</p>
		</div>
		<div class="border-border bg-card rounded-lg border p-3">
			<span class="text-muted-foreground text-xs">Liberados para Serie</span>
			<p class="text-primary text-xl font-bold">{released}</p>
		</div>
		<div class="border-border bg-card rounded-lg border p-3">
			<span class="text-muted-foreground text-xs">Salud Promedio</span>
			<p class="text-card-foreground text-xl font-bold">{avgHealth}%</p>
		</div>
		<div class="border-border bg-card rounded-lg border p-3">
			<span class="text-muted-foreground text-xs">Componentes Totales</span>
			<p class="text-card-foreground text-xl font-bold">{totalComponents}</p>
		</div>
	</div>

	<!-- Filters -->
	<div class="flex flex-wrap items-center gap-3">
		<div class="border-border bg-card flex max-w-sm min-w-[200px] flex-1 items-center gap-1.5 rounded-md border px-3 py-1.5">
			<Search class="text-muted-foreground h-3.5 w-3.5" />
			<input type="text" placeholder="Buscar por especificacion o modelo..." bind:value={query}
				class="text-foreground placeholder:text-muted-foreground w-full border-none bg-transparent text-sm outline-none" />
		</div>
		<select bind:value={maturityFilter} class="border-border bg-card text-foreground rounded-md border px-2 py-1.5 text-xs outline-none">
			<option value="todos">Toda madurez</option>
			{#each Object.entries(BOM_MATURITY_LABELS) as [k, v] (k)}
				<option value={k}>{v}</option>
			{/each}
		</select>
		<select bind:value={statusFilter} class="border-border bg-card text-foreground rounded-md border px-2 py-1.5 text-xs outline-none">
			<option value="todos">Todos los estatus</option>
			{#each Object.entries(BOM_STATUS_LABELS) as [k, v] (k)}
				<option value={k}>{v}</option>
			{/each}
		</select>
	</div>

	<!-- Table -->
	<div class="border-border bg-card overflow-hidden rounded-lg border">
		<div class="overflow-x-auto">
			<table class="w-full text-sm">
				<thead>
					<tr class="border-border bg-secondary/50 border-b text-left">
						<th class="text-muted-foreground cursor-pointer px-4 py-2.5 text-xs font-medium" onclick={() => toggleSort('specificationCode')}>
							<span class="flex items-center gap-1">Especificacion
								{#if sortField !== 'specificationCode'}<ArrowUpDown class="h-3 w-3 opacity-30" />{:else if sortDir === 'asc'}<ChevronUp class="h-3 w-3" />{:else}<ChevronDown class="h-3 w-3" />{/if}
							</span>
						</th>
						<th class="text-muted-foreground cursor-pointer px-4 py-2.5 text-xs font-medium" onclick={() => toggleSort('vehicleModel')}>
							<span class="flex items-center gap-1">Modelo
								{#if sortField !== 'vehicleModel'}<ArrowUpDown class="h-3 w-3 opacity-30" />{:else if sortDir === 'asc'}<ChevronUp class="h-3 w-3" />{:else}<ChevronDown class="h-3 w-3" />{/if}
							</span>
						</th>
						<th class="text-muted-foreground px-4 py-2.5 text-xs font-medium">Nivel</th>
						<th class="text-muted-foreground px-4 py-2.5 text-xs font-medium">Planta</th>
						<th class="text-muted-foreground cursor-pointer px-4 py-2.5 text-center text-xs font-medium" onclick={() => toggleSort('version')}>
							<span class="flex items-center justify-center gap-1">Ver.
								{#if sortField !== 'version'}<ArrowUpDown class="h-3 w-3 opacity-30" />{:else if sortDir === 'asc'}<ChevronUp class="h-3 w-3" />{:else}<ChevronDown class="h-3 w-3" />{/if}
							</span>
						</th>
						<th class="text-muted-foreground cursor-pointer px-4 py-2.5 text-center text-xs font-medium" onclick={() => toggleSort('components')}>
							<span class="flex items-center justify-center gap-1">Comp.
								{#if sortField !== 'components'}<ArrowUpDown class="h-3 w-3 opacity-30" />{:else if sortDir === 'asc'}<ChevronUp class="h-3 w-3" />{:else}<ChevronDown class="h-3 w-3" />{/if}
							</span>
						</th>
						<th class="text-muted-foreground px-4 py-2.5 text-xs font-medium">Madurez</th>
						<th class="text-muted-foreground cursor-pointer px-4 py-2.5 text-xs font-medium" onclick={() => toggleSort('healthPercent')}>
							<span class="flex items-center gap-1">Salud
								{#if sortField !== 'healthPercent'}<ArrowUpDown class="h-3 w-3 opacity-30" />{:else if sortDir === 'asc'}<ChevronUp class="h-3 w-3" />{:else}<ChevronDown class="h-3 w-3" />{/if}
							</span>
						</th>
					</tr>
				</thead>
				<tbody>
					{#each filtered as bom (bom.id)}
						<tr class="border-border/50 hover:bg-secondary/30 border-b transition-colors">
							<td class="px-4 py-2">
								<a href="/lmat/boms/{bom.id}" class="text-primary font-mono text-xs hover:underline">{bom.specificationCode}</a>
							</td>
							<td class="text-card-foreground px-4 py-2">{bom.vehicleModel}</td>
							<td class="text-muted-foreground px-4 py-2 text-xs">{ARMOR_LEVEL_LABELS[bom.armorLevel]}</td>
							<td class="text-muted-foreground px-4 py-2 text-xs">{PLANT_LABELS[bom.plant]}</td>
							<td class="text-card-foreground px-4 py-2 text-center font-mono text-xs">v{bom.version}</td>
							<td class="text-card-foreground px-4 py-2 text-center font-mono text-xs">{bom.components.length}</td>
							<td class="px-4 py-2">
								<StatusBadge label={BOM_MATURITY_LABELS[bom.maturityStatus || 'en_desarrollo']} colorClass={BOM_MATURITY_COLORS[bom.maturityStatus || 'en_desarrollo']} />
							</td>
							<td class="px-4 py-2">
								<div class="flex items-center gap-2">
									<div class="bg-secondary h-1.5 w-16 rounded-full">
										<div class="h-1.5 rounded-full transition-all {bom.healthPercent >= 80 ? 'bg-primary' : bom.healthPercent >= 50 ? 'bg-chart-4' : 'bg-destructive'}" style="width: {bom.healthPercent}%"></div>
									</div>
									<span class="text-muted-foreground w-8 text-right font-mono text-xs">{bom.healthPercent}%</span>
								</div>
							</td>
						</tr>
					{/each}
					{#if filtered.length === 0}
						<tr>
							<td colspan="8" class="text-muted-foreground px-4 py-8 text-center text-sm">No se encontraron BOMs con los filtros seleccionados.</td>
						</tr>
					{/if}
				</tbody>
			</table>
		</div>
	</div>
</div>
