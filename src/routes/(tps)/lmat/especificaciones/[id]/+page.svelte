<script lang="ts">
	import { page } from '$app/state';
	import { useStore } from '$lib/tps/store.svelte.js';
	import {
		BOM_MATURITY_LABELS,
		BOM_MATURITY_COLORS,
		ARMOR_LEVEL_LABELS,
		DEPT_VALIDATION_LABELS,
		DEPT_VALIDATION_COLORS,
		VALIDATION_DEPARTMENTS,
		BOM_MATURITY_DESCRIPTIONS
	} from '$lib/tps/constants.js';
	import { formatDate } from '$lib/tps/utils.js';
	import StatusBadge from '$lib/tps/components/status-badge.svelte';
	import ArrowLeft from '@lucide/svelte/icons/arrow-left';
	import Car from '@lucide/svelte/icons/car';
	import Shield from '@lucide/svelte/icons/shield';
	import Layers from '@lucide/svelte/icons/layers';
	import History from '@lucide/svelte/icons/history';
	import Users from '@lucide/svelte/icons/users';
	import ChevronRight from '@lucide/svelte/icons/chevron-right';
	import CircleCheckBig from '@lucide/svelte/icons/circle-check-big';
	import CircleAlert from '@lucide/svelte/icons/circle-alert';
	import Clock3 from '@lucide/svelte/icons/clock-3';
	import Lock from '@lucide/svelte/icons/lock';
	import FileText from '@lucide/svelte/icons/file-text';
	import Settings from '@lucide/svelte/icons/settings';
	import GitBranch from '@lucide/svelte/icons/git-branch';

	type TabType = 'general' | 'proteccion' | 'boms' | 'validacion' | 'historial';

	const store = useStore();
	const app = $derived(store.state);
	const id = $derived(page.params.id);

	let activeTab = $state<TabType>('general');

	const spec = $derived(app.specifications.find((s) => s.id === id));

	const linkedBOMs = $derived(spec ? app.boms.filter((b) => spec.bomIds.includes(b.id)) : []);
	const linkedECNs = $derived(
		spec ? app.ecns.filter((e) => e.affectedBOMIds.some((bid) => spec.bomIds.includes(bid))) : []
	);

	const tabs: { id: TabType; label: string; icon: typeof FileText }[] = [
		{ id: 'general', label: 'General', icon: FileText },
		{ id: 'proteccion', label: 'Proteccion', icon: Shield },
		{ id: 'boms', label: 'BOMs', icon: Layers },
		{ id: 'validacion', label: 'Validacion', icon: Users },
		{ id: 'historial', label: 'Historial', icon: History }
	];

	const primaryBOM = $derived(linkedBOMs[0]);
	const validations = $derived(primaryBOM?.departmentValidations || []);

	function getValidationIcon(status: string) {
		switch (status) {
			case 'completado':
				return { icon: CircleCheckBig, cls: 'text-emerald-400' };
			case 'en_revision':
				return { icon: Clock3, cls: 'text-chart-4' };
			case 'rechazado':
				return { icon: CircleAlert, cls: 'text-destructive' };
			case 'bloqueado':
				return { icon: Lock, cls: 'text-chart-5' };
			default:
				return { icon: Clock3, cls: 'text-muted-foreground' };
		}
	}
</script>

