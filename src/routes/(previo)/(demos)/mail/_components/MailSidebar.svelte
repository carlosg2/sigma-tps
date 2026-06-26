<script lang="ts">
	import {
		Check,
		EllipsisVertical,
		LogOut,
		PenLine,
		Settings2,
		UserPlus,
		UsersRound,
	} from "@lucide/svelte";

	import { Button } from "$lib/components/ui/button/index.js";
	import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js";
	import { Separator } from "$lib/components/ui/separator/index.js";
	import * as Sidebar from "$lib/components/ui/sidebar/index.js";
	import * as ToggleGroup from "$lib/components/ui/toggle-group/index.js";
	import { cn } from "$lib/utils.js";

	import { accounts, mailNavigation, type MailNavItem } from "./data.js";

	const sidebar = Sidebar.useSidebar();

	let selectedAccount = $state(accounts[0]);

	const accountTriggerClassName = cn(
		"relative size-7 min-w-7 rounded-sm p-0 transition-colors",
		"bg-primary text-primary-foreground text-xs hover:bg-primary/90 hover:text-primary-foreground",
		"data-[state=on]:bg-primary data-[state=on]:text-primary-foreground",
		"data-[state=on]:ring data-[state=on]:ring-green-600",
		"focus-visible:border-transparent focus-visible:ring-0",
	);

	function getInitials(name: string) {
		return name
			.split(" ")
			.map((part) => part[0])
			.join("")
			.toUpperCase();
	}

	function selectAccount(id: string) {
		const account = accounts.find((a) => String(a.id) === id);
		if (account) selectedAccount = account;
	}
</script>

<Sidebar.Root collapsible="icon" class="absolute inset-y-0 h-full **:data-[sidebar=sidebar]:bg-background">
	<Sidebar.Header class="gap-3 py-3 pb-1">
		<div class="flex items-center justify-between">
			{#if sidebar.state === "collapsed"}
				<DropdownMenu.Root>
					<DropdownMenu.Trigger>
						{#snippet child({ props })}
							<Button
								{...props}
								variant="ghost"
								size="icon-sm"
								class={accountTriggerClassName}
								aria-label="Open {selectedAccount.label} menu"
							>
								<span class="relative flex items-center justify-center">
									{getInitials(selectedAccount.label).slice(0, 1)}
									<span
										class="absolute right-0 bottom-0 flex size-2.5 items-center justify-center rounded-full bg-green-600 text-primary-foreground ring-[1.25px] ring-background"
									>
										<Check class="size-2" />
									</span>
								</span>
							</Button>
						{/snippet}
					</DropdownMenu.Trigger>
					<DropdownMenu.Content class="w-56" side="right" align="start">
						<DropdownMenu.Label>Accounts</DropdownMenu.Label>
						<DropdownMenu.Group>
							{#each accounts as account}
								<DropdownMenu.Item
									class="flex flex-col items-start"
									onclick={() => (selectedAccount = account)}
								>
									<span>{account.label}</span>
									<span class="truncate text-muted-foreground text-xs">{account.email}</span>
								</DropdownMenu.Item>
							{/each}
						</DropdownMenu.Group>
						<DropdownMenu.Separator />
						<DropdownMenu.Group>
							<DropdownMenu.Item><UserPlus />Add account</DropdownMenu.Item>
							<DropdownMenu.Item><UsersRound />Manage accounts</DropdownMenu.Item>
							<DropdownMenu.Item><Settings2 />Account settings</DropdownMenu.Item>
						</DropdownMenu.Group>
						<DropdownMenu.Separator />
						<DropdownMenu.Group>
							<DropdownMenu.Item><LogOut />Sign out</DropdownMenu.Item>
						</DropdownMenu.Group>
					</DropdownMenu.Content>
				</DropdownMenu.Root>
			{:else}
				<ToggleGroup.Root
					type="single"
					value={String(selectedAccount.id)}
					onValueChange={selectAccount}
					class="flex gap-0.5"
				>
					{#each accounts as account}
						<ToggleGroup.Item
							class={accountTriggerClassName}
							value={String(account.id)}
							aria-label="Select {account.label}"
						>
							{getInitials(account.label).slice(0, 1)}
							{#if selectedAccount.id === account.id}
								<span
									class="absolute right-0 bottom-0 flex size-2.5 items-center justify-center rounded-full bg-green-600 text-primary-foreground ring-[1.25px] ring-background"
								>
									<Check class="size-2" />
								</span>
							{/if}
						</ToggleGroup.Item>
					{/each}
				</ToggleGroup.Root>

				<DropdownMenu.Root>
					<DropdownMenu.Trigger>
						{#snippet child({ props })}
							<Button {...props} variant="ghost" size="icon-sm" aria-label="Open account menu">
								<EllipsisVertical />
							</Button>
						{/snippet}
					</DropdownMenu.Trigger>
					<DropdownMenu.Content class="w-56" align="end">
						<DropdownMenu.Group>
							<DropdownMenu.Item><UserPlus />Add account</DropdownMenu.Item>
							<DropdownMenu.Item><UsersRound />Manage accounts</DropdownMenu.Item>
							<DropdownMenu.Item><Settings2 />Account settings</DropdownMenu.Item>
						</DropdownMenu.Group>
						<DropdownMenu.Separator />
						<DropdownMenu.Group>
							<DropdownMenu.Item><LogOut />Sign out</DropdownMenu.Item>
						</DropdownMenu.Group>
					</DropdownMenu.Content>
				</DropdownMenu.Root>
			{/if}
		</div>

		<Separator />

		<div class="flex flex-col gap-1.5 group-data-[state=collapsed]:hidden">
			<div class="font-medium text-sm leading-none">{selectedAccount.label}</div>
			<div class="truncate text-muted-foreground text-sm leading-none">{selectedAccount.email}</div>
		</div>

		<Button
			size={sidebar.state === "collapsed" ? "icon-sm" : "sm"}
			variant="outline"
			class="group-data-[state=expanded]:w-full"
		>
			<PenLine data-icon="inline-start" />
			<span class="group-data-[state=collapsed]:hidden">New email</span>
		</Button>
	</Sidebar.Header>

	<Sidebar.Content>
		<Sidebar.Group>
			<Sidebar.Menu class="gap-1">
				{#each mailNavigation.navMain as nav}
					{@render navItem(nav)}
				{/each}
			</Sidebar.Menu>
		</Sidebar.Group>

		<Sidebar.Group>
			<Sidebar.GroupLabel class="font-normal">Folders</Sidebar.GroupLabel>
			<Sidebar.Menu class="gap-1">
				{#each mailNavigation.folders as nav}
					{@render navItem(nav)}
				{/each}
			</Sidebar.Menu>
		</Sidebar.Group>
	</Sidebar.Content>

	<Sidebar.Footer>
		<Sidebar.Menu class="gap-1">
			{#each mailNavigation.navFooter as nav}
				{@render navItem(nav)}
			{/each}
		</Sidebar.Menu>
	</Sidebar.Footer>
</Sidebar.Root>

{#snippet navItem(nav: MailNavItem)}
	<Sidebar.MenuItem>
		<Sidebar.MenuButton class="[&_svg]:size-3.5" size="sm" isActive={nav.isActive} tooltipContent={nav.title}>
			<nav.icon />
			<span class="font-medium">{nav.title}</span>
		</Sidebar.MenuButton>
		{#if nav.label}
			<Sidebar.MenuBadge class="font-medium">{nav.label}</Sidebar.MenuBadge>
		{/if}
	</Sidebar.MenuItem>
{/snippet}
