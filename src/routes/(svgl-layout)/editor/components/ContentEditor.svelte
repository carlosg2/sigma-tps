<script lang="ts">
	import { appState, type FileId } from '../state.svelte.js';

	let { fileId }: { fileId: FileId } = $props();

	const content = $derived(appState.fileContents[fileId] ?? '');
	const file = $derived(appState.getFile(fileId));

	let textareaRef = $state<HTMLTextAreaElement | null>(null);

	function handleInput(e: Event) {
		const ta = e.target as HTMLTextAreaElement;
		appState.updateContent(fileId, ta.value);
	}

	function handleSelectionChange() {
		if (textareaRef && fileId === appState.activeFileId) {
			appState.updateCursor(textareaRef.selectionStart, textareaRef.value);
		}
	}

	const isMonospace = $derived(
		['sh', 'ts', 'js', 'json', 'tsx', 'jsx'].includes(
			(file?.name ?? '').split('.').pop()?.toLowerCase() ?? ''
		)
	);
</script>

<textarea
	bind:this={textareaRef}
	value={content}
	oninput={handleInput}
	onkeyup={handleSelectionChange}
	onclick={handleSelectionChange}
	onfocus={handleSelectionChange}
	spellcheck={false}
	class="h-full w-full resize-none border-0 bg-background p-4 text-sm text-foreground outline-none focus:border-0 focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 {isMonospace
		? 'font-mono'
		: 'leading-relaxed'}"
	aria-label="Editor de contenido"
></textarea>
