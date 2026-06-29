<script lang="ts">
	import { page } from '$app/state';
	import { useStore } from '$lib/tps/store.svelte.js';
	import { ECN_STATUS_LABELS, ECN_STATUS_COLORS } from '$lib/tps/constants.js';
	import { formatDate } from '$lib/tps/utils.js';
	import { formatCurrency } from '$lib/tps/utils.js';
	import type { ECNStatus } from '$lib/tps/types.js';
	import StatusBadge from '$lib/tps/components/status-badge.svelte';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Table from '$lib/components/ui/table/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Separator } from '$lib/components/ui/separator/index.js';
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
	<div class="mx-auto flex w-full max-w-5xl flex-col items-center justify-center gap-4 py-20">
		<p class="text-muted-foreground">ECN no encontrado</p>
		<Button href="/lmat/ecn" variant="outline" size="sm">Volver al listado</Button>
	</div>
{:else}
	<div class="mx-auto flex w-full max-w-5xl flex-col gap-6">
		<!-- Header -->
		<div class="flex flex-wrap items-center justify-between gap-3">
			<div class="flex items-center gap-3">
				<Button href="/lmat/ecn" variant="outline" size="icon">
					<ArrowLeft />
				</Button>
				<GitBranch class="text-primary size-6" />
				<div class="flex flex-col gap-1">
					<div class="flex items-center gap-2">
						<h2 class="font-mono text-xl font-bold">{ecn.code}</h2>
						<StatusBadge label={ECN_STATUS_LABELS[ecn.status]} colorClass={ECN_STATUS_COLORS[ecn.status]} />
					</div>
					<p class="text-muted-foreground text-sm">
						Solicitado por {ecn.requestedBy} el {formatDate(ecn.requestedAt)}
					</p>
				</div>
			</div>
			{#if canApply && ecn.status !== 'completado'}
				<Button onclick={handleApplyECN}>
					<Check data-icon="inline-start" /> Aplicar ECN
				</Button>
			{/if}
		</div>

		<!-- Workflow Progress -->
		<Card.Root>
			<Card.Header>
				<Card.Title>Progreso del ECN</Card.Title>
			</Card.Header>
			<Card.Content>
				<div class="flex items-center justify-between">
					{#each workflowSteps as step, idx (step.id)}
						{@const isCompleted = idx < currentStepIndex || ecn.status === 'completado'}
						{@const isCurrent = idx === currentStepIndex && ecn.status !== 'completado'}
						{@const isRejected = ecn.status === 'rechazado' && idx === currentStepIndex}
						<div class="flex flex-1 items-center">
							<div class="flex flex-1 flex-col items-center">
								<div class="flex size-10 items-center justify-center rounded-full border-2 transition-colors {isCompleted ? 'bg-primary border-primary text-primary-foreground' : isCurrent ? (isRejected ? 'bg-destructive/20 border-destructive text-destructive' : 'bg-primary/20 border-primary text-primary') : 'bg-secondary border-border text-muted-foreground'}">
									{#if isCompleted}
										<Check class="size-5" />
									{:else if isRejected}
										<X class="size-5" />
									{:else}
										<span class="text-sm font-bold">{idx + 1}</span>
									{/if}
								</div>
								<span class="mt-2 text-xs {isCompleted || isCurrent ? 'text-foreground font-medium' : 'text-muted-foreground'}">
									{step.label}
								</span>
							</div>
							{#if idx < workflowSteps.length - 1}
								<div class="mx-2 h-0.5 w-full {isCompleted ? 'bg-primary' : 'bg-border'}"></div>
							{/if}
						</div>
					{/each}
				</div>
			</Card.Content>
		</Card.Root>

		<!-- Main Content Grid -->
		<div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
			<!-- Left Column - Details -->
			<div class="flex flex-col gap-6 lg:col-span-2">
				<!-- Justification -->
				<Card.Root>
					<Card.Header>
						<Card.Title>Justificacion del Cambio</Card.Title>
					</Card.Header>
					<Card.Content>
						<p class="text-sm leading-relaxed">{ecn.justification}</p>
					</Card.Content>
				</Card.Root>

				<!-- Changes -->
				<Card.Root>
					<Card.Header>
						<Card.Title>Cambios Propuestos</Card.Title>
					</Card.Header>
					<Card.Content>
						<Table.Root>
							<Table.Header>
								<Table.Row>
									<Table.Head>Tipo</Table.Head>
									<Table.Head>Articulo</Table.Head>
									<Table.Head>Campo</Table.Head>
									<Table.Head>Valor Anterior</Table.Head>
									<Table.Head>Nuevo Valor</Table.Head>
								</Table.Row>
							</Table.Header>
							<Table.Body>
								{#each ecn.changes as change, idx (idx)}
									<Table.Row>
										<Table.Cell>
											<StatusBadge
												label={change.type.charAt(0).toUpperCase() + change.type.slice(1)}
												colorClass={change.type === 'agregar' ? 'bg-emerald-500/15 text-emerald-400' : change.type === 'eliminar' ? 'bg-destructive/15 text-destructive-foreground' : 'bg-chart-4/15 text-chart-4'}
											/>
										</Table.Cell>
										<Table.Cell class="text-primary font-mono text-xs">{change.articleCode || 'N/A'}</Table.Cell>
										<Table.Cell class="text-muted-foreground">{change.field}</Table.Cell>
										<Table.Cell class="text-muted-foreground">{change.oldValue || '-'}</Table.Cell>
										<Table.Cell class="font-medium">{change.newValue}</Table.Cell>
									</Table.Row>
								{/each}
							</Table.Body>
						</Table.Root>
					</Card.Content>
				</Card.Root>

				<!-- Approvals -->
				<Card.Root>
					<Card.Header>
						<Card.Title>Aprobaciones por Departamento</Card.Title>
					</Card.Header>
					<Card.Content class="flex flex-col gap-3">
						{#each ecn.approvals as approval, idx (idx)}
							{@const si = getStatusIcon(approval.status)}
							{@const Icon = si.icon}
							<div class="rounded-lg border p-4 {approval.status === 'aprobado' ? 'border-emerald-500/30 bg-emerald-500/5' : approval.status === 'rechazado' ? 'border-destructive/30 bg-destructive/5' : ''}">
								<div class="mb-2 flex items-center justify-between">
									<div class="flex items-center gap-2">
										<Icon class="size-5 {si.cls}" />
										<span class="font-medium">{approval.department}</span>
									</div>
									{#if approval.status === 'pendiente' && ecn.status === 'aprobacion'}
										<div class="flex items-center gap-2">
											<Button size="sm" onclick={() => handleApprove(approval.department, true)}>
												<Check data-icon="inline-start" /> Aprobar
											</Button>
											<Button variant="destructive" size="sm" onclick={() => handleApprove(approval.department, false)}>
												<X data-icon="inline-start" /> Rechazar
											</Button>
										</div>
									{:else}
										<StatusBadge
											label={approval.status === 'aprobado' ? 'Aprobado' : approval.status === 'rechazado' ? 'Rechazado' : 'Pendiente'}
											colorClass={approval.status === 'aprobado' ? 'bg-emerald-500/15 text-emerald-400' : approval.status === 'rechazado' ? 'bg-destructive/15 text-destructive-foreground' : 'bg-muted text-muted-foreground'}
										/>
									{/if}
								</div>

								{#if approval.status === 'pendiente' && ecn.status === 'aprobacion'}
									<Input
										type="text"
										placeholder="Notas de aprobacion (opcional)..."
										value={approvalNotes[approval.department] || ''}
										oninput={(e) => (approvalNotes = { ...approvalNotes, [approval.department]: (e.currentTarget as HTMLInputElement).value })}
									/>
								{/if}

								{#if approval.approvedBy}
									<div class="text-muted-foreground mt-2 text-xs">
										{approval.approvedBy} - {formatDate(approval.approvedAt || '')}
										{#if approval.notes}<p class="mt-1 italic">"{approval.notes}"</p>{/if}
									</div>
								{/if}
							</div>
						{/each}
					</Card.Content>
				</Card.Root>
			</div>

			<!-- Right Column - Impact & Meta -->
			<div class="flex flex-col gap-6">
				<!-- Impact Summary -->
				<Card.Root>
					<Card.Header>
						<Card.Title>Impacto</Card.Title>
					</Card.Header>
					<Card.Content class="flex flex-col gap-4">
						<!-- Affected BOMs -->
						<div class="flex flex-col gap-2">
							<div class="flex items-center gap-2">
								<Layers class="text-muted-foreground size-4" />
								<span class="text-muted-foreground text-xs">BOMs Afectados</span>
							</div>
							{#if affectedBOMs.length > 0}
								<div class="flex flex-col gap-1">
									{#each affectedBOMs as bom (bom.id)}
										<a href="/lmat/boms/{bom.id}" class="bg-secondary hover:bg-secondary/80 text-primary block rounded-md px-2 py-1 text-xs transition-colors">
											{bom.specificationCode} - {bom.vehicleModel}
										</a>
									{/each}
								</div>
							{:else}
								<p class="text-muted-foreground text-xs">Sin BOMs afectados</p>
							{/if}
						</div>

						<!-- Affected Folios -->
						{#if ecn.affectedFolios.length > 0}
							<Separator />
							<div class="flex flex-col gap-2">
								<div class="flex items-center gap-2">
									<FileStack class="text-muted-foreground size-4" />
									<span class="text-muted-foreground text-xs">Folios Afectados</span>
								</div>
								<div class="flex flex-wrap gap-1">
									{#each ecn.affectedFolios as folio (folio)}
										<Badge variant="outline" class="text-chart-4">{folio}</Badge>
									{/each}
								</div>
							</div>
						{/if}

						<!-- Inventory Impact -->
						{#if ecn.inventoryImpact}
							<Separator />
							<div class="flex flex-col gap-2">
								<div class="flex items-center gap-2">
									<CircleAlert class="text-muted-foreground size-4" />
									<span class="text-muted-foreground text-xs">Impacto en Inventario</span>
								</div>
								<p class="text-xs">{ecn.inventoryImpact}</p>
							</div>
						{/if}

						<!-- Costo y tiempo -->
						<Separator />
						<div class="grid grid-cols-2 gap-2">
							<div class="rounded-md border p-2">
								<span class="text-muted-foreground text-xs">Impacto Costo</span>
								<p class="text-sm font-mono tabular-nums">{ecn.costImpact ? formatCurrency(ecn.costImpact, 'MXN') : 'Por definir'}</p>
							</div>
							<div class="rounded-md border p-2">
								<span class="text-muted-foreground text-xs">Impacto Tiempo</span>
								<p class="text-sm font-mono tabular-nums">{ecn.timeImpact ? `${ecn.timeImpact} h` : 'Por definir'}</p>
							</div>
							<div class="rounded-md border p-2">
								<span class="text-muted-foreground text-xs">MO Aditiva</span>
								<p class="text-sm font-mono tabular-nums">{ecn.additiveLabor ? `${ecn.additiveLabor} h` : '-'}</p>
							</div>
							<div class="rounded-md border p-2">
								<span class="text-muted-foreground text-xs">Materiales Aditiva</span>
								<p class="text-sm font-mono tabular-nums">{ecn.additiveMaterials ? formatCurrency(ecn.additiveMaterials, 'MXN') : '-'}</p>
							</div>
						</div>
					</Card.Content>
				</Card.Root>

				<!-- Effectivity -->
				<Card.Root>
					<Card.Header>
						<Card.Title>Efectividad</Card.Title>
					</Card.Header>
					<Card.Content>
						<p class="text-sm">{ecn.effectivity || 'Por definir'}</p>
						{#if ecn.appliedAt}
							<Separator class="my-3" />
							<p class="text-muted-foreground text-xs">
								Aplicado el {formatDate(ecn.appliedAt)} por {ecn.appliedBy}
							</p>
						{/if}
					</Card.Content>
				</Card.Root>

				<!-- Notifications -->
				{#if ecn.notifiedAreas.length > 0}
					<Card.Root>
						<Card.Header>
							<Card.Title>Areas Notificadas</Card.Title>
						</Card.Header>
						<Card.Content>
							<div class="flex flex-wrap gap-1">
								{#each ecn.notifiedAreas as area (area)}
									<Badge variant="secondary">
										<Bell data-icon="inline-start" /> {area}
									</Badge>
								{/each}
							</div>
						</Card.Content>
					</Card.Root>
				{/if}
			</div>
		</div>
	</div>
{/if}
