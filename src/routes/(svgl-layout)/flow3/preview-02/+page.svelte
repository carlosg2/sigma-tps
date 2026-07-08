<script module lang="ts">
	import { defineTransition } from '../flow3-nav';
	defineTransition('/flow3/preview-02', 'cover-v');
</script>

<script lang="ts">
	import PageHeader from '$lib/components/layout/pageHeader.svelte';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import * as Table from '$lib/components/ui/table';
	import { Progress } from '$lib/components/ui/progress';
	import { Separator } from '$lib/components/ui/separator';
	import { Badge } from '$lib/components/ui/badge';
	import ArrowLeft from '@lucide/svelte/icons/arrow-left';
	import Package from '@lucide/svelte/icons/package';
	import TrendingDown from '@lucide/svelte/icons/trending-down';
	import TrendingUp from '@lucide/svelte/icons/trending-up';
	import ShoppingCart from '@lucide/svelte/icons/shopping-cart';
	import ClipboardList from '@lucide/svelte/icons/clipboard-list';
	import RefreshCw from '@lucide/svelte/icons/refresh-cw';
	import Minus from '@lucide/svelte/icons/minus';
	import Pencil from '@lucide/svelte/icons/pencil';
	import AlertTriangle from '@lucide/svelte/icons/triangle-alert';
	import ChevronRight from '@lucide/svelte/icons/chevron-right';

	const articulo = {
		id: 'ART-002',
		sku: 'TS-M8-002',
		nombre: 'Tuerca de seguridad M8',
		categoria: 'Ferretería',
		unidad: 'pza',
		proveedor: 'Ferretería Industrial Norte S.A.',
		ubicacion: 'Pasillo B · Estante 3 · Nivel 2',
		stock: 82,
		minimo: 200,
		maximo: 800,
		precio: 3.45,
		ultimoMovimiento: '2026-07-07',
	};

	const movimientos = [
		{ fecha: '2026-07-07', tipo: 'Salida', cantidad: -50, referencia: 'REQ-2847', usuario: 'J. Martínez' },
		{ fecha: '2026-07-05', tipo: 'Entrada', cantidad: 200, referencia: 'OC-1193', usuario: 'Sistema' },
		{ fecha: '2026-07-03', tipo: 'Salida', cantidad: -120, referencia: 'REQ-2801', usuario: 'A. Torres' },
		{ fecha: '2026-07-01', tipo: 'Salida', cantidad: -80, referencia: 'REQ-2789', usuario: 'M. López' },
		{ fecha: '2026-06-28', tipo: 'Entrada', cantidad: 300, referencia: 'OC-1178', usuario: 'Sistema' },
		{ fecha: '2026-06-25', tipo: 'Ajuste', cantidad: -15, referencia: 'AJU-042', usuario: 'K. Ríos' },
	];

	const pctStock = Math.round((articulo.stock / articulo.maximo) * 100);

	const infoRows = [
		{ label: 'Categoría', value: articulo.categoria },
		{ label: 'Unidad', value: articulo.unidad },
		{ label: 'Precio unitario', value: `$${articulo.precio.toFixed(2)} MXN` },
		{ label: 'Ubicación', value: articulo.ubicacion },
		{ label: 'Proveedor', value: articulo.proveedor },
		{ label: 'Último movimiento', value: articulo.ultimoMovimiento },
	];
</script>

<PageHeader>
	<div class="flex items-center gap-2">
		<Button variant="ghost" size="sm" onclick={() => history.back()}>
			<ArrowLeft data-icon="inline-start" />
			Inventario
		</Button>
		<span class="text-muted-foreground text-sm">/</span>
		<h1 class="text-sm font-medium truncate max-w-40">{articulo.nombre}</h1>
	</div>
	<div class="flex shrink-0 gap-2">
		<Button variant="outline" size="sm">
			<Pencil data-icon="inline-start" />
			Ajustar
		</Button>
		<Button size="sm">
			<ShoppingCart data-icon="inline-start" />
			Reorden
		</Button>
	</div>
</PageHeader>

