<script lang="ts">
	import { page } from '$app/state';
	import { useStore } from '$lib/tps/store.svelte.js';
	import StatusBadge from '$lib/tps/components/status-badge.svelte';
	import {
		PROJECT_STATUS_LABELS,
		PROJECT_STATUS_COLORS,
		PROJECT_STAGE_ORDER,
		ARMOR_LEVEL_LABELS,
		PLANT_LABELS,
		COST_TYPE_LABELS
	} from '$lib/tps/constants.js';
	import { formatCurrency, formatDate } from '$lib/tps/utils.js';
	import type { CostType } from '$lib/tps/types.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Table from '$lib/components/ui/table/index.js';
	import * as Empty from '$lib/components/ui/empty/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Progress } from '$lib/components/ui/progress/index.js';
	import ArrowLeft from '@lucide/svelte/icons/arrow-left';
	import CheckCircle2 from '@lucide/svelte/icons/circle-check-big';
	import Circle from '@lucide/svelte/icons/circle';
	import ChevronRight from '@lucide/svelte/icons/chevron-right';
	import FileText from '@lucide/svelte/icons/file-text';
	import DollarSign from '@lucide/svelte/icons/dollar-sign';
	import Clock from '@lucide/svelte/icons/clock';

	const store = useStore();
	const app = $derived(store.state);
	const id = $derived(page.params.id);

	const project = $derived(app.projects.find((p) => p.id === id));
	const currentStageIdx = $derived(project ? PROJECT_STAGE_ORDER.indexOf(project.status) : -1);
	const linkedBom = $derived(project?.bomId ? app.boms.find((b) => b.id === project.bomId) : null);

	const costsByType = $derived.by(() => {
		const m: Record<string, number> = {};
		if (project) project.costs.forEach((c) => (m[c.type] = (m[c.type] || 0) + c.amount));
		return m;
	});
</script>

