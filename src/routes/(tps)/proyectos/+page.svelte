<script lang="ts">
	import { useStore } from '$lib/tps/store.svelte.js';
	import StatusBadge from '$lib/tps/components/status-badge.svelte';
	import StatCard from '$lib/tps/components/stat-card.svelte';
	import {
		PROJECT_STATUS_LABELS,
		PROJECT_STATUS_COLORS,
		ARMOR_LEVEL_LABELS,
		PLANT_LABELS
	} from '$lib/tps/constants.js';
	import { formatCurrency, searchMatch } from '$lib/tps/utils.js';
	import type { ProjectStatus } from '$lib/tps/types.js';
	import FolderKanban from '@lucide/svelte/icons/folder-kanban';
	import Search from '@lucide/svelte/icons/search';
	import TrendingUp from '@lucide/svelte/icons/trending-up';
	import Clock from '@lucide/svelte/icons/clock';
	import DollarSign from '@lucide/svelte/icons/dollar-sign';
	import Plus from '@lucide/svelte/icons/plus';

	const store = useStore();
	const app = $derived(store.state);

	let query = $state('');
	let statusFilter = $state<ProjectStatus | 'todos' | 'activos'>('activos');

	const filtered = $derived.by(() => {
		let items = app.projects;
		if (app.currentPlant !== 'todas') items = items.filter((p) => p.plant === app.currentPlant);
		if (query) items = items.filter((p) => searchMatch(`${p.folioTPS} ${p.vehicleModel} ${p.clientName}`, query));
		if (statusFilter === 'activos') items = items.filter((p) => !['entregado', 'cancelado'].includes(p.status));
		else if (statusFilter !== 'todos') items = items.filter((p) => p.status === statusFilter);
		return items;
	});

	const active = $derived(app.projects.filter((p) => !['entregado', 'cancelado'].includes(p.status)));
	const inProd = $derived(active.filter((p) => p.status === 'produccion'));
	const totalRevenue = $derived(active.reduce((s, p) => s + p.quotationAmount, 0));
	const avgMargin = $derived.by(() => {
		const m = active.filter((p) => p.estimatedMargin > 0);
		return m.length > 0 ? m.reduce((s, p) => s + p.estimatedMargin, 0) / m.length : 0;
	});
	const avgDays = $derived.by(() => {
		const d = active.filter((p) => p.daysInProduction > 0);
		return d.length > 0 ? Math.round(d.reduce((s, p) => s + p.daysInProduction, 0) / d.length) : 0;
	});
</script>

