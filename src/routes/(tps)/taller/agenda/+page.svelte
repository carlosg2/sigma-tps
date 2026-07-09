<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Table from '$lib/components/ui/table/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import * as Tabs from '$lib/components/ui/tabs/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { toast } from 'svelte-sonner';
	import CalendarDays from '@lucide/svelte/icons/calendar-days';
	import Plus from '@lucide/svelte/icons/circle-plus';
	import Wrench from '@lucide/svelte/icons/wrench';
	import Bell from '@lucide/svelte/icons/bell';
	import MapPin from '@lucide/svelte/icons/map-pin';

	type Cita = {
		id: string; vin: string; modelo: string; cliente: string;
		sucursal: string; tecnico: string; bahia: string;
		fecha: string; hora: string; tipo: string;
		estado: 'agendada' | 'en_proceso' | 'completada' | 'cancelada';
		km: number;
	};

	let sucursalSel = $state('MTY');
	let vistaSel = $state<'dia' | 'semana'>('semana');

	const sucursales = ['MTY', 'CDMX', 'GDL', 'CUN', 'HMO'];

	const citas: Cita[] = [
		{ id: 'C-001', vin: 'VIN-MTY-001', modelo: 'Suburban 2024', cliente: 'Constructora del Norte SA', sucursal: 'MTY', tecnico: 'J. Ramírez', bahia: 'B-1', fecha: '2025-06-23', hora: '09:00', tipo: 'Mantenimiento preventivo 40,000 km', estado: 'completada', km: 40_200 },
		{ id: 'C-002', vin: 'VIN-MTY-002', modelo: 'Tahoe 2023', cliente: 'Seguridad Privada Noreste', sucursal: 'MTY', tecnico: 'L. García', bahia: 'B-2', fecha: '2025-06-24', hora: '10:30', tipo: 'Revisión cristales blindados', estado: 'completada', km: 28_450 },
		{ id: 'C-003', vin: 'VIN-MTY-003', modelo: 'Ram 1500 2024', cliente: 'Grupo Industrial GR', sucursal: 'MTY', tecnico: 'J. Ramírez', bahia: 'B-1', fecha: '2025-06-25', hora: '09:00', tipo: 'Garantía — sellado puerta', estado: 'agendada', km: 12_800 },
		{ id: 'C-004', vin: 'VIN-MTY-004', modelo: 'Expedition 2022', cliente: 'Familia Rodríguez Cavazos', sucursal: 'MTY', tecnico: 'M. Torres', bahia: 'B-3', fecha: '2025-06-25', hora: '11:00', tipo: 'Revisión de blindaje anual', estado: 'agendada', km: 68_200 },
		{ id: 'C-005', vin: 'VIN-MTY-005', modelo: 'Land Cruiser 2024', cliente: 'Empresa Minera del Norte', sucursal: 'MTY', tecnico: 'L. García', bahia: 'B-2', fecha: '2025-06-26', hora: '08:30', tipo: 'Mantenimiento preventivo 20,000 km', estado: 'agendada', km: 19_800 },
		{ id: 'C-006', vin: 'VIN-CDMX-001', modelo: 'Navigator 2024', cliente: 'Asesoría Empresarial DF', sucursal: 'CDMX', tecnico: 'A. López', bahia: 'B-1', fecha: '2025-06-25', hora: '10:00', tipo: 'Inspección post-siniestro', estado: 'agendada', km: 8_600 },
	];

	const capacidad: Record<string, Record<string, number>> = {
		MTY: { 'B-1': 8, 'B-2': 8, 'B-3': 6 },
		CDMX: { 'B-1': 8, 'B-2': 8 },
		GDL: { 'B-1': 8 },
		CUN: { 'B-1': 6 },
		HMO: { 'B-1': 6 }
	};

	const citasSuc = $derived(citas.filter(c => c.sucursal === sucursalSel));
	const bahias = $derived(Object.keys(capacidad[sucursalSel] ?? {}));

	const fechas = ['2025-06-23', '2025-06-24', '2025-06-25', '2025-06-26', '2025-06-27'];

	function citasDia(bahia: string, fecha: string) {
		return citasSuc.filter(c => c.bahia === bahia && c.fecha === fecha);
	}
	function estadoVariant(e: Cita['estado']): 'secondary' | 'outline' | 'default' | 'destructive' {
		if (e === 'completada') return 'secondary';
		if (e === 'en_proceso') return 'default';
		if (e === 'cancelada') return 'destructive';
		return 'outline';
	}
	function nuevaCita() {
		toast.info('Alta de cita', { description: 'El sistema sugiere la próxima fecha disponible según carga real de bahías y técnicos.' });
	}
</script>

