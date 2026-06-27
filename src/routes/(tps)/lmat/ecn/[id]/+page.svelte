<script lang="ts">
	import { page } from '$app/state';
	import { useStore } from '$lib/tps/store.svelte.js';
	import { ECN_STATUS_LABELS, ECN_STATUS_COLORS } from '$lib/tps/constants.js';
	import { formatDate } from '$lib/tps/utils.js';
	import type { ECNStatus } from '$lib/tps/types.js';
	import StatusBadge from '$lib/tps/components/status-badge.svelte';
	import ArrowLeft from '@lucide/svelte/icons/arrow-left';
	import GitBranch from '@lucide/svelte/icons/git-branch';
	import CircleCheckBig from '@lucide/svelte/icons/circle-check-big';
	import CircleAlert from '@lucide/svelte/icons/circle-alert';
	import Clock from '@lucide/svelte/icons/clock';
	import FileStack from '@lucide/svelte/icons/file-stack';
	import Check from '@lucide/svelte/icons/check';
	import X from '@lucide/svelte/icons/x';
	import Bell from '@lucide/svelte/icons/bell';
	import Layers from '@lucide/svelte/icons/layers';

	const store = useStore();
	const app = $derived(store.state);
	const id = $derived(page.params.id);

	let approvalNotes = $state<Record<string, string>>({});

	const ecn = $derived(app.ecns.find((e) => e.id === id));

	const affectedBOMs = $derived(ecn ? app.boms.filter((b) => ecn.affectedBOMIds.includes(b.id)) : []);

	function handleApprove(department: string, approved: boolean) {
		if (!ecn) return;
		store.dispatch({
			type: 'APPROVE_ECN',
			payload: { ecnId: ecn.id, department, approved, notes: approvalNotes[department] || '' }
		});
	}

	function handleApplyECN() {
		if (!ecn) return;
		store.dispatch({ type: 'APPLY_ECN', payload: { ecnId: ecn.id } });
	}

	function getStatusIcon(status: string) {
		switch (status) {
			case 'aprobado':
				return { icon: CircleCheckBig, cls: 'text-emerald-400' };
			case 'rechazado':
				return { icon: CircleAlert, cls: 'text-destructive' };
			default:
				return { icon: Clock, cls: 'text-muted-foreground' };
		}
	}

	const canApply = $derived(
		ecn
			? ecn.status === 'aplicacion' || (ecn.status === 'aprobacion' && ecn.approvals.every((a) => a.status === 'aprobado'))
			: false
	);

	const workflowSteps: { id: ECNStatus; label: string }[] = [
		{ id: 'solicitud', label: 'Solicitud' },
		{ id: 'analisis', label: 'Analisis' },
		{ id: 'aprobacion', label: 'Aprobacion' },
		{ id: 'aplicacion', label: 'Aplicacion' },
		{ id: 'completado', label: 'Completado' }
	];

	const currentStepIndex = $derived(ecn ? workflowSteps.findIndex((s) => s.id === ecn.status) : -1);
</script>

