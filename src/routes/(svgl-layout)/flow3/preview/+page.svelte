<script module lang="ts">
	import { defineTransition } from '../flow3-nav';
	defineTransition('/flow3/preview', 'cover-v');
</script>

<script lang="ts">
	import PageHeader from '$lib/components/layout/pageHeader.svelte';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import * as Table from '$lib/components/ui/table';
	import { Progress } from '$lib/components/ui/progress';
	import StatCard from '$lib/tps/components/stat-card.svelte';
	import ArrowLeft from '@lucide/svelte/icons/arrow-left';
	import ChevronRight from '@lucide/svelte/icons/chevron-right';
	import Package from '@lucide/svelte/icons/package';
	import TriangleAlert from '@lucide/svelte/icons/triangle-alert';
	import ShoppingCart from '@lucide/svelte/icons/shopping-cart';
	import DollarSign from '@lucide/svelte/icons/dollar-sign';
	import Search from '@lucide/svelte/icons/search';
	import SlidersHorizontal from '@lucide/svelte/icons/sliders-horizontal';
	import { goto } from '$app/navigation';

	const articulos = [
		{ id: 'ART-001', sku: 'TH-M8-001', nombre: 'Tornillo hexagonal M8', categoria: 'Ferretería', stock: 1240, minimo: 500, status: 'Normal' },
		{ id: 'ART-002', sku: 'TS-M8-002', nombre: 'Tuerca de seguridad M8', categoria: 'Ferretería', stock: 82, minimo: 200, status: 'Crítico' },
		{ id: 'ART-003', sku: 'CT-12-003', nombre: 'Cable THHN #12', categoria: 'Eléctrico', stock: 340, minimo: 300, status: 'Bajo' },
		{ id: 'ART-004', sku: 'TG-1-004', nombre: 'Tubería galvanizada 1"', categoria: 'Plomería', stock: 95, minimo: 50, status: 'Normal' },
		{ id: 'ART-005', sku: 'SO-6013-005', nombre: 'Soldadura 6013 3/32"', categoria: 'Soldadura', stock: 18, minimo: 100, status: 'Crítico' },
		{ id: 'ART-006', sku: 'PE-GR-006', nombre: 'Pintura epóxica gris', categoria: 'Pintura', stock: 220, minimo: 100, status: 'Normal' },
	];

	const statusStyle: Record<string, string> = {
		Normal: 'bg-emerald-500/15 text-emerald-400',
		Bajo: 'bg-chart-4/15 text-chart-4',
		Crítico: 'bg-destructive/15 text-destructive',
	};

	const categorias = [
		{ cat: 'Ferretería', pct: 38, color: 'bg-chart-1' },
		{ cat: 'Eléctrico', pct: 24, color: 'bg-chart-2' },
		{ cat: 'Plomería', pct: 18, color: 'bg-chart-3' },
		{ cat: 'Soldadura', pct: 11, color: 'bg-chart-4' },
		{ cat: 'Pintura', pct: 9, color: 'bg-chart-5' },
	];
</script>

<PageHeader>
	<div class="flex items-center gap-2">
		<Button variant="ghost" size="sm" onclick={() => history.back()}>
			<ArrowLeft data-icon="inline-start" />
			Atrás
		</Button>
		<span class="text-muted-foreground text-sm">/</span>
		<h1 class="text-sm font-medium">Inventario</h1>
	</div>
	<div class="flex gap-2">
		<Button variant="outline" size="sm">
			<SlidersHorizontal data-icon="inline-start" />
			Filtrar
		</Button>
		<Button size="sm">
			<Search data-icon="inline-start" />
			Buscar
		</Button>
	</div>
</PageHeader>

