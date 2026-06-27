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
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Table from '$lib/components/ui/table/index.js';
	import * as Tabs from '$lib/components/ui/tabs/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import * as Empty from '$lib/components/ui/empty/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Checkbox } from '$lib/components/ui/checkbox/index.js';
	import { Progress } from '$lib/components/ui/progress/index.js';

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
	<Empty.Root>
		<Empty.Header>
			<Empty.Title>Articulo no encontrado</Empty.Title>
			<Empty.Description>El articulo solicitado no existe o fue eliminado.</Empty.Description>
		</Empty.Header>
		<Empty.Content>
			<Button href="/articulos" variant="outline">Volver al catalogo</Button>
		</Empty.Content>
	</Empty.Root>
{:else}
	<!-- Header -->
	<div class="flex flex-wrap items-center justify-between gap-3">
		<div class="flex items-center gap-3">
			<Button href="/articulos" variant="outline" size="icon" class="size-8">
				<ArrowLeft />
			</Button>
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
				<Button variant="outline" size="sm" onclick={cancelEdit}>Cancelar</Button>
				<Button size="sm" onclick={saveEdit}>
					<Save data-icon="inline-start" /> Guardar
				</Button>
			{:else}
				<Button variant="outline" size="sm" onclick={startEdit}>Editar</Button>
				<Button variant="outline" size="sm" class="text-destructive hover:text-destructive" onclick={deleteArticle}>
					<Trash2 data-icon="inline-start" /> Eliminar
				</Button>
			{/if}
		</div>
	</div>

	<!-- Completeness -->
	<Card.Root>
		<Card.Header>
			<Card.Title>Completitud del Articulo</Card.Title>
			<Card.Action>
				<span class="font-mono text-lg font-bold tabular-nums">{article.completeness}%</span>
			</Card.Action>
		</Card.Header>
		<Card.Content class="flex flex-col gap-3">
			<Progress
				value={article.completeness}
				max={100}
				class={article.completeness >= 80
					? ''
					: article.completeness >= 50
						? '*:data-[slot=progress-indicator]:bg-chart-4'
						: '*:data-[slot=progress-indicator]:bg-destructive'}
			/>
			{#if missingFields.length > 0}
				<div class="flex flex-col gap-1">
					{#each missingFields as mf (mf.area)}
						<div class="flex items-center gap-2 text-xs">
							<AlertTriangle class="text-chart-4 size-3" />
							<span class="text-chart-4 font-medium">{mf.area}:</span>
							<span class="text-muted-foreground">{mf.fields.join(', ')}</span>
						</div>
					{/each}
				</div>
			{/if}
		</Card.Content>
	</Card.Root>

	<!-- LMAT 2.0: Image + Article Type -->
	<div class="grid grid-cols-1 gap-4 md:grid-cols-4">
		<Card.Root class="md:col-span-1">
			<Card.Content class="flex min-h-40 flex-col items-center justify-center">
				{#if article.imageUrl}
					<img src={article.imageUrl} alt={article.description} class="max-h-32 rounded object-contain" />
				{:else}
					<div class="flex flex-col items-center text-center">
						<ImageIcon class="text-muted-foreground/30 mb-2 size-10" />
						<span class="text-muted-foreground text-xs">Sin imagen de referencia</span>
						{#if editing}
							<Button variant="link" size="sm" class="mt-2">
								<Upload data-icon="inline-start" /> Subir imagen
							</Button>
						{/if}
					</div>
				{/if}
			</Card.Content>
		</Card.Root>
		<Card.Root class="md:col-span-3">
			<Card.Content class="flex flex-wrap items-center gap-4">
				<div class="flex items-center gap-2">
					<span class="text-muted-foreground text-sm">Tipo de Articulo:</span>
					<StatusBadge
						label={ARTICLE_TYPE_LABELS[(article.articleType || 'compra') as ArticleType]}
						colorClass={ARTICLE_TYPE_COLORS[(article.articleType || 'compra') as ArticleType]}
					/>
				</div>
				<div class="flex items-center gap-2">
					<span class="text-muted-foreground text-sm">Calidad:</span>
					{#if article.qualityApproved}
						<span class="flex items-center gap-1 text-xs text-emerald-400"><BadgeCheck class="size-3.5" /> Aprobado</span>
					{:else}
						<span class="text-chart-4 flex items-center gap-1 text-xs"><AlertTriangle class="size-3.5" /> Pendiente</span>
					{/if}
				</div>
				<div class="flex items-center gap-2">
					<span class="text-muted-foreground text-sm">Surtimiento:</span>
					<span class="text-foreground text-xs">{SUPPLY_METHODS[article.supplyMethod || 'bom_kit']}</span>
				</div>
				{#if article.requiresLotSerial}
					<StatusBadge label="Requiere Lote/Serie" colorClass="bg-chart-1/15 text-chart-1" />
				{/if}
			</Card.Content>
		</Card.Root>
	</div>

	<!-- Detail Tabs -->
	<Tabs.Root value="datos">
		<Tabs.List>
			<Tabs.Trigger value="datos">Datos Maestros</Tabs.Trigger>
			<Tabs.Trigger value="proveedores">Proveedores</Tabs.Trigger>
			<Tabs.Trigger value="documentos">Documentos</Tabs.Trigger>
			<Tabs.Trigger value="whereused">Where-Used</Tabs.Trigger>
		</Tabs.List>

		<Tabs.Content value="datos" class="flex flex-col gap-6">
			<div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
				<!-- Ingenieria -->
				<Card.Root>
					<Card.Header>
						<Card.Title>Ingenieria</Card.Title>
					</Card.Header>
					<Card.Content class="divide-border/30 flex flex-col divide-y">
						<div class="flex items-center justify-between gap-4 py-2.5">
							<span class="text-muted-foreground text-xs">Codigo</span>
							<span class="text-card-foreground text-right text-sm">{article.code}</span>
						</div>
						<div class="flex items-center justify-between gap-4 py-2.5">
							<span class="text-muted-foreground text-xs">Descripcion</span>
							{#if editing}
								<Input class="h-8 w-56" bind:value={form.description} />
							{:else}
								<span class="text-card-foreground text-right text-sm">{article.description}</span>
							{/if}
						</div>
						<div class="flex items-center justify-between gap-4 py-2.5">
							<span class="text-muted-foreground text-xs">Descripcion Generica</span>
							{#if editing}
								<Input class="h-8 w-56" bind:value={form.descriptionGeneric} placeholder="Para articulos con alta rotacion de proveedor" />
							{:else}
								<span class="text-card-foreground text-right text-sm">{article.descriptionGeneric || '---'}</span>
							{/if}
						</div>
						<div class="flex items-center justify-between gap-4 py-2.5">
							<span class="text-muted-foreground text-xs">Tipo Articulo</span>
							{#if editing}
								<Select.Root type="single" bind:value={form.articleType}>
									<Select.Trigger size="sm" class="w-44">{ARTICLE_TYPE_LABELS[form.articleType as ArticleType]}</Select.Trigger>
									<Select.Content>
										{#each Object.entries(ARTICLE_TYPE_LABELS) as [k, v] (k)}
											<Select.Item value={k}>{v}</Select.Item>
										{/each}
									</Select.Content>
								</Select.Root>
							{:else}
								<span class="text-card-foreground text-right text-sm">{ARTICLE_TYPE_LABELS[(article.articleType || 'compra') as ArticleType]}</span>
							{/if}
						</div>
						<div class="flex items-center justify-between gap-4 py-2.5">
							<span class="text-muted-foreground text-xs">Grupo</span>
							{#if editing}
								<Select.Root type="single" bind:value={form.group}>
									<Select.Trigger size="sm" class="w-44">{form.group}</Select.Trigger>
									<Select.Content>
										{#each ARTICLE_GROUPS as g (g)}
											<Select.Item value={g}>{g}</Select.Item>
										{/each}
									</Select.Content>
								</Select.Root>
							{:else}
								<span class="text-card-foreground text-right text-sm">{article.group}</span>
							{/if}
						</div>
						<div class="flex items-center justify-between gap-4 py-2.5">
							<span class="text-muted-foreground text-xs">Familia</span>
							{#if editing}
								<Input class="h-8 w-56" bind:value={form.family} />
							{:else}
								<span class="text-card-foreground text-right text-sm">{article.family || '---'}</span>
							{/if}
						</div>
						<div class="flex items-center justify-between gap-4 py-2.5">
							<span class="text-muted-foreground text-xs">UdM Base</span>
							{#if editing}
								<Select.Root type="single" bind:value={form.udmBase}>
									<Select.Trigger size="sm" class="w-44">{UDM_LABELS[form.udmBase as keyof typeof UDM_LABELS]}</Select.Trigger>
									<Select.Content>
										{#each Object.entries(UDM_LABELS) as [k, v] (k)}
											<Select.Item value={k}>{v}</Select.Item>
										{/each}
									</Select.Content>
								</Select.Root>
							{:else}
								<span class="text-card-foreground text-right text-sm">{UDM_LABELS[article.udmBase]}</span>
							{/if}
						</div>
						<div class="flex items-center justify-between gap-4 py-2.5">
							<span class="text-muted-foreground text-xs">UdM BOM</span>
							{#if editing}
								<Select.Root type="single" bind:value={form.udmBOM}>
									<Select.Trigger size="sm" class="w-44">{UDM_LABELS[form.udmBOM as keyof typeof UDM_LABELS]}</Select.Trigger>
									<Select.Content>
										{#each Object.entries(UDM_LABELS) as [k, v] (k)}
											<Select.Item value={k}>{v}</Select.Item>
										{/each}
									</Select.Content>
								</Select.Root>
							{:else}
								<span class="text-card-foreground text-right text-sm">{UDM_LABELS[article.udmBOM || article.udmBase]}</span>
							{/if}
						</div>
						<div class="flex items-center justify-between gap-4 py-2.5">
							<span class="text-muted-foreground text-xs">Dibujo/Plano</span>
							{#if editing}
								<Input class="h-8 w-56" bind:value={form.drawingRef} />
							{:else}
								<span class="text-card-foreground text-right text-sm">{article.drawingRef || '---'}</span>
							{/if}
						</div>
						<div class="flex items-center justify-between gap-4 py-2.5">
							<span class="text-muted-foreground text-xs">Codigo P5</span>
							{#if editing}
								<Input class="h-8 w-56" bind:value={form.p5Code} />
							{:else}
								<span class="text-card-foreground text-right text-sm">{article.p5Code || '---'}</span>
							{/if}
						</div>
					</Card.Content>
				</Card.Root>

				<!-- Compras -->
				<Card.Root>
					<Card.Header>
						<Card.Title>Compras</Card.Title>
					</Card.Header>
					<Card.Content class="divide-border/30 flex flex-col divide-y">
						<div class="flex items-center justify-between gap-4 py-2.5">
							<span class="text-muted-foreground flex items-center gap-1 text-xs">
								{#if !article.supplierId}<AlertTriangle class="text-chart-4 size-3" />{/if}Proveedor
							</span>
							{#if editing}
								<Select.Root
									type="single"
									bind:value={form.supplierId}
									onValueChange={(v) => {
										const sup = app.suppliers.find((s) => s.id === v);
										form.supplierName = sup?.name || '';
									}}
								>
									<Select.Trigger size="sm" class="w-44">{app.suppliers.find((s) => s.id === form.supplierId)?.name ?? 'Sin asignar'}</Select.Trigger>
									<Select.Content>
										<Select.Item value="">Sin asignar</Select.Item>
										{#each app.suppliers as s (s.id)}
											<Select.Item value={s.id}>{s.name}</Select.Item>
										{/each}
									</Select.Content>
								</Select.Root>
							{:else}
								<span class="text-card-foreground text-right text-sm">{article.supplierName || 'Sin asignar'}</span>
							{/if}
						</div>
						<div class="flex items-center justify-between gap-4 py-2.5">
							<span class="text-muted-foreground flex items-center gap-1 text-xs">
								{#if article.price === 0}<AlertTriangle class="text-chart-4 size-3" />{/if}Precio
							</span>
							{#if editing}
								<div class="flex items-center gap-1">
									<Input type="number" class="h-8 w-32" bind:value={form.price} />
									<Select.Root type="single" bind:value={form.currency}>
										<Select.Trigger size="sm" class="w-20">{form.currency}</Select.Trigger>
										<Select.Content>
											<Select.Item value="MXN">MXN</Select.Item>
											<Select.Item value="USD">USD</Select.Item>
										</Select.Content>
									</Select.Root>
								</div>
							{:else}
								<span class="text-card-foreground text-right text-sm">{article.price > 0 ? formatCurrency(article.price, article.currency) : '---'}</span>
							{/if}
						</div>
						<div class="flex items-center justify-between gap-4 py-2.5">
							<span class="text-muted-foreground text-xs">UdM Compra</span>
							{#if editing}
								<Select.Root type="single" bind:value={form.udmPurchase}>
									<Select.Trigger size="sm" class="w-44">{UDM_LABELS[form.udmPurchase as keyof typeof UDM_LABELS]}</Select.Trigger>
									<Select.Content>
										{#each Object.entries(UDM_LABELS) as [k, v] (k)}
											<Select.Item value={k}>{v}</Select.Item>
										{/each}
									</Select.Content>
								</Select.Root>
							{:else}
								<span class="text-card-foreground text-right text-sm">{UDM_LABELS[article.udmPurchase]}</span>
							{/if}
						</div>
						<div class="flex items-center justify-between gap-4 py-2.5">
							<span class="text-muted-foreground flex items-center gap-1 text-xs">
								{#if article.leadTimeDays === 0}<AlertTriangle class="text-chart-4 size-3" />{/if}Lead Time
							</span>
							{#if editing}
								<Input type="number" class="h-8 w-56" bind:value={form.leadTimeDays} />
							{:else}
								<span class="text-card-foreground text-right text-sm">{article.leadTimeDays > 0 ? `${article.leadTimeDays} dias` : '---'}</span>
							{/if}
						</div>
					</Card.Content>
				</Card.Root>

				<!-- Almacen -->
				<Card.Root>
					<Card.Header>
						<Card.Title>Almacen</Card.Title>
					</Card.Header>
					<Card.Content class="divide-border/30 flex flex-col divide-y">
						<div class="flex items-center justify-between gap-4 py-2.5">
							<span class="text-muted-foreground text-xs">Almacen</span>
							{#if editing}
								<Select.Root type="single" bind:value={form.warehouse}>
									<Select.Trigger size="sm" class="w-44">{form.warehouse}</Select.Trigger>
									<Select.Content>
										{#each WAREHOUSES as w (w)}
											<Select.Item value={w}>{w}</Select.Item>
										{/each}
									</Select.Content>
								</Select.Root>
							{:else}
								<span class="text-card-foreground text-right text-sm">{article.warehouse || 'MP - Materia Prima'}</span>
							{/if}
						</div>
						<div class="flex items-center justify-between gap-4 py-2.5">
							<span class="text-muted-foreground flex items-center gap-1 text-xs">
								{#if !article.location}<AlertTriangle class="text-chart-4 size-3" />{/if}Ubicacion
							</span>
							{#if editing}
								<Input class="h-8 w-56" bind:value={form.location} placeholder="Rack, pasillo, nivel" />
							{:else}
								<span class="text-card-foreground text-right text-sm">{article.location || '---'}</span>
							{/if}
						</div>
						<div class="flex items-center justify-between gap-4 py-2.5">
							<span class="text-muted-foreground text-xs">UdM Almacenamiento</span>
							{#if editing}
								<Select.Root type="single" bind:value={form.udmStorage}>
									<Select.Trigger size="sm" class="w-44">{UDM_LABELS[form.udmStorage as keyof typeof UDM_LABELS]}</Select.Trigger>
									<Select.Content>
										{#each Object.entries(UDM_LABELS) as [k, v] (k)}
											<Select.Item value={k}>{v}</Select.Item>
										{/each}
									</Select.Content>
								</Select.Root>
							{:else}
								<span class="text-card-foreground text-right text-sm">{UDM_LABELS[article.udmStorage]}</span>
							{/if}
						</div>
						<div class="flex items-center justify-between gap-4 py-2.5">
							<span class="text-muted-foreground text-xs">Metodo Surtimiento</span>
							{#if editing}
								<Select.Root type="single" bind:value={form.supplyMethod}>
									<Select.Trigger size="sm" class="w-44">{SUPPLY_METHODS[form.supplyMethod as keyof typeof SUPPLY_METHODS]}</Select.Trigger>
									<Select.Content>
										{#each Object.entries(SUPPLY_METHODS) as [k, v] (k)}
											<Select.Item value={k}>{v}</Select.Item>
										{/each}
									</Select.Content>
								</Select.Root>
							{:else}
								<span class="text-card-foreground text-right text-sm">{SUPPLY_METHODS[article.supplyMethod || 'bom_kit']}</span>
							{/if}
						</div>
						<div class="flex items-center justify-between gap-4 py-2.5">
							<span class="text-muted-foreground text-xs">Stock Minimo</span>
							{#if editing}
								<Input type="number" class="h-8 w-56" bind:value={form.minStock} />
							{:else}
								<span class="text-card-foreground text-right text-sm">{article.minStock}</span>
							{/if}
						</div>
						<div class="flex items-center justify-between gap-4 py-2.5">
							<span class="text-muted-foreground text-xs">Stock Maximo</span>
							{#if editing}
								<Input type="number" class="h-8 w-56" bind:value={form.maxStock} />
							{:else}
								<span class="text-card-foreground text-right text-sm">{article.maxStock}</span>
							{/if}
						</div>
						<div class="flex items-center justify-between gap-4 py-2.5">
							<span class="text-muted-foreground text-xs">Punto de Reorden</span>
							{#if editing}
								<Input type="number" class="h-8 w-56" bind:value={form.reorderPoint} />
							{:else}
								<span class="text-card-foreground text-right text-sm">{article.reorderPoint || 0}</span>
							{/if}
						</div>
						<div class="flex items-center justify-between gap-4 py-2.5">
							<span class="text-muted-foreground text-xs">Requiere Lote/Serie</span>
							{#if editing}
								<Checkbox bind:checked={form.requiresLotSerial} />
							{:else}
								<span class="text-card-foreground text-right text-sm">{article.requiresLotSerial ? 'Si' : 'No'}</span>
							{/if}
						</div>
						<div class="flex items-center justify-between gap-4 py-2.5">
							<span class="text-muted-foreground text-xs">Clasificacion ABC</span>
							{#if editing}
								<Select.Root type="single" bind:value={form.abcClass}>
									<Select.Trigger size="sm" class="w-44">{ABC_LABELS[form.abcClass as keyof typeof ABC_LABELS]}</Select.Trigger>
									<Select.Content>
										{#each Object.entries(ABC_LABELS) as [k, v] (k)}
											<Select.Item value={k}>{v}</Select.Item>
										{/each}
									</Select.Content>
								</Select.Root>
							{:else}
								<span class="text-card-foreground text-right text-sm">{ABC_LABELS[article.abcClass]}</span>
							{/if}
						</div>
					</Card.Content>
				</Card.Root>

				<!-- Produccion + Calidad -->
				<Card.Root>
					<Card.Header>
						<Card.Title>Produccion / Calidad</Card.Title>
					</Card.Header>
					<Card.Content class="divide-border/30 flex flex-col divide-y">
						<div class="flex items-center justify-between gap-4 py-2.5">
							<span class="text-muted-foreground text-xs">UdM Produccion</span>
							{#if editing}
								<Select.Root type="single" bind:value={form.udmProduction}>
									<Select.Trigger size="sm" class="w-44">{UDM_LABELS[form.udmProduction as keyof typeof UDM_LABELS]}</Select.Trigger>
									<Select.Content>
										{#each Object.entries(UDM_LABELS) as [k, v] (k)}
											<Select.Item value={k}>{v}</Select.Item>
										{/each}
									</Select.Content>
								</Select.Root>
							{:else}
								<span class="text-card-foreground text-right text-sm">{UDM_LABELS[article.udmProduction]}</span>
							{/if}
						</div>
						<div class="flex items-center justify-between gap-4 py-2.5">
							<span class="text-muted-foreground text-xs">Ruta</span>
							{#if editing}
								<Input class="h-8 w-56" bind:value={form.route} />
							{:else}
								<span class="text-card-foreground text-right text-sm">{article.route || '---'}</span>
							{/if}
						</div>
						<div class="flex items-center justify-between gap-4 py-2.5">
							<span class="text-muted-foreground text-xs">Centro de Trabajo</span>
							{#if editing}
								<Input class="h-8 w-56" bind:value={form.workCenter} />
							{:else}
								<span class="text-card-foreground text-right text-sm">{article.workCenter || '---'}</span>
							{/if}
						</div>
						<div class="flex items-center justify-between gap-4 py-2.5">
							<span class="text-muted-foreground text-xs">Grupo Calidad</span>
							{#if editing}
								<Input class="h-8 w-56" bind:value={form.qualityGroup} />
							{:else}
								<span class="text-card-foreground text-right text-sm">{article.qualityGroup || '---'}</span>
							{/if}
						</div>
						<div class="flex items-center justify-between gap-4 py-2.5">
							<span class="text-muted-foreground text-xs">Inspeccion Requerida</span>
							{#if editing}
								<Checkbox bind:checked={form.inspectionRequired} />
							{:else}
								<span class="text-card-foreground text-right text-sm">{article.inspectionRequired ? 'Si' : 'No'}</span>
							{/if}
						</div>
						<div class="flex items-center justify-between gap-4 py-2.5">
							<span class="text-muted-foreground flex items-center gap-1 text-xs">
								{#if !article.qualityApproved}<AlertTriangle class="text-chart-4 size-3" />{/if}Aprobado por Calidad
							</span>
							{#if editing}
								<Checkbox bind:checked={form.qualityApproved} />
							{:else}
								<span class="text-card-foreground text-right text-sm">{article.qualityApproved ? 'Si' : 'Pendiente'}</span>
							{/if}
						</div>
						<div class="flex items-center justify-between gap-4 py-2.5">
							<span class="text-muted-foreground text-xs">Centro de Costo</span>
							{#if editing}
								<Input class="h-8 w-56" bind:value={form.costCenter} />
							{:else}
								<span class="text-card-foreground text-right text-sm">{article.costCenter || '---'}</span>
							{/if}
						</div>
						<div class="flex items-center justify-between gap-4 py-2.5">
							<span class="text-muted-foreground text-xs">Metodo Costeo</span>
							{#if editing}
								<Select.Root type="single" bind:value={form.costMethod}>
									<Select.Trigger size="sm" class="w-44">{form.costMethod === 'especifico' ? 'Costo Especifico' : 'Costo Promedio'}</Select.Trigger>
									<Select.Content>
										<Select.Item value="promedio">Costo Promedio</Select.Item>
										<Select.Item value="especifico">Costo Especifico</Select.Item>
									</Select.Content>
								</Select.Root>
							{:else}
								<span class="text-card-foreground text-right text-sm">{article.costMethod === 'especifico' ? 'Costo Especifico' : 'Costo Promedio'}</span>
							{/if}
						</div>
						<div class="flex items-center justify-between gap-4 py-2.5">
							<span class="text-muted-foreground text-xs">Estatus</span>
							{#if editing}
								<Select.Root type="single" bind:value={form.status}>
									<Select.Trigger size="sm" class="w-44">{ARTICLE_STATUS_LABELS[form.status as keyof typeof ARTICLE_STATUS_LABELS]}</Select.Trigger>
									<Select.Content>
										{#each Object.entries(ARTICLE_STATUS_LABELS) as [k, v] (k)}
											<Select.Item value={k}>{v}</Select.Item>
										{/each}
									</Select.Content>
								</Select.Root>
							{:else}
								<span class="text-card-foreground text-right text-sm">{ARTICLE_STATUS_LABELS[article.status]}</span>
							{/if}
						</div>
					</Card.Content>
				</Card.Root>
			</div>

			<!-- UdM Conversions -->
			{#if article.conversions.length > 0}
				<Card.Root>
					<Card.Header>
						<Card.Title>Conversiones de Unidades</Card.Title>
					</Card.Header>
					<Card.Content>
						<Table.Root>
							<Table.Header>
								<Table.Row>
									<Table.Head>De</Table.Head>
									<Table.Head>A</Table.Head>
									<Table.Head class="text-right">Factor</Table.Head>
								</Table.Row>
							</Table.Header>
							<Table.Body>
								{#each article.conversions as c, i (i)}
									<Table.Row>
										<Table.Cell>{UDM_LABELS[c.from]}</Table.Cell>
										<Table.Cell>{UDM_LABELS[c.to]}</Table.Cell>
										<Table.Cell class="text-right font-mono tabular-nums">{c.factor}</Table.Cell>
									</Table.Row>
								{/each}
							</Table.Body>
						</Table.Root>
					</Card.Content>
				</Card.Root>
			{/if}
		</Tabs.Content>

		<!-- LMAT 2.0: Multi-Proveedores -->
		<Tabs.Content value="proveedores">
			<Card.Root>
				<Card.Header>
					<Card.Title class="flex items-center gap-2">
						<Truck class="text-muted-foreground size-4" /> Proveedores Alternativos
					</Card.Title>
					{#if editing}
						<Card.Action>
							<Button variant="outline" size="sm">
								<Plus data-icon="inline-start" /> Agregar
							</Button>
						</Card.Action>
					{/if}
				</Card.Header>
				<Card.Content>
					{#if (article.suppliers || []).length > 0}
						<Table.Root>
							<Table.Header>
								<Table.Row>
									<Table.Head>Proveedor</Table.Head>
									<Table.Head>Codigo Alterno</Table.Head>
									<Table.Head class="text-right">Precio</Table.Head>
									<Table.Head class="text-right">Lead Time</Table.Head>
									<Table.Head class="text-center">Principal</Table.Head>
									<Table.Head class="text-center">Aprobado</Table.Head>
								</Table.Row>
							</Table.Header>
							<Table.Body>
								{#each article.suppliers || [] as sup (sup.id)}
									<Table.Row>
										<Table.Cell>{sup.supplierName}</Table.Cell>
										<Table.Cell class="text-muted-foreground font-mono text-xs">{sup.supplierCode || '---'}</Table.Cell>
										<Table.Cell class="text-right font-mono tabular-nums">{formatCurrency(sup.price, sup.currency === 'EUR' ? 'MXN' : sup.currency)}</Table.Cell>
										<Table.Cell class="text-muted-foreground text-right">{sup.leadTimeDays} dias</Table.Cell>
										<Table.Cell class="text-center">
											{#if sup.isPrimary}<CheckCircle2 class="text-primary mx-auto size-4" />{:else}-{/if}
										</Table.Cell>
										<Table.Cell class="text-center">
											{#if sup.isApproved}<BadgeCheck class="mx-auto size-4 text-emerald-400" />{:else}<AlertTriangle class="text-chart-4 mx-auto size-4" />{/if}
										</Table.Cell>
									</Table.Row>
								{/each}
							</Table.Body>
						</Table.Root>
					{:else}
						<Empty.Root class="border-0">
							<Empty.Header>
								<Empty.Media variant="icon">
									<Truck />
								</Empty.Media>
								<Empty.Title>Sin proveedores alternativos</Empty.Title>
							</Empty.Header>
						</Empty.Root>
					{/if}
				</Card.Content>
			</Card.Root>
		</Tabs.Content>

		<!-- LMAT 2.0: Documentos Vinculados -->
		<Tabs.Content value="documentos">
			<Card.Root>
				<Card.Header>
					<Card.Title class="flex items-center gap-2">
						<FileText class="text-muted-foreground size-4" /> Documentos Vinculados
					</Card.Title>
					{#if editing}
						<Card.Action>
							<Button variant="outline" size="sm">
								<Upload data-icon="inline-start" /> Subir Documento
							</Button>
						</Card.Action>
					{/if}
				</Card.Header>
				<Card.Content>
					{#if (article.documents || []).length > 0}
						<Table.Root>
							<Table.Header>
								<Table.Row>
									<Table.Head>Tipo</Table.Head>
									<Table.Head>Archivo</Table.Head>
									<Table.Head class="text-center">Version</Table.Head>
									<Table.Head>Subido por</Table.Head>
									<Table.Head>Fecha</Table.Head>
								</Table.Row>
							</Table.Header>
							<Table.Body>
								{#each article.documents || [] as doc (doc.id)}
									<Table.Row>
										<Table.Cell>
											<StatusBadge label={DOCUMENT_TYPE_LABELS[doc.type as DocumentType]} colorClass="bg-secondary text-foreground" />
										</Table.Cell>
										<Table.Cell>
											<a href={doc.fileUrl} target="_blank" rel="noreferrer" class="text-primary flex items-center gap-1 hover:underline">
												{doc.fileName} <ExternalLink class="size-3" />
											</a>
										</Table.Cell>
										<Table.Cell class="text-muted-foreground text-center font-mono text-xs">v{doc.version}</Table.Cell>
										<Table.Cell class="text-muted-foreground">{doc.uploadedBy}</Table.Cell>
										<Table.Cell class="text-muted-foreground">{formatDate(doc.uploadedAt)}</Table.Cell>
									</Table.Row>
								{/each}
							</Table.Body>
						</Table.Root>
					{:else}
						<Empty.Root class="border-0">
							<Empty.Header>
								<Empty.Media variant="icon">
									<FileText />
								</Empty.Media>
								<Empty.Title>No hay documentos vinculados</Empty.Title>
								<Empty.Description>Dibujos tecnicos, programas CNC, fichas tecnicas, imagenes de referencia</Empty.Description>
							</Empty.Header>
						</Empty.Root>
					{/if}
				</Card.Content>
			</Card.Root>
		</Tabs.Content>

		<!-- Where-Used -->
		<Tabs.Content value="whereused">
			<Card.Root>
				<Card.Header>
					<Card.Title>Where-Used (BOMs que usan este articulo)</Card.Title>
				</Card.Header>
				<Card.Content>
					{#if whereUsed.length > 0}
						<Table.Root>
							<Table.Header>
								<Table.Row>
									<Table.Head>Especificacion</Table.Head>
									<Table.Head>Modelo</Table.Head>
									<Table.Head>Nivel</Table.Head>
									<Table.Head class="text-right">Cantidad</Table.Head>
									<Table.Head>Celda</Table.Head>
								</Table.Row>
							</Table.Header>
							<Table.Body>
								{#each whereUsed as bom (bom.id)}
									{@const comp = bom.components.find((c) => c.articleId === article.id)}
									<Table.Row>
										<Table.Cell>
											<a href="/lmat/boms/{bom.id}" class="text-primary font-mono text-xs hover:underline">{bom.specificationCode}</a>
										</Table.Cell>
										<Table.Cell>{bom.vehicleModel}</Table.Cell>
										<Table.Cell>{bom.armorLevel}</Table.Cell>
										<Table.Cell class="text-right font-mono tabular-nums">{comp?.quantity} {comp ? UDM_LABELS[comp.udm] : ''}</Table.Cell>
										<Table.Cell class="text-muted-foreground">{comp?.cell}</Table.Cell>
									</Table.Row>
								{/each}
							</Table.Body>
						</Table.Root>
					{:else}
						<Empty.Root class="border-0">
							<Empty.Header>
								<Empty.Media variant="icon">
									<FileText />
								</Empty.Media>
								<Empty.Title>Este articulo no aparece en ningun BOM.</Empty.Title>
							</Empty.Header>
						</Empty.Root>
					{/if}
				</Card.Content>
			</Card.Root>
		</Tabs.Content>
	</Tabs.Root>

	<!-- Metadata -->
	<div class="text-muted-foreground flex items-center gap-4 text-xs">
		<span>Creado: {formatDate(article.createdAt)}</span>
		<span>Modificado: {formatDate(article.updatedAt)}</span>
		<span>Planta: {article.plant}</span>
	</div>
{/if}
