<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Table from '$lib/components/ui/table/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { toast } from 'svelte-sonner';
	import Warehouse from '@lucide/svelte/icons/warehouse';
	import ArrowRightLeft from '@lucide/svelte/icons/arrow-right-left';
	import AlertTriangle from '@lucide/svelte/icons/triangle-alert';
	import Search from '@lucide/svelte/icons/search';

	type StockPlanta = { planta: string; disponible: number; reservado: number; transito: number };
	type Articulo = {
		id: string; codigo: string; descripcion: string; unidad: string;
		plantas: StockPlanta[];
		alertaTransferencia?: { de: string; a: string; cantidad: number };
	};

	const plantas = ['P1', 'P2', 'P3', 'P5', 'Central'];

	const articulos: Articulo[] = [
		{ id: 'A-001', codigo: 'ACE-B6-6MM-1220', descripcion: 'Placa acero balístico 6mm', unidad: 'PZA', plantas: [
			{ planta: 'P1', disponible: 22, reservado: 10, transito: 0 },
			{ planta: 'P2', disponible: 0, reservado: 0, transito: 2 },
			{ planta: 'P3', disponible: 8, reservado: 4, transito: 0 },
			{ planta: 'P5', disponible: 0, reservado: 0, transito: 0 },
			{ planta: 'Central', disponible: 35, reservado: 5, transito: 0 }
		], alertaTransferencia: { de: 'Central', a: 'P2', cantidad: 10 } },
		{ id: 'A-002', codigo: 'CRST-B6-LAT-6L', descripcion: 'Cristal blindado lateral B6', unidad: 'PZA', plantas: [
			{ planta: 'P1', disponible: 50, reservado: 30, transito: 0 },
			{ planta: 'P2', disponible: 0, reservado: 0, transito: 0 },
			{ planta: 'P3', disponible: 0, reservado: 0, transito: 12 },
			{ planta: 'P5', disponible: 4, reservado: 0, transito: 0 },
			{ planta: 'Central', disponible: 0, reservado: 0, transito: 0 }
		], alertaTransferencia: { de: 'P1', a: 'P2', cantidad: 6 } },
		{ id: 'A-003', codigo: 'SELL-POLY-5MM', descripcion: 'Sellador poliuretano 5mm', unidad: 'MT', plantas: [
			{ planta: 'P1', disponible: 85, reservado: 40, transito: 0 },
			{ planta: 'P2', disponible: 60, reservado: 30, transito: 60 },
			{ planta: 'P3', disponible: 120, reservado: 80, transito: 0 },
			{ planta: 'P5', disponible: 0, reservado: 0, transito: 0 },
			{ planta: 'Central', disponible: 200, reservado: 0, transito: 0 }
		] },
		{ id: 'A-004', codigo: 'ARNZ-12V-4CH', descripcion: 'Arnés eléctrico 12V 4 canales', unidad: 'PZA', plantas: [
			{ planta: 'P1', disponible: 8, reservado: 6, transito: 10 },
			{ planta: 'P2', disponible: 0, reservado: 0, transito: 0 },
			{ planta: 'P3', disponible: 0, reservado: 0, transito: 0 },
			{ planta: 'P5', disponible: 6, reservado: 2, transito: 0 },
			{ planta: 'Central', disponible: 0, reservado: 0, transito: 0 }
		], alertaTransferencia: { de: 'P5', a: 'P3', cantidad: 4 } }
	];

	let busqueda = $state('');
	const filtrados = $derived(articulos.filter(a =>
		!busqueda || a.codigo.toLowerCase().includes(busqueda.toLowerCase()) || a.descripcion.toLowerCase().includes(busqueda.toLowerCase())
	));

	const conAlerta = $derived(articulos.filter(a => a.alertaTransferencia));

	function solicitarTransferencia(a: Articulo) {
		toast.info(`Transferencia solicitada`, {
			description: `${a.codigo}: ${a.alertaTransferencia!.cantidad} ${a.unidad} de ${a.alertaTransferencia!.de} → ${a.alertaTransferencia!.a}`
		});
	}
