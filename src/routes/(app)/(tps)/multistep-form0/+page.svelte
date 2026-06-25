<script lang="ts">
	import type { PageData } from "./$types.js";
	import VehicleReceptionForm from "./multistep-form.svelte";
	import { Separator } from "$lib/components/ui/separator/index.js";
	
	let { data }: { data: PageData } = $props();
</script>

<div class="container mx-auto py-4">
	<!-- <div class="mb-8">
		<h1 class="text-3xl font-bold text-foreground">Recepción de Vehículo</h1>
		<p class="text-muted-foreground mt-2">
			Documenta detalladamente el estado del vehículo
		</p>
	</div>
	<Separator class="mb-8" /> -->
	<VehicleReceptionForm data={data.form} API_CONFIG={data.API_CONFIG} />
</div>
