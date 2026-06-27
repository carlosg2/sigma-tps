<script lang="ts">
	import { useStore } from '$lib/tps/store.svelte.js';
	import StatusBadge from '$lib/tps/components/status-badge.svelte';
	import {
		BOM_MATURITY_LABELS,
		BOM_MATURITY_COLORS,
		BOM_MATURITY_DESCRIPTIONS,
		VALIDATION_DEPARTMENTS,
		ARMOR_LEVEL_LABELS
	} from '$lib/tps/constants.js';
	import type { BOM, DepartmentValidationStatus } from '$lib/tps/types.js';
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

	const store = useStore();
	const app = $derived(store.state);

	let selectedBOM = $state<BOM | null>(null);
	let validationNotes = $state('');
	let validationStatus = $state<DepartmentValidationStatus>('completado');
	let selectedDepartment = $state('');
	let dialogOpen = $state(false);
	let activeTab = $state<'all' | 'estabilizado' | 'preliminar'>('all');

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
	<div class="bg-card rounded-lg border p-4">
		<div class="mb-4 flex items-start justify-between">
			<div>
				<div class="flex items-center gap-2">
					<a href="/lmat/boms/{bom.id}" class="font-medium hover:underline">
						{bom.vehicleModel}
					</a>
					<StatusBadge
						label={BOM_MATURITY_LABELS[bom.maturityStatus]}
						colorClass={BOM_MATURITY_COLORS[bom.maturityStatus]}
					/>
					<span
						class="border-border inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium"
					>
						{ARMOR_LEVEL_LABELS[bom.armorLevel]}
					</span>
				</div>
				<p class="text-muted-foreground text-sm">{bom.specificationCode} - v{bom.version}</p>
			</div>
			<div class="text-right">
				<p class="text-sm font-medium">{Math.round(progress)}% completado</p>
				<div class="bg-secondary mt-1 h-1.5 w-32 rounded-full">
					<div
						class="bg-primary h-1.5 rounded-full transition-all"
						style="width: {progress}%"
					></div>
				</div>
			</div>
		</div>

		<div class="grid grid-cols-6 gap-2">
			{#each VALIDATION_DEPARTMENTS as dept (dept)}
				{@const validation = getValidationForDept(bom, dept)}
				{@const status = (validation?.status || 'pendiente') as DepartmentValidationStatus}
				{@const StatusIcon = VALIDATION_STATUS_ICONS[status]}
				<button
					onclick={() => openValidationDialog(bom, dept)}
					class="hover:bg-accent rounded-lg border p-3 text-left transition-colors {status ===
					'completado'
						? 'border-emerald-500/30 bg-emerald-500/5'
						: ''} {status === 'rechazado' ? 'border-destructive/30 bg-destructive/5' : ''}"
				>
					<div class="mb-1 flex items-center justify-between">
						<span class="truncate text-xs font-medium">{dept}</span>
						<StatusIcon
							class="h-3.5 w-3.5 {status === 'completado'
								? 'text-emerald-500'
								: status === 'rechazado'
									? 'text-destructive'
									: status === 'en_revision'
										? 'text-chart-4'
										: 'text-muted-foreground'}"
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
			<div
				class="mt-4 flex items-center justify-between rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3"
			>
				<div class="flex items-center gap-2">
					<CircleCheckBig class="h-4 w-4 text-emerald-500" />
					<span class="text-sm font-medium text-emerald-500">
						Todas las validaciones completadas - Listo para liberar
					</span>
				</div>
				<a
					href="/lmat/boms/{bom.id}"
					class="border-border bg-card hover:bg-accent inline-flex items-center gap-1 rounded-md border px-3 py-1.5 text-sm"
				>
					Ir al BOM
					<ArrowRight class="ml-1 h-3 w-3" />
				</a>
			</div>
		{/if}
	</div>
{/snippet}

