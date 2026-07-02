<script lang="ts">
	import { page } from '$app/state';
	import { useComprasStore } from '$lib/tps/compras/store.svelte.js';
	import { REQ_STATUS_FLOW, REQ_STATUS_COLORS, DEPARTAMENTOS } from '$lib/tps/compras/constants.js';
	import type { ReqStatus } from '$lib/tps/compras/types.js';
	import StatusBadge from '$lib/tps/components/status-badge.svelte';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Table from '$lib/components/ui/table/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import Search from '@lucide/svelte/icons/search';
	import RotateCcw from '@lucide/svelte/icons/rotate-ccw';
	import Check from '@lucide/svelte/icons/check';
	import CircleDot from '@lucide/svelte/icons/circle-dot';
	import Circle from '@lucide/svelte/icons/circle';
	import X from '@lucide/svelte/icons/x';

	const store = useComprasStore();
	const data = $derived(store.state);

	const initialStatus = page.url.searchParams.get('status') ?? '';
	const initialReq = page.url.searchParams.get('req');
	let query = $state('');
	let deptoFilter = $state<string>('todos');
	let statusFilter = $state<ReqStatus | 'todos'>((initialStatus || 'todos') as ReqStatus | 'todos');

	const filtered = $derived.by(() => {
		let items = data.requisiciones;
		if (query) items = items.filter((r) => `${r.id} ${r.material}`.toLowerCase().includes(query.toLowerCase()));
		if (deptoFilter !== 'todos') items = items.filter((r) => r.depto === deptoFilter);
		if (statusFilter !== 'todos') items = items.filter((r) => r.status === statusFilter);
		return items;
	});

	const deptoLabel = $derived(deptoFilter === 'todos' ? 'Todos los departamentos' : deptoFilter);
	const statusLabel = $derived(statusFilter === 'todos' ? 'Todos los estatus' : statusFilter);

	function resetFilters() {
		query = '';
		deptoFilter = 'todos';
		statusFilter = 'todos';
	}

	let detailId = $state<string | null>(initialReq && store.getRequisicion(initialReq) ? initialReq : null);
	const detail = $derived(detailId ? store.getRequisicion(detailId) : undefined);
	const currentIdx = $derived(detail ? REQ_STATUS_FLOW.indexOf(detail.status as ReqStatus) : -1);
</script>

