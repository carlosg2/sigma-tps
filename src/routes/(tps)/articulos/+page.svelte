<script lang="ts">
	import { useStore } from '$lib/tps/store.svelte.js';
	import StatusBadge from '$lib/tps/components/status-badge.svelte';
	import {
		ARTICLE_STATUS_LABELS,
		ARTICLE_STATUS_COLORS,
		ABC_LABELS,
		ABC_COLORS,
		UDM_LABELS,
		ARTICLE_GROUPS
	} from '$lib/tps/constants.js';
	import { formatCurrency, searchMatch } from '$lib/tps/utils.js';
	import { cn } from '$lib/utils.js';
	import type { ArticleStatus, ABCClass } from '$lib/tps/types.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Table from '$lib/components/ui/table/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import * as Empty from '$lib/components/ui/empty/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Progress } from '$lib/components/ui/progress/index.js';
	import SearchIcon from '@lucide/svelte/icons/search';
	import ChevronUp from '@lucide/svelte/icons/chevron-up';
	import ChevronDown from '@lucide/svelte/icons/chevron-down';
	import ArrowUpDown from '@lucide/svelte/icons/arrow-up-down';
	import Download from '@lucide/svelte/icons/download';
	import FileUp from '@lucide/svelte/icons/file-up';
	import Plus from '@lucide/svelte/icons/plus';
	import PackageIcon from '@lucide/svelte/icons/package';

	type SortField = 'code' | 'description' | 'price' | 'completeness' | 'leadTimeDays' | 'status';
	type SortDir = 'asc' | 'desc';

	const store = useStore();
	const app = $derived(store.state);

	let query = $state('');
	let statusFilter = $state<ArticleStatus | 'todos'>('todos');
	let abcFilter = $state<ABCClass | 'todos'>('todos');
	let groupFilter = $state<string>('todos');
	let sortField = $state<SortField>('code');
	let sortDir = $state<SortDir>('asc');

	const filtered = $derived.by(() => {
		let items = app.articles;
		if (app.currentPlant !== 'todas') items = items.filter((a) => a.plant === app.currentPlant);
		if (query) items = items.filter((a) => searchMatch(`${a.code} ${a.description} ${a.supplierName}`, query));
		if (statusFilter !== 'todos') items = items.filter((a) => a.status === statusFilter);
		if (abcFilter !== 'todos') items = items.filter((a) => a.abcClass === abcFilter);
		if (groupFilter !== 'todos') items = items.filter((a) => a.group === groupFilter);
		items = [...items].sort((a, b) => {
			let cmp = 0;
			switch (sortField) {
				case 'code': cmp = a.code.localeCompare(b.code); break;
				case 'description': cmp = a.description.localeCompare(b.description); break;
				case 'price': cmp = a.price - b.price; break;
				case 'completeness': cmp = a.completeness - b.completeness; break;
				case 'leadTimeDays': cmp = a.leadTimeDays - b.leadTimeDays; break;
				case 'status': cmp = a.status.localeCompare(b.status); break;
			}
			return sortDir === 'asc' ? cmp : -cmp;
		});
		return items;
	});

	function toggleSort(field: SortField) {
		if (sortField === field) sortDir = sortDir === 'asc' ? 'desc' : 'asc';
		else {
			sortField = field;
			sortDir = 'asc';
		}
	}

	const total = $derived(app.articles.length);
	const active = $derived(app.articles.filter((a) => a.status === 'activo').length);
	const withSupplier = $derived(app.articles.filter((a) => a.supplierId).length);
	const withPrice = $derived(app.articles.filter((a) => a.price > 0).length);
	const withLeadTime = $derived(app.articles.filter((a) => a.leadTimeDays > 0).length);
	const avgCompleteness = $derived(
		Math.round(app.articles.reduce((s, a) => s + a.completeness, 0) / (total || 1))
	);

	const statusLabel = $derived(
		statusFilter === 'todos' ? 'Todos los estatus' : ARTICLE_STATUS_LABELS[statusFilter]
	);
	const abcLabel = $derived(abcFilter === 'todos' ? 'Todas las clases' : ABC_LABELS[abcFilter]);
	const groupLabel = $derived(groupFilter === 'todos' ? 'Todos los grupos' : groupFilter);

	const kpis = $derived([
		{ label: 'Con Proveedor', n: withSupplier },
		{ label: 'Con Precio', n: withPrice },
		{ label: 'Con Lead Time', n: withLeadTime }
	]);

	function exportCSV() {
		const headers = ['Codigo', 'Descripcion', 'Grupo', 'UdM', 'Proveedor', 'Precio', 'Lead Time', 'ABC', 'Status', 'Completitud'];
		const rows = filtered.map((a) => [a.code, a.description, a.group, UDM_LABELS[a.udmBase], a.supplierName, a.price, a.leadTimeDays, a.abcClass, a.status, a.completeness]);
		const csv = [headers, ...rows].map((r) => r.map((v) => `"${v}"`).join(',')).join('\n');
		const blob = new Blob([csv], { type: 'text/csv' });
		const url = URL.createObjectURL(blob);
		const link = document.createElement('a');
		link.href = url;
		link.download = 'articulos_tps.csv';
		link.click();
		URL.revokeObjectURL(url);
	}
