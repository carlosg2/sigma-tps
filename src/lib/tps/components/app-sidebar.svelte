<script lang="ts">
	import { page } from '$app/state';
	import type { Component, ComponentProps } from 'svelte';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import * as Avatar from '$lib/components/ui/avatar/index.js';
	import { useStore } from '$lib/tps/store.svelte.js';
	import { ROLE_LABELS } from '$lib/tps/constants.js';
	import LayoutDashboard from '@lucide/svelte/icons/layout-dashboard';
	import Package from '@lucide/svelte/icons/package';
	import Layers from '@lucide/svelte/icons/layers';
	import FolderKanban from '@lucide/svelte/icons/folder-kanban';
	import Shield from '@lucide/svelte/icons/shield';
	import Search from '@lucide/svelte/icons/search';
	import FileUp from '@lucide/svelte/icons/file-up';
	import Plus from '@lucide/svelte/icons/plus';
	import FileStack from '@lucide/svelte/icons/file-stack';
	import GitBranch from '@lucide/svelte/icons/git-branch';
	import Boxes from '@lucide/svelte/icons/boxes';
	import Users from '@lucide/svelte/icons/users';
	import Car from '@lucide/svelte/icons/car';
	import ArrowRightLeft from '@lucide/svelte/icons/arrow-right-left';
	import Scissors from '@lucide/svelte/icons/scissors';
	import Wand from '@lucide/svelte/icons/wand-sparkles';
	import Tablet from '@lucide/svelte/icons/tablet';

	let { ref = $bindable(null), ...restProps }: ComponentProps<typeof Sidebar.Root> = $props();

	const store = useStore();

	type NavItem = { label: string; href: string; icon: Component };
	type NavGroup = { label: string; items: NavItem[] };

	const navigation: NavGroup[] = [
		{
			label: 'Ingeniería',
			items: [
				{ label: 'Dashboard', href: '/lmat', icon: Layers },
				{ label: 'BOMs', href: '/lmat/boms', icon: FileStack },
				{ label: 'Nuevo BOM', href: '/lmat/boms/nuevo', icon: Plus },
				{ label: 'Importar BOMs', href: '/lmat/boms/importar', icon: FileUp },
				{ label: 'Cambio Masivo', href: '/lmat/boms/cambio-masivo', icon: ArrowRightLeft },
				{ label: 'Especificaciones', href: '/lmat/especificaciones', icon: Car },
				{ label: 'ECN', href: '/lmat/ecn', icon: GitBranch },
				{ label: 'Kits Surtimiento', href: '/lmat/kits', icon: Boxes },
				{ label: 'Validacion', href: '/lmat/validacion', icon: Users },
				{ label: 'Where-Used', href: '/lmat/where-used', icon: Search },
				{ label: 'Wizard Producto', href: '/lmat/wizard', icon: Wand },
				{ label: 'Trazabilidad Corte', href: '/lmat/corte', icon: Scissors },
				{ label: 'Recepcion Vehiculos', href: '/lmat/recepcion', icon: Tablet }
			]
		},
		{
			label: 'Articulos',
			items: [
				{ label: 'Catalogo', href: '/articulos', icon: Package },
				{ label: 'Nuevo Articulo', href: '/articulos/nuevo', icon: Plus },
				{ label: 'Importar', href: '/articulos/importar', icon: FileUp }
			]
		},
		{
			label: 'Proyectos',
			items: [
				{ label: 'Dashboard', href: '/proyectos', icon: FolderKanban },
				{ label: 'Nuevo Proyecto', href: '/proyectos/nuevo', icon: Plus }
			]
		},
		{
			label: 'Implementacion',
			items: [{ label: 'Dashboard', href: '/implementacion', icon: LayoutDashboard }]
		}
	];

	function isActive(href: string): boolean {
		const path = page.url.pathname;
		return path === href || (href !== '/' && path.startsWith(href));
	}
</script>

<Sidebar.Root bind:ref collapsible="icon" {...restProps}>
	<Sidebar.Header>
		<Sidebar.Menu>
			<Sidebar.MenuItem>
				<Sidebar.MenuButton size="lg">
					{#snippet child({ props })}
						<a href="/" {...props}>
							<div
								class="bg-primary text-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg"
							>
								<Shield class="size-4" />
							</div>
							<div class="grid flex-1 text-left text-sm leading-tight">
								<span class="truncate font-semibold">TPS ERP</span>
								<span class="text-muted-foreground truncate text-xs">Blindaje Vehicular</span>
							</div>
						</a>
					{/snippet}
				</Sidebar.MenuButton>
			</Sidebar.MenuItem>
		</Sidebar.Menu>
	</Sidebar.Header>

	<Sidebar.Content>
		{#each navigation as group (group.label)}
			<Sidebar.Group>
				<Sidebar.GroupLabel>{group.label}</Sidebar.GroupLabel>
				<Sidebar.GroupContent>
					<Sidebar.Menu>
						{#each group.items as item (item.href)}
							{@const Icon = item.icon}
							<Sidebar.MenuItem>
								<Sidebar.MenuButton isActive={isActive(item.href)} tooltipContent={item.label}>
									{#snippet child({ props })}
										<a href={item.href} {...props}>
											<Icon />
											<span>{item.label}</span>
										</a>
									{/snippet}
								</Sidebar.MenuButton>
							</Sidebar.MenuItem>
						{/each}
					</Sidebar.Menu>
				</Sidebar.GroupContent>
			</Sidebar.Group>
		{/each}
	</Sidebar.Content>

	<Sidebar.Footer>
		<Sidebar.Menu>
			<Sidebar.MenuItem>
				<Sidebar.MenuButton size="lg">
					<Avatar.Root class="size-8 rounded-lg">
						<Avatar.Fallback class="rounded-lg">
							{store.state.currentUser.avatarInitials}
						</Avatar.Fallback>
					</Avatar.Root>
					<div class="grid flex-1 text-left text-sm leading-tight">
						<span class="truncate font-medium">{store.state.currentUser.name}</span>
						<span class="text-muted-foreground truncate text-xs">
							{ROLE_LABELS[store.state.currentUser.role]}
						</span>
					</div>
				</Sidebar.MenuButton>
			</Sidebar.MenuItem>
		</Sidebar.Menu>
	</Sidebar.Footer>
	<Sidebar.Rail />
</Sidebar.Root>
