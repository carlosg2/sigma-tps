<script lang="ts">
	import { useStore } from '$lib/tps/store.svelte.js';
	import {
		BOM_MATURITY_LABELS,
		BOM_MATURITY_COLORS,
		ECN_STATUS_LABELS,
		ECN_STATUS_COLORS
	} from '$lib/tps/constants.js';
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

<div class="flex flex-col gap-6">
	<!-- Header -->
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-foreground text-2xl font-bold">LMAT - Lista de Materiales</h1>
			<p class="text-muted-foreground text-sm">
				Gestion integral de listas de materiales, especificaciones tecnicas y control de cambios
			</p>
		</div>
		<a
			href="/lmat/boms/nuevo"
			class="bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium"
		>
			<Plus class="h-4 w-4" /> Nuevo BOM
		</a>
	</div>

	<!-- Quick Stats -->
	<div class="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
		{#each stats as s (s.label)}
			{@const Icon = s.icon}
			<a
				href={s.href}
				class="hover:bg-secondary/50 flex flex-col rounded-lg border p-4 transition-colors {s.alert ? 'border-chart-4/50 bg-chart-4/5' : 'border-border bg-card'}"
			>
				<div class="mb-2 flex items-center justify-between">
					<span class={s.alert ? 'text-chart-4' : 'text-muted-foreground'}><Icon class="h-5 w-5" /></span>
					{#if s.alert}<AlertTriangle class="text-chart-4 h-4 w-4" />{/if}
				</div>
				<span class="text-card-foreground text-2xl font-bold">{s.value}</span>
				<span class="text-muted-foreground text-xs">{s.label}</span>
				<span class="text-muted-foreground mt-0.5 text-[10px]">{s.subtitle}</span>
			</a>
		{/each}
	</div>

	<!-- Quick Actions -->
	<div class="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-7">
		{#each quickActions as a (a.href)}
			{@const Icon = a.icon}
			<a
				href={a.href}
				class="border-border bg-card hover:bg-secondary/50 flex flex-col items-center gap-1.5 rounded-lg border p-3 transition-colors"
			>
				<span class="text-muted-foreground"><Icon class="h-5 w-5" /></span>
				<span class="text-card-foreground text-xs font-medium">{a.label}</span>
			</a>
		{/each}
	</div>

	<!-- Main Content Grid -->
	<div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
		<!-- Recent BOMs -->
		<div class="border-border bg-card rounded-lg border lg:col-span-2">
			<div class="border-border flex items-center justify-between border-b px-4 py-3">
				<div class="flex items-center gap-2">
					<FileStack class="text-primary h-4 w-4" />
					<h3 class="text-card-foreground font-semibold">BOMs Recientes</h3>
				</div>
				<a href="/lmat/boms" class="text-primary flex items-center gap-1 text-xs hover:underline">
					Ver todos <ArrowRight class="h-3 w-3" />
				</a>
			</div>
			<div class="divide-border divide-y">
				{#each recentBOMs as bom (bom.id)}
					<a
						href="/lmat/boms/{bom.id}"
						class="hover:bg-secondary/50 flex items-center justify-between px-4 py-3 transition-colors"
					>
						<div class="flex items-center gap-3">
							<div class="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-lg">
								<Layers class="text-primary h-5 w-5" />
							</div>
							<div>
								<p class="text-card-foreground font-medium">{bom.vehicleModel}</p>
								<div class="text-muted-foreground flex items-center gap-2 text-xs">
									<span>{bom.specificationCode}</span>
									<span>v{bom.version}</span>
								</div>
							</div>
						</div>
						<div class="flex items-center gap-3">
							<span class="rounded-full px-2 py-0.5 text-[10px] font-medium {BOM_MATURITY_COLORS[bom.maturityStatus || 'en_desarrollo']}">
								{BOM_MATURITY_LABELS[bom.maturityStatus || 'en_desarrollo']}
							</span>
							<div class="flex items-center gap-1">
								<div class="bg-secondary h-1.5 w-16 rounded-full">
									<div
										class="h-1.5 rounded-full {bom.healthPercent >= 80 ? 'bg-emerald-500' : bom.healthPercent >= 50 ? 'bg-chart-4' : 'bg-destructive'}"
										style="width: {bom.healthPercent}%"
									></div>
								</div>
								<span class="text-muted-foreground font-mono text-xs">{bom.healthPercent}%</span>
							</div>
						</div>
					</a>
				{/each}
			</div>
		</div>

		<!-- ECNs & Maturity -->
		<div class="flex flex-col gap-4">
			<div class="border-border bg-card rounded-lg border">
				<div class="border-border flex items-center justify-between border-b px-4 py-3">
					<div class="flex items-center gap-2">
						<GitBranch class="text-chart-4 h-4 w-4" />
						<h3 class="text-card-foreground font-semibold">ECNs Recientes</h3>
					</div>
					<a href="/lmat/ecn" class="text-primary flex items-center gap-1 text-xs hover:underline">
						Ver todos <ArrowRight class="h-3 w-3" />
					</a>
				</div>
				<div class="divide-border divide-y">
					{#if recentECNs.length > 0}
						{#each recentECNs as ecn (ecn.id)}
							<a
								href="/lmat/ecn/{ecn.id}"
								class="hover:bg-secondary/50 flex items-center justify-between px-4 py-3 transition-colors"
							>
								<div>
									<p class="text-card-foreground font-mono text-sm font-medium">{ecn.code}</p>
									<p class="text-muted-foreground line-clamp-1 text-xs">{ecn.justification}</p>
								</div>
								<span class="rounded-full px-2 py-0.5 text-[10px] font-medium {ECN_STATUS_COLORS[ecn.status]}">
									{ECN_STATUS_LABELS[ecn.status]}
								</span>
							</a>
						{/each}
					{:else}
						<div class="text-muted-foreground px-4 py-6 text-center text-sm">No hay ECNs pendientes</div>
					{/if}
				</div>
			</div>

			<div class="border-border bg-card rounded-lg border">
				<div class="border-border flex items-center gap-2 border-b px-4 py-3">
					<Layers class="text-primary h-4 w-4" />
					<h3 class="text-card-foreground font-semibold">Estado de Madurez</h3>
				</div>
				<div class="space-y-2 p-4">
					{#each maturityStats as { status, count, pct } (status)}
						<div class="flex items-center gap-3">
							<span class="w-24 rounded px-1.5 py-0.5 text-xs {BOM_MATURITY_COLORS[status]}">{BOM_MATURITY_LABELS[status]}</span>
							<div class="bg-secondary h-2 flex-1 rounded-full">
								<div class="bg-primary/60 h-2 rounded-full transition-all" style="width: {pct}%"></div>
							</div>
							<span class="text-muted-foreground w-8 text-right font-mono text-xs">{count}</span>
						</div>
					{/each}
				</div>
			</div>
		</div>
	</div>
</div>
