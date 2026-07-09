<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Table from '$lib/components/ui/table/index.js';
	import * as Tabs from '$lib/components/ui/tabs/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import FileSpreadsheet from '@lucide/svelte/icons/file-spreadsheet';
	import RefreshCw from '@lucide/svelte/icons/refresh-cw';
	import CheckCircle from '@lucide/svelte/icons/check-circle';

	let periodo = $state('2025-06');
	const periodos = ['2025-01','2025-02','2025-03','2025-04','2025-05','2025-06'];

	type LineaER = { cuenta: string; descripcion: string; interno: number; externo: number; diferencia: number };

	const lineasInterno: LineaER[] = [
		{ cuenta: '4100', descripcion: 'Ventas Blindaje', interno: 18_420_000, externo: 18_420_000, diferencia: 0 },
		{ cuenta: '4200', descripcion: 'Ventas Rentas', interno: 3_280_000, externo: 3_280_000, diferencia: 0 },
		{ cuenta: '4300', descripcion: 'Ventas Taller', interno: 1_640_000, externo: 1_640_000, diferencia: 0 },
		{ cuenta: '—', descripcion: 'Total Ingresos', interno: 23_340_000, externo: 23_340_000, diferencia: 0 },
		{ cuenta: '5100', descripcion: 'Costo Materiales Blindaje', interno: -9_210_000, externo: -9_210_000, diferencia: 0 },
		{ cuenta: '5200', descripcion: 'Mano de Obra Directa', interno: -3_840_000, externo: -3_840_000, diferencia: 0 },
		{ cuenta: '5300', descripcion: 'Gastos Indirectos Fabricación', interno: -1_680_000, externo: -1_680_000, diferencia: 0 },
		{ cuenta: '—', descripcion: 'Utilidad Bruta', interno: 8_610_000, externo: 8_610_000, diferencia: 0 },
		{ cuenta: '6100', descripcion: 'Gastos Admin · CC-Administración', interno: -820_000, externo: -0, diferencia: 820_000 },
		{ cuenta: '6110', descripcion: 'Gastos Admin · CC-Operaciones', interno: -460_000, externo: -0, diferencia: 460_000 },
		{ cuenta: '6100E', descripcion: 'Gastos Administración (agrupado)', interno: 0, externo: -1_280_000, diferencia: -1_280_000 },
		{ cuenta: '6200', descripcion: 'Gastos Ventas · CC-Comercial', interno: -680_000, externo: 0, diferencia: 680_000 },
		{ cuenta: '6200E', descripcion: 'Gastos Ventas (agrupado)', interno: 0, externo: -680_000, diferencia: -680_000 },
		{ cuenta: '7100', descripcion: 'Intereses Bancarios', interno: -142_000, externo: -142_000, diferencia: 0 },
		{ cuenta: '—', descripcion: 'Utilidad Antes de Impuestos', interno: 7_088_000, externo: 6_508_000, diferencia: 580_000 },
		{ cuenta: '8100', descripcion: 'ISR Causado', interno: -2_126_400, externo: -1_952_400, diferencia: -174_000 },
		{ cuenta: '—', descripcion: 'Utilidad Neta', interno: 4_961_600, externo: 4_555_600, diferencia: 406_000 }
	];

	const totales = lineasInterno.filter(l => l.cuenta === '—');
	const reconciliacion = lineasInterno.find(l => l.descripcion === 'Utilidad Neta')!;
	const diff = reconciliacion.diferencia;

	function fmt(v: number) {
		const abs = Math.abs(v);
		const str = abs.toLocaleString('es-MX', { minimumFractionDigits: 0 });
		return v < 0 ? `(${str})` : str;
	}
	function rowClass(l: LineaER) {
		if (l.cuenta === '—') return 'font-bold bg-muted/40';
		return '';
	}
</script>

<div class="flex flex-col gap-6">
	<div class="flex flex-wrap items-center justify-between gap-3">
		<div>
			<h2 class="text-xl font-semibold">Doble Estado de Resultados</h2>
			<p class="text-muted-foreground text-sm">Interno (por centros de costo) y Externo (estructura SAT/bancos) generados simultáneamente</p>
		</div>
		<div class="flex items-center gap-2">
			<Badge variant="outline" class="font-mono">GAP-CON-003</Badge>
			<Select.Root type="single" bind:value={periodo}>
				<Select.Trigger class="w-36">{periodo}</Select.Trigger>
				<Select.Content>
					{#each periodos as p}<Select.Item value={p}>{p}</Select.Item>{/each}
				</Select.Content>
			</Select.Root>
			<Button variant="outline" size="sm"><FileSpreadsheet class="mr-2 size-4" />Exportar PDF</Button>
		</div>
	</div>

	<!-- Reconciliación -->
	<Card.Root class={diff === 0 ? 'border-emerald-500/50' : 'border-yellow-500/50'}>
		<Card.Content class="flex items-center gap-4 pt-4">
			<CheckCircle class="size-5 {diff === 0 ? 'text-emerald-500' : 'text-yellow-500'}" />
			<div>
				<p class="text-sm font-medium">Reconciliación Interno ↔ Externo</p>
				<p class="text-muted-foreground text-xs">
					{#if diff === 0}
						Ambos estados son consistentes. Diferencia: $0
					{:else}
						Diferencia de ${diff.toLocaleString()} — revisar reclasificaciones de gastos por CC
					{/if}
				</p>
			</div>
		</Card.Content>
	</Card.Root>

	<!-- ER comparativo -->
	<Card.Root>
		<Card.Header>
			<Card.Title class="text-sm">Estado de Resultados · {periodo}</Card.Title>
			<Card.Description>Cifras en MXN. Interno: desglosado por centro de costo. Externo: agrupado por cuentas estándar SAT.</Card.Description>
		</Card.Header>
		<Card.Content>
			<Table.Root>
				<Table.Header>
					<Table.Row>
						<Table.Head class="w-20">Cuenta</Table.Head>
						<Table.Head>Descripción</Table.Head>
						<Table.Head class="text-right">Interno (MXN)</Table.Head>
						<Table.Head class="text-right">Externo (MXN)</Table.Head>
						<Table.Head class="text-right">Diferencia</Table.Head>
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{#each lineasInterno as l (l.cuenta + l.descripcion)}
						<Table.Row class={rowClass(l)}>
							<Table.Cell class="font-mono text-xs">{l.cuenta}</Table.Cell>
							<Table.Cell class="text-sm">{l.descripcion}</Table.Cell>
							<Table.Cell class="text-right tabular-nums {l.interno < 0 ? 'text-destructive' : ''}">
								{#if l.interno !== 0}{fmt(l.interno)}{:else}—{/if}
							</Table.Cell>
							<Table.Cell class="text-right tabular-nums {l.externo < 0 ? 'text-destructive' : ''}">
								{#if l.externo !== 0}{fmt(l.externo)}{:else}—{/if}
							</Table.Cell>
							<Table.Cell class="text-right tabular-nums text-muted-foreground text-xs">
								{#if l.diferencia !== 0}<span class={l.diferencia > 0 ? 'text-yellow-600' : 'text-yellow-600'}>{fmt(l.diferencia)}</span>{:else}✓{/if}
							</Table.Cell>
						</Table.Row>
					{/each}
				</Table.Body>
			</Table.Root>
		</Card.Content>
	</Card.Root>
</div>
