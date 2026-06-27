<script lang="ts">
	import { useStore } from '$lib/tps/store.svelte.js';
	import StatCard from '$lib/tps/components/stat-card.svelte';
	import StatusBadge from '$lib/tps/components/status-badge.svelte';
	import {
		PROJECT_STATUS_LABELS,
		PROJECT_STATUS_COLORS,
		GAP_STATUS_LABELS,
		GAP_STATUS_COLORS
	} from '$lib/tps/constants.js';
	import Package from '@lucide/svelte/icons/package';
	import Layers from '@lucide/svelte/icons/layers';
	import FolderKanban from '@lucide/svelte/icons/folder-kanban';
	import ClipboardCheck from '@lucide/svelte/icons/clipboard-check';
	import AlertTriangle from '@lucide/svelte/icons/triangle-alert';
	import TrendingUp from '@lucide/svelte/icons/trending-up';
	import FileStack from '@lucide/svelte/icons/file-stack';
	import GitBranch from '@lucide/svelte/icons/git-branch';
	import Boxes from '@lucide/svelte/icons/boxes';
	import Car from '@lucide/svelte/icons/car';

	const store = useStore();
	const app = $derived(store.state);

	const totalArticles = $derived(app.articles.length);
	const activeArticles = $derived(app.articles.filter((a) => a.status === 'activo').length);
	const avgCompleteness = $derived(
		Math.round(app.articles.reduce((s, a) => s + a.completeness, 0) / (totalArticles || 1))
	);
	const incompleteArticles = $derived(app.articles.filter((a) => a.completeness < 80).length);

	const totalBOMs = $derived(app.boms.length);
	const approvedBOMs = $derived(app.boms.filter((b) => b.status === 'aprobado').length);
	const avgHealth = $derived(
		Math.round(app.boms.reduce((s, b) => s + b.healthPercent, 0) / (totalBOMs || 1))
	);

	const activeProjects = $derived(
		app.projects.filter((p) => !['entregado', 'cancelado'].includes(p.status)).length
	);
	const inProduction = $derived(app.projects.filter((p) => p.status === 'produccion').length);
	const avgMargin = $derived(
		app.projects.filter((p) => p.estimatedMargin > 0).reduce((s, p) => s + p.estimatedMargin, 0) /
			(app.projects.filter((p) => p.estimatedMargin > 0).length || 1)
	);

	const totalGaps = $derived(app.gaps.length);
	const resolvedGaps = $derived(app.gaps.filter((g) => g.status === 'resuelto').length);
	const criticalGaps = $derived(
		app.gaps.filter((g) => g.priority === 'critica' && g.status !== 'resuelto').length
	);
	const checklistDone = $derived(app.checklist.filter((c) => c.completed).length);

	const specifications = $derived(app.specifications ?? []);
	const ecns = $derived(app.ecns ?? []);
	const supplyKits = $derived(app.supplyKits ?? []);
	const releasedSpecs = $derived(specifications.filter((s) => s.status === 'liberado').length);
	const pendingECNs = $derived(
		ecns.filter((e) => !['completado', 'rechazado'].includes(e.status)).length
	);
	const pendingKits = $derived(supplyKits.filter((k) => k.status === 'pendiente').length);
	const bomsWithValidation = $derived(
		app.boms.filter((b) => b.departmentValidations?.every((v) => v.status === 'completado')).length
	);

	const activeProjectsList = $derived(
		app.projects.filter((p) => !['entregado', 'cancelado'].includes(p.status)).slice(0, 6)
	);
	const criticalGapsList = $derived(
		app.gaps.filter((g) => g.priority === 'critica' && g.status !== 'resuelto')
	);
</script>

