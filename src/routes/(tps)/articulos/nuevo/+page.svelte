<script lang="ts">
	import { goto } from '$app/navigation';
	import { useStore } from '$lib/tps/store.svelte.js';
	import { UDM_LABELS, ARTICLE_GROUPS, ABC_LABELS } from '$lib/tps/constants.js';
	import { generateId } from '$lib/tps/utils.js';
	import type { Article, UdM, Plant, ABCClass } from '$lib/tps/types.js';
	import ArrowLeft from '@lucide/svelte/icons/arrow-left';
	import Save from '@lucide/svelte/icons/save';

	const store = useStore();
	const app = $derived(store.state);

	let form = $state({
		code: '',
		description: '',
		group: 'Varios',
		udmBase: 'pieza' as UdM,
		drawingRef: '',
		supplierId: '',
		price: 0,
		currency: 'MXN' as 'MXN' | 'USD',
		udmPurchase: 'pieza' as UdM,
		leadTimeDays: 0,
		location: '',
		udmStorage: 'pieza' as UdM,
		minStock: 0,
		maxStock: 0,
		udmProduction: 'pieza' as UdM,
		route: '',
		workCenter: '',
		qualityGroup: '',
		inspectionRequired: false,
		abcClass: 'sin_clasificar' as ABCClass,
		p5Code: '',
		plant: (app.currentPlant !== 'todas' ? app.currentPlant : 'planta_1') as Plant
	});

	let errors = $state<string[]>([]);

	function validate(): string[] {
		const errs: string[] = [];
		if (!form.code.trim()) errs.push('Codigo es obligatorio');
		if (!form.description.trim()) errs.push('Descripcion es obligatoria');
		if (app.articles.some((a) => a.code === form.code.trim()))
			errs.push('Ya existe un articulo con este codigo');
		return errs;
	}

	function handleSave() {
		const errs = validate();
		if (errs.length > 0) {
			errors = errs;
			return;
		}

		const supplier = app.suppliers.find((s) => s.id === form.supplierId);
		const today = new Date().toISOString().split('T')[0];
		const article: Article = {
			id: generateId(),
			code: form.code.trim(),
			description: form.description.trim(),
			descriptionGeneric: '',
			articleType: 'compra',
			udmBase: form.udmBase,
			udmBOM: form.udmBase,
			drawingRef: form.drawingRef,
			group: form.group,
			family: '',
			supplierId: form.supplierId,
			supplierName: supplier?.name || '',
			price: form.price,
			currency: form.currency,
			udmPurchase: form.udmPurchase,
			leadTimeDays: form.leadTimeDays,
			suppliers: [],
			location: form.location,
			warehouse: 'MP - Materia Prima',
			udmStorage: form.udmStorage,
			minStock: form.minStock,
			maxStock: form.maxStock,
			reorderPoint: 0,
			supplyMethod: 'bom_kit',
			requiresLotSerial: false,
			route: form.route,
			workCenter: form.workCenter,
			udmProduction: form.udmProduction,
			productionRoute: [],
			subBOMId: null,
			cncProgramId: null,
			qualityGroup: form.qualityGroup,
			inspectionRequired: form.inspectionRequired,
			qualityApproved: false,
			costCenter: '',
			costMethod: 'promedio',
			abcClass: form.abcClass,
			status: 'borrador',
			completeness: 0,
			conversions: [],
			plant: form.plant,
			p5Code: form.p5Code,
			documents: [],
			imageUrl: '',
			createdAt: today,
			updatedAt: today,
			createdBy: app.currentUser.id
		};

		store.dispatch({ type: 'ADD_ARTICLE', payload: article });
		store.dispatch({
			type: 'ADD_AUDIT_LOG',
			payload: {
				id: generateId(),
				userId: app.currentUser.id,
				userName: app.currentUser.name,
				entity: 'Article',
				entityId: article.id,
				action: 'crear',
				field: 'nuevo',
				oldValue: '',
				newValue: article.code,
				timestamp: new Date().toISOString()
			}
		});
		goto(`/articulos/${article.id}`);
	}
</script>

