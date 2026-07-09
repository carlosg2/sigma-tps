<script lang="ts">
	import { cn } from '$lib/utils.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import { Textarea } from '$lib/components/ui/textarea/index.js';
	import { Progress } from '$lib/components/ui/progress/index.js';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import { toast } from 'svelte-sonner';
	import Check from '@lucide/svelte/icons/check';
	import X from '@lucide/svelte/icons/circle-x';
	import AlertTriangle from '@lucide/svelte/icons/triangle-alert';
	import Shield from '@lucide/svelte/icons/shield';
	import Zap from '@lucide/svelte/icons/zap';
	import Tablet from '@lucide/svelte/icons/tablet';
	import ArrowRight from '@lucide/svelte/icons/arrow-right';

	// 5 etapas operativas
	type Etapa = 'Desarmado' | 'Blindaje' | 'Pintura' | 'Armado' | 'Detallado';
	type Severidad = 'critico' | 'mayor' | 'menor';
	type ItemState = 'ok' | 'nc' | 'na' | null;
	type Item = { id: string; label: string; state: ItemState; critico: boolean; nota: string; severidad?: Severidad };

	const etapas: Etapa[] = ['Desarmado', 'Blindaje', 'Pintura', 'Armado', 'Detallado'];

	const checklistPorEtapa: Record<Etapa, string[]> = {
		Desarmado: ['Inventario completo de piezas', 'Registro fotográfico inicial', 'VIN confirmado', 'Arneses etiquetados', 'Piezas sin daños preexistentes'],
		Blindaje: ['Torque de pernos puerta L (especificación)', 'Torque de pernos puerta D (especificación)', 'Sellado perimetral puertas', 'Conexiones eléctricas puerta izq.', 'Conexiones eléctricas puerta der.', 'Certificado resistencia placa (espesor)', 'Placa cofre fijada', 'Placa piso fijada', 'Placa techo fijada', 'Blindaje sin espacios'],
		Pintura: ['Preparación superficie OK', 'Masilla sin irregularidades', 'Imprimación aplicada', 'Capa base igualada', 'Barniz sin defectos', 'Sin burbujas ni piel de naranja'],
		Armado: ['Cristales instalados sin holgura', 'Manijas exteriores alineadas', 'Cielos instalados', 'Tapicería sin arrugas', 'Molduras fijadas', 'Sistema eléctrico probado', 'Alarma configurada', 'GPS activo', 'Cinturones revisados'],
		Detallado: ['Limpieza interior completa', 'Limpieza exterior completa', 'Cristales sin rayaduras', 'Documentos en guantera', 'Revisión final de 360°']
	};

	const criticos: Record<string, boolean> = {
		'Torque de pernos puerta L (especificación)': true,
		'Torque de pernos puerta D (especificación)': true,
		'Sellado perimetral puertas': true,
		'Certificado resistencia placa (espesor)': true,
		'Conexiones eléctricas puerta izq.': true,
		'Conexiones eléctricas puerta der.': true
	};

	let etapaActiva = $state<Etapa>('Desarmado');
	let vin = $state('VIN-P1-00142');
	let folio = $state('OP-2025-0891');
	let liberado = $state<Record<Etapa, boolean>>({ Desarmado: false, Blindaje: false, Pintura: false, Armado: false, Detallado: false });

	let items = $state<Record<Etapa, Item[]>>(
		Object.fromEntries(etapas.map(e => [e, checklistPorEtapa[e].map((l, i) => ({
			id: `${e}-${i}`, label: l, state: null as ItemState, critico: !!criticos[l], nota: ''
		}))])) as Record<Etapa, Item[]>
	);

	const currentItems = $derived(items[etapaActiva]);
	const done = $derived(currentItems.filter(i => i.state !== null).length);
	const ncs = $derived(currentItems.filter(i => i.state === 'nc').length);
	const ncCriticas = $derived(currentItems.filter(i => i.state === 'nc' && i.critico).length);
	const pct = $derived(currentItems.length ? Math.round((done / currentItems.length) * 100) : 0);
	const puedeLiberarEtapa = $derived(pct === 100 && ncCriticas === 0);

	function liberarEtapa() {
		liberado = { ...liberado, [etapaActiva]: true };
		const idx = etapas.indexOf(etapaActiva);
		toast.success(`Etapa "${etapaActiva}" liberada por Calidad`, {
			description: ncs > 0 ? `${ncs} no conformidades menores registradas` : 'Sin no conformidades'
		});
		if (idx < etapas.length - 1) {
			etapaActiva = etapas[idx + 1];
		}
	}
</script>

