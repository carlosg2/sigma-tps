<script lang="ts">
	import { differenceInDays } from "date-fns/differenceInDays";
	import { format } from "date-fns/format";
	import { formatDistanceToNow } from "date-fns/formatDistanceToNow";

	import * as Avatar from "$lib/components/ui/avatar/index.js";
	import * as ScrollArea from "$lib/components/ui/scroll-area/index.js";
	import { cn } from "$lib/utils.js";

	import { type Mail } from "./data.js";
	import { mailStore } from "./mail-store.svelte.js";

	type MailGroup = {
		id: string;
		title: string;
		items: Mail[];
	};

	interface Props {
		groups: MailGroup[];
		onSelectMail?: (mail: Mail) => void;
	}

	let { groups, onSelectMail }: Props = $props();

	function formatMailDate(date: string) {
		const mailDate = new Date(date);
		if (differenceInDays(new Date(), mailDate) <= 3) {
			return formatDistanceToNow(mailDate, { addSuffix: true });
		}
		return format(mailDate, "d MMM yyyy");
	}
</script>

<ScrollArea.Root class="min-h-0 flex-1">
	<div class="flex flex-col gap-1.5 pt-0">
		{#each groups as group}
			<section class="flex flex-col gap-1.5">
				<div class="mx-3 text-muted-foreground text-xs">
					{group.title} ({group.items.length})
				</div>

				<div class="flex flex-col">
					{#each group.items as item}
						<button
							type="button"
							class={cn(
								"group relative w-full border-transparent border-y p-3 text-left transition-colors",
								"hover:bg-muted/60",
								mailStore.selected === item.id &&
									"border-border bg-muted/70 before:absolute before:-inset-y-px before:left-0 before:w-0.5 before:bg-primary",
							)}
							onclick={() => {
								mailStore.selected = item.id;
								onSelectMail?.(item);
							}}
						>
							<div class="flex items-start gap-3">
								<Avatar.Root class="size-9 after:rounded-sm">
									<Avatar.Fallback class="rounded-sm bg-background">{item.from.name[0]}</Avatar.Fallback>
								</Avatar.Root>

								<div class="space-y-2 min-w-0 flex-1">
									<div class="flex items-start justify-between gap-3">
										<div class="min-w-0">
											<div
												class={cn(
													"flex items-center gap-2 truncate font-normal text-sm",
													!item.isRead && "font-medium",
												)}
											>
												{item.from.name}
												{#if !item.isRead}
													<span class="size-2 shrink-0 rounded-full bg-blue-600"></span>
												{/if}
											</div>
											<div
												class={cn(
													"truncate font-medium text-foreground text-xs",
													item.isRead && "font-normal text-muted-foreground",
												)}
											>
												{item.subject}
											</div>
										</div>

										<div
											class={cn(
												"shrink-0 text-muted-foreground text-xs",
												mailStore.selected === item.id && "text-foreground",
											)}
										>
											{formatMailDate(item.receivedAt)}
										</div>
									</div>

									<p class="line-clamp-2 text-muted-foreground text-xs leading-5">{item.body}</p>
								</div>
							</div>
						</button>
					{/each}
				</div>
			</section>
		{/each}
	</div>
</ScrollArea.Root>
