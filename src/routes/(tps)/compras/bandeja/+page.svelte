<script lang="ts">
	import { useComprasStore } from '$lib/tps/compras/store.svelte.js';
	import { PACKAGE_STATUS_COLORS, CENTROS_COSTO, fmtMoney } from '$lib/tps/compras/constants.js';
	import type { PackageStatus } from '$lib/tps/compras/types.js';
	import StatusBadge from '$lib/tps/components/status-badge.svelte';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Table from '$lib/components/ui/table/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import * as Alert from '$lib/components/ui/alert/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Textarea } from '$lib/components/ui/textarea/index.js';
	import { toast } from 'svelte-sonner';
	import Info from '@lucide/svelte/icons/info';
	import RotateCcw from '@lucide/svelte/icons/rotate-ccw';
	import Check from '@lucide/svelte/icons/check';
	import Ban from '@lucide/svelte/icons/ban';
	import PlusCircle from '@lucide/svelte/icons/circle-plus';
	import CircleCheckBig from '@lucide/svelte/icons/circle-check-big';
	import CircleX from '@lucide/svelte/icons/circle-x';

	const store = useComprasStore();
	const data = $derived(store.state);

	let ccFilter = $state<string>('todos');
	let estadoFilter = $state<PackageStatus | 'todos'>('todos');
	let nivelFilter = $state<string>('todos');

	const filtered = $derived.by(() => {
		let items = data.ordenes;
		if (ccFilter !== 'todos') items = items.filter((o) => o.centroCosto === ccFilter);
		if (estadoFilter !== 'todos') items = items.filter((o) => o.estado === estadoFilter);
		if (nivelFilter !== 'todos') items = items.filter((o) => o.nivel === +nivelFilter);
		return items;
	});

	const ccLabel = $derived(ccFilter === 'todos' ? 'Todos los centros de costo' : `${ccFilter} · ${CENTROS_COSTO.find((c) => c.id === ccFilter)?.nombre}`);
	const estadoLabel = $derived(estadoFilter === 'todos' ? 'Todos los estados' : estadoFilter);
	const nivelLabel = $derived(nivelFilter === 'todos' ? 'Todos los niveles' : `Nivel ${nivelFilter}`);

	function resetFilters() {
		ccFilter = 'todos';
		estadoFilter = 'todos';
		nivelFilter = 'todos';
	}

	// --- Detalle ---
	let detailId = $state<string | null>(null);
	const detail = $derived(detailId ? store.getOrden(detailId) : undefined);

	// --- Autorizar / Rechazar ---
	let authId = $state<string | null>(null);
	let authMode = $state<'autorizar' | 'rechazar'>('autorizar');
	let comment = $state('');
	const authOrden = $derived(authId ? store.getOrden(authId) : undefined);

	function openAuth(id: string, mode: 'autorizar' | 'rechazar') {
		authId = id;
		authMode = mode;
		comment = '';
		detailId = null;
	}

	function confirmAuth() {
		if (!authOrden) return;
		if (authMode === 'autorizar') {
			store.authorizeOrden(authOrden.id, comment);
			toast.success('Orden de Compra autorizada correctamente.');
		} else {
			store.rejectOrden(authOrden.id, comment);
			toast.error('Orden de Compra rechazada. Regresa al flujo.');
		}
		authId = null;
	}

	const bitacoraIcon = { creacion: PlusCircle, aprobado: CircleCheckBig, rechazado: CircleX };
	const bitacoraColor = { creacion: 'text-muted-foreground', aprobado: 'text-emerald-500', rechazado: 'text-destructive' };
</script>

