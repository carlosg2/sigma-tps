<script lang="ts">
	import { cn } from '$lib/utils.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import { Textarea } from '$lib/components/ui/textarea/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { Progress } from '$lib/components/ui/progress/index.js';
	import Check from '@lucide/svelte/icons/check';
	import X from '@lucide/svelte/icons/x';
	import Camera from '@lucide/svelte/icons/camera';
	import Tablet from '@lucide/svelte/icons/tablet';
	import PenLine from '@lucide/svelte/icons/pen-line';

	type State = 'ok' | 'falla' | 'na' | null;
	type Item = { id: string; label: string; state: State; photo: boolean; note: string };

	let vehicleType = $state<'sedan' | 'suv' | 'pickup'>('suv');
	let vin = $state('');
	let signed = $state(false);

	const baseChecklist: Record<string, string[]> = {
		sedan: ['Carroceria sin danos', 'Cristales completos', 'Documentos del vehiculo', 'Llave y duplicado', 'Nivel de combustible'],
		suv: ['Carroceria sin danos', 'Cristales completos', 'Documentos del vehiculo', 'Llave y duplicado', 'Nivel de combustible', 'Tercera fila', 'Estribos'],
		pickup: ['Carroceria sin danos', 'Cristales completos', 'Documentos del vehiculo', 'Caja de carga', 'Tapa batea', 'Nivel de combustible']
	};

	function buildChecklist(t: string): Item[] {
		return baseChecklist[t].map((l, i) => ({ id: `i${i}`, label: l, state: null, photo: false, note: '' }));
	}
	let items = $state<Item[]>(buildChecklist('suv'));
	function setVehicle(t: 'sedan' | 'suv' | 'pickup') {
		vehicleType = t;
		items = buildChecklist(t);
	}

	let designations = $state('');

	const done = $derived(items.filter((i) => i.state !== null).length);
	const progress = $derived(items.length ? Math.round((done / items.length) * 100) : 0);
	const fallas = $derived(items.filter((i) => i.state === 'falla').length);
	const canSign = $derived(progress === 100 && vin.length >= 5);
</script>

<div class="mx-auto max-w-2xl space-y-4">
	<div class="flex items-center gap-2"><Tablet class="size-5" /><p class="text-muted-foreground text-sm">Recepcion e inspeccion de vehiculos · optimizado para tablet</p></div>

	<Card.Root>
		<Card.Content class="space-y-4 pt-6">
			<div class="grid gap-3 sm:grid-cols-2">
				<div><Label>VIN / Folio</Label><Input bind:value={vin} placeholder="Capturar o escanear" /></div>
				<div>
					<Label>Tipo de vehiculo</Label>
					<div class="flex gap-2">
						{#each ['sedan', 'suv', 'pickup'] as t}
							<Button class="flex-1 capitalize" size="sm" variant={vehicleType === t ? 'default' : 'outline'} onclick={() => setVehicle(t as typeof vehicleType)}>{t}</Button>
						{/each}
					</div>
				</div>
			</div>
			<div class="flex items-center gap-3"><Progress value={progress} max={100} /><span class="text-sm tabular-nums">{done}/{items.length}</span>{#if fallas > 0}<Badge variant="destructive">{fallas} fallas</Badge>{/if}</div>
		</Card.Content>
	</Card.Root>

	{#each items as item (item.id)}
		<Card.Root>
			<Card.Content class="space-y-3 pt-4">
				<div class="flex items-center justify-between gap-2">
					<span class="font-medium">{item.label}</span>
					<div class="flex gap-1">
						<Button size="icon" variant={item.state === 'ok' ? 'default' : 'outline'} onclick={() => (item.state = 'ok')}><Check class="size-4" /></Button>
						<Button size="icon" variant={item.state === 'falla' ? 'destructive' : 'outline'} onclick={() => (item.state = 'falla')}><X class="size-4" /></Button>
						<Button size="sm" variant={item.state === 'na' ? 'secondary' : 'outline'} onclick={() => (item.state = 'na')}>N/A</Button>
					</div>
				</div>
				{#if item.state === 'falla'}
					<Button size="sm" variant={item.photo ? 'secondary' : 'outline'} class="w-full" onclick={() => (item.photo = !item.photo)}><Camera data-icon="inline-start" /> {item.photo ? 'Foto adjunta' : 'Adjuntar foto'}</Button>
					<Textarea bind:value={item.note} placeholder="Describir hallazgo..." class="min-h-16" />
				{/if}
			</Card.Content>
		</Card.Root>
	{/each}

	<Card.Root>
		<Card.Header><Card.Title>Designaciones (prototipo)</Card.Title><Card.Description>Borrador de especificaciones capturado en sitio</Card.Description></Card.Header>
		<Card.Content><Textarea bind:value={designations} placeholder="Niveles, materiales, accesorios sugeridos..." class="min-h-24" /></Card.Content>
	</Card.Root>

	<Card.Root class={cn(signed && 'border-emerald-500/50')}>
		<Card.Content class="pt-6">
			<Button class="w-full" disabled={!canSign} variant={signed ? 'secondary' : 'default'} onclick={() => (signed = true)}>
				<PenLine data-icon="inline-start" /> {signed ? 'Recepcion firmada y sincronizada' : 'Firmar recepcion'}
			</Button>
			{#if !canSign}<p class="text-muted-foreground mt-2 text-center text-xs">Completa el checklist y captura el VIN para firmar.</p>{/if}
		</Card.Content>
	</Card.Root>
</div>
