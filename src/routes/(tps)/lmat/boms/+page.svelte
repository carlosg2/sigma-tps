<script lang="ts">
	import { useStore } from '$lib/tps/store.svelte.js';
	import StatusBadge from '$lib/tps/components/status-badge.svelte';
	import StatCard from '$lib/tps/components/stat-card.svelte';
	import {
		BOM_STATUS_LABELS,
		ARMOR_LEVEL_LABELS,
		PLANT_LABELS,
		BOM_MATURITY_LABELS,
		BOM_MATURITY_COLORS
	} from '$lib/tps/constants.js';
	import { cn } from '$lib/utils.js';
	import type { BOMStatus, BOMMaturityStatus } from '$lib/tps/types.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Table from '$lib/components/ui/table/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import * as Empty from '$lib/components/ui/empty/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Progress } from '$lib/components/ui/progress/index.js';
	import FileStack from '@lucide/svelte/icons/file-stack';
	import Search from '@lucide/svelte/icons/search';
	import ArrowUpDown from '@lucide/svelte/icons/arrow-up-down';
	import ChevronUp from '@lucide/svelte/icons/chevron-up';
	import ChevronDown from '@lucide/svelte/icons/chevron-down';
	import Plus from '@lucide/svelte/icons/plus';
	import ArrowLeft from '@lucide/svelte/icons/arrow-left';

	type SortField =
		| 'specificationCode'
		| 'vehicleModel'
		| 'armorLevel'
		| 'version'
		| 'healthPercent'
		| 'components';
	type SortDir = 'asc' | 'desc';

	const store = useStore();
	const app = $derived(store.state);

	let query = $state('');
	let statusFilter = $state<BOMStatus | 'todos'>('todos');
	let maturityFilter = $state<BOMMaturityStatus | 'todos'>('todos');
	let sortField = $state<SortField>('specificationCode');
	let sortDir = $state<SortDir>('asc');

	const filtered = $derived.by(() => {
		let items = app.boms;
		if (app.currentPlant !== 'todas') items = items.filter((b) => b.plant === app.currentPlant);
		if (query)
			items = items.filter((b) =>
				`${b.specificationCode} ${b.vehicleModel}`.toLowerCase().includes(query.toLowerCase())
			);
		if (statusFilter !== 'todos') items = items.filter((b) => b.status === statusFilter);
		if (maturityFilter !== 'todos') items = items.filter((b) => b.maturityStatus === maturityFilter);

		return [...items].sort((a, b) => {
			let cmp = 0;
			switch (sortField) {
				case 'specificationCode': cmp = a.specificationCode.localeCompare(b.specificationCode); break;
				case 'vehicleModel': cmp = a.vehicleModel.localeCompare(b.vehicleModel); break;
				case 'armorLevel': cmp = a.armorLevel.localeCompare(b.armorLevel); break;
				case 'version': cmp = a.version - b.version; break;
				case 'healthPercent': cmp = a.healthPercent - b.healthPercent; break;
				case 'components': cmp = a.components.length - b.components.length; break;
			}
			return sortDir === 'asc' ? cmp : -cmp;
		});
	});

	function toggleSort(field: SortField) {
		if (sortField === field) sortDir = sortDir === 'asc' ? 'desc' : 'asc';
		else {
			sortField = field;
			sortDir = 'asc';
		}
	}

	const totalBOMs = $derived(app.boms.length);
	const released = $derived(app.boms.filter((b) => b.maturityStatus === 'liberado').length);
	const avgHealth = $derived(
		Math.round(app.boms.reduce((s, b) => s + b.healthPercent, 0) / (totalBOMs || 1))
	);
	const totalComponents = $derived(app.boms.reduce((s, b) => s + b.components.length, 0));

	const maturityLabel = $derived(
		maturityFilter === 'todos' ? 'Toda madurez' : BOM_MATURITY_LABELS[maturityFilter]
	);
	const statusLabel = $derived(
		statusFilter === 'todos' ? 'Todos los estatus' : BOM_STATUS_LABELS[statusFilter]
	);
