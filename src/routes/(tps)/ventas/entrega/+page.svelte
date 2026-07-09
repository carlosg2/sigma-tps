<script lang="ts">
	import { cn } from '$lib/utils.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import { toast } from 'svelte-sonner';
	import Camera from '@lucide/svelte/icons/camera';
	import PenLine from '@lucide/svelte/icons/pen-line';
	import MapPin from '@lucide/svelte/icons/map-pin';
	import Check from '@lucide/svelte/icons/check';
	import Smartphone from '@lucide/svelte/icons/smartphone';
	import FileCheck from '@lucide/svelte/icons/file-check';

	let vin = $state('VIN-PT-001');
	let folio = $state('COT-2025-0241');
	let cliente = $state('Constructora del Norte SA');
	let chofer = $state('E. Ramírez (Traslados)');
	let firmaCapturada = $state(false);
	let fotosCapturadas = $state(0);
	let gpsSimulado = $state('Monterrey, N.L. — 25.6714°N, 100.3094°W');
	let completado = $state(false);
	let offline = $state(false);

	function capturarFoto() {
		fotosCapturadas += 1;
		toast.info(`Foto ${fotosCapturadas} capturada`, { description: 'Evidencia del estado de la unidad al momento de la entrega' });
	}

	function capturarFirma() {
		firmaCapturada = true;
		toast.success('Firma digital capturada');
	}

	function confirmarEntrega() {
		completado = true;
		const hora = new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
		toast.success('Entrega confirmada', {
			description: `VIN ${vin} · Estado actualizado a "Unidad Entregada" en ERP · ${offline ? 'Sincronización pendiente (sin señal)' : 'Sincronizado'}`
		});
	}

	const canConfirmar = $derived(firmaCapturada && fotosCapturadas >= 2);
</script>

<div class="mx-auto max-w-xl space-y-4">
	<div class="flex items-center gap-2">
		<Smartphone class="size-5" />
		<p class="text-muted-foreground text-sm">Confirmación de Entrega Digital · Chofer / Traslados</p>
		<Badge variant="outline" class="ml-auto font-mono">GAP-VTA-003</Badge>
	</div>

	<!-- Datos de la entrega -->
	<Card.Root>
		<Card.Header><Card.Title class="text-base">Datos de la Entrega</Card.Title></Card.Header>
		<Card.Content class="grid gap-3 sm:grid-cols-2">
			<div><Label>VIN</Label><Input bind:value={vin} /></div>
			<div><Label>Cotización / Pedido</Label><Input bind:value={folio} /></div>
			<div><Label>Cliente receptor</Label><Input bind:value={cliente} /></div>
			<div><Label>Chofer</Label><Input bind:value={chofer} /></div>
		</Card.Content>
	</Card.Root>

	<!-- Ubicación GPS -->
	<Card.Root>
		<Card.Content class="flex items-center gap-3 pt-4">
			<MapPin class="size-5 text-primary" />
			<div>
				<p class="text-sm font-medium">Ubicación GPS</p>
				<p class="text-muted-foreground text-xs">{gpsSimulado}</p>
			</div>
			<Badge variant="secondary" class="ml-auto text-xs">{offline ? 'Sin señal' : 'En línea'}</Badge>
		</Card.Content>
	</Card.Root>

	<!-- Modo offline toggle (demo) -->
	<button class="text-muted-foreground text-xs underline" onclick={() => (offline = !offline)}>
		{offline ? 'Simular conexión' : 'Simular sin señal (modo offline)'}
	</button>

	<!-- Registro fotográfico -->
	<Card.Root>
		<Card.Header>
			<Card.Title class="text-base flex items-center justify-between">
				Registro Fotográfico
				<Badge variant={fotosCapturadas >= 2 ? 'secondary' : 'outline'}>{fotosCapturadas}/2 mínimo</Badge>
			</Card.Title>
			<Card.Description>Evidencia del estado de la unidad en el momento de la entrega</Card.Description>
		</Card.Header>
		<Card.Content class="space-y-2">
			{#each ['Frente de la unidad', 'Costado izquierdo', 'Costado derecho', 'Interior'] as angulo, i}
				{@const capturada = i < fotosCapturadas}
				<div class={cn('flex items-center justify-between rounded-md border p-2', capturada && 'border-emerald-500/50 bg-emerald-50/30')}>
					<span class="text-sm">{angulo}</span>
					{#if capturada}
						<div class="flex items-center gap-1 text-emerald-600 text-xs">
							<Check class="size-3" />Capturada
						</div>
					{:else}
						<Button size="sm" variant="outline" onclick={capturarFoto}>
							<Camera class="mr-1 size-3" />Tomar foto
						</Button>
					{/if}
				</div>
			{/each}
		</Card.Content>
	</Card.Root>

	<!-- Firma digital -->
	<Card.Root class={cn(firmaCapturada && 'border-emerald-500/50')}>
		<Card.Header><Card.Title class="text-base">Firma Digital del Cliente</Card.Title></Card.Header>
		<Card.Content>
			{#if !firmaCapturada}
				<div class="flex h-24 items-center justify-center rounded-md border-2 border-dashed border-muted">
					<p class="text-muted-foreground text-sm">El cliente firma aquí con el dedo</p>
				</div>
				<Button class="mt-3 w-full" variant="outline" onclick={capturarFirma}>
					<PenLine class="mr-2 size-4" />Capturar firma
				</Button>
			{:else}
				<div class="flex items-center gap-2 py-2">
					<Check class="size-5 text-emerald-500" />
					<span class="text-emerald-600 font-medium">Firma capturada</span>
					<span class="text-muted-foreground text-xs ml-auto">{new Date().toLocaleTimeString('es-MX')}</span>
				</div>
			{/if}
		</Card.Content>
	</Card.Root>

	<!-- Confirmar -->
	<Card.Root class={cn(completado && 'border-emerald-500/50')}>
		<Card.Content class="pt-4">
			{#if !completado}
				<Button class="w-full h-14 text-base" disabled={!canConfirmar} onclick={confirmarEntrega}>
					<FileCheck class="mr-2 size-5" />Confirmar Entrega y Actualizar ERP
					{#if offline}<span class="text-xs ml-2">(se sincronizará al recuperar señal)</span>{/if}
				</Button>
				{#if !canConfirmar}
					<p class="text-muted-foreground mt-2 text-center text-xs">
						{#if fotosCapturadas < 2}Toma al menos 2 fotos · {/if}{#if !firmaCapturada}Captura la firma del cliente{/if}
					</p>
				{/if}
			{:else}
				<div class="rounded-md bg-emerald-50 p-4 text-center space-y-1">
					<Check class="mx-auto size-8 text-emerald-500" />
					<p class="font-semibold text-emerald-700">Entrega confirmada — {folio}</p>
					<p class="text-sm text-emerald-600">VIN {vin} · Estado: Unidad Entregada · {new Date().toLocaleString('es-MX')}</p>
					{#if offline}<p class="text-xs text-yellow-700">Sincronización ERP pendiente — sin señal</p>{/if}
				</div>
			{/if}
		</Card.Content>
	</Card.Root>
</div>
