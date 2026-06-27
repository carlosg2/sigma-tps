<script lang="ts">
	import ArrowLeft from '@lucide/svelte/icons/arrow-left';
	import FileSpreadsheet from '@lucide/svelte/icons/file-spreadsheet';
	import Download from '@lucide/svelte/icons/download';

	function downloadTemplate() {
		const csv = `Codigo Especificacion,Modelo,Nivel Blindaje,Planta,Codigo Articulo,Cantidad,UdM,Celda,Operacion\nESP-EJEMPLO-001,Toyota Land Cruiser 300,NIII,planta_1,ACB-6MM-001,8,placa,Celda 1,Corte y formado`;
		const blob = new Blob([csv], { type: 'text/csv' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = 'plantilla_boms.csv';
		a.click();
		URL.revokeObjectURL(url);
	}
</script>

<div class="flex max-w-3xl flex-col gap-6">
	<div class="flex items-center gap-3">
		<a href="/lmat/boms" class="border-border hover:bg-secondary flex h-8 w-8 items-center justify-center rounded-md border transition-colors">
			<ArrowLeft class="text-foreground h-4 w-4" />
		</a>
		<div>
			<h1 class="text-foreground text-xl font-bold">Importar BOMs</h1>
			<p class="text-muted-foreground text-sm">Importacion masiva de listas de materiales desde CSV</p>
		</div>
	</div>

	<div class="border-border bg-card rounded-lg border p-6">
		<div class="mb-4 flex items-center gap-4">
			<FileSpreadsheet class="text-primary h-10 w-10" />
			<div>
				<h3 class="text-card-foreground text-sm font-semibold">Importacion desde CSV</h3>
				<p class="text-muted-foreground text-xs">La importacion de BOMs desde formato Excel sera habilitada cuando subas un ejemplo del formato real de tus plantas.</p>
			</div>
		</div>
		<p class="text-muted-foreground mb-4 text-sm">
			Mientras tanto, puedes descargar la plantilla CSV base y usarla como punto de partida.
			Cada fila representa un componente del BOM. Los componentes con el mismo codigo de especificacion se agruparan automaticamente.
		</p>
		<button onclick={downloadTemplate} class="border-border text-foreground hover:bg-secondary flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs transition-colors">
			<Download class="h-3.5 w-3.5" /> Descargar Plantilla CSV
		</button>
	</div>

	<div class="border-chart-4/30 bg-chart-4/5 rounded-lg border p-4">
		<p class="text-chart-4 text-sm">
			Nota: Cuando subas un ejemplo real del formato Excel de Planta 1 (SolidWorks) o Planta 2 (AutoCAD 2D), ajustaremos este importador para leer directamente ese formato.
		</p>
	</div>
</div>
