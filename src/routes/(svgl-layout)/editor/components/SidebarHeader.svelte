<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Tooltip from '$lib/components/ui/tooltip/index.js';
	import FilePlus from '@lucide/svelte/icons/file-plus';
	import FolderPlus from '@lucide/svelte/icons/folder-plus';
	import Search from '@lucide/svelte/icons/search';
	import { appState } from '../state.svelte.js';
</script>

<div class="flex h-9.25 shrink-0 items-center justify-between border-b px-4">
	<div class="flex items-center gap-1.5">
		<div
			class="flex size-4 items-center justify-center rounded bg-foreground text-background"
		>
			<span class="text-[8px] font-bold">OS</span>
		</div>
		<span class="text-xs font-semibold tracking-tight">Sigma</span>
	</div>

	<div class="flex items-center gap-0.5">
		<Tooltip.Root>
			<Tooltip.Trigger>
				{#snippet child({ props })}
					<Button
						{...props}
						variant={appState.showSearch ? 'secondary' : 'ghost'}
						size="icon"
						class="size-6"
						onclick={() => {
							appState.showSearch = !appState.showSearch;
							if (!appState.showSearch) appState.searchQuery = '';
						}}
					>
						<Search class="size-3.5" />
					</Button>
				{/snippet}
			</Tooltip.Trigger>
			<Tooltip.Content>Buscar archivos (⌘⇧F)</Tooltip.Content>
		</Tooltip.Root>

		<Tooltip.Root>
			<Tooltip.Trigger>
				{#snippet child({ props })}
					<Button {...props} variant="ghost" size="icon" class="size-6" disabled>
						<FolderPlus class="size-3.5" />
					</Button>
				{/snippet}
			</Tooltip.Trigger>
			<Tooltip.Content>Nueva carpeta</Tooltip.Content>
		</Tooltip.Root>

		<Tooltip.Root>
			<Tooltip.Trigger>
				{#snippet child({ props })}
					<Button {...props} variant="ghost" size="icon" class="size-6" disabled>
						<FilePlus class="size-3.5" />
					</Button>
				{/snippet}
			</Tooltip.Trigger>
			<Tooltip.Content>Nuevo archivo</Tooltip.Content>
		</Tooltip.Root>
	</div>
</div>
