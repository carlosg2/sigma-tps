<script lang="ts">
	import { useInventariosStore } from '$lib/tps/inventarios/store.svelte.js';
	import { NOTIF_TIPO_ACCENT, NOTIF_ESTADO_COLORS, NOTIF_TIPO_LABEL } from '$lib/tps/inventarios/constants.js';
	import type { Notificacion, NotifTipo } from '$lib/tps/inventarios/types.js';
	import StatusBadge from '$lib/tps/components/status-badge.svelte';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import * as Empty from '$lib/components/ui/empty/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import { toast } from 'svelte-sonner';
	import Zap from '@lucide/svelte/icons/zap';
	import Bolt from '@lucide/svelte/icons/bolt';
	import Eye from '@lucide/svelte/icons/eye';
	import Plus from '@lucide/svelte/icons/plus';
	import User from '@lucide/svelte/icons/user';
	import Clock from '@lucide/svelte/icons/clock';
	import BellOff from '@lucide/svelte/icons/bell-off';

	const store = useInventariosStore();
	const data = $derived(store.state);

	let folioFilter = $state<string>('todos');
	let tipoFilter = $state<string>('todos');

	const folioOptions = $derived([...new Set(data.notificaciones.map((n) => n.folio))]);

	const filtered = $derived.by(() => {
		let items = data.notificaciones;
		if (folioFilter !== 'todos') items = items.filter((n) => n.folio === folioFilter);
		if (tipoFilter !== 'todos') items = items.filter((n) => n.tipo === tipoFilter);
		return items;
	});

	const folioLabel = $derived(folioFilter === 'todos' ? 'Todos los folios' : folioFilter);
	const tipoLabel = $derived(tipoFilter === 'todos' ? 'Todos los tipos' : NOTIF_TIPO_LABEL[tipoFilter as NotifTipo]);

	// Detalle dialog
	let detailOpen = $state(false);
	let detail = $state<Notificacion | null>(null);

	function verDetalle(n: Notificacion) {
		detail = n;
		detailOpen = true;
	}

	function surtir(n: Notificacion) {
		if (n.estado === 'Surtido') {
			toast.info('Ya surtido', { description: 'Este material ya fue surtido.' });
			return;
		}
		store.surtirNotificacion(n.id);
		detailOpen = false;
		toast.success('Surtido completado', { description: `Aditiva de ${n.folio} entregada en línea. Registro guardado.` });
	}

	const nuevos = [
		{ folio: 'F-2026-042', unidad: 'RAM 1500 TRX', desc: 'Refuerzo techo balístico adicional — acero AR-500 4mm', autoriza: 'Ing. Mora' },
		{ folio: 'F-2026-038', unidad: 'Lexus LX 600', desc: 'Arnés adicional sistema de comunicaciones blindado', autoriza: 'Ing. Castro' },
		{ folio: 'F-2026-041', unidad: 'Suburban LTZ', desc: 'Vidrio lateral adicional reforzado — NIJ IV', autoriza: 'Ing. Ramírez' }
	];
	let nuevoIdx = 0;

	function simularNueva() {
		const n = nuevos[nuevoIdx % nuevos.length];
		nuevoIdx++;
		store.agregarNotificacion(n);
		toast.error('Nueva aditiva recibida', { description: `${n.folio} · ${n.unidad} — Requiere surtido urgente.` });
	}
</script>

