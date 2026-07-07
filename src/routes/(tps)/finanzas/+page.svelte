<script lang="ts">
	import { useFinanzasStore } from '$lib/tps/finanzas/store.svelte.js';
	import { AVISO_ESTADO_COLORS, AVISO_ESTADO_LABELS, fmtMoney, fmtMoneyShort } from '$lib/tps/finanzas/constants.js';
	import StatCard from '$lib/tps/components/stat-card.svelte';
	import StatusBadge from '$lib/tps/components/status-badge.svelte';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Chart from '$lib/components/ui/chart/index.js';
	import * as Table from '$lib/components/ui/table/index.js';
	import * as Alert from '$lib/components/ui/alert/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { BarChart } from 'layerchart';
	import { scaleBand } from 'd3-scale';
	import Mail from '@lucide/svelte/icons/mail';
	import Clock from '@lucide/svelte/icons/clock';
	import TriangleAlert from '@lucide/svelte/icons/triangle-alert';
	import Wallet from '@lucide/svelte/icons/wallet';
	import ArrowRight from '@lucide/svelte/icons/arrow-right';

	const store = useFinanzasStore();
	const data = $derived(store.state);

	const activos = $derived(data.proveedores.filter((p) => p.activo));

	const recent = $derived(data.historial.slice(0, 5));

	// Avisos por dia (ultimos 7 dias con actividad).
	const porDia = $derived.by(() => {
		const map = new Map<string, { enviados: number; errores: number }>();
		for (const h of data.historial) {
			const dia = h.fecha.split(' ')[0];
			const cur = map.get(dia) ?? { enviados: 0, errores: 0 };
			if (h.estado === 'enviado') cur.enviados++;
			else cur.errores++;
			map.set(dia, cur);
		}
		return [...map.entries()]
			.sort((a, b) => a[0].localeCompare(b[0]))
			.slice(-7)
			.map(([dia, v]) => ({
				dia: new Date(dia + 'T00:00:00').toLocaleDateString('es-MX', { day: '2-digit', month: 'short' }),
				total: v.enviados + v.errores
			}));
	});

	const chartConfig = {
		total: { label: 'Avisos', color: 'var(--chart-1)' }
	} satisfies Chart.ChartConfig;
</script>

