<script lang="ts">
	import { format } from "date-fns/format";
	import {
		Archive,
		ChevronDown,
		ChevronLeft,
		ChevronRight,
		EllipsisVertical,
		Forward,
		MailOpen,
		Paperclip,
		Pin,
		Reply,
		ReplyAll,
		Send,
		Smile,
		Tag,
		Trash2,
		X,
	} from "@lucide/svelte";

	import * as Avatar from "$lib/components/ui/avatar/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import * as Collapsible from "$lib/components/ui/collapsible/index.js";
	import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js";
	import * as InputGroup from "$lib/components/ui/input-group/index.js";
	import { Separator } from "$lib/components/ui/separator/index.js";
	import * as Tooltip from "$lib/components/ui/tooltip/index.js";
	import { cn } from "$lib/utils.js";

	import { type Mail } from "./data.js";
	import { mailStore } from "./mail-store.svelte.js";

	interface Props {
		mail: Mail | null;
		onClose?: () => void;
	}

	let { mail, onClose }: Props = $props();

	function handleClose() {
		mailStore.selected = null;
		onClose?.();
	}
</script>

<div class="flex h-full min-h-0 flex-col gap-3 px-2 py-3">
	<div class="flex items-center">
		<div class="flex items-center gap-2">
			<Tooltip.Provider>
				<Tooltip.Root>
					<Tooltip.Trigger>
						{#snippet child({ props })}
							<Button {...props} variant="ghost" size="icon-sm" aria-label="Close message" onclick={handleClose}>
								<X />
							</Button>
						{/snippet}
					</Tooltip.Trigger>
					<Tooltip.Content>Close message</Tooltip.Content>
				</Tooltip.Root>
			</Tooltip.Provider>

			<Separator class="h-4 data-vertical:self-center" orientation="vertical" />

			<div class="flex items-center gap-0">
				<Tooltip.Provider>
					<Tooltip.Root>
						<Tooltip.Trigger>
							{#snippet child({ props })}
								<Button {...props} variant="ghost" size="icon-sm" aria-label="Previous message">
									<ChevronLeft />
								</Button>
							{/snippet}
						</Tooltip.Trigger>
						<Tooltip.Content>Previous message</Tooltip.Content>
					</Tooltip.Root>
				</Tooltip.Provider>
				<Tooltip.Provider>
					<Tooltip.Root>
						<Tooltip.Trigger>
							{#snippet child({ props })}
								<Button {...props} variant="ghost" size="icon-sm" aria-label="Next message">
									<ChevronRight />
								</Button>
							{/snippet}
						</Tooltip.Trigger>
						<Tooltip.Content>Next message</Tooltip.Content>
					</Tooltip.Root>
				</Tooltip.Provider>
			</div>
		</div>

		<div class="ml-auto flex items-center gap-2">
			<Tooltip.Provider>
				<Tooltip.Root>
					<Tooltip.Trigger>
						{#snippet child({ props })}
							<Button {...props} variant="ghost" size="icon-sm" aria-label="Pin thread">
								<Pin />
							</Button>
						{/snippet}
					</Tooltip.Trigger>
					<Tooltip.Content>Pin thread</Tooltip.Content>
				</Tooltip.Root>
			</Tooltip.Provider>

			<Tooltip.Provider>
				<Tooltip.Root>
					<Tooltip.Trigger>
						{#snippet child({ props })}
							<Button {...props} variant="ghost" size="icon-sm" aria-label="Archive">
								<Archive />
							</Button>
						{/snippet}
					</Tooltip.Trigger>
					<Tooltip.Content>Archive</Tooltip.Content>
				</Tooltip.Root>
			</Tooltip.Provider>

			<Tooltip.Provider>
				<Tooltip.Root>
					<Tooltip.Trigger>
						{#snippet child({ props })}
							<Button {...props} variant="ghost" size="icon-sm" aria-label="Reply">
								<Reply />
							</Button>
						{/snippet}
					</Tooltip.Trigger>
					<Tooltip.Content>Reply</Tooltip.Content>
				</Tooltip.Root>
			</Tooltip.Provider>

			<Tooltip.Provider>
				<Tooltip.Root>
					<DropdownMenu.Root>
						<DropdownMenu.Trigger>
							{#snippet child({ props: dmProps })}
								<Tooltip.Trigger>
									{#snippet child({ props: ttProps })}
										<Button
											{...dmProps}
											{...ttProps}
											variant="ghost"
											size="icon-sm"
											aria-label="More actions"
										>
											<EllipsisVertical />
										</Button>
									{/snippet}
								</Tooltip.Trigger>
							{/snippet}
						</DropdownMenu.Trigger>
						<DropdownMenu.Content align="end" class="w-48">
							<DropdownMenu.Group>
								<DropdownMenu.Item><ReplyAll />Reply all</DropdownMenu.Item>
								<DropdownMenu.Item><Forward />Forward</DropdownMenu.Item>
							</DropdownMenu.Group>
							<DropdownMenu.Separator />
							<DropdownMenu.Group>
								<DropdownMenu.Item><MailOpen />Mark as unread</DropdownMenu.Item>
								<DropdownMenu.Item><Tag />Add label</DropdownMenu.Item>
							</DropdownMenu.Group>
						</DropdownMenu.Content>
					</DropdownMenu.Root>
					<Tooltip.Content>More actions</Tooltip.Content>
				</Tooltip.Root>
			</Tooltip.Provider>

			<Separator class="h-4 data-vertical:self-center" orientation="vertical" />

			<Tooltip.Provider>
				<Tooltip.Root>
					<Tooltip.Trigger>
						{#snippet child({ props })}
							<Button {...props} variant="ghost" size="icon-sm" aria-label="Move to trash">
								<Trash2 class="text-destructive" />
							</Button>
						{/snippet}
					</Tooltip.Trigger>
					<Tooltip.Content>Move to trash</Tooltip.Content>
				</Tooltip.Root>
			</Tooltip.Provider>
		</div>
	</div>

	<Separator />

	<div class="flex min-h-0 flex-1 flex-col">
		{#if mail}
			<div class="flex min-h-0 flex-1 flex-col gap-3">
				<div class="space-y-1.5">
					<div class="font-medium leading-none">{mail.subject}</div>
					<div class="text-muted-foreground text-xs leading-none">
						{format(new Date(mail.receivedAt), "EEE, d MMM yyyy, h:mm a")}
					</div>
				</div>

				<Separator />

				<div class="flex gap-2">
					<Avatar.Root class="size-9 after:rounded-sm">
						<Avatar.Fallback class="rounded-sm bg-background">{mail.from.name[0]}</Avatar.Fallback>
					</Avatar.Root>

					<div class="flex h-full flex-col gap-1">
						<div class="flex items-center gap-2">
							<div class="text-xs">{mail.from.name}</div>
							<Separator class="h-3 data-vertical:self-center" orientation="vertical" />
							<div class="text-muted-foreground text-xs">{mail.from.email}</div>
						</div>
						<div class="flex items-center gap-2">
							<div class="text-muted-foreground text-xs">
								To: <span class="text-foreground">{mail.to.map((r) => r.name).join(", ")}</span>
							</div>
							{#if mail.cc?.length}
								<div class="text-muted-foreground text-xs">
									Cc: <span class="text-foreground">{mail.cc.map((r) => r.name).join(", ")}</span>
								</div>
							{/if}
						</div>
					</div>
				</div>

				<Separator />

				{#if mail.attachments?.length}
					<Collapsible.Root open>
						<Collapsible.Trigger>
							{#snippet child({ props })}
								<Button
									{...props}
									variant="ghost"
									size="sm"
									class={cn(
										"group p-0 font-normal text-muted-foreground",
										"hover:bg-transparent hover:text-muted-foreground dark:hover:bg-transparent",
										"data-[state=open]:bg-transparent data-[state=open]:text-muted-foreground",
									)}
								>
									Attachments ({mail.attachments!.length})
									<ChevronDown class="transition-transform group-data-[state=open]:rotate-180" />
								</Button>
							{/snippet}
						</Collapsible.Trigger>
						<Collapsible.Content>
							<div class="flex flex-wrap gap-2 pt-1">
							{#each mail.attachments as attachment (attachment.id)}
								<Button size="xs" variant="secondary">
										<Paperclip class="size-3" />
										<span class="font-normal">{attachment.name}</span>
										<span class="font-normal text-muted-foreground">{attachment.size}</span>
									</Button>
								{/each}
							</div>
						</Collapsible.Content>
					</Collapsible.Root>

					<Separator class="my-2" />
				{/if}

				<div class="scrollbar-none min-h-0 flex-1 overflow-y-auto whitespace-pre-wrap text-sm">{mail.body}</div>

				<div class="mt-auto flex flex-col gap-3">
					<Separator />
					<InputGroup.Root>
						<InputGroup.Addon align="inline-start">
							<Reply />
						</InputGroup.Addon>
						<InputGroup.Input class="text-xs" placeholder="Reply {mail.from.name}..." />
						<InputGroup.Addon class="gap-1" align="inline-end">
							<InputGroup.Button variant="ghost">
								<Smile />
							</InputGroup.Button>
							<InputGroup.Button variant="ghost">
								<Paperclip />
							</InputGroup.Button>
							<InputGroup.Button variant="ghost">
								<Send />
							</InputGroup.Button>
						</InputGroup.Addon>
					</InputGroup.Root>
				</div>
			</div>
		{:else}
			<div class="grid h-full place-items-center text-muted-foreground text-sm">No email selected</div>
		{/if}
	</div>
</div>
