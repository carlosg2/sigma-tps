<script lang="ts">
	import { useStore } from '$lib/tps/store.svelte.js';
	import { BOM_STATUS_LABELS, ARMOR_LEVEL_LABELS } from '$lib/tps/constants.js';
	import { generateId } from '$lib/tps/utils.js';
	import ArrowLeft from '@lucide/svelte/icons/arrow-left';
	import Search from '@lucide/svelte/icons/search';
	import ArrowRightLeft from '@lucide/svelte/icons/arrow-right-left';
	import AlertTriangle from '@lucide/svelte/icons/triangle-alert';
	import CheckCircle2 from '@lucide/svelte/icons/circle-check-big';

	const store = useStore();
	const app = $derived(store.state);

	let oldQuery = $state('');
	let newQuery = $state('');
	let oldArticleId = $state<string | null>(null);
	let newArticleId = $state<string | null>(null);
	let selectedBomIds = $state<string[]>([]);
	let reason = $state('');
	let applied = $state(false);

	function searchArticles(q: string) {
		if (q.length < 2) return [];
		return app.articles
			.filter((a) => `${a.code} ${a.description}`.toLowerCase().includes(q.toLowerCase()))
			.slice(0, 8);
	}

	const affectedBOMs = $derived.by(() => {
		if (!oldArticleId) return [];
		return app.boms.filter((b) => b.components.some((c) => c.articleId === oldArticleId));
	});

	const oldArticle = $derived(app.articles.find((a) => a.id === oldArticleId));
	const newArticle = $derived(app.articles.find((a) => a.id === newArticleId));

	function toggleBom(id: string) {
		selectedBomIds = selectedBomIds.includes(id)
			? selectedBomIds.filter((b) => b !== id)
			: [...selectedBomIds, id];
	}

	function selectAll() {
		selectedBomIds = affectedBOMs.map((b) => b.id);
	}
	function deselectAll() {
		selectedBomIds = [];
	}

	function applyChange() {
		if (!oldArticleId || !newArticleId || selectedBomIds.length === 0 || !reason.trim()) return;
		store.dispatch({
			type: 'MASS_CHANGE_COMPONENT',
			payload: { oldArticleId, newArticleId, bomIds: selectedBomIds, reason: reason.trim() }
		});
		store.dispatch({
			type: 'ADD_AUDIT_LOG',
			payload: {
				id: generateId(),
				userId: app.currentUser.id,
				userName: app.currentUser.name,
				entity: 'BOM',
				entityId: 'mass-change',
				action: 'cambio_masivo',
				field: 'componente',
				oldValue: oldArticle?.code || '',
				newValue: `${newArticle?.code} en ${selectedBomIds.length} BOMs`,
				timestamp: new Date().toISOString()
			}
		});
		applied = true;
	}

	function reset() {
		applied = false;
		oldArticleId = null;
		newArticleId = null;
		selectedBomIds = [];
		reason = '';
		oldQuery = '';
		newQuery = '';
	}
</script>

