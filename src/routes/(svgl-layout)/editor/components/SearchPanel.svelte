<script lang="ts">
	import { Input } from '$lib/components/ui/input/index.js';
	import { ScrollArea } from '$lib/components/ui/scroll-area/index.js';
	import X from '@lucide/svelte/icons/x';
	import Search from '@lucide/svelte/icons/search';
	import { appState } from '../state.svelte.js';
	import { getFileIcon } from '../file-icons.js';

	let inputRef = $state<HTMLInputElement | null>(null);

	export function focusInput() {
		inputRef?.focus();
	}
</script>

<div class="flex h-full flex-col">
	<div class="border-b p-2">
		<div class="relative flex items-center">
			<Search class="absolute left-2 size-3.5 text-muted-foreground" />
			<Input
				bind:ref={inputRef}
				bind:value={appState.searchQuery}
				placeholder="Buscar en archivos..."
				class="h-7 pl-7 pr-7 text-xs"
			/>
			{#if appState.searchQuery}
				<button
					class="absolute right-2 text-muted-foreground hover:text-foreground"
					onclick={() => (appState.searchQuery = '')}
					type="button"
					aria-label="Limpiar búsqueda"
				>
					<X class="size-3.5" />
				</button>
			{/if}
		</div>
	</div>

	<ScrollArea class="flex-1">
		<div class="p-2">
			{#if appState.searchQuery.trim().length < 2}
				<p class="px-2 py-4 text-center text-xs text-muted-foreground">
					Escribe al menos 2 caracteres para buscar
				</p>
			{:else if appState.searchResults.length === 0}
				<p class="px-2 py-4 text-center text-xs text-muted-foreground">
					Sin resultados para "{appState.searchQuery}"
				</p>
			{:else}
				<p class="mb-2 px-2 text-xs text-muted-foreground">
					{appState.searchResults.length} resultado{appState.searchResults.length !== 1
						? 's'
						: ''}
				</p>
				{#each appState.searchResults as file (file.id)}
					{@const Icon = getFileIcon(file.name)}
					<button
						class="flex w-full cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm hover:bg-accent"
						onclick={() => {
							appState.selectFile(file.id);
							appState.showSearch = false;
							appState.searchQuery = '';
						}}
						type="button"
					>
						<Icon class="size-3.5 shrink-0 text-muted-foreground" />
						<div class="min-w-0 flex-1">
							<p class="truncate text-xs font-medium">{file.name}</p>
							<p class="truncate text-xs text-muted-foreground">
								{appState.computePath(file.id)}
							</p>
						</div>
					</button>
				{/each}
			{/if}
		</div>
	</ScrollArea>
</div>
