<script lang="ts">
	import { cn } from '$lib/utils.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import { Textarea } from '$lib/components/ui/textarea/index.js';
	import { Progress } from '$lib/components/ui/progress/index.js';
	import { toast } from 'svelte-sonner';
	import Check from '@lucide/svelte/icons/check';
	import X from '@lucide/svelte/icons/circle-x';
	import Camera from '@lucide/svelte/icons/camera';
	import Tablet from '@lucide/svelte/icons/tablet';
	import PenLine from '@lucide/svelte/icons/pen-line';
	import Car from '@lucide/svelte/icons/car';

	type ItemState = 'ok' | 'falla' | 'na' | null;
	type Item = { id: string; label: string; state: ItemState; photo: boolean; note: string };

	// 170 puntos de inspección agrupados por sección
	const secciones: { nombre: string; items: string[] }[] = [
		{ nombre: 'Carrocería Exterior', items: ['Cofre sin golpes', 'Facias sin daños', 'Puertas delanteras L/D', 'Puertas traseras L/D', 'Cajuela / compuerta', 'Toldo', 'Molduras y emblemas', 'Espejos retrovisores', 'Manijas exteriores', 'Cristales sin astilladuras'] },
		{ nombre: 'Blindaje', items: ['Placas laterales visibles', 'Sellado de puertas completo', 'Blindaje en jambas', 'Cristales blindados (espesor visual)', 'Piso blindado sin deformación', 'Revestimiento techo', 'Batería blindada accesible', 'Porta placas correcto'] },
		{ nombre: 'Interior', items: ['Tapicería sin daños', 'Alfombras y pisos', 'Cinturones de seguridad ×5', 'Botones eléctricos puertas', 'Consola central', 'Volante y columna', 'Tablero instrumentos', 'Sistema infotainment', 'Clima delantero / trasero', 'Asientos calefaccionados'] },
		{ nombre: 'Mecánico / Fluidos', items: ['Nivel aceite motor', 'Nivel líquido frenos', 'Nivel refrigerante', 'Nivel dirección hidráulica', 'Batería carga OK', 'Correas y mangueras', 'Fugas visibles motor', 'Escape sin daños'] },
		{ nombre: 'Llantas y Frenos', items: ['Llanta delantera izq.', 'Llanta delantera der.', 'Llanta trasera izq.', 'Llanta trasera der.', 'Refacción / run-flat', 'Presión de llantas', 'Pastillas de freno', 'Discos sin ralladuras'] },
		{ nombre: 'Eléctrico / Electrónico', items: ['Luces delanteras', 'Luces traseras', 'Cuartos / laterales', 'Sirenas instaladas', 'Cámaras de seguridad', 'GPS activo', 'Interfono blindaje', 'Alarma perimetral'] },
		{ nombre: 'Documentos y Accesorios', items: ['Tarjeta circulación vigente', 'Verificación al corriente', 'Seguro vigente', 'Norma de blindaje', 'Llaves × 2', 'Control alarma', 'Manual del propietario', 'Extintor de polvo'] }
	];

	let vin = $state('');
	let km = $state('');
	let cliente = $state('');
	let signed = $state(false);
	let osCreada = $state(false);

	// Flatten items
	let allItems = $state<Item[]>(
		secciones.flatMap(s => s.items.map((l, i) => ({ id: `${s.nombre}-${i}`, label: l, state: null as ItemState, photo: false, note: '' })))
	);

	const total = $derived(allItems.length);
	const done = $derived(allItems.filter(i => i.state !== null).length);
	const fallas = $derived(allItems.filter(i => i.state === 'falla').length);
	const progress = $derived(total ? Math.round((done / total) * 100) : 0);
	const canSign = $derived(progress === 100 && vin.length >= 5 && km.length > 0);

	function crearOS() {
		osCreada = true;
		toast.success('Orden de Servicio creada', {
			description: `OS-2025-0892 · VIN ${vin} · ${fallas} hallazgos registrados · KM ${parseInt(km).toLocaleString()}`
		});
	}

	let seccionVisible = $state(0);
	const seccionItems = $derived(
		secciones.map(s => ({
			...s,
			its: allItems.filter(it => it.id.startsWith(s.nombre))
		}))
	);
</script>

