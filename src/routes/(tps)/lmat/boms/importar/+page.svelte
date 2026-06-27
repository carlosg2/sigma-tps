<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Alert from '$lib/components/ui/alert/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import ArrowLeft from '@lucide/svelte/icons/arrow-left';
	import FileSpreadsheet from '@lucide/svelte/icons/file-spreadsheet';
	import Download from '@lucide/svelte/icons/download';
	import Info from '@lucide/svelte/icons/info';

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

<div class="mx-auto flex w-full max-w-5xl flex-col gap-6">
	<div class="flex items-center gap-3">
		<Button href="/lmat/boms" variant="outline" size="icon">
			<ArrowLeft />
		</Button>
		<p class="text-muted-foreground text-sm">Importacion masiva de listas de materiales desde CSV</p>
	</div>

	<Card.Root>
		<Card.Header>
			<div class="flex items-center gap-4">
				<div class="bg-primary/10 text-primary flex size-12 items-center justify-center rounded-lg">
					<FileSpreadsheet class="size-6" />
				</div>
				<div class="grid gap-0.5">
					<Card.Title>Importacion desde CSV</Card.Title>
					<Card.Description>
						La importacion de BOMs desde formato Excel sera habilitada cuando subas un ejemplo del formato real de tus plantas.
					</Card.Description>
				</div>
			</div>
		</Card.Header>
		<Card.Content class="flex flex-col gap-4">
			<p class="text-muted-foreground text-sm">
				Mientras tanto, puedes descargar la plantilla CSV base y usarla como punto de partida.
				Cada fila representa un componente del BOM. Los componentes con el mismo codigo de especificacion se agruparan automaticamente.
			</p>
			<div>
				<Button variant="outline" size="sm" onclick={downloadTemplate}>
					<Download data-icon="inline-start" /> Descargar Plantilla CSV
				</Button>
			</div>
		</Card.Content>
	</Card.Root>

	<Alert.Root>
		<Info />
		<Alert.Title>Formato pendiente de definir</Alert.Title>
		<Alert.Description>
			Cuando subas un ejemplo real del formato Excel de Planta 1 (SolidWorks) o Planta 2 (AutoCAD 2D), ajustaremos este importador para leer directamente ese formato.
		</Alert.Description>
	</Alert.Root>
</div>