</script>

<!-- Header -->
<div class="flex flex-wrap items-center justify-between gap-3">
	<div class="flex items-center gap-3">
		<Button href="/lmat" variant="outline" size="icon">
			<ArrowLeft />
		</Button>
		<p class="text-muted-foreground text-sm">{totalBOMs} especificaciones · {filtered.length} mostradas</p>
	</div>
	<div class="flex flex-wrap items-center gap-2">
		<Button href="/lmat/where-used" variant="outline" size="sm">Where-Used</Button>
		<Button href="/lmat/boms/cambio-masivo" variant="outline" size="sm">Cambio Masivo</Button>
		<Button href="/lmat/boms/importar" variant="outline" size="sm">Importar</Button>
		<Button href="/lmat/boms/nuevo" size="sm">
			<Plus data-icon="inline-start" /> Nuevo BOM
		</Button>
	</div>
</div>

<!-- Stats -->
<div class="grid grid-cols-2 gap-4 md:grid-cols-4">
	<StatCard label="Total BOMs" value={totalBOMs} subtitle="Especificaciones" icon={FileStack} />
	<StatCard label="Liberados para Serie" value={released} subtitle="Madurez liberada" />
	<StatCard label="Salud Promedio" value={`${avgHealth}%`} subtitle="Completitud BOMs" />
	<StatCard label="Componentes Totales" value={totalComponents} subtitle="Suma de partes" />
</div>