<div class="flex flex-col gap-6">
	<div class="flex flex-wrap items-center justify-between gap-3">
		<div>
			<h2 class="text-xl font-semibold">Bandeja de Autorización</h2>
			<p class="text-muted-foreground text-sm">Órdenes de Compra pendientes de autorización</p>
		</div>
		<Badge variant="outline" class="font-mono">GAP-COM-002</Badge>
	</div>

	<!-- Sesion activa -->
	<Alert.Root>
		<Info />
		<Alert.Title>Sesión activa: {data.currentUser.name} – {data.currentUser.role} (Nivel {data.currentUser.nivel})</Alert.Title>
		<Alert.Description>Autorizas OCs con montos entre $50,001 y $200,000.</Alert.Description>
	</Alert.Root>

	<Card.Root>
		<Card.Header>
			<div class="flex flex-wrap items-center gap-2">
				<Select.Root type="single" bind:value={ccFilter}>
					<Select.Trigger size="sm" class="w-56">{ccLabel}</Select.Trigger>
					<Select.Content>
						<Select.Item value="todos">Todos los centros de costo</Select.Item>
						{#each CENTROS_COSTO as cc (cc.id)}
							<Select.Item value={cc.id}>{cc.id} · {cc.nombre}</Select.Item>
						{/each}
					</Select.Content>
				</Select.Root>
				<Select.Root type="single" bind:value={estadoFilter}>
					<Select.Trigger size="sm" class="w-40">{estadoLabel}</Select.Trigger>
					<Select.Content>
						<Select.Item value="todos">Todos los estados</Select.Item>
						<Select.Item value="Pendiente">Pendiente</Select.Item>
						<Select.Item value="Aprobado">Aprobado</Select.Item>
						<Select.Item value="Rechazado">Rechazado</Select.Item>
					</Select.Content>
				</Select.Root>
				<Select.Root type="single" bind:value={nivelFilter}>
					<Select.Trigger size="sm" class="w-36">{nivelLabel}</Select.Trigger>
					<Select.Content>
						<Select.Item value="todos">Todos los niveles</Select.Item>
						<Select.Item value="1">Nivel 1</Select.Item>
						<Select.Item value="2">Nivel 2</Select.Item>
						<Select.Item value="3">Nivel 3</Select.Item>
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
						<Table.Head>No. OC</Table.Head>
						<Table.Head>Proveedor</Table.Head>
						<Table.Head>Centro de Costo</Table.Head>
						<Table.Head>Solicitante</Table.Head>
						<Table.Head class="text-right">Monto</Table.Head>
						<Table.Head class="text-center">Nivel</Table.Head>
						<Table.Head class="text-center">Estado</Table.Head>
						<Table.Head class="text-right">Acciones</Table.Head>
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{#each filtered as o (o.id)}
						<Table.Row>
							<Table.Cell>
								<span class="text-primary font-mono text-xs font-semibold">{o.id}</span>
								<p class="text-muted-foreground text-xs">{o.partidas.length} partida(s) · {o.fecha}</p>
							</Table.Cell>
							<Table.Cell class="text-sm">{o.proveedor}</Table.Cell>
							<Table.Cell class="text-sm">{o.centroCosto} · {o.ccNombre}</Table.Cell>
							<Table.Cell class="text-sm">{o.solicitante}</Table.Cell>
							<Table.Cell class="text-right font-semibold tabular-nums">{fmtMoney(o.monto)}</Table.Cell>
							<Table.Cell class="text-center">
								<Badge variant="secondary">Nivel {o.nivel}</Badge>
							</Table.Cell>
							<Table.Cell class="text-center">
								<StatusBadge label={o.estado} colorClass={PACKAGE_STATUS_COLORS[o.estado]} />
							</Table.Cell>
							<Table.Cell>
								<div class="flex justify-end gap-1">
									<Button size="sm" variant="ghost" onclick={() => (detailId = o.id)}>Ver</Button>
									{#if o.estado === 'Pendiente'}
										<Button size="sm" variant="outline" onclick={() => openAuth(o.id, 'autorizar')}>
											<Check data-icon="inline-start" /> Autorizar
										</Button>
										<Button size="sm" variant="outline" onclick={() => openAuth(o.id, 'rechazar')}>
											<Ban data-icon="inline-start" /> Rechazar
										</Button>
									{/if}
								</div>
							</Table.Cell>
						</Table.Row>
					{/each}
					{#if filtered.length === 0}
						<Table.Row>
							<Table.Cell colspan={8} class="text-muted-foreground py-10 text-center text-sm">
								Sin registros con los filtros seleccionados.
							</Table.Cell>
						</Table.Row>
					{/if}
				</Table.Body>
			</Table.Root>
		</Card.Content>
	</Card.Root>
</div>

<!-- ── DETALLE OC ── -->
<Dialog.Root open={detailId !== null} onOpenChange={(o) => { if (!o) detailId = null; }}>
	<Dialog.Content class="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
		{#if detail}
			<Dialog.Header>
				<Dialog.Title class="font-mono">{detail.id}</Dialog.Title>
				<Dialog.Description>Detalle de la Orden de Compra y bitácora de autorización.</Dialog.Description>
			</Dialog.Header>

			<div class="grid grid-cols-2 gap-4 text-sm">
				<div><p class="text-muted-foreground text-xs">Centro de Costo</p><p class="font-medium">{detail.centroCosto} · {detail.ccNombre}</p></div>
				<div><p class="text-muted-foreground text-xs">Solicitante</p><p class="font-medium">{detail.solicitante}</p></div>
				<div><p class="text-muted-foreground text-xs">Proveedor</p><p class="font-medium">{detail.proveedor}</p></div>
				<div><p class="text-muted-foreground text-xs">Fecha de envío</p><p class="font-medium">{detail.fecha}</p></div>
				<div><p class="text-muted-foreground text-xs">Estado</p><StatusBadge label={detail.estado} colorClass={PACKAGE_STATUS_COLORS[detail.estado]} /></div>
				<div><p class="text-muted-foreground text-xs">Nivel requerido</p><p class="font-medium">Nivel {detail.nivel}</p></div>
				<div class="col-span-2"><p class="text-muted-foreground text-xs">Monto total</p><p class="text-base font-bold tabular-nums">{fmtMoney(detail.monto)}</p></div>
			</div>

			<div>
				<h4 class="mb-2 text-sm font-semibold">Partidas de la Orden de Compra</h4>
				<div class="rounded-lg border">
					<Table.Root>
						<Table.Header>
							<Table.Row>
								<Table.Head>Concepto</Table.Head>
								<Table.Head class="text-right">Cant.</Table.Head>
								<Table.Head class="text-right">Monto</Table.Head>
							</Table.Row>
						</Table.Header>
						<Table.Body>
							{#each detail.partidas as pt (pt.id)}
								<Table.Row>
									<Table.Cell class="text-sm">{pt.concepto}</Table.Cell>
									<Table.Cell class="text-muted-foreground text-right text-sm">{pt.cantidad} {pt.unidad}</Table.Cell>
									<Table.Cell class="text-right font-medium tabular-nums">{fmtMoney(pt.monto)}</Table.Cell>
								</Table.Row>
							{/each}
							<Table.Row class="bg-muted/50">
								<Table.Cell colspan={2} class="text-right text-xs font-semibold">Total de la OC</Table.Cell>
								<Table.Cell class="text-right font-bold tabular-nums">{fmtMoney(detail.monto)}</Table.Cell>
							</Table.Row>
						</Table.Body>
					</Table.Root>
				</div>
			</div>

			<div>
				<h4 class="mb-3 text-sm font-semibold">Bitácora</h4>
				<div class="flex flex-col gap-3">
					{#each detail.bitacora as b (b.id)}
						{@const Icon = bitacoraIcon[b.tipo]}
						<div class="flex gap-3 text-sm">
							<Icon class="mt-0.5 size-4 shrink-0 {bitacoraColor[b.tipo]}" />
							<div>
								<p class="font-medium">{b.accion}</p>
								<p class="text-muted-foreground text-xs">{b.usuario} · {b.rol} · {b.fecha}</p>
								{#if b.comentario}<p class="text-muted-foreground mt-0.5 text-xs italic">"{b.comentario}"</p>{/if}
							</div>
						</div>
					{/each}
				</div>
			</div>

			{#if detail.estado === 'Pendiente'}
				<Dialog.Footer>
					<Button variant="outline" onclick={() => openAuth(detail.id, 'rechazar')}>
						<Ban data-icon="inline-start" /> Rechazar OC
					</Button>
					<Button onclick={() => openAuth(detail.id, 'autorizar')}>
						<Check data-icon="inline-start" /> Autorizar OC
					</Button>
				</Dialog.Footer>
			{/if}
		{/if}
	</Dialog.Content>
</Dialog.Root>

<!-- ── AUTORIZAR / RECHAZAR ── -->
<Dialog.Root open={authId !== null} onOpenChange={(o) => { if (!o) authId = null; }}>
	<Dialog.Content class="sm:max-w-md">
		{#if authOrden}
			<Dialog.Header>
				<Dialog.Title>{authMode === 'autorizar' ? 'Autorizar' : 'Rechazar'} {authOrden.id}</Dialog.Title>
				<Dialog.Description>
					{#if authMode === 'autorizar'}
						Confirmas la autorización de la OC {authOrden.id} por {fmtMoney(authOrden.monto)} (Nivel {authOrden.nivel}) — {authOrden.proveedor}.
					{:else}
						Confirmas el rechazo de la OC {authOrden.id}. Regresará al solicitante para corrección.
					{/if}
				</Dialog.Description>
			</Dialog.Header>
			<div class="flex flex-col gap-2">
				<label for="auth-comment" class="text-sm font-medium">Comentario <span class="text-muted-foreground">(recomendado)</span></label>
				<Textarea id="auth-comment" bind:value={comment} rows={3} placeholder="Escribe un comentario…" />
			</div>
			<Dialog.Footer>
				<Button variant="outline" onclick={() => (authId = null)}>Cancelar</Button>
				{#if authMode === 'autorizar'}
					<Button onclick={confirmAuth}><Check data-icon="inline-start" /> Confirmar</Button>
				{:else}
					<Button variant="destructive" onclick={confirmAuth}><Ban data-icon="inline-start" /> Confirmar Rechazo</Button>
				{/if}
			</Dialog.Footer>
		{/if}
	</Dialog.Content>
</Dialog.Root>

