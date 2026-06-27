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
	import StatCard from '$lib/tps/components/stat-card.svelte';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Table from '$lib/components/ui/table/index.js';
	import * as Tabs from '$lib/components/ui/tabs/index.js';
	import * as Alert from '$lib/components/ui/alert/index.js';
	import * as Empty from '$lib/components/ui/empty/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { Progress } from '$lib/components/ui/progress/index.js';
	import { Separator } from '$lib/components/ui/separator/index.js';
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
	import Info from '@lucide/svelte/icons/info';

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
	<div class="mx-auto flex w-full max-w-5xl flex-col items-center justify-center gap-4 py-20">
		<p class="text-muted-foreground">Especificacion no encontrada</p>
		<Button href="/lmat/especificaciones" variant="outline" size="sm">Volver al listado</Button>
	</div>
{:else}
	<div class="mx-auto flex w-full max-w-5xl flex-col gap-6">
		<!-- Header -->
		<div class="flex flex-wrap items-center justify-between gap-3">
			<div class="flex items-center gap-3">
				<Button href="/lmat/especificaciones" variant="outline" size="icon">
					<ArrowLeft />
				</Button>
				<div class="bg-primary/10 flex size-10 items-center justify-center rounded-lg">
					<Car class="text-primary size-5" />
				</div>
				<div class="flex flex-col gap-1">
					<div class="flex items-center gap-2">
						<h2 class="text-xl font-bold">{spec.brand} {spec.model}</h2>
						<Badge variant="outline" class="font-mono">v{spec.version}</Badge>
						<StatusBadge label={BOM_MATURITY_LABELS[spec.status]} colorClass={BOM_MATURITY_COLORS[spec.status]} />
					</div>
					<p class="text-muted-foreground text-sm">
						{spec.code} / {ARMOR_LEVEL_LABELS[spec.armorLevel]} / {spec.year}
					</p>
				</div>
			</div>
			<div class="flex items-center gap-2">
				{#if linkedECNs.length > 0}
					<Button href="/lmat/ecn" variant="outline" size="sm">
						<GitBranch data-icon="inline-start" /> {linkedECNs.length} ECN Activos
					</Button>
				{/if}
				<Button href="/lmat/especificaciones/{spec.id}/editar" size="sm">
					<Settings data-icon="inline-start" /> Editar
				</Button>
			</div>
		</div>

		<!-- Status Description -->
		<Alert.Root>
			<Info />
			<Alert.Title>Estado actual: {BOM_MATURITY_LABELS[spec.status]}</Alert.Title>
			<Alert.Description>{BOM_MATURITY_DESCRIPTIONS[spec.status]}</Alert.Description>
		</Alert.Root>

		<!-- Stats -->
		<div class="grid grid-cols-2 gap-4 md:grid-cols-4">
			<StatCard label="BOMs Asociados" value={linkedBOMs.length} icon={Layers} />
			<StatCard label="Zonas de Proteccion" value={spec.protectionByZone.length} icon={Shield} />
			<StatCard label="Componentes Especiales" value={spec.specialComponents.length} icon={Settings} />
			<StatCard label="Accesorios Opcionales" value={spec.optionalAccessories.length} icon={FileText} />
		</div>

		<!-- Tabs -->
		<Tabs.Root bind:value={activeTab}>
			<Tabs.List>
				{#each tabs as tab (tab.id)}
					{@const Icon = tab.icon}
					<Tabs.Trigger value={tab.id}>
						<Icon data-icon="inline-start" />
						{tab.label}
					</Tabs.Trigger>
				{/each}
			</Tabs.List>

			<!-- General -->
			<Tabs.Content value="general">
				<div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
					<!-- Basic Info -->
					<Card.Root>
						<Card.Header>
							<Card.Title>Informacion General</Card.Title>
						</Card.Header>
						<Card.Content class="flex flex-col gap-3">
							<div class="flex justify-between">
								<span class="text-muted-foreground text-sm">Codigo</span>
								<span class="font-mono text-sm">{spec.code}</span>
							</div>
							<div class="flex justify-between">
								<span class="text-muted-foreground text-sm">Marca</span>
								<span class="text-sm">{spec.brand}</span>
							</div>
							<div class="flex justify-between">
								<span class="text-muted-foreground text-sm">Modelo</span>
								<span class="text-sm">{spec.model}</span>
							</div>
							<div class="flex justify-between">
								<span class="text-muted-foreground text-sm">Ano / Generacion</span>
								<span class="text-sm">{spec.year}</span>
							</div>
							<div class="flex justify-between">
								<span class="text-muted-foreground text-sm">Nivel de Blindaje</span>
								<span class="text-sm">{ARMOR_LEVEL_LABELS[spec.armorLevel]}</span>
							</div>
							<div class="flex justify-between">
								<span class="text-muted-foreground text-sm">Tipo de Diseno</span>
								<span class="text-sm capitalize">{spec.designType.replace('_', ' ')}</span>
							</div>
							<div class="flex justify-between">
								<span class="text-muted-foreground text-sm">Version</span>
								<span class="font-mono text-sm">v{spec.version}</span>
							</div>
							<div class="flex justify-between">
								<span class="text-muted-foreground text-sm">Creado</span>
								<span class="text-sm">{formatDate(spec.createdAt)}</span>
							</div>
							<div class="flex justify-between">
								<span class="text-muted-foreground text-sm">Actualizado</span>
								<span class="text-sm">{formatDate(spec.updatedAt)}</span>
							</div>
						</Card.Content>
					</Card.Root>

					<!-- Special Components -->
					<Card.Root>
						<Card.Header>
							<Card.Title>Componentes Especiales</Card.Title>
						</Card.Header>
						<Card.Content class="flex flex-col gap-4">
							{#if spec.specialComponents.length > 0}
								<ul class="flex flex-col gap-2">
									{#each spec.specialComponents as comp, idx (idx)}
										<li class="flex items-center gap-2 text-sm">
											<div class="bg-primary size-1.5 rounded-full"></div>
											{comp}
										</li>
									{/each}
								</ul>
							{:else}
								<p class="text-muted-foreground text-sm">Sin componentes especiales</p>
							{/if}

							<Separator />

							<div class="flex flex-col gap-3">
								<h4 class="text-sm font-semibold">Accesorios Opcionales</h4>
								{#if spec.optionalAccessories.length > 0}
									<div class="flex flex-wrap gap-2">
										{#each spec.optionalAccessories as acc, idx (idx)}
											<Badge variant="secondary">{acc}</Badge>
										{/each}
									</div>
								{:else}
									<p class="text-muted-foreground text-sm">Sin accesorios opcionales</p>
								{/if}
							</div>
						</Card.Content>
					</Card.Root>
				</div>
			</Tabs.Content>

			<!-- Proteccion -->
			<Tabs.Content value="proteccion">
				<Card.Root>
					<Card.Header>
						<Card.Title>Proteccion por Zona</Card.Title>
					</Card.Header>
					<Card.Content>
						{#if spec.protectionByZone.length > 0}
							<Table.Root>
								<Table.Header>
									<Table.Row>
										<Table.Head>Zona</Table.Head>
										<Table.Head>Espesor</Table.Head>
										<Table.Head>Material</Table.Head>
										<Table.Head>Tipo de Traslape</Table.Head>
									</Table.Row>
								</Table.Header>
								<Table.Body>
									{#each spec.protectionByZone as zone, idx (idx)}
										<Table.Row>
											<Table.Cell class="font-medium">{zone.zone}</Table.Cell>
											<Table.Cell class="font-mono">{zone.thickness}</Table.Cell>
											<Table.Cell class="text-muted-foreground">{zone.material}</Table.Cell>
											<Table.Cell class="text-muted-foreground">{zone.overlapType}</Table.Cell>
										</Table.Row>
									{/each}
								</Table.Body>
							</Table.Root>
						{:else}
							<Empty.Root class="border-0">
								<Empty.Header>
									<Empty.Media variant="icon">
										<Shield />
									</Empty.Media>
									<Empty.Title>Sin zonas de proteccion</Empty.Title>
									<Empty.Description>No se han definido zonas de proteccion</Empty.Description>
								</Empty.Header>
							</Empty.Root>
						{/if}
					</Card.Content>
				</Card.Root>
			</Tabs.Content>

			<!-- BOMs -->
			<Tabs.Content value="boms">
				<Card.Root>
					<Card.Header>
						<Card.Title>BOMs Vinculados</Card.Title>
					</Card.Header>
					<Card.Content>
						{#if linkedBOMs.length > 0}
							<div class="flex flex-col">
								{#each linkedBOMs as b, idx (b.id)}
									{#if idx > 0}<Separator />{/if}
									<a href="/lmat/boms/{b.id}" class="hover:bg-muted/50 -mx-2 flex items-center justify-between rounded-md px-2 py-3 transition-colors">
										<div class="flex items-center gap-3">
											<Layers class="text-primary size-4" />
											<div class="flex flex-col">
												<p class="text-primary font-mono text-sm">{b.specificationCode}</p>
												<p class="text-muted-foreground text-xs">
													{b.components.length} componentes / v{b.version}
												</p>
											</div>
										</div>
										<div class="flex items-center gap-3">
											<StatusBadge label={BOM_MATURITY_LABELS[b.maturityStatus]} colorClass={BOM_MATURITY_COLORS[b.maturityStatus]} />
											<div class="flex items-center gap-2">
												<Progress
													value={b.healthPercent}
													max={100}
													class={b.healthPercent >= 80 ? 'h-1.5 w-16' : b.healthPercent >= 50 ? 'h-1.5 w-16 *:data-[slot=progress-indicator]:bg-chart-4' : 'h-1.5 w-16 *:data-[slot=progress-indicator]:bg-destructive'}
												/>
												<span class="text-muted-foreground font-mono text-xs tabular-nums">{b.healthPercent}%</span>
											</div>
											<ChevronRight class="text-muted-foreground size-4" />
										</div>
									</a>
								{/each}
							</div>
						{:else}
							<Empty.Root class="border-0">
								<Empty.Header>
									<Empty.Media variant="icon">
										<Layers />
									</Empty.Media>
									<Empty.Title>Sin BOMs vinculados</Empty.Title>
									<Empty.Description>No hay BOMs vinculados a esta especificacion</Empty.Description>
								</Empty.Header>
							</Empty.Root>
						{/if}
					</Card.Content>
				</Card.Root>
			</Tabs.Content>

			<!-- Validacion -->
			<Tabs.Content value="validacion">
				<Card.Root>
					<Card.Header>
						<Card.Title>Validacion Multi-Departamental (LMAT 2.0)</Card.Title>
						<Card.Description>
							Cada departamento debe validar su informacion antes de liberar la especificacion para serie
						</Card.Description>
					</Card.Header>
					<Card.Content class="flex flex-col gap-4">
						{#if validations.length > 0}
							<div class="flex flex-col gap-3">
								{#each validations as val, idx (idx)}
									{@const vi = getValidationIcon(val.status)}
									{@const Icon = vi.icon}
									<div class="flex items-center justify-between rounded-lg border p-3">
										<div class="flex items-center gap-3">
											<Icon class="size-4 {vi.cls}" />
											<div class="flex flex-col">
												<p class="font-medium">{val.department}</p>
												{#if val.validatedBy}
													<p class="text-muted-foreground text-xs">
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
							<div class="flex flex-col gap-3">
								{#each VALIDATION_DEPARTMENTS as dept, idx (idx)}
									<div class="bg-muted/30 flex items-center justify-between rounded-lg border p-3">
										<div class="flex items-center gap-3">
											<Clock3 class="text-muted-foreground size-4" />
											<p class="text-muted-foreground">{dept}</p>
										</div>
										<StatusBadge label="Pendiente" colorClass="bg-muted text-muted-foreground" />
									</div>
								{/each}
							</div>
						{/if}

						<Separator />

						<div class="flex flex-col gap-2">
							<div class="flex items-center justify-between text-sm">
								<span class="text-muted-foreground">Progreso de Validacion</span>
								<span class="font-mono tabular-nums">
									{validations.filter((v) => v.status === 'completado').length}/{VALIDATION_DEPARTMENTS.length}
								</span>
							</div>
							<Progress
								value={(validations.filter((v) => v.status === 'completado').length / VALIDATION_DEPARTMENTS.length) * 100}
								max={100}
							/>
						</div>
					</Card.Content>
				</Card.Root>
			</Tabs.Content>

			<!-- Historial -->
			<Tabs.Content value="historial">
				<Card.Root>
					<Card.Header>
						<Card.Title>Historial de Cambios</Card.Title>
					</Card.Header>
					<Card.Content>
						{#if spec.changeHistory.length > 0}
							<div class="flex flex-col">
								{#each [...spec.changeHistory].reverse() as change, idx (change.id)}
									{#if idx > 0}<Separator />{/if}
									<div class="flex items-start gap-3 py-3">
										<div class="bg-primary mt-1.5 size-2 rounded-full"></div>
										<div class="flex flex-1 flex-col gap-0.5">
											<div class="flex items-center justify-between">
												<span class="text-sm font-medium">{change.changeType}</span>
												<span class="text-muted-foreground text-xs">{formatDate(change.changedAt)}</span>
											</div>
											<p class="text-muted-foreground text-sm">{change.description}</p>
											<p class="text-muted-foreground text-xs">Por: {change.changedBy}</p>
										</div>
									</div>
								{/each}
							</div>
						{:else}
							<Empty.Root class="border-0">
								<Empty.Header>
									<Empty.Media variant="icon">
										<History />
									</Empty.Media>
									<Empty.Title>Sin historial</Empty.Title>
									<Empty.Description>No hay cambios registrados</Empty.Description>
								</Empty.Header>
							</Empty.Root>
						{/if}
					</Card.Content>
				</Card.Root>
			</Tabs.Content>
		</Tabs.Root>
	</div>
{/if}
