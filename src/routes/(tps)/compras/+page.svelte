<script lang="ts">
	import { useComprasStore } from '$lib/tps/compras/store.svelte.js';
	import { REQ_STATUS_FLOW, REQ_STATUS_COLORS, REQ_STATUS_DOTS, DEPARTAMENTOS, fmtMoney } from '$lib/tps/compras/constants.js';
	import { PACKAGE_STATUS_COLORS } from '$lib/tps/compras/constants.js';
	import StatCard from '$lib/tps/components/stat-card.svelte';
	import StatusBadge from '$lib/tps/components/status-badge.svelte';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Chart from '$lib/components/ui/chart/index.js';
	import * as Item from '$lib/components/ui/item/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { Progress } from '$lib/components/ui/progress/index.js';
	import { BarChart } from 'layerchart';
	import { scaleBand } from 'd3-scale';
	import Inbox from '@lucide/svelte/icons/inbox';
	import FileText from '@lucide/svelte/icons/file-text';
	import TriangleAlert from '@lucide/svelte/icons/triangle-alert';
	import CircleCheckBig from '@lucide/svelte/icons/circle-check-big';

	const store = useComprasStore();
	const data = $derived(store.state);

	const pendientes = $derived(store.pendientes);
	const reqActivas = $derived(data.requisiciones.filter((r) => r.status !== 'En Almacén' && r.status !== 'Cancelado').length);
	const alertasCount = $derived(data.alertas.length);
	const compradas = $derived(data.requisiciones.filter((r) => r.status === 'Comprado').length);

	const pipeline = $derived(
		REQ_STATUS_FLOW.map((s) => ({ status: s, count: data.requisiciones.filter((r) => r.status === s).length }))
	);

	const byDepto = $derived(
		DEPARTAMENTOS.map((d) => ({ depto: d, count: data.requisiciones.filter((r) => r.depto === d).length }))
	);

	const chartConfig = {
		count: { label: 'Requisiciones', color: 'var(--chart-1)' }
	} satisfies Chart.ChartConfig;

	const recent = $derived([...data.requisiciones].sort((a, b) => b.fecha.localeCompare(a.fecha)).slice(0, 5));

	const topProveedores = $derived.by(() => {
		const map: Record<string, number> = {};
		for (const o of data.ordenes) {
			map[o.proveedor] = (map[o.proveedor] ?? 0) + o.monto;
		}
		const sorted = Object.entries(map)
			.sort((a, b) => b[1] - a[1])
			.slice(0, 5);
		const max = sorted[0]?.[1] ?? 1;
		return sorted.map(([nombre, monto]) => ({ nombre, monto, pct: Math.round((monto / max) * 100) }));
	});
</script>

