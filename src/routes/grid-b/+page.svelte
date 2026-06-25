<script lang="ts">
	import GridDemo from './_grid-demo.svelte';
	import { Toaster } from '$lib/components/ui/sonner/index.js';
</script>

<div class="mx-auto flex w-full max-w-350 flex-col gap-4 px-6 py-6">
	<div class="flex items-center justify-between gap-2">
		<div>
			<h1 class="text-2xl font-bold tracking-tight">Tabla de datos · Undo nativo (Opción B)</h1>
			<p class="text-sm text-muted-foreground">
				El undo/redo del grid está enganchado al stack nativo del navegador mediante un elemento
				<code>contentEditable</code> oculto (técnica "undoer").
			</p>
		</div>
	</div>

	<div class="rounded-lg border bg-muted/30 p-4 text-sm">
		<p class="mb-2 font-medium">Cómo probar la integración nativa</p>
		<ul class="ml-4 list-disc space-y-1 text-muted-foreground">
			<li>Edita una celda, agrega o borra filas para generar acciones.</li>
			<li>
				<strong>Teclado:</strong> <kbd>Cmd/Ctrl+Z</kbd> deshace, <kbd>Cmd/Ctrl+Shift+Z</kbd> o
				<kbd>Ctrl+Y</kbd> rehace — reenviados al stack nativo.
			</li>
			<li>
				<strong>Menú del navegador:</strong> "Editar → Deshacer" ahora opera sobre el grid.
			</li>
			<li>
				<strong>Gestos del SO:</strong> en macOS prueba el deslizamiento con tres dedos; en iOS, el
				gesto de sacudir o el de tres dedos.
			</li>
			<li>
				Mientras editas el texto <em>dentro</em> de una celda, <kbd>Cmd/Ctrl+Z</kbd> deshace
				caracteres (undo nativo por-campo); al confirmar, el siguiente undo opera a nivel de celda.
			</li>
		</ul>
	</div>

	<GridDemo height={520} />
</div>

<Toaster />
