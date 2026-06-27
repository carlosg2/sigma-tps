<script lang="ts">
	import { useStore } from '$lib/tps/store.svelte.js';
	import { goto } from '$app/navigation';
	import { VEHICLE_MODELS, ARMOR_LEVEL_LABELS, PLANT_CELLS, UDM_LABELS } from '$lib/tps/constants.js';
	import { generateId } from '$lib/tps/utils.js';
	import type { BOM, BOMComponent, ArmorLevel, Plant } from '$lib/tps/types.js';
	import ArrowLeft from '@lucide/svelte/icons/arrow-left';
	import Save from '@lucide/svelte/icons/save';
	import Plus from '@lucide/svelte/icons/plus';
	import Trash2 from '@lucide/svelte/icons/trash-2';
	import Search from '@lucide/svelte/icons/search';

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

<div class="flex max-w-4xl flex-col gap-6">
	<div class="flex items-center gap-3">
		<a
			href="/lmat/boms"
			class="border-border hover:bg-secondary flex h-8 w-8 items-center justify-center rounded-md border transition-colors"
		>
			<ArrowLeft class="text-foreground h-4 w-4" />
		</a>
		<div>
			<h1 class="text-foreground text-xl font-bold">Nuevo BOM</h1>
			<p class="text-muted-foreground text-sm">Define la especificacion y sus componentes</p>
		</div>
	</div>

	{#if errors.length > 0}
		<div class="border-destructive/30 bg-destructive/10 rounded-md border p-3">
			{#each errors as e, i (i)}
				<p class="text-destructive-foreground text-sm">{e}</p>
			{/each}
		</div>
	{/if}

	<!-- Header fields -->
	<div class="border-border bg-card rounded-lg border p-4">
		<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
			<div>
				<label class="text-muted-foreground mb-1 block text-xs">Codigo de Especificacion *</label>
				<input
					class="border-border bg-secondary text-foreground w-full rounded-md border px-3 py-2 text-sm outline-none"
					bind:value={form.specificationCode}
					placeholder="e.g. ESP-LC300-NIII-P1"
				/>
			</div>
			<div>
				<label class="text-muted-foreground mb-1 block text-xs">Modelo de Vehiculo</label>
				<select
					class="border-border bg-secondary text-foreground w-full rounded-md border px-3 py-2 text-sm outline-none"
					bind:value={form.vehicleModel}
				>
					{#each VEHICLE_MODELS as m (m)}
						<option value={m}>{m}</option>
					{/each}
				</select>
			</div>
			<div>
				<label class="text-muted-foreground mb-1 block text-xs">Nivel de Blindaje</label>
				<select
					class="border-border bg-secondary text-foreground w-full rounded-md border px-3 py-2 text-sm outline-none"
					bind:value={form.armorLevel}
				>
					{#each Object.entries(ARMOR_LEVEL_LABELS) as [k, v] (k)}
						<option value={k}>{v}</option>
					{/each}
				</select>
			</div>
			<div>
				<label class="text-muted-foreground mb-1 block text-xs">Planta</label>
				<select
					class="border-border bg-secondary text-foreground w-full rounded-md border px-3 py-2 text-sm outline-none"
					bind:value={form.plant}
				>
					<option value="planta_1">Planta 1</option>
					<option value="planta_2">Planta 2</option>
				</select>
			</div>
		</div>
	</div>

	<!-- Components -->
	<div class="border-border bg-card overflow-hidden rounded-lg border">
		<div class="border-border flex items-center justify-between border-b px-4 py-3">
			<h3 class="text-card-foreground text-sm font-semibold">Componentes ({components.length})</h3>
			<button
				onclick={() => (showSearch = !showSearch)}
				class="bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors"
			>
				<Plus class="h-3.5 w-3.5" /> Agregar
			</button>
		</div>

		{#if showSearch}
			<div class="border-border bg-secondary/30 border-b px-4 py-3">
				<div class="border-border bg-secondary flex items-center gap-2 rounded-md border px-3 py-2">
					<Search class="text-muted-foreground h-4 w-4" />
					<input
						type="text"
						placeholder="Buscar articulo por codigo o descripcion..."
						bind:value={searchQ}
						class="text-foreground placeholder:text-muted-foreground w-full border-none bg-transparent text-sm outline-none"
					/>
				</div>
				{#if matchingArticles.length > 0}
					<div class="border-border mt-1 flex max-h-48 flex-col overflow-hidden overflow-y-auto rounded-md border">
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
			<div class="overflow-x-auto">
				<table class="w-full text-sm">
					<thead>
						<tr class="border-border border-b text-left">
							<th class="text-muted-foreground px-3 py-2 text-xs font-medium">Codigo</th>
							<th class="text-muted-foreground px-3 py-2 text-xs font-medium">Descripcion</th>
							<th class="text-muted-foreground w-20 px-3 py-2 text-xs font-medium">Cant.</th>
							<th class="text-muted-foreground w-28 px-3 py-2 text-xs font-medium">UdM</th>
							<th class="text-muted-foreground w-28 px-3 py-2 text-xs font-medium">Celda</th>
							<th class="text-muted-foreground px-3 py-2 text-xs font-medium">Operacion</th>
							<th class="text-muted-foreground w-8 px-3 py-2 text-xs font-medium"></th>
						</tr>
					</thead>
					<tbody>
						{#each components as comp (comp.id)}
							<tr class="border-border/30 border-b">
								<td class="text-primary px-3 py-1.5 font-mono text-xs">{comp.articleCode}</td>
								<td class="text-card-foreground max-w-[180px] truncate px-3 py-1.5 text-xs">{comp.articleDescription}</td>
								<td class="px-3 py-1.5">
									<input
										type="number"
										min="0.01"
										step="0.01"
										value={comp.quantity}
										oninput={(e) => updateComponent(comp.id, 'quantity', parseFloat(e.currentTarget.value) || 0)}
										class="border-border bg-secondary text-foreground w-full rounded border px-2 py-1 text-xs outline-none"
									/>
								</td>
								<td class="px-3 py-1.5">
									<select
										value={comp.udm}
										onchange={(e) => updateComponent(comp.id, 'udm', e.currentTarget.value)}
										class="border-border bg-secondary text-foreground w-full rounded border px-1 py-1 text-xs outline-none"
									>
										{#each Object.entries(UDM_LABELS) as [k, v] (k)}
											<option value={k}>{v}</option>
										{/each}
									</select>
								</td>
								<td class="px-3 py-1.5">
									<select
										value={comp.cell}
										onchange={(e) => updateComponent(comp.id, 'cell', e.currentTarget.value)}
										class="border-border bg-secondary text-foreground w-full rounded border px-1 py-1 text-xs outline-none"
									>
										{#each cells as c (c)}
											<option value={c}>{c}</option>
										{/each}
									</select>
								</td>
								<td class="px-3 py-1.5">
									<input
										value={comp.operation}
										oninput={(e) => updateComponent(comp.id, 'operation', e.currentTarget.value)}
										class="border-border bg-secondary text-foreground w-full rounded border px-2 py-1 text-xs outline-none"
										placeholder="Operacion..."
									/>
								</td>
								<td class="px-3 py-1.5">
									<button
										onclick={() => removeComponent(comp.id)}
										class="text-destructive-foreground hover:text-destructive transition-colors"
									>
										<Trash2 class="h-3.5 w-3.5" />
									</button>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{:else}
			<div class="text-muted-foreground px-4 py-8 text-center text-sm">
				Agrega componentes al BOM usando el boton de arriba.
			</div>
		{/if}
	</div>

	<div class="flex items-center gap-3">
		<a
			href="/lmat/boms"
			class="border-border text-foreground hover:bg-secondary rounded-md border px-4 py-2 text-sm transition-colors"
		>
			Cancelar
		</a>
		<button
			onclick={handleSave}
			class="bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors"
		>
			<Save class="h-4 w-4" /> Crear BOM
		</button>
	</div>
</div>
