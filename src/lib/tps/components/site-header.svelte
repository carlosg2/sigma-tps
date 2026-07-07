<script lang="ts">
	import { page } from '$app/state';
	import { useStore } from '$lib/tps/store.svelte.js';
	import { ROLE_LABELS, PLANT_LABELS } from '$lib/tps/constants.js';
	import type { UserRole, Plant } from '$lib/tps/types.js';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import Factory from '@lucide/svelte/icons/factory';
	import UserIcon from '@lucide/svelte/icons/user';
	import RotateCcw from '@lucide/svelte/icons/rotate-ccw';

	const store = useStore();

	const titles: Record<string, string> = {
		'/': 'Dashboard General',
		'/implementacion': 'Dashboard General',
		'/articulos': 'Catalogo de Articulos',
		'/lmat': 'LMAT',
		'/especificaciones-v2': 'Especificaciones v2',
		'/proyectos': 'Proyectos',
		'/compras': 'Compras',
		'/compras/bandeja': 'Bandeja de Autorización',
		'/compras/bitacora': 'Bitácora de Autorizaciones',
		'/compras/configuracion': 'Configuración de Niveles',
		'/compras/requisiciones': 'Requisiciones',
		'/compras/alertas': 'Alertas y Notificaciones',
		'/inventarios': 'Inventarios · Kitting por Folio',
		'/inventarios/surtido': 'Surtido de Materiales',
		'/inventarios/picking': 'Lista de Picking por Folio / VIN',
		'/inventarios/carritos': 'Gestión de Carritos por Folio',
		'/inventarios/confirmacion': 'Confirmación Electrónica de Kits',
		'/inventarios/linekeeper': 'Linekeeper Digital',
		'/inventarios/trazabilidad': 'Registro y Trazabilidad',
		'/finanzas': 'Avisos de Pago Automáticos',
		'/finanzas/proveedores': 'Proveedores',
		'/finanzas/egresos': 'Egresos del ERP',
		'/finanzas/historial': 'Historial de Avisos',
		'/finanzas/configuracion': 'Configuración de Finanzas',
		'/rentas': 'Rentas · Executive Pulse',
		'/rentas/cotizador': 'Cotizador de Rentas',
		'/rentas/cotizaciones': 'Cotizaciones Guardadas',
		'/rentas/compliance': 'Cumplimiento y Stop-Gate'
	};

	const pageTitle = $derived.by(() => {
		const path = page.url.pathname;
		if (titles[path]) return titles[path];
		if (path.startsWith('/articulos')) return 'Articulos';
		if (path.startsWith('/especificaciones-v2')) return 'Especificaciones v2';
		if (path.startsWith('/compras')) return 'Compras';
		if (path.startsWith('/inventarios')) return 'Inventarios';
		if (path.startsWith('/lmat')) return 'LMAT';
		if (path.startsWith('/proyectos')) return 'Proyectos';
		if (path.startsWith('/finanzas')) return 'Finanzas';
		if (path.startsWith('/rentas')) return 'Rentas';
		return 'TPS ERP';
	});

	const plantValue = $derived(store.state.currentPlant);
	const roleValue = $derived(store.state.currentUser.role);

	function handlePlantChange(value: string) {
		store.dispatch({ type: 'SET_CURRENT_PLANT', payload: value as Plant | 'todas' });
	}

	function handleRoleChange(value: string) {
		const user = store.state.users.find((u) => u.role === (value as UserRole)) ?? store.state.users[0];
		store.dispatch({ type: 'SET_CURRENT_USER', payload: user });
	}

	const roleEntries = Object.entries(ROLE_LABELS) as [UserRole, string][];
</script>

<header
	class="bg-background sticky top-0 z-10 flex h-(--header-height) shrink-0 items-center gap-2 border-b rounded-t-2xl transition-[width,height] ease-linear"
>
	<div class="flex w-full items-center gap-2 px-4 lg:gap-2 lg:px-6">
		<Sidebar.Trigger class="-ms-1" />
		<Separator orientation="vertical" class="mx-1 data-[orientation=vertical]:h-4" />
		<h1 class="text-base font-medium">{pageTitle}</h1>

		<div class="ms-auto flex items-center gap-2">
			<Select.Root type="single" value={plantValue} onValueChange={handlePlantChange}>
				<Select.Trigger size="sm" class="w-40">
					<Factory class="text-muted-foreground size-3.5" />
					{PLANT_LABELS[plantValue]}
				</Select.Trigger>
				<Select.Content>
					<Select.Item value="todas">Todas las Plantas</Select.Item>
					<Select.Item value="planta_1">Planta 1</Select.Item>
					<Select.Item value="planta_2">Planta 2</Select.Item>
					<Select.Item value="almacen_servicios">Almacen Servicios</Select.Item>
				</Select.Content>
			</Select.Root>

			<Select.Root type="single" value={roleValue} onValueChange={handleRoleChange}>
				<Select.Trigger size="sm" class="hidden w-40 sm:flex">
					<UserIcon class="text-muted-foreground size-3.5" />
					{ROLE_LABELS[roleValue]}
				</Select.Trigger>
				<Select.Content>
					{#each roleEntries as [role, label] (role)}
						<Select.Item value={role}>{label}</Select.Item>
					{/each}
				</Select.Content>
			</Select.Root>

			<Button variant="outline" size="sm" onclick={() => store.resetData()} title="Restaurar datos de ejemplo">
				<RotateCcw data-icon="inline-start" />
				Reset
			</Button>
		</div>
	</div>
</header>
