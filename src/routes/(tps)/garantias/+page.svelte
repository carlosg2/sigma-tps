<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Table from '$lib/components/ui/table/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import * as Tabs from '$lib/components/ui/tabs/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import TrendingDown from '@lucide/svelte/icons/trending-down';
	import TrendingUp from '@lucide/svelte/icons/trending-up';
	import ShieldAlert from '@lucide/svelte/icons/shield-alert';
	import Wrench from '@lucide/svelte/icons/wrench';
	import DollarSign from '@lucide/svelte/icons/dollar-sign';
	import FileSpreadsheet from '@lucide/svelte/icons/file-spreadsheet';
	import CheckCircle from '@lucide/svelte/icons/check-circle';
	import XCircle from '@lucide/svelte/icons/circle-x';
	import AlertCircle from '@lucide/svelte/icons/circle-alert';

	let periodoSel = $state('2025-06');
	let drillGap: string | null = $state(null);

	const periodos = ['2025-01', '2025-02', '2025-03', '2025-04', '2025-05', '2025-06'];

	type PeriodoData = {
		frecuencia: number;
		fallasTem: number;
		costoRef: number;
		costoMO: number;
		costoViat: number;
		casos: Caso[];
	};

	type Caso = {
		id: string;
		vin: string;
		modelo: string;
		nivel: string;
		tipo: string;
		antiguedad: string;
		estado: 'abierto' | 'cerrado' | 'escalado';
		costoTotal: number;
		fecApertura: string;
		esFallaTem: boolean;
	};

	const data: Record<string, PeriodoData> = {
		'2025-01': {
			frecuencia: 24,
			fallasTem: 1,
			costoRef: 48200,
			costoMO: 12600,
			costoViat: 4800,
			casos: [
				{ id: 'G-001', vin: 'VIN001A', modelo: 'Ram 1500', nivel: 'B4', tipo: 'Sellado blindaje', antiguedad: '8 meses', estado: 'cerrado', costoTotal: 18400, fecApertura: '2025-01-08', esFallaTem: false },
				{ id: 'G-002', vin: 'VIN002B', modelo: 'Tahoe', nivel: 'B6+', tipo: 'Falla temprana cristal', antiguedad: '2 meses', estado: 'cerrado', costoTotal: 22600, fecApertura: '2025-01-15', esFallaTem: true },
				{ id: 'G-003', vin: 'VIN003C', modelo: 'Suburban', nivel: 'B6', tipo: 'Vibración puerta', antiguedad: '14 meses', estado: 'cerrado', costoTotal: 9800, fecApertura: '2025-01-22', esFallaTem: false }
			]
		},
		'2025-02': { frecuencia: 22, fallasTem: 0, costoRef: 38500, costoMO: 9800, costoViat: 2400, casos: [
			{ id: 'G-004', vin: 'VIN004D', modelo: 'Land Cruiser', nivel: 'B6+', tipo: 'Sellado puertas', antiguedad: '6 meses', estado: 'cerrado', costoTotal: 31200, fecApertura: '2025-02-05', esFallaTem: false },
			{ id: 'G-005', vin: 'VIN005E', modelo: 'Expedition', nivel: 'B4', tipo: 'Remate cristal', antiguedad: '11 meses', estado: 'cerrado', costoTotal: 9500, fecApertura: '2025-02-18', esFallaTem: false }
		] },
		'2025-03': { frecuencia: 31, fallasTem: 3, costoRef: 72400, costoMO: 18200, costoViat: 8600, casos: [
			{ id: 'G-006', vin: 'VIN006F', modelo: 'Tahoe', nivel: 'B6', tipo: 'Falla temprana motor', antiguedad: '1 mes', estado: 'cerrado', costoTotal: 29800, fecApertura: '2025-03-02', esFallaTem: true },
			{ id: 'G-007', vin: 'VIN007G', modelo: 'Ram 2500', nivel: 'B4', tipo: 'Falla blindaje lateral', antiguedad: '2 meses', estado: 'cerrado', costoTotal: 24600, fecApertura: '2025-03-11', esFallaTem: true },
			{ id: 'G-008', vin: 'VIN008H', modelo: 'Suburban', nivel: 'B6+', tipo: 'Falla placa techo', antiguedad: '3 meses', estado: 'cerrado', costoTotal: 45200, fecApertura: '2025-03-22', esFallaTem: true }
		] },
		'2025-04': { frecuencia: 26, fallasTem: 1, costoRef: 52100, costoMO: 14400, costoViat: 5600, casos: [
			{ id: 'G-009', vin: 'VIN009I', modelo: 'Navigator', nivel: 'B6', tipo: 'Vibración puerta trasera', antiguedad: '9 meses', estado: 'cerrado', costoTotal: 22100, fecApertura: '2025-04-07', esFallaTem: false },
			{ id: 'G-010', vin: 'VIN010J', modelo: 'Land Cruiser', nivel: 'B6+', tipo: 'Falla temprana sellado', antiguedad: '2 meses', estado: 'cerrado', costoTotal: 28400, fecApertura: '2025-04-19', esFallaTem: true },
			{ id: 'G-011', vin: 'VIN011K', modelo: 'Suburban', nivel: 'B4', tipo: 'Desgaste anormal', antiguedad: '18 meses', estado: 'cerrado', costoTotal: 21600, fecApertura: '2025-04-27', esFallaTem: false }
		] },
		'2025-05': { frecuencia: 19, fallasTem: 0, costoRef: 28600, costoMO: 7200, costoViat: 1800, casos: [
			{ id: 'G-012', vin: 'VIN012L', modelo: 'Tahoe', nivel: 'B6', tipo: 'Ajuste cristal', antiguedad: '15 meses', estado: 'cerrado', costoTotal: 18200, fecApertura: '2025-05-14', esFallaTem: false },
			{ id: 'G-013', vin: 'VIN013M', modelo: 'Expedition', nivel: 'B4', tipo: 'Remate lateral', antiguedad: '22 meses', estado: 'cerrado', costoTotal: 19400, fecApertura: '2025-05-28', esFallaTem: false }
		] },
		'2025-06': { frecuencia: 28, fallasTem: 2, costoRef: 61800, costoMO: 16400, costoViat: 6200, casos: [
			{ id: 'G-014', vin: 'VIN014N', modelo: 'Ram 1500', nivel: 'B4', tipo: 'Falla temprana marco puerta', antiguedad: '3 meses', estado: 'abierto', costoTotal: 32400, fecApertura: '2025-06-03', esFallaTem: true },
			{ id: 'G-015', vin: 'VIN015O', modelo: 'Suburban', nivel: 'B6+', tipo: 'Sellado techo solar', antiguedad: '7 meses', estado: 'escalado', costoTotal: 18600, fecApertura: '2025-06-11', esFallaTem: false },
			{ id: 'G-016', vin: 'VIN016P', modelo: 'Tahoe', nivel: 'B6', tipo: 'Vibración puerta delantera', antiguedad: '10 meses', estado: 'abierto', costoTotal: 22800, fecApertura: '2025-06-18', esFallaTem: false },
			{ id: 'G-017', vin: 'VIN017Q', modelo: 'Land Cruiser', nivel: 'B6+', tipo: 'Falla temprana placa lateral', antiguedad: '2 meses', estado: 'escalado', costoTotal: 45600, fecApertura: '2025-06-24', esFallaTem: true }
		] }
	};

	const META_FRECUENCIA = 27;
	const META_FALLAS_TEM = 2;

	const periodo = $derived(data[periodoSel]);
	const costoTotal = $derived(periodo.costoRef + periodo.costoMO + periodo.costoViat);

	function semaforo(value: number, meta: number, invertido = false) {
		if (invertido) return value <= meta ? 'text-emerald-500' : value <= meta * 1.2 ? 'text-yellow-500' : 'text-destructive';
		return value <= meta ? 'text-emerald-500' : value <= meta * 1.2 ? 'text-yellow-500' : 'text-destructive';
	}

	function estadoBadge(e: Caso['estado']) {
		return e === 'cerrado' ? 'secondary' : e === 'escalado' ? 'destructive' : 'outline';
	}

	const tendencia = $derived(
		periodos.map((p) => ({ p, f: data[p].frecuencia, ft: data[p].fallasTem }))
	);

	const maxFrecuencia = Math.max(...Object.values(data).map((d) => d.frecuencia));
	const drillCasos = $derived(drillGap ? periodo.casos.filter((c) => c.esFallaTem === (drillGap === 'ft')) : periodo.casos);
