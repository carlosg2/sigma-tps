<script lang="ts">
	import { useStore } from '$lib/tps/store.svelte.js';
	import StatusBadge from '$lib/tps/components/status-badge.svelte';
	import {
		PRODUCTION_PROCESS_LABELS,
		PRODUCTION_PROCESS_COLORS,
		PRODUCTION_PROCESS_ORDER
	} from '$lib/tps/constants.js';
	import { formatDate } from '$lib/tps/utils.js';
	import type { ProductionProcess } from '$lib/tps/types.js';
	import type { Component } from 'svelte';
	import Boxes from '@lucide/svelte/icons/boxes';
	import Search from '@lucide/svelte/icons/search';
	import ChevronRight from '@lucide/svelte/icons/chevron-right';
	import Package from '@lucide/svelte/icons/package';
	import CheckCircle2 from '@lucide/svelte/icons/circle-check-big';
	import Clock from '@lucide/svelte/icons/clock';
	import AlertTriangle from '@lucide/svelte/icons/triangle-alert';
	import Truck from '@lucide/svelte/icons/truck';
	import ScanLine from '@lucide/svelte/icons/scan-line';
	import Filter from '@lucide/svelte/icons/filter';

	const store = useStore();
	const app = $derived(store.state);

	let query = $state('');
	let processFilter = $state<ProductionProcess | 'todos'>('todos');
	let statusFilter = $state<string>('todos');

	const supplyKits = $derived(app.supplyKits ?? []);
	const specifications = $derived(app.specifications ?? []);

	const filtered = $derived.by(() => {
		let items = supplyKits;
		if (query) {
			items = items.filter((k) =>
				`${k.folio} ${k.cell}`.toLowerCase().includes(query.toLowerCase())
			);
		}
		if (processFilter !== 'todos') {
			items = items.filter((k) => k.process === processFilter);
		}
		if (statusFilter !== 'todos') {
			items = items.filter((k) => k.status === statusFilter);
		}
		return [...items].sort(
			(a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
		);
	});

	// Stats
	const total = $derived(supplyKits.length);
	const pending = $derived(supplyKits.filter((k) => k.status === 'pendiente').length);
	const inPrep = $derived(supplyKits.filter((k) => k.status === 'en_preparacion').length);
	const delivered = $derived(supplyKits.filter((k) => k.status === 'entregado').length);
	const withBackorder = $derived(supplyKits.filter((k) => k.hasBackorder).length);

	// Group by process for overview
	const byProcess = $derived(
		PRODUCTION_PROCESS_ORDER.map((process) => ({
			process,
			count: supplyKits.filter((k) => k.process === process).length,
			pending: supplyKits.filter((k) => k.process === process && k.status === 'pendiente').length
		}))
	);

	function getStatusIcon(status: string): Component<{ class?: string }> {
		switch (status) {
			case 'entregado':
				return CheckCircle2;
			case 'listo':
				return Truck;
			case 'en_preparacion':
				return ScanLine;
			case 'parcial':
				return AlertTriangle;
			default:
				return Clock;
		}
	}

	function getStatusIconClass(status: string): string {
		switch (status) {
			case 'entregado':
				return 'text-emerald-400';
			case 'listo':
				return 'text-chart-2';
			case 'en_preparacion':
				return 'text-chart-4';
			case 'parcial':
				return 'text-chart-5';
			default:
				return 'text-muted-foreground';
		}
	}

	function getStatusColor(status: string): string {
		switch (status) {
			case 'entregado':
				return 'bg-emerald-500/15 text-emerald-400';
			case 'listo':
				return 'bg-chart-2/15 text-chart-2';
			case 'en_preparacion':
				return 'bg-chart-4/15 text-chart-4';
			case 'parcial':
				return 'bg-chart-5/15 text-chart-5';
			default:
				return 'bg-muted text-muted-foreground';
		}
	}

	function getStatusLabel(status: string): string {
		switch (status) {
			case 'entregado':
				return 'Entregado';
			case 'listo':
				return 'Listo';
			case 'en_preparacion':
				return 'En Preparacion';
			case 'parcial':
				return 'Parcial';
			default:
				return 'Pendiente';
		}
	}
</script>

<div class="flex flex-col gap-6">
	<!-- Header -->
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-foreground text-2xl font-bold">Kits de Surtimiento</h1>
			<p class="text-muted-foreground text-sm">
				Vista de manufactura/almacen - {total} kits, {filtered.length} mostrados
			</p>
		</div>
	</div>

	<!-- Stats -->
	<div class="grid grid-cols-2 gap-4 md:grid-cols-5">
		<div class="border-border bg-card rounded-lg border p-3">
			<span class="text-muted-foreground text-xs">Total Kits</span>
			<p class="text-card-foreground text-xl font-bold">{total}</p>
		</div>
		<div class="border-border bg-card rounded-lg border p-3">
			<span class="text-muted-foreground text-xs">Pendientes</span>
			<p class="text-chart-4 text-xl font-bold">{pending}</p>
		</div>
		<div class="border-border bg-card rounded-lg border p-3">
			<span class="text-muted-foreground text-xs">En Preparacion</span>
			<p class="text-chart-2 text-xl font-bold">{inPrep}</p>
		</div>
		<div class="border-border bg-card rounded-lg border p-3">
			<span class="text-muted-foreground text-xs">Entregados</span>
			<p class="text-primary text-xl font-bold">{delivered}</p>
		</div>
		<div class="border-border bg-card rounded-lg border p-3">
			<span class="text-muted-foreground text-xs">Con Backorder</span>
			<p class="text-destructive text-xl font-bold">{withBackorder}</p>
		</div>
	</div>

	<!-- Process Overview -->
	<div class="border-border bg-card rounded-lg border p-4">
		<h3 class="text-card-foreground mb-3 text-sm font-semibold">Kits por Proceso</h3>
		<div class="grid grid-cols-2 gap-3 md:grid-cols-5">
			{#each byProcess as { process, count, pending: processPending } (process)}
				<button
					onclick={() => (processFilter = processFilter === process ? 'todos' : process)}
					class="rounded-lg border p-3 text-left transition-colors {processFilter === process
						? 'border-primary bg-primary/10'
						: 'border-border hover:bg-secondary/50'}"
				>
					<div class="mb-1 flex items-center justify-between">
						<StatusBadge
							label={PRODUCTION_PROCESS_LABELS[process]}
							colorClass={PRODUCTION_PROCESS_COLORS[process]}
						/>
					</div>
					<div class="mt-2 flex items-end justify-between">
						<span class="text-card-foreground text-lg font-bold">{count}</span>
						{#if processPending > 0}
							<span class="text-chart-4 text-xs">{processPending} pendientes</span>
						{/if}
					</div>
				</button>
			{/each}
		</div>
	</div>

	<!-- Filters -->
	<div class="flex flex-wrap items-center gap-3">
		<div
			class="border-border bg-card flex max-w-sm min-w-[200px] flex-1 items-center gap-1.5 rounded-md border px-3 py-1.5"
		>
			<Search class="text-muted-foreground h-3.5 w-3.5" />
			<input
				type="text"
				placeholder="Buscar por folio o celda..."
				bind:value={query}
				class="text-foreground placeholder:text-muted-foreground w-full border-none bg-transparent text-sm outline-none"
			/>
		</div>
		<select
			bind:value={statusFilter}
			class="border-border bg-card text-foreground rounded-md border px-2 py-1.5 text-xs outline-none"
		>
			<option value="todos">Todos los estatus</option>
			<option value="pendiente">Pendiente</option>
			<option value="en_preparacion">En Preparacion</option>
			<option value="listo">Listo</option>
			<option value="parcial">Parcial</option>
			<option value="entregado">Entregado</option>
		</select>
		{#if processFilter !== 'todos'}
			<button
				onclick={() => (processFilter = 'todos')}
				class="bg-primary/10 text-primary flex items-center gap-1 rounded-md px-2 py-1 text-xs"
			>
				<Filter class="h-3 w-3" />
				{PRODUCTION_PROCESS_LABELS[processFilter]}
				<span class="ml-1">x</span>
			</button>
		{/if}
	</div>

	<!-- Kits List -->
	<div class="flex flex-col gap-3">
		{#each filtered as kit (kit.id)}
			{@const spec = specifications.find((s) => s.id === kit.specificationId)}
			{@const scannedCount = kit.items.filter((i) => i.scanned).length}
			{@const totalItems = kit.items.length}
			{@const progress = totalItems > 0 ? Math.round((scannedCount / totalItems) * 100) : 0}
			{@const StatusIcon = getStatusIcon(kit.status)}
			<a
				href="/lmat/kits/{kit.id}"
				class="group border-border bg-card hover:border-primary/50 hover:bg-secondary/30 rounded-lg border p-4 transition-all"
			>
				<div class="flex items-start justify-between gap-4">
					<div class="flex flex-1 items-start gap-3">
						<StatusIcon class="h-4 w-4 {getStatusIconClass(kit.status)}" />
						<div class="flex-1">
							<div class="mb-1 flex items-center gap-2">
								<span class="text-primary font-mono text-sm font-semibold">Folio {kit.folio}</span>
								<StatusBadge
									label={PRODUCTION_PROCESS_LABELS[kit.process]}
									colorClass={PRODUCTION_PROCESS_COLORS[kit.process]}
								/>
								<span class="bg-secondary text-muted-foreground rounded px-1.5 py-0.5 text-xs">
									{kit.cell}
								</span>
							</div>
							{#if spec}
								<p class="text-muted-foreground text-sm">
									{spec.brand} {spec.model} - {spec.code}
								</p>
							{/if}
							<div class="text-muted-foreground mt-2 flex items-center gap-4 text-xs">
								<span class="flex items-center gap-1">
									<Package class="h-3 w-3" />
									{totalItems} componentes
								</span>
								<span>{formatDate(kit.createdAt.split('T')[0])}</span>
							</div>
						</div>
					</div>

					<div class="flex flex-col items-end gap-2">
						<StatusBadge label={getStatusLabel(kit.status)} colorClass={getStatusColor(kit.status)} />

						<!-- Progress -->
						<div class="flex items-center gap-2">
							<div class="bg-secondary h-1.5 w-20 rounded-full">
								<div
									class="h-1.5 rounded-full transition-all {progress === 100
										? 'bg-primary'
										: 'bg-chart-4'}"
									style="width: {progress}%"
								></div>
							</div>
							<span class="text-muted-foreground font-mono text-xs">{scannedCount}/{totalItems}</span>
						</div>

						{#if kit.hasBackorder}
							<div class="text-destructive flex items-center gap-1 text-xs">
								<AlertTriangle class="h-3 w-3" />
								Backorder
							</div>
						{/if}

						<ChevronRight
							class="text-muted-foreground h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100"
						/>
					</div>
				</div>

				<!-- Items Preview -->
				{#if kit.items.length > 0}
					<div class="border-border/50 mt-3 border-t pt-3">
						<div class="flex flex-wrap gap-1">
							{#each kit.items.slice(0, 4) as item, idx (idx)}
								<div
									class="flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] {item.scanned
										? 'bg-emerald-500/15 text-emerald-400'
										: item.quantityBackorder > 0
											? 'bg-destructive/15 text-destructive-foreground'
											: 'bg-secondary text-muted-foreground'}"
								>
									{#if item.scanned}
										<CheckCircle2 class="h-2.5 w-2.5" />
									{/if}
									{item.articleCode}
								</div>
							{/each}
							{#if kit.items.length > 4}
								<span
									class="bg-secondary text-muted-foreground rounded px-1.5 py-0.5 text-[10px]"
								>
									+{kit.items.length - 4} mas
								</span>
							{/if}
						</div>
					</div>
				{/if}
			</a>
		{/each}
	</div>

	{#if filtered.length === 0}
		<div class="flex flex-col items-center justify-center py-12 text-center">
			<Boxes class="text-muted-foreground/30 mb-4 h-12 w-12" />
			<p class="text-muted-foreground text-sm">
				No se encontraron kits con los filtros seleccionados.
			</p>
		</div>
	{/if}
</div>
