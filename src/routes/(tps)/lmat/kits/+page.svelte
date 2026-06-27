<script lang="ts">
	import { useStore } from '$lib/tps/store.svelte.js';
	import StatusBadge from '$lib/tps/components/status-badge.svelte';
	import StatCard from '$lib/tps/components/stat-card.svelte';
	import {
		PRODUCTION_PROCESS_LABELS,
		PRODUCTION_PROCESS_COLORS,
		PRODUCTION_PROCESS_ORDER
	} from '$lib/tps/constants.js';
	import { formatDate } from '$lib/tps/utils.js';
	import { cn } from '$lib/utils.js';
	import type { ProductionProcess } from '$lib/tps/types.js';
	import type { Component } from 'svelte';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import * as Empty from '$lib/components/ui/empty/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Progress } from '$lib/components/ui/progress/index.js';
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

	const statusFilterLabel = $derived(
		statusFilter === 'todos' ? 'Todos los estatus' : getStatusLabel(statusFilter)
	);
</script>

<!-- Header -->
<div class="flex flex-wrap items-center justify-between gap-3">
	<p class="text-muted-foreground text-sm">
		Vista de manufactura/almacen · {total} kits, {filtered.length} mostrados
	</p>
</div>

<!-- Stats -->
<div class="grid grid-cols-2 gap-4 md:grid-cols-5">
	<StatCard label="Total Kits" value={total} subtitle="Surtimiento" icon={Boxes} />
	<StatCard label="Pendientes" value={pending} subtitle="Por preparar" icon={Clock} />
	<StatCard label="En Preparacion" value={inPrep} subtitle="En curso" icon={ScanLine} />
	<StatCard label="Entregados" value={delivered} subtitle="Completados" icon={CheckCircle2} />
	<StatCard label="Con Backorder" value={withBackorder} subtitle="Faltantes" icon={AlertTriangle} />
</div>

