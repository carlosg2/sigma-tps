<script lang="ts">
	import DataTable from "./components/data-table.svelte";
	import type { NivelBlindaje } from "./data/schemas.js";

	let { data }: { data: { nivelesBlindaje: NivelBlindaje[] } } = $props();
</script>

<div class="flex h-full flex-1 flex-col gap-8">
	<div class="flex items-center justify-between gap-2 px-4 pt-4">
		<div class="flex flex-col gap-1">
			<h2 class="text-2xl font-semibold tracking-tight">Niveles de Blindaje</h2>
			<p class="text-muted-foreground">Catálogo de niveles de protección balística disponibles.</p>
		</div>
	</div>
	<DataTable data={data.nivelesBlindaje} />
</div>