<div class="flex flex-col gap-6 p-4 md:p-6">
	<!-- Encabezado -->
	<div>
		<h2 class="text-xl font-semibold">Panel de Inventario</h2>
		<p class="text-muted-foreground text-sm">Almacén General · Julio 2026</p>
	</div>

	<!-- KPIs -->
	<div
		class="grid grid-cols-2 gap-4 lg:grid-cols-4
		       **:data-[slot=card]:from-primary/5 **:data-[slot=card]:to-card
		       **:data-[slot=card]:bg-linear-to-t **:data-[slot=card]:shadow-xs
		       dark:**:data-[slot=card]:bg-card"
	>
		<StatCard label="Total artículos" value="1,847" subtitle="SKUs activos" icon={Package} />
		<StatCard
			label="Stock crítico"
			value="12"
			subtitle="Requieren reorden"
			icon={TriangleAlert}
			trend={{ value: '+3 hoy', positive: false }}
		/>
		<StatCard label="Órdenes en tránsito" value="8" subtitle="Pendientes recepción" icon={ShoppingCart} />
		<StatCard
			label="Valor en almacén"
			value="$4.2M"
			subtitle="MXN total estimado"
			icon={DollarSign}
			trend={{ value: '+2.1%', positive: true }}
		/>
	</div>

	<div class="grid gap-6 lg:grid-cols-3">
		<!-- Distribución por categoría -->
		<Card.Root>
			<Card.Header>
				<Card.Title>Por Categoría</Card.Title>
				<Card.Description>Distribución del inventario total</Card.Description>
			</Card.Header>
			<Card.Content class="flex flex-col gap-3">
				{#each categorias as item (item.cat)}
					<div class="flex flex-col gap-1.5">
						<div class="flex items-center justify-between text-sm">
							<div class="flex items-center gap-2">
								<span class="size-2 rounded-full {item.color}"></span>
								<span>{item.cat}</span>
							</div>
							<span class="text-muted-foreground tabular-nums">{item.pct}%</span>
						</div>
						<Progress value={item.pct} class="h-1.5" />
					</div>
				{/each}
			</Card.Content>
		</Card.Root>

		<!-- Alertas activas -->
		<Card.Root class="lg:col-span-2">
			<Card.Header>
				<Card.Title>Alertas Activas</Card.Title>
				<Card.Description>Materiales que requieren atención inmediata</Card.Description>
			</Card.Header>
			<Card.Content class="flex flex-col gap-2 p-0 pb-2">
				{#each articulos.filter((a) => a.status !== 'Normal') as a (a.id)}
					<a
						href="/flow3/preview-02"
						class="group mx-2 flex items-center justify-between gap-3 rounded-lg border border-transparent px-3 py-2.5 transition-colors hover:border-border hover:bg-muted/40"
					>
						<div class="flex items-center gap-3">
							<span
								class="inline-flex size-8 shrink-0 items-center justify-center rounded-lg
								{a.status === 'Crítico' ? 'bg-destructive/15' : 'bg-chart-4/15'}"
							>
								<TriangleAlert
									class="size-4 {a.status === 'Crítico' ? 'text-destructive' : 'text-chart-4'}"
								/>
							</span>
							<div>
								<p class="text-sm font-medium leading-tight">{a.nombre}</p>
								<p class="text-muted-foreground text-xs">
									Stock: <span class="tabular-nums font-medium">{a.stock}</span> / Mín:
									<span class="tabular-nums">{a.minimo}</span>
								</p>
							</div>
						</div>
						<div class="flex items-center gap-2">
							<span class="rounded-md px-2 py-0.5 text-xs font-medium {statusStyle[a.status]}">
								{a.status}
							</span>
							<ChevronRight class="text-muted-foreground size-4 transition-transform group-hover:translate-x-0.5" />
						</div>
					</a>
				{/each}
			</Card.Content>
		</Card.Root>
	</div>

	<!-- Tabla de artículos -->
	<Card.Root>
		<Card.Header>
			<div class="flex items-center justify-between">
				<div>
					<Card.Title>Todos los Artículos</Card.Title>
					<Card.Description>Movimiento en los últimos 7 días</Card.Description>
				</div>
				<Button variant="outline" size="sm" href="/flow3/preview-02">Ver todo</Button>
			</div>
		</Card.Header>
		<Card.Content class="p-0">
			<Table.Root>
				<Table.Header>
					<Table.Row>
						<Table.Head>Artículo</Table.Head>
						<Table.Head class="hidden sm:table-cell">Categoría</Table.Head>
						<Table.Head class="text-right">Stock</Table.Head>
						<Table.Head>Estatus</Table.Head>
						<Table.Head class="w-10"></Table.Head>
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{#each articulos as a (a.id)}
						<Table.Row class="cursor-pointer" onclick={() => goto('/flow3/preview-02')}>
							<Table.Cell>
								<p class="font-medium leading-tight">{a.nombre}</p>
								<p class="text-muted-foreground text-xs font-mono">{a.sku}</p>
							</Table.Cell>
							<Table.Cell class="text-muted-foreground hidden text-sm sm:table-cell">{a.categoria}</Table.Cell>
							<Table.Cell class="text-right tabular-nums text-sm font-medium">
								{a.stock.toLocaleString('es-MX')}
							</Table.Cell>
							<Table.Cell>
								<span class="rounded-md px-2 py-0.5 text-xs font-medium {statusStyle[a.status]}">
									{a.status}
								</span>
							</Table.Cell>
							<Table.Cell>
								<ChevronRight class="text-muted-foreground size-4" />
							</Table.Cell>
						</Table.Row>
					{/each}
				</Table.Body>
			</Table.Root>
		</Card.Content>
	</Card.Root>
</div>
