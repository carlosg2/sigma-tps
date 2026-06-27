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
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Table from '$lib/components/ui/table/index.js';
	import * as Alert from '$lib/components/ui/alert/index.js';
	import { Progress } from '$lib/components/ui/progress/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
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
	import ArrowRight from '@lucide/svelte/icons/arrow-right';

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

	const gradient =
		'*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs';

	const quickActions = [
		{ href: '/lmat', icon: Layers, label: 'LMAT', desc: 'Dashboard de listas de materiales' },
		{ href: '/lmat/ecn', icon: GitBranch, label: 'ECN', desc: `${pendingECNs} cambios pendientes` },
		{ href: '/lmat/kits', icon: Boxes, label: 'Kits Surtimiento', desc: `${pendingKits} kits por surtir` },
		{ href: '/lmat/validacion', icon: FileStack, label: 'Validacion', desc: 'Dashboard multi-depto' }
	];
</script>

<!-- Stats Grid -->
<div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4 {gradient}">
	<StatCard
		label="Articulos en Catalogo"
		value={totalArticles}
		subtitle={`${activeArticles} activos · Completitud ${avgCompleteness}%`}
		icon={Package}
	/>
	<StatCard
		label="BOMs / Especificaciones"
		value={totalBOMs}
		subtitle={`${approvedBOMs} aprobados · Salud ${avgHealth}%`}
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
<div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4 {gradient}">
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
<div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
	<!-- Projects table -->
	<Card.Root>
		<Card.Header>
			<Card.Title>Proyectos Activos</Card.Title>
			<Card.Action>
				<Button href="/proyectos" variant="link" size="sm">
					Ver todos <ArrowRight data-icon="inline-end" />
				</Button>
			</Card.Action>
		</Card.Header>
		<Card.Content>
			<Table.Root>
				<Table.Header>
					<Table.Row>
						<Table.Head>Folio</Table.Head>
						<Table.Head>Modelo</Table.Head>
						<Table.Head>Estatus</Table.Head>
						<Table.Head class="text-right">Margen</Table.Head>
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{#each activeProjectsList as project (project.id)}
						<Table.Row>
							<Table.Cell>
								<a href="/proyectos/{project.id}" class="text-primary font-mono hover:underline">
									{project.folioTPS}
								</a>
							</Table.Cell>
							<Table.Cell>{project.vehicleModel}</Table.Cell>
							<Table.Cell>
								<StatusBadge
									label={PROJECT_STATUS_LABELS[project.status]}
									colorClass={PROJECT_STATUS_COLORS[project.status]}
								/>
							</Table.Cell>
							<Table.Cell class="text-right font-mono tabular-nums">
								{project.estimatedMargin > 0 ? `${project.estimatedMargin.toFixed(1)}%` : '---'}
							</Table.Cell>
						</Table.Row>
					{/each}
				</Table.Body>
			</Table.Root>
		</Card.Content>
	</Card.Root>

	<!-- Implementation Progress -->
	<Card.Root>
		<Card.Header>
			<Card.Title>Progreso de Implementacion</Card.Title>
		</Card.Header>
		<Card.Content class="flex flex-col gap-4">
			<div class="flex flex-col gap-1.5">
				<div class="flex items-center justify-between text-sm">
					<span class="text-muted-foreground">Checklist Go-Live</span>
					<span class="font-mono tabular-nums">{checklistDone}/{app.checklist.length}</span>
				</div>
				<Progress value={(checklistDone / app.checklist.length) * 100} max={100} />
			</div>
			<div class="flex flex-col gap-1.5">
				<div class="flex items-center justify-between text-sm">
					<span class="text-muted-foreground">Datos Maestros Articulos</span>
					<span class="font-mono tabular-nums">{avgCompleteness}%</span>
				</div>
				<Progress value={avgCompleteness} max={100} />
			</div>
			<div class="flex flex-col gap-1.5">
				<div class="flex items-center justify-between text-sm">
					<span class="text-muted-foreground">Salud de BOMs</span>
					<span class="font-mono tabular-nums">{avgHealth}%</span>
				</div>
				<Progress value={avgHealth} max={100} />
			</div>
			<div class="flex flex-col gap-1.5">
				<div class="flex items-center justify-between text-sm">
					<span class="text-muted-foreground">GAPs Resueltos</span>
					<span class="font-mono tabular-nums">{Math.round((resolvedGaps / totalGaps) * 100)}%</span>
				</div>
				<Progress value={(resolvedGaps / totalGaps) * 100} max={100} />
			</div>

			<div class="flex flex-col gap-2">
				{#if criticalGaps > 0}
					<Alert.Root variant="destructive">
						<AlertTriangle />
						<Alert.Title>{criticalGaps} GAPs criticos sin resolver</Alert.Title>
					</Alert.Root>
				{/if}
				{#if incompleteArticles > 0}
					<Alert.Root>
						<AlertTriangle />
						<Alert.Title>{incompleteArticles} articulos con datos incompletos</Alert.Title>
					</Alert.Root>
				{/if}
				{#if avgMargin > 0}
					<Alert.Root>
						<TrendingUp />
						<Alert.Title>Margen promedio: {avgMargin.toFixed(1)}%</Alert.Title>
					</Alert.Root>
				{/if}
			</div>
		</Card.Content>
	</Card.Root>
</div>

<!-- LMAT Quick Actions -->
<div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
	{#each quickActions as action (action.href)}
		{@const Icon = action.icon}
		<a href={action.href} class="group">
			<Card.Root class="hover:bg-muted/50 transition-colors">
				<Card.Header>
					<div class="flex items-center gap-3">
						<div class="bg-primary/10 text-primary flex size-10 items-center justify-center rounded-lg">
							<Icon class="size-5" />
						</div>
						<div class="grid gap-0.5">
							<Card.Title class="text-sm">{action.label}</Card.Title>
							<Card.Description>{action.desc}</Card.Description>
						</div>
					</div>
				</Card.Header>
			</Card.Root>
		</a>
	{/each}
</div>

<!-- Critical GAPs -->
<Card.Root>
	<Card.Header>
		<Card.Title>GAPs Criticos Pendientes</Card.Title>
		<Card.Action>
			<Button href="/lmat/validacion" variant="link" size="sm">
				Ver validacion <ArrowRight data-icon="inline-end" />
			</Button>
		</Card.Action>
	</Card.Header>
	<Card.Content>
		<Table.Root>
			<Table.Header>
				<Table.Row>
					<Table.Head>Area</Table.Head>
					<Table.Head>Descripcion</Table.Head>
					<Table.Head>Estatus</Table.Head>
					<Table.Head>Asignado</Table.Head>
				</Table.Row>
			</Table.Header>
			<Table.Body>
				{#each criticalGapsList as gap (gap.id)}
					<Table.Row>
						<Table.Cell>{gap.area}</Table.Cell>
						<Table.Cell class="max-w-md truncate">{gap.description}</Table.Cell>
						<Table.Cell>
							<StatusBadge label={GAP_STATUS_LABELS[gap.status]} colorClass={GAP_STATUS_COLORS[gap.status]} />
						</Table.Cell>
						<Table.Cell class="text-muted-foreground">{gap.assignedTo}</Table.Cell>
					</Table.Row>
				{/each}
			</Table.Body>
		</Table.Root>
	</Card.Content>
</Card.Root>
