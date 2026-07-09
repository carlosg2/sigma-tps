<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Table from '$lib/components/ui/table/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import * as Tabs from '$lib/components/ui/tabs/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { toast } from 'svelte-sonner';
	import Search from '@lucide/svelte/icons/search';
	import RefreshCw from '@lucide/svelte/icons/refresh-cw';
	import AlertTriangle from '@lucide/svelte/icons/triangle-alert';
	import CheckCircle from '@lucide/svelte/icons/check-circle';
	import FileSearch from '@lucide/svelte/icons/file-search';

	type Discrepancia = {
		id: string;
		tipo: 'sat_sin_erp' | 'erp_sin_sat' | 'diferencia_monto' | 'retencion_faltante';
		uuid: string;
		proveedor: string;
		rfc: string;
		montoERP: number;
		montoSAT: number;
		diferencia: number;
		fecha: string;
		concepto: string;
		estado: 'pendiente' | 'aclarado' | 'error';
	};

	let busqueda = $state('');
	let filtroPeriodo = $state('2025-06');
	let filtroTipo = $state('todos');
	let ejecutando = $state(false);

	const periodos = ['2025-04', '2025-05', '2025-06'];

	const discrepancias: Discrepancia[] = [
		{ id: 'D-001', tipo: 'retencion_faltante', uuid: 'ABC1-DEF2-3456-GHI7-JKL8', proveedor: 'Aceros Especiales SA', rfc: 'AES810305HK1', montoERP: 142_800, montoSAT: 142_800, diferencia: 0, fecha: '2025-06-03', concepto: 'Placas acero balístico', estado: 'pendiente' },
		{ id: 'D-002', tipo: 'diferencia_monto', uuid: 'MNO9-PQR0-1234-STU5-VWX6', proveedor: 'Cristales Blindados del Norte', rfc: 'CBN920714MG2', montoERP: 89_500, montoSAT: 91_200, diferencia: -1_700, fecha: '2025-06-07', concepto: 'Cristales laminados', estado: 'pendiente' },
		{ id: 'D-003', tipo: 'sat_sin_erp', uuid: 'YZA1-BCD2-5678-EFG3-HIJ4', proveedor: 'Distribuidora Automotriz Monterrey', rfc: 'DAM030219AB3', montoERP: 0, montoSAT: 24_600, diferencia: -24_600, fecha: '2025-06-10', concepto: 'Piezas tapicería premium', estado: 'pendiente' },
		{ id: 'D-004', tipo: 'retencion_faltante', uuid: 'KLM5-NOP6-9012-QRS7-TUV8', proveedor: 'Servicios Logísticos MX', rfc: 'SLM980522JK4', montoERP: 18_400, montoSAT: 18_400, diferencia: 0, fecha: '2025-06-14', concepto: 'Flete traslado P1-P3', estado: 'pendiente' },
		{ id: 'D-005', tipo: 'diferencia_monto', uuid: 'WXY9-ZAB0-3456-CDE1-FGH2', proveedor: 'Electrónica Industrial SA', rfc: 'EIS001103PL5', montoERP: 36_200, montoSAT: 36_200, diferencia: 0, fecha: '2025-06-19', concepto: 'Arneses eléctricos', estado: 'aclarado' },
		{ id: 'D-006', tipo: 'erp_sin_sat', uuid: 'IJK3-LMN4-7890-OPQ5-RST6', proveedor: 'Maquiladora Industrial Norte', rfc: 'MIN990816RS6', montoERP: 52_800, montoSAT: 0, diferencia: 52_800, fecha: '2025-06-22', concepto: 'Servicio maquila piezas', estado: 'error' }
	];

	const TIPO_LABELS: Record<string, string> = {
		sat_sin_erp: 'CFDI en SAT sin registro ERP',
		erp_sin_sat: 'Registro ERP sin CFDI en SAT',
		diferencia_monto: 'Diferencia en monto',
		retencion_faltante: 'Retención no registrada'
	};

	const TIPO_VARIANT: Record<string, 'destructive' | 'outline' | 'secondary'> = {
		sat_sin_erp: 'destructive',
		erp_sin_sat: 'destructive',
		diferencia_monto: 'outline',
		retencion_faltante: 'outline'
	};

	const filtradas = $derived(discrepancias.filter(d => {
		if (filtroTipo !== 'todos' && d.tipo !== filtroTipo) return false;
		if (busqueda && !d.proveedor.toLowerCase().includes(busqueda.toLowerCase()) && !d.uuid.includes(busqueda)) return false;
		if (d.estado === 'aclarado' || d.estado === 'error') return filtroTipo !== 'todos';
		return true;
	}).concat(filtroTipo === 'todos' ? [] : discrepancias.filter(d => d.estado === 'aclarado' || d.estado === 'error')));

	const resumen = $derived({
		total: discrepancias.length,
		pendientes: discrepancias.filter(d => d.estado === 'pendiente').length,
		monto: discrepancias.filter(d => d.estado === 'pendiente').reduce((s, d) => s + Math.abs(d.diferencia), 0)
	});

	function ejecutarCruce() {
		ejecutando = true;
		setTimeout(() => {
			ejecutando = false;
			toast.success('Cruce SAT completado', { description: `${discrepancias.length} CFDIs analizados · ${resumen.pendientes} discrepancias detectadas` });
		}, 2000);
	}
</script>

