<script lang="ts">
	import DataTable from "./components/data-table.svelte";
	import type { Vehiculo } from "./data/schemas.js";

	let { data } = $props();

	// Los datos vienen de la API en +page.ts
	const vehiculos: Vehiculo[] = data.vehiculos ?? [];
</script>

<div class="flex h-full flex-1 flex-col gap-4">
	<div class="flex items-center justify-between gap-2 px-4 pt-4">
		<div class="flex flex-col gap-1">
			<h2 class="text-2xl font-semibold tracking-tight">Catálogo de Vehículos</h2>
			<p class="text-muted-foreground">Gestión del catálogo de vehículos para blindaje</p>
		</div>
	</div>
	<DataTable data={vehiculos} />
</div>
