<script lang="ts">
	import { Ellipsis, RotateCcw, Search, SlidersHorizontal } from "@lucide/svelte";

	import { Button } from "$lib/components/ui/button/index.js";
	import * as InputGroup from "$lib/components/ui/input-group/index.js";
	import { Separator } from "$lib/components/ui/separator/index.js";
	import * as Sidebar from "$lib/components/ui/sidebar/index.js";

	import { type Mail } from "./data.js";
	import MailList from "./MailList.svelte";

	interface Props {
		mails: Mail[];
		onSelectMail?: (mail: Mail) => void;
	}

	let { mails, onSelectMail }: Props = $props();

	const pinnedMails = $derived(mails.filter((mail) => mail.isPinned));
	const unpinnedMails = $derived(mails.filter((mail) => !mail.isPinned));
</script>

<div class="flex h-full min-h-0 flex-col gap-3 py-3">
	<div class="flex items-center justify-between gap-4 px-2">
		<div class="flex items-center">
			<Sidebar.Trigger />
			<Separator orientation="vertical" class="mr-2 ml-1 h-4 data-vertical:self-center" />
			<h1 class="font-medium text-xl leading-none">Inbox</h1>
		</div>
		<div class="flex items-center gap-2">
			<Button variant="ghost" size="icon-sm">
				<SlidersHorizontal />
			</Button>
			<Button variant="ghost" size="icon-sm">
				<RotateCcw />
			</Button>
			<Button variant="ghost" size="icon-sm">
				<Ellipsis />
			</Button>
		</div>
	</div>

	<div class="px-2">
		<Separator />
	</div>

	<div class="px-2">
		<InputGroup.Root class="h-7 w-full rounded-md">
			<InputGroup.Input class="h-7" placeholder="Search..." />
			<InputGroup.Addon>
				<Search />
			</InputGroup.Addon>
		</InputGroup.Root>
	</div>

	<div class="flex min-h-0 flex-1 flex-col gap-1.5">
		<MailList
			groups={[
				{ id: "pinned", title: "Pinned", items: pinnedMails },
				{ id: "inbox", title: "Inbox", items: unpinnedMails },
			]}
			{onSelectMail}
		/>
	</div>
</div>