<div class="flex flex-col gap-6 p-4 md:p-6">
	<!-- Alerta de stock crítico -->
	<div
		class="flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3"
	>
		<AlertTriangle class="mt-0.5 size-4 shrink-0 text-destructive" />
		<div>
			<p class="text-sm font-medium text-destructive">Stock por debajo del mínimo</p>
			<p class="text-xs text-destructive/80 mt-0.5">
				El stock actual ({articulo.stock} pzas) está por debajo del mínimo requerido ({articulo.minimo}
				pzas). Se recomienda generar una orden de reabastecimiento.
			</p>
		</div>
	</div>

	<div class="grid gap-6 lg:grid-cols-3">
		<!-- Info del artículo -->
		<Card.Root class="lg:col-span-1">
			<Card.Header>
				<div class="flex items-center gap-3">
					<span
						class="inline-flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10"
					>
						<Package class="size-5 text-primary" />
					</span>
					<div class="min-w-0">
						<Card.Title class="text-base leading-tight">{articulo.nombre}</Card.Title>
						<Card.Description class="font-mono text-xs">{articulo.sku}</Card.Description>
					</div>
				</div>
			</Card.Header>
			<Card.Content class="flex flex-col gap-4">
				<!-- Stock visual -->
				<div class="flex flex-col gap-2">
					<div class="flex items-center justify-between text-sm">
						<span class="text-muted-foreground">Nivel de stock</span>
						<span class="tabular-nums font-semibold text-destructive">
							{articulo.stock} / {articulo.maximo}
						</span>
					</div>
					<Progress value={pctStock} class="h-2" />
					<div class="flex justify-between text-xs text-muted-foreground tabular-nums">
						<span>Mín: {articulo.minimo}</span>
						<span>{pctStock}% del máximo</span>
					</div>
				</div>

				<Separator />

				<!-- Datos del artículo -->
				<dl class="flex flex-col gap-2.5 text-sm">
					{#each infoRows as row (row.label)}
						<div class="flex justify-between gap-4">
							<dt class="text-muted-foreground shrink-0">{row.label}</dt>
							<dd class="text-right font-medium leading-tight">{row.value}</dd>
						</div>
					{/each}
				</dl>

				<Separator />

				<!-- Acciones rápidas -->
				<div class="flex flex-col gap-2">
					<p class="text-muted-foreground text-xs font-medium uppercase tracking-wide">Acciones</p>
					<div class="grid grid-cols-3 gap-2">
						<Button variant="outline" size="sm" class="flex-col h-auto py-2 gap-1">
							<TrendingDown class="size-4" />
							<span class="text-xs">Salida</span>
						</Button>
						<Button variant="outline" size="sm" class="flex-col h-auto py-2 gap-1">
							<TrendingUp class="size-4" />
							<span class="text-xs">Entrada</span>
						</Button>
						<Button variant="outline" size="sm" class="flex-col h-auto py-2 gap-1">
							<RefreshCw class="size-4" />
							<span class="text-xs">Ajuste</span>
						</Button>
					</div>
				</div>
			</Card.Content>
		</Card.Root>

		<!-- Historial de movimientos -->
		<Card.Root class="lg:col-span-2">
			<Card.Header>
				<div class="flex items-center gap-2">
					<ClipboardList class="text-muted-foreground size-4" />
					<Card.Title>Historial de Movimientos</Card.Title>
				</div>
				<Card.Description>Últimos 30 días · {movimientos.length} registros</Card.Description>
			</Card.Header>
			<Card.Content class="p-0">
				<Table.Root>
					<Table.Header>
						<Table.Row>
							<Table.Head>Fecha</Table.Head>
							<Table.Head>Tipo</Table.Head>
							<Table.Head class="text-right">Cantidad</Table.Head>
							<Table.Head>Referencia</Table.Head>
							<Table.Head class="hidden sm:table-cell">Usuario</Table.Head>
						</Table.Row>
					</Table.Header>
					<Table.Body>
						{#each movimientos as m, i (i)}
							<Table.Row>
								<Table.Cell class="text-muted-foreground text-sm tabular-nums">
									{m.fecha}
								</Table.Cell>
								<Table.Cell>
									<span class="inline-flex items-center gap-1.5 text-sm">
										{#if m.tipo === 'Entrada'}
											<TrendingUp class="size-3.5 text-emerald-400" />
											<span class="text-emerald-400 font-medium">Entrada</span>
										{:else if m.tipo === 'Salida'}
											<TrendingDown class="size-3.5 text-destructive" />
											<span class="text-destructive font-medium">Salida</span>
										{:else}
											<Minus class="size-3.5 text-chart-4" />
											<span class="text-chart-4 font-medium">Ajuste</span>
										{/if}
									</span>
								</Table.Cell>
								<Table.Cell
									class="text-right tabular-nums font-semibold {m.cantidad > 0
										? 'text-emerald-400'
										: 'text-destructive'}"
								>
									{m.cantidad > 0 ? '+' : ''}{m.cantidad}
								</Table.Cell>
								<Table.Cell class="font-mono text-sm">{m.referencia}</Table.Cell>
								<Table.Cell class="text-muted-foreground hidden text-sm sm:table-cell">
									{m.usuario}
								</Table.Cell>
							</Table.Row>
						{/each}
					</Table.Body>
				</Table.Root>
			</Card.Content>
			<Card.Footer class="border-t px-6 py-3">
				<Button variant="ghost" size="sm" class="text-muted-foreground">
					Ver historial completo
					<ChevronRight class="size-3.5" />
				</Button>
			</Card.Footer>
		</Card.Root>
	</div>
</div>