{#if applied}
	<div class="mx-auto flex max-w-lg flex-col items-center justify-center gap-4 py-20 text-center">
		<CheckCircle2 class="text-primary h-12 w-12" />
		<h2 class="text-foreground text-lg font-semibold">Cambio masivo aplicado</h2>
		<p class="text-muted-foreground text-sm">
			Se reemplazo <span class="text-primary font-mono">{oldArticle?.code}</span> por
			<span class="text-primary font-mono">{newArticle?.code}</span> en
			{selectedBomIds.length} BOMs. Se creo una nueva revision en cada BOM afectado.
		</p>
		<div class="flex gap-2">
			<a href="/lmat/boms" class="bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-4 py-2 text-sm font-medium">Ver BOMs</a>
			<button onclick={reset} class="border-border text-foreground hover:bg-secondary rounded-md border px-4 py-2 text-sm">Nuevo Cambio</button>
		</div>
	</div>
{:else}
	<div class="flex max-w-4xl flex-col gap-6">
		<div class="flex items-center gap-3">
			<a href="/lmat/boms" class="border-border hover:bg-secondary flex h-8 w-8 items-center justify-center rounded-md border transition-colors">
				<ArrowLeft class="text-foreground h-4 w-4" />
			</a>
			<div>
				<h1 class="text-foreground text-xl font-bold">Cambio Masivo de Componente</h1>
				<p class="text-muted-foreground text-sm">Reemplaza un componente por otro en multiples BOMs</p>
			</div>
		</div>

		<!-- Step 1 -->
		<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
			<div class="border-border bg-card rounded-lg border p-4">
				<h3 class="text-card-foreground mb-3 text-sm font-semibold">Componente ACTUAL (a reemplazar)</h3>
				<div class="border-border bg-secondary flex items-center gap-2 rounded-md border px-3 py-2">
					<Search class="text-muted-foreground h-4 w-4" />
					<input type="text" placeholder="Buscar articulo..." bind:value={oldQuery}
						oninput={() => { oldArticleId = null; selectedBomIds = []; }}
						class="text-foreground placeholder:text-muted-foreground w-full border-none bg-transparent text-sm outline-none" />
				</div>
				{#if !oldArticleId && searchArticles(oldQuery).length > 0}
					<div class="border-border mt-1 flex flex-col overflow-hidden rounded-md border">
						{#each searchArticles(oldQuery) as a (a.id)}
							<button onclick={() => { oldArticleId = a.id; oldQuery = a.code; selectAll(); }}
								class="hover:bg-accent border-border/30 flex items-center gap-2 border-b px-3 py-1.5 text-left text-xs transition-colors last:border-0">
								<span class="text-primary font-mono">{a.code}</span>
								<span class="text-foreground truncate">{a.description}</span>
							</button>
						{/each}
					</div>
				{/if}
				{#if oldArticle}
					<div class="border-primary/30 bg-primary/5 mt-2 rounded-md border p-2">
						<p class="text-primary font-mono text-xs">{oldArticle.code}</p>
						<p class="text-muted-foreground truncate text-xs">{oldArticle.description}</p>
					</div>
				{/if}
			</div>

			<div class="border-border bg-card rounded-lg border p-4">
				<h3 class="text-card-foreground mb-3 text-sm font-semibold">Componente NUEVO (reemplazo)</h3>
				<div class="border-border bg-secondary flex items-center gap-2 rounded-md border px-3 py-2">
					<Search class="text-muted-foreground h-4 w-4" />
					<input type="text" placeholder="Buscar articulo..." bind:value={newQuery}
						oninput={() => (newArticleId = null)}
						class="text-foreground placeholder:text-muted-foreground w-full border-none bg-transparent text-sm outline-none" />
				</div>
				{#if !newArticleId && searchArticles(newQuery).length > 0}
					<div class="border-border mt-1 flex flex-col overflow-hidden rounded-md border">
						{#each searchArticles(newQuery) as a (a.id)}
							<button onclick={() => { newArticleId = a.id; newQuery = a.code; }}
								class="hover:bg-accent border-border/30 flex items-center gap-2 border-b px-3 py-1.5 text-left text-xs transition-colors last:border-0">
								<span class="text-primary font-mono">{a.code}</span>
								<span class="text-foreground truncate">{a.description}</span>
							</button>
						{/each}
					</div>
				{/if}
				{#if newArticle}
					<div class="border-primary/30 bg-primary/5 mt-2 rounded-md border p-2">
						<p class="text-primary font-mono text-xs">{newArticle.code}</p>
						<p class="text-muted-foreground truncate text-xs">{newArticle.description}</p>
					</div>
				{/if}
			</div>
		</div>

		<!-- Step 2 -->
		{#if oldArticleId && affectedBOMs.length > 0}
			<div class="border-border bg-card overflow-hidden rounded-lg border">
				<div class="border-border flex items-center justify-between border-b px-4 py-3">
					<h3 class="text-card-foreground text-sm font-semibold">
						BOMs afectados ({affectedBOMs.length}) - Selecciona cuales modificar
					</h3>
					<div class="flex gap-2">
						<button onclick={selectAll} class="text-primary text-xs hover:underline">Todos</button>
						<button onclick={deselectAll} class="text-muted-foreground text-xs hover:underline">Ninguno</button>
					</div>
				</div>
				<table class="w-full text-sm">
					<thead>
						<tr class="border-border border-b text-left">
							<th class="w-8 px-4 py-2"></th>
							<th class="text-muted-foreground px-4 py-2 text-xs font-medium">Especificacion</th>
							<th class="text-muted-foreground px-4 py-2 text-xs font-medium">Modelo</th>
							<th class="text-muted-foreground px-4 py-2 text-xs font-medium">Nivel</th>
							<th class="text-muted-foreground px-4 py-2 text-xs font-medium">Estatus</th>
							<th class="text-muted-foreground px-4 py-2 text-right text-xs font-medium">Cantidad</th>
						</tr>
					</thead>
					<tbody>
						{#each affectedBOMs as bom (bom.id)}
							{@const comp = bom.components.find((c) => c.articleId === oldArticleId)!}
							<tr class="border-border/50 hover:bg-secondary/30 cursor-pointer border-b transition-colors" onclick={() => toggleBom(bom.id)}>
								<td class="px-4 py-2">
									<input type="checkbox" checked={selectedBomIds.includes(bom.id)} readonly class="border-border accent-primary rounded" />
								</td>
								<td class="text-primary px-4 py-2 font-mono text-xs">{bom.specificationCode}</td>
								<td class="text-card-foreground px-4 py-2">{bom.vehicleModel}</td>
								<td class="text-muted-foreground px-4 py-2 text-xs">{ARMOR_LEVEL_LABELS[bom.armorLevel]}</td>
								<td class="text-muted-foreground px-4 py-2 text-xs">{BOM_STATUS_LABELS[bom.status]}</td>
								<td class="text-card-foreground px-4 py-2 text-right font-mono">{comp.quantity}</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{/if}

		{#if oldArticleId && affectedBOMs.length === 0}
			<div class="border-border bg-card text-muted-foreground rounded-lg border px-4 py-8 text-center text-sm">
				Este articulo no aparece en ningun BOM.
			</div>
		{/if}

		<!-- Step 3 -->
		{#if oldArticleId && newArticleId && selectedBomIds.length > 0}
			<div class="border-chart-4/30 bg-card rounded-lg border p-4">
				<div class="mb-3 flex items-start gap-3">
					<AlertTriangle class="text-chart-4 mt-0.5 h-5 w-5 shrink-0" />
					<div>
						<h3 class="text-card-foreground text-sm font-semibold">Preview del cambio</h3>
						<p class="text-muted-foreground mt-1 text-xs">
							Reemplazar <span class="text-primary font-mono">{oldArticle?.code}</span> por
							<span class="text-primary font-mono">{newArticle?.code}</span> en
							<span class="text-card-foreground font-bold">{selectedBomIds.length}</span> BOMs.
							Se creara una nueva revision en cada BOM afectado.
						</p>
					</div>
				</div>
				<div class="mb-3">
					<label for="motivo" class="text-muted-foreground mb-1 block text-xs">Motivo del cambio (obligatorio):</label>
					<input id="motivo" type="text" class="border-border bg-secondary text-foreground placeholder:text-muted-foreground w-full rounded-md border px-3 py-2 text-sm outline-none"
						bind:value={reason} placeholder="Ej: Cambio de proveedor, nuevo material equivalente..." />
				</div>
				<button onclick={applyChange} disabled={!reason.trim()}
					class="bg-chart-4 text-background hover:bg-chart-4/90 flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50">
					<ArrowRightLeft class="h-4 w-4" /> Aplicar Cambio Masivo
				</button>
			</div>
		{/if}
	</div>
{/if}
