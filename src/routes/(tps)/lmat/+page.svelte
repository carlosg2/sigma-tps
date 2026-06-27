<script lang="ts">
	import { useStore } from '$lib/tps/store.svelte.js';
	import StatusBadge from '$lib/tps/components/status-badge.svelte';
	import {
		BOM_MATURITY_LABELS,
		BOM_MATURITY_COLORS,
		ECN_STATUS_LABELS,
		ECN_STATUS_COLORS
	} from '$lib/tps/constants.js';
	import { cn } from '$lib/utils.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Table from '$lib/components/ui/table/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Progress } from '$lib/components/ui/progress/index.js';
	import type { Component } from 'svelte';
	import FileStack from '@lucide/svelte/icons/file-stack';
	import Car from '@lucide/svelte/icons/car';
	import GitBranch from '@lucide/svelte/icons/git-branch';
	import Boxes from '@lucide/svelte/icons/boxes';
	import Users from '@lucide/svelte/icons/users';
	import CheckCircle2 from '@lucide/svelte/icons/circle-check-big';
	import Plus from '@lucide/svelte/icons/plus';
	import Layers from '@lucide/svelte/icons/layers';
	import ArrowRight from '@lucide/svelte/icons/arrow-right';
	import AlertTriangle from '@lucide/svelte/icons/triangle-alert';
	import Search from '@lucide/svelte/icons/search';

	const store = useStore();
	const app = $derived(store.state);

	const boms = $derived(app.boms ?? []);
	const specifications = $derived(app.specifications ?? []);
	const ecns = $derived(app.ecns ?? []);
	const supplyKits = $derived(app.supplyKits ?? []);

	const totalBOMs = $derived(boms.length);
	const releasedBOMs = $derived(boms.filter((b) => b.maturityStatus === 'liberado').length);
	const avgHealth = $derived(
		totalBOMs > 0 ? Math.round(boms.reduce((sum, b) => sum + b.healthPercent, 0) / totalBOMs) : 0
	);
	const totalSpecs = $derived(specifications.length);
	const releasedSpecs = $derived(specifications.filter((s) => s.status === 'liberado').length);
	const pendingECNs = $derived(ecns.filter((e) => !['completado', 'rechazado'].includes(e.status)).length);
	const inApprovalECNs = $derived(ecns.filter((e) => e.status === 'aprobacion').length);
	const pendingKits = $derived(supplyKits.filter((k) => k.status === 'pendiente').length);
	const withBackorder = $derived(supplyKits.filter((k) => k.hasBackorder).length);
	const bomsWithFullValidation = $derived(
		boms.filter((b) => b.departmentValidations?.every((v) => v.status === 'completado')).length
	);
	const bomsPendingValidation = $derived(
		boms.filter((b) => b.departmentValidations?.some((v) => v.status !== 'completado')).length
	);

	const recentBOMs = $derived(
		[...boms].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()).slice(0, 5)
	);
	const recentECNs = $derived(
		[...ecns].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()).slice(0, 3)
	);
	const maturityStats = $derived(
		(['en_desarrollo', 'preliminar', 'estabilizado', 'liberado', 'obsoleto'] as const).map((status) => {
			const count = boms.filter((b) => b.maturityStatus === status).length;
			const pct = totalBOMs > 0 ? (count / totalBOMs) * 100 : 0;
			return { status, count, pct };
		})
	);

	const stats: { label: string; value: string | number; subtitle: string; icon: Component<{ class?: string }>; href: string; alert?: boolean }[] = $derived([
		{ label: 'BOMs Totales', value: totalBOMs, subtitle: `${releasedBOMs} liberados`, icon: FileStack, href: '/lmat/boms' },
		{ label: 'Especificaciones', value: totalSpecs, subtitle: `${releasedSpecs} liberadas`, icon: Car, href: '/lmat/especificaciones' },
		{ label: 'ECN Pendientes', value: pendingECNs, subtitle: `${inApprovalECNs} en aprobacion`, icon: GitBranch, href: '/lmat/ecn', alert: pendingECNs > 0 },
		{ label: 'Kits Pendientes', value: pendingKits, subtitle: `${withBackorder} con backorder`, icon: Boxes, href: '/lmat/kits', alert: pendingKits > 0 },
		{ label: 'Validaciones', value: `${bomsWithFullValidation}/${totalBOMs}`, subtitle: `${bomsPendingValidation} pendientes`, icon: Users, href: '/lmat/validacion' },
		{ label: 'Salud Promedio', value: `${avgHealth}%`, subtitle: 'Completitud BOMs', icon: CheckCircle2, href: '/lmat/boms' }
	]);

	const quickActions: { href: string; icon: Component<{ class?: string }>; label: string }[] = [
		{ href: '/lmat/boms', icon: FileStack, label: 'BOMs' },
		{ href: '/lmat/especificaciones', icon: Car, label: 'Especificaciones' },
		{ href: '/lmat/ecn', icon: GitBranch, label: 'ECN' },
		{ href: '/lmat/kits', icon: Boxes, label: 'Kits' },
		{ href: '/lmat/validacion', icon: Users, label: 'Validacion' },
		{ href: '/lmat/where-used', icon: Search, label: 'Where-Used' },
		{ href: '/lmat/boms/nuevo', icon: Plus, label: 'Nuevo BOM' }
	];
</script>

<!-- Header -->
<div class="flex flex-wrap items-center justify-between gap-3">
	<p class="text-muted-foreground text-sm">
		Gestion integral de listas de materiales, especificaciones tecnicas y control de cambios
	</p>
	<Button href="/lmat/boms/nuevo" size="sm">
		<Plus data-icon="inline-start" /> Nuevo BOM
	</Button>
