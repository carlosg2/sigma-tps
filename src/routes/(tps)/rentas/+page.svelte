<script lang="ts">
	import { useRentasStore } from '$lib/tps/rentas/store.svelte.js';
	import {
		DAY_STATUS_COLORS,
		DAY_STATUS_LABELS,
		fmtMXN,
		fmtDate,
		todayISO
	} from '$lib/tps/rentas/constants.js';
	import type { DayStatus } from '$lib/tps/rentas/types.js';
	import StatCard from '$lib/tps/components/stat-card.svelte';
	import StatusBadge from '$lib/tps/components/status-badge.svelte';
	import AvailabilityCalendar from '$lib/tps/rentas/components/availability-calendar.svelte';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Table from '$lib/components/ui/table/index.js';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import * as Avatar from '$lib/components/ui/avatar/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import ShieldCheck from '@lucide/svelte/icons/shield-check';
	import Gauge from '@lucide/svelte/icons/gauge';
	import Wallet from '@lucide/svelte/icons/wallet';
	import TriangleAlert from '@lucide/svelte/icons/triangle-alert';
	import CalendarDays from '@lucide/svelte/icons/calendar-days';
	import ArrowRight from '@lucide/svelte/icons/arrow-right';

	const store = useRentasStore();
	const data = $derived(store.state);
	const hoy = todayISO();

	const riesgoColor = $derived(
		{
			bajo: 'bg-emerald-500/15 text-emerald-400',
			medio: 'bg-chart-4/15 text-chart-4',
			alto: 'bg-destructive/15 text-destructive'
		}[store.riesgo.nivel]
	);

	const recientes = $derived([...data.cotizaciones].reverse().slice(0, 5));

	let occVin = $state<string | null>(null);
	const occVehiculo = $derived(occVin ? store.getVehiculo(occVin) : undefined);
	const occPeriodos = $derived(occVehiculo?.ocupacion ?? []);
</script>