<div class="flex flex-col gap-6">
	<!-- Title -->
	<div>
		<h1 class="text-foreground text-2xl font-bold">Dashboard General</h1>
		<p class="text-muted-foreground text-sm">
			Vista general del estado de la implementacion ERP de TPS
		</p>
	</div>

	<!-- Stats Grid -->
	<div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
		<StatCard
			label="Articulos en Catalogo"
			value={totalArticles}
			subtitle={`${activeArticles} activos / Completitud: ${avgCompleteness}%`}
			icon={Package}
		/>
		<StatCard
			label="BOMs / Especificaciones"
			value={totalBOMs}
			subtitle={`${approvedBOMs} aprobados / Salud: ${avgHealth}%`}
			icon={Layers}
		/>
		<StatCard
			label="Proyectos Activos"
			value={activeProjects}
			subtitle={`${inProduction} en produccion`}
			icon={FolderKanban}
		/>
		<StatCard
			label="GAPs Resueltos"
			value={`${resolvedGaps}/${totalGaps}`}
			subtitle={`${criticalGaps} criticos pendientes`}
			icon={ClipboardCheck}
		/>
	</div>

	<!-- LMAT 2.0 Stats -->
	<div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
		<StatCard
			label="Especificaciones Tecnicas"
			value={specifications.length}
			subtitle={`${releasedSpecs} liberadas para serie`}
			icon={Car}
		/>
		<StatCard
			label="ECNs Pendientes"
			value={pendingECNs}
			subtitle={`${ecns.filter((e) => e.status === 'completado').length} completados`}
			icon={GitBranch}
		/>
		<StatCard
			label="Kits Surtimiento"
			value={supplyKits.length}
			subtitle={`${pendingKits} pendientes de surtir`}
			icon={Boxes}
		/>
		<StatCard
			label="BOMs Validados"
			value={`${bomsWithValidation}/${totalBOMs}`}
			subtitle="Validacion multi-departamental"
			icon={FileStack}
		/>
	</div>

	<!-- Two column layout -->
	<div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
		<!-- Projects table -->
		<div class="border-border bg-card rounded-lg border">
			<div class="border-border flex items-center justify-between border-b px-4 py-3">
				<h3 class="text-card-foreground text-sm font-semibold">Proyectos Activos</h3>
				<a href="/proyectos" class="text-primary text-xs hover:underline">Ver todos</a>
			</div>
			<div class="overflow-x-auto">
				<table class="w-full text-sm">
					<thead>
						<tr class="border-border border-b text-left">
							<th class="text-muted-foreground px-4 py-2 text-xs font-medium">Folio</th>
							<th class="text-muted-foreground px-4 py-2 text-xs font-medium">Modelo</th>
							<th class="text-muted-foreground px-4 py-2 text-xs font-medium">Estatus</th>
							<th class="text-muted-foreground px-4 py-2 text-right text-xs font-medium">Margen</th>
						</tr>
					</thead>
					<tbody>
						{#each activeProjectsList as project (project.id)}
							<tr class="border-border/50 hover:bg-secondary/50 border-b transition-colors">
								<td class="px-4 py-2">
									<a
										href="/proyectos/{project.id}"
										class="text-primary font-mono hover:underline">{project.folioTPS}</a
									>
								</td>
								<td class="text-card-foreground px-4 py-2">{project.vehicleModel}</td>
								<td class="px-4 py-2">
									<StatusBadge
										label={PROJECT_STATUS_LABELS[project.status]}
										colorClass={PROJECT_STATUS_COLORS[project.status]}
									/>
								</td>
								<td class="text-card-foreground px-4 py-2 text-right font-mono">
									{project.estimatedMargin > 0 ? `${project.estimatedMargin.toFixed(1)}%` : '---'}
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>

		<!-- Implementation Progress -->
		<div class="border-border bg-card rounded-lg border">
			<div class="border-border flex items-center justify-between border-b px-4 py-3">
				<h3 class="text-card-foreground text-sm font-semibold">Progreso de Implementacion</h3>
			</div>
			<div class="flex flex-col gap-3 p-4">
				<!-- Checklist progress -->
				<div>
					<div class="mb-1 flex items-center justify-between">
						<span class="text-muted-foreground text-xs">Checklist Go-Live</span>
						<span class="text-card-foreground font-mono text-xs"
							>{checklistDone}/{app.checklist.length}</span
						>
					</div>
					<div class="bg-secondary h-2 rounded-full">
						<div
							class="bg-primary h-2 rounded-full transition-all"
							style="width: {(checklistDone / app.checklist.length) * 100}%"
						></div>
					</div>
				</div>

				<!-- Article completeness -->
				<div>
					<div class="mb-1 flex items-center justify-between">
						<span class="text-muted-foreground text-xs">Datos Maestros Articulos</span>
						<span class="text-card-foreground font-mono text-xs">{avgCompleteness}%</span>
					</div>
					<div class="bg-secondary h-2 rounded-full">
						<div class="bg-chart-2 h-2 rounded-full transition-all" style="width: {avgCompleteness}%"></div>
					</div>
				</div>

				<!-- BOM health -->
				<div>
					<div class="mb-1 flex items-center justify-between">
						<span class="text-muted-foreground text-xs">Salud de BOMs</span>
						<span class="text-card-foreground font-mono text-xs">{avgHealth}%</span>
					</div>
					<div class="bg-secondary h-2 rounded-full">
						<div class="bg-chart-4 h-2 rounded-full transition-all" style="width: {avgHealth}%"></div>
					</div>
				</div>

				<!-- GAPs -->
				<div>
					<div class="mb-1 flex items-center justify-between">
						<span class="text-muted-foreground text-xs">GAPs Resueltos</span>
						<span class="text-card-foreground font-mono text-xs"
							>{Math.round((resolvedGaps / totalGaps) * 100)}%</span
						>
					</div>
					<div class="bg-secondary h-2 rounded-full">
						<div
							class="bg-chart-5 h-2 rounded-full transition-all"
							style="width: {(resolvedGaps / totalGaps) * 100}%"
						></div>
					</div>
				</div>

				<!-- Alerts -->
				<div class="mt-2 flex flex-col gap-2">
					{#if criticalGaps > 0}
						<div class="bg-destructive/10 flex items-center gap-2 rounded-md px-3 py-2">
							<AlertTriangle class="text-destructive h-4 w-4" />
							<span class="text-destructive text-xs">{criticalGaps} GAPs criticos sin resolver</span>
						</div>
					{/if}
					{#if incompleteArticles > 0}
						<div class="bg-chart-4/10 flex items-center gap-2 rounded-md px-3 py-2">
							<AlertTriangle class="text-chart-4 h-4 w-4" />
							<span class="text-chart-4 text-xs"
								>{incompleteArticles} articulos con datos incompletos</span
							>
						</div>
					{/if}
					{#if avgMargin > 0}
						<div class="bg-primary/10 flex items-center gap-2 rounded-md px-3 py-2">
							<TrendingUp class="text-primary h-4 w-4" />
							<span class="text-primary text-xs">Margen promedio: {avgMargin.toFixed(1)}%</span>
						</div>
					{/if}
				</div>
			</div>
		</div>
	</div>

	<!-- LMAT Quick Actions -->
	<div class="grid grid-cols-1 gap-4 md:grid-cols-4">
		<a
			href="/lmat"
			class="border-border bg-card hover:bg-secondary/50 flex items-center gap-3 rounded-lg border p-4 transition-colors"
		>
			<div class="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-lg">
				<Layers class="text-primary h-5 w-5" />
			</div>
			<div>
				<span class="text-card-foreground text-sm font-medium">LMAT</span>
				<p class="text-muted-foreground text-xs">Dashboard de listas de materiales</p>
			</div>
		</a>
		<a
			href="/lmat/ecn"
			class="border-border bg-card hover:bg-secondary/50 flex items-center gap-3 rounded-lg border p-4 transition-colors"
		>
			<div class="bg-chart-4/10 flex h-10 w-10 items-center justify-center rounded-lg">
				<GitBranch class="text-chart-4 h-5 w-5" />
			</div>
			<div>
				<span class="text-card-foreground text-sm font-medium">ECN</span>
				<p class="text-muted-foreground text-xs">{pendingECNs} cambios pendientes</p>
			</div>
		</a>
		<a
			href="/lmat/kits"
			class="border-border bg-card hover:bg-secondary/50 flex items-center gap-3 rounded-lg border p-4 transition-colors"
		>
			<div class="bg-chart-2/10 flex h-10 w-10 items-center justify-center rounded-lg">
				<Boxes class="text-chart-2 h-5 w-5" />
			</div>
			<div>
				<span class="text-card-foreground text-sm font-medium">Kits Surtimiento</span>
				<p class="text-muted-foreground text-xs">{pendingKits} kits por surtir</p>
			</div>
		</a>
		<a
			href="/lmat/validacion"
			class="border-border bg-card hover:bg-secondary/50 flex items-center gap-3 rounded-lg border p-4 transition-colors"
		>
			<div class="bg-chart-5/10 flex h-10 w-10 items-center justify-center rounded-lg">
				<FileStack class="text-chart-5 h-5 w-5" />
			</div>
			<div>
				<span class="text-card-foreground text-sm font-medium">Validacion</span>
				<p class="text-muted-foreground text-xs">Dashboard multi-depto</p>
			</div>
		</a>
	</div>

	<!-- Critical GAPs -->
	<div class="border-border bg-card rounded-lg border">
		<div class="border-border flex items-center justify-between border-b px-4 py-3">
			<h3 class="text-card-foreground text-sm font-semibold">GAPs Criticos Pendientes</h3>
		</div>
		<div class="overflow-x-auto">
			<table class="w-full text-sm">
				<thead>
					<tr class="border-border border-b text-left">
						<th class="text-muted-foreground px-4 py-2 text-xs font-medium">Area</th>
						<th class="text-muted-foreground px-4 py-2 text-xs font-medium">Descripcion</th>
						<th class="text-muted-foreground px-4 py-2 text-xs font-medium">Estatus</th>
						<th class="text-muted-foreground px-4 py-2 text-xs font-medium">Asignado</th>
					</tr>
				</thead>
				<tbody>
					{#each criticalGapsList as gap (gap.id)}
						<tr class="border-border/50 hover:bg-secondary/50 border-b transition-colors">
							<td class="text-card-foreground px-4 py-2">{gap.area}</td>
							<td class="text-card-foreground max-w-md truncate px-4 py-2">{gap.description}</td>
							<td class="px-4 py-2">
								<StatusBadge
									label={GAP_STATUS_LABELS[gap.status]}
									colorClass={GAP_STATUS_COLORS[gap.status]}
								/>
							</td>
							<td class="text-muted-foreground px-4 py-2">{gap.assignedTo}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</div>
</div>