</div>

<!-- Quick Stats -->
<div class="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
	{#each stats as s (s.label)}
		{@const Icon = s.icon}
		<a href={s.href} class="group">
			<Card.Root class={cn('h-full transition-colors hover:bg-muted/50', s.alert && 'border-chart-4/50 bg-chart-4/5')}>
				<Card.Header>
					<Card.Description class="flex items-center gap-2">
						<Icon class="size-4 {s.alert ? 'text-chart-4' : ''}" /> {s.label}
					</Card.Description>
					<Card.Title class="text-2xl font-semibold tabular-nums">{s.value}</Card.Title>
					{#if s.alert}
						<Card.Action><AlertTriangle class="text-chart-4 size-4" /></Card.Action>
					{/if}
				</Card.Header>
				<Card.Content>
					<p class="text-muted-foreground text-xs">{s.subtitle}</p>
				</Card.Content>
			</Card.Root>
		</a>
	{/each}
</div>

<!-- Quick Actions -->
<div class="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-7">
	{#each quickActions as a (a.href)}
		{@const Icon = a.icon}
		<a href={a.href} class="group">
			<Card.Root class="transition-colors hover:bg-muted/50">
				<Card.Content class="flex flex-col items-center gap-1.5 py-4">
					<Icon class="text-muted-foreground size-5" />
					<span class="text-xs font-medium">{a.label}</span>
				</Card.Content>
			</Card.Root>
		</a>
	{/each}
</div>

<!-- Main Content Grid -->
<div class="grid grid-cols-1 gap-4 lg:grid-cols-3">
	<!-- Recent BOMs -->
	<Card.Root class="lg:col-span-2">
		<Card.Header>
			<Card.Title>BOMs Recientes</Card.Title>
			<Card.Action>
				<Button href="/lmat/boms" variant="link" size="sm">
					Ver todos <ArrowRight data-icon="inline-end" />
				</Button>
			</Card.Action>
		</Card.Header>
		<Card.Content>
			<Table.Root>
				<Table.Header>
					<Table.Row>
						<Table.Head>Modelo</Table.Head>
						<Table.Head>Especificacion</Table.Head>
						<Table.Head>Madurez</Table.Head>
						<Table.Head>Salud</Table.Head>
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{#each recentBOMs as bom (bom.id)}
						<Table.Row>
							<Table.Cell>
								<a href="/lmat/boms/{bom.id}" class="font-medium hover:underline">{bom.vehicleModel}</a>
							</Table.Cell>
							<Table.Cell class="text-muted-foreground font-mono text-xs">{bom.specificationCode} · v{bom.version}</Table.Cell>
							<Table.Cell>
								<StatusBadge label={BOM_MATURITY_LABELS[bom.maturityStatus || 'en_desarrollo']} colorClass={BOM_MATURITY_COLORS[bom.maturityStatus || 'en_desarrollo']} />
							</Table.Cell>
							<Table.Cell>
								<div class="flex items-center gap-2">
									<Progress value={bom.healthPercent} max={100} class={cn('h-1.5 w-16', bom.healthPercent >= 80 ? '' : bom.healthPercent >= 50 ? '*:data-[slot=progress-indicator]:bg-chart-4' : '*:data-[slot=progress-indicator]:bg-destructive')} />
									<span class="text-muted-foreground w-8 text-right font-mono text-xs tabular-nums">{bom.healthPercent}%</span>
								</div>
							</Table.Cell>
						</Table.Row>
					{/each}
				</Table.Body>
			</Table.Root>
		</Card.Content>
	</Card.Root>

	<!-- ECNs & Maturity -->
	<div class="flex flex-col gap-4">
		<Card.Root>
			<Card.Header>
				<Card.Title>ECNs Recientes</Card.Title>
				<Card.Action>
					<Button href="/lmat/ecn" variant="link" size="sm">
						Ver todos <ArrowRight data-icon="inline-end" />
					</Button>
				</Card.Action>
			</Card.Header>
			<Card.Content class="flex flex-col gap-2">
				{#if recentECNs.length > 0}
					{#each recentECNs as ecn (ecn.id)}
						<a href="/lmat/ecn/{ecn.id}" class="hover:bg-muted/50 -mx-2 flex items-center justify-between gap-2 rounded-md px-2 py-2 transition-colors">
							<div class="min-w-0">
								<p class="font-mono text-sm font-medium">{ecn.code}</p>
								<p class="text-muted-foreground line-clamp-1 text-xs">{ecn.justification}</p>
							</div>
							<StatusBadge label={ECN_STATUS_LABELS[ecn.status]} colorClass={ECN_STATUS_COLORS[ecn.status]} />
						</a>
					{/each}
				{:else}
					<p class="text-muted-foreground py-4 text-center text-sm">No hay ECNs pendientes</p>
				{/if}
			</Card.Content>
		</Card.Root>

		<Card.Root>
			<Card.Header>
				<Card.Title class="flex items-center gap-2"><Layers class="size-4" /> Estado de Madurez</Card.Title>
			</Card.Header>
			<Card.Content class="flex flex-col gap-2">
				{#each maturityStats as { status, count, pct } (status)}
					<div class="flex items-center gap-3">
						<div class="w-24 shrink-0">
							<StatusBadge label={BOM_MATURITY_LABELS[status]} colorClass={BOM_MATURITY_COLORS[status]} />
						</div>
						<Progress value={pct} max={100} class="flex-1" />
						<span class="text-muted-foreground w-8 text-right font-mono text-xs tabular-nums">{count}</span>
					</div>
				{/each}
			</Card.Content>
		</Card.Root>
	</div>
</div>
