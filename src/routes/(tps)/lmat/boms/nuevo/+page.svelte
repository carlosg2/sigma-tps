<script lang="ts">
	import { useStore } from '$lib/tps/store.svelte.js';
	import { goto } from '$app/navigation';
	import { VEHICLE_MODELS, ARMOR_LEVEL_LABELS, PLANT_CELLS, UDM_LABELS } from '$lib/tps/constants.js';
	import { generateId } from '$lib/tps/utils.js';
	import type { BOM, BOMComponent, ArmorLevel, Plant } from '$lib/tps/types.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Table from '$lib/components/ui/table/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import * as Alert from '$lib/components/ui/alert/index.js';
	import * as Empty from '$lib/components/ui/empty/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import ArrowLeft from '@lucide/svelte/icons/arrow-left';
	import Save from '@lucide/svelte/icons/save';
	import Plus from '@lucide/svelte/icons/plus';
	import Trash2 from '@lucide/svelte/icons/trash-2';
	import Search from '@lucide/svelte/icons/search';
	import TriangleAlert from '@lucide/svelte/icons/triangle-alert';
	import PackageIcon from '@lucide/svelte/icons/package';

	const store = useStore();
	const app = $derived(store.state);
	const defaultPlant: Plant = store.state.currentPlant !== 'todas' ? store.state.currentPlant : 'planta_1';

	let form = $state({
		specificationCode: '',
		vehicleModel: VEHICLE_MODELS[0],
		armorLevel: 'NIII' as ArmorLevel,
		plant: defaultPlant as Plant
	});
	let components = $state<BOMComponent[]>([]);
	let errors = $state<string[]>([]);

	// Article search for adding components
	let searchQ = $state('');
	let showSearch = $state(false);

	const matchingArticles = $derived.by(() =>
		searchQ.length >= 2
			? app.articles
					.filter((a) => `${a.code} ${a.description}`.toLowerCase().includes(searchQ.toLowerCase()))
					.slice(0, 8)
			: []
	);

	const cells = $derived(PLANT_CELLS[form.plant as Plant] || []);

	function addComponent(articleId: string) {
		const article = app.articles.find((a) => a.id === articleId);
		if (!article) return;
		if (components.some((c) => c.articleId === articleId)) return;
		const plantCells = PLANT_CELLS[form.plant as Plant];
		components = [
			...components,
			{
				id: generateId(),
				articleId,
				articleCode: article.code,
				articleDescription: article.description,
				quantity: 1,
				udm: article.udmBase,
				cell: plantCells[0] || 'Celda 1',
				operation: '',
				notes: '',
				hasCompleteData: article.completeness >= 80,
				parentId: null,
				order: components.length,
				level: 0,
				isKit: false
			}
		];
		searchQ = '';
		showSearch = false;
	}

	function removeComponent(id: string) {
		components = components.filter((c) => c.id !== id);
	}

	function updateComponent(id: string, field: keyof BOMComponent, value: unknown) {
		components = components.map((c) => (c.id === id ? { ...c, [field]: value } : c)) as BOMComponent[];
	}

	function validate(): string[] {
		const errs: string[] = [];
		if (!form.specificationCode.trim()) errs.push('Codigo de especificacion es obligatorio');
		if (app.boms.some((b) => b.specificationCode === form.specificationCode.trim()))
			errs.push('Ya existe un BOM con este codigo');
		if (components.length === 0) errs.push('Agrega al menos un componente');
		return errs;
	}

	function handleSave() {
		const errs = validate();
		if (errs.length > 0) {
			errors = errs;
			return;
		}

		const bom: BOM = {
			id: generateId(),
			specificationCode: form.specificationCode.trim(),
			vehicleModel: form.vehicleModel,
			armorLevel: form.armorLevel,
			plant: form.plant as Plant,
			version: 1,
			status: 'borrador',
			maturityStatus: 'en_desarrollo',
			components,
			revisions: [],
			healthPercent: 0,
			departmentValidations: [],
			specificationId: null,
			plantRoutes: [],
			cuttingKitIds: [],
			createdAt: new Date().toISOString().split('T')[0],
			updatedAt: new Date().toISOString().split('T')[0],
			createdBy: app.currentUser.name
		};

		store.dispatch({ type: 'ADD_BOM', payload: bom });
		store.dispatch({
			type: 'ADD_AUDIT_LOG',
			payload: {
				id: generateId(),
				userId: app.currentUser.id,
				userName: app.currentUser.name,
				entity: 'BOM',
				entityId: bom.id,
				action: 'crear',
				field: 'nuevo',
				oldValue: '',
				newValue: bom.specificationCode,
				timestamp: new Date().toISOString()
			}
		});
		goto('/lmat/boms');
	}