</script>

<!-- Header -->
<div class="flex flex-wrap items-center justify-between gap-3">
	<p class="text-muted-foreground text-sm">{total} articulos en catalogo · {filtered.length} mostrados</p>
	<div class="flex items-center gap-2">
		<Button variant="outline" size="sm" onclick={exportCSV}>
			<Download data-icon="inline-start" /> Exportar CSV
		</Button>
		<Button href="/articulos/importar" variant="outline" size="sm">
			<FileUp data-icon="inline-start" /> Importar
		</Button>
		<Button href="/articulos/nuevo" size="sm">
			<Plus data-icon="inline-start" /> Nuevo Articulo
		</Button>
	</div>
</div>

<!-- Completeness KPIs -->
<div class="grid grid-cols-2 gap-4 md:grid-cols-4">
	{#each kpis as kpi (kpi.label)}
		<Card.Root>
			<Card.Header>
				<Card.Description>{kpi.label}</Card.Description>
				<Card.Title class="text-2xl font-semibold tabular-nums">
					{Math.round((kpi.n / total) * 100)}%
				</Card.Title>
			</Card.Header>
			<Card.Content>
				<Progress value={(kpi.n / total) * 100} max={100} />
				<p class="text-muted-foreground mt-2 text-xs">{kpi.n} de {total}</p>
			</Card.Content>
		</Card.Root>
	{/each}
	<Card.Root>
		<Card.Header>
			<Card.Description>Completitud Promedio</Card.Description>
			<Card.Title class="text-2xl font-semibold tabular-nums">{avgCompleteness}%</Card.Title>
		</Card.Header>
		<Card.Content>
			<Progress value={avgCompleteness} max={100} />
			<p class="text-muted-foreground mt-2 text-xs">{active} activos</p>
		</Card.Content>
	</Card.Root>
</div>

<!-- Table card -->
<Card.Root>
	<Card.Header>
		<Card.Title>Catalogo</Card.Title>
		<Card.Description>Busca y filtra los articulos del catalogo.</Card.Description>
	</Card.Header>
	<Card.Content class="flex flex-col gap-4">
		<!-- Filters -->
		<div class="flex flex-wrap items-center gap-2">
			<div class="relative w-full max-w-sm flex-1">
				<SearchIcon class="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
				<Input
					placeholder="Buscar por codigo, descripcion o proveedor..."
					bind:value={query}
					class="pl-8"
				/>
			</div>
			<Select.Root type="single" bind:value={statusFilter}>
				<Select.Trigger size="sm" class="w-44">{statusLabel}</Select.Trigger>
				<Select.Content>
					<Select.Item value="todos">Todos los estatus</Select.Item>
					{#each Object.entries(ARTICLE_STATUS_LABELS) as [k, v] (k)}
						<Select.Item value={k}>{v}</Select.Item>
					{/each}
				</Select.Content>
			</Select.Root>
			<Select.Root type="single" bind:value={abcFilter}>
				<Select.Trigger size="sm" class="w-44">{abcLabel}</Select.Trigger>
				<Select.Content>
					<Select.Item value="todos">Todas las clases</Select.Item>
					{#each Object.entries(ABC_LABELS) as [k, v] (k)}
						<Select.Item value={k}>{v}</Select.Item>
					{/each}
				</Select.Content>
			</Select.Root>
			<Select.Root type="single" bind:value={groupFilter}>
				<Select.Trigger size="sm" class="w-44">{groupLabel}</Select.Trigger>
				<Select.Content>
					<Select.Item value="todos">Todos los grupos</Select.Item>
					{#each ARTICLE_GROUPS as g (g)}
						<Select.Item value={g}>{g}</Select.Item>
					{/each}
				</Select.Content>
			</Select.Root>
		</div>

		<!-- Table -->
		<Table.Root>
			<Table.Header>
				<Table.Row>
					<Table.Head>
						<Button variant="ghost" size="sm" class="-ml-3 h-8" onclick={() => toggleSort('code')}>
							Codigo
							{#if sortField !== 'code'}<ArrowUpDown data-icon="inline-end" class="opacity-50" />{:else if sortDir === 'asc'}<ChevronUp data-icon="inline-end" />{:else}<ChevronDown data-icon="inline-end" />{/if}
						</Button>
					</Table.Head>
					<Table.Head>
						<Button variant="ghost" size="sm" class="-ml-3 h-8" onclick={() => toggleSort('description')}>
							Descripcion
							{#if sortField !== 'description'}<ArrowUpDown data-icon="inline-end" class="opacity-50" />{:else if sortDir === 'asc'}<ChevronUp data-icon="inline-end" />{:else}<ChevronDown data-icon="inline-end" />{/if}
						</Button>
					</Table.Head>
					<Table.Head>UdM</Table.Head>
					<Table.Head>Proveedor</Table.Head>
					<Table.Head class="text-right">
						<Button variant="ghost" size="sm" class="-mr-3 h-8" onclick={() => toggleSort('price')}>
							Precio
							{#if sortField !== 'price'}<ArrowUpDown data-icon="inline-end" class="opacity-50" />{:else if sortDir === 'asc'}<ChevronUp data-icon="inline-end" />{:else}<ChevronDown data-icon="inline-end" />{/if}
						</Button>
					</Table.Head>
					<Table.Head class="text-right">
						<Button variant="ghost" size="sm" class="-mr-3 h-8" onclick={() => toggleSort('leadTimeDays')}>
							Lead Time
							{#if sortField !== 'leadTimeDays'}<ArrowUpDown data-icon="inline-end" class="opacity-50" />{:else if sortDir === 'asc'}<ChevronUp data-icon="inline-end" />{:else}<ChevronDown data-icon="inline-end" />{/if}
						</Button>
					</Table.Head>
					<Table.Head>ABC</Table.Head>
					<Table.Head>
						<Button variant="ghost" size="sm" class="-ml-3 h-8" onclick={() => toggleSort('status')}>
							Estatus
							{#if sortField !== 'status'}<ArrowUpDown data-icon="inline-end" class="opacity-50" />{:else if sortDir === 'asc'}<ChevronUp data-icon="inline-end" />{:else}<ChevronDown data-icon="inline-end" />{/if}
						</Button>
					</Table.Head>
					<Table.Head class="text-right">
						<Button variant="ghost" size="sm" class="-mr-3 h-8" onclick={() => toggleSort('completeness')}>
							Completitud
							{#if sortField !== 'completeness'}<ArrowUpDown data-icon="inline-end" class="opacity-50" />{:else if sortDir === 'asc'}<ChevronUp data-icon="inline-end" />{:else}<ChevronDown data-icon="inline-end" />{/if}
						</Button>
					</Table.Head>
				</Table.Row>
			</Table.Header>
			<Table.Body>
				{#each filtered as article (article.id)}
					<Table.Row>
						<Table.Cell>
							<a href="/articulos/{article.id}" class="text-primary font-mono text-xs hover:underline">{article.code}</a>
						</Table.Cell>
						<Table.Cell class="max-w-70 truncate">{article.description}</Table.Cell>
						<Table.Cell class="text-muted-foreground text-xs">{UDM_LABELS[article.udmBase]}</Table.Cell>
						<Table.Cell class="text-muted-foreground max-w-37.5 truncate text-xs">
							{#if article.supplierName}{article.supplierName}{:else}<span class="text-destructive">Sin proveedor</span>{/if}
						</Table.Cell>
						<Table.Cell class="text-right font-mono text-xs tabular-nums">
							{#if article.price > 0}{formatCurrency(article.price, article.currency)}{:else}<span class="text-destructive">---</span>{/if}
						</Table.Cell>
						<Table.Cell class="text-right font-mono text-xs tabular-nums">
							{#if article.leadTimeDays > 0}{article.leadTimeDays}d{:else}<span class="text-destructive">---</span>{/if}
						</Table.Cell>
						<Table.Cell>
							<StatusBadge label={article.abcClass === 'sin_clasificar' ? '---' : article.abcClass} colorClass={ABC_COLORS[article.abcClass]} />
						</Table.Cell>
						<Table.Cell>
							<StatusBadge label={ARTICLE_STATUS_LABELS[article.status]} colorClass={ARTICLE_STATUS_COLORS[article.status]} />
						</Table.Cell>
						<Table.Cell>
							<div class="flex items-center justify-end gap-2">
								<Progress
									value={article.completeness}
									max={100}
									class={cn('h-1.5 w-16', article.completeness >= 80 ? '' : article.completeness >= 50 ? '*:data-[slot=progress-indicator]:bg-chart-4' : '*:data-[slot=progress-indicator]:bg-destructive')}
								/>
								<span class="text-muted-foreground w-8 text-right font-mono text-xs tabular-nums">{article.completeness}%</span>
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
						<PackageIcon />
					</Empty.Media>
					<Empty.Title>Sin resultados</Empty.Title>
					<Empty.Description>No se encontraron articulos con los filtros seleccionados.</Empty.Description>
				</Empty.Header>
			</Empty.Root>
		{/if}
	</Card.Content>
</Card.Root>
