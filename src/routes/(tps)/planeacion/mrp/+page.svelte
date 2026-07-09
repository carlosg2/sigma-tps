<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Table from '$lib/components/ui/table/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Progress } from '$lib/components/ui/progress/index.js';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import { toast } from 'svelte-sonner';
	import RefreshCw from '@lucide/svelte/icons/refresh-cw';
	import AlertTriangle from '@lucide/svelte/icons/triangle-alert';
	import CheckCircle from '@lucide/svelte/icons/check-circle';
	import FileSpreadsheet from '@lucide/svelte/icons/file-spreadsheet';
	import ShoppingCart from '@lucide/svelte/icons/shopping-cart';
	import Package from '@lucide/svelte/icons/package';

	type NecesidadMRP = {
		id: string; articulo: string; descripcion: string; unidad: string;
		requerido: number; enStock: number; enCompra: number; faltante: number;
		foliosAfectados: string[];
		accion: 'ok' | 'generar_req' | 'requerimiento_existente';
	};

	let ejecutando = $state(false);
	let ejecutado = $state(false);
	let filtroAccion = $state('todos');
	let busqueda = $state('');

	const necesidades: NecesidadMRP[] = [
		{ id: 'N-001', articulo: 'ACE-B6-6MM-1220', descripcion: 'Placa acero balístico 6mm B6 1220×2440', unidad: 'PZA', requerido: 48, enStock: 22, enCompra: 8, faltante: 18, foliosAfectados: ['OP-0891', 'OP-0893', 'OP-0897'], accion: 'generar_req' },
		{ id: 'N-002', articulo: 'CRST-B6-LAM-42', descripcion: 'Cristal laminado blindado 42mm delantera', unidad: 'PZA', requerido: 32, enStock: 31, enCompra: 4, faltante: 0, foliosAfectados: ['OP-0891', 'OP-0892'], accion: 'ok' },
		{ id: 'N-003', articulo: 'SELL-POLY-5MM', descripcion: 'Sellador poliuretano estructural 5mm', unidad: 'MT', requerido: 240, enStock: 85, enCompra: 60, faltante: 95, foliosAfectados: ['OP-0891','OP-0892','OP-0893','OP-0894','OP-0895'], accion: 'generar_req' },
		{ id: 'N-004', articulo: 'ACE-B4-4MM-600', descripcion: 'Placa acero balístico 4mm B4 600×1200', unidad: 'PZA', requerido: 156, enStock: 142, enCompra: 20, faltante: 0, foliosAfectados: ['OP-0894','OP-0896'], accion: 'ok' },
		{ id: 'N-005', articulo: 'ARNZ-12V-4CH', descripcion: 'Arnés eléctrico 12V 4 canales puertas', unidad: 'PZA', requerido: 28, enStock: 8, enCompra: 10, faltante: 10, foliosAfectados: ['OP-0892','OP-0895','OP-0897'], accion: 'generar_req' },
		{ id: 'N-006', articulo: 'TAP-INT-PREM-NEG', descripcion: 'Tapicería interior premium negro', unidad: 'JGO', requerido: 14, enStock: 14, enCompra: 0, faltante: 0, foliosAfectados: ['OP-0893','OP-0896'], accion: 'ok' },
		{ id: 'N-007', articulo: 'CRST-B6-LAT-6L', descripcion: 'Cristal blindado lateral B6 6 laminados', unidad: 'PZA', requerido: 84, enStock: 50, enCompra: 12, faltante: 22, foliosAfectados: ['OP-0891','OP-0892','OP-0893','OP-0897'], accion: 'requerimiento_existente' },
		{ id: 'N-008', articulo: 'GOM-DOOR-SEAL', descripcion: 'Goma sellado puerta blindada', unidad: 'MT', requerido: 420, enStock: 320, enCompra: 80, faltante: 20, foliosAfectados: ['OP-0894','OP-0895'], accion: 'generar_req' }
	];

	const filtradas = $derived(necesidades.filter(n => {
		if (filtroAccion !== 'todos' && n.accion !== filtroAccion) return false;
		if (busqueda && !n.articulo.toLowerCase().includes(busqueda.toLowerCase()) && !n.descripcion.toLowerCase().includes(busqueda.toLowerCase())) return false;
		return true;
	}));

	const resumen = $derived({
		ok: necesidades.filter(n => n.accion === 'ok').length,
		req: necesidades.filter(n => n.accion === 'generar_req').length,
		existente: necesidades.filter(n => n.accion === 'requerimiento_existente').length,
		totalFaltante: necesidades.reduce((s, n) => s + n.faltante, 0)
	});

	function ejecutarMRP() {
		ejecutando = true;
		setTimeout(() => { ejecutando = false; ejecutado = true; toast.success('MRP ejecutado', { description: `${necesidades.length} artículos analizados · ${resumen.req} requisiciones sugeridas · ${resumen.existente} requerimientos existentes` }); }, 2200);
	}

	function generarReqs() {
		toast.success('Requisiciones generadas', { description: `${resumen.req} requisiciones de compra creadas automáticamente desde MRP` });
	}

	function accionVariant(a: string): 'secondary' | 'destructive' | 'outline' {
		if (a === 'ok') return 'secondary';
		if (a === 'generar_req') return 'destructive';
		return 'outline';
	}
	function accionLabel(a: string) {
		if (a === 'ok') return 'Stock OK';
		if (a === 'generar_req') return 'Generar Requisición';
		return 'Req. Existente';
	}