<div class="flex flex-col gap-6">
	<div class="flex flex-wrap items-center justify-between gap-3">
		<div>
			<h2 class="text-xl font-semibold">Requisiciones</h2>
			<p class="text-muted-foreground text-sm">Seguimiento completo de materiales solicitados</p>
		</div>
		<Badge variant="outline" class="font-mono">GAP-COM-003</Badge>
	</div>

	<Card.Root>
		<Card.Header>
			<div class="flex flex-wrap items-center gap-2">
				<div class="relative w-full max-w-xs flex-1">
					<Search class="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
					<Input placeholder="Buscar folio o material…" bind:value={query} class="pl-8" />
				</div>
				<Select.Root type="single" bind:value={deptoFilter}>
					<Select.Trigger size="sm" class="w-48">{deptoLabel}</Select.Trigger>
					<Select.Content>
						<Select.Item value="todos">Todos los departamentos</Select.Item>
						{#each DEPARTAMENTOS as d (d)}
							<Select.Item value={d}>{d}</Select.Item>
						{/each}
					</Select.Content>
				</Select.Root>
				<Select.Root type="single" bind:value={statusFilter}>
					<Select.Trigger size="sm" class="w-44">{statusLabel}</Select.Trigger>
					<Select.Content>
						<Select.Item value="todos">Todos los estatus</Select.Item>
						{#each REQ_STATUS_FLOW as s (s)}
							<Select.Item value={s}>{s}</Select.Item>
						{/each}
						<Select.Item value="Cancelado">Cancelado</Select.Item>
					</Select.Content>
				</Select.Root>
				<Button variant="ghost" size="sm" class="ms-auto" onclick={resetFilters}>
					<RotateCcw data-icon="inline-start" /> Limpiar
				</Button>
			</div>
		</Card.Header>
		<Card.Content>
			<Table.Root>
				<Table.Header>
					<Table.Row>
						<Table.Head>Folio</Table.Head>
						<Table.Head>Material</Table.Head>
						<Table.Head>Solicitante</Table.Head>
						<Table.Head>Depto.</Table.Head>
						<Table.Head>Fecha</Table.Head>
						<Table.Head class="text-center">Estatus</Table.Head>
						<Table.Head class="text-right">Detalle</Table.Head>
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{#each filtered as r (r.id)}
						<Table.Row>
							<Table.Cell class="text-primary font-mono text-xs">{r.id}</Table.Cell>
							<Table.Cell class="text-sm">{r.material}</Table.Cell>
							<Table.Cell class="text-sm">{r.solicitante}</Table.Cell>
							<Table.Cell class="text-sm">{r.depto}</Table.Cell>
							<Table.Cell class="text-muted-foreground text-xs">{r.fecha}</Table.Cell>
							<Table.Cell class="text-center">
								<StatusBadge label={r.status} colorClass={REQ_STATUS_COLORS[r.status]} />
								{#if r.diasRetraso > 0}<span class="text-destructive ml-1 text-xs font-medium">+{r.diasRetraso}d</span>{/if}
							</Table.Cell>
							<Table.Cell class="text-right">
								<Button size="sm" variant="ghost" onclick={() => (detailId = r.id)}>Ver</Button>
							</Table.Cell>
						</Table.Row>
					{/each}
					{#if filtered.length === 0}
						<Table.Row>
							<Table.Cell colspan={7} class="text-muted-foreground py-10 text-center text-sm">
								Sin resultados con los filtros aplicados.
							</Table.Cell>
						</Table.Row>
					{/if}
				</Table.Body>
			</Table.Root>
		</Card.Content>
	</Card.Root>
</div>

<!-- ── DETALLE REQUISICIÓN + TIMELINE ── -->
<Dialog.Root open={detailId !== null} onOpenChange={(o) => { if (!o) detailId = null; }}>
	<Dialog.Content class="max-h-[90vh] overflow-y-auto sm:max-w-xl">
		{#if detail}
			<Dialog.Header>
				<Dialog.Title class="font-mono">{detail.id}</Dialog.Title>
				<Dialog.Description>Línea de tiempo y detalle de la requisición.</Dialog.Description>
			</Dialog.Header>

			<div class="grid grid-cols-2 gap-4 text-sm">
				<div><p class="text-muted-foreground text-xs">Material</p><p class="font-medium">{detail.material}</p></div>
				<div><p class="text-muted-foreground text-xs">Solicitante</p><p class="font-medium">{detail.solicitante}</p></div>
				<div><p class="text-muted-foreground text-xs">Departamento</p><p class="font-medium">{detail.depto}</p></div>
				<div><p class="text-muted-foreground text-xs">Fecha de solicitud</p><p class="font-medium">{detail.fecha}</p></div>
				<div><p class="text-muted-foreground text-xs">Estatus actual</p><StatusBadge label={detail.status} colorClass={REQ_STATUS_COLORS[detail.status]} /></div>
				{#if detail.diasRetraso > 0}
					<div><p class="text-muted-foreground text-xs">Retraso</p><p class="text-destructive font-semibold">{detail.diasRetraso} día(s)</p></div>
				{/if}
			</div>

			<h4 class="text-sm font-semibold">Línea de Tiempo</h4>
			{#if detail.status === 'Cancelado'}
				<div class="border-destructive/30 bg-destructive/5 flex items-center gap-3 rounded-lg border p-3">
					<div class="bg-destructive text-destructive-foreground flex size-8 shrink-0 items-center justify-center rounded-full">
						<X class="size-4" />
					</div>
					<div>
						<p class="text-destructive text-sm font-medium">Requisición Cancelada</p>
						<p class="text-muted-foreground text-xs">Fecha: {detail.fecha}</p>
					</div>
				</div>
			{:else}
				<div class="overflow-x-auto pb-2">
					<div class="flex" style="min-width:{REQ_STATUS_FLOW.length * 90}px">
						{#each REQ_STATUS_FLOW as s, i (s)}
							{@const isDone = i < currentIdx}
							{@const isActive = i === currentIdx}
							{@const Icon = isDone ? Check : isActive ? CircleDot : Circle}
							<div class="relative flex flex-1 flex-col items-center">
								{#if i < REQ_STATUS_FLOW.length - 1}
									<span class="absolute top-3.5 left-1/2 h-0.5 w-full {isDone ? 'bg-primary' : 'bg-border'}"></span>
								{/if}
								<div
									class="z-10 flex size-7 items-center justify-center rounded-full {isDone
										? 'bg-primary text-primary-foreground'
										: isActive
											? 'bg-primary text-primary-foreground ring-primary/30 ring-4'
											: 'bg-background text-muted-foreground border-border border-2'}"
								>
									<Icon class="size-3.5" />
								</div>
								<p class="mt-2 px-1 text-center text-xs leading-tight {i <= currentIdx ? 'text-foreground font-medium' : 'text-muted-foreground'}">{s}</p>
							</div>
						{/each}
					</div>
				</div>
			{/if}
		{/if}
	</Dialog.Content>
</Dialog.Root>
