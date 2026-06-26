<script lang="ts">
	import GroupingDemo from './_grouping-demo.svelte';
</script>

<div class="mx-auto flex w-full max-w-350 flex-col gap-4 px-6 py-6">
	<div class="flex items-center justify-between gap-2">
		<div>
			<h1 class="text-2xl font-bold tracking-tight">Tabla de datos · Grouping (TanStack)</h1>
			<p class="text-sm text-muted-foreground">
				Demo de agrupación basada en
				<a
					class="underline underline-offset-2"
					href="https://tanstack.com/table/latest/docs/guide/grouping"
					target="_blank"
					rel="noreferrer">TanStack Table · Grouping Guide</a
				>, usando <code>getGroupedRowModel</code> y <code>getExpandedRowModel</code>.
			</p>
		</div>
	</div>

	<div class="rounded-lg border bg-muted/30 p-4 text-sm">
		<p class="mb-2 font-medium">Cómo probar la agrupación (comportamiento de hoja de cálculo)</p>
		<ul class="ml-4 list-disc space-y-1 text-muted-foreground">
			<li>
				Usa el menú <strong>Agrupar por</strong> de la barra de herramientas para añadir, quitar y
				reordenar columnas de agrupación.
			</li>
			<li>
				O bien, abre el menú de cualquier encabezado de columna y elige
				<strong>Agrupar por esta columna</strong> como acción rápida.
			</li>
			<li>
				Agrupa por varias columnas (p. ej. Departamento y luego Ciudad): el orden define el
				anidamiento de los grupos.
			</li>
			<li>
				<strong>Edita cualquier celda</strong> en una fila de datos (incluyendo columnas de agrupación). Las filas se reorganizan automáticamente al nuevo grupo si cambias un valor de agrupación.
			</li>
			<li>Haz clic en una fila de grupo para expandirla o colapsarla; el badge muestra el conteo de filas.</li>
			<li>
				Las celdas agregadas muestran funciones de agregación: <code>sum</code> para salario y
				<code>mean</code> para edad.
			</li>
		</ul>
	</div>

	<GroupingDemo />
</div>
