<script lang="ts">
	import { appState } from '../state.svelte.js';
	import ContentEditor from './ContentEditor.svelte';
	import PathBreadcrumb from './PathBreadcrumb.svelte';
	import TabBar from './TabBar.svelte';
</script>

<div class="flex h-full flex-col">
	<TabBar />

	{#if appState.activeFileId && appState.activeFile}
		<PathBreadcrumb />

		{#if appState.activeFile.type === 'folder'}
			<div class="flex flex-1 items-center justify-center">
				<div class="text-center">
					<p class="text-sm font-medium">Carpeta seleccionada</p>
					<p class="mt-1 text-xs text-muted-foreground">
						Selecciona un archivo para ver su contenido
					</p>
				</div>
			</div>
		{:else}
			<div class="min-h-0 flex-1 overflow-hidden">
				{#key appState.activeFileId}
					<ContentEditor fileId={appState.activeFileId} />
				{/key}
			</div>
		{/if}
	{:else}
		<div class="flex flex-1 flex-col items-center justify-center gap-3">
			<div class="text-center">
				<p class="text-sm font-medium">Ningún archivo seleccionado</p>
				<p class="mt-1 text-xs text-muted-foreground">
					Elige un archivo del árbol o usa el terminal
				</p>
			</div>
		</div>
	{/if}
</div>
