<script lang="ts">
	import GroupingUndoDemo from './_grouping-undo-demo.svelte';
</script>

<div class="mx-auto flex w-full max-w-350 flex-col gap-4 px-6 py-6">
	<div class="flex items-center justify-between gap-2">
		<div>
			<h1 class="text-2xl font-bold tracking-tight">Tabla de datos · Grouping + Undo/Redo Nativo</h1>
			<p class="text-sm text-muted-foreground">
				Demo que combina <strong>agrupación de filas</strong> con <strong>historial de cambios nativo</strong> (Ctrl+Z / Ctrl+Y). Las filas se reorganizan automáticamente en nuevos grupos cuando editas valores de agrupación, y puedes deshacer/rehacer cualquier cambio.
			</p>
		</div>
	</div>

	<div class="rounded-lg border bg-muted/30 p-4 text-sm">
		<p class="mb-2 font-medium">Pruebas sugeridas:</p>
		<ul class="ml-4 list-disc space-y-1 text-muted-foreground">
			<li>
				<strong>Edita un Departamento</strong> de una fila (ej. cambiar "Ingeniería" a "Ventas") → la fila se reorganiza automáticamente al nuevo grupo.
			</li>
			<li>
				<strong>Usa Deshacer (Ctrl+Z)</strong> para revertir el cambio → la fila vuelve al grupo original.
			</li>
			<li>
				Agrega <strong>múltiples niveles de agrupación</strong> usando el menú "Agrupar por".
			</li>
			<li>
				Intenta <strong>filtrar y ordenar</strong> mientras editaseliberty todos los cambios se deshacen/rehacen correctamente.
			</li>
			<li>
				Los botones de Deshacer/Rehacer se desactivan automáticamente cuando no hay historial disponible.
			</li>
			<li>
				Las celdas agregadas (sumas y promedios) se recalculan automáticamente al reorganizar grupos.
			</li>
		</ul>
	</div>

	<GroupingUndoDemo />
</div>
