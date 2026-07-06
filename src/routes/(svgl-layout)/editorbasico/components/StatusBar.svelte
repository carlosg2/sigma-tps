<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Tooltip from '$lib/components/ui/tooltip/index.js';
	import Terminal from '@lucide/svelte/icons/terminal';
	import MessageSquare from '@lucide/svelte/icons/message-square';
	import { appState } from '../state.svelte.js';
</script>

<div
	class="flex h-7 shrink-0 items-center gap-3 border-t bg-background px-3 text-xs text-muted-foreground"
>
	<span>Ln {appState.cursorLine}, Col {appState.cursorCol}</span>

	<span>{appState.wordCount} palabras</span>
	<span>{appState.lineCount} líneas</span>

	<div class="ml-auto flex items-center gap-1.5">
		<Tooltip.Root>
			<Tooltip.Trigger>
				{#snippet child({ props })}
					<Button
						{...props}
						variant={appState.terminalOpen ? 'secondary' : 'ghost'}
						size="sm"
						class="h-5 gap-1 px-1.5 text-xs text-muted-foreground"
						onclick={() => (appState.terminalOpen = !appState.terminalOpen)}
					>
						<Terminal class="size-3" />
						Terminal
					</Button>
				{/snippet}
			</Tooltip.Trigger>
			<Tooltip.Content>Alternar terminal (⌘`)</Tooltip.Content>
		</Tooltip.Root>

		<Tooltip.Root>
			<Tooltip.Trigger>
				{#snippet child({ props })}
					<Button
						{...props}
						variant={appState.aiChatOpen ? 'secondary' : 'ghost'}
						size="sm"
						class="h-5 gap-1 px-1.5 text-xs text-muted-foreground"
						onclick={() => (appState.aiChatOpen = !appState.aiChatOpen)}
					>
						<MessageSquare class="size-3" />
						Chat IA
					</Button>
				{/snippet}
			</Tooltip.Trigger>
			<Tooltip.Content>Abrir chat IA (⌘I)</Tooltip.Content>
		</Tooltip.Root>
	</div>
</div>
