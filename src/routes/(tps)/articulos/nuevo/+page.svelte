<script lang="ts">
	import { goto } from '$app/navigation';
	import { useStore } from '$lib/tps/store.svelte.js';
	import { UDM_LABELS, ARTICLE_GROUPS, ABC_LABELS, PLANT_LABELS } from '$lib/tps/constants.js';
	import { generateId } from '$lib/tps/utils.js';
	import type { Article, UdM, Plant, ABCClass } from '$lib/tps/types.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import * as Alert from '$lib/components/ui/alert/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Checkbox } from '$lib/components/ui/checkbox/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import ArrowLeft from '@lucide/svelte/icons/arrow-left';
	import Save from '@lucide/svelte/icons/save';
	import AlertTriangle from '@lucide/svelte/icons/triangle-alert';

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

<div class="mx-auto flex w-full max-w-4xl flex-col gap-6">
	<div class="flex flex-wrap items-center justify-between gap-3">
		<Button href="/articulos" variant="outline" size="sm">
			<ArrowLeft data-icon="inline-start" /> Volver
		</Button>
		<p class="text-muted-foreground text-sm">Completa los campos obligatorios para crear el articulo</p>
	</div>

	{#if errors.length > 0}
		<Alert.Root variant="destructive">
			<AlertTriangle />
			<Alert.Title>Revisa los siguientes campos</Alert.Title>
			<Alert.Description>
				<ul class="list-disc pl-4">
					{#each errors as e, i (i)}
						<li>{e}</li>
					{/each}
				</ul>
			</Alert.Description>
		</Alert.Root>
	{/if}

	<!-- Datos Basicos -->
	<Card.Root>
		<Card.Header>
			<Card.Title>Datos Basicos</Card.Title>
		</Card.Header>
		<Card.Content class="flex flex-col gap-4">
			<div class="grid gap-4 md:grid-cols-2">
				<div class="grid gap-2">
					<Label for="code">Codigo *</Label>
					<Input id="code" bind:value={form.code} placeholder="e.g. ACB-6MM-002" />
				</div>
				<div class="grid gap-2">
					<Label for="description">Descripcion *</Label>
					<Input id="description" bind:value={form.description} placeholder="Descripcion detallada del articulo" />
				</div>
			</div>
			<div class="grid gap-4 md:grid-cols-2">
				<div class="grid gap-2">
					<Label>Grupo</Label>
					<Select.Root type="single" bind:value={form.group}>
						<Select.Trigger class="w-full">{form.group}</Select.Trigger>
						<Select.Content>
							{#each ARTICLE_GROUPS as g (g)}
								<Select.Item value={g}>{g}</Select.Item>
							{/each}
						</Select.Content>
					</Select.Root>
				</div>
				<div class="grid gap-2">
					<Label>UdM Base</Label>
					<Select.Root type="single" bind:value={form.udmBase}>
						<Select.Trigger class="w-full">{UDM_LABELS[form.udmBase]}</Select.Trigger>
						<Select.Content>
							{#each Object.entries(UDM_LABELS) as [k, v] (k)}
								<Select.Item value={k}>{v}</Select.Item>
							{/each}
						</Select.Content>
					</Select.Root>
				</div>
			</div>
			<div class="grid gap-4 md:grid-cols-2">
				<div class="grid gap-2">
					<Label>Planta</Label>
					<Select.Root type="single" bind:value={form.plant}>
						<Select.Trigger class="w-full">{PLANT_LABELS[form.plant]}</Select.Trigger>
						<Select.Content>
							<Select.Item value="planta_1">Planta 1</Select.Item>
							<Select.Item value="planta_2">Planta 2</Select.Item>
							<Select.Item value="almacen_servicios">Almacen Servicios</Select.Item>
						</Select.Content>
					</Select.Root>
				</div>
				<div class="grid gap-2">
					<Label for="drawingRef">Dibujo / Plano</Label>
					<Input id="drawingRef" bind:value={form.drawingRef} />
				</div>
			</div>
			<div class="grid gap-2">
				<Label for="p5Code">Codigo P5</Label>
				<Input id="p5Code" bind:value={form.p5Code} />
			</div>
		</Card.Content>
	</Card.Root>

	<!-- Compras -->
	<Card.Root>
		<Card.Header>
			<Card.Title>Compras</Card.Title>
		</Card.Header>
		<Card.Content class="flex flex-col gap-4">
			<div class="grid gap-2">
				<Label>Proveedor</Label>
				<Select.Root type="single" bind:value={form.supplierId}>
					<Select.Trigger class="w-full">{app.suppliers.find((s) => s.id === form.supplierId)?.name ?? 'Sin asignar'}</Select.Trigger>
					<Select.Content>
						<Select.Item value="">Sin asignar</Select.Item>
						{#each app.suppliers as s (s.id)}
							<Select.Item value={s.id}>{s.name}</Select.Item>
						{/each}
					</Select.Content>
				</Select.Root>
			</div>
			<div class="grid gap-4 md:grid-cols-2">
				<div class="grid gap-2">
					<Label for="price">Precio</Label>
					<div class="flex gap-2">
						<Input id="price" type="number" class="flex-1" bind:value={form.price} />
						<Select.Root type="single" bind:value={form.currency}>
							<Select.Trigger class="w-24">{form.currency}</Select.Trigger>
							<Select.Content>
								<Select.Item value="MXN">MXN</Select.Item>
								<Select.Item value="USD">USD</Select.Item>
							</Select.Content>
						</Select.Root>
					</div>
				</div>
				<div class="grid gap-2">
					<Label>UdM Compra</Label>
					<Select.Root type="single" bind:value={form.udmPurchase}>
						<Select.Trigger class="w-full">{UDM_LABELS[form.udmPurchase]}</Select.Trigger>
						<Select.Content>
							{#each Object.entries(UDM_LABELS) as [k, v] (k)}
								<Select.Item value={k}>{v}</Select.Item>
							{/each}
						</Select.Content>
					</Select.Root>
				</div>
			</div>
			<div class="grid gap-2">
				<Label for="leadTimeDays">Lead Time (dias)</Label>
				<Input id="leadTimeDays" type="number" bind:value={form.leadTimeDays} />
			</div>
		</Card.Content>
	</Card.Root>

	<!-- Almacen -->
	<Card.Root>
		<Card.Header>
			<Card.Title>Almacen</Card.Title>
		</Card.Header>
		<Card.Content class="flex flex-col gap-4">
			<div class="grid gap-4 md:grid-cols-2">
				<div class="grid gap-2">
					<Label for="location">Ubicacion</Label>
					<Input id="location" bind:value={form.location} placeholder="e.g. A-01-01" />
				</div>
				<div class="grid gap-2">
					<Label>UdM Almacenamiento</Label>
					<Select.Root type="single" bind:value={form.udmStorage}>
						<Select.Trigger class="w-full">{UDM_LABELS[form.udmStorage]}</Select.Trigger>
						<Select.Content>
							{#each Object.entries(UDM_LABELS) as [k, v] (k)}
								<Select.Item value={k}>{v}</Select.Item>
							{/each}
						</Select.Content>
					</Select.Root>
				</div>
			</div>
			<div class="grid gap-4 md:grid-cols-2">
				<div class="grid gap-2">
					<Label for="minStock">Stock Minimo</Label>
					<Input id="minStock" type="number" bind:value={form.minStock} />
				</div>
				<div class="grid gap-2">
					<Label for="maxStock">Stock Maximo</Label>
					<Input id="maxStock" type="number" bind:value={form.maxStock} />
				</div>
			</div>
			<div class="grid gap-2">
				<Label>Clasificacion ABC</Label>
				<Select.Root type="single" bind:value={form.abcClass}>
					<Select.Trigger class="w-full">{ABC_LABELS[form.abcClass]}</Select.Trigger>
					<Select.Content>
						{#each Object.entries(ABC_LABELS) as [k, v] (k)}
							<Select.Item value={k}>{v}</Select.Item>
						{/each}
					</Select.Content>
				</Select.Root>
			</div>
		</Card.Content>
	</Card.Root>

	<!-- Produccion / Calidad -->
	<Card.Root>
		<Card.Header>
			<Card.Title>Produccion / Calidad</Card.Title>
		</Card.Header>
		<Card.Content class="flex flex-col gap-4">
			<div class="grid gap-4 md:grid-cols-2">
				<div class="grid gap-2">
					<Label>UdM Produccion</Label>
					<Select.Root type="single" bind:value={form.udmProduction}>
						<Select.Trigger class="w-full">{UDM_LABELS[form.udmProduction]}</Select.Trigger>
						<Select.Content>
							{#each Object.entries(UDM_LABELS) as [k, v] (k)}
								<Select.Item value={k}>{v}</Select.Item>
							{/each}
						</Select.Content>
					</Select.Root>
				</div>
				<div class="grid gap-2">
					<Label for="route">Ruta</Label>
					<Input id="route" bind:value={form.route} />
				</div>
			</div>
			<div class="grid gap-4 md:grid-cols-2">
				<div class="grid gap-2">
					<Label for="workCenter">Centro de Trabajo</Label>
					<Input id="workCenter" bind:value={form.workCenter} />
				</div>
				<div class="grid gap-2">
					<Label for="qualityGroup">Grupo Calidad</Label>
					<Input id="qualityGroup" bind:value={form.qualityGroup} />
				</div>
			</div>
			<div class="flex items-center gap-2">
				<Checkbox id="inspectionRequired" bind:checked={form.inspectionRequired} />
				<Label for="inspectionRequired">Inspeccion Requerida</Label>
			</div>
		</Card.Content>
	</Card.Root>

	<div class="flex items-center justify-end gap-3">
		<Button href="/articulos" variant="outline">Cancelar</Button>
		<Button onclick={handleSave}>
			<Save data-icon="inline-start" /> Crear Articulo
		</Button>
	</div>
</div>
