<script lang="ts">
	import { goto } from '$app/navigation';
	import { useSpecV2Store, specUid, specToday } from '$lib/tps/spec-v2/store.svelte.js';
	import { useStore } from '$lib/tps/store.svelte.js';
	import { makeSpecAuthorizations, SPEC_DESIGN_TYPE_LABELS } from '$lib/tps/spec-v2/constants.js';
	import { ARMOR_LEVEL_LABELS } from '$lib/tps/constants.js';
	import type { ArmorLevel, SpecDesignType, SpecificationV2 } from '$lib/tps/spec-v2/types.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import * as Alert from '$lib/components/ui/alert/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import { Textarea } from '$lib/components/ui/textarea/index.js';
	import ArrowLeft from '@lucide/svelte/icons/arrow-left';
	import Save from '@lucide/svelte/icons/save';
	import AlertTriangle from '@lucide/svelte/icons/triangle-alert';

	const store = useSpecV2Store();
	const main = useStore();

	let form = $state({
		code: '',
		brand: '',
		model: '',
		year: '',
		armorLevel: 'NIII' as ArmorLevel,
		designType: 'alto_volumen' as SpecDesignType,
		notes: ''
	});
	let errors = $state<string[]>([]);

	const armorLabel = $derived(ARMOR_LEVEL_LABELS[form.armorLevel]);
	const designLabel = $derived(SPEC_DESIGN_TYPE_LABELS[form.designType]);

	function save() {
		const errs: string[] = [];
		if (!form.code.trim()) errs.push('El codigo es obligatorio');
		if (!form.brand.trim()) errs.push('La marca es obligatoria');
		if (!form.model.trim()) errs.push('El modelo es obligatorio');
		if (store.state.specifications.some((s) => s.code.toLowerCase() === form.code.trim().toLowerCase()))
			errs.push('El codigo ya existe');
		errors = errs;
		if (errs.length > 0) return;

		const id = specUid('spv');
		const userName = main.state.currentUser.name;
		const spec: SpecificationV2 = {
			id,
			code: form.code.trim(),
			brand: form.brand.trim(),
			model: form.model.trim(),
			year: form.year.trim(),
			armorLevel: form.armorLevel,
			designType: form.designType,
			version: 1,
			status: 'borrador',
			components: [],
			authorizations: makeSpecAuthorizations(),
			revisions: [{ id: specUid('srev'), version: 1, changedBy: userName, changedAt: specToday(), reason: 'Creacion inicial' }],
			notes: form.notes.trim(),
			createdAt: specToday(),
			updatedAt: specToday(),
			createdBy: main.state.currentUser.id
		};
		store.addSpec(spec);
		goto(`/especificaciones-v2/${id}`);
	}
</script>

<div class="mx-auto flex w-full max-w-3xl flex-col gap-6">
	<div class="flex items-center gap-3">
		<Button href="/especificaciones-v2" variant="outline" size="sm">
			<ArrowLeft data-icon="inline-start" /> Volver
		</Button>
		<p class="text-muted-foreground text-sm">Crear una nueva especificacion tecnica</p>
	</div>

	{#if errors.length > 0}
		<Alert.Root variant="destructive">
			<AlertTriangle />
			<Alert.Title>Revisa los siguientes campos</Alert.Title>
			<Alert.Description>
				<ul class="list-disc pl-4">
					{#each errors as e (e)}<li>{e}</li>{/each}
				</ul>
			</Alert.Description>
		</Alert.Root>
	{/if}

	<Card.Root>
		<Card.Header>
			<Card.Title>Datos Generales</Card.Title>
			<Card.Description>Define el vehiculo y nivel de blindaje de la especificacion.</Card.Description>
		</Card.Header>
		<Card.Content class="flex flex-col gap-4">
			<div class="grid gap-2">
				<Label for="code">Codigo *</Label>
				<Input id="code" bind:value={form.code} placeholder="ESPV2-MODELO-NIVEL-AÑO" />
			</div>
			<div class="grid gap-4 md:grid-cols-2">
				<div class="grid gap-2">
					<Label for="brand">Marca *</Label>
					<Input id="brand" bind:value={form.brand} placeholder="Toyota" />
				</div>
				<div class="grid gap-2">
					<Label for="model">Modelo *</Label>
					<Input id="model" bind:value={form.model} placeholder="Land Cruiser 300" />
				</div>
			</div>
			<div class="grid gap-4 md:grid-cols-3">
				<div class="grid gap-2">
					<Label for="year">Año</Label>
					<Input id="year" bind:value={form.year} placeholder="2022-2025" />
				</div>
				<div class="grid gap-2">
					<Label>Nivel de Blindaje</Label>
					<Select.Root type="single" bind:value={form.armorLevel}>
						<Select.Trigger>{armorLabel}</Select.Trigger>
						<Select.Content>
							{#each Object.entries(ARMOR_LEVEL_LABELS) as [k, v] (k)}
								<Select.Item value={k}>{v}</Select.Item>
							{/each}
						</Select.Content>
					</Select.Root>
				</div>
				<div class="grid gap-2">
					<Label>Tipo de Diseño</Label>
					<Select.Root type="single" bind:value={form.designType}>
						<Select.Trigger>{designLabel}</Select.Trigger>
						<Select.Content>
							{#each Object.entries(SPEC_DESIGN_TYPE_LABELS) as [k, v] (k)}
								<Select.Item value={k}>{v}</Select.Item>
							{/each}
						</Select.Content>
					</Select.Root>
				</div>
			</div>
			<div class="grid gap-2">
				<Label for="notes">Notas</Label>
				<Textarea id="notes" bind:value={form.notes} placeholder="Observaciones generales..." />
			</div>
		</Card.Content>
		<Card.Footer class="justify-end gap-2">
			<Button href="/especificaciones-v2" variant="outline">Cancelar</Button>
			<Button onclick={save}>
				<Save data-icon="inline-start" /> Crear Especificacion
			</Button>
		</Card.Footer>
	</Card.Root>
</div>