{#if !ecn}
	<div class="flex flex-col items-center justify-center gap-4 py-20">
		<p class="text-muted-foreground">ECN no encontrado</p>
		<a href="/lmat/ecn" class="text-primary hover:underline text-sm">Volver al listado</a>
	</div>
{/if}

{#if ecn}
	<div class="flex flex-col gap-6">
		<!-- Header -->
		<div class="flex items-center justify-between">
			<div class="flex items-center gap-3">
				<a href="/lmat/ecn" class="flex h-8 w-8 items-center justify-center rounded-md border border-border hover:bg-secondary transition-colors">
					<ArrowLeft class="h-4 w-4 text-foreground" />
				</a>
				<GitBranch class="h-6 w-6 text-primary" />
				<div>
					<div class="flex items-center gap-2">
						<h1 class="text-xl font-bold font-mono text-foreground">{ecn.code}</h1>
						<StatusBadge label={ECN_STATUS_LABELS[ecn.status]} colorClass={ECN_STATUS_COLORS[ecn.status]} />
					</div>
					<p class="text-sm text-muted-foreground">
						Solicitado por {ecn.requestedBy} el {formatDate(ecn.requestedAt)}
					</p>
				</div>
			</div>
			{#if canApply && ecn.status !== 'completado'}
				<button onclick={handleApplyECN} class="flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
					<Check class="h-4 w-4" /> Aplicar ECN
				</button>
			{/if}
		</div>

		<!-- Workflow Progress -->
		<div class="rounded-lg border border-border bg-card p-4">
			<h3 class="text-sm font-semibold text-card-foreground mb-4">Progreso del ECN</h3>
			<div class="flex items-center justify-between">
				{#each workflowSteps as step, idx (step.id)}
					{@const isCompleted = idx < currentStepIndex || ecn.status === 'completado'}
					{@const isCurrent = idx === currentStepIndex && ecn.status !== 'completado'}
					{@const isRejected = ecn.status === 'rechazado' && idx === currentStepIndex}
					<div class="flex items-center flex-1">
						<div class="flex flex-col items-center flex-1">
							<div class="h-10 w-10 rounded-full flex items-center justify-center border-2 transition-colors {isCompleted ? 'bg-primary border-primary text-primary-foreground' : isCurrent ? (isRejected ? 'bg-destructive/20 border-destructive text-destructive' : 'bg-primary/20 border-primary text-primary') : 'bg-secondary border-border text-muted-foreground'}">
								{#if isCompleted}
									<Check class="h-5 w-5" />
								{:else if isRejected}
									<X class="h-5 w-5" />
								{:else}
									<span class="text-sm font-bold">{idx + 1}</span>
								{/if}
							</div>
							<span class="text-xs mt-2 {isCompleted || isCurrent ? 'text-card-foreground font-medium' : 'text-muted-foreground'}">
								{step.label}
							</span>
						</div>
						{#if idx < workflowSteps.length - 1}
							<div class="h-0.5 w-full mx-2 {isCompleted ? 'bg-primary' : 'bg-border'}"></div>
						{/if}
					</div>
				{/each}
			</div>
		</div>

		<!-- Main Content Grid -->
		<div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
			<!-- Left Column - Details -->
			<div class="lg:col-span-2 space-y-6">
				<!-- Justification -->
				<div class="rounded-lg border border-border bg-card">
					<div class="border-b border-border px-4 py-3">
						<h3 class="text-sm font-semibold text-card-foreground">Justificacion del Cambio</h3>
					</div>
					<div class="p-4">
						<p class="text-sm text-card-foreground leading-relaxed">{ecn.justification}</p>
					</div>
				</div>

				<!-- Changes -->
				<div class="rounded-lg border border-border bg-card">
					<div class="border-b border-border px-4 py-3">
						<h3 class="text-sm font-semibold text-card-foreground">Cambios Propuestos</h3>
					</div>
					<div class="overflow-x-auto">
						<table class="w-full text-sm">
							<thead>
								<tr class="border-b border-border bg-secondary/50 text-left">
									<th class="px-4 py-2.5 text-xs font-medium text-muted-foreground">Tipo</th>
									<th class="px-4 py-2.5 text-xs font-medium text-muted-foreground">Articulo</th>
									<th class="px-4 py-2.5 text-xs font-medium text-muted-foreground">Campo</th>
									<th class="px-4 py-2.5 text-xs font-medium text-muted-foreground">Valor Anterior</th>
									<th class="px-4 py-2.5 text-xs font-medium text-muted-foreground">Nuevo Valor</th>
								</tr>
							</thead>
							<tbody>
								{#each ecn.changes as change, idx (idx)}
									<tr class="border-b border-border/50 hover:bg-secondary/30 transition-colors">
										<td class="px-4 py-2.5">
											<span class="rounded px-2 py-0.5 text-xs font-medium {change.type === 'agregar' ? 'bg-emerald-500/15 text-emerald-400' : change.type === 'eliminar' ? 'bg-destructive/15 text-destructive-foreground' : 'bg-chart-4/15 text-chart-4'}">
												{change.type.charAt(0).toUpperCase() + change.type.slice(1)}
											</span>
										</td>
										<td class="px-4 py-2.5 font-mono text-xs text-primary">{change.articleCode || 'N/A'}</td>
										<td class="px-4 py-2.5 text-muted-foreground">{change.field}</td>
										<td class="px-4 py-2.5 text-muted-foreground">{change.oldValue || '-'}</td>
										<td class="px-4 py-2.5 text-card-foreground font-medium">{change.newValue}</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
				</div>

				<!-- Approvals -->
				<div class="rounded-lg border border-border bg-card">
					<div class="border-b border-border px-4 py-3">
						<h3 class="text-sm font-semibold text-card-foreground">Aprobaciones por Departamento</h3>
					</div>
					<div class="p-4 space-y-3">
						{#each ecn.approvals as approval, idx (idx)}
							{@const si = getStatusIcon(approval.status)}
							{@const Icon = si.icon}
							<div class="rounded-lg border p-4 {approval.status === 'aprobado' ? 'border-emerald-500/30 bg-emerald-500/5' : approval.status === 'rechazado' ? 'border-destructive/30 bg-destructive/5' : 'border-border'}">
								<div class="flex items-center justify-between mb-2">
									<div class="flex items-center gap-2">
										<Icon class="h-5 w-5 {si.cls}" />
										<span class="font-medium text-card-foreground">{approval.department}</span>
									</div>
									{#if approval.status === 'pendiente' && ecn.status === 'aprobacion'}
										<div class="flex items-center gap-2">
											<button onclick={() => handleApprove(approval.department, true)} class="flex items-center gap-1 rounded-md bg-emerald-500/20 px-2 py-1 text-xs text-emerald-400 hover:bg-emerald-500/30 transition-colors">
												<Check class="h-3 w-3" /> Aprobar
											</button>
											<button onclick={() => handleApprove(approval.department, false)} class="flex items-center gap-1 rounded-md bg-destructive/20 px-2 py-1 text-xs text-destructive-foreground hover:bg-destructive/30 transition-colors">
												<X class="h-3 w-3" /> Rechazar
											</button>
										</div>
									{:else}
										<StatusBadge
											label={approval.status === 'aprobado' ? 'Aprobado' : approval.status === 'rechazado' ? 'Rechazado' : 'Pendiente'}
											colorClass={approval.status === 'aprobado' ? 'bg-emerald-500/15 text-emerald-400' : approval.status === 'rechazado' ? 'bg-destructive/15 text-destructive-foreground' : 'bg-muted text-muted-foreground'}
										/>
									{/if}
								</div>

								{#if approval.status === 'pendiente' && ecn.status === 'aprobacion'}
									<div class="mt-2">
										<input
											type="text"
											placeholder="Notas de aprobacion (opcional)..."
											value={approvalNotes[approval.department] || ''}
											oninput={(e) => (approvalNotes = { ...approvalNotes, [approval.department]: (e.currentTarget as HTMLInputElement).value })}
											class="w-full rounded-md border border-border bg-secondary px-3 py-1.5 text-sm text-foreground outline-none placeholder:text-muted-foreground"
										/>
									</div>
								{/if}

								{#if approval.approvedBy}
									<div class="text-xs text-muted-foreground mt-2">
										{approval.approvedBy} - {formatDate(approval.approvedAt || '')}
										{#if approval.notes}<p class="mt-1 italic">"{approval.notes}"</p>{/if}
									</div>
								{/if}
							</div>
						{/each}
					</div>
				</div>
			</div>

			<!-- Right Column - Impact & Meta -->
			<div class="space-y-6">
				<!-- Impact Summary -->
				<div class="rounded-lg border border-border bg-card">
					<div class="border-b border-border px-4 py-3">
						<h3 class="text-sm font-semibold text-card-foreground">Impacto</h3>
					</div>
					<div class="p-4 space-y-4">
						<!-- Affected BOMs -->
						<div>
							<div class="flex items-center gap-2 mb-2">
								<Layers class="h-4 w-4 text-muted-foreground" />
								<span class="text-xs text-muted-foreground">BOMs Afectados</span>
							</div>
							{#if affectedBOMs.length > 0}
								<div class="space-y-1">
									{#each affectedBOMs as bom (bom.id)}
										<a href="/lmat/boms/{bom.id}" class="block rounded-md bg-secondary px-2 py-1 text-xs text-primary hover:bg-secondary/80 transition-colors">
											{bom.specificationCode} - {bom.vehicleModel}
										</a>
									{/each}
								</div>
							{:else}
								<p class="text-xs text-muted-foreground">Sin BOMs afectados</p>
							{/if}
						</div>

						<!-- Affected Folios -->
						{#if ecn.affectedFolios.length > 0}
							<div>
								<div class="flex items-center gap-2 mb-2">
									<FileStack class="h-4 w-4 text-muted-foreground" />
									<span class="text-xs text-muted-foreground">Folios Afectados</span>
								</div>
								<div class="flex flex-wrap gap-1">
									{#each ecn.affectedFolios as folio (folio)}
										<span class="rounded bg-chart-4/15 px-1.5 py-0.5 text-xs text-chart-4">{folio}</span>
									{/each}
								</div>
							</div>
						{/if}

						<!-- Inventory Impact -->
						{#if ecn.inventoryImpact}
							<div>
								<div class="flex items-center gap-2 mb-2">
									<CircleAlert class="h-4 w-4 text-muted-foreground" />
									<span class="text-xs text-muted-foreground">Impacto en Inventario</span>
								</div>
								<p class="text-xs text-card-foreground">{ecn.inventoryImpact}</p>
							</div>
						{/if}
					</div>
				</div>

				<!-- Effectivity -->
				<div class="rounded-lg border border-border bg-card">
					<div class="border-b border-border px-4 py-3">
						<h3 class="text-sm font-semibold text-card-foreground">Efectividad</h3>
					</div>
					<div class="p-4">
						<p class="text-sm text-card-foreground">{ecn.effectivity || 'Por definir'}</p>
						{#if ecn.appliedAt}
							<div class="mt-3 pt-3 border-t border-border">
								<p class="text-xs text-muted-foreground">
									Aplicado el {formatDate(ecn.appliedAt)} por {ecn.appliedBy}
								</p>
							</div>
						{/if}
					</div>
				</div>

				<!-- Notifications -->
				{#if ecn.notifiedAreas.length > 0}
					<div class="rounded-lg border border-border bg-card">
						<div class="border-b border-border px-4 py-3">
							<h3 class="text-sm font-semibold text-card-foreground">Areas Notificadas</h3>
						</div>
						<div class="p-4">
							<div class="flex flex-wrap gap-1">
								{#each ecn.notifiedAreas as area (area)}
									<div class="flex items-center gap-1 rounded bg-secondary px-2 py-0.5">
										<Bell class="h-3 w-3 text-muted-foreground" />
										<span class="text-xs text-muted-foreground">{area}</span>
									</div>
								{/each}
							</div>
						</div>
					</div>
				{/if}
			</div>
		</div>
	</div>
{/if}
