<script lang="ts">
	import DataTable from "./components/data-table.svelte";
	import type { Schema } from "./components/schemas.js";

	let { data } = $props();

	// Mapear los datos de la API al formato esperado
	let nivelesBlindaje: Schema[] = $derived(data.nivelesBlindaje ?? []);
</script>

<!-- Page content start-->
<div class="flex flex-1 flex-col">
	<div class="@container/main flex flex-1 flex-col gap-2">
		<div class="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
			<DataTable data={nivelesBlindaje} />
		</div>
	</div>
</div>



