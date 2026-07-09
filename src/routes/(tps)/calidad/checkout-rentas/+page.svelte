<script lang="ts">
	import { cn } from '$lib/utils.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Table from '$lib/components/ui/table/index.js';
	import * as Tabs from '$lib/components/ui/tabs/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import { Progress } from '$lib/components/ui/progress/index.js';
	import { Textarea } from '$lib/components/ui/textarea/index.js';
	import { toast } from 'svelte-sonner';
	import Check from '@lucide/svelte/icons/check';
	import X from '@lucide/svelte/icons/circle-x';
	import Camera from '@lucide/svelte/icons/camera';
	import Car from '@lucide/svelte/icons/car';
	import ShieldCheck from '@lucide/svelte/icons/shield-check';
	import ArrowRight from '@lucide/svelte/icons/arrow-right';
	import Wrench from '@lucide/svelte/icons/wrench';

	type Mode = 'checkout' | 'checkin';
	type ItemState = 'ok' | 'falla' | 'na' | null;
	type Item = { id: string; label: string; checkout: ItemState; checkin: ItemState; photo: boolean; nota: string };

	const checklistItems = [
		'Limpieza interior VIP completa', 'Limpieza exterior sin manchas', 'Pantallas infotainment funcionando',
		'Sistema de clima OK', 'Accesorios completos (kit emergencia)', 'GPS activo y rastreando',
		'Cinturones ×5 revisados', 'Cristales sin rayaduras', 'Llantas en buen estado',
		'Documentos vigentes (seguro, circulación, norma blindaje)', 'Copia norma de blindaje visible',
		'Nivel combustible (≥ 75%)', 'Batería cargada OK', 'Firma del contrato de renta registrada'
	];

	let modo = $state<Mode>('checkout');
	let vin = $state('VIN-RNT-024');
	let cliente = $state('Empresa Logística del Norte SA');
	let folioRenta = $state('RNT-2025-0148');
	let firmado = $state(false);
	let osCreada = $state(false);

	let items = $state<Item[]>(checklistItems.map((l, i) => ({
		id: `i${i}`, label: l, checkout: null as ItemState, checkin: null as ItemState, photo: false, nota: ''
	})));

	const itemsMode = $derived(modo === 'checkout'
		? items.map(i => ({ ...i, state: i.checkout }))
		: items.map(i => ({ ...i, state: i.checkin }))
	);

	const done = $derived(itemsMode.filter(i => i.state !== null).length);
	const fallas = $derived(itemsMode.filter(i => i.state === 'falla').length);
	const pct = $derived(items.length ? Math.round((done / items.length) * 100) : 0);
	const canFinish = $derived(pct === 100);

	function setState(id: string, st: ItemState) {
		items = items.map(it => it.id === id
			? modo === 'checkout' ? { ...it, checkout: st } : { ...it, checkin: st }
			: it
		);
	}

	function completar() {
		if (modo === 'checkout') {
			firmado = true;
			toast.success('Check-out completado', { description: `VIN ${vin} · ${folioRenta} · Unidad liberada para entrega` });
		} else {
			if (fallas > 0) {
				osCreada = true;
				toast.warning('Check-in con hallazgos', { description: `${fallas} falla(s) detectadas · OS correctiva generada automáticamente` });
			} else {
				toast.success('Check-in completado', { description: `VIN ${vin} regresado sin fallas · Unidad disponible` });
			}
		}
	}
</script>

