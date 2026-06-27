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
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Table from '$lib/components/ui/table/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import * as Empty from '$lib/components/ui/empty/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Progress } from '$lib/components/ui/progress/index.js';
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

	const statusLabel = $derived(
		statusFilter === 'activos'
			? 'Solo activos'
			: statusFilter === 'todos'
				? 'Todos'
				: PROJECT_STATUS_LABELS[statusFilter]
	);
</script>

<!-- Header -->
<div class="flex flex-wrap items-center justify-between gap-3">
	<p class="text-muted-foreground text-sm">{active.length} proyectos activos · {filtered.length} mostrados</p>
	<Button href="/proyectos/nuevo" size="sm">
		<Plus data-icon="inline-start" /> Nuevo Proyecto
	</Button>
</div>

<!-- Stats -->
<div class="grid grid-cols-2 gap-4 md:grid-cols-4">
	<StatCard label="Proyectos Activos" value={active.length} subtitle={`${inProd.length} en produccion`} icon={FolderKanban} />
	<StatCard label="Pipeline de Venta" value={formatCurrency(totalRevenue)} subtitle="Valor total cotizado" icon={DollarSign} />
	<StatCard label="Margen Promedio" value={`${avgMargin.toFixed(1)}%`} subtitle="Sobre proyectos activos" icon={TrendingUp} />
	<StatCard label="Dias Promedio" value={avgDays} subtitle="En produccion" icon={Clock} />
</div>

<!-- Table card -->
<Card.Root>
	<Card.Header>
		<Card.Title>Proyectos</Card.Title>
		<Card.Description>Busca y filtra los proyectos de trazabilidad.</Card.Description>
	</Card.Header>
	<Card.Content class="flex flex-col gap-4">
		<!-- Filters -->
		<div class="flex flex-wrap items-center gap-2">
			<div class="relative w-full max-w-sm flex-1">
				<Search class="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
				<Input placeholder="Buscar por folio, modelo o cliente..." bind:value={query} class="pl-8" />
			</div>
			<Select.Root type="single" bind:value={statusFilter}>
				<Select.Trigger size="sm" class="w-44">{statusLabel}</Select.Trigger>
				<Select.Content>
					<Select.Item value="activos">Solo activos</Select.Item>
					<Select.Item value="todos">Todos</Select.Item>
					{#each Object.entries(PROJECT_STATUS_LABELS) as [k, v] (k)}
						<Select.Item value={k}>{v}</Select.Item>
					{/each}
				</Select.Content>
			</Select.Root>
		</div>

		<!-- Table -->
		<Table.Root>
			<Table.Header>
				<Table.Row>
					<Table.Head>Folio</Table.Head>
					<Table.Head>Modelo</Table.Head>
					<Table.Head>Nivel</Table.Head>
					<Table.Head>Cliente</Table.Head>
					<Table.Head>Planta</Table.Head>
					<Table.Head>Estatus</Table.Head>
					<Table.Head class="text-right">Dias</Table.Head>
					<Table.Head>Avance</Table.Head>
					<Table.Head class="text-right">Cotizacion</Table.Head>
					<Table.Head class="text-right">Costo</Table.Head>
					<Table.Head class="text-right">Margen</Table.Head>
				</Table.Row>
			</Table.Header>
			<Table.Body>
				{#each filtered as project (project.id)}
					<Table.Row>
						<Table.Cell>
							<a href="/proyectos/{project.id}" class="text-primary font-mono text-sm font-bold hover:underline">{project.folioTPS}</a>
						</Table.Cell>
						<Table.Cell>{project.vehicleModel}</Table.Cell>
						<Table.Cell class="text-muted-foreground text-xs">{ARMOR_LEVEL_LABELS[project.armorLevel]}</Table.Cell>
						<Table.Cell class="max-w-37.5 truncate">{project.clientName}</Table.Cell>
						<Table.Cell class="text-muted-foreground text-xs">{PLANT_LABELS[project.plant]}</Table.Cell>
						<Table.Cell>
							<StatusBadge label={PROJECT_STATUS_LABELS[project.status]} colorClass={PROJECT_STATUS_COLORS[project.status]} />
						</Table.Cell>
						<Table.Cell class="text-right font-mono text-xs tabular-nums">
							{project.daysInProduction > 0 ? `${project.daysInProduction}d` : '---'}
						</Table.Cell>
						<Table.Cell>
							<div class="flex items-center gap-2">
								<Progress value={project.progressPercent} max={100} class="h-1.5 w-14" />
								<span class="text-muted-foreground font-mono text-xs tabular-nums">{project.progressPercent}%</span>
							</div>
						</Table.Cell>
						<Table.Cell class="text-right font-mono text-xs tabular-nums">{formatCurrency(project.quotationAmount)}</Table.Cell>
						<Table.Cell class="text-right font-mono text-xs tabular-nums">{formatCurrency(project.totalCost)}</Table.Cell>
						<Table.Cell class="text-right font-mono text-xs tabular-nums">
							<span class={project.estimatedMargin >= 20 ? 'text-primary' : project.estimatedMargin >= 10 ? 'text-chart-4' : 'text-destructive'}>
								{project.estimatedMargin > 0 ? `${project.estimatedMargin.toFixed(1)}%` : '---'}
							</span>
						</Table.Cell>
					</Table.Row>
				{/each}
			</Table.Body>
		</Table.Root>

		{#if filtered.length === 0}
			<Empty.Root class="border-0">
				<Empty.Header>
					<Empty.Media variant="icon">
						<FolderKanban />
					</Empty.Media>
					<Empty.Title>Sin resultados</Empty.Title>
					<Empty.Description>No se encontraron proyectos con los filtros seleccionados.</Empty.Description>
				</Empty.Header>
			</Empty.Root>
		{/if}
	</Card.Content>
</Card.Root>