<div class="mx-auto max-w-2xl space-y-4">
	<div class="flex items-center gap-2">
		<Tablet class="size-5" />
		<p class="text-muted-foreground text-sm">Recepción y apertura de Orden de Servicio · optimizado para tablet</p>
		<Badge variant="outline" class="ml-auto font-mono">GAP-TLL-002</Badge>
	</div>

	<!-- Datos del vehículo -->
	<Card.Root>
		<Card.Header><Card.Title class="text-base">Datos del Vehículo</Card.Title></Card.Header>
		<Card.Content class="grid gap-3 sm:grid-cols-3">
			<div><Label>VIN / Placa</Label><Input bind:value={vin} placeholder="Capturar o escanear" /></div>
			<div><Label>Kilometraje actual</Label><Input bind:value={km} placeholder="Ej. 42500" type="number" /></div>
			<div><Label>Cliente</Label><Input bind:value={cliente} placeholder="Nombre o razón social" /></div>
		</Card.Content>
	</Card.Root>

	<!-- Progreso -->
	<Card.Root>
		<Card.Content class="pt-4">
			<div class="flex items-center gap-3">
				<Progress value={progress} class="flex-1" />
				<span class="tabular-nums text-sm">{done}/{total}</span>
				{#if fallas > 0}<Badge variant="destructive">{fallas} {fallas === 1 ? 'hallazgo' : 'hallazgos'}</Badge>{/if}
			</div>
		</Card.Content>
	</Card.Root>

	<!-- Checklist por sección -->
	{#each seccionItems as sec, si}
		<Card.Root>
			<button
				class="w-full text-left"
				onclick={() => (seccionVisible = seccionVisible === si ? -1 : si)}
			>
				<Card.Header>
					<div class="flex items-center justify-between">
						<Card.Title class="text-sm">{sec.nombre}</Card.Title>
						<div class="flex items-center gap-2">
						<span class="text-muted-foreground text-xs">{sec.its.filter(i => i.state !== null).length}/{sec.its.length}</span>
						{#if sec.its.filter(i => i.state === 'falla').length > 0}<Badge variant="destructive" class="text-[10px]">{sec.its.filter(i => i.state === 'falla').length}</Badge>{/if}
						</div>
					</div>
				</Card.Header>
			</button>
			{#if seccionVisible === si}
				<Card.Content class="space-y-2">
					{#each sec.its as item (item.id)}
						<div class="rounded-md border p-2">
							<div class="flex items-center justify-between gap-2">
								<span class="text-sm">{item.label}</span>
								<div class="flex gap-1">
									<Button size="icon" class="size-7" variant={item.state === 'ok' ? 'default' : 'outline'} onclick={() => (item.state = 'ok')}><Check class="size-3" /></Button>
									<Button size="icon" class="size-7" variant={item.state === 'falla' ? 'destructive' : 'outline'} onclick={() => (item.state = 'falla')}><X class="size-3" /></Button>
									<Button size="sm" class="h-7 px-2 text-xs" variant={item.state === 'na' ? 'secondary' : 'outline'} onclick={() => (item.state = 'na')}>N/A</Button>
								</div>
							</div>
							{#if item.state === 'falla'}
								<div class="mt-2 space-y-1">
									<Button size="sm" variant={item.photo ? 'secondary' : 'outline'} class="w-full" onclick={() => (item.photo = !item.photo)}>
										<Camera class="mr-2 size-3" />{item.photo ? 'Foto adjunta' : 'Adjuntar foto'}
									</Button>
									<Textarea bind:value={item.note} placeholder="Describir hallazgo…" class="min-h-12 text-xs" />
								</div>
							{/if}
						</div>
					{/each}
				</Card.Content>
			{/if}
		</Card.Root>
	{/each}

	<!-- Firma y generación de OS -->
	<Card.Root class={cn(osCreada && 'border-emerald-500/50')}>
		<Card.Header><Card.Title class="text-base">Generar Orden de Servicio</Card.Title></Card.Header>
		<Card.Content class="space-y-3">
			{#if !osCreada}
				<Button class="w-full" disabled={!canSign} onclick={crearOS}>
					<PenLine class="mr-2 size-4" />Firmar recepción y generar OS
				</Button>
				{#if !canSign}<p class="text-muted-foreground text-center text-xs">Completa el checklist, captura VIN y KM para generar la OS.</p>{/if}
			{:else}
				<div class="rounded-md bg-emerald-50 p-4 text-center">
					<Check class="mx-auto mb-2 size-8 text-emerald-500" />
					<p class="font-semibold text-emerald-700">OS-2025-0892 creada exitosamente</p>
					<p class="text-sm text-emerald-600">{fallas} hallazgos · VIN {vin} · KM {parseInt(km || '0').toLocaleString()}</p>
				</div>
			{/if}
		</Card.Content>
	</Card.Root>
</div>