<div class="flex flex-col gap-6">
	<div class="flex flex-wrap items-center justify-between gap-3">
		<div>
			<h2 class="flex items-center gap-2 text-xl font-semibold">
				<Zap class="text-primary size-5" /> Linekeeper Digital
			</h2>
			<p class="text-muted-foreground text-sm">Notificaciones automáticas de aditivas y cambios autorizados por producción</p>
		</div>
		<Badge variant="outline" class="font-mono">GAP-ALM-003</Badge>
	</div>

	<div class="flex flex-wrap items-center gap-2">
		<Select.Root type="single" bind:value={folioFilter}>
			<Select.Trigger size="sm" class="w-48">{folioLabel}</Select.Trigger>
			<Select.Content>
				<Select.Group>
					<Select.Item value="todos">Todos los folios</Select.Item>
					{#each folioOptions as f (f)}
						<Select.Item value={f}>{f}</Select.Item>
					{/each}
				</Select.Group>
			</Select.Content>
		</Select.Root>
		<Select.Root type="single" bind:value={tipoFilter}>
			<Select.Trigger size="sm" class="w-40">{tipoLabel}</Select.Trigger>
			<Select.Content>
				<Select.Group>
					<Select.Item value="todos">Todos los tipos</Select.Item>
					<Select.Item value="urgente">Urgente</Select.Item>
					<Select.Item value="aditiva">Aditiva</Select.Item>
					<Select.Item value="normal">Cambio</Select.Item>
				</Select.Group>
			</Select.Content>
		</Select.Root>
		<Button variant="outline" size="sm" onclick={simularNueva}>
			<Plus data-icon="inline-start" /> Simular nueva aditiva
		</Button>
	</div>

	{#if filtered.length}
		<div class="flex flex-col gap-3">
			{#each filtered as n (n.id)}
				<Card.Root class="border-l-4 {NOTIF_TIPO_ACCENT[n.tipo]}">
					<Card.Header>
						<Card.Title class="text-base">{NOTIF_TIPO_LABEL[n.tipo]} — {n.folio} · {n.unidad}</Card.Title>
						<Card.Description>{n.desc}</Card.Description>
						<Card.Action>
							<StatusBadge label={n.estado} colorClass={NOTIF_ESTADO_COLORS[n.estado]} />
						</Card.Action>
					</Card.Header>
					<Card.Content>
						<div class="text-muted-foreground flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
							<span class="flex items-center gap-1"><User class="size-3.5" /> Autoriza: <strong class="text-foreground">{n.autoriza}</strong></span>
							<span class="flex items-center gap-1"><Clock class="size-3.5" /> {n.hora} · {n.minuta}</span>
						</div>
					</Card.Content>
					<Card.Footer class="gap-2">
						<Button size="sm" disabled={n.estado === 'Surtido'} onclick={() => surtir(n)}>
							<Bolt data-icon="inline-start" /> {n.estado === 'Surtido' ? 'Surtido' : 'Surtir Ahora'}
						</Button>
						<Button variant="outline" size="sm" onclick={() => verDetalle(n)}>
							<Eye data-icon="inline-start" /> Ver Detalle
						</Button>
					</Card.Footer>
				</Card.Root>
			{/each}
		</div>
	{:else}
		<Empty.Root class="border">
			<Empty.Header>
				<Empty.Media variant="icon">
					<BellOff />
				</Empty.Media>
				<Empty.Title>Sin notificaciones</Empty.Title>
				<Empty.Description>No hay aditivas que coincidan con los filtros seleccionados.</Empty.Description>
			</Empty.Header>
		</Empty.Root>
	{/if}
</div>

<Dialog.Root bind:open={detailOpen}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Detalle de Aditiva / Cambio</Dialog.Title>
			<Dialog.Description>Información completa de la solicitud autorizada.</Dialog.Description>
		</Dialog.Header>
		{#if detail}
			<div class="flex flex-col gap-3 text-sm">
				<div class="flex flex-col gap-1">
					<span class="text-muted-foreground text-xs uppercase">Folio / Unidad</span>
					<span><strong>{detail.folio}</strong> · {detail.unidad} · VIN {detail.vin}</span>
				</div>
				<Separator />
				<div class="flex flex-col gap-1">
					<span class="text-muted-foreground text-xs uppercase">Tipo de cambio</span>
					<span>{detail.titulo}</span>
				</div>
				<div class="flex flex-col gap-1">
					<span class="text-muted-foreground text-xs uppercase">Descripción del cambio</span>
					<span>{detail.desc}</span>
				</div>
				<div class="flex flex-col gap-1">
					<span class="text-muted-foreground text-xs uppercase">Materiales requeridos</span>
					<span>{detail.mats}</span>
				</div>
				<div class="flex flex-col gap-1">
					<span class="text-muted-foreground text-xs uppercase">Autorización</span>
					<span>{detail.autoriza} · {detail.hora} hrs · {detail.minuta}</span>
				</div>
			</div>
		{/if}
		<Dialog.Footer>
			<Button variant="outline" onclick={() => (detailOpen = false)}>Cerrar</Button>
			{#if detail}
				<Button disabled={detail.estado === 'Surtido'} onclick={() => detail && surtir(detail)}>
					<Bolt data-icon="inline-start" /> Surtir Ahora
				</Button>
			{/if}
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