<div class="space-y-6">
	<!-- Header -->
	<div>
		<h1 class="text-2xl font-semibold">Validacion Multi-Departamental</h1>
		<p class="text-muted-foreground">
			Panel de control para validacion de BOMs por departamento segun LMAT 2.0
		</p>
	</div>

	<!-- Overall Stats -->
	<div class="grid grid-cols-4 gap-4">
		<div class="border-border bg-card rounded-lg border">
			<div class="p-6 pb-2">
				<p class="text-muted-foreground text-sm">BOMs en Validacion</p>
			</div>
			<div class="p-6 pt-0">
				<p class="text-3xl font-bold">{bomsForValidation.length}</p>
			</div>
		</div>
		<div class="border-border bg-card rounded-lg border">
			<div class="p-6 pb-2">
				<p class="text-muted-foreground text-sm">Progreso General</p>
			</div>
			<div class="space-y-2 p-6 pt-0">
				<p class="text-3xl font-bold">{Math.round(overallProgress)}%</p>
				<div class="bg-secondary h-2 rounded-full">
					<div
						class="bg-primary h-2 rounded-full transition-all"
						style="width: {overallProgress}%"
					></div>
				</div>
			</div>
		</div>
		<div class="border-border bg-card rounded-lg border">
			<div class="p-6 pb-2">
				<p class="text-muted-foreground text-sm">Validaciones Completadas</p>
			</div>
			<div class="p-6 pt-0">
				<p class="text-3xl font-bold text-emerald-500">{completedValidations}</p>
				<p class="text-muted-foreground text-sm">de {totalValidations} totales</p>
			</div>
		</div>
		<div class="border-border bg-card rounded-lg border">
			<div class="p-6 pb-2">
				<p class="text-muted-foreground text-sm">BOMs Liberados</p>
			</div>
			<div class="p-6 pt-0">
				<p class="text-chart-2 text-3xl font-bold">
					{app.boms.filter((b) => b.maturityStatus === 'liberado').length}
				</p>
			</div>
		</div>
	</div>

	<!-- Department Stats -->
	<div class="border-border bg-card rounded-lg border">
		<div class="space-y-1.5 p-6">
			<h3 class="flex items-center gap-2 font-semibold tracking-tight">
				<Users class="h-5 w-5" />
				Estado por Departamento
			</h3>
			<p class="text-muted-foreground text-sm">
				Resumen de validaciones pendientes y completadas por area
			</p>
		</div>
		<div class="p-6 pt-0">
			<div class="grid grid-cols-6 gap-4">
				{#each departmentStats as stat (stat.department)}
					<div class="bg-card rounded-lg border p-4">
						<p class="mb-3 text-sm font-medium">{stat.department}</p>
						<div class="space-y-2">
							<div class="flex items-center justify-between text-sm">
								<span class="text-muted-foreground flex items-center gap-1">
									<Clock class="h-3 w-3" />
									Pendiente
								</span>
								<span class="font-medium">{stat.pending}</span>
							</div>
							<div class="flex items-center justify-between text-sm">
								<span class="flex items-center gap-1 text-emerald-500">
									<CircleCheckBig class="h-3 w-3" />
									Completado
								</span>
								<span class="font-medium">{stat.completed}</span>
							</div>
							{#if stat.rejected > 0}
								<div class="flex items-center justify-between text-sm">
									<span class="text-destructive flex items-center gap-1">
										<CircleX class="h-3 w-3" />
										Rechazado
									</span>
									<span class="font-medium">{stat.rejected}</span>
								</div>
							{/if}
						</div>
						<div class="bg-secondary mt-3 h-1.5 rounded-full">
							<div
								class="bg-primary h-1.5 rounded-full transition-all"
								style="width: {stat.total > 0 ? (stat.completed / stat.total) * 100 : 0}%"
							></div>
						</div>
					</div>
				{/each}
			</div>
		</div>
	</div>

	<!-- BOMs List -->
	<div class="border-border bg-card rounded-lg border">
		<div class="space-y-1.5 p-6">
			<h3 class="flex items-center gap-2 font-semibold tracking-tight">
				<Layers class="h-5 w-5" />
				BOMs en Proceso de Validacion
			</h3>
			<p class="text-muted-foreground text-sm">
				Selecciona un BOM para validar por departamento
			</p>
		</div>
		<div class="p-6 pt-0">
			<div class="bg-muted text-muted-foreground inline-flex h-9 items-center justify-center rounded-lg p-1">
				<button
					onclick={() => (activeTab = 'all')}
					class="inline-flex items-center justify-center rounded-md px-3 py-1 text-sm font-medium transition-colors {activeTab ===
					'all'
						? 'bg-background text-foreground shadow'
						: ''}"
				>
					Todos ({bomsForValidation.length})
				</button>
				<button
					onclick={() => (activeTab = 'estabilizado')}
					class="inline-flex items-center justify-center rounded-md px-3 py-1 text-sm font-medium transition-colors {activeTab ===
					'estabilizado'
						? 'bg-background text-foreground shadow'
						: ''}"
				>
					Estabilizado ({estabilizadoBoms.length})
				</button>
				<button
					onclick={() => (activeTab = 'preliminar')}
					class="inline-flex items-center justify-center rounded-md px-3 py-1 text-sm font-medium transition-colors {activeTab ===
					'preliminar'
						? 'bg-background text-foreground shadow'
						: ''}"
				>
					Preliminar ({preliminarBoms.length})
				</button>
			</div>

			{#if activeTab === 'all'}
				<div class="mt-4 space-y-4">
					{#each bomsForValidation as bom (bom.id)}
						{@render bomCard(bom)}
					{/each}
				</div>
			{:else if activeTab === 'estabilizado'}
				<div class="mt-4 space-y-4">
					{#each estabilizadoBoms as bom (bom.id)}
						{@render bomCard(bom)}
					{/each}
				</div>
			{:else if activeTab === 'preliminar'}
				<div class="mt-4 space-y-4">
					{#each preliminarBoms as bom (bom.id)}
						{@render bomCard(bom)}
					{/each}
				</div>
			{/if}
		</div>
	</div>

	<!-- Maturity Status Reference -->
	<div class="border-border bg-card rounded-lg border">
		<div class="space-y-1.5 p-6">
			<h3 class="flex items-center gap-2 font-semibold tracking-tight">
				<ShieldCheck class="h-5 w-5" />
				Referencia: Estatus de Madurez LMAT 2.0
			</h3>
		</div>
		<div class="p-6 pt-0">
			<div class="grid grid-cols-5 gap-4">
				{#each Object.keys(BOM_MATURITY_LABELS) as status (status)}
					{@const s = status as keyof typeof BOM_MATURITY_LABELS}
					<div class="rounded-lg border p-4">
						<StatusBadge label={BOM_MATURITY_LABELS[s]} colorClass={BOM_MATURITY_COLORS[s]} />
						<p class="text-muted-foreground mt-2 text-xs">{BOM_MATURITY_DESCRIPTIONS[s]}</p>
					</div>
				{/each}
			</div>
		</div>
	</div>
</div>

<!-- Validation Dialog -->
{#if dialogOpen}
	<div class="fixed inset-0 z-50 flex items-center justify-center">
		<button
			aria-label="Cerrar"
			class="bg-background/80 absolute inset-0 backdrop-blur-sm"
			onclick={() => (dialogOpen = false)}
		></button>
		<div class="border-border bg-background relative z-10 w-full max-w-lg rounded-lg border p-6 shadow-lg">
			<div class="mb-4 space-y-1.5">
				<h2 class="text-lg font-semibold">Validar BOM - {selectedDepartment}</h2>
				<p class="text-muted-foreground text-sm">
					{selectedBOM?.vehicleModel} - {selectedBOM?.specificationCode}
				</p>
			</div>
			<div class="space-y-4 py-4">
				<div class="space-y-2">
					<label class="text-sm font-medium" for="validation-status">Estado de Validacion</label>
					<select
						id="validation-status"
						bind:value={validationStatus}
						class="border-border bg-card text-foreground w-full rounded-md border px-3 py-2 text-sm outline-none"
					>
						<option value="completado">Completado - Aprobado</option>
						<option value="en_revision">En Revision - Observaciones</option>
						<option value="rechazado">Rechazado - Requiere Cambios</option>
						<option value="bloqueado">Bloqueado - Dependencia Externa</option>
					</select>
				</div>
				<div class="space-y-2">
					<label class="text-sm font-medium" for="validation-notes">Notas / Observaciones</label>
					<textarea
						id="validation-notes"
						placeholder="Agregar notas sobre la validacion..."
						bind:value={validationNotes}
						rows={4}
						class="border-border bg-card placeholder:text-muted-foreground w-full rounded-md border px-3 py-2 text-sm outline-none"
					></textarea>
				</div>
			</div>
			<div class="flex justify-end gap-2">
				<button
					onclick={() => (dialogOpen = false)}
					class="border-border bg-card hover:bg-accent inline-flex items-center rounded-md border px-4 py-2 text-sm"
				>
					Cancelar
				</button>
				<button
					onclick={handleValidation}
					class="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center rounded-md px-4 py-2 text-sm font-medium"
				>
					Guardar Validacion
				</button>
			</div>
		</div>
	</div>
{/if}