<div class="flex flex-col gap-6">
	<div class="flex flex-wrap items-center justify-between gap-3">
		<div>
			<h2 class="text-xl font-semibold">Check-out / Check-in Rentas</h2>
			<p class="text-muted-foreground text-sm">Control de calidad en salida y retorno de unidades de la flota · Optimizado para tablet</p>
		</div>
		<Badge variant="outline" class="font-mono">GAP-CAL-005</Badge>
	</div>

	<!-- Info unidad -->
	<Card.Root>
		<Card.Content class="grid gap-3 pt-4 sm:grid-cols-3">
			<div><Label>VIN</Label><Input bind:value={vin} placeholder="VIN de la unidad" /></div>
			<div><Label>Folio Renta</Label><Input bind:value={folioRenta} /></div>
			<div><Label>Cliente</Label><Input bind:value={cliente} /></div>
		</Card.Content>
	</Card.Root>

	<!-- Switch modo -->
	<div class="flex rounded-lg border overflow-hidden">
		<button onclick={() => (modo = 'checkout')} class={cn('flex-1 py-2 text-sm font-medium transition-colors', modo === 'checkout' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted')}>
			<Car class="mr-2 inline-block size-4" />Check-out (Salida)
		</button>
		<button onclick={() => (modo = 'checkin')} class={cn('flex-1 py-2 text-sm font-medium transition-colors', modo === 'checkin' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted')}>
			<ShieldCheck class="mr-2 inline-block size-4" />Check-in (Retorno)
		</button>
	</div>

	<!-- Bloqueos documentales (checkout) -->
	{#if modo === 'checkout'}
		<Card.Root class="border-yellow-500/30">
			<Card.Header class="pb-2"><Card.Title class="text-sm">Validación Documental Obligatoria</Card.Title></Card.Header>
			<Card.Content class="space-y-2">
				{#each ['Seguro vigente (vence 2025-12-31)', 'Tarjeta de circulación vigente', 'Copia norma de blindaje adjunta'] as doc, i}
					<div class="flex items-center gap-2 text-sm">
						<Check class="size-4 text-emerald-500" />
						<span>{doc}</span>
						<Badge variant="secondary" class="ml-auto text-xs">Validado</Badge>
					</div>
				{/each}
			</Card.Content>
		</Card.Root>
	{/if}

	<!-- Checklist -->
	<Card.Root>
		<Card.Header>
			<div class="flex items-center justify-between">
				<Card.Title class="text-sm">{modo === 'checkout' ? 'Checklist de Preparación VIP' : 'Revisión de Retorno'}</Card.Title>
				<div class="flex items-center gap-2">
					<span class="tabular-nums text-sm">{done}/{items.length}</span>
					{#if fallas > 0}<Badge variant="destructive">{fallas} fallas</Badge>{/if}
					<div class="w-24"><Progress value={pct} /></div>
				</div>
			</div>
		</Card.Header>
		<Card.Content class="space-y-2">
			{#each itemsMode as item, idx}
				{@const real = items[idx]}
				<div class={cn('rounded-md border p-2', item.state === 'falla' && 'border-destructive/50 bg-destructive/5')}>
					<div class="flex items-center justify-between gap-2">
						<span class="text-sm">{item.label}</span>
						<div class="flex gap-1">
							<Button size="icon" class="size-7" variant={item.state === 'ok' ? 'default' : 'outline'} onclick={() => setState(item.id, 'ok')}><Check class="size-3" /></Button>
							<Button size="icon" class="size-7" variant={item.state === 'falla' ? 'destructive' : 'outline'} onclick={() => setState(item.id, 'falla')}><X class="size-3" /></Button>
							<Button size="sm" class="h-7 px-2 text-xs" variant={item.state === 'na' ? 'secondary' : 'outline'} onclick={() => setState(item.id, 'na')}>N/A</Button>
						</div>
					</div>
					{#if item.state === 'falla'}
						<div class="mt-2 space-y-1">
							<Button size="sm" variant={real.photo ? 'secondary' : 'outline'} class="w-full" onclick={() => (real.photo = !real.photo)}>
								<Camera class="mr-2 size-3" />{real.photo ? 'Foto adjunta' : 'Adjuntar foto comparativa'}
							</Button>
							<Textarea bind:value={real.nota} placeholder="Describir discrepancia vs. estado de salida…" class="min-h-12 text-xs" />
						</div>
					{/if}
				</div>
			{/each}
		</Card.Content>
	</Card.Root>

	<!-- Acción final -->
	<Card.Root class={cn((firmado || osCreada) && 'border-emerald-500/50')}>
		<Card.Content class="pt-4">
			{#if !firmado && !osCreada}
				<Button class="w-full" disabled={!canFinish} onclick={completar}>
					{#if modo === 'checkout'}
						<ArrowRight class="mr-2 size-4" />Firmar Check-out y Liberar Unidad
					{:else}
						<ShieldCheck class="mr-2 size-4" />Confirmar Retorno
					{/if}
				</Button>
			{:else if osCreada}
				<div class="rounded-md bg-yellow-50 p-3 text-center">
					<Wrench class="mx-auto mb-1 size-6 text-yellow-600" />
					<p class="font-semibold text-yellow-800">Check-in con hallazgos</p>
					<p class="text-sm text-yellow-700">OS Correctiva OS-2025-0901 generada · Unidad etiquetada en Rojo</p>
				</div>
			{:else}
				<div class="flex items-center justify-center gap-2 py-1">
					<Check class="size-5 text-emerald-500" />
					<span class="font-medium text-emerald-600">Check-out completado · Unidad {vin} liberada</span>
				</div>
			{/if}
		</Card.Content>
	</Card.Root>
</div>