{#if !project}
	<Empty.Root>
		<Empty.Header>
			<Empty.Title>Proyecto no encontrado</Empty.Title>
			<Empty.Description>El proyecto solicitado no existe o fue eliminado.</Empty.Description>
		</Empty.Header>
		<Empty.Content>
			<Button href="/proyectos" variant="outline">Volver al listado</Button>
		</Empty.Content>
	</Empty.Root>
{:else}
	<!-- Header -->
	<div class="flex flex-wrap items-center gap-3">
		<Button href="/proyectos" variant="outline" size="icon" class="size-8">
			<ArrowLeft />
		</Button>
		<div class="flex-1">
			<div class="flex items-center gap-3">
				<h1 class="text-primary font-mono text-2xl font-bold">{project.folioTPS}</h1>
				<StatusBadge label={PROJECT_STATUS_LABELS[project.status]} colorClass={PROJECT_STATUS_COLORS[project.status]} />
			</div>
			<p class="text-muted-foreground text-sm">
				{project.vehicleModel} / {ARMOR_LEVEL_LABELS[project.armorLevel]} / {project.clientName} / {PLANT_LABELS[project.plant]}
			</p>
		</div>
	</div>

	<!-- Timeline -->
	<Card.Root>
		<Card.Header>
			<Card.Title>Timeline del Proyecto</Card.Title>
		</Card.Header>
		<Card.Content>
			<div class="flex items-center gap-0 overflow-x-auto pb-2">
				{#each PROJECT_STAGE_ORDER as stageName, idx (stageName)}
					{@const stage = project.stages.find((s) => s.name === stageName)}
					{@const isCurrent = project.status === stageName}
					{@const isCompleted = idx < currentStageIdx}
					<div class="flex shrink-0 items-center">
						<div class="flex flex-col items-center gap-1 px-2 {isCurrent ? 'scale-110' : ''}">
							<div
								class="flex h-8 w-8 items-center justify-center rounded-full transition-all {isCompleted
									? 'bg-primary text-primary-foreground'
									: isCurrent
										? 'bg-primary text-primary-foreground ring-primary/30 ring-2'
										: 'bg-secondary text-muted-foreground'}"
							>
								{#if isCompleted}
									<CheckCircle2 class="h-4 w-4" />
								{:else}
									<Circle class="h-4 w-4" />
								{/if}
							</div>
							<span
								class="max-w-15 text-center text-[10px] leading-tight {isCurrent
									? 'text-primary font-semibold'
									: isCompleted
										? 'text-card-foreground'
										: 'text-muted-foreground'}"
							>
								{PROJECT_STATUS_LABELS[stageName]}
							</span>
							{#if stage?.startedAt}
								<span class="text-muted-foreground text-[9px]">{stage.startedAt.substring(5)}</span>
							{/if}
						</div>
						{#if idx < PROJECT_STAGE_ORDER.length - 1}
							<div class="h-0.5 w-6 {isCompleted ? 'bg-primary' : 'bg-border'}"></div>
						{/if}
					</div>
				{/each}
			</div>
		</Card.Content>
	</Card.Root>

	<!-- Stats Cards -->
	<div class="grid grid-cols-2 gap-4 md:grid-cols-4 *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:shadow-xs">
		<Card.Root>
			<Card.Header>
				<Card.Description>Cotizacion</Card.Description>
				<Card.Title class="text-lg font-bold tabular-nums">{formatCurrency(project.quotationAmount)}</Card.Title>
			</Card.Header>
		</Card.Root>
		<Card.Root>
			<Card.Header>
				<Card.Description>Costo Acumulado</Card.Description>
				<Card.Title class="text-lg font-bold tabular-nums">{formatCurrency(project.totalCost)}</Card.Title>
			</Card.Header>
		</Card.Root>
		<Card.Root>
			<Card.Header>
				<Card.Description>Margen Estimado</Card.Description>
				<Card.Title
					class="text-lg font-bold tabular-nums {project.estimatedMargin >= 20
						? 'text-primary'
						: project.estimatedMargin >= 10
							? 'text-chart-4'
							: 'text-destructive'}"
				>
					{project.estimatedMargin > 0 ? `${project.estimatedMargin.toFixed(1)}%` : '---'}
				</Card.Title>
			</Card.Header>
		</Card.Root>
		<Card.Root>
			<Card.Header>
				<Card.Description>Dias en Produccion</Card.Description>
				<Card.Title class="flex items-center gap-1 text-lg font-bold tabular-nums">
					<Clock class="text-muted-foreground size-4" />
					{project.daysInProduction > 0 ? project.daysInProduction : '---'}
				</Card.Title>
			</Card.Header>
		</Card.Root>
	</div>

	<div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
		<!-- Cost Breakdown -->
		<Card.Root>
			<Card.Header>
				<Card.Title class="flex items-center gap-2">
					<DollarSign class="text-primary size-4" /> Desglose de Costos
				</Card.Title>
			</Card.Header>
			<Card.Content>
				{#each Object.entries(COST_TYPE_LABELS) as [type, label] (type)}
					{@const amount = costsByType[type] || 0}
					{@const percent = project.totalCost > 0 ? (amount / project.totalCost) * 100 : 0}
					<div class="border-border/30 flex items-center justify-between border-b py-2 last:border-0">
						<span class="text-muted-foreground text-xs">{label}</span>
						<div class="flex items-center gap-3">
							<Progress value={percent} max={100} class="h-1.5 w-20 *:data-[slot=progress-indicator]:bg-chart-2" />
							<span class="text-card-foreground w-24 text-right font-mono text-xs tabular-nums">{formatCurrency(amount)}</span>
							<span class="text-muted-foreground w-10 text-right font-mono text-xs tabular-nums">{percent.toFixed(0)}%</span>
						</div>
					</div>
				{/each}
				<div class="border-border mt-2 flex items-center justify-between border-t pt-3">
					<span class="text-card-foreground text-sm font-semibold">Total</span>
					<span class="text-card-foreground font-mono text-sm font-bold tabular-nums">{formatCurrency(project.totalCost)}</span>
				</div>
			</Card.Content>
		</Card.Root>

		<!-- Estado de Resultados -->
		<Card.Root>
			<Card.Header>
				<Card.Title>Estado de Resultados del Proyecto</Card.Title>
			</Card.Header>
			<Card.Content class="flex flex-col gap-2">
				<div class="flex items-center justify-between py-2">
					<span class="text-card-foreground text-sm">Precio de Venta (Cotizacion)</span>
					<span class="text-card-foreground font-mono text-sm font-bold tabular-nums">{formatCurrency(project.quotationAmount)}</span>
				</div>
				<div class="flex items-center justify-between py-2">
					<span class="text-card-foreground text-sm">(-) Costo Total</span>
					<span class="text-destructive font-mono text-sm tabular-nums">-{formatCurrency(project.totalCost)}</span>
				</div>
				<div class="border-border mt-1 flex items-center justify-between border-t py-2 pt-3">
					<span class="text-card-foreground text-sm font-semibold">Utilidad Bruta</span>
					<span
						class="font-mono text-lg font-bold tabular-nums {project.quotationAmount - project.totalCost >= 0
							? 'text-primary'
							: 'text-destructive'}"
					>
						{formatCurrency(project.quotationAmount - project.totalCost)}
					</span>
				</div>
				<div class="flex items-center justify-between py-1">
					<span class="text-muted-foreground text-xs">Margen %</span>
					<span
						class="font-mono text-sm font-semibold tabular-nums {project.estimatedMargin >= 20
							? 'text-primary'
							: project.estimatedMargin >= 10
								? 'text-chart-4'
								: 'text-destructive'}"
					>
						{project.estimatedMargin > 0 ? `${project.estimatedMargin.toFixed(1)}%` : '---'}
					</span>
				</div>
			</Card.Content>
		</Card.Root>
	</div>

	<!-- Linked BOM -->
	{#if linkedBom}
		<Card.Root>
			<Card.Header>
				<Card.Title>BOM Vinculado</Card.Title>
			</Card.Header>
			<Card.Content>
				<a href="/lmat/boms/{linkedBom.id}" class="text-primary flex items-center gap-2 text-sm hover:underline">
					<span class="font-mono">{linkedBom.specificationCode}</span>
					<ChevronRight class="h-4 w-4" />
					<span class="text-muted-foreground">{linkedBom.vehicleModel} - {ARMOR_LEVEL_LABELS[linkedBom.armorLevel]}</span>
				</a>
			</Card.Content>
		</Card.Root>
	{/if}

	<!-- Documents -->
	<Card.Root>
		<Card.Header>
			<Card.Title class="flex items-center gap-2">
				<FileText class="text-primary size-4" /> Documentos Vinculados
			</Card.Title>
		</Card.Header>
		<Card.Content>
			{#if project.documents.length > 0}
				<Table.Root>
					<Table.Header>
						<Table.Row>
							<Table.Head>Tipo</Table.Head>
							<Table.Head>Descripcion</Table.Head>
							<Table.Head>Referencia</Table.Head>
							<Table.Head>Fecha</Table.Head>
						</Table.Row>
					</Table.Header>
					<Table.Body>
						{#each project.documents as doc (doc.id)}
							<Table.Row>
								<Table.Cell>
									<StatusBadge label={doc.type.toUpperCase()} colorClass="bg-secondary text-foreground" />
								</Table.Cell>
								<Table.Cell>{doc.label}</Table.Cell>
								<Table.Cell class="text-muted-foreground font-mono text-xs">{doc.reference}</Table.Cell>
								<Table.Cell class="text-muted-foreground text-xs">{formatDate(doc.date)}</Table.Cell>
							</Table.Row>
						{/each}
					</Table.Body>
				</Table.Root>
			{:else}
				<Empty.Root class="border-0">
					<Empty.Header>
						<Empty.Media variant="icon">
							<FileText />
						</Empty.Media>
						<Empty.Title>No hay documentos vinculados</Empty.Title>
					</Empty.Header>
				</Empty.Root>
			{/if}
		</Card.Content>
	</Card.Root>

	<!-- Cost Detail Table -->
	{#if project.costs.length > 0}
		<Card.Root>
			<Card.Header>
				<Card.Title>Detalle de Costos</Card.Title>
			</Card.Header>
			<Card.Content>
				<Table.Root>
					<Table.Header>
						<Table.Row>
							<Table.Head>Fecha</Table.Head>
							<Table.Head>Tipo</Table.Head>
							<Table.Head>Descripcion</Table.Head>
							<Table.Head>Fuente</Table.Head>
							<Table.Head class="text-right">Monto</Table.Head>
						</Table.Row>
					</Table.Header>
					<Table.Body>
						{#each project.costs as cost (cost.id)}
							<Table.Row>
								<Table.Cell class="text-muted-foreground text-xs">{formatDate(cost.date)}</Table.Cell>
								<Table.Cell>
									<StatusBadge label={COST_TYPE_LABELS[cost.type as CostType]} colorClass="bg-secondary text-foreground" />
								</Table.Cell>
								<Table.Cell>{cost.description}</Table.Cell>
								<Table.Cell class="text-muted-foreground text-xs">{cost.source}</Table.Cell>
								<Table.Cell class="text-right font-mono tabular-nums">{formatCurrency(cost.amount)}</Table.Cell>
							</Table.Row>
						{/each}
					</Table.Body>
				</Table.Root>
			</Card.Content>
		</Card.Root>
	{/if}

	<!-- Metadata -->
	<div class="text-muted-foreground flex items-center gap-4 text-xs">
		<span>Creado: {formatDate(project.createdAt)}</span>
		<span>Modificado: {formatDate(project.updatedAt)}</span>
		<span>Avance: {project.progressPercent}%</span>
	</div>
{/if}