<div class="flex max-w-3xl flex-col gap-6">
	<div class="flex items-center gap-3">
		<a
			href="/articulos"
			class="border-border hover:bg-secondary flex h-8 w-8 items-center justify-center rounded-md border transition-colors"
		>
			<ArrowLeft class="text-foreground h-4 w-4" />
		</a>
		<div>
			<h1 class="text-foreground text-xl font-bold">Nuevo Articulo</h1>
			<p class="text-muted-foreground text-sm">Completa los campos obligatorios para crear el articulo</p>
		</div>
	</div>

	{#if errors.length > 0}
		<div class="border-destructive/30 bg-destructive/10 rounded-md border p-3">
			{#each errors as e, i (i)}
				<p class="text-destructive-foreground text-sm">{e}</p>
			{/each}
		</div>
	{/if}

	<div class="flex flex-col gap-4">
		<!-- Datos Basicos -->
		<div class="border-border bg-card rounded-lg border">
			<div class="border-border border-b px-4 py-2.5">
				<h3 class="text-card-foreground text-sm font-semibold">Datos Basicos</h3>
			</div>
			<div class="flex flex-col gap-3 p-4">
				<div class="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-4">
					<label class="text-muted-foreground shrink-0 text-xs sm:w-36 sm:text-right">Codigo *</label>
					<div class="flex-1">
						<input class="form-input" bind:value={form.code} placeholder="e.g. ACB-6MM-002" />
					</div>
				</div>
				<div class="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-4">
					<label class="text-muted-foreground shrink-0 text-xs sm:w-36 sm:text-right">Descripcion *</label>
					<div class="flex-1">
						<input class="form-input" bind:value={form.description} placeholder="Descripcion detallada del articulo" />
					</div>
				</div>
				<div class="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-4">
					<label class="text-muted-foreground shrink-0 text-xs sm:w-36 sm:text-right">Grupo</label>
					<div class="flex-1">
						<select class="form-input" bind:value={form.group}>
							{#each ARTICLE_GROUPS as g (g)}
								<option value={g}>{g}</option>
							{/each}
						</select>
					</div>
				</div>
				<div class="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-4">
					<label class="text-muted-foreground shrink-0 text-xs sm:w-36 sm:text-right">UdM Base</label>
					<div class="flex-1">
						<select class="form-input" bind:value={form.udmBase}>
							{#each Object.entries(UDM_LABELS) as [k, v] (k)}
								<option value={k}>{v}</option>
							{/each}
						</select>
					</div>
				</div>
				<div class="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-4">
					<label class="text-muted-foreground shrink-0 text-xs sm:w-36 sm:text-right">Planta</label>
					<div class="flex-1">
						<select class="form-input" bind:value={form.plant}>
							<option value="planta_1">Planta 1</option>
							<option value="planta_2">Planta 2</option>
							<option value="almacen_servicios">Almacen Servicios</option>
						</select>
					</div>
				</div>
				<div class="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-4">
					<label class="text-muted-foreground shrink-0 text-xs sm:w-36 sm:text-right">Dibujo / Plano</label>
					<div class="flex-1">
						<input class="form-input" bind:value={form.drawingRef} />
					</div>
				</div>
				<div class="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-4">
					<label class="text-muted-foreground shrink-0 text-xs sm:w-36 sm:text-right">Codigo P5</label>
					<div class="flex-1">
						<input class="form-input" bind:value={form.p5Code} />
					</div>
				</div>
			</div>
		</div>

		<!-- Compras -->
		<div class="border-border bg-card rounded-lg border">
			<div class="border-border border-b px-4 py-2.5">
				<h3 class="text-card-foreground text-sm font-semibold">Compras</h3>
			</div>
			<div class="flex flex-col gap-3 p-4">
				<div class="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-4">
					<label class="text-muted-foreground shrink-0 text-xs sm:w-36 sm:text-right">Proveedor</label>
					<div class="flex-1">
						<select class="form-input" bind:value={form.supplierId}>
							<option value="">Sin asignar</option>
							{#each app.suppliers as s (s.id)}
								<option value={s.id}>{s.name}</option>
							{/each}
						</select>
					</div>
				</div>
				<div class="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-4">
					<label class="text-muted-foreground shrink-0 text-xs sm:w-36 sm:text-right">Precio</label>
					<div class="flex-1">
						<div class="flex gap-2">
							<input type="number" class="form-input flex-1" bind:value={form.price} />
							<select class="form-input w-20" bind:value={form.currency}>
								<option value="MXN">MXN</option>
								<option value="USD">USD</option>
							</select>
						</div>
					</div>
				</div>
				<div class="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-4">
					<label class="text-muted-foreground shrink-0 text-xs sm:w-36 sm:text-right">UdM Compra</label>
					<div class="flex-1">
						<select class="form-input" bind:value={form.udmPurchase}>
							{#each Object.entries(UDM_LABELS) as [k, v] (k)}
								<option value={k}>{v}</option>
							{/each}
						</select>
					</div>
				</div>
				<div class="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-4">
					<label class="text-muted-foreground shrink-0 text-xs sm:w-36 sm:text-right">Lead Time (dias)</label>
					<div class="flex-1">
						<input type="number" class="form-input" bind:value={form.leadTimeDays} />
					</div>
				</div>
			</div>
		</div>

		<!-- Almacen -->
		<div class="border-border bg-card rounded-lg border">
			<div class="border-border border-b px-4 py-2.5">
				<h3 class="text-card-foreground text-sm font-semibold">Almacen</h3>
			</div>
			<div class="flex flex-col gap-3 p-4">
				<div class="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-4">
					<label class="text-muted-foreground shrink-0 text-xs sm:w-36 sm:text-right">Ubicacion</label>
					<div class="flex-1">
						<input class="form-input" bind:value={form.location} placeholder="e.g. A-01-01" />
					</div>
				</div>
				<div class="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-4">
					<label class="text-muted-foreground shrink-0 text-xs sm:w-36 sm:text-right">UdM Almacenamiento</label>
					<div class="flex-1">
						<select class="form-input" bind:value={form.udmStorage}>
							{#each Object.entries(UDM_LABELS) as [k, v] (k)}
								<option value={k}>{v}</option>
							{/each}
						</select>
					</div>
				</div>
				<div class="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-4">
					<label class="text-muted-foreground shrink-0 text-xs sm:w-36 sm:text-right">Stock Minimo</label>
					<div class="flex-1">
						<input type="number" class="form-input" bind:value={form.minStock} />
					</div>
				</div>
				<div class="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-4">
					<label class="text-muted-foreground shrink-0 text-xs sm:w-36 sm:text-right">Stock Maximo</label>
					<div class="flex-1">
						<input type="number" class="form-input" bind:value={form.maxStock} />
					</div>
				</div>
				<div class="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-4">
					<label class="text-muted-foreground shrink-0 text-xs sm:w-36 sm:text-right">Clasificacion ABC</label>
					<div class="flex-1">
						<select class="form-input" bind:value={form.abcClass}>
							{#each Object.entries(ABC_LABELS) as [k, v] (k)}
								<option value={k}>{v}</option>
							{/each}
						</select>
					</div>
				</div>
			</div>
		</div>

		<!-- Produccion / Calidad -->
		<div class="border-border bg-card rounded-lg border">
			<div class="border-border border-b px-4 py-2.5">
				<h3 class="text-card-foreground text-sm font-semibold">Produccion / Calidad</h3>
			</div>
			<div class="flex flex-col gap-3 p-4">
				<div class="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-4">
					<label class="text-muted-foreground shrink-0 text-xs sm:w-36 sm:text-right">UdM Produccion</label>
					<div class="flex-1">
						<select class="form-input" bind:value={form.udmProduction}>
							{#each Object.entries(UDM_LABELS) as [k, v] (k)}
								<option value={k}>{v}</option>
							{/each}
						</select>
					</div>
				</div>
				<div class="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-4">
					<label class="text-muted-foreground shrink-0 text-xs sm:w-36 sm:text-right">Ruta</label>
					<div class="flex-1">
						<input class="form-input" bind:value={form.route} />
					</div>
				</div>
				<div class="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-4">
					<label class="text-muted-foreground shrink-0 text-xs sm:w-36 sm:text-right">Centro de Trabajo</label>
					<div class="flex-1">
						<input class="form-input" bind:value={form.workCenter} />
					</div>
				</div>
				<div class="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-4">
					<label class="text-muted-foreground shrink-0 text-xs sm:w-36 sm:text-right">Grupo Calidad</label>
					<div class="flex-1">
						<input class="form-input" bind:value={form.qualityGroup} />
					</div>
				</div>
				<div class="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-4">
					<label class="text-muted-foreground shrink-0 text-xs sm:w-36 sm:text-right">Inspeccion Requerida</label>
					<div class="flex-1">
						<select
							class="form-input"
							onchange={(e) => (form.inspectionRequired = e.currentTarget.value === 'true')}
						>
							<option value="false" selected={!form.inspectionRequired}>No</option>
							<option value="true" selected={form.inspectionRequired}>Si</option>
						</select>
					</div>
				</div>
			</div>
		</div>
	</div>

	<div class="flex items-center gap-3">
		<a
			href="/articulos"
			class="border-border text-foreground hover:bg-secondary rounded-md border px-4 py-2 text-sm transition-colors"
			>Cancelar</a
		>
		<button
			onclick={handleSave}
			class="bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors"
		>
			<Save class="h-4 w-4" /> Crear Articulo
		</button>
	</div>
</div>

<style>
	.form-input {
		width: 100%;
		border-radius: 0.375rem;
		border: 1px solid var(--border);
		background: var(--secondary);
		padding: 0.5rem 0.75rem;
		font-size: 0.875rem;
		color: var(--foreground);
		outline: none;
	}
	.form-input:focus {
		border-color: var(--primary);
	}
</style>
