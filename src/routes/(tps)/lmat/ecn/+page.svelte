<script lang="ts">
	import { useStore } from '$lib/tps/store.svelte.js';
	import StatusBadge from '$lib/tps/components/status-badge.svelte';
	import StatCard from '$lib/tps/components/stat-card.svelte';
	import { ECN_STATUS_LABELS, ECN_STATUS_COLORS } from '$lib/tps/constants.js';
	import { formatDate } from '$lib/tps/utils.js';
	import type { ECNStatus } from '$lib/tps/types.js';
	import type { Component } from 'svelte';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import * as Empty from '$lib/components/ui/empty/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Progress } from '$lib/components/ui/progress/index.js';
	import GitBranch from '@lucide/svelte/icons/git-branch';
	import Search from '@lucide/svelte/icons/search';
	import Plus from '@lucide/svelte/icons/plus';
	import ChevronRight from '@lucide/svelte/icons/chevron-right';
	import AlertCircle from '@lucide/svelte/icons/circle-alert';
	import CheckCircle2 from '@lucide/svelte/icons/circle-check-big';
	import Clock from '@lucide/svelte/icons/clock';
	import ArrowRight from '@lucide/svelte/icons/arrow-right';
	import Users from '@lucide/svelte/icons/users';
	import FileStack from '@lucide/svelte/icons/file-stack';

	const store = useStore();
	const app = $derived(store.state);

	let query = $state('');
	let statusFilter = $state<ECNStatus | 'todos'>('todos');

	const ecns = $derived(app.ecns ?? []);

	const filtered = $derived.by(() => {
		let items = ecns;
		if (query) items = items.filter((e) => `${e.code} ${e.justification}`.toLowerCase().includes(query.toLowerCase()));
		if (statusFilter !== 'todos') items = items.filter((e) => e.status === statusFilter);
		return [...items].sort((a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime());
	});

	const total = $derived(ecns.length);
	const pending = $derived(ecns.filter((e) => ['solicitud', 'analisis', 'aprobacion'].includes(e.status)).length);
	const completed = $derived(ecns.filter((e) => e.status === 'completado').length);
	const inApproval = $derived(ecns.filter((e) => e.status === 'aprobacion').length);

	const steps = ['solicitud', 'analisis', 'aprobacion', 'aplicacion', 'completado'] as const;

	function getStatusIcon(status: ECNStatus): Component<{ class?: string }> {
		switch (status) {
			case 'completado': return CheckCircle2;
			case 'rechazado': return AlertCircle;
			case 'aprobacion': return Users;
			default: return Clock;
		}
	}

	function getStatusIconClass(status: ECNStatus): string {
		switch (status) {
			case 'completado': return 'text-emerald-400';
			case 'rechazado': return 'text-destructive';
			case 'aprobacion': return 'text-chart-2';
			default: return 'text-chart-4';
		}
	}

	const statusLabel = $derived(
		statusFilter === 'todos' ? 'Todos los estatus' : ECN_STATUS_LABELS[statusFilter]
	);
</script>

<!-- Header -->
<div class="flex flex-wrap items-center justify-between gap-3">
	<p class="text-muted-foreground text-sm">Control de cambios de ingenieria · {total} solicitudes, {filtered.length} mostradas</p>
</div>

<!-- Stats -->
<div class="grid grid-cols-2 gap-4 md:grid-cols-4">
	<StatCard label="Total ECNs" value={total} subtitle="Solicitudes" icon={GitBranch} />
	<StatCard label="En Proceso" value={pending} subtitle="Solicitud, analisis y aprobacion" icon={Clock} />
	<StatCard label="En Aprobacion" value={inApproval} subtitle="Esperando firmas" icon={Users} />
	<StatCard label="Completados" value={completed} subtitle="Aplicados" icon={CheckCircle2} />
</div>

<!-- Workflow -->
<Card.Root>
	<Card.Header>
		<Card.Title>Flujo de ECN (LMAT 2.0)</Card.Title>
	</Card.Header>
	<Card.Content>
		<div class="flex items-center justify-between overflow-x-auto pb-2">
			{#each steps as step, idx (step)}
				<div class="flex items-center">
					<div class="flex min-w-25 flex-col items-center">
						<div class="flex size-8 items-center justify-center rounded-full {step === 'completado' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-secondary text-muted-foreground'}">
							<span class="text-xs font-bold">{idx + 1}</span>
						</div>
						<span class="text-muted-foreground mt-1 text-xs capitalize">{ECN_STATUS_LABELS[step]}</span>
					</div>
					{#if idx < steps.length - 1}
						<ArrowRight class="text-muted-foreground mx-2 size-4" />
					{/if}
				</div>
			{/each}
		</div>
	</Card.Content>
</Card.Root>

<!-- List card -->
<Card.Root>
	<Card.Header>
		<Card.Title>Solicitudes de Cambio</Card.Title>
		<Card.Description>Busca y filtra las solicitudes de cambio de ingenieria.</Card.Description>
	</Card.Header>
	<Card.Content class="flex flex-col gap-4">
		<!-- Filters -->
		<div class="flex flex-wrap items-center gap-2">
			<div class="relative w-full max-w-sm flex-1">
				<Search class="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
				<Input placeholder="Buscar por codigo o justificacion..." bind:value={query} class="pl-8" />
			</div>
			<Select.Root type="single" bind:value={statusFilter}>
				<Select.Trigger size="sm" class="w-44">{statusLabel}</Select.Trigger>
				<Select.Content>
					<Select.Item value="todos">Todos los estatus</Select.Item>
					{#each Object.entries(ECN_STATUS_LABELS) as [k, v] (k)}
						<Select.Item value={k}>{v}</Select.Item>
					{/each}
				</Select.Content>
			</Select.Root>
		</div>

		<!-- ECN List -->
		<div class="flex flex-col gap-3">
			{#each filtered as ecn (ecn.id)}
				{@const IconComponent = getStatusIcon(ecn.status)}
				{@const approvalCount = ecn.approvals.filter((a) => a.status === 'aprobado').length}
				{@const totalApprovals = ecn.approvals.length}
				<a href="/lmat/ecn/{ecn.id}" class="group">
					<Card.Root class="hover:border-primary/50 hover:bg-muted/50 gap-3 py-4 transition-all">
						<Card.Content class="flex flex-col gap-3 px-4">
							<div class="flex items-start justify-between gap-4">
								<div class="flex flex-1 items-start gap-3">
									<IconComponent class="size-4 {getStatusIconClass(ecn.status)}" />
									<div class="flex-1">
										<div class="mb-1 flex items-center gap-2">
											<span class="text-primary font-mono text-sm font-semibold">{ecn.code}</span>
											<StatusBadge label={ECN_STATUS_LABELS[ecn.status]} colorClass={ECN_STATUS_COLORS[ecn.status]} />
										</div>
										<p class="line-clamp-2 text-sm">{ecn.justification}</p>
										<div class="text-muted-foreground mt-2 flex items-center gap-4 text-xs">
											<span>Solicitado por: {ecn.requestedBy}</span>
											<span>{formatDate(ecn.requestedAt)}</span>
										</div>
									</div>
								</div>

								<div class="flex flex-col items-end gap-2">
									{#if ecn.status === 'aprobacion'}
										<div class="flex items-center gap-2">
											<Progress value={(approvalCount / totalApprovals) * 100} max={100} class="h-1.5 w-20 *:data-[slot=progress-indicator]:bg-chart-2" />
											<span class="text-muted-foreground text-xs tabular-nums">{approvalCount}/{totalApprovals}</span>
										</div>
									{/if}
									<div class="text-muted-foreground flex items-center gap-1 text-xs">
										<FileStack class="size-3" />{ecn.affectedBOMIds.length} BOMs afectados
									</div>
									<ChevronRight class="text-muted-foreground size-4 opacity-0 transition-opacity group-hover:opacity-100" />
								</div>
							</div>

							{#if ecn.changes.length > 0}
								<div class="border-border/50 border-t pt-3">
									<p class="text-muted-foreground mb-1 text-[10px] tracking-wider uppercase">Cambios</p>
									<div class="flex flex-wrap gap-1">
										{#each ecn.changes.slice(0, 3) as change, idx (idx)}
											<span class="rounded px-1.5 py-0.5 text-[10px] {change.type === 'agregar' ? 'bg-emerald-500/15 text-emerald-400' : change.type === 'eliminar' ? 'bg-destructive/15 text-destructive-foreground' : 'bg-chart-4/15 text-chart-4'}">
												{change.type}: {change.articleCode || change.field}
											</span>
										{/each}
										{#if ecn.changes.length > 3}
											<span class="bg-secondary text-muted-foreground rounded px-1.5 py-0.5 text-[10px]">+{ecn.changes.length - 3} mas</span>
										{/if}
									</div>
								</div>
							{/if}
						</Card.Content>
					</Card.Root>
				</a>
			{/each}
		</div>

		{#if filtered.length === 0}
			<Empty.Root class="border-0">
				<Empty.Header>
					<Empty.Media variant="icon">
						<GitBranch />
					</Empty.Media>
					<Empty.Title>Sin resultados</Empty.Title>
					<Empty.Description>No se encontraron ECNs con los filtros seleccionados.</Empty.Description>
				</Empty.Header>
			</Empty.Root>
		{/if}
	</Card.Content>
</Card.Root>