<div class="flex flex-col gap-6">
	<div class="flex flex-wrap items-center justify-between gap-3">
		<div>
			<h2 class="text-xl font-semibold">Agenda de Servicio — Taller</h2>
			<p class="text-muted-foreground text-sm">Tablero de citas por bahía y técnico · Sugerencia automática de disponibilidad</p>
		</div>
		<div class="flex items-center gap-2">
			<Badge variant="outline" class="font-mono">GAP-TLL-001</Badge>
			<Select.Root type="single" bind:value={sucursalSel}>
				<Select.Trigger class="w-28">
					<MapPin class="mr-1 size-3" />{sucursalSel}
				</Select.Trigger>
				<Select.Content>
					{#each sucursales as s}<Select.Item value={s}>{s}</Select.Item>{/each}
				</Select.Content>
			</Select.Root>
			<Button onclick={nuevaCita}>
				<Plus class="mr-2 size-4" />Nueva Cita
			</Button>
		</div>
	</div>

	<!-- Capacidad -->
	<div class="grid gap-3 sm:grid-cols-3">
		{#each bahias as b}
			{@const ocupado = citasSuc.filter(c => c.bahia === b && c.estado !== 'cancelada').length}
			{@const cap = capacidad[sucursalSel][b]}
			{@const pct = Math.round((ocupado / cap) * 100)}
			<Card.Root class={pct >= 85 ? 'border-destructive/50' : pct >= 60 ? 'border-yellow-500/50' : 'border-emerald-500/50'}>
				<Card.Header class="pb-2">
					<Card.Description class="flex items-center gap-1"><Wrench class="size-3" />{b}</Card.Description>
					<Card.Title class="text-2xl tabular-nums">{ocupado}/{cap}</Card.Title>
				</Card.Header>
				<Card.Content>
					<div class="h-2 w-full rounded-full bg-muted overflow-hidden">
						<div class="h-full rounded-full transition-all" class:bg-emerald-500={pct < 60} class:bg-yellow-400={pct >= 60 && pct < 85} class:bg-destructive={pct >= 85} style="width:{pct}%"></div>
					</div>
					<p class="text-muted-foreground mt-1 text-xs">{pct}% ocupado</p>
				</Card.Content>
			</Card.Root>
		{/each}
	</div>

	<!-- Tablero semanal -->
	<Card.Root>
		<Card.Header><Card.Title class="text-sm">Vista Semanal · {sucursalSel}</Card.Title></Card.Header>
		<Card.Content class="overflow-x-auto">
			<div class="min-w-[640px]">
				<div class="grid" style="grid-template-columns: 80px repeat({fechas.length}, 1fr)">
					<div class="text-muted-foreground text-xs font-medium p-2">Bahía</div>
					{#each fechas as f}
						<div class="text-muted-foreground border-l p-2 text-center text-xs font-medium">{f.slice(5)}</div>
					{/each}
					{#each bahias as b}
						<div class="border-t p-2 text-xs font-semibold self-start">{b}</div>
						{#each fechas as f}
							<div class="border-l border-t p-1 min-h-[60px]">
								{#each citasDia(b, f) as c (c.id)}
									<div class="mb-1 rounded bg-muted/60 p-1 text-[10px] leading-tight">
										<p class="font-medium truncate">{c.hora} {c.cliente}</p>
										<p class="text-muted-foreground truncate">{c.modelo}</p>
									</div>
								{/each}
							</div>
						{/each}
					{/each}
				</div>
			</div>
		</Card.Content>
	</Card.Root>

	<!-- Lista de citas -->
	<Card.Root>
		<Card.Header><Card.Title class="text-sm">Próximas Citas · {sucursalSel}</Card.Title></Card.Header>
		<Card.Content>
			<Table.Root>
				<Table.Header>
					<Table.Row>
						<Table.Head>VIN / Modelo</Table.Head>
						<Table.Head>Cliente</Table.Head>
						<Table.Head>Fecha · Hora</Table.Head>
						<Table.Head>Tipo de Servicio</Table.Head>
						<Table.Head>Técnico · Bahía</Table.Head>
						<Table.Head class="text-right">KM</Table.Head>
						<Table.Head>Estado</Table.Head>
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{#each citasSuc as c (c.id)}
						<Table.Row>
							<Table.Cell>
								<p class="font-mono text-xs">{c.vin}</p>
								<p class="text-muted-foreground text-xs">{c.modelo}</p>
							</Table.Cell>
							<Table.Cell class="text-sm">{c.cliente}</Table.Cell>
							<Table.Cell class="tabular-nums text-sm">{c.fecha} {c.hora}</Table.Cell>
							<Table.Cell class="text-sm">{c.tipo}</Table.Cell>
							<Table.Cell>
								<p class="text-sm">{c.tecnico}</p>
								<p class="text-muted-foreground text-xs">{c.bahia}</p>
							</Table.Cell>
							<Table.Cell class="text-right tabular-nums text-sm">{c.km.toLocaleString()}</Table.Cell>
							<Table.Cell><Badge variant={estadoVariant(c.estado)} class="capitalize">{c.estado.replace('_',' ')}</Badge></Table.Cell>
						</Table.Row>
					{/each}
				</Table.Body>
			</Table.Root>
		</Card.Content>
	</Card.Root>
</div>
