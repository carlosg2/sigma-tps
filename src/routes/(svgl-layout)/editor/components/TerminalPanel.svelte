<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import { ScrollArea } from '$lib/components/ui/scroll-area/index.js';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import X from '@lucide/svelte/icons/x';
	import { appState } from '../state.svelte.js';

	let inputValue = $state('');
	let inputRef = $state<HTMLInputElement | null>(null);
	let viewportRef = $state<HTMLElement | null>(null);

	export function focus() {
		inputRef?.focus();
	}

	$effect(() => {
		// Auto-scroll al último mensaje
		void appState.terminalHistory.length;
		if (viewportRef) {
			requestAnimationFrame(() => {
				if (viewportRef) viewportRef.scrollTop = viewportRef.scrollHeight;
			});
		}
	});

	function handleSubmit(e: SubmitEvent) {
		e.preventDefault();
		const cmd = inputValue.trim();
		inputValue = '';
		if (cmd) appState.execCommand(cmd);
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			appState.terminalOpen = false;
		}
	}
</script>

<div class="flex h-full flex-col bg-background font-mono text-sm">
	<div class="flex items-center justify-between px-3 py-1">
		<span class="text-xs font-medium text-muted-foreground">Terminal</span>
		<Button
			variant="ghost"
			size="icon"
			class="size-5"
			aria-label="Cerrar terminal"
			onclick={() => (appState.terminalOpen = false)}
		>
			<X class="size-3" />
		</Button>
	</div>
	<Separator />

	<ScrollArea class="min-h-0 flex-1" bind:viewportRef>
		<div class="space-y-0.5 p-3">
			{#each appState.terminalHistory as entry, i (i)}
				{#if entry.type === 'input'}
					<p class="text-green-500 dark:text-green-400">
						<span class="select-none text-muted-foreground">$ </span>{entry.command}
					</p>
				{:else}
					{#if entry.stdout}
						<pre class="whitespace-pre-wrap text-xs {entry.exitCode === 0
								? 'text-foreground'
								: ''}">{entry.stdout}</pre>
					{/if}
					{#if entry.stderr}
						<pre class="whitespace-pre-wrap text-xs text-red-500 dark:text-red-400">{entry.stderr}</pre>
					{/if}
				{/if}
			{/each}
		</div>
	</ScrollArea>

	<Separator />
	<form onsubmit={handleSubmit} class="flex items-center gap-2 px-3 py-2">
		<span class="select-none text-green-500">$</span>
		<input
			bind:this={inputRef}
			bind:value={inputValue}
			type="text"
			class="min-w-0 flex-1 border-0 bg-transparent text-foreground outline-none focus:border-0 focus:outline-none focus:ring-0 placeholder:text-muted-foreground"
			placeholder="escribe un comando..."
			autocomplete="off"
			autocorrect="off"
			autocapitalize="off"
			spellcheck={false}
			onkeydown={handleKeydown}
		/>
	</form>
</div>
