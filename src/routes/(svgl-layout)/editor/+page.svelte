<script lang="ts">
	import { Pane as PaneForge } from 'paneforge';
	import * as Resizable from '$lib/components/ui/resizable/index.js';
	import { ScrollArea } from '$lib/components/ui/scroll-area/index.js';
	import { appState } from './state.svelte.js';
	import SidebarHeader from './components/SidebarHeader.svelte';
	import FileTree from './components/FileTree.svelte';
	import SearchPanel from './components/SearchPanel.svelte';
	import ContentPanel from './components/ContentPanel.svelte';
	import TerminalPanel from './components/TerminalPanel.svelte';
	import StatusBar from './components/StatusBar.svelte';
	import AIChatPanel from './components/AIChatPanel.svelte';
  import PageCard from "$lib/components/layout/pageCard.svelte";
  import PageHeader from "$lib/components/layout/pageHeader.svelte";
	import FileText from "@lucide/svelte/icons/file-text";
/* 	import { Files } from 'lucide-svelte'; */

	let terminalRef = $state<ReturnType<typeof TerminalPanel> | undefined>();
	let chatPaneRef = $state<ReturnType<typeof PaneForge> | undefined>();

	// Sync aiChatOpen → pane collapse/expand
	$effect(() => {
		if (appState.aiChatOpen) {
			chatPaneRef?.expand();
		} else {
			chatPaneRef?.collapse();
		}
	});

	function handleKeydown(e: KeyboardEvent) {
		// ⌘⇧F — toggle search
		if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'f') {
			e.preventDefault();
			appState.showSearch = !appState.showSearch;
			if (!appState.showSearch) appState.searchQuery = '';
		}
		// ⌘` — toggle terminal
		if ((e.metaKey || e.ctrlKey) && e.key === '`') {
			e.preventDefault();
			appState.terminalOpen = !appState.terminalOpen;
			if (appState.terminalOpen) {
				requestAnimationFrame(() => terminalRef?.focus());
			}
		}
		// ⌘I — toggle AI chat
		if ((e.metaKey || e.ctrlKey) && e.key === 'i') {
			e.preventDefault();
			appState.aiChatOpen = !appState.aiChatOpen;
		}
	}
</script>

<svelte:window onkeydown={handleKeydown} />

<PageCard
  containerClass=""
  contentCardClass="max-h-[calc(100vh-4.6rem)] min-h-[calc(100vh-4.6rem)]"
>

	 <PageHeader>
    <div class="flex items-center space-x-2 font-medium text-neutral-950 dark:text-neutral-50">
      <FileText size={18} strokeWidth={1.5} />
      <p>Editor</p>
    </div>
  </PageHeader>

<!-- 	<PageHeader>
    <div class="flex items-center space-x-2 font-medium text-foreground">
      <FileText size={18} strokeWidth={1.5} />
      <p>Editor</p>
    </div>
  </PageHeader> -->

  <Resizable.PaneGroup direction="horizontal" class="flex-1">
		<!-- Sidebar: order=1 -->
		<Resizable.Pane order={1} defaultSize={22} minSize={14} maxSize={45}>
			<div class="flex h-full flex-col">
				<SidebarHeader />
				{#if appState.showSearch}
					<SearchPanel />
				{:else}
					<ScrollArea class="flex-1">
						<div class="p-1">
							<FileTree />
						</div>
					</ScrollArea>
				{/if}
			</div>
		</Resizable.Pane>

		<Resizable.Handle withHandle />

		<!-- Main content + optional terminal: order=2 -->
		<Resizable.Pane order={2} defaultSize={78}>
			<Resizable.PaneGroup direction="vertical">
				<Resizable.Pane
					defaultSize={appState.terminalOpen ? 60 : 100}
					minSize={30}
				>
					<ContentPanel />
				</Resizable.Pane>

				{#if appState.terminalOpen}
					<Resizable.Handle withHandle />
					<Resizable.Pane defaultSize={40} minSize={15} maxSize={65}>
						<TerminalPanel bind:this={terminalRef} />
					</Resizable.Pane>
				{/if}
			</Resizable.PaneGroup>
		</Resizable.Pane>

		<!-- Handle + AI chat pane: order=3, always in DOM, collapsible to 0 -->
		{#if appState.aiChatOpen}
			<Resizable.Handle withHandle />
		{/if}
		<PaneForge
			bind:this={chatPaneRef}
			order={3}
			collapsible={false}
			collapsedSize={0}
			defaultSize={0}
			minSize={40}
			maxSize={80}
			onCollapse={() => { appState.aiChatOpen = false; }}
			onExpand={() => { appState.aiChatOpen = true; }}
			class="min-w-0"
		>
			{#if appState.aiChatOpen}
				<AIChatPanel />
			{/if}
		</PaneForge>
	</Resizable.PaneGroup>

	<StatusBar />
</PageCard>