<div class="flex flex-col gap-6">
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-foreground text-2xl font-bold">Proyectos / Trazabilidad</h1>
			<p class="text-muted-foreground text-sm">{active.length} proyectos activos, {filtered.length} mostrados</p>
		</div>
		<a
			href="/proyectos/nuevo"
			class="bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors"
		>
			<Plus class="h-3.5 w-3.5" /> Nuevo Proyecto
		</a>
	</div>

	<div class="grid grid-cols-2 gap-4 md:grid-cols-4">
		<StatCard label="Proyectos Activos" value={active.length} subtitle={`${inProd.length} en produccion`} icon={FolderKanban} />
		<StatCard label="Pipeline de Venta" value={formatCurrency(totalRevenue)} subtitle="Valor total cotizado" icon={DollarSign} />
		<StatCard label="Margen Promedio" value={`${avgMargin.toFixed(1)}%`} subtitle="Sobre proyectos activos" icon={TrendingUp} />
		<StatCard label="Dias Promedio" value={avgDays} subtitle="En produccion" icon={Clock} />
	</div>

	<div class="flex flex-wrap items-center gap-3">
		<div class="border-border bg-card flex max-w-sm min-w-[200px] flex-1 items-center gap-1.5 rounded-md border px-3 py-1.5">
			<Search class="text-muted-foreground h-3.5 w-3.5" />
			<input
				type="text"
				placeholder="Buscar por folio, modelo o cliente..."
				bind:value={query}
				class="text-foreground placeholder:text-muted-foreground w-full border-none bg-transparent text-sm outline-none"
			/>
		</div>
		<select
			bind:value={statusFilter}
			class="border-border bg-card text-foreground rounded-md border px-2 py-1.5 text-xs outline-none"
		>
			<option value="activos">Solo activos</option>
			<option value="todos">Todos</option>
			{#each Object.entries(PROJECT_STATUS_LABELS) as [k, v] (k)}
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
						<th class="text-muted-foreground px-4 py-2.5 text-xs font-medium">Folio</th>
						<th class="text-muted-foreground px-4 py-2.5 text-xs font-medium">Modelo</th>
						<th class="text-muted-foreground px-4 py-2.5 text-xs font-medium">Nivel</th>
						<th class="text-muted-foreground px-4 py-2.5 text-xs font-medium">Cliente</th>
						<th class="text-muted-foreground px-4 py-2.5 text-xs font-medium">Planta</th>
						<th class="text-muted-foreground px-4 py-2.5 text-xs font-medium">Estatus</th>
						<th class="text-muted-foreground px-4 py-2.5 text-right text-xs font-medium">Dias</th>
						<th class="text-muted-foreground px-4 py-2.5 text-xs font-medium">Avance</th>
						<th class="text-muted-foreground px-4 py-2.5 text-right text-xs font-medium">Cotizacion</th>
						<th class="text-muted-foreground px-4 py-2.5 text-right text-xs font-medium">Costo</th>
						<th class="text-muted-foreground px-4 py-2.5 text-right text-xs font-medium">Margen</th>
					</tr>
				</thead>
				<tbody>
					{#each filtered as project (project.id)}
						<tr class="border-border/50 hover:bg-secondary/30 border-b transition-colors">
							<td class="px-4 py-2">
								<a href="/proyectos/{project.id}" class="text-primary font-mono text-sm font-bold hover:underline">{project.folioTPS}</a>
							</td>
							<td class="text-card-foreground px-4 py-2">{project.vehicleModel}</td>
							<td class="text-muted-foreground px-4 py-2 text-xs">{ARMOR_LEVEL_LABELS[project.armorLevel]}</td>
							<td class="text-card-foreground max-w-[150px] truncate px-4 py-2">{project.clientName}</td>
							<td class="text-muted-foreground px-4 py-2 text-xs">{PLANT_LABELS[project.plant]}</td>
							<td class="px-4 py-2">
								<StatusBadge label={PROJECT_STATUS_LABELS[project.status]} colorClass={PROJECT_STATUS_COLORS[project.status]} />
							</td>
							<td class="text-card-foreground px-4 py-2 text-right font-mono text-xs">
								{project.daysInProduction > 0 ? `${project.daysInProduction}d` : '---'}
							</td>
							<td class="px-4 py-2">
								<div class="flex items-center gap-2">
									<div class="bg-secondary h-1.5 w-14 rounded-full">
										<div class="bg-primary h-1.5 rounded-full transition-all" style="width: {project.progressPercent}%"></div>
									</div>
									<span class="text-muted-foreground font-mono text-xs">{project.progressPercent}%</span>
								</div>
							</td>
							<td class="text-card-foreground px-4 py-2 text-right font-mono text-xs">{formatCurrency(project.quotationAmount)}</td>
							<td class="text-card-foreground px-4 py-2 text-right font-mono text-xs">{formatCurrency(project.totalCost)}</td>
							<td class="px-4 py-2 text-right font-mono text-xs">
								<span class={project.estimatedMargin >= 20 ? 'text-primary' : project.estimatedMargin >= 10 ? 'text-chart-4' : 'text-destructive'}>
									{project.estimatedMargin > 0 ? `${project.estimatedMargin.toFixed(1)}%` : '---'}
								</span>
							</td>
						</tr>
					{/each}
					{#if filtered.length === 0}
						<tr>
							<td colspan="11" class="text-muted-foreground px-4 py-8 text-center text-sm">No se encontraron proyectos.</td>
						</tr>
					{/if}
				</tbody>
			</table>
		</div>
	</div>
</div>
