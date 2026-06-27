<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { useStore } from '$lib/tps/store.svelte.js';
	import StatusBadge from '$lib/tps/components/status-badge.svelte';
	import {
		ARTICLE_STATUS_LABELS,
		ARTICLE_STATUS_COLORS,
		ABC_LABELS,
		ABC_COLORS,
		UDM_LABELS,
		ARTICLE_GROUPS,
		REQUIRED_FIELDS_BY_AREA,
		ARTICLE_TYPE_LABELS,
		ARTICLE_TYPE_COLORS,
		DOCUMENT_TYPE_LABELS,
		WAREHOUSES,
		SUPPLY_METHODS
	} from '$lib/tps/constants.js';
	import { formatCurrency, formatDate, generateId } from '$lib/tps/utils.js';
	import type { Article, ArticleType, DocumentType } from '$lib/tps/types.js';
	import ArrowLeft from '@lucide/svelte/icons/arrow-left';
	import Save from '@lucide/svelte/icons/save';
	import Trash2 from '@lucide/svelte/icons/trash-2';
	import AlertTriangle from '@lucide/svelte/icons/triangle-alert';
	import CheckCircle2 from '@lucide/svelte/icons/circle-check-big';
	import FileText from '@lucide/svelte/icons/file-text';
	import ImageIcon from '@lucide/svelte/icons/image';
	import Upload from '@lucide/svelte/icons/upload';
	import Plus from '@lucide/svelte/icons/plus';
	import ExternalLink from '@lucide/svelte/icons/external-link';
	import Truck from '@lucide/svelte/icons/truck';
	import BadgeCheck from '@lucide/svelte/icons/badge-check';

	const store = useStore();
	const app = $derived(store.state);
	const id = $derived(page.params.id);
	const article = $derived(app.articles.find((a) => a.id === id));

	let editing = $state(false);
	let form = $state<Record<string, any>>({});

	function startEdit() {
		form = { ...(article as Article) };
		editing = true;
	}
	function cancelEdit() {
		form = {};
		editing = false;
	}

	function saveEdit() {
		if (!article) return;
		store.dispatch({ type: 'UPDATE_ARTICLE', payload: { id: article.id, updates: form } });
		store.dispatch({
			type: 'ADD_AUDIT_LOG',
			payload: {
				id: generateId(),
				userId: app.currentUser.id,
				userName: app.currentUser.name,
				entity: 'Article',
				entityId: article.id,
				action: 'editar',
				field: 'multiples',
				oldValue: '',
				newValue: 'Edicion general',
				timestamp: new Date().toISOString()
			}
		});
		editing = false;
	}

	function deleteArticle() {
		if (!article) return;
		if (confirm('Eliminar este articulo? Esta accion no se puede deshacer.')) {
			store.dispatch({ type: 'DELETE_ARTICLE', payload: article.id });
			goto('/articulos');
		}
	}

	const whereUsed = $derived(
		article ? app.boms.filter((b) => b.components.some((c) => c.articleId === article.id)) : []
	);

	const missingFields = $derived.by(() => {
		const res: { area: string; fields: string[] }[] = [];
		if (!article) return res;
		for (const [area, fields] of Object.entries(REQUIRED_FIELDS_BY_AREA)) {
			const missing = fields.filter((f) => {
				const v = (article as unknown as Record<string, unknown>)[f as string];
				return !v || v === '' || v === 0;
			});
			if (missing.length > 0) res.push({ area, fields: missing as string[] });
		}
		return res;
	});
</script>