<div class="flex flex-col gap-6">
	<div class="flex flex-wrap items-center justify-between gap-3">
		<div>
			<h2 class="text-xl font-semibold">Rentas · Executive Pulse</h2>
			<p class="text-muted-foreground text-sm">Disponibilidad de flota, pipeline comercial y riesgo</p>
		</div>
		<Badge variant="outline" class="font-mono">GAP-RNT-001</Badge>
	</div>

	<!-- KPIs -->
	<div
		class="grid grid-cols-1 gap-4 @xl/main:grid-cols-2 @5xl/main:grid-cols-4 **:data-[slot=card]:from-primary/5 **:data-[slot=card]:to-card **:data-[slot=card]:bg-linear-to-t **:data-[slot=card]:shadow-xs dark:**:data-[slot=card]:bg-card"
	>
		<StatCard label="Disponibilidad hoy" value="{store.disponibilidadHoy}%" subtitle="Unidades listas para salida" icon={ShieldCheck} />
		<StatCard label="Utilización operativa" value="{store.utilizacion}%" subtitle="Flota ocupada o en mantenimiento" icon={Gauge} />
		<StatCard label="Pipeline comercial" value={fmtMXN(store.pipeline)} subtitle="Cotizaciones guardadas" icon={Wallet} />
		<Card.Root class="@container/card">
			<Card.Header>
				<Card.Description>Riesgo compliance</Card.Description>
				<Card.Title class="text-2xl font-semibold @[250px]/card:text-3xl">
					<StatusBadge label={store.riesgo.label} colorClass={riesgoColor} class="text-base" />
				</Card.Title>
				<Card.Action>
					<TriangleAlert class="text-muted-foreground size-5" />
				</Card.Action>
			</Card.Header>
			<Card.Footer class="text-muted-foreground text-sm">Calculado por liberaciones pendientes</Card.Footer>
		</Card.Root>
	</div>

	<div class="grid grid-cols-1 gap-4 lg:grid-cols-3">
		<!-- Flota -->
		<Card.Root class="lg:col-span-2">
			<Card.Header>
				<Card.Title>Disponibilidad de flota</Card.Title>
				<Card.Description>Estado de cada unidad para el día de hoy</Card.Description>
			</Card.Header>
			<Card.Content>
				<Table.Root>
					<Table.Header>
						<Table.Row>
							<Table.Head>Unidad</Table.Head>
							<Table.Head class="text-center">Hoy</Table.Head>
							<Table.Head class="text-right">Tarifa / día</Table.Head>
							<Table.Head class="text-right">Calendario</Table.Head>
						</Table.Row>
					</Table.Header>
					<Table.Body>
						{#each store.vehiculos as v (v.vin)}
							{@const estado = store.getDayStatus(v.vin, hoy) as DayStatus}
							<Table.Row>
								<Table.Cell>
									<div class="flex items-center gap-3">
										<Avatar.Root class="size-10 rounded-md">
											<Avatar.Image src={v.fotos[0]} alt={v.modelo} class="object-cover" />
											<Avatar.Fallback class="rounded-md">{v.nivel}</Avatar.Fallback>
										</Avatar.Root>
										<div>
											<p class="text-sm font-medium">{v.modelo}</p>
											<p class="text-muted-foreground font-mono text-xs">{v.vin} · {v.nivel}</p>
										</div>
									</div>
								</Table.Cell>
								<Table.Cell class="text-center">
									<StatusBadge label={DAY_STATUS_LABELS[estado]} colorClass={DAY_STATUS_COLORS[estado]} />
								</Table.Cell>
								<Table.Cell class="text-right font-medium tabular-nums">{fmtMXN(v.tarifa)}</Table.Cell>
								<Table.Cell class="text-right">
									<Button size="sm" variant="outline" onclick={() => (occVin = v.vin)}>
										<CalendarDays data-icon="inline-start" /> Ver
									</Button>
								</Table.Cell>
							</Table.Row>
						{/each}
					</Table.Body>
				</Table.Root>
			</Card.Content>
		</Card.Root>

		<!-- Recientes -->
		<Card.Root>
			<Card.Header>
				<Card.Title>Cotizaciones recientes</Card.Title>
				<Card.Description>Últimas cotizaciones registradas</Card.Description>
				<Card.Action>
					<Button href="/rentas/cotizaciones" variant="ghost" size="sm">
						Ver todo <ArrowRight data-icon="inline-end" />
					</Button>
				</Card.Action>
			</Card.Header>
			<Card.Content class="flex flex-col gap-3">
				{#each recientes as c (c.folio)}
					{@const prog = store.flowProgress(c.folio)}
					<div class="flex items-center justify-between gap-2">
						<div class="min-w-0">
							<p class="truncate text-sm font-medium">{c.cliente}</p>
							<p class="text-muted-foreground font-mono text-xs">{c.folio} · {c.version}</p>
						</div>
						<div class="text-right">
							<p class="text-sm font-semibold tabular-nums">{fmtMXN(c.total)}</p>
							<p class="text-muted-foreground text-xs tabular-nums">{prog.pct}% avance</p>
						</div>
					</div>
				{/each}
				{#if recientes.length === 0}
					<p class="text-muted-foreground text-sm">Sin cotizaciones.</p>
				{/if}
			</Card.Content>
		</Card.Root>
	</div>
</div>

<!-- ── CALENDARIO DE OCUPACIÓN ── -->
<Dialog.Root open={occVin !== null} onOpenChange={(o) => { if (!o) occVin = null; }}>
	<Dialog.Content class="max-h-[90vh] overflow-y-auto sm:max-w-lg">
		{#if occVehiculo}
			<Dialog.Header>
				<Dialog.Title>Calendario · {occVehiculo.modelo}</Dialog.Title>
				<Dialog.Description>VIN {occVehiculo.vin} · Los días ocupados o en mantenimiento aparecen deshabilitados.</Dialog.Description>
			</Dialog.Header>

			<div class="flex flex-wrap gap-3 text-xs">
				<span class="flex items-center gap-1.5"><span class="size-2.5 rounded-full bg-emerald-500"></span> Disponible</span>
				<span class="flex items-center gap-1.5"><span class="bg-destructive size-2.5 rounded-full"></span> Ocupado</span>
				<span class="flex items-center gap-1.5"><span class="bg-chart-4 size-2.5 rounded-full"></span> Mantenimiento</span>
			</div>

			<AvailabilityCalendar vin={occVehiculo.vin} readonly />

			<div class="flex flex-col gap-2">
				<h4 class="text-sm font-semibold">Periodos no disponibles</h4>
				{#if occPeriodos.length === 0}
					<p class="text-muted-foreground text-sm">Sin periodos registrados.</p>
				{:else}
					{#each occPeriodos as p (p.start)}
						<div class="flex items-center justify-between gap-2 text-sm">
							<span>{fmtDate(p.start)} — {fmtDate(p.end)}</span>
							<StatusBadge
								label={p.tipo === 'occupied' ? 'Ocupado' : 'Mantenimiento'}
								colorClass={p.tipo === 'occupied' ? DAY_STATUS_COLORS.occupied : DAY_STATUS_COLORS.maintenance}
							/>
						</div>
					{/each}
				{/if}
			</div>
		{/if}
	</Dialog.Content>
</Dialog.Root>
