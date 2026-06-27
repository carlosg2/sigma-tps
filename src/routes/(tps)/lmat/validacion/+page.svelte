<script lang="ts">
	import { useStore } from '$lib/tps/store.svelte.js';
	import StatusBadge from '$lib/tps/components/status-badge.svelte';
	import StatCard from '$lib/tps/components/stat-card.svelte';
	import {
		BOM_MATURITY_LABELS,
		BOM_MATURITY_COLORS,
		BOM_MATURITY_DESCRIPTIONS,
		VALIDATION_DEPARTMENTS,
		ARMOR_LEVEL_LABELS
	} from '$lib/tps/constants.js';
	import type { BOM, DepartmentValidationStatus } from '$lib/tps/types.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Tabs from '$lib/components/ui/tabs/index.js';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import { Textarea } from '$lib/components/ui/textarea/index.js';
	import { Progress } from '$lib/components/ui/progress/index.js';
	import CircleCheckBig from '@lucide/svelte/icons/circle-check-big';
	import Clock from '@lucide/svelte/icons/clock';
	import CircleX from '@lucide/svelte/icons/circle-x';
	import TriangleAlert from '@lucide/svelte/icons/triangle-alert';
	import Users from '@lucide/svelte/icons/users';
	import ShieldCheck from '@lucide/svelte/icons/shield-check';
	import Layers from '@lucide/svelte/icons/layers';
	import ArrowRight from '@lucide/svelte/icons/arrow-right';
	import Lock from '@lucide/svelte/icons/lock';

	const VALIDATION_STATUS_ICONS = {
		pendiente: Clock,
		en_revision: TriangleAlert,
		completado: CircleCheckBig,
		rechazado: CircleX,
		bloqueado: Lock
	};

	const VALIDATION_OPTIONS: Record<DepartmentValidationStatus, string> = {
		pendiente: 'Pendiente',
		completado: 'Completado - Aprobado',
		en_revision: 'En Revision - Observaciones',
		rechazado: 'Rechazado - Requiere Cambios',
		bloqueado: 'Bloqueado - Dependencia Externa'
	};

	const store = useStore();
	const app = $derived(store.state);

	let selectedBOM = $state<BOM | null>(null);
	let validationNotes = $state('');
	let validationStatus = $state<DepartmentValidationStatus>('completado');
	let selectedDepartment = $state('');
	let dialogOpen = $state(false);
	let activeTab = $state<'all' | 'estabilizado' | 'preliminar'>('all');

	const validationStatusLabel = $derived(VALIDATION_OPTIONS[validationStatus]);

	// BOMs pending validation (estabilizado status, not all departments completed)
	const bomsForValidation = $derived(
		app.boms.filter((bom) => {
			if (bom.maturityStatus === 'liberado' || bom.maturityStatus === 'obsoleto') return false;
			if (bom.maturityStatus === 'en_desarrollo') return false;
			return true;
		})
	);

	// Stats by department
	const departmentStats = $derived(
		VALIDATION_DEPARTMENTS.map((dept) => {
			const pending = bomsForValidation.filter((bom) => {
				const validation = bom.departmentValidations?.find((v) => v.department === dept);
				return !validation || validation.status === 'pendiente';
			}).length;
			const completed = bomsForValidation.filter((bom) => {
				const validation = bom.departmentValidations?.find((v) => v.department === dept);
				return validation?.status === 'completado';
			}).length;
			const rejected = bomsForValidation.filter((bom) => {
				const validation = bom.departmentValidations?.find((v) => v.department === dept);
				return validation?.status === 'rechazado';
			}).length;
			return { department: dept, pending, completed, rejected, total: bomsForValidation.length };
		})
	);

	// Overall progress
	const totalValidations = $derived(bomsForValidation.length * VALIDATION_DEPARTMENTS.length);
	const completedValidations = $derived(
		bomsForValidation.reduce((acc, bom) => {
			return acc + (bom.departmentValidations?.filter((v) => v.status === 'completado').length || 0);
		}, 0)
	);
	const overallProgress = $derived(
		totalValidations > 0 ? (completedValidations / totalValidations) * 100 : 0
	);

	function handleValidation() {
		if (!selectedBOM || !selectedDepartment) return;

		store.dispatch({
			type: 'UPDATE_BOM_VALIDATION',
			payload: {
				bomId: selectedBOM.id,
				department: selectedDepartment,
				status: validationStatus,
				notes: validationNotes
			}
		});

		dialogOpen = false;
		validationNotes = '';
		selectedBOM = null;
		selectedDepartment = '';
	}

	function openValidationDialog(bom: BOM, dept: string) {
		selectedBOM = bom;
		selectedDepartment = dept;
		validationStatus = 'completado';
		validationNotes = '';
		dialogOpen = true;
	}

	function getValidationForDept(bom: BOM, dept: string) {
		return bom.departmentValidations?.find((v) => v.department === dept);
	}

	function getBOMProgress(bom: BOM) {
		const completed = bom.departmentValidations?.filter((v) => v.status === 'completado').length || 0;
		return (completed / VALIDATION_DEPARTMENTS.length) * 100;
	}

	const estabilizadoBoms = $derived(
		bomsForValidation.filter((b) => b.maturityStatus === 'estabilizado')
	);
	const preliminarBoms = $derived(bomsForValidation.filter((b) => b.maturityStatus === 'preliminar'));
