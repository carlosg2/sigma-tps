<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Table from '$lib/components/ui/table/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Progress } from '$lib/components/ui/progress/index.js';
	import { Slider } from '$lib/components/ui/slider/index.js';
	import { toast } from 'svelte-sonner';
	import Users from '@lucide/svelte/icons/users';
	import AlertTriangle from '@lucide/svelte/icons/triangle-alert';
	import BarChart from '@lucide/svelte/icons/bar-chart-2';
	import RefreshCw from '@lucide/svelte/icons/refresh-cw';

	// Factor fatiga: 6.3 hrs efectivas de 7.5 teóricas por día (84%)
	const FACTOR_FATIGA = 0.84;
	const HRS_TEORICAS = 7.5;
	const HRS_EFECTIVAS = HRS_TEORICAS * FACTOR_FATIGA; // 6.3

	type CentroTrabajo = {
		id: string; nombre: string; area: string;
		headcount: number; hrsRequeridas: number;
		semanas: string[];
	};

	let semanaSel = $state('2025-S26');
	const semanas = ['2025-S24', '2025-S25', '2025-S26', '2025-S27', '2025-S28'];
	const DIAS_SEMANA = 5;

	const centros: CentroTrabajo[] = [
		{ id: 'CT-01', nombre: 'Desarmado y Preparación', area: 'Producción', headcount: 8, hrsRequeridas: 312, semanas: semanas },
		{ id: 'CT-02', nombre: 'Blindaje — Estructura', area: 'Producción', headcount: 14, hrsRequeridas: 648, semanas: semanas },
		{ id: 'CT-03', nombre: 'Corte Balístico CNC', area: 'Manufactura', headcount: 4, hrsRequeridas: 178, semanas: semanas },
		{ id: 'CT-04', nombre: 'Soldadura Especializada', area: 'Manufactura', headcount: 6, hrsRequeridas: 284, semanas: semanas },
		{ id: 'CT-05', nombre: 'Pintura y Acabados', area: 'Producción', headcount: 10, hrsRequeridas: 352, semanas: semanas },
		{ id: 'CT-06', nombre: 'Armado e Instalación', area: 'Producción', headcount: 16, hrsRequeridas: 720, semanas: semanas },
		{ id: 'CT-07', nombre: 'Tapicería Interior', area: 'Producción', headcount: 6, hrsRequeridas: 198, semanas: semanas },
		{ id: 'CT-08', nombre: 'Detallado y QA Final', area: 'Calidad', headcount: 5, hrsRequeridas: 142, semanas: semanas }
	];

	function hrsDisponibles(hc: number) {
		return Math.round(hc * HRS_EFECTIVAS * DIAS_SEMANA);
	}

	function carga(hrsReq: number, hrsDis: number) {
		return Math.min(Math.round((hrsReq / hrsDis) * 100), 120);
	}

	function cargaVariant(pct: number) {
		if (pct >= 100) return 'destructive' as const;
		if (pct >= 85) return 'outline' as const;
		return 'secondary' as const;
	}

	function cargaColor(pct: number) {
		if (pct >= 100) return 'bg-destructive';
		if (pct >= 85) return 'bg-yellow-400';
		return 'bg-emerald-500';
	}

	const cuellos = $derived(centros.filter(c => carga(c.hrsRequeridas, hrsDisponibles(c.headcount)) >= 85));

	function simular() {
		toast.info('Simulación de escenario', { description: 'Modifica el headcount de un centro para ver el impacto en capacidad.' });
	}
</script>