<div class="flex flex-col gap-6">
	<div class="flex flex-wrap items-center justify-between gap-3">
		<div>
			<h2 class="text-xl font-semibold">Avisos de Pago Automáticos</h2>
			<p class="text-muted-foreground text-sm">Resumen de notificaciones de pago a proveedores</p>
		</div>
		<Badge variant="outline" class="font-mono">GAP-FIN-004</Badge>
	</div>

	{#if store.sinCorreoActivos.length > 0}
		<Alert.Root>
			<TriangleAlert />
			<Alert.Title>
				{store.sinCorreoActivos.length} proveedor(es) activo(s) sin correo de avisos
			</Alert.Title>
			<Alert.Description>
				{store.sinCorreoActivos.map((p) => p.nombre.split(' ').slice(0, 3).join(' ')).join(', ')} ·
				<a href="/finanzas/proveedores" class="underline underline-offset-2">Configurar ahora</a>
			</Alert.Description>
		</Alert.Root>
	{/if}

	<!-- KPIs -->
	<div
		class="grid grid-cols-1 gap-4 @xl/main:grid-cols-2 @5xl/main:grid-cols-4 **:data-[slot=card]:from-primary/5 **:data-[slot=card]:to-card **:data-[slot=card]:bg-linear-to-t **:data-[slot=card]:shadow-xs dark:**:data-[slot=card]:bg-card"
	>
		<a href="/finanzas/historial" class="contents">
			<StatCard label="Avisos enviados" value={store.avisosEnviadosMes} subtitle="Total del mes" icon={Mail} />
		</a>
		<a href="/finanzas/egresos" class="contents">
			<StatCard label="Pendientes de aviso" value={store.pendientes} subtitle="Egresos en cola" icon={Clock} />
		</a>
		<a href="/finanzas/historial" class="contents">
			<StatCard label="Con error" value={store.conError} subtitle="Requieren reenvío" icon={TriangleAlert} />
		</a>
		<StatCard label="Monto comunicado" value={fmtMoneyShort(store.montoComunicado)} subtitle="MXN notificados" icon={Wallet} />
	</div>

	<div class="grid grid-cols-1 gap-4 lg:grid-cols-3">
		<!-- Avisos por dia -->
		<Card.Root class="lg:col-span-2">
			<Card.Header>
				<Card.Title>Avisos por día</Card.Title>
				<Card.Description>Notificaciones registradas por fecha de envío</Card.Description>
			</Card.Header>
			<Card.Content>
				<Chart.Container config={chartConfig} class="max-h-55 w-full">
					<BarChart
						data={porDia}
						xScale={scaleBand().padding(0.3)}
						x="dia"
						axis="x"
						rule={false}
						props={{
							bars: { stroke: 'none', rounded: 'top', fill: 'var(--chart-1)' },
							xAxis: { tickLength: 0 }
						}}
						series={[{ key: 'total', label: chartConfig.total.label, color: chartConfig.total.color }]}
					>
						{#snippet tooltip()}
							<Chart.Tooltip indicator="dashed" hideLabel />
						{/snippet}
					</BarChart>
				</Chart.Container>
			</Card.Content>
		</Card.Root>

		<!-- Actividad reciente -->
		<Card.Root>
			<Card.Header>
				<Card.Title>Actividad reciente</Card.Title>
				<Card.Description>Últimos avisos generados</Card.Description>
				<Card.Action>
					<Button href="/finanzas/historial" variant="ghost" size="sm">
						Ver todo <ArrowRight data-icon="inline-end" />
					</Button>
				</Card.Action>
			</Card.Header>
			<Card.Content class="flex flex-col gap-3">
				{#each recent as h (h.id)}
					{@const p = store.getProveedor(h.provId)}
					<div class="flex items-center justify-between gap-2">
						<div class="min-w-0">
							<p class="truncate text-sm font-medium">{p?.nombre.split(' ').slice(0, 3).join(' ')}</p>
							<p class="text-muted-foreground text-xs tabular-nums">{h.fecha.slice(11, 16)} · {fmtMoney(h.monto)}</p>
						</div>
						<StatusBadge label={AVISO_ESTADO_LABELS[h.estado]} colorClass={AVISO_ESTADO_COLORS[h.estado]} />
					</div>
				{/each}
			</Card.Content>
		</Card.Root>
	</div>

	<!-- Estado de proveedores activos -->
	<Card.Root>
		<Card.Header>
			<Card.Title>Estado de proveedores activos</Card.Title>
			<Card.Description>Correos configurados y avisos por proveedor</Card.Description>
			<Card.Action>
				<Button href="/finanzas/proveedores" variant="ghost" size="sm">
					Administrar <ArrowRight data-icon="inline-end" />
				</Button>
			</Card.Action>
		</Card.Header>
		<Card.Content>
			<Table.Root>
				<Table.Header>
					<Table.Row>
						<Table.Head>Proveedor</Table.Head>
						<Table.Head>Correo de avisos</Table.Head>
						<Table.Head class="text-center">Avisos</Table.Head>
						<Table.Head>Último aviso</Table.Head>
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{#each activos as p (p.id)}
						{@const avisos = data.historial.filter((h) => h.provId === p.id)}
						{@const last = avisos[0]}
						<Table.Row>
							<Table.Cell>
								<p class="text-sm font-medium">{p.nombre.split(' ').slice(0, 4).join(' ')}</p>
								<p class="text-muted-foreground font-mono text-xs">{p.rfc}</p>
							</Table.Cell>
							<Table.Cell>
								{#if p.correoA}
									<span class="text-sm">{p.correoA}</span>
								{:else}
									<StatusBadge label="Sin configurar" colorClass="bg-chart-4/15 text-chart-4" />
								{/if}
							</Table.Cell>
							<Table.Cell class="text-center font-semibold tabular-nums">{avisos.length}</Table.Cell>
							<Table.Cell class="text-muted-foreground text-xs">
								{last ? last.fecha.split(' ')[0] : '—'}
							</Table.Cell>
						</Table.Row>
					{/each}
				</Table.Body>
			</Table.Root>
		</Card.Content>
	</Card.Root>
</div>