</script>

<div class="mx-auto flex w-full max-w-5xl flex-col gap-6">
	<div class="flex items-center gap-3">
		<Button href="/lmat/boms" variant="outline" size="icon">
			<ArrowLeft />
		</Button>
		<p class="text-muted-foreground text-sm">Define la especificacion y sus componentes</p>
	</div>

	{#if errors.length > 0}
		<Alert.Root variant="destructive">
			<TriangleAlert />
			<Alert.Title>Revisa los siguientes errores</Alert.Title>
			<Alert.Description>
				<ul class="list-disc pl-4">
					{#each errors as e, i (i)}
						<li>{e}</li>
					{/each}
				</ul>
			</Alert.Description>
		</Alert.Root>
	{/if}

	<!-- Header fields -->
	<Card.Root>
		<Card.Header>
			<Card.Title>Datos del BOM</Card.Title>
		</Card.Header>
		<Card.Content>
			<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
				<div class="grid gap-2">
					<Label for="spec-code">Codigo de Especificacion *</Label>
					<Input id="spec-code" bind:value={form.specificationCode} placeholder="e.g. ESP-LC300-NIII-P1" />
				</div>
				<div class="grid gap-2">
					<Label>Modelo de Vehiculo</Label>
					<Select.Root type="single" bind:value={form.vehicleModel}>
						<Select.Trigger class="w-full">{form.vehicleModel}</Select.Trigger>
						<Select.Content>
							{#each VEHICLE_MODELS as m (m)}
								<Select.Item value={m}>{m}</Select.Item>
							{/each}
						</Select.Content>
					</Select.Root>
				</div>
				<div class="grid gap-2">
					<Label>Nivel de Blindaje</Label>
					<Select.Root type="single" bind:value={form.armorLevel}>
						<Select.Trigger class="w-full">{ARMOR_LEVEL_LABELS[form.armorLevel]}</Select.Trigger>
						<Select.Content>
							{#each Object.entries(ARMOR_LEVEL_LABELS) as [k, v] (k)}
								<Select.Item value={k}>{v}</Select.Item>
							{/each}
						</Select.Content>
					</Select.Root>
				</div>
				<div class="grid gap-2">
					<Label>Planta</Label>
					<Select.Root type="single" bind:value={form.plant}>
						<Select.Trigger class="w-full">{form.plant === 'planta_1' ? 'Planta 1' : 'Planta 2'}</Select.Trigger>
						<Select.Content>
							<Select.Item value="planta_1">Planta 1</Select.Item>
							<Select.Item value="planta_2">Planta 2</Select.Item>
						</Select.Content>
					</Select.Root>
				</div>
			</div>
		</Card.Content>
	</Card.Root>

	<!-- Components -->
	<Card.Root>
		<Card.Header>
			<Card.Title>Componentes ({components.length})</Card.Title>
			<Card.Action>
				<Button size="sm" onclick={() => (showSearch = !showSearch)}>
					<Plus data-icon="inline-start" /> Agregar
				</Button>
			</Card.Action>
		</Card.Header>
		<Card.Content class="flex flex-col gap-4">
			{#if showSearch}
				<div class="flex flex-col gap-2">
					<div class="relative w-full">
						<Search class="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
						<Input placeholder="Buscar articulo por codigo o descripcion..." bind:value={searchQ} class="pl-8" />
					</div>
					{#if matchingArticles.length > 0}
						<div class="flex max-h-48 flex-col overflow-hidden overflow-y-auto rounded-md border">
							{#each matchingArticles as a (a.id)}
								<button
									onclick={() => addComponent(a.id)}
									class="hover:bg-accent border-border/30 flex items-center gap-2 border-b px-3 py-1.5 text-left text-xs transition-colors last:border-0"
								>
									<span class="text-primary font-mono">{a.code}</span>
									<span class="text-foreground flex-1 truncate">{a.description}</span>
									{#if components.some((c) => c.articleId === a.id)}
										<span class="text-muted-foreground text-xs">(ya agregado)</span>
									{/if}
								</button>
							{/each}
						</div>
					{/if}
				</div>
			{/if}

			{#if components.length > 0}
				<Table.Root>
					<Table.Header>
						<Table.Row>
							<Table.Head>Codigo</Table.Head>
							<Table.Head>Descripcion</Table.Head>
							<Table.Head class="w-20">Cant.</Table.Head>
							<Table.Head class="w-28">UdM</Table.Head>
							<Table.Head class="w-28">Celda</Table.Head>
							<Table.Head>Operacion</Table.Head>
							<Table.Head class="w-8"></Table.Head>
						</Table.Row>
					</Table.Header>
					<Table.Body>
						{#each components as comp (comp.id)}
							<Table.Row>
								<Table.Cell>
									<span class="text-primary font-mono text-xs">{comp.articleCode}</span>
								</Table.Cell>
								<Table.Cell class="max-w-45 truncate text-xs">{comp.articleDescription}</Table.Cell>
								<Table.Cell>
									<Input
										type="number"
										min="0.01"
										step="0.01"
										value={comp.quantity}
										oninput={(e) => updateComponent(comp.id, 'quantity', parseFloat(e.currentTarget.value) || 0)}
										class="h-8"
									/>
								</Table.Cell>
								<Table.Cell>
									<Select.Root type="single" value={comp.udm} onValueChange={(v) => updateComponent(comp.id, 'udm', v)}>
										<Select.Trigger size="sm" class="w-full">{UDM_LABELS[comp.udm]}</Select.Trigger>
										<Select.Content>
											{#each Object.entries(UDM_LABELS) as [k, v] (k)}
												<Select.Item value={k}>{v}</Select.Item>
											{/each}
										</Select.Content>
									</Select.Root>
								</Table.Cell>
								<Table.Cell>
									<Select.Root type="single" value={comp.cell} onValueChange={(v) => updateComponent(comp.id, 'cell', v)}>
										<Select.Trigger size="sm" class="w-full">{comp.cell}</Select.Trigger>
										<Select.Content>
											{#each cells as c (c)}
												<Select.Item value={c}>{c}</Select.Item>
											{/each}
										</Select.Content>
									</Select.Root>
								</Table.Cell>
								<Table.Cell>
									<Input
										value={comp.operation}
										oninput={(e) => updateComponent(comp.id, 'operation', e.currentTarget.value)}
										placeholder="Operacion..."
										class="h-8"
									/>
								</Table.Cell>
								<Table.Cell>
									<Button variant="ghost" size="icon" class="size-8" onclick={() => removeComponent(comp.id)}>
										<Trash2 />
									</Button>
								</Table.Cell>
							</Table.Row>
						{/each}
					</Table.Body>
				</Table.Root>
			{:else}
				<Empty.Root class="border-0">
					<Empty.Header>
						<Empty.Media variant="icon">
							<PackageIcon />
						</Empty.Media>
						<Empty.Title>Sin componentes</Empty.Title>
						<Empty.Description>Agrega componentes al BOM usando el boton de arriba.</Empty.Description>
					</Empty.Header>
				</Empty.Root>
			{/if}
		</Card.Content>
	</Card.Root>

	<div class="flex items-center gap-3">
		<Button href="/lmat/boms" variant="outline">Cancelar</Button>
		<Button onclick={handleSave}>
			<Save data-icon="inline-start" /> Crear BOM
		</Button>
	</div>
</div>