<div class="flex flex-col gap-6">
	<div class="flex flex-wrap items-center justify-between gap-3">
		<div>
			<h2 class="text-xl font-semibold">Cargas de Trabajo y Capacidad Instalada</h2>
			<p class="text-muted-foreground text-sm">Carga planificada vs. capacidad real por centro de trabajo · Factor fatiga 84% ({HRS_EFECTIVAS} hrs/día)</p>
		</div>
		<div class="flex items-center gap-2">
			<Badge variant="outline" class="font-mono">GAP-PLN-003</Badge>
			<Select.Root type="single" bind:value={semanaSel}>
				<Select.Trigger class="w-28">{semanaSel}</Select.Trigger>
				<Select.Content>{#each semanas as s}<Select.Item value={s}>{s}</Select.Item>{/each}</Select.Content>
			</Select.Root>
		</div>
	</div>

	<!-- Cuellos de botella -->
	{#if cuellos.length > 0}
		<Card.Root class="border-destructive/40">
			<Card.Header class="pb-2">
				<Card.Title class="flex items-center gap-2 text-sm text-destructive">
					<AlertTriangle class="size-4" />{cuellos.length} Cuello(s) de Botella Detectado(s)
				</Card.Title>
				<Card.Description>Centros con carga superior al 85% de capacidad</Card.Description>
			</Card.Header>
			<Card.Content class="flex flex-wrap gap-2">
				{#each cuellos as c}
					{@const pct = carga(c.hrsRequeridas, hrsDisponibles(c.headcount))}
					<Badge variant="destructive">{c.nombre} — {pct}%</Badge>
				{/each}
			</Card.Content>
		</Card.Root>
	{/if}

	<!-- Gráfico de barras de capacidad -->
	<Card.Root>
		<Card.Header><Card.Title class="text-sm">Capacidad vs. Carga por Centro · {semanaSel}</Card.Title></Card.Header>
		<Card.Content class="space-y-4">
			{#each centros as c}
				{@const hrsDis = hrsDisponibles(c.headcount)}
				{@const pct = carga(c.hrsRequeridas, hrsDis)}
				<div class="space-y-1">
					<div class="flex items-center justify-between text-sm">
						<div class="flex items-center gap-2">
							<span class="font-medium">{c.nombre}</span>
							<Badge variant="outline" class="text-xs">{c.area}</Badge>
							<span class="text-muted-foreground text-xs flex items-center gap-1"><Users class="size-3" />{c.headcount}</span>
						</div>
						<div class="flex items-center gap-3">
							<span class="text-muted-foreground text-xs tabular-nums">{c.hrsRequeridas} / {hrsDis} hrs</span>
							<Badge variant={cargaVariant(pct)} class="w-16 justify-center tabular-nums">{pct}%</Badge>
						</div>
					</div>
					<div class="relative h-3 w-full rounded-full bg-muted overflow-hidden">
						<div class="h-full rounded-full transition-all {cargaColor(pct)}" style="width:{Math.min(pct, 100)}%"></div>
						{#if pct > 100}
							<div class="absolute right-0 top-0 h-full w-1 bg-destructive/80 animate-pulse"></div>
						{/if}
					</div>
					<!-- Línea de 85% -->
					<div class="relative h-0">
						<div class="absolute top-0 border-l border-dashed border-yellow-400/70 h-4 -mt-4" style="left:85%"></div>
					</div>
				</div>
			{/each}
			<div class="text-muted-foreground flex gap-4 text-xs pt-2 border-t">
				<span class="flex items-center gap-1"><span class="inline-block size-3 rounded-sm bg-emerald-500"></span>&lt;85% normal</span>
				<span class="flex items-center gap-1"><span class="inline-block size-3 rounded-sm bg-yellow-400"></span>85-99% alerta</span>
				<span class="flex items-center gap-1"><span class="inline-block size-3 rounded-sm bg-destructive"></span>≥100% sobrecargado</span>
				<span class="flex items-center gap-1 text-yellow-600">| 85% umbral cuello de botella</span>
			</div>
		</Card.Content>
	</Card.Root>

	<!-- Tabla detalle -->
	<Card.Root>
		<Card.Header><Card.Title class="text-sm">Detalle por Centro de Trabajo</Card.Title></Card.Header>
		<Card.Content>
			<Table.Root>
				<Table.Header>
					<Table.Row>
						<Table.Head>Centro de Trabajo</Table.Head>
						<Table.Head>Área</Table.Head>
						<Table.Head class="text-right">Headcount</Table.Head>
						<Table.Head class="text-right">Hrs Disponibles</Table.Head>
						<Table.Head class="text-right">Hrs Requeridas</Table.Head>
						<Table.Head class="text-right">% Carga</Table.Head>
						<Table.Head>Estado</Table.Head>
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{#each centros as c}
						{@const hrsDis = hrsDisponibles(c.headcount)}
						{@const pct = carga(c.hrsRequeridas, hrsDis)}
						<Table.Row>
							<Table.Cell class="font-medium text-sm">{c.nombre}</Table.Cell>
							<Table.Cell class="text-muted-foreground text-sm">{c.area}</Table.Cell>
							<Table.Cell class="text-right tabular-nums">{c.headcount}</Table.Cell>
							<Table.Cell class="text-right tabular-nums">{hrsDis} hrs</Table.Cell>
							<Table.Cell class="text-right tabular-nums">{c.hrsRequeridas} hrs</Table.Cell>
							<Table.Cell class="text-right tabular-nums font-semibold {pct >= 100 ? 'text-destructive' : pct >= 85 ? 'text-yellow-600' : 'text-emerald-600'}">{pct}%</Table.Cell>
							<Table.Cell>
								<Badge variant={cargaVariant(pct)} class="text-xs">
									{pct >= 100 ? 'Sobrecargado' : pct >= 85 ? 'Alerta' : 'Normal'}
								</Badge>
							</Table.Cell>
						</Table.Row>
					{/each}
				</Table.Body>
			</Table.Root>
		</Card.Content>
	</Card.Root>
</div>
