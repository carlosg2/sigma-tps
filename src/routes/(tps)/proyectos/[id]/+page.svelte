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
	<div class="flex flex-col items-center justify-center gap-4 py-20">
		<p class="text-muted-foreground">Proyecto no encontrado</p>
		<a href="/proyectos" class="text-primary text-sm hover:underline">Volver al listado</a>
	</div>
{:else}
	<div class="flex flex-col gap-6">
		<!-- Header -->
		<div class="flex items-center gap-3">
			<a
				href="/proyectos"
				class="border-border hover:bg-secondary flex h-8 w-8 items-center justify-center rounded-md border transition-colors"
			>
				<ArrowLeft class="text-foreground h-4 w-4" />
			</a>
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
		<div class="border-border bg-card rounded-lg border p-4">
			<h3 class="text-card-foreground mb-4 text-sm font-semibold">Timeline del Proyecto</h3>
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
								class="max-w-[60px] text-center text-[10px] leading-tight {isCurrent
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
		</div>

		<!-- Stats Cards -->
		<div class="grid grid-cols-2 gap-4 md:grid-cols-4">
			<div class="border-border bg-card rounded-lg border p-3">
				<span class="text-muted-foreground text-xs">Cotizacion</span>
				<p class="text-card-foreground text-lg font-bold">{formatCurrency(project.quotationAmount)}</p>
			</div>
			<div class="border-border bg-card rounded-lg border p-3">
				<span class="text-muted-foreground text-xs">Costo Acumulado</span>
				<p class="text-card-foreground text-lg font-bold">{formatCurrency(project.totalCost)}</p>
			</div>
			<div class="border-border bg-card rounded-lg border p-3">
				<span class="text-muted-foreground text-xs">Margen Estimado</span>
				<p
					class="text-lg font-bold {project.estimatedMargin >= 20
						? 'text-primary'
						: project.estimatedMargin >= 10
							? 'text-chart-4'
							: 'text-destructive-foreground'}"
				>
					{project.estimatedMargin > 0 ? `${project.estimatedMargin.toFixed(1)}%` : '---'}
				</p>
			</div>
			<div class="border-border bg-card rounded-lg border p-3">
				<span class="text-muted-foreground text-xs">Dias en Produccion</span>
				<p class="text-card-foreground flex items-center gap-1 text-lg font-bold">
					<Clock class="text-muted-foreground h-4 w-4" />
					{project.daysInProduction > 0 ? project.daysInProduction : '---'}
				</p>
			</div>
		</div>

		<div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
			<!-- Cost Breakdown -->
			<div class="border-border bg-card rounded-lg border">
				<div class="border-border border-b px-4 py-3">
					<h3 class="text-card-foreground flex items-center gap-2 text-sm font-semibold">
						<DollarSign class="text-primary h-4 w-4" /> Desglose de Costos
					</h3>
				</div>
				<div class="p-4">
					{#each Object.entries(COST_TYPE_LABELS) as [type, label] (type)}
						{@const amount = costsByType[type] || 0}
						{@const percent = project.totalCost > 0 ? (amount / project.totalCost) * 100 : 0}
						<div class="border-border/30 flex items-center justify-between border-b py-2 last:border-0">
							<span class="text-muted-foreground text-xs">{label}</span>
							<div class="flex items-center gap-3">
								<div class="bg-secondary h-1.5 w-20 rounded-full">
									<div class="bg-chart-2 h-1.5 rounded-full transition-all" style="width: {percent}%"></div>
								</div>
								<span class="text-card-foreground w-24 text-right font-mono text-xs">{formatCurrency(amount)}</span>
								<span class="text-muted-foreground w-10 text-right font-mono text-xs">{percent.toFixed(0)}%</span>
							</div>
						</div>
					{/each}
					<div class="border-border mt-2 flex items-center justify-between border-t pt-3">
						<span class="text-card-foreground text-sm font-semibold">Total</span>
						<span class="text-card-foreground font-mono text-sm font-bold">{formatCurrency(project.totalCost)}</span>
					</div>
				</div>
			</div>

			<!-- Estado de Resultados -->
			<div class="border-border bg-card rounded-lg border">
				<div class="border-border border-b px-4 py-3">
					<h3 class="text-card-foreground text-sm font-semibold">Estado de Resultados del Proyecto</h3>
				</div>
				<div class="flex flex-col gap-2 p-4">
					<div class="flex items-center justify-between py-2">
						<span class="text-card-foreground text-sm">Precio de Venta (Cotizacion)</span>
						<span class="text-card-foreground font-mono text-sm font-bold">{formatCurrency(project.quotationAmount)}</span>
					</div>
					<div class="flex items-center justify-between py-2">
						<span class="text-card-foreground text-sm">(-) Costo Total</span>
						<span class="text-destructive-foreground font-mono text-sm">-{formatCurrency(project.totalCost)}</span>
					</div>
					<div class="border-border mt-1 flex items-center justify-between border-t py-2 pt-3">
						<span class="text-card-foreground text-sm font-semibold">Utilidad Bruta</span>
						<span
							class="font-mono text-lg font-bold {project.quotationAmount - project.totalCost >= 0
								? 'text-primary'
								: 'text-destructive-foreground'}"
						>
							{formatCurrency(project.quotationAmount - project.totalCost)}
						</span>
					</div>
					<div class="flex items-center justify-between py-1">
						<span class="text-muted-foreground text-xs">Margen %</span>
						<span
							class="font-mono text-sm font-semibold {project.estimatedMargin >= 20
								? 'text-primary'
								: project.estimatedMargin >= 10
									? 'text-chart-4'
									: 'text-destructive-foreground'}"
						>
							{project.estimatedMargin > 0 ? `${project.estimatedMargin.toFixed(1)}%` : '---'}
						</span>
					</div>
				</div>
			</div>
		</div>

		<!-- Linked BOM -->
		{#if linkedBom}
			<div class="border-border bg-card rounded-lg border p-4">
				<h3 class="text-card-foreground mb-2 text-sm font-semibold">BOM Vinculado</h3>
				<a href="/lmat/boms/{linkedBom.id}" class="text-primary flex items-center gap-2 text-sm hover:underline">
					<span class="font-mono">{linkedBom.specificationCode}</span>
					<ChevronRight class="h-4 w-4" />
					<span class="text-muted-foreground">{linkedBom.vehicleModel} - {ARMOR_LEVEL_LABELS[linkedBom.armorLevel]}</span>
				</a>
			</div>
		{/if}

		<!-- Documents -->
		<div class="border-border bg-card rounded-lg border">
			<div class="border-border border-b px-4 py-3">
				<h3 class="text-card-foreground flex items-center gap-2 text-sm font-semibold">
					<FileText class="text-primary h-4 w-4" /> Documentos Vinculados
				</h3>
			</div>
			{#if project.documents.length > 0}
				<table class="w-full text-sm">
					<thead>
						<tr class="border-border border-b text-left">
							<th class="text-muted-foreground px-4 py-2 text-xs font-medium">Tipo</th>
							<th class="text-muted-foreground px-4 py-2 text-xs font-medium">Descripcion</th>
							<th class="text-muted-foreground px-4 py-2 text-xs font-medium">Referencia</th>
							<th class="text-muted-foreground px-4 py-2 text-xs font-medium">Fecha</th>
						</tr>
					</thead>
					<tbody>
						{#each project.documents as doc (doc.id)}
							<tr class="border-border/30 border-b">
								<td class="px-4 py-2">
									<StatusBadge label={doc.type.toUpperCase()} colorClass="bg-secondary text-foreground" />
								</td>
								<td class="text-card-foreground px-4 py-2">{doc.label}</td>
								<td class="text-muted-foreground px-4 py-2 font-mono text-xs">{doc.reference}</td>
								<td class="text-muted-foreground px-4 py-2 text-xs">{formatDate(doc.date)}</td>
							</tr>
						{/each}
					</tbody>
				</table>
			{:else}
				<div class="text-muted-foreground px-4 py-6 text-center text-sm">No hay documentos vinculados.</div>
			{/if}
		</div>

		<!-- Cost Detail Table -->
		{#if project.costs.length > 0}
			<div class="border-border bg-card overflow-hidden rounded-lg border">
				<div class="border-border border-b px-4 py-3">
					<h3 class="text-card-foreground text-sm font-semibold">Detalle de Costos</h3>
				</div>
				<table class="w-full text-sm">
					<thead>
						<tr class="border-border border-b text-left">
							<th class="text-muted-foreground px-4 py-2 text-xs font-medium">Fecha</th>
							<th class="text-muted-foreground px-4 py-2 text-xs font-medium">Tipo</th>
							<th class="text-muted-foreground px-4 py-2 text-xs font-medium">Descripcion</th>
							<th class="text-muted-foreground px-4 py-2 text-xs font-medium">Fuente</th>
							<th class="text-muted-foreground px-4 py-2 text-right text-xs font-medium">Monto</th>
						</tr>
					</thead>
					<tbody>
						{#each project.costs as cost (cost.id)}
							<tr class="border-border/30 border-b">
								<td class="text-muted-foreground px-4 py-1.5 text-xs">{formatDate(cost.date)}</td>
								<td class="px-4 py-1.5">
									<StatusBadge label={COST_TYPE_LABELS[cost.type as CostType]} colorClass="bg-secondary text-foreground" />
								</td>
								<td class="text-card-foreground px-4 py-1.5">{cost.description}</td>
								<td class="text-muted-foreground px-4 py-1.5 text-xs">{cost.source}</td>
								<td class="text-card-foreground px-4 py-1.5 text-right font-mono">{formatCurrency(cost.amount)}</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{/if}

		<!-- Metadata -->
		<div class="text-muted-foreground flex items-center gap-4 text-xs">
			<span>Creado: {formatDate(project.createdAt)}</span>
			<span>Modificado: {formatDate(project.updatedAt)}</span>
			<span>Avance: {project.progressPercent}%</span>
		</div>
	</div>
{/if}
