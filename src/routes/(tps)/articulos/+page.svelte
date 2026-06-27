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
	import Search from '@lucide/svelte/icons/search';
	import Filter from '@lucide/svelte/icons/filter';
	import ChevronUp from '@lucide/svelte/icons/chevron-up';
	import ChevronDown from '@lucide/svelte/icons/chevron-down';
	import ArrowUpDown from '@lucide/svelte/icons/arrow-up-down';
	import Download from '@lucide/svelte/icons/download';

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

<div class="flex flex-col gap-6">
	<!-- Header -->
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-foreground text-2xl font-bold">Catalogo de Articulos</h1>
			<p class="text-muted-foreground text-sm">{total} articulos en catalogo, {filtered.length} mostrados</p>
		</div>
		<div class="flex items-center gap-2">
			<button
				onclick={exportCSV}
				class="border-border bg-secondary text-secondary-foreground hover:bg-accent flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs transition-colors"
			>
				<Download class="h-3.5 w-3.5" /> Exportar CSV
			</button>
			<a
				href="/articulos/importar"
				class="border-border bg-secondary text-secondary-foreground hover:bg-accent flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs transition-colors"
			>
				Importar
			</a>
			<a
				href="/articulos/nuevo"
				class="bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors"
			>
				Nuevo Articulo
			</a>
		</div>
	</div>

	<!-- Completeness Dashboard -->
	<div class="grid grid-cols-2 gap-4 md:grid-cols-4">
		{#each [{ label: 'Con Proveedor', n: withSupplier, color: 'bg-chart-1', sub: `${withSupplier} de ${total}` }, { label: 'Con Precio', n: withPrice, color: 'bg-chart-2', sub: `${withPrice} de ${total}` }, { label: 'Con Lead Time', n: withLeadTime, color: 'bg-chart-4', sub: `${withLeadTime} de ${total}` }] as kpi (kpi.label)}
			<div class="border-border bg-card rounded-lg border p-3">
				<div class="mb-1.5 flex items-center justify-between">
					<span class="text-muted-foreground text-xs">{kpi.label}</span>
					<span class="text-card-foreground font-mono text-xs">{Math.round((kpi.n / total) * 100)}%</span>
				</div>
				<div class="bg-secondary h-1.5 rounded-full">
					<div class="{kpi.color} h-1.5 rounded-full transition-all" style="width: {(kpi.n / total) * 100}%"></div>
				</div>
				<p class="text-muted-foreground mt-1 text-[10px]">{kpi.sub}</p>
			</div>
		{/each}
		<div class="border-border bg-card rounded-lg border p-3">
			<div class="mb-1.5 flex items-center justify-between">
				<span class="text-muted-foreground text-xs">Completitud Promedio</span>
				<span class="text-card-foreground font-mono text-xs">{avgCompleteness}%</span>
			</div>
			<div class="bg-secondary h-1.5 rounded-full">
				<div class="bg-primary h-1.5 rounded-full transition-all" style="width: {avgCompleteness}%"></div>
			</div>
			<p class="text-muted-foreground mt-1 text-[10px]">{active} activos</p>
		</div>
	</div>

	<!-- Filters -->
	<div class="flex flex-wrap items-center gap-3">
		<div class="border-border bg-card flex max-w-sm min-w-[200px] flex-1 items-center gap-1.5 rounded-md border px-3 py-1.5">
			<Search class="text-muted-foreground h-3.5 w-3.5" />
			<input
				type="text"
				placeholder="Buscar por codigo, descripcion o proveedor..."
				bind:value={query}
				class="text-foreground placeholder:text-muted-foreground w-full border-none bg-transparent text-sm outline-none"
			/>
		</div>
		<div class="flex items-center gap-1.5">
			<Filter class="text-muted-foreground h-3.5 w-3.5" />
			<select
				bind:value={statusFilter}
				class="border-border bg-card text-foreground rounded-md border px-2 py-1.5 text-xs outline-none"
			>
				<option value="todos">Todos los estatus</option>
				{#each Object.entries(ARTICLE_STATUS_LABELS) as [k, v] (k)}
					<option value={k}>{v}</option>
				{/each}
			</select>
			<select
				bind:value={abcFilter}
				class="border-border bg-card text-foreground rounded-md border px-2 py-1.5 text-xs outline-none"
			>
				<option value="todos">Todas las clases</option>
				{#each Object.entries(ABC_LABELS) as [k, v] (k)}
					<option value={k}>{v}</option>
				{/each}
			</select>
			<select
				bind:value={groupFilter}
				class="border-border bg-card text-foreground rounded-md border px-2 py-1.5 text-xs outline-none"
			>
				<option value="todos">Todos los grupos</option>
				{#each ARTICLE_GROUPS as g (g)}
					<option value={g}>{g}</option>
				{/each}
			</select>
		</div>
	</div>

	<!-- Table -->
	<div class="border-border bg-card overflow-hidden rounded-lg border">
		<div class="overflow-x-auto">
			<table class="w-full text-sm">
				<thead>
					<tr class="border-border bg-secondary/50 border-b text-left">
						<th class="text-muted-foreground cursor-pointer px-4 py-2.5 text-xs font-medium select-none" onclick={() => toggleSort('code')}>
							<span class="flex items-center gap-1">Codigo
								{#if sortField !== 'code'}<ArrowUpDown class="h-3 w-3 opacity-30" />{:else if sortDir === 'asc'}<ChevronUp class="h-3 w-3" />{:else}<ChevronDown class="h-3 w-3" />{/if}
							</span>
						</th>
						<th class="text-muted-foreground cursor-pointer px-4 py-2.5 text-xs font-medium select-none" onclick={() => toggleSort('description')}>
							<span class="flex items-center gap-1">Descripcion
								{#if sortField !== 'description'}<ArrowUpDown class="h-3 w-3 opacity-30" />{:else if sortDir === 'asc'}<ChevronUp class="h-3 w-3" />{:else}<ChevronDown class="h-3 w-3" />{/if}
							</span>
						</th>
						<th class="text-muted-foreground px-4 py-2.5 text-xs font-medium">UdM</th>
						<th class="text-muted-foreground px-4 py-2.5 text-xs font-medium">Proveedor</th>
						<th class="text-muted-foreground cursor-pointer px-4 py-2.5 text-right text-xs font-medium select-none" onclick={() => toggleSort('price')}>
							<span class="flex items-center justify-end gap-1">Precio
								{#if sortField !== 'price'}<ArrowUpDown class="h-3 w-3 opacity-30" />{:else if sortDir === 'asc'}<ChevronUp class="h-3 w-3" />{:else}<ChevronDown class="h-3 w-3" />{/if}
							</span>
						</th>
						<th class="text-muted-foreground cursor-pointer px-4 py-2.5 text-right text-xs font-medium select-none" onclick={() => toggleSort('leadTimeDays')}>
							<span class="flex items-center justify-end gap-1">Lead Time
								{#if sortField !== 'leadTimeDays'}<ArrowUpDown class="h-3 w-3 opacity-30" />{:else if sortDir === 'asc'}<ChevronUp class="h-3 w-3" />{:else}<ChevronDown class="h-3 w-3" />{/if}
							</span>
						</th>
						<th class="text-muted-foreground px-4 py-2.5 text-xs font-medium">ABC</th>
						<th class="text-muted-foreground cursor-pointer px-4 py-2.5 text-xs font-medium select-none" onclick={() => toggleSort('status')}>
							<span class="flex items-center gap-1">Estatus
								{#if sortField !== 'status'}<ArrowUpDown class="h-3 w-3 opacity-30" />{:else if sortDir === 'asc'}<ChevronUp class="h-3 w-3" />{:else}<ChevronDown class="h-3 w-3" />{/if}
							</span>
						</th>
						<th class="text-muted-foreground cursor-pointer px-4 py-2.5 text-right text-xs font-medium select-none" onclick={() => toggleSort('completeness')}>
							<span class="flex items-center justify-end gap-1">Completitud
								{#if sortField !== 'completeness'}<ArrowUpDown class="h-3 w-3 opacity-30" />{:else if sortDir === 'asc'}<ChevronUp class="h-3 w-3" />{:else}<ChevronDown class="h-3 w-3" />{/if}
							</span>
						</th>
					</tr>
				</thead>
				<tbody>
					{#each filtered as article (article.id)}
						<tr class="border-border/50 hover:bg-secondary/30 border-b transition-colors">
							<td class="px-4 py-2">
								<a href="/articulos/{article.id}" class="text-primary font-mono text-xs hover:underline">{article.code}</a>
							</td>
							<td class="text-card-foreground max-w-[280px] truncate px-4 py-2">{article.description}</td>
							<td class="text-muted-foreground px-4 py-2 text-xs">{UDM_LABELS[article.udmBase]}</td>
							<td class="text-muted-foreground max-w-[150px] truncate px-4 py-2 text-xs">
								{#if article.supplierName}{article.supplierName}{:else}<span class="text-destructive">Sin proveedor</span>{/if}
							</td>
							<td class="text-card-foreground px-4 py-2 text-right font-mono text-xs">
								{#if article.price > 0}{formatCurrency(article.price, article.currency)}{:else}<span class="text-destructive">---</span>{/if}
							</td>
							<td class="text-card-foreground px-4 py-2 text-right font-mono text-xs">
								{#if article.leadTimeDays > 0}{article.leadTimeDays}d{:else}<span class="text-destructive">---</span>{/if}
							</td>
							<td class="px-4 py-2">
								<StatusBadge label={article.abcClass === 'sin_clasificar' ? '---' : article.abcClass} colorClass={ABC_COLORS[article.abcClass]} />
							</td>
							<td class="px-4 py-2">
								<StatusBadge label={ARTICLE_STATUS_LABELS[article.status]} colorClass={ARTICLE_STATUS_COLORS[article.status]} />
							</td>
							<td class="px-4 py-2">
								<div class="flex items-center justify-end gap-2">
									<div class="bg-secondary h-1.5 w-16 rounded-full">
										<div
											class={cn('h-1.5 rounded-full transition-all', article.completeness >= 80 ? 'bg-primary' : article.completeness >= 50 ? 'bg-chart-4' : 'bg-destructive')}
											style="width: {article.completeness}%"
										></div>
									</div>
									<span class="text-muted-foreground w-8 text-right font-mono text-xs">{article.completeness}%</span>
								</div>
							</td>
						</tr>
					{/each}
					{#if filtered.length === 0}
						<tr>
							<td colspan="9" class="text-muted-foreground px-4 py-8 text-center text-sm">
								No se encontraron articulos con los filtros seleccionados.
							</td>
						</tr>
					{/if}
				</tbody>
			</table>
		</div>
	</div>
</div>