{#if !spec}
	<div class="flex flex-col items-center justify-center gap-4 py-20">
		<p class="text-muted-foreground">Especificacion no encontrada</p>
		<a href="/lmat/especificaciones" class="text-primary hover:underline text-sm">Volver al listado</a>
	</div>
{/if}

{#if spec}
	<div class="flex flex-col gap-6">
		<!-- Header -->
		<div class="flex items-center justify-between">
			<div class="flex items-center gap-3">
				<a href="/lmat/especificaciones" class="flex h-8 w-8 items-center justify-center rounded-md border border-border hover:bg-secondary transition-colors">
					<ArrowLeft class="h-4 w-4 text-foreground" />
				</a>
				<div class="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
					<Car class="h-5 w-5 text-primary" />
				</div>
				<div>
					<div class="flex items-center gap-2">
						<h1 class="text-xl font-bold text-foreground">{spec.brand} {spec.model}</h1>
						<span class="rounded bg-secondary px-1.5 py-0.5 text-xs font-mono text-muted-foreground">v{spec.version}</span>
						<StatusBadge label={BOM_MATURITY_LABELS[spec.status]} colorClass={BOM_MATURITY_COLORS[spec.status]} />
					</div>
					<p class="text-sm text-muted-foreground">
						{spec.code} / {ARMOR_LEVEL_LABELS[spec.armorLevel]} / {spec.year}
					</p>
				</div>
			</div>
			<div class="flex items-center gap-2">
				{#if linkedECNs.length > 0}
					<a href="/lmat/ecn" class="flex items-center gap-1.5 rounded-md border border-chart-4/30 bg-chart-4/10 px-3 py-1.5 text-xs text-chart-4 hover:bg-chart-4/20 transition-colors">
						<GitBranch class="h-3.5 w-3.5" />
						{linkedECNs.length} ECN Activos
					</a>
				{/if}
				<a href="/lmat/especificaciones/{spec.id}/editar" class="flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
					<Settings class="h-3.5 w-3.5" /> Editar
				</a>
			</div>
		</div>

		<!-- Status Description -->
		<div class="rounded-lg border p-3 {BOM_MATURITY_COLORS[spec.status].replace('text-', 'border-').replace('/15', '/30')}">
			<p class="text-sm">
				<span class="font-medium">Estado actual:</span>{' '}
				{BOM_MATURITY_DESCRIPTIONS[spec.status]}
			</p>
		</div>

		<!-- Stats -->
		<div class="grid grid-cols-2 gap-4 md:grid-cols-4">
			<div class="rounded-lg border border-border bg-card p-3">
				<span class="text-xs text-muted-foreground">BOMs Asociados</span>
				<p class="text-xl font-bold text-card-foreground">{linkedBOMs.length}</p>
			</div>
			<div class="rounded-lg border border-border bg-card p-3">
				<span class="text-xs text-muted-foreground">Zonas de Proteccion</span>
				<p class="text-xl font-bold text-card-foreground">{spec.protectionByZone.length}</p>
			</div>
			<div class="rounded-lg border border-border bg-card p-3">
				<span class="text-xs text-muted-foreground">Componentes Especiales</span>
				<p class="text-xl font-bold text-card-foreground">{spec.specialComponents.length}</p>
			</div>
			<div class="rounded-lg border border-border bg-card p-3">
				<span class="text-xs text-muted-foreground">Accesorios Opcionales</span>
				<p class="text-xl font-bold text-card-foreground">{spec.optionalAccessories.length}</p>
			</div>
		</div>

		<!-- Tabs -->
		<div class="flex items-center gap-1 border-b border-border">
			{#each tabs as tab (tab.id)}
				{@const Icon = tab.icon}
				<button
					onclick={() => (activeTab = tab.id)}
					class="flex items-center gap-1.5 px-4 py-2 text-sm font-medium border-b-2 transition-colors {activeTab === tab.id ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}"
				>
					<Icon class="h-3.5 w-3.5" />
					{tab.label}
				</button>
			{/each}
		</div>

		<!-- Tab Content -->
		{#if activeTab === 'general'}
			<div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
				<!-- Basic Info -->
				<div class="rounded-lg border border-border bg-card">
					<div class="border-b border-border px-4 py-3">
						<h3 class="text-sm font-semibold text-card-foreground">Informacion General</h3>
					</div>
					<div class="p-4 space-y-3">
						<div class="flex justify-between">
							<span class="text-sm text-muted-foreground">Codigo</span>
							<span class="text-sm font-mono text-card-foreground">{spec.code}</span>
						</div>
						<div class="flex justify-between">
							<span class="text-sm text-muted-foreground">Marca</span>
							<span class="text-sm text-card-foreground">{spec.brand}</span>
						</div>
						<div class="flex justify-between">
							<span class="text-sm text-muted-foreground">Modelo</span>
							<span class="text-sm text-card-foreground">{spec.model}</span>
						</div>
						<div class="flex justify-between">
							<span class="text-sm text-muted-foreground">Ano / Generacion</span>
							<span class="text-sm text-card-foreground">{spec.year}</span>
						</div>
						<div class="flex justify-between">
							<span class="text-sm text-muted-foreground">Nivel de Blindaje</span>
							<span class="text-sm text-card-foreground">{ARMOR_LEVEL_LABELS[spec.armorLevel]}</span>
						</div>
						<div class="flex justify-between">
							<span class="text-sm text-muted-foreground">Tipo de Diseno</span>
							<span class="text-sm text-card-foreground capitalize">{spec.designType.replace('_', ' ')}</span>
						</div>
						<div class="flex justify-between">
							<span class="text-sm text-muted-foreground">Version</span>
							<span class="text-sm font-mono text-card-foreground">v{spec.version}</span>
						</div>
						<div class="flex justify-between">
							<span class="text-sm text-muted-foreground">Creado</span>
							<span class="text-sm text-card-foreground">{formatDate(spec.createdAt)}</span>
						</div>
						<div class="flex justify-between">
							<span class="text-sm text-muted-foreground">Actualizado</span>
							<span class="text-sm text-card-foreground">{formatDate(spec.updatedAt)}</span>
						</div>
					</div>
				</div>

				<!-- Special Components -->
				<div class="rounded-lg border border-border bg-card">
					<div class="border-b border-border px-4 py-3">
						<h3 class="text-sm font-semibold text-card-foreground">Componentes Especiales</h3>
					</div>
					<div class="p-4">
						{#if spec.specialComponents.length > 0}
							<ul class="space-y-2">
								{#each spec.specialComponents as comp, idx (idx)}
									<li class="flex items-center gap-2 text-sm text-card-foreground">
										<div class="h-1.5 w-1.5 rounded-full bg-primary"></div>
										{comp}
									</li>
								{/each}
							</ul>
						{:else}
							<p class="text-sm text-muted-foreground">Sin componentes especiales</p>
						{/if}
					</div>

					<div class="border-t border-border px-4 py-3">
						<h3 class="text-sm font-semibold text-card-foreground mb-3">Accesorios Opcionales</h3>
						{#if spec.optionalAccessories.length > 0}
							<div class="flex flex-wrap gap-2">
								{#each spec.optionalAccessories as acc, idx (idx)}
									<span class="rounded-full bg-secondary px-2.5 py-1 text-xs text-muted-foreground">{acc}</span>
								{/each}
							</div>
						{:else}
							<p class="text-sm text-muted-foreground">Sin accesorios opcionales</p>
						{/if}
					</div>
				</div>
			</div>
		{/if}

		{#if activeTab === 'proteccion'}
			<div class="rounded-lg border border-border bg-card overflow-hidden">
				<div class="border-b border-border px-4 py-3">
					<h3 class="text-sm font-semibold text-card-foreground">Proteccion por Zona</h3>
				</div>
				<div class="overflow-x-auto">
					<table class="w-full text-sm">
						<thead>
							<tr class="border-b border-border bg-secondary/50 text-left">
								<th class="px-4 py-2.5 text-xs font-medium text-muted-foreground">Zona</th>
								<th class="px-4 py-2.5 text-xs font-medium text-muted-foreground">Espesor</th>
								<th class="px-4 py-2.5 text-xs font-medium text-muted-foreground">Material</th>
								<th class="px-4 py-2.5 text-xs font-medium text-muted-foreground">Tipo de Traslape</th>
							</tr>
						</thead>
						<tbody>
							{#each spec.protectionByZone as zone, idx (idx)}
								<tr class="border-b border-border/50 hover:bg-secondary/30 transition-colors">
									<td class="px-4 py-2.5 font-medium text-card-foreground">{zone.zone}</td>
									<td class="px-4 py-2.5 font-mono text-card-foreground">{zone.thickness}</td>
									<td class="px-4 py-2.5 text-muted-foreground">{zone.material}</td>
									<td class="px-4 py-2.5 text-muted-foreground">{zone.overlapType}</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
				{#if spec.protectionByZone.length === 0}
					<div class="p-8 text-center text-sm text-muted-foreground">
						No se han definido zonas de proteccion
					</div>
				{/if}
			</div>
		{/if}

		{#if activeTab === 'boms'}
			<div class="rounded-lg border border-border bg-card overflow-hidden">
				<div class="border-b border-border px-4 py-3">
					<h3 class="text-sm font-semibold text-card-foreground">BOMs Vinculados</h3>
				</div>
				{#if linkedBOMs.length > 0}
					<div class="divide-y divide-border/50">
						{#each linkedBOMs as b (b.id)}
							<a href="/lmat/boms/{b.id}" class="flex items-center justify-between px-4 py-3 hover:bg-secondary/30 transition-colors">
								<div class="flex items-center gap-3">
									<Layers class="h-4 w-4 text-primary" />
									<div>
										<p class="font-mono text-sm text-primary">{b.specificationCode}</p>
										<p class="text-xs text-muted-foreground">
											{b.components.length} componentes / v{b.version}
										</p>
									</div>
								</div>
								<div class="flex items-center gap-2">
									<StatusBadge label={BOM_MATURITY_LABELS[b.maturityStatus]} colorClass={BOM_MATURITY_COLORS[b.maturityStatus]} />
									<div class="flex items-center gap-1">
										<div class="h-1.5 w-16 rounded-full bg-secondary">
											<div class="h-1.5 rounded-full {b.healthPercent >= 80 ? 'bg-primary' : b.healthPercent >= 50 ? 'bg-chart-4' : 'bg-destructive'}" style="width: {b.healthPercent}%"></div>
										</div>
										<span class="text-xs font-mono text-muted-foreground">{b.healthPercent}%</span>
									</div>
									<ChevronRight class="h-4 w-4 text-muted-foreground" />
								</div>
							</a>
						{/each}
					</div>
				{:else}
					<div class="p-8 text-center text-sm text-muted-foreground">
						No hay BOMs vinculados a esta especificacion
					</div>
				{/if}
			</div>
		{/if}

		{#if activeTab === 'validacion'}
			<div class="rounded-lg border border-border bg-card">
				<div class="border-b border-border px-4 py-3">
					<h3 class="text-sm font-semibold text-card-foreground">Validacion Multi-Departamental (LMAT 2.0)</h3>
					<p class="text-xs text-muted-foreground mt-1">
						Cada departamento debe validar su informacion antes de liberar la especificacion para serie
					</p>
				</div>
				<div class="p-4">
					{#if validations.length > 0}
						<div class="space-y-3">
							{#each validations as val, idx (idx)}
								{@const vi = getValidationIcon(val.status)}
								{@const Icon = vi.icon}
								<div class="flex items-center justify-between rounded-lg border border-border p-3">
									<div class="flex items-center gap-3">
										<Icon class="h-4 w-4 {vi.cls}" />
										<div>
											<p class="font-medium text-card-foreground">{val.department}</p>
											{#if val.validatedBy}
												<p class="text-xs text-muted-foreground">
													{val.validatedBy} - {formatDate(val.validatedAt || '')}
												</p>
											{/if}
										</div>
									</div>
									<StatusBadge label={DEPT_VALIDATION_LABELS[val.status]} colorClass={DEPT_VALIDATION_COLORS[val.status]} />
								</div>
							{/each}
						</div>
					{:else}
						<div class="space-y-3">
							{#each VALIDATION_DEPARTMENTS as dept, idx (idx)}
								<div class="flex items-center justify-between rounded-lg border border-border/50 bg-secondary/20 p-3">
									<div class="flex items-center gap-3">
										<Clock3 class="h-4 w-4 text-muted-foreground" />
										<p class="text-muted-foreground">{dept}</p>
									</div>
									<StatusBadge label="Pendiente" colorClass="bg-muted text-muted-foreground" />
								</div>
							{/each}
						</div>
					{/if}

					<!-- Validation Progress -->
					<div class="mt-4 pt-4 border-t border-border">
						<div class="flex items-center justify-between mb-2">
							<span class="text-sm text-muted-foreground">Progreso de Validacion</span>
							<span class="text-sm font-mono text-card-foreground">
								{validations.filter((v) => v.status === 'completado').length}/{VALIDATION_DEPARTMENTS.length}
							</span>
						</div>
						<div class="h-2 rounded-full bg-secondary">
							<div class="h-2 rounded-full bg-primary transition-all" style="width: {(validations.filter((v) => v.status === 'completado').length / VALIDATION_DEPARTMENTS.length) * 100}%"></div>
						</div>
					</div>
				</div>
			</div>
		{/if}

		{#if activeTab === 'historial'}
			<div class="rounded-lg border border-border bg-card">
				<div class="border-b border-border px-4 py-3">
					<h3 class="text-sm font-semibold text-card-foreground">Historial de Cambios</h3>
				</div>
				{#if spec.changeHistory.length > 0}
					<div class="divide-y divide-border/50">
						{#each [...spec.changeHistory].reverse() as change (change.id)}
							<div class="flex items-start gap-3 px-4 py-3">
								<div class="mt-0.5 h-2 w-2 rounded-full bg-primary"></div>
								<div class="flex-1">
									<div class="flex items-center justify-between">
										<span class="text-sm font-medium text-card-foreground">{change.changeType}</span>
										<span class="text-xs text-muted-foreground">{formatDate(change.changedAt)}</span>
									</div>
									<p class="text-sm text-muted-foreground mt-0.5">{change.description}</p>
									<p class="text-xs text-muted-foreground mt-1">Por: {change.changedBy}</p>
								</div>
							</div>
						{/each}
					</div>
				{:else}
					<div class="p-8 text-center text-sm text-muted-foreground">
						No hay cambios registrados
					</div>
				{/if}
			</div>
		{/if}
	</div>
{/if}
