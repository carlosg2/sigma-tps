<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { useStore } from '$lib/tps/store.svelte.js';
	import {
		BOM_STATUS_LABELS,
		BOM_STATUS_COLORS,
		ARMOR_LEVEL_LABELS,
		PLANT_LABELS,
		PLANT_CELLS,
		UDM_LABELS,
		BOM_MATURITY_LABELS,
		BOM_MATURITY_COLORS,
		BOM_MATURITY_DESCRIPTIONS,
		DEPT_VALIDATION_LABELS,
		DEPT_VALIDATION_COLORS,
		VALIDATION_DEPARTMENTS,
		ECN_STATUS_LABELS,
		ECN_STATUS_COLORS
	} from '$lib/tps/constants.js';
	import { formatDate } from '$lib/tps/utils.js';
	import type { BOMStatus, BOMMaturityStatus, DepartmentValidationStatus, BOMComponent } from '$lib/tps/types.js';
	import StatusBadge from '$lib/tps/components/status-badge.svelte';
	import StatCard from '$lib/tps/components/stat-card.svelte';
	import BomTree from '$lib/tps/components/bom-tree.svelte';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Table from '$lib/components/ui/table/index.js';
	import * as Tabs from '$lib/components/ui/tabs/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import * as Alert from '$lib/components/ui/alert/index.js';
	import * as Empty from '$lib/components/ui/empty/index.js';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Progress } from '$lib/components/ui/progress/index.js';
	import { Textarea } from '$lib/components/ui/textarea/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import { cn } from '$lib/utils.js';
	import ArrowLeft from '@lucide/svelte/icons/arrow-left';
	import Copy from '@lucide/svelte/icons/copy';
	import Download from '@lucide/svelte/icons/download';
	import Printer from '@lucide/svelte/icons/printer';
	import GitBranch from '@lucide/svelte/icons/git-branch';
	import ListTree from '@lucide/svelte/icons/list-tree';
	import Boxes from '@lucide/svelte/icons/boxes';
	import TriangleAlert from '@lucide/svelte/icons/triangle-alert';
	import CircleCheckBig from '@lucide/svelte/icons/circle-check-big';
	import ChevronRight from '@lucide/svelte/icons/chevron-right';
	import List from '@lucide/svelte/icons/list';
	import Plus from '@lucide/svelte/icons/plus';
	import History from '@lucide/svelte/icons/history';
	import Eye from '@lucide/svelte/icons/eye';
	import X from '@lucide/svelte/icons/x';
	import ShieldCheck from '@lucide/svelte/icons/shield-check';
	import Users from '@lucide/svelte/icons/users';
	import Clock from '@lucide/svelte/icons/clock';
	import CircleX from '@lucide/svelte/icons/circle-x';
	import Lock from '@lucide/svelte/icons/lock';
	import FileWarning from '@lucide/svelte/icons/file-warning';
	import ExternalLink from '@lucide/svelte/icons/external-link';

	type ViewMode = 'jerarquico' | 'ingenieria' | 'surtimiento';

	const store = useStore();
	const app = $derived(store.state);
	const id = $derived(page.params.id);

	const bom = $derived(app.boms.find((b) => b.id === id));

	let viewMode = $state<ViewMode>('jerarquico');
	let showRevisions = $state(false);
	let showNewVersionModal = $state(false);
	let newVersionReason = $state('');
	let viewingRevision = $state<string | null>(null);
	let comparingRevision = $state<string | null>(null);
	let showValidation = $state(false);

	const relatedECNs = $derived((app.ecns || []).filter((ecn) => ecn.affectedBOMIds.includes(bom?.id || '')));
	const spec = $derived(bom ? (app.specifications || []).find((s) => s.id === bom.specificationId) : null);

	const cells = $derived(bom ? PLANT_CELLS[bom.plant] : []);
	const componentsByCell = $derived(
		cells.map((cell) => ({ cell, components: bom ? bom.components.filter((c) => c.cell === cell) : [] }))
	);
	const unassigned = $derived(bom ? bom.components.filter((c) => !cells.includes(c.cell)) : []);

	const selectedRevision = $derived(
		viewingRevision && bom ? bom.revisions.find((r) => r.id === viewingRevision) : null
	);
	const compareRevision = $derived(
		comparingRevision && bom ? bom.revisions.find((r) => r.id === comparingRevision) : null
	);

	function handleStatusChange(newStatus: BOMStatus) {
		if (!bom) return;
		store.dispatch({
			type: 'UPDATE_BOM',
			payload: { id: bom.id, updates: { status: newStatus }, reason: `Cambio de estatus a ${BOM_STATUS_LABELS[newStatus]}` }
		});
	}

	function handleReorder(updatedComponents: BOMComponent[]) {
		if (!bom) return;
		store.dispatch({ type: 'REORDER_BOM_COMPONENTS', payload: { bomId: bom.id, components: updatedComponents } });
	}

	function handleCreateVersion() {
		if (!bom || !newVersionReason.trim()) return;
		store.dispatch({ type: 'CREATE_BOM_VERSION', payload: { bomId: bom.id, reason: newVersionReason.trim() } });
		newVersionReason = '';
		showNewVersionModal = false;
	}

	function handleClone() {
		if (!bom) return;
		const newId = `bom-${Date.now()}`;
		const components = bom.components.map((c, i) => ({ ...c, id: `${newId}-c${i}` }));
		store.dispatch({
			type: 'ADD_BOM',
			payload: {
				...bom,
				id: newId,
				specificationCode: `${bom.specificationCode}-COPIA`,
				version: 1,
				status: 'borrador',
				maturityStatus: 'en_desarrollo',
				components,
				revisions: [],
				specificationId: null,
				createdAt: new Date().toISOString().split('T')[0],
				updatedAt: new Date().toISOString().split('T')[0],
				createdBy: app.currentUser.name
			}
		});
		goto(`/lmat/boms/${newId}`);
	}

	function exportBOM() {
		if (!bom) return;
		const headers = ['Codigo', 'Descripcion', 'Cantidad', 'UdM', 'Celda', 'Operacion', 'Nivel'];
		const rows = bom.components.map((c) => [c.articleCode, c.articleDescription, c.quantity, c.udm, c.cell, c.operation, c.level]);
		const csv = [headers, ...rows].map((r) => r.map((v) => `"${v}"`).join(',')).join('\n');
		const blob = new Blob([csv], { type: 'text/csv' });
		const url = URL.createObjectURL(blob);
		const link = document.createElement('a');
		link.href = url;
		link.download = `BOM_${bom.specificationCode}.csv`;
		link.click();
		URL.revokeObjectURL(url);
	}

	function deptStatusIcon(status: string) {
		if (status === 'completado') return CircleCheckBig;
		if (status === 'rechazado') return CircleX;
		if (status === 'bloqueado') return Lock;
		return Clock;
	}

	type DiffItem = {
		type: 'added' | 'removed' | 'modified' | 'unchanged';
		component: BOMComponent;
		oldComponent?: BOMComponent;
		changes?: Array<{ field: string; oldVal: string | number; newVal: string | number }>;
	};

	function computeDiff(oldComps: BOMComponent[], newComps: BOMComponent[]): DiffItem[] {
		const getKey = (c: BOMComponent) => c.id;
		const oldMap = new Map(oldComps.map((c) => [getKey(c), c]));
		const newMap = new Map(newComps.map((c) => [getKey(c), c]));

		const result: DiffItem[] = [];

		newComps.forEach((comp) => {
			const key = getKey(comp);
			const old = oldMap.get(key);
			if (!old) {
				result.push({ type: 'added', component: comp });
			} else {
				const changes: Array<{ field: string; oldVal: string | number; newVal: string | number }> = [];
				if (old.quantity !== comp.quantity) changes.push({ field: 'Cantidad', oldVal: old.quantity, newVal: comp.quantity });
				if (old.cell !== comp.cell) changes.push({ field: 'Celda', oldVal: old.cell, newVal: comp.cell });
				if (old.udm !== comp.udm) changes.push({ field: 'UdM', oldVal: old.udm, newVal: comp.udm });

				if (changes.length > 0) {
					result.push({ type: 'modified', component: comp, oldComponent: old, changes });
				} else {
					result.push({ type: 'unchanged', component: comp });
				}
			}
		});

		oldComps.forEach((comp) => {
			const key = getKey(comp);
			if (!newMap.has(key)) {
				result.push({ type: 'removed', component: comp });
			}
		});

		return result;
	}