<!-- Table card -->
<Card.Root>
	<Card.Header>
		<Card.Title>Listas de Materiales</Card.Title>
		<Card.Description>Busca y filtra las listas de materiales.</Card.Description>
	</Card.Header>
	<Card.Content class="flex flex-col gap-4">
		<!-- Filters -->
		<div class="flex flex-wrap items-center gap-2">
			<div class="relative w-full max-w-sm flex-1">
				<Search class="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
				<Input placeholder="Buscar por especificacion o modelo..." bind:value={query} class="pl-8" />
			</div>
			<Select.Root type="single" bind:value={maturityFilter}>
				<Select.Trigger size="sm" class="w-44">{maturityLabel}</Select.Trigger>
				<Select.Content>
					<Select.Item value="todos">Toda madurez</Select.Item>
					{#each Object.entries(BOM_MATURITY_LABELS) as [k, v] (k)}
						<Select.Item value={k}>{v}</Select.Item>
					{/each}
				</Select.Content>
			</Select.Root>
			<Select.Root type="single" bind:value={statusFilter}>
				<Select.Trigger size="sm" class="w-44">{statusLabel}</Select.Trigger>
				<Select.Content>
					<Select.Item value="todos">Todos los estatus</Select.Item>
					{#each Object.entries(BOM_STATUS_LABELS) as [k, v] (k)}
						<Select.Item value={k}>{v}</Select.Item>
					{/each}
				</Select.Content>
			</Select.Root>
		</div>

		<!-- Table -->
		<Table.Root>
			<Table.Header>
				<Table.Row>
					<Table.Head>
						<Button variant="ghost" size="sm" class="-ml-3 h-8" onclick={() => toggleSort('specificationCode')}>
							Especificacion
							{#if sortField !== 'specificationCode'}<ArrowUpDown data-icon="inline-end" class="opacity-50" />{:else if sortDir === 'asc'}<ChevronUp data-icon="inline-end" />{:else}<ChevronDown data-icon="inline-end" />{/if}
						</Button>
					</Table.Head>
					<Table.Head>
						<Button variant="ghost" size="sm" class="-ml-3 h-8" onclick={() => toggleSort('vehicleModel')}>
							Modelo
							{#if sortField !== 'vehicleModel'}<ArrowUpDown data-icon="inline-end" class="opacity-50" />{:else if sortDir === 'asc'}<ChevronUp data-icon="inline-end" />{:else}<ChevronDown data-icon="inline-end" />{/if}
						</Button>
					</Table.Head>
					<Table.Head>Nivel</Table.Head>
					<Table.Head>Planta</Table.Head>
					<Table.Head class="text-center">
						<Button variant="ghost" size="sm" class="h-8" onclick={() => toggleSort('version')}>
							Ver.
							{#if sortField !== 'version'}<ArrowUpDown data-icon="inline-end" class="opacity-50" />{:else if sortDir === 'asc'}<ChevronUp data-icon="inline-end" />{:else}<ChevronDown data-icon="inline-end" />{/if}
						</Button>
					</Table.Head>
					<Table.Head class="text-center">
						<Button variant="ghost" size="sm" class="h-8" onclick={() => toggleSort('components')}>
							Comp.
							{#if sortField !== 'components'}<ArrowUpDown data-icon="inline-end" class="opacity-50" />{:else if sortDir === 'asc'}<ChevronUp data-icon="inline-end" />{:else}<ChevronDown data-icon="inline-end" />{/if}
						</Button>
					</Table.Head>
					<Table.Head>Madurez</Table.Head>
					<Table.Head>
						<Button variant="ghost" size="sm" class="-ml-3 h-8" onclick={() => toggleSort('healthPercent')}>
							Salud
							{#if sortField !== 'healthPercent'}<ArrowUpDown data-icon="inline-end" class="opacity-50" />{:else if sortDir === 'asc'}<ChevronUp data-icon="inline-end" />{:else}<ChevronDown data-icon="inline-end" />{/if}
						</Button>
					</Table.Head>
				</Table.Row>
			</Table.Header>
			<Table.Body>
				{#each filtered as bom (bom.id)}
					<Table.Row>
						<Table.Cell>
							<a href="/lmat/boms/{bom.id}" class="text-primary font-mono text-xs hover:underline">{bom.specificationCode}</a>
						</Table.Cell>
						<Table.Cell>{bom.vehicleModel}</Table.Cell>
						<Table.Cell class="text-muted-foreground text-xs">{ARMOR_LEVEL_LABELS[bom.armorLevel]}</Table.Cell>
						<Table.Cell class="text-muted-foreground text-xs">{PLANT_LABELS[bom.plant]}</Table.Cell>
						<Table.Cell class="text-center font-mono text-xs tabular-nums">v{bom.version}</Table.Cell>
						<Table.Cell class="text-center font-mono text-xs tabular-nums">{bom.components.length}</Table.Cell>
						<Table.Cell>
							<StatusBadge label={BOM_MATURITY_LABELS[bom.maturityStatus || 'en_desarrollo']} colorClass={BOM_MATURITY_COLORS[bom.maturityStatus || 'en_desarrollo']} />
						</Table.Cell>
						<Table.Cell>
							<div class="flex items-center gap-2">
								<Progress value={bom.healthPercent} max={100} class={cn('h-1.5 w-16', bom.healthPercent >= 80 ? '' : bom.healthPercent >= 50 ? '*:data-[slot=progress-indicator]:bg-chart-4' : '*:data-[slot=progress-indicator]:bg-destructive')} />
								<span class="text-muted-foreground w-8 text-right font-mono text-xs tabular-nums">{bom.healthPercent}%</span>
							</div>
						</Table.Cell>
					</Table.Row>
				{/each}
			</Table.Body>
		</Table.Root>

		{#if filtered.length === 0}
			<Empty.Root class="border-0">
				<Empty.Header>
					<Empty.Media variant="icon">
						<FileStack />
					</Empty.Media>
					<Empty.Title>Sin resultados</Empty.Title>
					<Empty.Description>No se encontraron BOMs con los filtros seleccionados.</Empty.Description>
				</Empty.Header>
			</Empty.Root>
		{/if}
	</Card.Content>
</Card.Root>
