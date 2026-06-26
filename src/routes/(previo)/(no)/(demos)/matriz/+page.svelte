<script lang="ts">
	import DataTable from "./components/data-table.svelte";
	import * as Card from "$lib/components/ui/card/index.js";
	import { Badge } from "$lib/components/ui/badge/index.js";
	import CarIcon from "@lucide/svelte/icons/car";
	import ShieldIcon from "@lucide/svelte/icons/shield";
	import LayersIcon from "@lucide/svelte/icons/layers";
	import PackageIcon from "@lucide/svelte/icons/package";
	import type { MatrizMaterial } from "./data/schemas.js";

	let { data } = $props();
	
	// Datos de la matriz de materiales (iniciales)
	const materialesIniciales: MatrizMaterial[] = data.MatrizMaterialesPorVehiculo ?? [];
	
	// Datos actuales sincronizados con la tabla
	let materiales = $state<MatrizMaterial[]>(materialesIniciales);
	
	// Información del vehículo (tomada del primer elemento de los datos iniciales)
	const vehiculoInfo = $derived(materialesIniciales[0] ?? null);
	
	// Estadísticas (ahora reactivas a cambios en materiales)
	const totalMateriales = $derived(materiales.length);
	const categoriasUnicas = $derived(new Set(materiales.map(m => m.categoria)).size);
	const materialesUnicos = $derived(new Set(materiales.map(m => m.codigo_material)).size);
</script>

<div class="flex h-full flex-1 flex-col gap-6">
	<!-- Header con información del vehículo -->
	{#if vehiculoInfo}
		<div class="px-4 pt-4">
			<div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
				<div class="flex flex-col gap-1">
					<div class="flex items-center gap-2">
						<CarIcon class="size-6 text-primary" />
						<h1 class="text-2xl font-bold tracking-tight">
							{vehiculoInfo.nombre_vehiculo}
						</h1>
					</div>
					<div class="flex flex-wrap items-center gap-2 text-muted-foreground">
						<Badge variant="outline">{vehiculoInfo.clave_vehiculo}</Badge>
						<Badge variant="secondary">{vehiculoInfo.nivel_nombre}</Badge>
						<Badge>{vehiculoInfo.diseno_nombre}</Badge>
					</div>
					<p class="text-sm text-muted-foreground mt-1">
						Norma: {vehiculoInfo.norma}
					</p>
				</div>
				
				<!-- Stats Cards -->
				<div class="flex gap-4">
					<Card.Root class="w-[140px]">
						<Card.Content class="pt-4">
							<div class="flex items-center gap-2">
								<PackageIcon class="size-4 text-muted-foreground" />
								<span class="text-2xl font-bold">{totalMateriales}</span>
							</div>
							<p class="text-xs text-muted-foreground">Especificaciones</p>
						</Card.Content>
					</Card.Root>
					
					<Card.Root class="w-[140px]">
						<Card.Content class="pt-4">
							<div class="flex items-center gap-2">
								<LayersIcon class="size-4 text-muted-foreground" />
								<span class="text-2xl font-bold">{categoriasUnicas}</span>
							</div>
							<p class="text-xs text-muted-foreground">Categorías</p>
						</Card.Content>
					</Card.Root>
					
					<Card.Root class="w-[140px]">
						<Card.Content class="pt-4">
							<div class="flex items-center gap-2">
								<ShieldIcon class="size-4 text-muted-foreground" />
								<span class="text-2xl font-bold">{materialesUnicos}</span>
							</div>
							<p class="text-xs text-muted-foreground">Materiales</p>
						</Card.Content>
					</Card.Root>
				</div>
			</div>
		</div>
	{/if}
	
	<!-- Tabla de datos -->
	<DataTable data={materialesIniciales} bind:currentData={materiales} />
</div>
