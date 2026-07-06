<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import X from '@lucide/svelte/icons/x';
	import MessageSquare from '@lucide/svelte/icons/message-square';
	import { appState } from '../state.svelte.js';
</script>

<div class="flex h-full flex-col bg-background">
	<!-- Header -->
	<div class="flex h-9 shrink-0 items-center justify-between px-3">
		<div class="flex items-center gap-2">
			<MessageSquare class="size-3.5 text-muted-foreground" />
			<span class="text-xs font-medium">Chat IA</span>
		</div>
		<Button
			variant="ghost"
			size="icon"
			class="size-6"
			aria-label="Cerrar panel"
			onclick={() => (appState.aiChatOpen = false)}
		>
			<X class="size-3.5" />
		</Button>
	</div>
	<Separator />

	<!-- Empty body -->
	<div class="flex flex-1 items-center justify-center">
		<div class="text-center text-muted-foreground">
			<MessageSquare class="mx-auto mb-2 size-8 opacity-20" />
			<p class="text-xs">Panel de chat IA</p>
		</div>
	</div>
</div>
