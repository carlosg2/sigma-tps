<script lang="ts">
	import { page } from '$app/state';
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
	import BomTree from '$lib/tps/components/bom-tree.svelte';
	import ArrowLeft from '@lucide/svelte/icons/arrow-left';
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
	<div class="flex flex-col items-center justify-center gap-4 py-20">
		<p class="text-muted-foreground">BOM no encontrado</p>
		<a href="/lmat/boms" class="text-primary hover:underline text-sm">Volver al listado</a>
	</div>
{/if}

{#if bom}
	<div class="flex flex-col gap-6">
		<!-- Header -->
		<div class="flex items-center justify-between">
			<div class="flex items-center gap-3">
				<a href="/lmat/boms" class="flex h-8 w-8 items-center justify-center rounded-md border border-border hover:bg-secondary transition-colors">
					<ArrowLeft class="h-4 w-4 text-foreground" />
				</a>
				<div>
					<div class="flex items-center gap-2">
						<h1 class="text-xl font-bold font-mono text-foreground">{bom.specificationCode}</h1>
						<span class="rounded bg-secondary px-1.5 py-0.5 text-xs font-mono text-muted-foreground">v{bom.version}</span>
						<StatusBadge label={BOM_STATUS_LABELS[bom.status]} colorClass={BOM_STATUS_COLORS[bom.status]} />
					</div>
					<p class="text-sm text-muted-foreground">
						{bom.vehicleModel} / {ARMOR_LEVEL_LABELS[bom.armorLevel]} / {PLANT_LABELS[bom.plant]}
					</p>
				</div>
			</div>
			<div class="flex items-center gap-2">
				<button
					onclick={() => (showNewVersionModal = true)}
					class="flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
				>
					<Plus class="h-3.5 w-3.5" /> Crear Version
				</button>
				<select
					onchange={(e) => handleStatusChange((e.currentTarget as HTMLSelectElement).value as BOMStatus)}
					class="rounded-md border border-border bg-secondary px-2 py-1.5 text-xs text-foreground outline-none"
				>
					{#each Object.entries(BOM_STATUS_LABELS) as [k, v] (k)}
						<option value={k} selected={k === bom.status}>{v}</option>
					{/each}
				</select>
			</div>
		</div>

		<!-- LMAT 2.0: Maturity Status + Quick Info -->
		<div class="rounded-lg border border-border bg-card overflow-hidden">
			<div class="flex items-center justify-between px-4 py-3 bg-secondary/30 border-b border-border">
				<div class="flex items-center gap-3">
					<ShieldCheck class="h-5 w-5 text-primary" />
					<span class="font-medium text-card-foreground">Estado de Madurez LMAT 2.0</span>
				</div>
				<div class="flex items-center gap-2">
					<span class="rounded-full px-3 py-1 text-xs font-medium {BOM_MATURITY_COLORS[bom.maturityStatus || 'en_desarrollo']}">
						{BOM_MATURITY_LABELS[bom.maturityStatus || 'en_desarrollo']}
					</span>
					{#if spec}
						<a href="/lmat/especificaciones/{spec.id}" class="flex items-center gap-1 text-xs text-primary hover:underline">
							Ver Especificacion <ExternalLink class="h-3 w-3" />
						</a>
					{/if}
				</div>
			</div>
			<div class="p-4">
				<p class="text-sm text-muted-foreground mb-4">
					{BOM_MATURITY_DESCRIPTIONS[bom.maturityStatus || 'en_desarrollo']}
				</p>

				<!-- Departmental Validations -->
				<div class="flex items-center gap-2 mb-3">
					<Users class="h-4 w-4 text-muted-foreground" />
					<span class="text-sm font-medium text-card-foreground">Validacion por Departamento</span>
					<button onclick={() => (showValidation = !showValidation)} class="ml-auto text-xs text-primary hover:underline">
						{showValidation ? 'Ocultar detalles' : 'Ver detalles'}
					</button>
				</div>
				<div class="grid grid-cols-6 gap-2">
					{#each VALIDATION_DEPARTMENTS as dept (dept)}
						{@const validation = bom.departmentValidations?.find((v) => v.department === dept)}
						{@const status = (validation?.status || 'pendiente') as DepartmentValidationStatus}
						{@const Icon = deptStatusIcon(status)}
						<div class="p-2 rounded-lg border {status === 'completado' ? 'bg-emerald-500/5 border-emerald-500/30' : status === 'rechazado' ? 'bg-destructive/5 border-destructive/30' : 'bg-secondary/50 border-border'}">
							<div class="flex items-center justify-between mb-1">
								<span class="text-[10px] font-medium truncate">{dept}</span>
								<Icon class="h-3 w-3 {status === 'completado' ? 'text-emerald-500' : status === 'rechazado' ? 'text-destructive' : 'text-muted-foreground'}" />
							</div>
							<span class="text-[9px] text-muted-foreground">{DEPT_VALIDATION_LABELS[status]}</span>
						</div>
					{/each}
				</div>

				{#if showValidation}
					<div class="mt-4 p-3 rounded-lg bg-secondary/30 border border-border">
						<table class="w-full text-xs">
							<thead>
								<tr class="border-b border-border">
									<th class="text-left py-2 font-medium">Departamento</th>
									<th class="text-left py-2 font-medium">Estado</th>
									<th class="text-left py-2 font-medium">Validado por</th>
									<th class="text-left py-2 font-medium">Fecha</th>
									<th class="text-left py-2 font-medium">Notas</th>
								</tr>
							</thead>
							<tbody>
								{#each VALIDATION_DEPARTMENTS as dept (dept)}
									{@const validation = bom.departmentValidations?.find((v) => v.department === dept)}
									{@const status = (validation?.status || 'pendiente') as DepartmentValidationStatus}
									<tr class="border-b border-border/50">
										<td class="py-2 font-medium">{dept}</td>
										<td class="py-2">
											<span class="rounded px-1.5 py-0.5 text-[10px] {DEPT_VALIDATION_COLORS[status]}">
												{DEPT_VALIDATION_LABELS[status]}
											</span>
										</td>
										<td class="py-2 text-muted-foreground">{validation?.validatedBy || '-'}</td>
										<td class="py-2 text-muted-foreground">{validation?.validatedAt ? formatDate(validation.validatedAt) : '-'}</td>
										<td class="py-2 text-muted-foreground">{validation?.notes || '-'}</td>
									</tr>
								{/each}
							</tbody>
						</table>
						<div class="mt-3 flex justify-end">
							<a href="/lmat/validacion" class="flex items-center gap-1 text-xs text-primary hover:underline">
								Ir al Dashboard de Validacion <ExternalLink class="h-3 w-3" />
							</a>
						</div>
					</div>
				{/if}
			</div>
		</div>

		<!-- Related ECNs -->
		{#if relatedECNs.length > 0}
			<div class="rounded-lg border border-chart-4/50 bg-chart-4/5 overflow-hidden">
				<div class="flex items-center gap-2 px-4 py-3 border-b border-chart-4/30">
					<FileWarning class="h-4 w-4 text-chart-4" />
					<span class="font-medium text-card-foreground">ECNs Relacionados ({relatedECNs.length})</span>
				</div>
				<div class="p-4 space-y-2">
					{#each relatedECNs as ecn (ecn.id)}
						<a href="/lmat/ecn/{ecn.id}" class="flex items-center justify-between p-3 rounded-lg bg-card border border-border hover:bg-secondary/50 transition-colors">
							<div>
								<span class="font-mono text-sm font-medium text-primary">{ecn.code}</span>
								<p class="text-xs text-muted-foreground mt-0.5 line-clamp-1">{ecn.justification}</p>
							</div>
							<span class="rounded-full px-2 py-0.5 text-[10px] font-medium {ECN_STATUS_COLORS[ecn.status]}">
								{ECN_STATUS_LABELS[ecn.status]}
							</span>
						</a>
					{/each}
				</div>
			</div>
		{/if}

		<!-- Health + Stats -->
		<div class="grid grid-cols-2 gap-4 md:grid-cols-4">
			<div class="rounded-lg border border-border bg-card p-3">
				<span class="text-xs text-muted-foreground">Componentes</span>
				<p class="text-xl font-bold text-card-foreground">{bom.components.length}</p>
			</div>
			<div class="rounded-lg border border-border bg-card p-3">
				<span class="text-xs text-muted-foreground">Salud del BOM</span>
				<div class="flex items-center gap-2 mt-1">
					<div class="h-2 flex-1 rounded-full bg-secondary">
						<div class="h-2 rounded-full {bom.healthPercent >= 80 ? 'bg-primary' : bom.healthPercent >= 50 ? 'bg-chart-4' : 'bg-destructive'}" style="width: {bom.healthPercent}%"></div>
					</div>
					<span class="text-sm font-bold font-mono text-card-foreground">{bom.healthPercent}%</span>
				</div>
			</div>
			<div class="rounded-lg border border-border bg-card p-3">
				<span class="text-xs text-muted-foreground">Version</span>
				<p class="text-xl font-bold font-mono text-card-foreground">v{bom.version}</p>
			</div>
			<div class="rounded-lg border border-border bg-card p-3">
				<span class="text-xs text-muted-foreground">Revisiones</span>
				<p class="text-xl font-bold text-card-foreground">{bom.revisions.length}</p>
			</div>
		</div>

		<!-- View Mode Toggle -->
		<div class="flex items-center gap-2">
			<button
				onclick={() => (viewMode = 'jerarquico')}
				class="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors {viewMode === 'jerarquico' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-foreground hover:bg-accent'}"
			>
				<ListTree class="h-3.5 w-3.5" /> Vista Jerarquica
			</button>
			<button
				onclick={() => (viewMode = 'ingenieria')}
				class="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors {viewMode === 'ingenieria' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-foreground hover:bg-accent'}"
			>
				<List class="h-3.5 w-3.5" /> BOM Plano
			</button>
			<button
				onclick={() => (viewMode = 'surtimiento')}
				class="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors {viewMode === 'surtimiento' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-foreground hover:bg-accent'}"
			>
				<Boxes class="h-3.5 w-3.5" /> Por Celda/Kit
			</button>
			<button
				onclick={() => (showRevisions = !showRevisions)}
				class="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors {showRevisions ? 'bg-primary text-primary-foreground' : 'bg-secondary text-foreground hover:bg-accent'}"
			>
				<GitBranch class="h-3.5 w-3.5" /> Historial ({bom.revisions.length})
			</button>
		</div>

		<!-- Hierarchical Tree View with Drag & Drop -->
		{#if viewMode === 'jerarquico'}
			<div class="rounded-lg border border-border bg-card overflow-hidden">
				<div class="border-b border-border px-4 py-3 flex items-center justify-between">
					<div>
						<h3 class="text-sm font-semibold text-card-foreground">Vista Jerarquica - Kits y Componentes</h3>
						<p class="text-xs text-muted-foreground mt-0.5">Arrastra y suelta para reorganizar la estructura</p>
					</div>
				</div>
				<div class="p-2">
					<BomTree
						components={bom.components}
						onReorder={handleReorder}
						readOnly={bom.status === 'aprobado' || bom.status === 'obsoleto'}
					/>
				</div>
			</div>
		{/if}

		<!-- Engineering View - Flat list -->
		{#if viewMode === 'ingenieria'}
			<div class="rounded-lg border border-border bg-card overflow-hidden">
				<div class="border-b border-border px-4 py-3">
					<h3 class="text-sm font-semibold text-card-foreground">BOM de Ingenieria - Listado concentrado</h3>
				</div>
				<div class="overflow-x-auto">
					<table class="w-full text-sm">
						<thead>
							<tr class="border-b border-border bg-secondary/50 text-left">
								<th class="px-4 py-2 text-xs font-medium text-muted-foreground w-8">#</th>
								<th class="px-4 py-2 text-xs font-medium text-muted-foreground">Codigo</th>
								<th class="px-4 py-2 text-xs font-medium text-muted-foreground">Descripcion</th>
								<th class="px-4 py-2 text-xs font-medium text-muted-foreground text-right">Cantidad</th>
								<th class="px-4 py-2 text-xs font-medium text-muted-foreground">UdM</th>
								<th class="px-4 py-2 text-xs font-medium text-muted-foreground">Operacion</th>
								<th class="px-4 py-2 text-xs font-medium text-muted-foreground">Celda</th>
								<th class="px-4 py-2 text-xs font-medium text-muted-foreground">Datos</th>
							</tr>
						</thead>
						<tbody>
							{#each bom.components as comp, idx (comp.id)}
								<tr class="border-b border-border/50 hover:bg-secondary/30 transition-colors">
									<td class="px-4 py-2 text-xs text-muted-foreground">{idx + 1}</td>
									<td class="px-4 py-2">
										<a href="/articulos/{comp.articleId}" class="font-mono text-xs text-primary hover:underline">{comp.articleCode}</a>
									</td>
									<td class="px-4 py-2 text-card-foreground max-w-[250px] truncate">{comp.articleDescription}</td>
									<td class="px-4 py-2 text-right font-mono text-card-foreground">{comp.quantity}</td>
									<td class="px-4 py-2 text-xs text-muted-foreground">{UDM_LABELS[comp.udm]}</td>
									<td class="px-4 py-2 text-xs text-muted-foreground">{comp.operation || '---'}</td>
									<td class="px-4 py-2 text-xs text-muted-foreground">{comp.cell}</td>
									<td class="px-4 py-2">
										{#if comp.hasCompleteData}
											<CircleCheckBig class="h-4 w-4 text-primary" />
										{:else}
											<TriangleAlert class="h-4 w-4 text-chart-4" />
										{/if}
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			</div>
		{/if}

		<!-- Surtimiento View - By cell/kit -->
		{#if viewMode === 'surtimiento'}
			<div class="flex flex-col gap-4">
				{#each componentsByCell as { cell, components } (cell)}
					{#if components.length > 0}
						<div class="rounded-lg border border-border bg-card overflow-hidden">
							<div class="flex items-center justify-between border-b border-border bg-secondary/30 px-4 py-2.5">
								<h3 class="text-sm font-semibold text-card-foreground flex items-center gap-2">
									<Boxes class="h-4 w-4 text-primary" /> {cell}
								</h3>
								<span class="text-xs text-muted-foreground">{components.length} componentes</span>
							</div>
							<div class="overflow-x-auto">
								<table class="w-full text-sm">
									<thead>
										<tr class="border-b border-border text-left">
											<th class="px-4 py-2 text-xs font-medium text-muted-foreground">Codigo</th>
											<th class="px-4 py-2 text-xs font-medium text-muted-foreground">Descripcion</th>
											<th class="px-4 py-2 text-xs font-medium text-muted-foreground text-right">Cantidad</th>
											<th class="px-4 py-2 text-xs font-medium text-muted-foreground">UdM</th>
											<th class="px-4 py-2 text-xs font-medium text-muted-foreground">Operacion</th>
											<th class="px-4 py-2 text-xs font-medium text-muted-foreground">Datos</th>
										</tr>
									</thead>
									<tbody>
										{#each components as comp (comp.id)}
											<tr class="border-b border-border/30 hover:bg-secondary/20 transition-colors">
												<td class="px-4 py-1.5">
													<a href="/articulos/{comp.articleId}" class="font-mono text-xs text-primary hover:underline">{comp.articleCode}</a>
												</td>
												<td class="px-4 py-1.5 text-card-foreground text-xs">{comp.articleDescription}</td>
												<td class="px-4 py-1.5 text-right font-mono text-xs text-card-foreground">{comp.quantity}</td>
												<td class="px-4 py-1.5 text-xs text-muted-foreground">{UDM_LABELS[comp.udm]}</td>
												<td class="px-4 py-1.5 text-xs text-muted-foreground">{comp.operation || '---'}</td>
												<td class="px-4 py-1.5">
													{#if comp.hasCompleteData}
														<CircleCheckBig class="h-3.5 w-3.5 text-primary" />
													{:else}
														<TriangleAlert class="h-3.5 w-3.5 text-chart-4" />
													{/if}
												</td>
											</tr>
										{/each}
									</tbody>
								</table>
							</div>
						</div>
					{/if}
				{/each}
				{#if unassigned.length > 0}
					<div class="rounded-lg border border-chart-4/30 bg-card overflow-hidden">
						<div class="border-b border-border bg-chart-4/10 px-4 py-2.5">
							<h3 class="text-sm font-semibold text-chart-4">Sin celda asignada ({unassigned.length})</h3>
						</div>
						<div class="overflow-x-auto">
							<table class="w-full text-sm">
								<tbody>
									{#each unassigned as comp (comp.id)}
										<tr class="border-b border-border/30">
											<td class="px-4 py-1.5 font-mono text-xs text-primary">{comp.articleCode}</td>
											<td class="px-4 py-1.5 text-card-foreground text-xs">{comp.articleDescription}</td>
											<td class="px-4 py-1.5 text-right font-mono text-xs text-card-foreground">{comp.quantity}</td>
										</tr>
									{/each}
								</tbody>
							</table>
						</div>
					</div>
				{/if}
			</div>
		{/if}

		<!-- Revision History -->
		{#if showRevisions}
			<div class="rounded-lg border border-border bg-card overflow-hidden">
				<div class="border-b border-border px-4 py-3 flex items-center justify-between">
					<div class="flex items-center gap-2">
						<History class="h-4 w-4 text-primary" />
						<h3 class="text-sm font-semibold text-card-foreground">Historial de Revisiones</h3>
					</div>
					<span class="text-xs text-muted-foreground">{bom.revisions.length} versiones</span>
				</div>
				{#if bom.revisions.length > 0}
					<div class="flex flex-col divide-y divide-border/30">
						{#each [...bom.revisions].reverse() as rev (rev.id)}
							<div class="px-4 py-4 {viewingRevision === rev.id || comparingRevision === rev.id ? 'bg-primary/5 border-l-2 border-primary' : ''}">
								<!-- Header de la revision -->
								<div class="flex items-center justify-between mb-3">
									<div class="flex items-center gap-2">
										<span class="rounded px-2 py-1 text-xs font-mono font-bold {rev.version === bom.version ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'}">
											v{rev.version}
										</span>
										{#if rev.version === bom.version}
											<span class="rounded bg-emerald-500/15 px-1.5 py-0.5 text-[10px] font-medium text-emerald-400">ACTUAL</span>
										{/if}
									</div>
									<div class="flex items-center gap-2 text-xs text-muted-foreground">
										<span>{rev.changedBy}</span>
										<span class="text-muted-foreground/50">|</span>
										<span>{formatDate(rev.changedAt)}</span>
									</div>
								</div>

								<!-- Motivo del cambio -->
								<p class="text-sm text-card-foreground mb-3 pl-1 border-l-2 border-muted ml-1">{rev.changeReason}</p>

								<!-- Changelog narrativo -->
								{#if rev.diff.length > 0}
									<div class="bg-secondary/30 rounded-md p-3 mb-3">
										<p class="text-xs font-medium text-muted-foreground mb-2">Cambios realizados:</p>
										<ul class="space-y-1.5">
											{#each rev.diff as d, i (i)}
												<li class="flex items-start gap-2 text-xs">
													<span class="mt-0.5 h-1.5 w-1.5 rounded-full flex-shrink-0 {d.type === 'added' ? 'bg-emerald-500' : d.type === 'removed' ? 'bg-destructive' : 'bg-chart-4'}"></span>
													<span class="text-card-foreground">
														{#if d.type === 'added'}Se agrego <span class="font-medium text-emerald-400">{d.articleCode}</span> ({d.articleDescription}){/if}
														{#if d.type === 'removed'}Se elimino <span class="font-medium text-destructive">{d.articleCode}</span> ({d.articleDescription}){/if}
														{#if d.type === 'modified'}Se modifico <span class="font-medium text-chart-4">{d.articleCode}</span>: {d.field} <span class="line-through text-muted-foreground">{d.oldValue}</span> <ChevronRight class="inline h-3 w-3" /> <span class="font-medium">{d.newValue}</span>{/if}
													</span>
												</li>
											{/each}
										</ul>
									</div>
								{/if}

								{#if rev.diff.length === 0}
									<p class="text-xs text-muted-foreground bg-secondary/30 rounded-md px-3 py-2 mb-3">
										Version creada como snapshot - sin cambios registrados respecto a la anterior
									</p>
								{/if}

								<!-- Botones de accion -->
								<div class="flex items-center gap-2">
									<button
										onclick={() => (viewingRevision = viewingRevision === rev.id ? null : rev.id)}
										class="flex items-center gap-1.5 rounded px-2.5 py-1.5 text-xs font-medium transition-colors {viewingRevision === rev.id ? 'bg-primary text-primary-foreground' : 'bg-secondary text-foreground hover:bg-accent'}"
									>
										<Eye class="h-3 w-3" /> {viewingRevision === rev.id ? 'Ocultar snapshot' : 'Ver snapshot'}
									</button>
									{#if rev.version !== bom.version}
										<button
											onclick={() => (comparingRevision = comparingRevision === rev.id ? null : rev.id)}
											class="flex items-center gap-1.5 rounded px-2.5 py-1.5 text-xs font-medium transition-colors {comparingRevision === rev.id ? 'bg-chart-4 text-background' : 'bg-secondary text-foreground hover:bg-accent'}"
										>
											<GitBranch class="h-3 w-3" /> {comparingRevision === rev.id ? 'Cerrar comparacion' : 'Comparar con actual'}
										</button>
									{/if}
								</div>
							</div>
						{/each}
					</div>
				{:else}
					<div class="px-4 py-6 text-center text-sm text-muted-foreground">
						No hay revisiones registradas. Usa el boton "Crear Version" para guardar el estado actual.
					</div>
				{/if}
			</div>
		{/if}

		<!-- Viewing old revision snapshot -->
		{#if selectedRevision}
			<div class="rounded-lg border-2 border-primary/50 bg-card overflow-hidden">
				<div class="border-b border-border bg-primary/10 px-4 py-3 flex items-center justify-between">
					<div class="flex items-center gap-2">
						<History class="h-4 w-4 text-primary" />
						<h3 class="text-sm font-semibold text-card-foreground">
							Vista de Version v{selectedRevision.version}
						</h3>
						<span class="text-xs text-muted-foreground">({selectedRevision.componentsSnapshot.length} componentes)</span>
					</div>
					<button
						onclick={() => (viewingRevision = null)}
						class="flex items-center gap-1 rounded px-2 py-1 text-xs bg-secondary text-foreground hover:bg-accent transition-colors"
					>
						<X class="h-3 w-3" /> Cerrar
					</button>
				</div>
				<div class="overflow-x-auto max-h-[400px]">
					<table class="w-full text-sm">
						<thead class="sticky top-0 bg-card">
							<tr class="border-b border-border bg-secondary/50 text-left">
								<th class="px-4 py-2 text-xs font-medium text-muted-foreground w-8">#</th>
								<th class="px-4 py-2 text-xs font-medium text-muted-foreground">Codigo</th>
								<th class="px-4 py-2 text-xs font-medium text-muted-foreground">Descripcion</th>
								<th class="px-4 py-2 text-xs font-medium text-muted-foreground text-right">Cantidad</th>
								<th class="px-4 py-2 text-xs font-medium text-muted-foreground">UdM</th>
								<th class="px-4 py-2 text-xs font-medium text-muted-foreground">Celda</th>
							</tr>
						</thead>
						<tbody>
							{#each selectedRevision.componentsSnapshot as comp, idx (comp.id)}
								<tr class="border-b border-border/50 hover:bg-secondary/30 transition-colors">
									<td class="px-4 py-2 text-xs text-muted-foreground">{idx + 1}</td>
									<td class="px-4 py-2 font-mono text-xs text-primary">{comp.articleCode}</td>
									<td class="px-4 py-2 text-card-foreground max-w-[250px] truncate">{comp.articleDescription}</td>
									<td class="px-4 py-2 text-right font-mono text-card-foreground">{comp.quantity}</td>
									<td class="px-4 py-2 text-xs text-muted-foreground">{UDM_LABELS[comp.udm]}</td>
									<td class="px-4 py-2 text-xs text-muted-foreground">{comp.cell}</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
				<div class="border-t border-border bg-secondary/30 px-4 py-2">
					<p class="text-xs text-muted-foreground">
						Revision creada el {formatDate(selectedRevision.changedAt)} por {selectedRevision.changedBy}.
						Motivo: {selectedRevision.changeReason}
					</p>
				</div>
			</div>
		{/if}

		<!-- Comparison view with highlighting -->
		{#if compareRevision}
			<div class="rounded-lg border-2 border-chart-4/50 bg-card overflow-hidden">
				<div class="border-b border-border bg-chart-4/10 px-4 py-3 flex items-center justify-between">
					<div class="flex items-center gap-3">
						<GitBranch class="h-4 w-4 text-chart-4" />
						<h3 class="text-sm font-semibold text-card-foreground">
							Comparacion: v{compareRevision.version} vs v{bom.version} (actual)
						</h3>
					</div>
					<div class="flex items-center gap-4">
						<div class="flex items-center gap-3 text-xs">
							<span class="flex items-center gap-1"><span class="h-2 w-2 rounded-full bg-emerald-500"></span> Agregado</span>
							<span class="flex items-center gap-1"><span class="h-2 w-2 rounded-full bg-destructive"></span> Eliminado</span>
							<span class="flex items-center gap-1"><span class="h-2 w-2 rounded-full bg-chart-4"></span> Modificado</span>
						</div>
						<button
							onclick={() => (comparingRevision = null)}
							class="flex items-center gap-1 rounded px-2 py-1 text-xs bg-secondary text-foreground hover:bg-accent transition-colors"
						>
							<X class="h-3 w-3" /> Cerrar
						</button>
					</div>
				</div>
				<div class="overflow-x-auto max-h-[500px]">
					<table class="w-full text-sm">
						<thead class="sticky top-0 bg-card z-10">
							<tr class="border-b border-border bg-secondary/50 text-left">
								<th class="px-4 py-2 text-xs font-medium text-muted-foreground w-24">Estado</th>
								<th class="px-4 py-2 text-xs font-medium text-muted-foreground">Codigo</th>
								<th class="px-4 py-2 text-xs font-medium text-muted-foreground">Descripcion</th>
								<th class="px-4 py-2 text-xs font-medium text-muted-foreground text-right">Cantidad</th>
								<th class="px-4 py-2 text-xs font-medium text-muted-foreground">UdM</th>
								<th class="px-4 py-2 text-xs font-medium text-muted-foreground">Celda</th>
								<th class="px-4 py-2 text-xs font-medium text-muted-foreground">Cambios</th>
							</tr>
						</thead>
						<tbody>
							{#each computeDiff(compareRevision.componentsSnapshot, bom.components) as item, idx (idx)}
								<tr class="border-b border-border/50 transition-colors {item.type === 'added' ? 'bg-emerald-500/10' : item.type === 'removed' ? 'bg-destructive/10' : item.type === 'modified' ? 'bg-chart-4/10' : 'hover:bg-secondary/30'}">
									<td class="px-4 py-2">
										{#if item.type !== 'unchanged'}
											<span class="rounded px-1.5 py-0.5 text-[10px] font-bold {item.type === 'added' ? 'bg-emerald-500/20 text-emerald-400' : item.type === 'removed' ? 'bg-destructive/20 text-destructive' : 'bg-chart-4/20 text-chart-4'}">
												{item.type === 'added' ? 'NUEVO' : item.type === 'removed' ? 'ELIMINADO' : 'MODIFICADO'}
											</span>
										{/if}
									</td>
									<td class="px-4 py-2 font-mono text-xs {item.type === 'removed' ? 'line-through text-muted-foreground' : 'text-primary'}">
										{item.component.articleCode}
									</td>
									<td class="px-4 py-2 max-w-[200px] truncate {item.type === 'removed' ? 'line-through text-muted-foreground' : 'text-card-foreground'}">
										{item.component.articleDescription}
									</td>
									<td class="px-4 py-2 text-right font-mono">
										{#if item.type === 'modified' && item.changes?.find((c) => c.field === 'Cantidad')}
											<span>
												<span class="line-through text-muted-foreground mr-1">{item.oldComponent?.quantity}</span>
												<span class="text-chart-4 font-bold">{item.component.quantity}</span>
											</span>
										{:else}
											<span class={item.type === 'removed' ? 'line-through text-muted-foreground' : 'text-card-foreground'}>
												{item.component.quantity}
											</span>
										{/if}
									</td>
									<td class="px-4 py-2 text-xs text-muted-foreground">{UDM_LABELS[item.component.udm]}</td>
									<td class="px-4 py-2 text-xs">
										{#if item.type === 'modified' && item.changes?.find((c) => c.field === 'Celda')}
											<span>
												<span class="line-through text-muted-foreground mr-1">{item.oldComponent?.cell}</span>
												<span class="text-chart-4 font-bold">{item.component.cell}</span>
											</span>
										{:else}
											<span class="text-muted-foreground">{item.component.cell}</span>
										{/if}
									</td>
									<td class="px-4 py-2 text-xs text-muted-foreground">
										{#if item.changes && item.changes.length > 0}
											<span class="text-chart-4">
												{item.changes.map((c) => c.field).join(', ')}
											</span>
										{/if}
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
				<div class="border-t border-border bg-secondary/30 px-4 py-2 flex items-center justify-between">
					<p class="text-xs text-muted-foreground">
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
			</div>
		{/if}

		<!-- Metadata -->
		<div class="flex items-center gap-4 text-xs text-muted-foreground">
			<span>Creado: {formatDate(bom.createdAt)}</span>
			<span>Modificado: {formatDate(bom.updatedAt)}</span>
			<span>Por: {bom.createdBy}</span>
		</div>

		<!-- Modal: Crear Nueva Version -->
		{#if showNewVersionModal}
			<div class="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
				<div class="w-full max-w-md rounded-lg border border-border bg-card p-6 shadow-xl">
					<div class="flex items-center justify-between mb-4">
						<h2 class="text-lg font-semibold text-card-foreground">Crear Nueva Version</h2>
						<button onclick={() => (showNewVersionModal = false)} class="text-muted-foreground hover:text-foreground">
							<X class="h-5 w-5" />
						</button>
					</div>
					<p class="text-sm text-muted-foreground mb-4">
						Se creara la version <span class="font-mono font-bold text-primary">v{bom.version + 1}</span> guardando
						el estado actual del BOM ({bom.components.length} componentes).
					</p>
					<div class="mb-4">
						<label for="new-version-reason" class="block text-sm font-medium text-card-foreground mb-1">
							Motivo del cambio <span class="text-destructive">*</span>
						</label>
						<textarea
							id="new-version-reason"
							bind:value={newVersionReason}
							placeholder="Ej: Actualizacion de cantidades por cambio de diseño..."
							class="w-full rounded-md border border-border bg-secondary px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/50 min-h-[80px]"
						></textarea>
					</div>
					<div class="flex justify-end gap-2">
						<button
							onclick={() => (showNewVersionModal = false)}
							class="rounded-md px-4 py-2 text-sm font-medium text-foreground hover:bg-secondary transition-colors"
						>
							Cancelar
						</button>
						<button
							onclick={handleCreateVersion}
							disabled={!newVersionReason.trim()}
							class="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
						>
							Crear Version v{bom.version + 1}
						</button>
					</div>
				</div>
			</div>
		{/if}
	</div>
{/if}