<div class="flex flex-col gap-6">
	<div class="flex flex-wrap items-center justify-between gap-3">
		<div>
			<h2 class="text-xl font-semibold">Fiscalización y Compulsa SAT</h2>
			<p class="text-muted-foreground text-sm">Cruce automático CFDI ERP vs. portal SAT · Detección de discrepancias en tiempo real</p>
		</div>
		<div class="flex items-center gap-2">
			<Badge variant="outline" class="font-mono">GAP-CON-010</Badge>
			<Select.Root type="single" bind:value={filtroPeriodo}>
				<Select.Trigger class="w-36">{filtroPeriodo}</Select.Trigger>
				<Select.Content>
					{#each periodos as p}<Select.Item value={p}>{p}</Select.Item>{/each}
				</Select.Content>
			</Select.Root>
			<Button onclick={ejecutarCruce} disabled={ejecutando}>
				<RefreshCw class="mr-2 size-4 {ejecutando ? 'animate-spin' : ''}" />
				{ejecutando ? 'Ejecutando cruce...' : 'Ejecutar Cruce SAT'}
			</Button>
		</div>
	</div>

	<!-- Resumen -->
	<div class="grid gap-4 sm:grid-cols-3">
		<Card.Root>
			<Card.Header class="pb-2">
				<Card.Description>CFDIs Analizados</Card.Description>
				<Card.Title class="text-3xl tabular-nums">384</Card.Title>
			</Card.Header>
			<Card.Content><p class="text-muted-foreground text-xs">Emitidos + recibidos · {filtroPeriodo}</p></Card.Content>
		</Card.Root>
		<Card.Root class={resumen.pendientes > 0 ? 'border-yellow-500/50' : 'border-emerald-500/50'}>
			<Card.Header class="pb-2">
				<Card.Description class="flex items-center gap-1">
					<AlertTriangle class="size-4 text-yellow-500" /> Discrepancias Pendientes
				</Card.Description>
				<Card.Title class="text-3xl tabular-nums text-yellow-600">{resumen.pendientes}</Card.Title>
			</Card.Header>
			<Card.Content><p class="text-muted-foreground text-xs">Requieren atención antes del cierre</p></Card.Content>
		</Card.Root>
		<Card.Root>
			<Card.Header class="pb-2">
				<Card.Description>Monto en Discrepancia</Card.Description>
				<Card.Title class="text-3xl tabular-nums">${resumen.monto.toLocaleString()}</Card.Title>
			</Card.Header>
			<Card.Content><p class="text-muted-foreground text-xs">Suma de diferencias sin aclarar</p></Card.Content>
		</Card.Root>
	</div>

	<!-- Filtros + tabla -->
	<Card.Root>
		<Card.Header>
			<div class="flex flex-wrap items-center gap-3">
				<div class="relative flex-1">
					<Search class="text-muted-foreground absolute left-3 top-1/2 size-4 -translate-y-1/2" />
					<Input bind:value={busqueda} placeholder="Buscar por proveedor o UUID..." class="pl-9" />
				</div>
				<Select.Root type="single" bind:value={filtroTipo}>
					<Select.Trigger class="w-52">
						{filtroTipo === 'todos' ? 'Todos los tipos' : TIPO_LABELS[filtroTipo]}
					</Select.Trigger>
					<Select.Content>
						<Select.Item value="todos">Todos los tipos</Select.Item>
						{#each Object.entries(TIPO_LABELS) as [k, v]}
							<Select.Item value={k}>{v}</Select.Item>
						{/each}
					</Select.Content>
				</Select.Root>
			</div>
		</Card.Header>
		<Card.Content>
			<Table.Root>
				<Table.Header>
					<Table.Row>
						<Table.Head>Tipo Discrepancia</Table.Head>
						<Table.Head>UUID CFDI</Table.Head>
						<Table.Head>Proveedor · RFC</Table.Head>
						<Table.Head>Concepto</Table.Head>
						<Table.Head class="text-right">Monto ERP</Table.Head>
						<Table.Head class="text-right">Monto SAT</Table.Head>
						<Table.Head class="text-right">Diferencia</Table.Head>
						<Table.Head>Fecha</Table.Head>
						<Table.Head>Estado</Table.Head>
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{#each filtradas as d (d.id)}
						<Table.Row>
							<Table.Cell>
								<Badge variant={TIPO_VARIANT[d.tipo]} class="text-xs whitespace-nowrap">{TIPO_LABELS[d.tipo]}</Badge>
							</Table.Cell>
							<Table.Cell class="font-mono text-xs text-muted-foreground">{d.uuid.slice(0, 18)}…</Table.Cell>
							<Table.Cell>
								<span class="text-sm font-medium">{d.proveedor}</span>
								<p class="font-mono text-xs text-muted-foreground">{d.rfc}</p>
							</Table.Cell>
							<Table.Cell class="text-sm">{d.concepto}</Table.Cell>
							<Table.Cell class="text-right tabular-nums text-sm">{d.montoERP ? '$' + d.montoERP.toLocaleString() : '—'}</Table.Cell>
							<Table.Cell class="text-right tabular-nums text-sm">{d.montoSAT ? '$' + d.montoSAT.toLocaleString() : '—'}</Table.Cell>
							<Table.Cell class="text-right tabular-nums text-sm {Math.abs(d.diferencia) > 0 ? 'text-destructive font-medium' : 'text-muted-foreground'}">
								{d.diferencia !== 0 ? (d.diferencia > 0 ? '+' : '') + '$' + d.diferencia.toLocaleString() : '—'}
							</Table.Cell>
							<Table.Cell class="text-muted-foreground text-xs">{d.fecha}</Table.Cell>
							<Table.Cell>
								<Badge variant={d.estado === 'aclarado' ? 'secondary' : d.estado === 'error' ? 'destructive' : 'outline'} class="capitalize">
									{d.estado}
								</Badge>
							</Table.Cell>
						</Table.Row>
					{/each}
				</Table.Body>
			</Table.Root>
		</Card.Content>
	</Card.Root>
</div>