<div class="flex flex-col gap-6">
	<div>
		<h2 class="text-xl font-semibold">Compras</h2>
		<p class="text-muted-foreground text-sm">
			Bienvenido, <strong class="text-foreground">{data.currentUser.name}</strong> · Resumen ejecutivo del día
		</p>
	</div>

	<!-- KPIs principales -->
	<div
		class="grid grid-cols-1 gap-4 @xl/main:grid-cols-2 @5xl/main:grid-cols-4 **:data-[slot=card]:from-primary/5 **:data-[slot=card]:to-card **:data-[slot=card]:bg-linear-to-t **:data-[slot=card]:shadow-xs dark:**:data-[slot=card]:bg-card"
	>
		<a href="/compras/bandeja" class="contents"><StatCard label="Pendientes de autorizar" value={pendientes} subtitle="OCs en bandeja" icon={Inbox} /></a>
		<a href="/compras/requisiciones" class="contents"><StatCard label="Requisiciones activas" value={reqActivas} subtitle="En seguimiento" icon={FileText} /></a>
		<a href="/compras/alertas" class="contents"><StatCard label="Alertas activas" value={alertasCount} subtitle="Materiales con retraso" icon={TriangleAlert} /></a>
		<a href="/compras/requisiciones" class="contents"><StatCard label="Compras completadas" value={compradas} subtitle="Esta semana" icon={CircleCheckBig} /></a>
	</div>

	<!-- Pipeline por estatus -->
	<div
		class="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6 **:data-[slot=card]:from-primary/5 **:data-[slot=card]:to-card **:data-[slot=card]:bg-linear-to-t **:data-[slot=card]:shadow-xs dark:**:data-[slot=card]:bg-card"
	>
		{#each pipeline as kpi (kpi.status)}
			<a href="/compras/requisiciones?status={encodeURIComponent(kpi.status)}" class="contents">
				<Card.Root class="@container/card hover:border-primary/50 gap-2 py-4 transition-colors">
					<Card.Header class="px-4">
						<Card.Description class="flex items-center gap-1.5">
							<span class="size-2 rounded-full {REQ_STATUS_DOTS[kpi.status]}"></span>
							<span class="leading-tight">{kpi.status}</span>
						</Card.Description>
						<Card.Title class="text-2xl font-semibold tabular-nums">{kpi.count}</Card.Title>
					</Card.Header>
				</Card.Root>
			</a>
		{/each}
	</div>

	<div class="grid grid-cols-1 gap-4 lg:grid-cols-3">
		<!-- Bar chart -->
		<Card.Root class="lg:col-span-2">
			<Card.Header>
				<Card.Title>Requisiciones por Departamento</Card.Title>
				<Card.Description>Distribución de requisiciones por área solicitante</Card.Description>
			</Card.Header>
			<Card.Content>
				<Chart.Container config={chartConfig} class="max-h-55 w-full">
					<BarChart
						data={byDepto}
						xScale={scaleBand().padding(0.3)}
						x="depto"
						axis="x"
						rule={false}
						props={{
							bars: { stroke: 'none', rounded: 'top', fill: 'var(--chart-1)' },
							xAxis: { tickLength: 0 }
						}}
						series={[{ key: 'count', label: chartConfig.count.label, color: chartConfig.count.color }]}
					>
						{#snippet tooltip()}
							<Chart.Tooltip indicator="dashed" hideLabel />
						{/snippet}
					</BarChart>
				</Chart.Container>
			</Card.Content>
		</Card.Root>

		<!-- Top proveedores -->
		<Card.Root>
			<Card.Header>
				<Card.Title>Top Proveedores (OCs)</Card.Title>
				<Card.Description>Monto acumulado por proveedor</Card.Description>
			</Card.Header>
			<Card.Content>
				<Item.Group class="gap-3">
					{#each topProveedores as prov (prov.nombre)}
						<Item.Root size="xs" class="flex-col items-stretch gap-1.5 px-0">
							<div class="flex items-center justify-between gap-2">
								<Item.Title class="truncate text-sm font-normal">{prov.nombre}</Item.Title>
								<span class="font-mono text-xs font-medium tabular-nums">{fmtMoney(prov.monto)}</span>
							</div>
							<Progress value={prov.pct} class="h-1.5" />
						</Item.Root>
					{/each}
				</Item.Group>
			</Card.Content>
		</Card.Root>
	</div>

	<!-- Actividad reciente -->
	<Card.Root>
		<Card.Header>
			<Card.Title>Actividad Reciente</Card.Title>
			<Card.Description>Últimas requisiciones actualizadas</Card.Description>
		</Card.Header>
		<Card.Content>
			<Item.Group>
				{#each recent as r (r.id)}
					<Item.Root size="sm" class="px-0">
						<Item.Media variant="icon" class="bg-transparent">
							<span class="size-2.5 rounded-full {REQ_STATUS_DOTS[r.status]}"></span>
						</Item.Media>
						<Item.Content>
							<Item.Title class="flex items-center gap-2">
								<span class="text-primary font-mono text-xs">{r.id}</span>
								<span class="text-muted-foreground truncate text-xs font-normal">{r.material}</span>
							</Item.Title>
						</Item.Content>
						<Item.Actions class="gap-2">
							<StatusBadge label={r.status} colorClass={REQ_STATUS_COLORS[r.status]} />
							<span class="text-muted-foreground text-xs">{r.fecha}</span>
						</Item.Actions>
					</Item.Root>
				{/each}
			</Item.Group>
		</Card.Content>
	</Card.Root>
</div>

