<script lang="ts">
	import { page } from '$app/state';
	import { cn } from '$lib/utils.js';
	import type { Component } from 'svelte';
	import LayoutDashboard from '@lucide/svelte/icons/layout-dashboard';
	import Package from '@lucide/svelte/icons/package';
	import Layers from '@lucide/svelte/icons/layers';
	import FolderKanban from '@lucide/svelte/icons/folder-kanban';
	import ChevronDown from '@lucide/svelte/icons/chevron-down';
	import Shield from '@lucide/svelte/icons/shield';
	import Search from '@lucide/svelte/icons/search';
	import FileUp from '@lucide/svelte/icons/file-up';
	import Plus from '@lucide/svelte/icons/plus';
	import FileStack from '@lucide/svelte/icons/file-stack';
	import GitBranch from '@lucide/svelte/icons/git-branch';
	import Boxes from '@lucide/svelte/icons/boxes';
	import Users from '@lucide/svelte/icons/users';
	import Car from '@lucide/svelte/icons/car';

	type NavItem = { label: string; href: string; icon: Component<{ class?: string }> };
	type NavGroup = { label: string; icon: Component<{ class?: string }>; items: NavItem[] };

	const navigation: NavGroup[] = [
		{
			label: 'Inicio',
			icon: LayoutDashboard,
			items: [{ label: 'Dashboard', href: '/', icon: LayoutDashboard }]
		},
		{
			label: 'LMAT',
			icon: Layers,
			items: [
				{ label: 'Dashboard', href: '/lmat', icon: Layers },
				{ label: 'BOMs', href: '/lmat/boms', icon: FileStack },
				{ label: 'Especificaciones', href: '/lmat/especificaciones', icon: Car },
				{ label: 'ECN', href: '/lmat/ecn', icon: GitBranch },
				{ label: 'Kits Surtimiento', href: '/lmat/kits', icon: Boxes },
				{ label: 'Validacion', href: '/lmat/validacion', icon: Users },
				{ label: 'Where-Used', href: '/lmat/where-used', icon: Search }
			]
		},
		{
			label: 'Articulos',
			icon: Package,
			items: [
				{ label: 'Catalogo', href: '/articulos', icon: Package },
				{ label: 'Nuevo Articulo', href: '/articulos/nuevo', icon: Plus },
				{ label: 'Importar', href: '/articulos/importar', icon: FileUp }
			]
		},
		{
			label: 'Proyectos',
			icon: FolderKanban,
			items: [
				{ label: 'Dashboard', href: '/proyectos', icon: FolderKanban },
				{ label: 'Nuevo Proyecto', href: '/proyectos/nuevo', icon: Plus }
			]
		}
	];

	let openGroups = $state<Record<string, boolean>>(
		Object.fromEntries(navigation.map((g) => [g.label, true]))
	);

	function toggleGroup(label: string) {
		openGroups[label] = !openGroups[label];
	}

	function isActive(href: string): boolean {
		const path = page.url.pathname;
		return path === href || (href !== '/' && path.startsWith(href));
	}
</script>

<aside class="border-sidebar-border bg-sidebar flex h-screen w-60 flex-col border-r">
	<!-- Logo -->
	<div class="border-sidebar-border flex h-14 items-center gap-2 border-b px-4">
		<div class="bg-primary flex h-8 w-8 items-center justify-center rounded-md">
			<Shield class="text-primary-foreground h-4 w-4" />
		</div>
		<div class="flex flex-col">
			<span class="text-sidebar-foreground text-sm font-semibold">TPS ERP</span>
			<span class="text-muted-foreground text-[10px]">Blindaje Vehicular</span>
		</div>
	</div>

	<!-- Navigation -->
	<nav class="flex-1 overflow-y-auto px-2 py-3">
		{#each navigation as group (group.label)}
			{@const GroupIcon = group.icon}
			<div class="mb-1">
				<button
					onclick={() => toggleGroup(group.label)}
					class="text-muted-foreground hover:text-sidebar-foreground flex w-full items-center justify-between rounded-md px-2 py-1.5 text-xs font-medium tracking-wider uppercase"
				>
					<span class="flex items-center gap-2">
						<GroupIcon class="h-4 w-4" />
						{group.label}
					</span>
					<ChevronDown
						class={cn('h-3 w-3 transition-transform', openGroups[group.label] && 'rotate-180')}
					/>
				</button>
				{#if openGroups[group.label]}
					<div class="mt-0.5 flex flex-col gap-0.5">
						{#each group.items as item (item.href)}
							{@const ItemIcon = item.icon}
							<a
								href={item.href}
								class={cn(
									'flex items-center gap-2 rounded-md px-3 py-1.5 text-sm transition-colors',
									isActive(item.href)
										? 'bg-sidebar-accent text-primary font-medium'
										: 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground'
								)}
							>
								<ItemIcon class="h-4 w-4" />
								{item.label}
							</a>
						{/each}
					</div>
				{/if}
			</div>
		{/each}
	</nav>

	<!-- Footer -->
	<div class="border-sidebar-border border-t p-3">
		<p class="text-muted-foreground text-center text-[10px]">TPS ERP v1.0 - Fase 1 MVP</p>
	</div>
</aside>
