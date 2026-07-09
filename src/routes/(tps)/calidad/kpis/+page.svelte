<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import * as Table from '$lib/components/ui/table/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import CheckCircle from '@lucide/svelte/icons/check-circle';
	import XCircle from '@lucide/svelte/icons/circle-x';
	import Clock from '@lucide/svelte/icons/clock';
	import FileSpreadsheet from '@lucide/svelte/icons/file-spreadsheet';
	import TrendingUp from '@lucide/svelte/icons/trending-up';

	let periodo = $state('2025-06');
	const periodos = ['2025-04', '2025-05', '2025-06'];

	type KpiData = {
		unidadPerfecta: number; metaUP: number;
		tiempoPromCheckout: number; metaTiempo: number;
		eficienciaLiberacion: number; metaEfic: number;
		detalle: { vin: string; modelo: string; cliente: string; checkout: string; fallas: number; tiempoMin: number; liberadoDia: boolean }[];
	};

	const kpiData: Record<string, KpiData> = {
		'2025-04': { unidadPerfecta: 91.2, metaUP: 95, tiempoPromCheckout: 22, metaTiempo: 30, eficienciaLiberacion: 87.5, metaEfic: 90, detalle: [
			{ vin: 'VIN-RNT-012', modelo: 'Suburban 2024', cliente: 'Seguridad Noreste', checkout: '2025-04-03', fallas: 0, tiempoMin: 18, liberadoDia: true },
			{ vin: 'VIN-RNT-015', modelo: 'Tahoe 2023', cliente: 'Grupo Minero', checkout: '2025-04-11', fallas: 2, tiempoMin: 35, liberadoDia: false },
			{ vin: 'VIN-RNT-018', modelo: 'Land Cruiser 2024', cliente: 'Constructora GR', checkout: '2025-04-20', fallas: 0, tiempoMin: 21, liberadoDia: true }
		]},
		'2025-05': { unidadPerfecta: 94.8, metaUP: 95, tiempoPromCheckout: 19, metaTiempo: 30, eficienciaLiberacion: 93.3, metaEfic: 90, detalle: [
			{ vin: 'VIN-RNT-021', modelo: 'Navigator 2024', cliente: 'Asesoría Legal DF', checkout: '2025-05-07', fallas: 0, tiempoMin: 17, liberadoDia: true },
			{ vin: 'VIN-RNT-024', modelo: 'Ram 1500 2024', cliente: 'Empresa Logística', checkout: '2025-05-18', fallas: 1, tiempoMin: 24, liberadoDia: true },
			{ vin: 'VIN-RNT-026', modelo: 'Expedition 2022', cliente: 'Fondo Inmobiliario', checkout: '2025-05-25', fallas: 0, tiempoMin: 16, liberadoDia: true }
		]},
		'2025-06': { unidadPerfecta: 88.5, metaUP: 95, tiempoPromCheckout: 28, metaTiempo: 30, eficienciaLiberacion: 78.6, metaEfic: 90, detalle: [
			{ vin: 'VIN-RNT-028', modelo: 'Suburban 2024', cliente: 'Consorcio Industrial', checkout: '2025-06-04', fallas: 0, tiempoMin: 22, liberadoDia: true },
			{ vin: 'VIN-RNT-031', modelo: 'Tahoe 2022', cliente: 'Grupo Empresarial N', checkout: '2025-06-12', fallas: 3, tiempoMin: 48, liberadoDia: false },
			{ vin: 'VIN-RNT-033', modelo: 'Land Cruiser 2023', cliente: 'Empresa Minera N', checkout: '2025-06-19', fallas: 2, tiempoMin: 31, liberadoDia: false }
		]}
	};

	const kpi = $derived(kpiData[periodo]);
	function semColor(v: number, meta: number) {
		return v >= meta ? 'text-emerald-500' : v >= meta * 0.9 ? 'text-yellow-500' : 'text-destructive';
	}
	const tendenciaUP = ['2025-04', '2025-05', '2025-06'].map(p => ({ p, v: kpiData[p].unidadPerfecta }));
	const maxUP = Math.max(...tendenciaUP.map(t => t.v));
</script>