</script>

{#if !bom}
	<Empty.Root>
		<Empty.Header>
			<Empty.Media variant="icon">
				<FileWarning />
			</Empty.Media>
			<Empty.Title>BOM no encontrado</Empty.Title>
			<Empty.Description>El BOM solicitado no existe o fue eliminado.</Empty.Description>
		</Empty.Header>
		<Empty.Content>
			<Button href="/lmat/boms" variant="outline">Volver al listado</Button>
		</Empty.Content>
	</Empty.Root>
{/if}

{#if bom}
	<!-- Header -->
	<div class="flex flex-wrap items-center justify-between gap-3">
		<div class="flex items-center gap-3">
			<Button href="/lmat/boms" variant="outline" size="icon">
				<ArrowLeft />
			</Button>
			<div class="flex flex-col gap-1">
				<div class="flex items-center gap-2">
					<h2 class="text-foreground font-mono text-lg font-semibold">{bom.specificationCode}</h2>
					<span class="bg-secondary text-muted-foreground rounded px-1.5 py-0.5 font-mono text-xs">v{bom.version}</span>
					<StatusBadge label={BOM_STATUS_LABELS[bom.status]} colorClass={BOM_STATUS_COLORS[bom.status]} />
				</div>
				<p class="text-muted-foreground text-sm">
					{bom.vehicleModel} / {ARMOR_LEVEL_LABELS[bom.armorLevel]} / {PLANT_LABELS[bom.plant]}
				</p>
			</div>
		</div>
		<div class="flex items-center gap-2">
			<Button size="sm" variant="outline" onclick={handleClone}>
				<Copy data-icon="inline-start" /> Clonar
			</Button>
			<Button size="sm" variant="outline" onclick={exportBOM}>
				<Download data-icon="inline-start" /> Excel
			</Button>
			<Button size="sm" variant="outline" onclick={() => window.print()}>
				<Printer data-icon="inline-start" /> Imprimir
			</Button>
			<Button size="sm" onclick={() => (showNewVersionModal = true)}>
				<Plus data-icon="inline-start" /> Crear Version
			</Button>
			<Select.Root type="single" value={bom.status} onValueChange={(v) => handleStatusChange(v as BOMStatus)}>
				<Select.Trigger size="sm" class="w-40">{BOM_STATUS_LABELS[bom.status]}</Select.Trigger>
				<Select.Content>
					{#each Object.entries(BOM_STATUS_LABELS) as [k, v] (k)}
						<Select.Item value={k}>{v}</Select.Item>
					{/each}
				</Select.Content>
			</Select.Root>
		</div>
	</div>

	<!-- LMAT 2.0: Maturity Status + Quick Info -->
	<Card.Root>
		<Card.Header>
			<Card.Title class="flex items-center gap-2">
				<ShieldCheck class="size-4" /> Estado de Madurez LMAT 2.0
			</Card.Title>
			<Card.Action class="flex items-center gap-2">
				<StatusBadge
					label={BOM_MATURITY_LABELS[bom.maturityStatus || 'en_desarrollo']}
					colorClass={BOM_MATURITY_COLORS[bom.maturityStatus || 'en_desarrollo']}
				/>
				{#if spec}
					<Button href="/lmat/especificaciones/{spec.id}" variant="link" size="sm">
						Ver Especificacion <ExternalLink data-icon="inline-end" />
					</Button>
				{/if}
			</Card.Action>
		</Card.Header>
		<Card.Content class="flex flex-col gap-4">
			<p class="text-muted-foreground text-sm">
				{BOM_MATURITY_DESCRIPTIONS[bom.maturityStatus || 'en_desarrollo']}
			</p>

			<div class="flex items-center gap-2">
				<Users class="text-muted-foreground size-4" />
				<span class="text-card-foreground text-sm font-medium">Validacion por Departamento</span>
				<Button variant="ghost" size="sm" class="ml-auto" onclick={() => (showValidation = !showValidation)}>
					{showValidation ? 'Ocultar detalles' : 'Ver detalles'}
				</Button>
			</div>
			<div class="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-6">
				{#each VALIDATION_DEPARTMENTS as dept (dept)}
					{@const validation = bom.departmentValidations?.find((v) => v.department === dept)}
					{@const status = (validation?.status || 'pendiente') as DepartmentValidationStatus}
					{@const Icon = deptStatusIcon(status)}
					<div class="rounded-lg border p-2 {status === 'completado' ? 'bg-emerald-500/5 border-emerald-500/30' : status === 'rechazado' ? 'bg-destructive/5 border-destructive/30' : 'bg-secondary/50 border-border'}">
						<div class="mb-1 flex items-center justify-between">
							<span class="truncate text-[10px] font-medium">{dept}</span>
							<Icon class="size-3 {status === 'completado' ? 'text-emerald-500' : status === 'rechazado' ? 'text-destructive' : 'text-muted-foreground'}" />
						</div>
						<span class="text-muted-foreground text-[9px]">{DEPT_VALIDATION_LABELS[status]}</span>
					</div>
				{/each}
			</div>

			{#if showValidation}
				<div class="flex flex-col gap-3 rounded-lg border p-3">
					<Table.Root>
						<Table.Header>
							<Table.Row>
								<Table.Head>Departamento</Table.Head>
								<Table.Head>Estado</Table.Head>
								<Table.Head>Validado por</Table.Head>
								<Table.Head>Fecha</Table.Head>
								<Table.Head>Notas</Table.Head>
							</Table.Row>
						</Table.Header>
						<Table.Body>
							{#each VALIDATION_DEPARTMENTS as dept (dept)}
								{@const validation = bom.departmentValidations?.find((v) => v.department === dept)}
								{@const status = (validation?.status || 'pendiente') as DepartmentValidationStatus}
								<Table.Row>
									<Table.Cell class="font-medium">{dept}</Table.Cell>
									<Table.Cell>
										<StatusBadge label={DEPT_VALIDATION_LABELS[status]} colorClass={DEPT_VALIDATION_COLORS[status]} />
									</Table.Cell>
									<Table.Cell class="text-muted-foreground">{validation?.validatedBy || '-'}</Table.Cell>
									<Table.Cell class="text-muted-foreground">{validation?.validatedAt ? formatDate(validation.validatedAt) : '-'}</Table.Cell>
									<Table.Cell class="text-muted-foreground">{validation?.notes || '-'}</Table.Cell>
								</Table.Row>
							{/each}
						</Table.Body>
					</Table.Root>
					<div class="flex justify-end">
						<Button href="/lmat/validacion" variant="link" size="sm">
							Ir al Dashboard de Validacion <ExternalLink data-icon="inline-end" />
						</Button>
					</div>
				</div>
			{/if}
		</Card.Content>
	</Card.Root>

	<!-- Related ECNs -->
	{#if relatedECNs.length > 0}
		<Card.Root>
			<Card.Header>
				<Card.Title class="flex items-center gap-2">
					<FileWarning class="text-chart-4 size-4" /> ECNs Relacionados ({relatedECNs.length})
				</Card.Title>
			</Card.Header>
			<Card.Content class="flex flex-col gap-2">
				{#each relatedECNs as ecn (ecn.id)}
					<a href="/lmat/ecn/{ecn.id}" class="bg-card hover:bg-secondary/50 flex items-center justify-between rounded-lg border p-3 transition-colors">
						<div>
							<span class="text-primary font-mono text-sm font-medium">{ecn.code}</span>
							<p class="text-muted-foreground mt-0.5 line-clamp-1 text-xs">{ecn.justification}</p>
						</div>
						<StatusBadge label={ECN_STATUS_LABELS[ecn.status]} colorClass={ECN_STATUS_COLORS[ecn.status]} />
					</a>
				{/each}
			</Card.Content>
		</Card.Root>
	{/if}

	<!-- Health + Stats -->
	<div class="grid grid-cols-2 gap-4 md:grid-cols-4">
		<StatCard label="Componentes" value={bom.components.length} />
		<Card.Root>
			<Card.Header>
				<Card.Description>Salud del BOM</Card.Description>
				<Card.Title class="text-2xl font-semibold tabular-nums">{bom.healthPercent}%</Card.Title>
			</Card.Header>
			<Card.Content>
				<Progress
					value={bom.healthPercent}
					max={100}
					class={cn(bom.healthPercent >= 80 ? '' : bom.healthPercent >= 50 ? '*:data-[slot=progress-indicator]:bg-chart-4' : '*:data-[slot=progress-indicator]:bg-destructive')}
				/>
			</Card.Content>
		</Card.Root>
		<StatCard label="Version" value={`v${bom.version}`} />
		<StatCard label="Revisiones" value={bom.revisions.length} />
	</div>

	<!-- View Mode Toggle -->
	<Tabs.Root bind:value={viewMode}>
		<div class="flex flex-wrap items-center justify-between gap-2">
			<Tabs.List>
				<Tabs.Trigger value="jerarquico" class="gap-1.5">
					<ListTree class="size-4" /> <span class="hidden sm:block" >Vista Jerarquica</span>
				</Tabs.Trigger>
				<Tabs.Trigger value="ingenieria" class="gap-1.5">
					<List class="size-4" /> <span class="hidden sm:block" >BOM Plano</span>
				</Tabs.Trigger>
				<Tabs.Trigger value="surtimiento" class="gap-1.5">
					<Boxes class="size-4" /> <span class="hidden sm:block" >	Por Celda/Kit</span>
				</Tabs.Trigger>
			</Tabs.List>
			<Button variant={showRevisions ? 'default' : 'outline'} size="sm" onclick={() => (showRevisions = !showRevisions)}>
				<GitBranch data-icon="inline-start" /> Historial ({bom.revisions.length})
			</Button>
		</div>

		<!-- Hierarchical Tree View with Drag & Drop -->
		<Tabs.Content value="jerarquico">
			<Card.Root>
				<Card.Header>
					<Card.Title>Vista Jerarquica - Kits y Componentes</Card.Title>
					<Card.Description>Arrastra y suelta para reorganizar la estructura</Card.Description>
				</Card.Header>
				<Card.Content>
					<BomTree
						components={bom.components}
						onReorder={handleReorder}
						readOnly={bom.status === 'aprobado' || bom.status === 'obsoleto'}
					/>
				</Card.Content>
			</Card.Root>
		</Tabs.Content>

		<!-- Engineering View - Flat list -->
		<Tabs.Content value="ingenieria">
			<Card.Root>
				<Card.Header>
					<Card.Title>BOM de Ingenieria - Listado concentrado</Card.Title>
				</Card.Header>
				<Card.Content>
					<Table.Root>
						<Table.Header>
							<Table.Row>
								<Table.Head class="w-8">#</Table.Head>
								<Table.Head>Codigo</Table.Head>
								<Table.Head>Descripcion</Table.Head>
								<Table.Head class="text-right">Cantidad</Table.Head>
								<Table.Head>UdM</Table.Head>
								<Table.Head>Operacion</Table.Head>
								<Table.Head>Celda</Table.Head>
								<Table.Head>Datos</Table.Head>
							</Table.Row>
						</Table.Header>
						<Table.Body>
							{#each bom.components as comp, idx (comp.id)}
								<Table.Row>
									<Table.Cell class="text-muted-foreground text-xs">{idx + 1}</Table.Cell>
									<Table.Cell>
										<a href="/articulos/{comp.articleId}" class="text-primary font-mono text-xs hover:underline">{comp.articleCode}</a>
									</Table.Cell>
									<Table.Cell class="max-w-62 truncate">{comp.articleDescription}</Table.Cell>
									<Table.Cell class="text-right font-mono tabular-nums">{comp.quantity}</Table.Cell>
									<Table.Cell class="text-muted-foreground text-xs">{UDM_LABELS[comp.udm]}</Table.Cell>
									<Table.Cell class="text-muted-foreground text-xs">{comp.operation || '---'}</Table.Cell>
									<Table.Cell class="text-muted-foreground text-xs">{comp.cell}</Table.Cell>
									<Table.Cell>
										{#if comp.hasCompleteData}
											<CircleCheckBig class="text-primary size-4" />
										{:else}
											<TriangleAlert class="text-chart-4 size-4" />
										{/if}
									</Table.Cell>
								</Table.Row>
							{/each}
						</Table.Body>
					</Table.Root>
				</Card.Content>
			</Card.Root>
		</Tabs.Content>

		<!-- Surtimiento View - By cell/kit -->
		<Tabs.Content value="surtimiento">
			<div class="flex flex-col gap-4">
				{#each componentsByCell as { cell, components } (cell)}
					{#if components.length > 0}
						<Card.Root>
							<Card.Header>
								<Card.Title class="flex items-center gap-2">
									<Boxes class="text-primary size-4" /> {cell}
								</Card.Title>
								<Card.Action>
									<span class="text-muted-foreground text-xs">{components.length} componentes</span>
								</Card.Action>
							</Card.Header>
							<Card.Content>
								<Table.Root>
									<Table.Header>
										<Table.Row>
											<Table.Head>Codigo</Table.Head>
											<Table.Head>Descripcion</Table.Head>
											<Table.Head class="text-right">Cantidad</Table.Head>
											<Table.Head>UdM</Table.Head>
											<Table.Head>Operacion</Table.Head>
											<Table.Head>Datos</Table.Head>
										</Table.Row>
									</Table.Header>
									<Table.Body>
										{#each components as comp (comp.id)}
											<Table.Row>
												<Table.Cell>
													<a href="/articulos/{comp.articleId}" class="text-primary font-mono text-xs hover:underline">{comp.articleCode}</a>
												</Table.Cell>
												<Table.Cell class="text-xs">{comp.articleDescription}</Table.Cell>
												<Table.Cell class="text-right font-mono text-xs tabular-nums">{comp.quantity}</Table.Cell>
												<Table.Cell class="text-muted-foreground text-xs">{UDM_LABELS[comp.udm]}</Table.Cell>
												<Table.Cell class="text-muted-foreground text-xs">{comp.operation || '---'}</Table.Cell>
												<Table.Cell>
													{#if comp.hasCompleteData}
														<CircleCheckBig class="text-primary size-3.5" />
													{:else}
														<TriangleAlert class="text-chart-4 size-3.5" />
													{/if}
												</Table.Cell>
											</Table.Row>
										{/each}
									</Table.Body>
								</Table.Root>
							</Card.Content>
						</Card.Root>
					{/if}
				{/each}
				{#if unassigned.length > 0}
					<Card.Root class="border-chart-4/30">
						<Card.Header>
							<Card.Title class="text-chart-4">Sin celda asignada ({unassigned.length})</Card.Title>
						</Card.Header>
						<Card.Content>
							<Table.Root>
								<Table.Body>
									{#each unassigned as comp (comp.id)}
										<Table.Row>
											<Table.Cell class="text-primary font-mono text-xs">{comp.articleCode}</Table.Cell>
											<Table.Cell class="text-xs">{comp.articleDescription}</Table.Cell>
											<Table.Cell class="text-right font-mono text-xs tabular-nums">{comp.quantity}</Table.Cell>
										</Table.Row>
									{/each}
								</Table.Body>
							</Table.Root>
						</Card.Content>
					</Card.Root>
				{/if}
			</div>
		</Tabs.Content>
	</Tabs.Root>

	<!-- Revision History -->
	{#if showRevisions}
		<Card.Root>
			<Card.Header>
				<Card.Title class="flex items-center gap-2">
					<History class="size-4" /> Historial de Revisiones
				</Card.Title>
				<Card.Action>
					<span class="text-muted-foreground text-xs">{bom.revisions.length} versiones</span>
				</Card.Action>
			</Card.Header>
			<Card.Content>
				{#if bom.revisions.length > 0}
					<div class="flex flex-col divide-y divide-border/30">
						{#each [...bom.revisions].reverse() as rev (rev.id)}
							<div class="py-4 first:pt-0 last:pb-0 {viewingRevision === rev.id || comparingRevision === rev.id ? 'bg-primary/5 border-primary border-l-2 pl-3' : ''}">
								<!-- Header de la revision -->
								<div class="mb-3 flex items-center justify-between">
									<div class="flex items-center gap-2">
										<span class="rounded px-2 py-1 font-mono text-xs font-bold {rev.version === bom.version ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'}">
											v{rev.version}
										</span>
										{#if rev.version === bom.version}
											<span class="rounded bg-emerald-500/15 px-1.5 py-0.5 text-[10px] font-medium text-emerald-400">ACTUAL</span>
										{/if}
									</div>
									<div class="text-muted-foreground flex items-center gap-2 text-xs">
										<span>{rev.changedBy}</span>
										<span class="text-muted-foreground/50">|</span>
										<span>{formatDate(rev.changedAt)}</span>
									</div>
								</div>

								<!-- Motivo del cambio -->
								<p class="text-card-foreground border-muted mb-3 ml-1 border-l-2 pl-1 text-sm">{rev.changeReason}</p>

								<!-- Changelog narrativo -->
								{#if rev.diff.length > 0}
									<div class="bg-secondary/30 mb-3 rounded-md p-3">
										<p class="text-muted-foreground mb-2 text-xs font-medium">Cambios realizados:</p>
										<ul class="flex flex-col gap-1.5">
											{#each rev.diff as d, i (i)}
												<li class="flex items-start gap-2 text-xs">
													<span class="mt-0.5 size-1.5 shrink-0 rounded-full {d.type === 'added' ? 'bg-emerald-500' : d.type === 'removed' ? 'bg-destructive' : 'bg-chart-4'}"></span>
													<span class="text-card-foreground">
														{#if d.type === 'added'}Se agrego <span class="font-medium text-emerald-400">{d.articleCode}</span> ({d.articleDescription}){/if}
														{#if d.type === 'removed'}Se elimino <span class="text-destructive font-medium">{d.articleCode}</span> ({d.articleDescription}){/if}
														{#if d.type === 'modified'}Se modifico <span class="text-chart-4 font-medium">{d.articleCode}</span>: {d.field} <span class="text-muted-foreground line-through">{d.oldValue}</span> <ChevronRight class="inline size-3" /> <span class="font-medium">{d.newValue}</span>{/if}
													</span>
												</li>
											{/each}
										</ul>
									</div>
								{/if}

								{#if rev.diff.length === 0}
									<p class="text-muted-foreground bg-secondary/30 mb-3 rounded-md px-3 py-2 text-xs">
										Version creada como snapshot - sin cambios registrados respecto a la anterior
									</p>
								{/if}

								<!-- Botones de accion -->
								<div class="flex items-center gap-2">
									<Button
										variant={viewingRevision === rev.id ? 'default' : 'secondary'}
										size="sm"
										onclick={() => (viewingRevision = viewingRevision === rev.id ? null : rev.id)}
									>
										<Eye data-icon="inline-start" /> {viewingRevision === rev.id ? 'Ocultar snapshot' : 'Ver snapshot'}
									</Button>
									{#if rev.version !== bom.version}
										<Button
											variant="secondary"
											size="sm"
											class={comparingRevision === rev.id ? 'bg-chart-4 text-background hover:bg-chart-4/90' : ''}
											onclick={() => (comparingRevision = comparingRevision === rev.id ? null : rev.id)}
										>
											<GitBranch data-icon="inline-start" /> {comparingRevision === rev.id ? 'Cerrar comparacion' : 'Comparar con actual'}
										</Button>
									{/if}
								</div>
							</div>
						{/each}
					</div>
				{:else}
					<Empty.Root class="border-0">
						<Empty.Header>
							<Empty.Media variant="icon">
								<History />
							</Empty.Media>
							<Empty.Title>Sin revisiones</Empty.Title>
							<Empty.Description>No hay revisiones registradas. Usa el boton "Crear Version" para guardar el estado actual.</Empty.Description>
						</Empty.Header>
					</Empty.Root>
				{/if}
			</Card.Content>
		</Card.Root>
	{/if}

	<!-- Viewing old revision snapshot -->
	{#if selectedRevision}
		<Card.Root class="border-primary/50 border-2">
			<Card.Header>
				<Card.Title class="flex items-center gap-2">
					<History class="size-4" /> Vista de Version v{selectedRevision.version}
				</Card.Title>
				<Card.Description>{selectedRevision.componentsSnapshot.length} componentes</Card.Description>
				<Card.Action>
					<Button variant="secondary" size="sm" onclick={() => (viewingRevision = null)}>
						<X data-icon="inline-start" /> Cerrar
					</Button>
				</Card.Action>
			</Card.Header>
			<Card.Content class="flex flex-col gap-3">
				<div class="max-h-100 overflow-auto">
					<Table.Root>
						<Table.Header>
							<Table.Row>
								<Table.Head class="w-8">#</Table.Head>
								<Table.Head>Codigo</Table.Head>
								<Table.Head>Descripcion</Table.Head>
								<Table.Head class="text-right">Cantidad</Table.Head>
								<Table.Head>UdM</Table.Head>
								<Table.Head>Celda</Table.Head>
							</Table.Row>
						</Table.Header>
						<Table.Body>
							{#each selectedRevision.componentsSnapshot as comp, idx (comp.id)}
								<Table.Row>
									<Table.Cell class="text-muted-foreground text-xs">{idx + 1}</Table.Cell>
									<Table.Cell class="text-primary font-mono text-xs">{comp.articleCode}</Table.Cell>
									<Table.Cell class="max-w-62 truncate">{comp.articleDescription}</Table.Cell>
									<Table.Cell class="text-right font-mono tabular-nums">{comp.quantity}</Table.Cell>
									<Table.Cell class="text-muted-foreground text-xs">{UDM_LABELS[comp.udm]}</Table.Cell>
									<Table.Cell class="text-muted-foreground text-xs">{comp.cell}</Table.Cell>
								</Table.Row>
							{/each}
						</Table.Body>
					</Table.Root>
				</div>
				<p class="text-muted-foreground text-xs">
					Revision creada el {formatDate(selectedRevision.changedAt)} por {selectedRevision.changedBy}.
					Motivo: {selectedRevision.changeReason}
				</p>
			</Card.Content>
		</Card.Root>
	{/if}

	<!-- Comparison view with highlighting -->
	{#if compareRevision}
		<Card.Root class="border-chart-4/50 border-2">
			<Card.Header>
				<Card.Title class="flex items-center gap-2">
					<GitBranch class="text-chart-4 size-4" /> Comparacion: v{compareRevision.version} vs v{bom.version} (actual)
				</Card.Title>
				<Card.Action class="flex items-center gap-4">
					<div class="flex items-center gap-3 text-xs">
						<span class="flex items-center gap-1"><span class="size-2 rounded-full bg-emerald-500"></span> Agregado</span>
						<span class="flex items-center gap-1"><span class="bg-destructive size-2 rounded-full"></span> Eliminado</span>
						<span class="flex items-center gap-1"><span class="bg-chart-4 size-2 rounded-full"></span> Modificado</span>
					</div>
					<Button variant="secondary" size="sm" onclick={() => (comparingRevision = null)}>
						<X data-icon="inline-start" /> Cerrar
					</Button>
				</Card.Action>
			</Card.Header>
			<Card.Content class="flex flex-col gap-3">
				<div class="max-h-125 overflow-auto">
					<Table.Root>
						<Table.Header>
							<Table.Row>
								<Table.Head class="w-24">Estado</Table.Head>
								<Table.Head>Codigo</Table.Head>
								<Table.Head>Descripcion</Table.Head>
								<Table.Head class="text-right">Cantidad</Table.Head>
								<Table.Head>UdM</Table.Head>
								<Table.Head>Celda</Table.Head>
								<Table.Head>Cambios</Table.Head>
							</Table.Row>
						</Table.Header>
						<Table.Body>
							{#each computeDiff(compareRevision.componentsSnapshot, bom.components) as item, idx (idx)}
								<Table.Row class={item.type === 'added' ? 'bg-emerald-500/10' : item.type === 'removed' ? 'bg-destructive/10' : item.type === 'modified' ? 'bg-chart-4/10' : ''}>
									<Table.Cell>
										{#if item.type !== 'unchanged'}
											<span class="rounded px-1.5 py-0.5 text-[10px] font-bold {item.type === 'added' ? 'bg-emerald-500/20 text-emerald-400' : item.type === 'removed' ? 'bg-destructive/20 text-destructive' : 'bg-chart-4/20 text-chart-4'}">
												{item.type === 'added' ? 'NUEVO' : item.type === 'removed' ? 'ELIMINADO' : 'MODIFICADO'}
											</span>
										{/if}
									</Table.Cell>
									<Table.Cell class="font-mono text-xs {item.type === 'removed' ? 'text-muted-foreground line-through' : 'text-primary'}">
										{item.component.articleCode}
									</Table.Cell>
									<Table.Cell class="max-w-50 truncate {item.type === 'removed' ? 'text-muted-foreground line-through' : ''}">
										{item.component.articleDescription}
									</Table.Cell>
									<Table.Cell class="text-right font-mono tabular-nums">
										{#if item.type === 'modified' && item.changes?.find((c) => c.field === 'Cantidad')}
											<span>
												<span class="text-muted-foreground mr-1 line-through">{item.oldComponent?.quantity}</span>
												<span class="text-chart-4 font-bold">{item.component.quantity}</span>
											</span>
										{:else}
											<span class={item.type === 'removed' ? 'text-muted-foreground line-through' : ''}>
												{item.component.quantity}
											</span>
										{/if}
									</Table.Cell>
									<Table.Cell class="text-muted-foreground text-xs">{UDM_LABELS[item.component.udm]}</Table.Cell>
									<Table.Cell class="text-xs">
										{#if item.type === 'modified' && item.changes?.find((c) => c.field === 'Celda')}
											<span>
												<span class="text-muted-foreground mr-1 line-through">{item.oldComponent?.cell}</span>
												<span class="text-chart-4 font-bold">{item.component.cell}</span>
											</span>
										{:else}
											<span class="text-muted-foreground">{item.component.cell}</span>
										{/if}
									</Table.Cell>
									<Table.Cell class="text-muted-foreground text-xs">
										{#if item.changes && item.changes.length > 0}
											<span class="text-chart-4">
												{item.changes.map((c) => c.field).join(', ')}
											</span>
										{/if}
									</Table.Cell>
								</Table.Row>
							{/each}
						</Table.Body>
					</Table.Root>
				</div>
				<div class="flex items-center justify-between">
					<p class="text-muted-foreground text-xs">
						Comparando v{compareRevision.version} ({formatDate(compareRevision.changedAt)}) con la version actual v{bom.version}
					</p>
					<div class="flex items-center gap-4 text-xs">
						{#if compareRevision}
							{@const diffSummary = computeDiff(compareRevision.componentsSnapshot, bom.components)}
							{@const added = diffSummary.filter((d) => d.type === 'added').length}
							{@const removed = diffSummary.filter((d) => d.type === 'removed').length}
							{@const modified = diffSummary.filter((d) => d.type === 'modified').length}
							{#if added > 0}<span class="text-emerald-400">+{added} agregados</span>{/if}
							{#if removed > 0}<span class="text-destructive">-{removed} eliminados</span>{/if}
							{#if modified > 0}<span class="text-chart-4">{modified} modificados</span>{/if}
						{/if}
					</div>
				</div>
			</Card.Content>
		</Card.Root>
	{/if}

	<!-- Metadata -->
	<div class="text-muted-foreground flex items-center gap-4 text-xs">
		<span>Creado: {formatDate(bom.createdAt)}</span>
		<span>Modificado: {formatDate(bom.updatedAt)}</span>
		<span>Por: {bom.createdBy}</span>
	</div>

	<!-- Modal: Crear Nueva Version -->
	<Dialog.Root bind:open={showNewVersionModal}>
		<Dialog.Content class="sm:max-w-md">
			<Dialog.Header>
				<Dialog.Title>Crear Nueva Version</Dialog.Title>
				<Dialog.Description>
					Se creara la version <span class="text-primary font-mono font-bold">v{bom.version + 1}</span> guardando
					el estado actual del BOM ({bom.components.length} componentes).
				</Dialog.Description>
			</Dialog.Header>
			<div class="grid gap-2">
				<Label for="new-version-reason">Motivo del cambio <span class="text-destructive">*</span></Label>
				<Textarea
					id="new-version-reason"
					bind:value={newVersionReason}
					placeholder="Ej: Actualizacion de cantidades por cambio de diseño..."
					class="min-h-20"
				/>
			</div>
			<Dialog.Footer>
				<Button variant="ghost" onclick={() => (showNewVersionModal = false)}>Cancelar</Button>
				<Button onclick={handleCreateVersion} disabled={!newVersionReason.trim()}>
					Crear Version v{bom.version + 1}
				</Button>
			</Dialog.Footer>
		</Dialog.Content>
	</Dialog.Root>
{/if}
