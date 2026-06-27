<script lang="ts">
	import { useStore } from '$lib/tps/store.svelte.js';
	import { goto } from '$app/navigation';
	import {
		VEHICLE_MODELS,
		ARMOR_LEVEL_LABELS,
		PROJECT_STATUS_LABELS,
		PROJECT_STAGE_ORDER
	} from '$lib/tps/constants.js';
	import { generateId } from '$lib/tps/utils.js';
	import type { Project, ArmorLevel, Plant, ProjectStage } from '$lib/tps/types.js';
	import ArrowLeft from '@lucide/svelte/icons/arrow-left';
	import Save from '@lucide/svelte/icons/save';

	const store = useStore();
	const app = $derived(store.state);
	const defaultPlant: Plant = store.state.currentPlant !== 'todas' ? store.state.currentPlant : 'planta_1';

	let form = $state({
		folioTPS: '',
		vehicleModel: VEHICLE_MODELS[0],
		armorLevel: 'NIII' as ArmorLevel,
		clientId: store.state.clients[0]?.id || '',
		plant: defaultPlant as Plant,
		quotationAmount: 0,
		bomId: ''
	});
	let errors = $state<string[]>([]);

	function validate(): string[] {
		const errs: string[] = [];
		if (!form.folioTPS.trim()) errs.push('Folio TPS es obligatorio');
		if (!/^\d{4}$/.test(form.folioTPS.trim())) errs.push('Folio TPS debe ser de 4 digitos');
		if (app.projects.some((p) => p.folioTPS === form.folioTPS.trim()))
			errs.push('Ya existe un proyecto con este folio');
		if (!form.clientId) errs.push('Selecciona un cliente');
		return errs;
	}

	function handleSave() {
		const errs = validate();
		if (errs.length > 0) {
			errors = errs;
			return;
		}

		const client = app.clients.find((c) => c.id === form.clientId);
		const stages: ProjectStage[] = PROJECT_STAGE_ORDER.map((s) => ({
			name: s,
			label: PROJECT_STATUS_LABELS[s],
			startedAt: s === 'cotizacion' ? new Date().toISOString().split('T')[0] : null,
			completedAt: null,
			isActive: s === 'cotizacion',
			notes: ''
		}));

		const project: Project = {
			id: generateId(),
			folioTPS: form.folioTPS.trim(),
			vehicleModel: form.vehicleModel,
			armorLevel: form.armorLevel,
			clientId: form.clientId,
			clientName: client?.name || '',
			plant: form.plant as Plant,
			status: 'cotizacion',
			quotationAmount: form.quotationAmount,
			stages,
			costs: [],
			documents: [],
			bomId: form.bomId || null,
			daysInProduction: 0,
			progressPercent: 0,
			totalCost: 0,
			estimatedMargin: 0,
			createdAt: new Date().toISOString().split('T')[0],
			updatedAt: new Date().toISOString().split('T')[0]
		};

		store.dispatch({ type: 'ADD_PROJECT', payload: project });
		store.dispatch({
			type: 'ADD_AUDIT_LOG',
			payload: {
				id: generateId(),
				userId: app.currentUser.id,
				userName: app.currentUser.name,
				entity: 'Project',
				entityId: project.id,
				action: 'crear',
				field: 'nuevo',
				oldValue: '',
				newValue: project.folioTPS,
				timestamp: new Date().toISOString()
			}
		});
		goto('/proyectos');
	}
</script>

<div class="flex max-w-2xl flex-col gap-6">
	<div class="flex items-center gap-3">
		<a
			href="/proyectos"
			class="border-border hover:bg-secondary flex h-8 w-8 items-center justify-center rounded-md border transition-colors"
		>
			<ArrowLeft class="text-foreground h-4 w-4" />
		</a>
		<div>
			<h1 class="text-foreground text-xl font-bold">Nuevo Proyecto</h1>
			<p class="text-muted-foreground text-sm">Crea un nuevo folio de vehiculo</p>
		</div>
	</div>

	{#if errors.length > 0}
		<div class="border-destructive/30 bg-destructive/10 rounded-md border p-3">
			{#each errors as e, i (i)}
				<p class="text-destructive-foreground text-sm">{e}</p>
			{/each}
		</div>
	{/if}

	<div class="border-border bg-card flex flex-col gap-4 rounded-lg border p-4">
		<div>
			<label class="text-muted-foreground mb-1 block text-xs">Folio TPS (4 digitos) *</label>
			<input
				class="border-border bg-secondary text-foreground w-full rounded-md border px-3 py-2 font-mono text-sm outline-none"
				value={form.folioTPS}
				oninput={(e) => (form.folioTPS = e.currentTarget.value.replace(/\D/g, '').slice(0, 4))}
				placeholder="0001"
				maxlength="4"
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
			<label class="text-muted-foreground mb-1 block text-xs">Cliente *</label>
			<select
				class="border-border bg-secondary text-foreground w-full rounded-md border px-3 py-2 text-sm outline-none"
				bind:value={form.clientId}
			>
				<option value="">Seleccionar...</option>
				{#each app.clients as c (c.id)}
					<option value={c.id}>{c.name}</option>
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
		<div>
			<label class="text-muted-foreground mb-1 block text-xs">Monto Cotizacion (MXN)</label>
			<input
				type="number"
				class="border-border bg-secondary text-foreground w-full rounded-md border px-3 py-2 font-mono text-sm outline-none"
				value={form.quotationAmount || ''}
				oninput={(e) => (form.quotationAmount = Number(e.currentTarget.value))}
				placeholder="0"
			/>
		</div>
		<div>
			<label class="text-muted-foreground mb-1 block text-xs">BOM Vinculado (opcional)</label>
			<select
				class="border-border bg-secondary text-foreground w-full rounded-md border px-3 py-2 text-sm outline-none"
				bind:value={form.bomId}
			>
				<option value="">Sin BOM</option>
				{#each app.boms as b (b.id)}
					<option value={b.id}>{b.specificationCode} - {b.vehicleModel}</option>
				{/each}
			</select>
		</div>
	</div>

	<div class="flex items-center gap-3">
		<a
			href="/proyectos"
			class="border-border text-foreground hover:bg-secondary rounded-md border px-4 py-2 text-sm transition-colors"
		>
			Cancelar
		</a>
		<button
			onclick={handleSave}
			class="bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors"
		>
			<Save class="h-4 w-4" /> Crear Proyecto
		</button>
	</div>
</div>