<div class="flex flex-col gap-6">
	<div class="flex flex-wrap items-center justify-between gap-3">
		<div>
			<h2 class="text-xl font-semibold">Dashboard KPIs de Calidad — Rentas</h2>
			<p class="text-muted-foreground text-sm">Indicadores de calidad específicos para la operación de la flota de rentas</p>
		</div>
		<div class="flex items-center gap-2">
			<Badge variant="outline" class="font-mono">GAP-CAL-006</Badge>
			<Select.Root type="single" bind:value={periodo}>
				<Select.Trigger class="w-36">{periodo}</Select.Trigger>
				<Select.Content>{#each periodos as p}<Select.Item value={p}>{p}</Select.Item>{/each}</Select.Content>
			</Select.Root>
			<Button variant="outline" size="sm"><FileSpreadsheet class="mr-2 size-4" />Exportar</Button>
		</div>
	</div>

	<!-- KPI Cards -->
	<div class="grid gap-4 sm:grid-cols-3">
		<Card.Root class={kpi.unidadPerfecta >= kpi.metaUP ? 'border-emerald-500/40' : 'border-yellow-500/40'}>
			<Card.Header class="pb-2">
				<Card.Description>Índice Unidad Perfecta</Card.Description>
				<Card.Title class="text-3xl tabular-nums {semColor(kpi.unidadPerfecta, kpi.metaUP)}">{kpi.unidadPerfecta}%</Card.Title>
			</Card.Header>
			<Card.Content>
				<p class="text-muted-foreground text-xs">Meta ≥ {kpi.metaUP}% · Rentas sin quejas técnicas</p>
				<div class="mt-2 flex items-center gap-1 text-xs">
					{#if kpi.unidadPerfecta >= kpi.metaUP}
						<CheckCircle class="size-3 text-emerald-500" /><span class="text-emerald-600">Dentro de meta</span>
					{:else}
						<XCircle class="size-3 text-yellow-500" /><span class="text-yellow-600">Bajo meta</span>
					{/if}
				</div>
			</Card.Content>
		</Card.Root>

		<Card.Root class={kpi.tiempoPromCheckout <= kpi.metaTiempo ? 'border-emerald-500/40' : 'border-yellow-500/40'}>
			<Card.Header class="pb-2">
				<Card.Description>Tiempo Promedio Revisión</Card.Description>
				<Card.Title class="text-3xl tabular-nums {semColor(kpi.metaTiempo - kpi.tiempoPromCheckout + kpi.metaTiempo, kpi.metaTiempo)}">{kpi.tiempoPromCheckout} min</Card.Title>
			</Card.Header>
			<Card.Content>
				<p class="text-muted-foreground text-xs">Meta ≤ {kpi.metaTiempo} min por revisión de check-out/check-in</p>
				<div class="mt-2 flex items-center gap-1 text-xs">
					{#if kpi.tiempoPromCheckout <= kpi.metaTiempo}
						<CheckCircle class="size-3 text-emerald-500" /><span class="text-emerald-600">Dentro de meta</span>
					{:else}
						<XCircle class="size-3 text-destructive" /><span class="text-destructive">Fuera de meta</span>
					{/if}
				</div>
			</Card.Content>
		</Card.Root>

		<Card.Root class={kpi.eficienciaLiberacion >= kpi.metaEfic ? 'border-emerald-500/40' : 'border-yellow-500/40'}>
			<Card.Header class="pb-2">
				<Card.Description>Eficiencia de Liberación</Card.Description>
				<Card.Title class="text-3xl tabular-nums {semColor(kpi.eficienciaLiberacion, kpi.metaEfic)}">{kpi.eficienciaLiberacion}%</Card.Title>
			</Card.Header>
			<Card.Content>
				<p class="text-muted-foreground text-xs">Meta ≥ {kpi.metaEfic}% · Liberadas el mismo día</p>
				<div class="mt-2 flex items-center gap-1 text-xs">
					{#if kpi.eficienciaLiberacion >= kpi.metaEfic}
						<CheckCircle class="size-3 text-emerald-500" /><span class="text-emerald-600">Dentro de meta</span>
					{:else}
						<XCircle class="size-3 text-destructive" /><span class="text-destructive">Fuera de meta</span>
					{/if}
				</div>
			</Card.Content>
		</Card.Root>
	</div>

	<!-- Tendencia Unidad Perfecta -->
	<Card.Root>
		<Card.Header><Card.Title class="text-sm">Tendencia — Índice Unidad Perfecta</Card.Title></Card.Header>
		<Card.Content>
			<div class="flex items-end gap-6">
				{#each tendenciaUP as t}
					<div class="flex flex-1 flex-col items-center gap-1">
						<span class="text-muted-foreground text-xs tabular-nums">{t.v}%</span>
						<div class="w-full rounded-sm" class:bg-emerald-500={t.v >= 95} class:bg-yellow-400={t.v >= 85 && t.v < 95} class:bg-destructive={t.v < 85} style="height:{Math.round((t.v / 100) * 100)}px"></div>
						<span class="text-muted-foreground text-xs">{t.p.slice(5)}</span>
					</div>
				{/each}
			</div>
			<div class="mt-2 flex items-center gap-2">
				<div class="h-0.5 flex-1 border-t-2 border-dashed border-emerald-500/60"></div>
				<span class="text-muted-foreground text-xs">Meta 95%</span>
			</div>
		</Card.Content>
	</Card.Root>

	<!-- Detalle de revisiones -->
	<Card.Root>
		<Card.Header><Card.Title class="text-sm">Detalle de Revisiones · {periodo}</Card.Title></Card.Header>
		<Card.Content>
			<Table.Root>
				<Table.Header>
					<Table.Row>
						<Table.Head>VIN · Modelo</Table.Head>
						<Table.Head>Cliente</Table.Head>
						<Table.Head>Fecha Check-out</Table.Head>
						<Table.Head class="text-right">Fallas</Table.Head>
						<Table.Head class="text-right">Tiempo (min)</Table.Head>
						<Table.Head>Liberada el día</Table.Head>
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{#each kpi.detalle as d}
						<Table.Row>
							<Table.Cell>
								<p class="font-mono text-xs">{d.vin}</p>
								<p class="text-muted-foreground text-xs">{d.modelo}</p>
							</Table.Cell>
							<Table.Cell class="text-sm">{d.cliente}</Table.Cell>
							<Table.Cell class="text-muted-foreground text-sm">{d.checkout}</Table.Cell>
							<Table.Cell class="text-right">
								{#if d.fallas > 0}<Badge variant="destructive">{d.fallas}</Badge>{:else}<span class="text-muted-foreground text-xs">—</span>{/if}
							</Table.Cell>
							<Table.Cell class="text-right tabular-nums text-sm {d.tiempoMin > 30 ? 'text-destructive font-medium' : ''}">{d.tiempoMin}</Table.Cell>
							<Table.Cell>
								{#if d.liberadoDia}
									<CheckCircle class="size-4 text-emerald-500" />
								{:else}
									<XCircle class="size-4 text-destructive" />
								{/if}
							</Table.Cell>
						</Table.Row>
					{/each}
				</Table.Body>
			</Table.Root>
		</Card.Content>
	</Card.Root>
</div>
