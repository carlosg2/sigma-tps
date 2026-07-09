<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Table from '$lib/components/ui/table/index.js';
	import * as Tabs from '$lib/components/ui/tabs/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { toast } from 'svelte-sonner';
	import Search from '@lucide/svelte/icons/search';
	import Package from '@lucide/svelte/icons/package';
	import Scissors from '@lucide/svelte/icons/scissors';
	import RefreshCw from '@lucide/svelte/icons/refresh-cw';
	import FileSpreadsheet from '@lucide/svelte/icons/file-spreadsheet';
	import CheckCircle from '@lucide/svelte/icons/check-circle';

	type Remanente = {
		id: string; codigo: string; dimX: number; dimY: number; espesor: string;
		tipoAcero: string; costoUnitario: number; folio: string; programa: string; fecha: string;
		estado: 'disponible' | 'reservado' | 'agotado';
	};

	type CorteNesting = {
		id: string; programa: string; placa: string; tipoAcero: string;
		dimX: number; dimY: number; espesor: string; folio: string; vin: string;
		piezas: number; aprovechamiento: number; costoPlaca: number; fecha: string;
		remanentes: number;
	};

	const nesting: CorteNesting[] = [
		{ id: 'NC-001', programa: 'CORTE-SUBURBAN-2024-B6-R04', placa: 'PL-2025-0412', tipoAcero: 'Acero Hardox 500 6mm', dimX: 2440, dimY: 1220, espesor: '6mm', folio: 'OP-2025-0891', vin: 'VIN-P1-0891', piezas: 18, aprovechamiento: 82, costoPlaca: 48_400, fecha: '2025-06-18', remanentes: 2 },
		{ id: 'NC-002', programa: 'CORTE-TAHOE-2023-B6-R02', placa: 'PL-2025-0413', tipoAcero: 'Acero Hardox 500 6mm', dimX: 2440, dimY: 1220, espesor: '6mm', folio: 'OP-2025-0892', vin: 'VIN-P1-0892', piezas: 14, aprovechamiento: 74, costoPlaca: 48_400, fecha: '2025-06-19', remanentes: 3 },
		{ id: 'NC-003', programa: 'CORTE-PISO-B4-R01', placa: 'PL-2025-0415', tipoAcero: 'Acero AR400 4mm', dimX: 1200, dimY: 600, espesor: '4mm', folio: 'OP-2025-0893', vin: 'VIN-P1-0893', piezas: 8, aprovechamiento: 91, costoPlaca: 18_200, fecha: '2025-06-20', remanentes: 1 },
		{ id: 'NC-004', programa: 'CORTE-SUBURBAN-2024-B6-R04', placa: 'PL-2025-0418', tipoAcero: 'Acero Hardox 500 6mm', dimX: 2440, dimY: 1220, espesor: '6mm', folio: 'OP-2025-0891', vin: 'VIN-P1-0891', piezas: 12, aprovechamiento: 78, costoPlaca: 48_400, fecha: '2025-06-21', remanentes: 2 }
	];

	const remanentes: Remanente[] = [
		{ id: 'R-001', codigo: 'REM-6MM-1100x800-001', dimX: 1100, dimY: 800, espesor: '6mm', tipoAcero: 'Hardox 500', costoUnitario: 12_100, folio: 'OP-2025-0891', programa: 'CORTE-SUBURBAN-2024-B6-R04', fecha: '2025-06-18', estado: 'disponible' },
		{ id: 'R-002', codigo: 'REM-6MM-950x620-002', dimX: 950, dimY: 620, espesor: '6mm', tipoAcero: 'Hardox 500', costoUnitario: 8_700, folio: 'OP-2025-0891', programa: 'CORTE-SUBURBAN-2024-B6-R04', fecha: '2025-06-18', estado: 'reservado' },
		{ id: 'R-003', codigo: 'REM-6MM-1200x700-003', dimX: 1200, dimY: 700, espesor: '6mm', tipoAcero: 'Hardox 500', costoUnitario: 14_200, folio: 'OP-2025-0892', programa: 'CORTE-TAHOE-2023-B6-R02', fecha: '2025-06-19', estado: 'disponible' },
		{ id: 'R-004', codigo: 'REM-4MM-800x400-004', dimX: 800, dimY: 400, espesor: '4mm', tipoAcero: 'AR400', costoUnitario: 3_640, folio: 'OP-2025-0893', programa: 'CORTE-PISO-B4-R01', fecha: '2025-06-20', estado: 'disponible' },
		{ id: 'R-005', codigo: 'REM-6MM-1050x550-005', dimX: 1050, dimY: 550, espesor: '6mm', tipoAcero: 'Hardox 500', costoUnitario: 9_200, folio: 'OP-2025-0891', programa: 'CORTE-SUBURBAN-2024-B6-R04', fecha: '2025-06-21', estado: 'disponible' }
	];

	let busqueda = $state('');
	const filtNesting = $derived(nesting.filter(n => !busqueda || n.vin.includes(busqueda) || n.programa.toLowerCase().includes(busqueda.toLowerCase())));

	const totalCostoRecuperado = $derived(remanentes.filter(r => r.estado === 'disponible').reduce((s, r) => s + r.costoUnitario, 0));
	const avgAprovechamiento = Math.round(nesting.reduce((s, n) => s + n.aprovechamiento, 0) / nesting.length);

	function reservar(id: string) {
		toast.success('Remanente reservado', { description: `${id} asignado al programa de corte activo` });
	}
