<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Tabs from '$lib/components/ui/tabs/index.js';
	import X from '@lucide/svelte/icons/x';
	import { appState, type FileId } from '../state.svelte.js';
</script>

<div class="flex items-center border-b">
	{#if appState.hasOpenFiles}
		<Tabs.Root
			value={appState.activeFileId ?? ''}
			onValueChange={(value) => appState.selectFile(value as FileId)}
			class="min-w-0 flex-1"
		>
			<Tabs.List
				class="h-9 w-full justify-start overflow-x-auto rounded-none border-0 bg-transparent p-0"
			>
				{#each appState.openFileIdsArray as fileId (fileId)}
					{@const row = appState.getFile(fileId)}
					{#if row}
						<Tabs.Trigger
							value={fileId}
							class="relative h-full flex-none rounded-none border-0 px-3 text-xs text-muted-foreground data-[state=active]:bg-muted data-[state=active]:text-foreground data-[state=active]:shadow-none"
						>
							<span class="mr-2">{row.name}</span>
							<Button
								variant="ghost"
								size="icon"
								class="absolute right-0.5 top-1/2 size-4 -translate-y-1/2 opacity-50 hover:opacity-100"
								onclick={(e: MouseEvent) => {
									e.stopPropagation();
									e.preventDefault();
									appState.closeFile(fileId);
								}}
								aria-label="Cerrar {row.name}"
							>
								<X class="size-2.5" />
							</Button>
						</Tabs.Trigger>
					{/if}
				{/each}
			</Tabs.List>
		</Tabs.Root>
	{:else}
		<div class="flex h-9 flex-1 items-center px-3">
			<span class="text-xs text-muted-foreground">Sin archivos abiertos</span>
		</div>
	{/if}
</div>
