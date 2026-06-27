<script lang="ts">
	import { useStore } from '$lib/tps/store.svelte.js';
	import StatusBadge from '$lib/tps/components/status-badge.svelte';
	import { ECN_STATUS_LABELS, ECN_STATUS_COLORS } from '$lib/tps/constants.js';
	import { formatDate } from '$lib/tps/utils.js';
	import type { ECNStatus } from '$lib/tps/types.js';
	import type { Component } from 'svelte';
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
</script>

<div class="flex flex-col gap-6">
	<!-- Header -->
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-foreground text-2xl font-bold">ECN - Engineering Change Notice</h1>
			<p class="text-muted-foreground text-sm">Control de cambios de ingenieria / {total} solicitudes, {filtered.length} mostradas</p>
		</div>
	</div>

	<!-- Stats -->
	<div class="grid grid-cols-2 gap-4 md:grid-cols-4">
		<div class="border-border bg-card rounded-lg border p-3">
			<span class="text-muted-foreground text-xs">Total ECNs</span>
			<p class="text-card-foreground text-xl font-bold">{total}</p>
		</div>
		<div class="border-border bg-card rounded-lg border p-3">
			<span class="text-muted-foreground text-xs">En Proceso</span>
			<p class="text-chart-4 text-xl font-bold">{pending}</p>
		</div>
		<div class="border-border bg-card rounded-lg border p-3">
			<span class="text-muted-foreground text-xs">En Aprobacion</span>
			<p class="text-chart-2 text-xl font-bold">{inApproval}</p>
		</div>
		<div class="border-border bg-card rounded-lg border p-3">
			<span class="text-muted-foreground text-xs">Completados</span>
			<p class="text-primary text-xl font-bold">{completed}</p>
		</div>
	</div>

	<!-- Workflow -->
	<div class="border-border bg-card rounded-lg border p-4">
		<h3 class="text-card-foreground mb-3 text-sm font-semibold">Flujo de ECN (LMAT 2.0)</h3>
		<div class="flex items-center justify-between overflow-x-auto pb-2">
			{#each steps as step, idx (step)}
				<div class="flex items-center">
					<div class="flex min-w-[100px] flex-col items-center">
						<div class="flex h-8 w-8 items-center justify-center rounded-full {step === 'completado' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-secondary text-muted-foreground'}">
							<span class="text-xs font-bold">{idx + 1}</span>
						</div>
						<span class="text-muted-foreground mt-1 text-xs capitalize">{ECN_STATUS_LABELS[step]}</span>
					</div>
					{#if idx < steps.length - 1}
						<ArrowRight class="text-muted-foreground mx-2 h-4 w-4" />
					{/if}
				</div>
			{/each}
		</div>
	</div>

	<!-- Filters -->
	<div class="flex flex-wrap items-center gap-3">
		<div class="border-border bg-card flex max-w-sm min-w-[200px] flex-1 items-center gap-1.5 rounded-md border px-3 py-1.5">
			<Search class="text-muted-foreground h-3.5 w-3.5" />
			<input type="text" placeholder="Buscar por codigo o justificacion..." bind:value={query}
				class="text-foreground placeholder:text-muted-foreground w-full border-none bg-transparent text-sm outline-none" />
		</div>
		<select bind:value={statusFilter} class="border-border bg-card text-foreground rounded-md border px-2 py-1.5 text-xs outline-none">
			<option value="todos">Todos los estatus</option>
			{#each Object.entries(ECN_STATUS_LABELS) as [k, v] (k)}
				<option value={k}>{v}</option>
			{/each}
		</select>
	</div>

	<!-- ECN List -->
	<div class="flex flex-col gap-3">
		{#each filtered as ecn (ecn.id)}
			{@const IconComponent = getStatusIcon(ecn.status)}
			{@const approvalCount = ecn.approvals.filter((a) => a.status === 'aprobado').length}
			{@const totalApprovals = ecn.approvals.length}
			<a href="/lmat/ecn/{ecn.id}" class="group border-border bg-card hover:border-primary/50 hover:bg-secondary/30 rounded-lg border p-4 transition-all">
				<div class="flex items-start justify-between gap-4">
					<div class="flex flex-1 items-start gap-3">
						<IconComponent class="h-4 w-4 {getStatusIconClass(ecn.status)}" />
						<div class="flex-1">
							<div class="mb-1 flex items-center gap-2">
								<span class="text-primary font-mono text-sm font-semibold">{ecn.code}</span>
								<StatusBadge label={ECN_STATUS_LABELS[ecn.status]} colorClass={ECN_STATUS_COLORS[ecn.status]} />
							</div>
							<p class="text-card-foreground line-clamp-2 text-sm">{ecn.justification}</p>
							<div class="text-muted-foreground mt-2 flex items-center gap-4 text-xs">
								<span>Solicitado por: {ecn.requestedBy}</span>
								<span>{formatDate(ecn.requestedAt)}</span>
							</div>
						</div>
					</div>

					<div class="flex flex-col items-end gap-2">
						{#if ecn.status === 'aprobacion'}
							<div class="flex items-center gap-2">
								<div class="bg-secondary h-1.5 w-20 rounded-full">
									<div class="bg-chart-2 h-1.5 rounded-full transition-all" style="width: {(approvalCount / totalApprovals) * 100}%"></div>
								</div>
								<span class="text-muted-foreground text-xs">{approvalCount}/{totalApprovals}</span>
							</div>
						{/if}
						<div class="text-muted-foreground flex items-center gap-1 text-xs">
							<FileStack class="h-3 w-3" />{ecn.affectedBOMIds.length} BOMs afectados
						</div>
						<ChevronRight class="text-muted-foreground h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100" />
					</div>
				</div>

				{#if ecn.changes.length > 0}
					<div class="border-border/50 mt-3 border-t pt-3">
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
			</a>
		{/each}
	</div>

	{#if filtered.length === 0}
		<div class="flex flex-col items-center justify-center py-12 text-center">
			<GitBranch class="text-muted-foreground/30 mb-4 h-12 w-12" />
			<p class="text-muted-foreground text-sm">No se encontraron ECNs con los filtros seleccionados.</p>
		</div>
	{/if}
</div>