</script>

<div class="flex flex-col gap-6">
	<div class="flex flex-wrap items-center justify-between gap-3">
		<div>
			<h2 class="text-xl font-semibold">Control de Nesting y Remanentes de Acero</h2>
			<p class="text-muted-foreground text-sm">Consumo real por placa · Retazos reusables · Trazabilidad VIN · Recuperación de costo</p>
		</div>
		<Badge variant="outline" class="font-mono">GAP-PRD-002</Badge>
	</div>

	<!-- Métricas -->
	<div class="grid gap-4 sm:grid-cols-3">
		<Card.Root><Card.Header class="pb-2"><Card.Description>Aprovechamiento Promedio</Card.Description><Card.Title class="text-3xl tabular-nums {avgAprovechamiento >= 80 ? 'text-emerald-500' : 'text-yellow-500'}">{avgAprovechamiento}%</Card.Title></Card.Header><Card.Content><p class="text-muted-foreground text-xs">Meta ≥ 80% por programa de corte</p></Card.Content></Card.Root>
		<Card.Root><Card.Header class="pb-2"><Card.Description>Remanentes Disponibles</Card.Description><Card.Title class="text-3xl tabular-nums">{remanentes.filter(r => r.estado === 'disponible').length}</Card.Title></Card.Header><Card.Content><p class="text-muted-foreground text-xs">Retazos reutilizables en almacén</p></Card.Content></Card.Root>
		<Card.Root><Card.Header class="pb-2"><Card.Description>Costo Recuperado</Card.Description><Card.Title class="text-3xl tabular-nums">${(totalCostoRecuperado/1000).toFixed(1)}k</Card.Title></Card.Header><Card.Content><p class="text-muted-foreground text-xs">Valor proporcional en remanentes disponibles</p></Card.Content></Card.Root>
	</div>

	<Tabs.Root value="nesting">
		<Tabs.List>
			<Tabs.Trigger value="nesting"><Scissors class="mr-2 size-4" />Programas de Corte</Tabs.Trigger>
			<Tabs.Trigger value="remanentes"><Package class="mr-2 size-4" />Remanentes en Almacén</Tabs.Trigger>
		</Tabs.List>

		<Tabs.Content value="nesting" class="mt-4">
			<div class="mb-3 relative max-w-sm">
				<Search class="text-muted-foreground absolute left-3 top-1/2 size-4 -translate-y-1/2" />
				<Input bind:value={busqueda} placeholder="Buscar por VIN o programa..." class="pl-9" />
			</div>
			<Card.Root>
				<Card.Content class="pt-4">
					<Table.Root>
						<Table.Header>
							<Table.Row>
								<Table.Head>Programa de Corte</Table.Head>
								<Table.Head>Placa</Table.Head>
								<Table.Head>Material</Table.Head>
								<Table.Head>VIN / Folio</Table.Head>
								<Table.Head class="text-right">Piezas</Table.Head>
								<Table.Head class="text-right">Aprovechamiento</Table.Head>
								<Table.Head class="text-right">Costo Placa</Table.Head>
								<Table.Head class="text-right">Remanentes</Table.Head>
								<Table.Head>Fecha</Table.Head>
							</Table.Row>
						</Table.Header>
						<Table.Body>
							{#each filtNesting as n (n.id)}
								<Table.Row>
									<Table.Cell class="font-mono text-xs">{n.programa.slice(0,30)}…</Table.Cell>
									<Table.Cell class="font-mono text-xs text-muted-foreground">{n.placa}</Table.Cell>
									<Table.Cell class="text-xs">{n.tipoAcero}</Table.Cell>
									<Table.Cell>
										<p class="font-mono text-xs">{n.vin}</p>
										<p class="text-muted-foreground text-xs">{n.folio}</p>
									</Table.Cell>
									<Table.Cell class="text-right tabular-nums">{n.piezas}</Table.Cell>
									<Table.Cell class="text-right tabular-nums font-medium {n.aprovechamiento >= 80 ? 'text-emerald-600' : 'text-yellow-600'}">{n.aprovechamiento}%</Table.Cell>
									<Table.Cell class="text-right tabular-nums text-sm">${n.costoPlaca.toLocaleString()}</Table.Cell>
									<Table.Cell class="text-right tabular-nums">{n.remanentes}</Table.Cell>
									<Table.Cell class="text-muted-foreground text-xs">{n.fecha}</Table.Cell>
								</Table.Row>
							{/each}
						</Table.Body>
					</Table.Root>
				</Card.Content>
			</Card.Root>
		</Tabs.Content>

		<Tabs.Content value="remanentes" class="mt-4">
			<Card.Root>
				<Card.Content class="pt-4">
					<Table.Root>
						<Table.Header>
							<Table.Row>
								<Table.Head>Código Remanente</Table.Head>
								<Table.Head>Material / Espesor</Table.Head>
								<Table.Head>Dimensiones (mm)</Table.Head>
								<Table.Head>Origen (Folio)</Table.Head>
								<Table.Head class="text-right">Costo Proporcional</Table.Head>
								<Table.Head>Fecha</Table.Head>
								<Table.Head>Estado</Table.Head>
								<Table.Head></Table.Head>
							</Table.Row>
						</Table.Header>
						<Table.Body>
							{#each remanentes as r (r.id)}
								<Table.Row>
									<Table.Cell class="font-mono text-xs">{r.codigo}</Table.Cell>
									<Table.Cell class="text-xs">{r.tipoAcero} {r.espesor}</Table.Cell>
									<Table.Cell class="tabular-nums text-xs">{r.dimX} × {r.dimY}</Table.Cell>
									<Table.Cell class="font-mono text-xs text-muted-foreground">{r.folio}</Table.Cell>
									<Table.Cell class="text-right tabular-nums font-medium">${r.costoUnitario.toLocaleString()}</Table.Cell>
									<Table.Cell class="text-muted-foreground text-xs">{r.fecha}</Table.Cell>
									<Table.Cell>
										<Badge variant={r.estado === 'disponible' ? 'secondary' : r.estado === 'reservado' ? 'outline' : 'destructive'} class="capitalize">{r.estado}</Badge>
									</Table.Cell>
									<Table.Cell>
										{#if r.estado === 'disponible'}
											<Button size="sm" variant="outline" onclick={() => reservar(r.id)}>Usar en corte</Button>
										{/if}
									</Table.Cell>
								</Table.Row>
							{/each}
						</Table.Body>
					</Table.Root>
				</Card.Content>
			</Card.Root>
		</Tabs.Content>
	</Tabs.Root>
</div>