{#if !article}
	<div class="flex flex-col items-center justify-center gap-4 py-20">
		<p class="text-muted-foreground">Articulo no encontrado</p>
		<a href="/articulos" class="text-primary text-sm hover:underline">Volver al catalogo</a>
	</div>
{:else}
	<div class="flex flex-col gap-6">
		<!-- Header -->
		<div class="flex items-center justify-between">
			<div class="flex items-center gap-3">
				<a
					href="/articulos"
					class="border-border hover:bg-secondary flex h-8 w-8 items-center justify-center rounded-md border transition-colors"
				>
					<ArrowLeft class="text-foreground h-4 w-4" />
				</a>
				<div>
					<div class="flex items-center gap-2">
						<h1 class="text-foreground font-mono text-xl font-bold">{article.code}</h1>
						<StatusBadge label={ARTICLE_STATUS_LABELS[article.status]} colorClass={ARTICLE_STATUS_COLORS[article.status]} />
						<StatusBadge
							label={article.abcClass === 'sin_clasificar' ? 'Sin ABC' : `Clase ${article.abcClass}`}
							colorClass={ABC_COLORS[article.abcClass]}
						/>
					</div>
					<p class="text-muted-foreground text-sm">{article.description}</p>
				</div>
			</div>
			<div class="flex items-center gap-2">
				{#if editing}
					<button
						onclick={cancelEdit}
						class="border-border text-foreground hover:bg-secondary rounded-md border px-3 py-1.5 text-xs transition-colors"
						>Cancelar</button
					>
					<button
						onclick={saveEdit}
						class="bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-medium transition-colors"
					>
						<Save class="h-3.5 w-3.5" /> Guardar
					</button>
				{:else}
					<button
						onclick={startEdit}
						class="border-border text-foreground hover:bg-secondary rounded-md border px-3 py-1.5 text-xs transition-colors"
						>Editar</button
					>
					<button
						onclick={deleteArticle}
						class="border-destructive/30 text-destructive-foreground hover:bg-destructive/10 flex items-center gap-1 rounded-md border px-3 py-1.5 text-xs transition-colors"
					>
						<Trash2 class="h-3.5 w-3.5" /> Eliminar
					</button>
				{/if}
			</div>
		</div>

		<!-- Completeness bar -->
		<div class="border-border bg-card rounded-lg border p-4">
			<div class="mb-2 flex items-center justify-between">
				<span class="text-card-foreground text-sm font-medium">Completitud del Articulo</span>
				<span class="text-card-foreground font-mono text-lg font-bold">{article.completeness}%</span>
			</div>
			<div class="bg-secondary h-3 rounded-full">
				<div
					class="h-3 rounded-full transition-all {article.completeness >= 80
						? 'bg-primary'
						: article.completeness >= 50
							? 'bg-chart-4'
							: 'bg-destructive'}"
					style="width: {article.completeness}%"
				></div>
			</div>
			{#if missingFields.length > 0}
				<div class="mt-3 flex flex-col gap-1">
					{#each missingFields as mf (mf.area)}
						<div class="flex items-center gap-2 text-xs">
							<AlertTriangle class="text-chart-4 h-3 w-3" />
							<span class="text-chart-4 font-medium">{mf.area}:</span>
							<span class="text-muted-foreground">{mf.fields.join(', ')}</span>
						</div>
					{/each}
				</div>
			{/if}
		</div>

		<!-- LMAT 2.0: Image + Article Type -->
		<div class="grid grid-cols-1 gap-4 md:grid-cols-4">
			<!-- Reference Image -->
			<div class="border-border bg-card flex min-h-[160px] flex-col items-center justify-center rounded-lg border p-4">
				{#if article.imageUrl}
					<img src={article.imageUrl} alt={article.description} class="max-h-32 rounded object-contain" />
				{:else}
					<div class="flex flex-col items-center text-center">
						<ImageIcon class="text-muted-foreground/30 mb-2 h-10 w-10" />
						<span class="text-muted-foreground text-xs">Sin imagen de referencia</span>
						{#if editing}
							<button class="text-primary mt-2 flex items-center gap-1 text-xs hover:underline">
								<Upload class="h-3 w-3" /> Subir imagen
							</button>
						{/if}
					</div>
				{/if}
			</div>
			<!-- Type + Quality + Supply badges -->
			<div class="border-border bg-card flex items-center gap-4 rounded-lg border p-4 md:col-span-3">
				<div class="flex items-center gap-2">
					<span class="text-muted-foreground text-sm">Tipo de Articulo:</span>
					<span class="rounded-full px-3 py-1 text-xs font-medium {ARTICLE_TYPE_COLORS[(article.articleType || 'compra') as ArticleType]}">
						{ARTICLE_TYPE_LABELS[(article.articleType || 'compra') as ArticleType]}
					</span>
				</div>
				<div class="flex items-center gap-2">
					<span class="text-muted-foreground text-sm">Calidad:</span>
					{#if article.qualityApproved}
						<span class="flex items-center gap-1 text-xs text-emerald-400"><BadgeCheck class="h-3.5 w-3.5" /> Aprobado</span>
					{:else}
						<span class="text-chart-4 flex items-center gap-1 text-xs"><AlertTriangle class="h-3.5 w-3.5" /> Pendiente</span>
					{/if}
				</div>
				<div class="flex items-center gap-2">
					<span class="text-muted-foreground text-sm">Surtimiento:</span>
					<span class="text-foreground text-xs">{SUPPLY_METHODS[article.supplyMethod || 'bom_kit']}</span>
				</div>
				{#if article.requiresLotSerial}
					<span class="bg-chart-1/15 text-chart-1 rounded-full px-2 py-0.5 text-xs">Requiere Lote/Serie</span>
				{/if}
			</div>
		</div>

		<!-- Fields Grid -->
		<div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
			<!-- Ingenieria -->
			<div class="border-border bg-card rounded-lg border">
				<div class="border-border border-b px-4 py-2.5">
					<h3 class="text-card-foreground text-sm font-semibold">Ingenieria</h3>
				</div>
				<div class="divide-border/30 flex flex-col divide-y px-4">
					<div class="flex items-center justify-between gap-4 py-2.5">
						<span class="text-muted-foreground flex items-center gap-1 text-xs whitespace-nowrap">Codigo</span>
						<span class="text-card-foreground text-right text-sm">{article.code}</span>
					</div>
					<div class="flex items-center justify-between gap-4 py-2.5">
						<span class="text-muted-foreground flex items-center gap-1 text-xs whitespace-nowrap">Descripcion</span>
						{#if editing}
							<input class="field-input" bind:value={form.description} />
						{:else}
							<span class="text-card-foreground text-right text-sm">{article.description}</span>
						{/if}
					</div>
					<div class="flex items-center justify-between gap-4 py-2.5">
						<span class="text-muted-foreground flex items-center gap-1 text-xs whitespace-nowrap">Descripcion Generica</span>
						{#if editing}
							<input class="field-input" bind:value={form.descriptionGeneric} placeholder="Para articulos con alta rotacion de proveedor" />
						{:else}
							<span class="text-card-foreground text-right text-sm">{article.descriptionGeneric || '---'}</span>
						{/if}
					</div>
					<div class="flex items-center justify-between gap-4 py-2.5">
						<span class="text-muted-foreground flex items-center gap-1 text-xs whitespace-nowrap">Tipo Articulo</span>
						{#if editing}
							<select class="field-input" bind:value={form.articleType}>
								{#each Object.entries(ARTICLE_TYPE_LABELS) as [k, v] (k)}
									<option value={k}>{v}</option>
								{/each}
							</select>
						{:else}
							<span class="text-card-foreground text-right text-sm">{ARTICLE_TYPE_LABELS[(article.articleType || 'compra') as ArticleType]}</span>
						{/if}
					</div>
					<div class="flex items-center justify-between gap-4 py-2.5">
						<span class="text-muted-foreground flex items-center gap-1 text-xs whitespace-nowrap">Grupo</span>
						{#if editing}
							<select class="field-input" bind:value={form.group}>
								{#each ARTICLE_GROUPS as g (g)}
									<option value={g}>{g}</option>
								{/each}
							</select>
						{:else}
							<span class="text-card-foreground text-right text-sm">{article.group}</span>
						{/if}
					</div>
					<div class="flex items-center justify-between gap-4 py-2.5">
						<span class="text-muted-foreground flex items-center gap-1 text-xs whitespace-nowrap">Familia</span>
						{#if editing}
							<input class="field-input" bind:value={form.family} />
						{:else}
							<span class="text-card-foreground text-right text-sm">{article.family || '---'}</span>
						{/if}
					</div>
					<div class="flex items-center justify-between gap-4 py-2.5">
						<span class="text-muted-foreground flex items-center gap-1 text-xs whitespace-nowrap">UdM Base</span>
						{#if editing}
							<select class="field-input" bind:value={form.udmBase}>
								{#each Object.entries(UDM_LABELS) as [k, v] (k)}
									<option value={k}>{v}</option>
								{/each}
							</select>
						{:else}
							<span class="text-card-foreground text-right text-sm">{UDM_LABELS[article.udmBase]}</span>
						{/if}
					</div>
					<div class="flex items-center justify-between gap-4 py-2.5">
						<span class="text-muted-foreground flex items-center gap-1 text-xs whitespace-nowrap">UdM BOM</span>
						{#if editing}
							<select class="field-input" bind:value={form.udmBOM}>
								{#each Object.entries(UDM_LABELS) as [k, v] (k)}
									<option value={k}>{v}</option>
								{/each}
							</select>
						{:else}
							<span class="text-card-foreground text-right text-sm">{UDM_LABELS[article.udmBOM || article.udmBase]}</span>
						{/if}
					</div>
					<div class="flex items-center justify-between gap-4 py-2.5">
						<span class="text-muted-foreground flex items-center gap-1 text-xs whitespace-nowrap">Dibujo/Plano</span>
						{#if editing}
							<input class="field-input" bind:value={form.drawingRef} />
						{:else}
							<span class="text-card-foreground text-right text-sm">{article.drawingRef || '---'}</span>
						{/if}
					</div>
					<div class="flex items-center justify-between gap-4 py-2.5">
						<span class="text-muted-foreground flex items-center gap-1 text-xs whitespace-nowrap">Codigo P5</span>
						{#if editing}
							<input class="field-input" bind:value={form.p5Code} />
						{:else}
							<span class="text-card-foreground text-right text-sm">{article.p5Code || '---'}</span>
						{/if}
					</div>
				</div>
			</div>

			<!-- Compras -->
			<div class="border-border bg-card rounded-lg border">
				<div class="border-border border-b px-4 py-2.5">
					<h3 class="text-card-foreground text-sm font-semibold">Compras</h3>
				</div>
				<div class="divide-border/30 flex flex-col divide-y px-4">
					<div class="flex items-center justify-between gap-4 py-2.5">
						<span class="text-muted-foreground flex items-center gap-1 text-xs whitespace-nowrap">
							{#if !article.supplierId}<AlertTriangle class="text-chart-4 h-3 w-3" />{/if}Proveedor
						</span>
						{#if editing}
							<select
								class="field-input"
								bind:value={form.supplierId}
								onchange={(e) => {
									const sup = app.suppliers.find((s) => s.id === e.currentTarget.value);
									form.supplierName = sup?.name || '';
								}}
							>
								<option value="">Sin asignar</option>
								{#each app.suppliers as s (s.id)}
									<option value={s.id}>{s.name}</option>
								{/each}
							</select>
						{:else}
							<span class="text-card-foreground text-right text-sm">{article.supplierName || 'Sin asignar'}</span>
						{/if}
					</div>
					<div class="flex items-center justify-between gap-4 py-2.5">
						<span class="text-muted-foreground flex items-center gap-1 text-xs whitespace-nowrap">
							{#if article.price === 0}<AlertTriangle class="text-chart-4 h-3 w-3" />{/if}Precio
						</span>
						{#if editing}
							<div class="flex gap-1">
								<input type="number" class="field-input flex-1" bind:value={form.price} />
								<select class="field-input w-20" bind:value={form.currency}>
									<option value="MXN">MXN</option>
									<option value="USD">USD</option>
								</select>
							</div>
						{:else}
							<span class="text-card-foreground text-right text-sm">{article.price > 0 ? formatCurrency(article.price, article.currency) : '---'}</span>
						{/if}
					</div>
					<div class="flex items-center justify-between gap-4 py-2.5">
						<span class="text-muted-foreground flex items-center gap-1 text-xs whitespace-nowrap">UdM Compra</span>
						{#if editing}
							<select class="field-input" bind:value={form.udmPurchase}>
								{#each Object.entries(UDM_LABELS) as [k, v] (k)}
									<option value={k}>{v}</option>
								{/each}
							</select>
						{:else}
							<span class="text-card-foreground text-right text-sm">{UDM_LABELS[article.udmPurchase]}</span>
						{/if}
					</div>
					<div class="flex items-center justify-between gap-4 py-2.5">
						<span class="text-muted-foreground flex items-center gap-1 text-xs whitespace-nowrap">
							{#if article.leadTimeDays === 0}<AlertTriangle class="text-chart-4 h-3 w-3" />{/if}Lead Time
						</span>
						{#if editing}
							<input type="number" class="field-input" bind:value={form.leadTimeDays} />
						{:else}
							<span class="text-card-foreground text-right text-sm">{article.leadTimeDays > 0 ? `${article.leadTimeDays} dias` : '---'}</span>
						{/if}
					</div>
				</div>
			</div>

			<!-- Almacen -->
			<div class="border-border bg-card rounded-lg border">
				<div class="border-border border-b px-4 py-2.5">
					<h3 class="text-card-foreground text-sm font-semibold">Almacen</h3>
				</div>
				<div class="divide-border/30 flex flex-col divide-y px-4">
					<div class="flex items-center justify-between gap-4 py-2.5">
						<span class="text-muted-foreground flex items-center gap-1 text-xs whitespace-nowrap">Almacen</span>
						{#if editing}
							<select class="field-input" bind:value={form.warehouse}>
								{#each WAREHOUSES as w (w)}
									<option value={w}>{w}</option>
								{/each}
							</select>
						{:else}
							<span class="text-card-foreground text-right text-sm">{article.warehouse || 'MP - Materia Prima'}</span>
						{/if}
					</div>
					<div class="flex items-center justify-between gap-4 py-2.5">
						<span class="text-muted-foreground flex items-center gap-1 text-xs whitespace-nowrap">
							{#if !article.location}<AlertTriangle class="text-chart-4 h-3 w-3" />{/if}Ubicacion
						</span>
						{#if editing}
							<input class="field-input" bind:value={form.location} placeholder="Rack, pasillo, nivel" />
						{:else}
							<span class="text-card-foreground text-right text-sm">{article.location || '---'}</span>
						{/if}
					</div>
					<div class="flex items-center justify-between gap-4 py-2.5">
						<span class="text-muted-foreground flex items-center gap-1 text-xs whitespace-nowrap">UdM Almacenamiento</span>
						{#if editing}
							<select class="field-input" bind:value={form.udmStorage}>
								{#each Object.entries(UDM_LABELS) as [k, v] (k)}
									<option value={k}>{v}</option>
								{/each}
							</select>
						{:else}
							<span class="text-card-foreground text-right text-sm">{UDM_LABELS[article.udmStorage]}</span>
						{/if}
					</div>
					<div class="flex items-center justify-between gap-4 py-2.5">
						<span class="text-muted-foreground flex items-center gap-1 text-xs whitespace-nowrap">Metodo Surtimiento</span>
						{#if editing}
							<select class="field-input" bind:value={form.supplyMethod}>
								{#each Object.entries(SUPPLY_METHODS) as [k, v] (k)}
									<option value={k}>{v}</option>
								{/each}
							</select>
						{:else}
							<span class="text-card-foreground text-right text-sm">{SUPPLY_METHODS[article.supplyMethod || 'bom_kit']}</span>
						{/if}
					</div>
					<div class="flex items-center justify-between gap-4 py-2.5">
						<span class="text-muted-foreground flex items-center gap-1 text-xs whitespace-nowrap">Stock Minimo</span>
						{#if editing}
							<input type="number" class="field-input" bind:value={form.minStock} />
						{:else}
							<span class="text-card-foreground text-right text-sm">{article.minStock}</span>
						{/if}
					</div>
					<div class="flex items-center justify-between gap-4 py-2.5">
						<span class="text-muted-foreground flex items-center gap-1 text-xs whitespace-nowrap">Stock Maximo</span>
						{#if editing}
							<input type="number" class="field-input" bind:value={form.maxStock} />
						{:else}
							<span class="text-card-foreground text-right text-sm">{article.maxStock}</span>
						{/if}
					</div>
					<div class="flex items-center justify-between gap-4 py-2.5">
						<span class="text-muted-foreground flex items-center gap-1 text-xs whitespace-nowrap">Punto de Reorden</span>
						{#if editing}
							<input type="number" class="field-input" bind:value={form.reorderPoint} />
						{:else}
							<span class="text-card-foreground text-right text-sm">{article.reorderPoint || 0}</span>
						{/if}
					</div>
					<div class="flex items-center justify-between gap-4 py-2.5">
						<span class="text-muted-foreground flex items-center gap-1 text-xs whitespace-nowrap">Requiere Lote/Serie</span>
						{#if editing}
							<select
								class="field-input"
								onchange={(e) => (form.requiresLotSerial = e.currentTarget.value === 'true')}
							>
								<option value="false" selected={!form.requiresLotSerial}>No</option>
								<option value="true" selected={form.requiresLotSerial}>Si</option>
							</select>
						{:else}
							<span class="text-card-foreground text-right text-sm">{article.requiresLotSerial ? 'Si' : 'No'}</span>
						{/if}
					</div>
					<div class="flex items-center justify-between gap-4 py-2.5">
						<span class="text-muted-foreground flex items-center gap-1 text-xs whitespace-nowrap">Clasificacion ABC</span>
						{#if editing}
							<select class="field-input" bind:value={form.abcClass}>
								{#each Object.entries(ABC_LABELS) as [k, v] (k)}
									<option value={k}>{v}</option>
								{/each}
							</select>
						{:else}
							<span class="text-card-foreground text-right text-sm">{ABC_LABELS[article.abcClass]}</span>
						{/if}
					</div>
				</div>
			</div>

			<!-- Produccion + Calidad -->
			<div class="border-border bg-card rounded-lg border">
				<div class="border-border border-b px-4 py-2.5">
					<h3 class="text-card-foreground text-sm font-semibold">Produccion / Calidad</h3>
				</div>
				<div class="divide-border/30 flex flex-col divide-y px-4">
					<div class="flex items-center justify-between gap-4 py-2.5">
						<span class="text-muted-foreground flex items-center gap-1 text-xs whitespace-nowrap">UdM Produccion</span>
						{#if editing}
							<select class="field-input" bind:value={form.udmProduction}>
								{#each Object.entries(UDM_LABELS) as [k, v] (k)}
									<option value={k}>{v}</option>
								{/each}
							</select>
						{:else}
							<span class="text-card-foreground text-right text-sm">{UDM_LABELS[article.udmProduction]}</span>
						{/if}
					</div>
					<div class="flex items-center justify-between gap-4 py-2.5">
						<span class="text-muted-foreground flex items-center gap-1 text-xs whitespace-nowrap">Ruta</span>
						{#if editing}
							<input class="field-input" bind:value={form.route} />
						{:else}
							<span class="text-card-foreground text-right text-sm">{article.route || '---'}</span>
						{/if}
					</div>
					<div class="flex items-center justify-between gap-4 py-2.5">
						<span class="text-muted-foreground flex items-center gap-1 text-xs whitespace-nowrap">Centro de Trabajo</span>
						{#if editing}
							<input class="field-input" bind:value={form.workCenter} />
						{:else}
							<span class="text-card-foreground text-right text-sm">{article.workCenter || '---'}</span>
						{/if}
					</div>
					<div class="flex items-center justify-between gap-4 py-2.5">
						<span class="text-muted-foreground flex items-center gap-1 text-xs whitespace-nowrap">Grupo Calidad</span>
						{#if editing}
							<input class="field-input" bind:value={form.qualityGroup} />
						{:else}
							<span class="text-card-foreground text-right text-sm">{article.qualityGroup || '---'}</span>
						{/if}
					</div>
					<div class="flex items-center justify-between gap-4 py-2.5">
						<span class="text-muted-foreground flex items-center gap-1 text-xs whitespace-nowrap">Inspeccion Requerida</span>
						{#if editing}
							<select
								class="field-input"
								onchange={(e) => (form.inspectionRequired = e.currentTarget.value === 'true')}
							>
								<option value="true" selected={form.inspectionRequired}>Si</option>
								<option value="false" selected={!form.inspectionRequired}>No</option>
							</select>
						{:else}
							<span class="text-card-foreground text-right text-sm">{article.inspectionRequired ? 'Si' : 'No'}</span>
						{/if}
					</div>
					<div class="flex items-center justify-between gap-4 py-2.5">
						<span class="text-muted-foreground flex items-center gap-1 text-xs whitespace-nowrap">
							{#if !article.qualityApproved}<AlertTriangle class="text-chart-4 h-3 w-3" />{/if}Aprobado por Calidad
						</span>
						{#if editing}
							<select
								class="field-input"
								onchange={(e) => (form.qualityApproved = e.currentTarget.value === 'true')}
							>
								<option value="false" selected={!form.qualityApproved}>Pendiente</option>
								<option value="true" selected={form.qualityApproved}>Si</option>
							</select>
						{:else}
							<span class="text-card-foreground text-right text-sm">{article.qualityApproved ? 'Si' : 'Pendiente'}</span>
						{/if}
					</div>
					<div class="flex items-center justify-between gap-4 py-2.5">
						<span class="text-muted-foreground flex items-center gap-1 text-xs whitespace-nowrap">Centro de Costo</span>
						{#if editing}
							<input class="field-input" bind:value={form.costCenter} />
						{:else}
							<span class="text-card-foreground text-right text-sm">{article.costCenter || '---'}</span>
						{/if}
					</div>
					<div class="flex items-center justify-between gap-4 py-2.5">
						<span class="text-muted-foreground flex items-center gap-1 text-xs whitespace-nowrap">Metodo Costeo</span>
						{#if editing}
							<select class="field-input" bind:value={form.costMethod}>
								<option value="promedio">Costo Promedio</option>
								<option value="especifico">Costo Especifico</option>
							</select>
						{:else}
							<span class="text-card-foreground text-right text-sm">{article.costMethod === 'especifico' ? 'Costo Especifico' : 'Costo Promedio'}</span>
						{/if}
					</div>
					<div class="flex items-center justify-between gap-4 py-2.5">
						<span class="text-muted-foreground flex items-center gap-1 text-xs whitespace-nowrap">Estatus</span>
						{#if editing}
							<select class="field-input" bind:value={form.status}>
								{#each Object.entries(ARTICLE_STATUS_LABELS) as [k, v] (k)}
									<option value={k}>{v}</option>
								{/each}
							</select>
						{:else}
							<span class="text-card-foreground text-right text-sm">{ARTICLE_STATUS_LABELS[article.status]}</span>
						{/if}
					</div>
				</div>
			</div>
		</div>

		<!-- LMAT 2.0: Multi-Proveedores -->
		{#if (article.suppliers || []).length > 0}
			<div class="border-border bg-card rounded-lg border">
				<div class="border-border flex items-center justify-between border-b px-4 py-3">
					<div class="flex items-center gap-2">
						<Truck class="text-muted-foreground h-4 w-4" />
						<h3 class="text-card-foreground text-sm font-semibold">Proveedores Alternativos</h3>
					</div>
					{#if editing}
						<button class="border-border hover:bg-secondary flex items-center gap-1 rounded-md border px-2 py-1 text-xs">
							<Plus class="h-3 w-3" /> Agregar
						</button>
					{/if}
				</div>
				<div class="overflow-x-auto">
					<table class="w-full text-sm">
						<thead>
							<tr class="border-border border-b text-left">
								<th class="text-muted-foreground px-4 py-2 text-xs font-medium">Proveedor</th>
								<th class="text-muted-foreground px-4 py-2 text-xs font-medium">Codigo Alterno</th>
								<th class="text-muted-foreground px-4 py-2 text-right text-xs font-medium">Precio</th>
								<th class="text-muted-foreground px-4 py-2 text-right text-xs font-medium">Lead Time</th>
								<th class="text-muted-foreground px-4 py-2 text-center text-xs font-medium">Principal</th>
								<th class="text-muted-foreground px-4 py-2 text-center text-xs font-medium">Aprobado</th>
							</tr>
						</thead>
						<tbody>
							{#each article.suppliers || [] as sup (sup.id)}
								<tr class="border-border/50 border-b">
									<td class="text-card-foreground px-4 py-2">{sup.supplierName}</td>
									<td class="text-muted-foreground px-4 py-2 font-mono text-xs">{sup.supplierCode || '---'}</td>
									<td class="text-card-foreground px-4 py-2 text-right font-mono">{formatCurrency(sup.price, sup.currency === 'EUR' ? 'MXN' : sup.currency)}</td>
									<td class="text-muted-foreground px-4 py-2 text-right">{sup.leadTimeDays} dias</td>
									<td class="px-4 py-2 text-center">
										{#if sup.isPrimary}<CheckCircle2 class="text-primary mx-auto h-4 w-4" />{:else}-{/if}
									</td>
									<td class="px-4 py-2 text-center">
										{#if sup.isApproved}<BadgeCheck class="mx-auto h-4 w-4 text-emerald-400" />{:else}<AlertTriangle class="text-chart-4 mx-auto h-4 w-4" />{/if}
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			</div>
		{/if}

		<!-- LMAT 2.0: Documentos Vinculados -->
		<div class="border-border bg-card rounded-lg border">
			<div class="border-border flex items-center justify-between border-b px-4 py-3">
				<div class="flex items-center gap-2">
					<FileText class="text-muted-foreground h-4 w-4" />
					<h3 class="text-card-foreground text-sm font-semibold">Documentos Vinculados</h3>
				</div>
				{#if editing}
					<button class="border-border hover:bg-secondary flex items-center gap-1 rounded-md border px-2 py-1 text-xs">
						<Upload class="h-3 w-3" /> Subir Documento
					</button>
				{/if}
			</div>
			{#if (article.documents || []).length > 0}
				<div class="overflow-x-auto">
					<table class="w-full text-sm">
						<thead>
							<tr class="border-border border-b text-left">
								<th class="text-muted-foreground px-4 py-2 text-xs font-medium">Tipo</th>
								<th class="text-muted-foreground px-4 py-2 text-xs font-medium">Archivo</th>
								<th class="text-muted-foreground px-4 py-2 text-center text-xs font-medium">Version</th>
								<th class="text-muted-foreground px-4 py-2 text-xs font-medium">Subido por</th>
								<th class="text-muted-foreground px-4 py-2 text-xs font-medium">Fecha</th>
							</tr>
						</thead>
						<tbody>
							{#each article.documents || [] as doc (doc.id)}
								<tr class="border-border/50 border-b">
									<td class="px-4 py-2">
										<span class="bg-secondary rounded px-2 py-0.5 text-xs">{DOCUMENT_TYPE_LABELS[doc.type as DocumentType]}</span>
									</td>
									<td class="text-card-foreground px-4 py-2">
										<a href={doc.fileUrl} target="_blank" rel="noreferrer" class="text-primary flex items-center gap-1 hover:underline">
											{doc.fileName} <ExternalLink class="h-3 w-3" />
										</a>
									</td>
									<td class="text-muted-foreground px-4 py-2 text-center font-mono text-xs">v{doc.version}</td>
									<td class="text-muted-foreground px-4 py-2">{doc.uploadedBy}</td>
									<td class="text-muted-foreground px-4 py-2">{formatDate(doc.uploadedAt)}</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			{:else}
				<div class="flex flex-col items-center justify-center py-8 text-center">
					<FileText class="text-muted-foreground/30 mb-2 h-8 w-8" />
					<p class="text-muted-foreground text-sm">No hay documentos vinculados</p>
					<p class="text-muted-foreground mt-1 text-xs">Dibujos tecnicos, programas CNC, fichas tecnicas, imagenes de referencia</p>
				</div>
			{/if}
		</div>

		<!-- UdM Conversions -->
		{#if article.conversions.length > 0}
			<div class="border-border bg-card rounded-lg border">
				<div class="border-border border-b px-4 py-3">
					<h3 class="text-card-foreground text-sm font-semibold">Conversiones de Unidades</h3>
				</div>
				<div class="p-4">
					<table class="w-full text-sm">
						<thead>
							<tr class="border-border border-b text-left">
								<th class="text-muted-foreground pb-2 text-xs font-medium">De</th>
								<th class="text-muted-foreground pb-2 text-xs font-medium">A</th>
								<th class="text-muted-foreground pb-2 text-right text-xs font-medium">Factor</th>
							</tr>
						</thead>
						<tbody>
							{#each article.conversions as c, i (i)}
								<tr class="border-border/30 border-b">
									<td class="text-card-foreground py-1.5">{UDM_LABELS[c.from]}</td>
									<td class="text-card-foreground py-1.5">{UDM_LABELS[c.to]}</td>
									<td class="text-card-foreground py-1.5 text-right font-mono">{c.factor}</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			</div>
		{/if}

		<!-- Where-Used -->
		<div class="border-border bg-card rounded-lg border">
			<div class="border-border border-b px-4 py-3">
				<h3 class="text-card-foreground text-sm font-semibold">Where-Used (BOMs que usan este articulo)</h3>
			</div>
			{#if whereUsed.length > 0}
				<div class="overflow-x-auto">
					<table class="w-full text-sm">
						<thead>
							<tr class="border-border border-b text-left">
								<th class="text-muted-foreground px-4 py-2 text-xs font-medium">Especificacion</th>
								<th class="text-muted-foreground px-4 py-2 text-xs font-medium">Modelo</th>
								<th class="text-muted-foreground px-4 py-2 text-xs font-medium">Nivel</th>
								<th class="text-muted-foreground px-4 py-2 text-right text-xs font-medium">Cantidad</th>
								<th class="text-muted-foreground px-4 py-2 text-xs font-medium">Celda</th>
							</tr>
						</thead>
						<tbody>
							{#each whereUsed as bom (bom.id)}
								{@const comp = bom.components.find((c) => c.articleId === article.id)}
								<tr class="border-border/50 hover:bg-secondary/30 border-b transition-colors">
									<td class="px-4 py-2">
										<a href="/lmat/boms/{bom.id}" class="text-primary font-mono text-xs hover:underline">{bom.specificationCode}</a>
									</td>
									<td class="text-card-foreground px-4 py-2">{bom.vehicleModel}</td>
									<td class="text-card-foreground px-4 py-2">{bom.armorLevel}</td>
									<td class="text-card-foreground px-4 py-2 text-right font-mono">{comp?.quantity} {comp ? UDM_LABELS[comp.udm] : ''}</td>
									<td class="text-muted-foreground px-4 py-2">{comp?.cell}</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			{:else}
				<div class="text-muted-foreground px-4 py-8 text-center text-sm">Este articulo no aparece en ningun BOM.</div>
			{/if}
		</div>

		<!-- Metadata -->
		<div class="text-muted-foreground flex items-center gap-4 text-xs">
			<span>Creado: {formatDate(article.createdAt)}</span>
			<span>Modificado: {formatDate(article.updatedAt)}</span>
			<span>Planta: {article.plant}</span>
		</div>
	</div>
{/if}

<style>
	.field-input {
		width: 100%;
		border-radius: 0.375rem;
		border: 1px solid var(--border);
		background: var(--secondary);
		padding: 0.375rem 0.5rem;
		font-size: 0.8125rem;
		color: var(--foreground);
		outline: none;
	}
	.field-input:focus {
		border-color: var(--primary);
	}
</style>
