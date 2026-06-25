<script lang="ts">
	import { IsMobile } from "$lib/hooks/is-mobile.svelte.js";
	import * as Drawer from "$lib/components/ui/drawer/index.js";
	import * as Resizable from "$lib/components/ui/resizable/index.js";

	import { type Mail, mails } from "./data.js";
	import { DEFAULT_MAIL_LAYOUT, MAIL_LAYOUT_COOKIE } from "./mail-layout-config.js";
	import { mailStore } from "./mail-store.svelte.js";
	import MailInbox from "./MailInbox.svelte";
	import MailView from "./MailView.svelte";

	interface Props {
		defaultLayout?: number[];
	}

	let { defaultLayout = [...DEFAULT_MAIL_LAYOUT] }: Props = $props();

	const isMobileHook = new IsMobile();
	let isMobile = $derived(isMobileHook.current);

	let isMounted = $state(false);
	let isMailOpen = $state(false);

	$effect(() => {
		isMounted = true;
	});

	const selectedMail = $derived(mails.find((m) => m.id === mailStore.selected) ?? null);

	function handleLayoutChange(sizes: number[]) {
		document.cookie = `${MAIL_LAYOUT_COOKIE}=${JSON.stringify(sizes)}; path=/; max-age=31536000`;
	}

	function handleSelectMail(_mail: Mail) {
		isMailOpen = true;
	}
</script>

{#if !isMounted}
	<div class="flex size-full items-center justify-center text-muted-foreground text-sm">Loading mail...</div>
{:else if isMobile}
	<MailInbox {mails} onSelectMail={handleSelectMail} />

	<Drawer.Root bind:open={isMailOpen}>
		<Drawer.Content>
			<Drawer.Title class="sr-only">Mail message</Drawer.Title>
			<Drawer.Description class="sr-only">Read the selected email message</Drawer.Description>
			<MailView mail={selectedMail} onClose={() => (isMailOpen = false)} />
		</Drawer.Content>
	</Drawer.Root>
{:else}
	<Resizable.PaneGroup
		direction="horizontal"
		onLayoutChange={handleLayoutChange}
		class="h-full"
	>
		<Resizable.Pane defaultSize={defaultLayout[0]} minSize={30} class="min-h-0">
			<MailInbox {mails} />
		</Resizable.Pane>
		<Resizable.Handle withHandle />
		<Resizable.Pane defaultSize={defaultLayout[1]} minSize={30} class="min-h-0">
			<MailView mail={selectedMail} />
		</Resizable.Pane>
	</Resizable.PaneGroup>
{/if}