</script>

<div class="flex flex-col gap-6">
	<!-- Header -->
	<div class="flex flex-wrap items-center justify-between gap-3">
		<div>
			<h2 class="text-xl font-semibold">Scorecard de Garantías</h2>
			<p class="text-muted-foreground text-sm">Indicadores mensuales con tendencia histórica y semáforo de cumplimiento</p>
		</div>
		<div class="flex items-center gap-2">
			<Badge variant="outline" class="font-mono">GAP-GAR-003</Badge>
			<Select.Root type="single" bind:value={periodoSel}>
				<Select.Trigger class="w-36">
					{periodoSel}
				</Select.Trigger>
				<Select.Content>
					{#each periodos as p}
						<Select.Item value={p}>{p}</Select.Item>
					{/each}
				</Select.Content>
			</Select.Root>
			<Button variant="outline" size="sm">
				<FileSpreadsheet class="mr-2 size-4" /> Exportar
			</Button>
		</div>
	</div>

	<!-- KPI Cards -->
	<div class="grid gap-4 sm:grid-cols-3">
		<!-- Frecuencia de Garantías -->
		<Card.Root class="cursor-pointer transition-shadow hover:shadow-md" onclick={() => (drillGap = drillGap === 'freq' ? null : 'freq')}>
			<Card.Header class="pb-2">
				<Card.Description class="flex items-center gap-1">
					<ShieldAlert class="size-4" /> Frecuencia de Garantías
				</Card.Description>
				<Card.Title class="text-3xl tabular-nums {semaforo(periodo.frecuencia, META_FRECUENCIA)}">
					{periodo.frecuencia}%
				</Card.Title>
			</Card.Header>
			<Card.Content>
				<p class="text-muted-foreground text-xs">Meta ≤ {META_FRECUENCIA}%</p>
				<div class="mt-2 flex items-center gap-1 text-xs">
					{#if periodo.frecuencia <= META_FRECUENCIA}
						<CheckCircle class="size-3 text-emerald-500" /><span class="text-emerald-600">Dentro de meta</span>
					{:else}
						<XCircle class="size-3 text-destructive" /><span class="text-destructive">Fuera de meta</span>
					{/if}
				</div>
			</Card.Content>
		</Card.Root>

		<!-- Fallas Tempranas -->
		<Card.Root class="cursor-pointer transition-shadow hover:shadow-md" onclick={() => (drillGap = drillGap === 'ft' ? null : 'ft')}>
			<Card.Header class="pb-2">
				<Card.Description class="flex items-center gap-1">
					<AlertCircle class="size-4" /> Fallas Tempranas
				</Card.Description>
				<Card.Title class="text-3xl tabular-nums {semaforo(periodo.fallasTem, META_FALLAS_TEM)}">
					{periodo.fallasTem}
				</Card.Title>
			</Card.Header>
			<Card.Content>
				<p class="text-muted-foreground text-xs">Meta ≤ {META_FALLAS_TEM} por periodo</p>
				<div class="mt-2 flex items-center gap-1 text-xs">
					{#if periodo.fallasTem <= META_FALLAS_TEM}
						<CheckCircle class="size-3 text-emerald-500" /><span class="text-emerald-600">Dentro de meta</span>
					{:else}
						<XCircle class="size-3 text-destructive" /><span class="text-destructive">Fuera de meta</span>
					{/if}
				</div>
			</Card.Content>
		</Card.Root>

		<!-- Costo Acumulado -->
		<Card.Root>
			<Card.Header class="pb-2">
				<Card.Description class="flex items-center gap-1">
					<DollarSign class="size-4" /> Costo Acumulado
				</Card.Description>
				<Card.Title class="text-3xl tabular-nums">
					${(costoTotal / 1000).toFixed(1)}k
				</Card.Title>
			</Card.Header>
			<Card.Content>
				<div class="text-muted-foreground space-y-1 text-xs">
					<div class="flex justify-between"><span>Refacciones</span><span class="tabular-nums">${periodo.costoRef.toLocaleString()}</span></div>
					<div class="flex justify-between"><span>Mano de Obra</span><span class="tabular-nums">${periodo.costoMO.toLocaleString()}</span></div>
					<div class="flex justify-between"><span>Viáticos</span><span class="tabular-nums">${periodo.costoViat.toLocaleString()}</span></div>
				</div>
			</Card.Content>
		</Card.Root>
	</div>

	<!-- Tendencia histórica (visual bars) -->
	<Card.Root>
		<Card.Header>
			<Card.Title class="text-sm font-medium">Tendencia histórica — Frecuencia de Garantías</Card.Title>
		</Card.Header>
		<Card.Content>
			<div class="flex items-end gap-3">
				{#each tendencia as t}
					<div class="flex flex-1 flex-col items-center gap-1">
						<span class="text-muted-foreground text-xs tabular-nums">{t.f}%</span>
						<div
							class="w-full rounded-sm transition-all"
							class:bg-emerald-500={t.f <= META_FRECUENCIA}
							class:bg-yellow-400={t.f > META_FRECUENCIA && t.f <= META_FRECUENCIA * 1.15}
							class:bg-destructive={t.f > META_FRECUENCIA * 1.15}
							style="height: {Math.round((t.f / maxFrecuencia) * 120)}px"
						></div>
						<span class="text-muted-foreground text-xs">{t.p.slice(5)}</span>
						{#if t.ft > 0}
							<Badge variant="destructive" class="h-4 px-1 text-[10px]">{t.ft} FT</Badge>
						{/if}
					</div>
				{/each}
			</div>
			<div class="text-muted-foreground mt-2 flex gap-4 text-xs">
				<span class="flex items-center gap-1"><span class="inline-block size-3 rounded-sm bg-emerald-500"></span>Dentro de meta</span>
				<span class="flex items-center gap-1"><span class="inline-block size-3 rounded-sm bg-yellow-400"></span>Alerta</span>
				<span class="flex items-center gap-1"><span class="inline-block size-3 bg-destructive rounded-sm"></span>Fuera de meta</span>
				<span class="flex items-center gap-1"><Badge variant="destructive" class="h-4 px-1 text-[10px]">FT</Badge>Fallas tempranas</span>
			</div>
		</Card.Content>
	</Card.Root>

	<!-- Drill-down / Detalle de casos -->
	<Card.Root>
		<Card.Header>
			<div class="flex items-center justify-between">
				<Card.Title class="text-sm font-medium">
					{#if drillGap === 'ft'}
						Detalle — Fallas Tempranas
					{:else if drillGap === 'freq'}
						Detalle — Todos los casos del periodo
					{:else}
						Órdenes de Garantía · {periodoSel}
					{/if}
				</Card.Title>
				{#if drillGap}
					<Button variant="ghost" size="sm" onclick={() => (drillGap = null)}>Ver todos</Button>
				{/if}
			</div>
		</Card.Header>
		<Card.Content>
			<Table.Root>
				<Table.Header>
					<Table.Row>
						<Table.Head>ID</Table.Head>
						<Table.Head>VIN</Table.Head>
						<Table.Head>Modelo</Table.Head>
						<Table.Head>Nivel</Table.Head>
						<Table.Head>Tipo de Falla</Table.Head>
						<Table.Head>Antigüedad</Table.Head>
						<Table.Head class="text-right">Costo Total</Table.Head>
						<Table.Head>Apertura</Table.Head>
						<Table.Head>Estado</Table.Head>
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{#each drillCasos as c (c.id)}
						<Table.Row>
							<Table.Cell class="font-mono text-xs">{c.id}</Table.Cell>
							<Table.Cell class="font-mono text-xs">{c.vin}</Table.Cell>
							<Table.Cell>{c.modelo}</Table.Cell>
							<Table.Cell><Badge variant="outline">{c.nivel}</Badge></Table.Cell>
							<Table.Cell>
								{c.tipo}
								{#if c.esFallaTem}<Badge variant="destructive" class="ml-1 text-[10px]">FT</Badge>{/if}
							</Table.Cell>
							<Table.Cell class="text-muted-foreground text-sm">{c.antiguedad}</Table.Cell>
							<Table.Cell class="text-right tabular-nums font-medium">${c.costoTotal.toLocaleString()}</Table.Cell>
							<Table.Cell class="text-muted-foreground text-xs">{c.fecApertura}</Table.Cell>
							<Table.Cell>
								<Badge variant={estadoBadge(c.estado)} class="capitalize">{c.estado}</Badge>
							</Table.Cell>
						</Table.Row>
					{/each}
				</Table.Body>
			</Table.Root>
		</Card.Content>
	</Card.Root>
</div>