</script>

<div class="flex flex-col gap-6">
	<div class="flex flex-wrap items-center justify-between gap-3">
		<div>
			<h2 class="text-xl font-semibold">Portal MRP — Explosión de LMAT</h2>
			<p class="text-muted-foreground text-sm">Cruce automático de requerimientos vs. inventario para ~300 OPs abiertas · Sin exportar a Excel</p>
		</div>
		<div class="flex items-center gap-2">
			<Badge variant="outline" class="font-mono">GAP-PLN-001</Badge>
			<Badge variant="outline" class="text-xs">298 OPs abiertas</Badge>
			<Button onclick={ejecutarMRP} disabled={ejecutando}>
				<RefreshCw class="mr-2 size-4 {ejecutando ? 'animate-spin' : ''}" />
				{ejecutando ? 'Ejecutando MRP...' : 'Ejecutar MRP'}
			</Button>
		</div>
	</div>

	<!-- Resumen -->
	{#if ejecutado}
		<div class="grid gap-4 sm:grid-cols-4">
			<Card.Root class="border-emerald-500/40">
				<Card.Header class="pb-2"><Card.Description>Artículos con Stock OK</Card.Description><Card.Title class="text-2xl text-emerald-500">{resumen.ok}</Card.Title></Card.Header>
			</Card.Root>
			<Card.Root class="border-destructive/40">
				<Card.Header class="pb-2"><Card.Description>Requisiciones Sugeridas</Card.Description><Card.Title class="text-2xl text-destructive">{resumen.req}</Card.Title></Card.Header>
			</Card.Root>
			<Card.Root class="border-yellow-500/40">
				<Card.Header class="pb-2"><Card.Description>Req. ya en Proceso</Card.Description><Card.Title class="text-2xl text-yellow-600">{resumen.existente}</Card.Title></Card.Header>
			</Card.Root>
			<Card.Root>
				<Card.Header class="pb-2"><Card.Description>Total Faltantes</Card.Description><Card.Title class="text-2xl">{resumen.totalFaltante}</Card.Title></Card.Header>
				<Card.Footer class="pt-0">
					<Button size="sm" class="w-full" onclick={generarReqs} disabled={resumen.req === 0}>
						<ShoppingCart class="mr-2 size-4" />Generar {resumen.req} Requisiciones
					</Button>
				</Card.Footer>
			</Card.Root>
		</div>
	{/if}

	<!-- Filtros -->
	<div class="flex flex-wrap items-center gap-3">
		<Input bind:value={busqueda} placeholder="Buscar artículo..." class="max-w-64" />
		<Select.Root type="single" bind:value={filtroAccion}>
			<Select.Trigger class="w-48">{filtroAccion === 'todos' ? 'Todas las acciones' : accionLabel(filtroAccion)}</Select.Trigger>
			<Select.Content>
				<Select.Item value="todos">Todas las acciones</Select.Item>
				<Select.Item value="ok">Stock OK</Select.Item>
				<Select.Item value="generar_req">Generar Requisición</Select.Item>
				<Select.Item value="requerimiento_existente">Req. Existente</Select.Item>
			</Select.Content>
		</Select.Root>
	</div>

	<!-- Tabla MRP -->
	<Card.Root>
		<Card.Content class="pt-4">
			<Table.Root>
				<Table.Header>
					<Table.Row>
						<Table.Head>Artículo</Table.Head>
						<Table.Head class="text-right">Requerido</Table.Head>
						<Table.Head class="text-right">En Stock</Table.Head>
						<Table.Head class="text-right">En Compra</Table.Head>
						<Table.Head class="text-right font-semibold">Faltante</Table.Head>
						<Table.Head>Folios Afectados</Table.Head>
						<Table.Head>Acción MRP</Table.Head>
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{#each filtradas as n (n.id)}
						<Table.Row class={n.faltante > 0 ? 'bg-destructive/3' : ''}>
							<Table.Cell>
								<p class="font-mono text-xs">{n.articulo}</p>
								<p class="text-muted-foreground text-xs">{n.descripcion}</p>
							</Table.Cell>
							<Table.Cell class="text-right tabular-nums">{n.requerido} {n.unidad}</Table.Cell>
							<Table.Cell class="text-right tabular-nums">{n.enStock}</Table.Cell>
							<Table.Cell class="text-right tabular-nums text-muted-foreground">{n.enCompra}</Table.Cell>
							<Table.Cell class="text-right tabular-nums font-bold {n.faltante > 0 ? 'text-destructive' : 'text-muted-foreground'}">{n.faltante > 0 ? n.faltante : '—'}</Table.Cell>
							<Table.Cell>
								<div class="flex flex-wrap gap-1">
									{#each n.foliosAfectados as f}
										<Badge variant="outline" class="font-mono text-[10px]">{f}</Badge>
									{/each}
								</div>
							</Table.Cell>
							<Table.Cell>
								<Badge variant={accionVariant(n.accion)} class="text-xs">{accionLabel(n.accion)}</Badge>
							</Table.Cell>
						</Table.Row>
					{/each}
				</Table.Body>
			</Table.Root>
		</Card.Content>
	</Card.Root>
</div>