</script>

<div class="flex flex-col gap-6">
	<div class="flex flex-wrap items-center justify-between gap-3">
		<div>
			<h2 class="text-xl font-semibold">Visibilidad Multi-Planta de Inventarios</h2>
			<p class="text-muted-foreground text-sm">Existencias en tiempo real en las 5 localidades · Alertas de transferencia sugerida</p>
		</div>
		<Badge variant="outline" class="font-mono">GAP-PLN-002</Badge>
	</div>

	<!-- Alertas de transferencia -->
	{#if conAlerta.length > 0}
		<Card.Root class="border-yellow-500/50">
			<Card.Header class="pb-2">
				<Card.Title class="flex items-center gap-2 text-sm text-yellow-800">
					<AlertTriangle class="size-4 text-yellow-600" />Alertas de Transferencia Sugerida — {conAlerta.length} artículos
				</Card.Title>
				<Card.Description>Un almacén se quedó sin stock de artículos disponibles en otra planta. Se sugiere transferencia en lugar de nueva compra.</Card.Description>
			</Card.Header>
			<Card.Content class="space-y-2">
				{#each conAlerta as a (a.id)}
					<div class="flex items-center justify-between gap-3 rounded-md border border-yellow-200 bg-yellow-50/60 p-3">
						<div>
							<p class="text-sm font-medium font-mono">{a.codigo}</p>
							<p class="text-muted-foreground text-xs">{a.descripcion}</p>
							<p class="text-xs text-yellow-700 mt-0.5">
								<span class="font-medium">{a.alertaTransferencia!.a}</span> sin stock →
								Transferir <span class="font-medium">{a.alertaTransferencia!.cantidad} {a.unidad}</span> desde
								<span class="font-medium">{a.alertaTransferencia!.de}</span>
							</p>
						</div>
						<Button size="sm" variant="outline" onclick={() => solicitarTransferencia(a)}>
							<ArrowRightLeft class="mr-2 size-3" />Solicitar Transferencia
						</Button>
					</div>
				{/each}
			</Card.Content>
		</Card.Root>
	{/if}

	<!-- Búsqueda -->
	<div class="relative max-w-sm">
		<Search class="text-muted-foreground absolute left-3 top-1/2 size-4 -translate-y-1/2" />
		<Input bind:value={busqueda} placeholder="Buscar artículo..." class="pl-9" />
	</div>

	<!-- Tabla multi-planta -->
	{#each filtrados as a (a.id)}
		<Card.Root>
			<Card.Header class="pb-2">
				<div class="flex items-center justify-between">
					<div>
						<Card.Title class="font-mono text-sm">{a.codigo}</Card.Title>
						<Card.Description>{a.descripcion} · {a.unidad}</Card.Description>
					</div>
					{#if a.alertaTransferencia}
						<Badge variant="outline" class="border-yellow-400 text-yellow-700 text-xs">
							<AlertTriangle class="mr-1 size-3" />Transferencia sugerida
						</Badge>
					{/if}
				</div>
			</Card.Header>
			<Card.Content>
				<div class="grid grid-cols-5 gap-2">
					{#each a.plantas as p}
						{@const total = p.disponible + p.reservado + p.transito}
						<div class={[
							'rounded-md border p-2 text-center',
							p.disponible === 0 && total === 0 ? 'border-destructive/40 bg-destructive/5' : 'border-muted'
						].join(' ')}>
							<p class="text-xs font-semibold text-muted-foreground flex items-center justify-center gap-1">
								<Warehouse class="size-3" />{p.planta}
							</p>
							<p class="text-lg font-bold tabular-nums mt-1">{p.disponible}</p>
							<p class="text-muted-foreground text-[10px]">disponible</p>
							{#if p.reservado > 0}<p class="text-[10px] text-yellow-600">{p.reservado} res.</p>{/if}
							{#if p.transito > 0}<p class="text-[10px] text-blue-500">{p.transito} tráns.</p>{/if}
						</div>
					{/each}
				</div>
			</Card.Content>
		</Card.Root>
	{/each}
</div>
