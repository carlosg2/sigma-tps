<script lang="ts">
	import { useStore } from '$lib/tps/store.svelte.js';
	import { goto } from '$app/navigation';
	import {
		VEHICLE_MODELS,
		ARMOR_LEVEL_LABELS,
		PROJECT_STATUS_LABELS,
		PROJECT_STAGE_ORDER,
		PLANT_LABELS
	} from '$lib/tps/constants.js';
	import { generateId } from '$lib/tps/utils.js';
	import type { Project, ArmorLevel, Plant, ProjectStage } from '$lib/tps/types.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import * as Alert from '$lib/components/ui/alert/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import ArrowLeft from '@lucide/svelte/icons/arrow-left';
	import Save from '@lucide/svelte/icons/save';
	import AlertTriangle from '@lucide/svelte/icons/triangle-alert';

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

<div class="mx-auto flex w-full max-w-2xl flex-col gap-6">
	<div class="flex flex-wrap items-center justify-between gap-3">
		<Button href="/proyectos" variant="outline" size="sm">
			<ArrowLeft data-icon="inline-start" /> Volver
		</Button>
		<p class="text-muted-foreground text-sm">Crea un nuevo folio de vehiculo</p>
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

	<Card.Root>
		<Card.Header>
			<Card.Title>Datos del Proyecto</Card.Title>
		</Card.Header>
		<Card.Content class="flex flex-col gap-4">
			<div class="grid gap-2">
				<Label for="folioTPS">Folio TPS (4 digitos) *</Label>
				<Input
					id="folioTPS"
					class="font-mono"
					value={form.folioTPS}
					oninput={(e) => (form.folioTPS = e.currentTarget.value.replace(/\D/g, '').slice(0, 4))}
					placeholder="0001"
					maxlength={4}
				/>
			</div>
			<div class="grid gap-4 md:grid-cols-2">
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
			</div>
			<div class="grid gap-2">
				<Label>Cliente *</Label>
				<Select.Root type="single" bind:value={form.clientId}>
					<Select.Trigger class="w-full">{app.clients.find((c) => c.id === form.clientId)?.name ?? 'Seleccionar...'}</Select.Trigger>
					<Select.Content>
						{#each app.clients as c (c.id)}
							<Select.Item value={c.id}>{c.name}</Select.Item>
						{/each}
					</Select.Content>
				</Select.Root>
			</div>
			<div class="grid gap-4 md:grid-cols-2">
				<div class="grid gap-2">
					<Label>Planta</Label>
					<Select.Root type="single" bind:value={form.plant}>
						<Select.Trigger class="w-full">{PLANT_LABELS[form.plant]}</Select.Trigger>
						<Select.Content>
							<Select.Item value="planta_1">Planta 1</Select.Item>
							<Select.Item value="planta_2">Planta 2</Select.Item>
						</Select.Content>
					</Select.Root>
				</div>
				<div class="grid gap-2">
					<Label for="quotationAmount">Monto Cotizacion (MXN)</Label>
					<Input
						id="quotationAmount"
						type="number"
						class="font-mono"
						value={form.quotationAmount || ''}
						oninput={(e) => (form.quotationAmount = Number(e.currentTarget.value))}
						placeholder="0"
					/>
				</div>
			</div>
			<div class="grid gap-2">
				<Label>BOM Vinculado (opcional)</Label>
				<Select.Root type="single" bind:value={form.bomId}>
					<Select.Trigger class="w-full">
						{#if form.bomId}{@const b = app.boms.find((b) => b.id === form.bomId)}{b ? `${b.specificationCode} - ${b.vehicleModel}` : 'Sin BOM'}{:else}Sin BOM{/if}
					</Select.Trigger>
					<Select.Content>
						<Select.Item value="">Sin BOM</Select.Item>
						{#each app.boms as b (b.id)}
							<Select.Item value={b.id}>{b.specificationCode} - {b.vehicleModel}</Select.Item>
						{/each}
					</Select.Content>
				</Select.Root>
			</div>
		</Card.Content>
	</Card.Root>

	<div class="flex items-center justify-end gap-3">
		<Button href="/proyectos" variant="outline">Cancelar</Button>
		<Button onclick={handleSave}>
			<Save data-icon="inline-start" /> Crear Proyecto
		</Button>
	</div>
</div>