<!-- Process Overview -->
<Card.Root>
	<Card.Header>
		<Card.Title>Kits por Proceso</Card.Title>
		<Card.Description>Selecciona un proceso para filtrar la lista.</Card.Description>
	</Card.Header>
	<Card.Content>
		<div class="grid grid-cols-2 gap-3 md:grid-cols-5">
			{#each byProcess as { process, count, pending: processPending } (process)}
				<button
					type="button"
					onclick={() => (processFilter = processFilter === process ? 'todos' : process)}
					class={cn(
						'rounded-lg border p-3 text-left transition-colors',
						processFilter === process ? 'border-primary bg-primary/10' : 'hover:bg-muted/50'
					)}
				>
					<div class="mb-1 flex items-center justify-between">
						<StatusBadge label={PRODUCTION_PROCESS_LABELS[process]} colorClass={PRODUCTION_PROCESS_COLORS[process]} />
					</div>
					<div class="mt-2 flex items-end justify-between">
						<span class="text-lg font-bold tabular-nums">{count}</span>
						{#if processPending > 0}
							<span class="text-chart-4 text-xs">{processPending} pendientes</span>
						{/if}
					</div>
				</button>
			{/each}
		</div>
	</Card.Content>
</Card.Root>

<!-- List card -->
<Card.Root>
	<Card.Header>
		<Card.Title>Kits de Surtimiento</Card.Title>
		<Card.Description>Busca y filtra los kits de surtimiento.</Card.Description>
	</Card.Header>
	<Card.Content class="flex flex-col gap-4">
		<!-- Filters -->
		<div class="flex flex-wrap items-center gap-2">
			<div class="relative w-full max-w-sm flex-1">
				<Search class="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
				<Input placeholder="Buscar por folio o celda..." bind:value={query} class="pl-8" />
			</div>
			<Select.Root type="single" bind:value={statusFilter}>
				<Select.Trigger size="sm" class="w-44">{statusFilterLabel}</Select.Trigger>
				<Select.Content>
					<Select.Item value="todos">Todos los estatus</Select.Item>
					<Select.Item value="pendiente">Pendiente</Select.Item>
					<Select.Item value="en_preparacion">En Preparacion</Select.Item>
					<Select.Item value="listo">Listo</Select.Item>
					<Select.Item value="parcial">Parcial</Select.Item>
					<Select.Item value="entregado">Entregado</Select.Item>
				</Select.Content>
			</Select.Root>
			{#if processFilter !== 'todos'}
				<Button variant="secondary" size="sm" onclick={() => (processFilter = 'todos')}>
					<Filter data-icon="inline-start" />
					{PRODUCTION_PROCESS_LABELS[processFilter]}
					<span class="ml-1">x</span>
				</Button>
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
				<a href="/lmat/kits/{kit.id}" class="group">
					<Card.Root class="hover:border-primary/50 hover:bg-muted/50 gap-3 py-4 transition-all">
						<Card.Content class="flex flex-col gap-3 px-4">
							<div class="flex items-start justify-between gap-4">
								<div class="flex flex-1 items-start gap-3">
									<StatusIcon class="size-4 {getStatusIconClass(kit.status)}" />
									<div class="flex-1">
										<div class="mb-1 flex items-center gap-2">
											<span class="text-primary font-mono text-sm font-semibold">Folio {kit.folio}</span>
											<StatusBadge label={PRODUCTION_PROCESS_LABELS[kit.process]} colorClass={PRODUCTION_PROCESS_COLORS[kit.process]} />
											<span class="bg-secondary text-muted-foreground rounded px-1.5 py-0.5 text-xs">{kit.cell}</span>
										</div>
										{#if spec}
											<p class="text-muted-foreground text-sm">{spec.brand} {spec.model} - {spec.code}</p>
										{/if}
										<div class="text-muted-foreground mt-2 flex items-center gap-4 text-xs">
											<span class="flex items-center gap-1"><Package class="size-3" />{totalItems} componentes</span>
											<span>{formatDate(kit.createdAt.split('T')[0])}</span>
										</div>
									</div>
								</div>

								<div class="flex flex-col items-end gap-2">
									<StatusBadge label={getStatusLabel(kit.status)} colorClass={getStatusColor(kit.status)} />
									<div class="flex items-center gap-2">
										<Progress value={progress} max={100} class={cn('h-1.5 w-20', progress === 100 ? '' : '*:data-[slot=progress-indicator]:bg-chart-4')} />
										<span class="text-muted-foreground font-mono text-xs tabular-nums">{scannedCount}/{totalItems}</span>
									</div>
									{#if kit.hasBackorder}
										<div class="text-destructive flex items-center gap-1 text-xs">
											<AlertTriangle class="size-3" />
											Backorder
										</div>
									{/if}
									<ChevronRight class="text-muted-foreground size-4 opacity-0 transition-opacity group-hover:opacity-100" />
								</div>
							</div>

							{#if kit.items.length > 0}
								<div class="border-border/50 border-t pt-3">
									<div class="flex flex-wrap gap-1">
										{#each kit.items.slice(0, 4) as item, idx (idx)}
											<div class="flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] {item.scanned ? 'bg-emerald-500/15 text-emerald-400' : item.quantityBackorder > 0 ? 'bg-destructive/15 text-destructive-foreground' : 'bg-secondary text-muted-foreground'}">
												{#if item.scanned}<CheckCircle2 class="size-2.5" />{/if}
												{item.articleCode}
											</div>
										{/each}
										{#if kit.items.length > 4}
											<span class="bg-secondary text-muted-foreground rounded px-1.5 py-0.5 text-[10px]">+{kit.items.length - 4} mas</span>
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
						<Boxes />
					</Empty.Media>
					<Empty.Title>Sin resultados</Empty.Title>
					<Empty.Description>No se encontraron kits con los filtros seleccionados.</Empty.Description>
				</Empty.Header>
			</Empty.Root>
		{/if}
	</Card.Content>
</Card.Root>