</script>

{#snippet bomCard(bom: BOM)}
	{@const progress = getBOMProgress(bom)}
	<Card.Root>
		<Card.Content class="flex flex-col gap-4">
			<div class="flex items-start justify-between gap-4">
				<div class="flex flex-col gap-1">
					<div class="flex flex-wrap items-center gap-2">
						<a href="/lmat/boms/{bom.id}" class="font-medium hover:underline">
							{bom.vehicleModel}
						</a>
						<StatusBadge
							label={BOM_MATURITY_LABELS[bom.maturityStatus]}
							colorClass={BOM_MATURITY_COLORS[bom.maturityStatus]}
						/>
						<Badge variant="outline">{ARMOR_LEVEL_LABELS[bom.armorLevel]}</Badge>
					</div>
					<p class="text-muted-foreground text-sm">{bom.specificationCode} - v{bom.version}</p>
				</div>
				<div class="flex flex-col items-end gap-1">
					<p class="text-sm font-medium tabular-nums">{Math.round(progress)}% completado</p>
					<Progress value={progress} max={100} class="h-1.5 w-32" />
				</div>
			</div>

			<div class="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
				{#each VALIDATION_DEPARTMENTS as dept (dept)}
					{@const validation = getValidationForDept(bom, dept)}
					{@const status = (validation?.status || 'pendiente') as DepartmentValidationStatus}
					{@const StatusIcon = VALIDATION_STATUS_ICONS[status]}
					<button
						onclick={() => openValidationDialog(bom, dept)}
						class="hover:bg-accent rounded-lg border p-3 text-left transition-colors {status === 'completado' ? 'border-emerald-500/30 bg-emerald-500/5' : ''} {status === 'rechazado' ? 'border-destructive/30 bg-destructive/5' : ''}"
					>
						<div class="mb-1 flex items-center justify-between">
							<span class="truncate text-xs font-medium">{dept}</span>
							<StatusIcon
								class="size-3.5 {status === 'completado' ? 'text-emerald-500' : status === 'rechazado' ? 'text-destructive' : status === 'en_revision' ? 'text-chart-4' : 'text-muted-foreground'}"
							/>
						</div>
						{#if validation?.validatedBy}
							<p class="text-muted-foreground truncate text-xs">{validation.validatedBy}</p>
						{:else}
							<p class="text-muted-foreground text-xs">Sin validar</p>
						{/if}
					</button>
				{/each}
			</div>

			{#if progress === 100 && bom.maturityStatus !== 'liberado'}
				<div class="flex items-center justify-between rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3">
					<div class="flex items-center gap-2">
						<CircleCheckBig class="size-4 text-emerald-500" />
						<span class="text-sm font-medium text-emerald-500">
							Todas las validaciones completadas - Listo para liberar
						</span>
					</div>
					<Button href="/lmat/boms/{bom.id}" variant="outline" size="sm">
						Ir al BOM <ArrowRight data-icon="inline-end" />
					</Button>
				</div>
			{/if}
		</Card.Content>
	</Card.Root>
{/snippet}

<p class="text-muted-foreground text-sm">
	Panel de control para validacion de BOMs por departamento segun LMAT 2.0
</p>

<!-- Overall Stats -->
<div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
	<StatCard label="BOMs en Validacion" value={bomsForValidation.length} icon={Layers} />
	<Card.Root>
		<Card.Header>
			<Card.Description>Progreso General</Card.Description>
			<Card.Title class="text-2xl font-semibold tabular-nums">{Math.round(overallProgress)}%</Card.Title>
		</Card.Header>
		<Card.Content>
			<Progress value={overallProgress} max={100} />
		</Card.Content>
	</Card.Root>
	<StatCard
		label="Validaciones Completadas"
		value={completedValidations}
		subtitle={`de ${totalValidations} totales`}
		icon={CircleCheckBig}
	/>
	<StatCard
		label="BOMs Liberados"
		value={app.boms.filter((b) => b.maturityStatus === 'liberado').length}
		icon={ShieldCheck}
	/>
</div>

<!-- Department Stats -->
<Card.Root>
	<Card.Header>
		<Card.Title class="flex items-center gap-2">
			<Users class="size-5" /> Estado por Departamento
		</Card.Title>
		<Card.Description>Resumen de validaciones pendientes y completadas por area</Card.Description>
	</Card.Header>
	<Card.Content>
		<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
			{#each departmentStats as stat (stat.department)}
				<div class="flex flex-col gap-3 rounded-lg border p-4">
					<p class="text-sm font-medium">{stat.department}</p>
					<div class="flex flex-col gap-2">
						<div class="flex items-center justify-between text-sm">
							<span class="text-muted-foreground flex items-center gap-1">
								<Clock class="size-3" /> Pendiente
							</span>
							<span class="font-medium tabular-nums">{stat.pending}</span>
						</div>
						<div class="flex items-center justify-between text-sm">
							<span class="flex items-center gap-1 text-emerald-500">
								<CircleCheckBig class="size-3" /> Completado
							</span>
							<span class="font-medium tabular-nums">{stat.completed}</span>
						</div>
						{#if stat.rejected > 0}
							<div class="flex items-center justify-between text-sm">
								<span class="text-destructive flex items-center gap-1">
									<CircleX class="size-3" /> Rechazado
								</span>
								<span class="font-medium tabular-nums">{stat.rejected}</span>
							</div>
						{/if}
					</div>
					<Progress value={stat.total > 0 ? (stat.completed / stat.total) * 100 : 0} max={100} class="h-1.5" />
				</div>
			{/each}
		</div>
	</Card.Content>
</Card.Root>

<!-- BOMs List -->
<Card.Root>
	<Card.Header>
		<Card.Title class="flex items-center gap-2">
			<Layers class="size-5" /> BOMs en Proceso de Validacion
		</Card.Title>
		<Card.Description>Selecciona un BOM para validar por departamento</Card.Description>
	</Card.Header>
	<Card.Content>
		<Tabs.Root bind:value={activeTab}>
			<Tabs.List>
				<Tabs.Trigger value="all">Todos ({bomsForValidation.length})</Tabs.Trigger>
				<Tabs.Trigger value="estabilizado">Estabilizado ({estabilizadoBoms.length})</Tabs.Trigger>
				<Tabs.Trigger value="preliminar">Preliminar ({preliminarBoms.length})</Tabs.Trigger>
			</Tabs.List>

			<Tabs.Content value="all">
				<div class="flex flex-col gap-4">
					{#each bomsForValidation as bom (bom.id)}
						{@render bomCard(bom)}
					{/each}
				</div>
			</Tabs.Content>
			<Tabs.Content value="estabilizado">
				<div class="flex flex-col gap-4">
					{#each estabilizadoBoms as bom (bom.id)}
						{@render bomCard(bom)}
					{/each}
				</div>
			</Tabs.Content>
			<Tabs.Content value="preliminar">
				<div class="flex flex-col gap-4">
					{#each preliminarBoms as bom (bom.id)}
						{@render bomCard(bom)}
					{/each}
				</div>
			</Tabs.Content>
		</Tabs.Root>
	</Card.Content>
</Card.Root>

<!-- Maturity Status Reference -->
<Card.Root>
	<Card.Header>
		<Card.Title class="flex items-center gap-2">
			<ShieldCheck class="size-5" /> Referencia: Estatus de Madurez LMAT 2.0
		</Card.Title>
	</Card.Header>
	<Card.Content>
		<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
			{#each Object.keys(BOM_MATURITY_LABELS) as status (status)}
				{@const s = status as keyof typeof BOM_MATURITY_LABELS}
				<div class="flex flex-col gap-2 rounded-lg border p-4">
					<StatusBadge label={BOM_MATURITY_LABELS[s]} colorClass={BOM_MATURITY_COLORS[s]} />
					<p class="text-muted-foreground text-xs">{BOM_MATURITY_DESCRIPTIONS[s]}</p>
				</div>
			{/each}
		</div>
	</Card.Content>
</Card.Root>

<!-- Validation Dialog -->
<Dialog.Root bind:open={dialogOpen}>
	<Dialog.Content class="sm:max-w-lg">
		<Dialog.Header>
			<Dialog.Title>Validar BOM - {selectedDepartment}</Dialog.Title>
			<Dialog.Description>
				{selectedBOM?.vehicleModel} - {selectedBOM?.specificationCode}
			</Dialog.Description>
		</Dialog.Header>
		<div class="flex flex-col gap-4 py-2">
			<div class="grid gap-2">
				<Label for="validation-status">Estado de Validacion</Label>
				<Select.Root type="single" bind:value={validationStatus}>
					<Select.Trigger id="validation-status" class="w-full">{validationStatusLabel}</Select.Trigger>
					<Select.Content>
						<Select.Item value="completado">Completado - Aprobado</Select.Item>
						<Select.Item value="en_revision">En Revision - Observaciones</Select.Item>
						<Select.Item value="rechazado">Rechazado - Requiere Cambios</Select.Item>
						<Select.Item value="bloqueado">Bloqueado - Dependencia Externa</Select.Item>
					</Select.Content>
				</Select.Root>
			</div>
			<div class="grid gap-2">
				<Label for="validation-notes">Notas / Observaciones</Label>
				<Textarea
					id="validation-notes"
					placeholder="Agregar notas sobre la validacion..."
					bind:value={validationNotes}
					rows={4}
				/>
			</div>
		</div>
		<Dialog.Footer>
			<Button variant="outline" onclick={() => (dialogOpen = false)}>Cancelar</Button>
			<Button onclick={handleValidation}>Guardar Validacion</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