<div class="flex flex-col gap-6">
	<div class="flex flex-wrap items-center justify-between gap-3">
		<div>
			<h2 class="text-xl font-semibold">Inspección de Calidad — Producción</h2>
			<p class="text-muted-foreground text-sm">Checklist por etapa operativa · Puntos críticos obligatorios · Autorización de avance</p>
		</div>
		<div class="flex items-center gap-2">
			<Badge variant="outline" class="font-mono">GAP-CAL-004</Badge>
			<Badge variant="outline" class="font-mono">{folio}</Badge>
			<Badge variant="secondary" class="font-mono">{vin}</Badge>
		</div>
	</div>

	<!-- Etapas -->
	<div class="flex gap-2 overflow-x-auto pb-1">
		{#each etapas as e}
			{@const done = items[e].filter(i => i.state !== null).length}
			{@const total = items[e].length}
			{@const lib = liberado[e]}
			<button onclick={() => (etapaActiva = e)} class={cn(
				'flex min-w-[120px] flex-col items-center rounded-lg border p-3 text-center transition-all',
				etapaActiva === e ? 'border-primary bg-primary/5' : 'border-muted hover:border-muted-foreground/40',
				lib && 'border-emerald-500/60 bg-emerald-50/40'
			)}>
				<span class="text-xs font-medium">{e}</span>
				<span class="text-muted-foreground mt-1 text-xs tabular-nums">{done}/{total}</span>
				{#if lib}<span class="mt-1 text-[10px] text-emerald-600 font-medium">✓ Liberado</span>{/if}
			</button>
		{/each}
	</div>

	<!-- Puntos críticos -->
	{#if currentItems.some(i => i.critico)}
		<Card.Root class="border-yellow-500/50 bg-yellow-50/30">
			<Card.Header class="pb-2">
				<Card.Title class="flex items-center gap-2 text-sm text-yellow-800">
					<Shield class="size-4 text-yellow-600" />Puntos Críticos · {etapaActiva}
				</Card.Title>
			</Card.Header>
			<Card.Content>
				<div class="grid gap-2 sm:grid-cols-2">
					{#each currentItems.filter(i => i.critico) as item (item.id)}
						<div class={cn('flex items-center justify-between gap-2 rounded-md border p-2', item.state === 'nc' ? 'border-destructive bg-destructive/5' : item.state === 'ok' ? 'border-emerald-500/60' : 'border-yellow-400/60')}>
							<span class="text-xs font-medium">{item.label}</span>
							<div class="flex gap-1">
								<Button size="icon" class="size-7" variant={item.state === 'ok' ? 'default' : 'outline'} onclick={() => (item.state = 'ok')}><Check class="size-3" /></Button>
								<Button size="icon" class="size-7" variant={item.state === 'nc' ? 'destructive' : 'outline'} onclick={() => (item.state = 'nc')}><X class="size-3" /></Button>
							</div>
						</div>
					{/each}
				</div>
				{#if ncCriticas > 0}
					<p class="text-destructive mt-2 text-xs font-medium flex items-center gap-1"><AlertTriangle class="size-3" />{ncCriticas} no conformidad(es) crítica(s) — la etapa no puede liberarse hasta resolverlas.</p>
				{/if}
			</Card.Content>
		</Card.Root>
	{/if}

	<!-- Checklist general -->
	<Card.Root>
		<Card.Header>
			<div class="flex items-center justify-between">
				<Card.Title class="text-sm">Checklist — {etapaActiva}</Card.Title>
				<div class="flex items-center gap-2">
					<span class="tabular-nums text-sm">{done}/{currentItems.length}</span>
					{#if ncs > 0}<Badge variant="destructive">{ncs} NC</Badge>{/if}
					<div class="w-24"><Progress value={pct} /></div>
				</div>
			</div>
		</Card.Header>
		<Card.Content class="space-y-2">
			{#each currentItems.filter(i => !i.critico) as item (item.id)}
				<div class={cn('rounded-md border p-2', item.state === 'nc' && 'border-destructive/50 bg-destructive/5')}>
					<div class="flex items-center justify-between gap-2">
						<span class="text-sm">{item.label}</span>
						<div class="flex gap-1">
							<Button size="icon" class="size-7" variant={item.state === 'ok' ? 'default' : 'outline'} onclick={() => (item.state = 'ok')}><Check class="size-3" /></Button>
							<Button size="icon" class="size-7" variant={item.state === 'nc' ? 'destructive' : 'outline'} onclick={() => (item.state = 'nc')}><X class="size-3" /></Button>
							<Button size="sm" class="h-7 px-2 text-xs" variant={item.state === 'na' ? 'secondary' : 'outline'} onclick={() => (item.state = 'na')}>N/A</Button>
						</div>
					</div>
					{#if item.state === 'nc'}
						<Textarea bind:value={item.nota} placeholder="Describir no conformidad y acción correctiva…" class="mt-2 min-h-12 text-xs" />
					{/if}
				</div>
			{/each}
		</Card.Content>
	</Card.Root>

	<!-- Liberar etapa -->
	<Card.Root class={cn(liberado[etapaActiva] && 'border-emerald-500/50')}>
		<Card.Content class="pt-4">
			{#if !liberado[etapaActiva]}
				<Button class="w-full" disabled={!puedeLiberarEtapa} onclick={liberarEtapa}>
					<Zap class="mr-2 size-4" />Liberar Etapa "{etapaActiva}" — Autorizar Avance
				</Button>
				{#if !puedeLiberarEtapa && pct < 100}
					<p class="text-muted-foreground mt-2 text-center text-xs">Completa todos los puntos del checklist para liberar.</p>
				{:else if !puedeLiberarEtapa && ncCriticas > 0}
					<p class="text-destructive mt-2 text-center text-xs">Resuelve las no conformidades críticas antes de liberar.</p>
				{/if}
			{:else}
				<div class="flex items-center justify-center gap-2 py-2">
					<Check class="size-5 text-emerald-500" />
					<span class="text-emerald-600 font-medium">Etapa "{etapaActiva}" liberada por Calidad</span>
				</div>
			{/if}
		</Card.Content>
	</Card.Root>
</div>
