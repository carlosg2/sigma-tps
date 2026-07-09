<script lang="ts">
	import * as Collapsible from "$lib/components/ui/collapsible/index.js";
	import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js";
	import * as Sidebar from "$lib/components/ui/sidebar/index.js";
	import * as Card from "$lib/components/ui/card/index.js";
	import * as Item from "$lib/components/ui/item/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import { Label } from "$lib/components/ui/label/index.js";
	import IconPlaceholder from "$lib/components/custom/icon-placeholder/icon-placeholder.svelte";
	import { cn } from "$lib/utils.js";
	import {
		BASE,
		brandIcon,
		canonicals,
		chevronRightIcon,
		chevronsIcon,
		docsGroups,
		moreIcon,
		navMain,
		navSecondary,
		plusIcon,
		searchIcon,
		teams,
		userIcon,
		versions,
		type IconSet,
		type LayoutConfig,
	} from "./layout-config.js";

	let {
		config,
		activeId,
		rootClass,
	}: { config: LayoutConfig; activeId: string | undefined; rootClass?: string } = $props();

	let activeTeam = $state(teams[0]);
	let selectedVersion = $state(versions[0]);
</script>

{#snippet icon(set: IconSet, cls?: string)}
	<IconPlaceholder
		lucide={set.lucide}
		tabler={set.tabler}
		hugeicons={set.hugeicons}
		phosphor={set.phosphor}
		remixicon={set.remixicon}
		class={cls}
	/>
{/snippet}

<Sidebar.Root
	variant={config.variant}
	collapsible={config.collapsible}
	side={config.side}
	class={rootClass}
>
	<!-- ── Header ─────────────────────────────────────────────────────────── -->
	{#if config.headerMode !== "none"}
		<Sidebar.Header>
			<Sidebar.Menu>
				<Sidebar.MenuItem>
					{#if config.headerMode === "brand"}
						<Sidebar.MenuButton size="lg">
							{#snippet child({ props })}
								<a href={BASE} {...props}>
									<div
										class="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg"
									>
										{@render icon(brandIcon)}
									</div>
									<Item.Root class="p-0" size="xs">
										<Item.Content>
											<Item.Title class="text-sm">Layout Lab</Item.Title>
											<Item.Description>Canonical layouts</Item.Description>
										</Item.Content>
									</Item.Root>
								</a>
							{/snippet}
						</Sidebar.MenuButton>
					{:else}
						<DropdownMenu.Root>
							<DropdownMenu.Trigger>
								{#snippet child({ props })}
									<Sidebar.MenuButton
										size="lg"
										class="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
										{...props}
									>
										<div
											class="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg"
										>
											{@render icon(brandIcon)}
										</div>
										<div class="grid flex-1 text-left text-sm leading-tight">
											{#if config.headerMode === "workspace"}
												<span class="truncate font-medium">{activeTeam.name}</span>
												<span class="text-muted-foreground truncate text-xs">{activeTeam.plan}</span>
											{:else}
												<span class="truncate font-medium">Documentation</span>
												<span class="text-muted-foreground truncate text-xs">v{selectedVersion}</span>
											{/if}
										</div>
										{@render icon(chevronsIcon, "ml-auto")}
									</Sidebar.MenuButton>
								{/snippet}
							</DropdownMenu.Trigger>
							<DropdownMenu.Content class="w-(--bits-dropdown-menu-anchor-width)" align="start">
								{#if config.headerMode === "workspace"}
									<DropdownMenu.Label>Workspaces</DropdownMenu.Label>
									{#each teams as team (team.name)}
										<DropdownMenu.Item onSelect={() => (activeTeam = team)}>{team.name}</DropdownMenu.Item>
									{/each}
								{:else}
									<DropdownMenu.Label>Version</DropdownMenu.Label>
									{#each versions as version (version)}
										<DropdownMenu.Item onSelect={() => (selectedVersion = version)}>v{version}</DropdownMenu.Item>
									{/each}
								{/if}
							</DropdownMenu.Content>
						</DropdownMenu.Root>
					{/if}
				</Sidebar.MenuItem>
			</Sidebar.Menu>

			{#if config.showSearch}
				<form>
					<Sidebar.Group class="py-0 group-data-[collapsible=icon]:hidden">
						<Sidebar.GroupContent class="relative">
							<Label for="sidebar-search" class="sr-only">Search</Label>
							<Sidebar.Input id="sidebar-search" placeholder="Search…" class="ps-8" />
							<div
								class="pointer-events-none absolute inset-s-2 top-1/2 size-4 -translate-y-1/2 opacity-50"
							>
								{@render icon(searchIcon)}
							</div>
						</Sidebar.GroupContent>
					</Sidebar.Group>
				</form>
			{/if}
		</Sidebar.Header>
	{/if}

	<Sidebar.Content>
		<!-- Navegación primaria: los 3 canonical layouts -->
		<Sidebar.Group>
			<Sidebar.GroupLabel>Canonical layouts</Sidebar.GroupLabel>
			<Sidebar.Menu>
				{#each canonicals as c (c.id)}
					<Sidebar.MenuItem>
						<Sidebar.MenuButton isActive={activeId === c.id} tooltipContent={c.label}>
							{#snippet child({ props })}
								<a href={c.href} {...props}>
									{@render icon(c.icon)}
									<span>{c.label}</span>
								</a>
							{/snippet}
						</Sidebar.MenuButton>
						{#if config.showBadges && c.badge}
							<Sidebar.MenuBadge>{c.badge}</Sidebar.MenuBadge>
						{/if}
					</Sidebar.MenuItem>
				{/each}
			</Sidebar.Menu>
		</Sidebar.Group>

		{#if config.showSeparators}
			<Sidebar.Separator />
		{/if}

		<!-- Navegación decorativa según navStyle -->
		{#if config.navStyle === "tree"}
			<Sidebar.Group>
				<Sidebar.GroupLabel>Platform</Sidebar.GroupLabel>
				{#if config.showGroupAction}
					<Sidebar.GroupAction title="Add">
						{@render icon(plusIcon)}
						<span class="sr-only">Add</span>
					</Sidebar.GroupAction>
				{/if}
				<Sidebar.GroupContent>
					<Sidebar.Menu>
						{#if config.loading}
							{#each Array(5) as _, i (i)}
								<Sidebar.MenuItem>
									<Sidebar.MenuSkeleton showIcon />
								</Sidebar.MenuItem>
							{/each}
						{:else}
							{#each navMain as item (item.title)}
								{#if config.menuAction === "collapsible" && item.items?.length}
									<Collapsible.Root>
										{#snippet child({ props })}
											<Sidebar.MenuItem {...props}>
												<Sidebar.MenuButton tooltipContent={item.title}>
													{#snippet child({ props })}
														<a href="#" {...props}>
															{@render icon(item.icon)}
															<span>{item.title}</span>
														</a>
													{/snippet}
												</Sidebar.MenuButton>
												{#if config.showBadges && item.badge}
													<Sidebar.MenuBadge>{item.badge}</Sidebar.MenuBadge>
												{/if}
												<Collapsible.Trigger>
													{#snippet child({ props })}
														<Sidebar.MenuAction class="data-[state=open]:rotate-90" {...props}>
															{@render icon(chevronRightIcon)}
															<span class="sr-only">Toggle</span>
														</Sidebar.MenuAction>
													{/snippet}
												</Collapsible.Trigger>
												<Collapsible.Content>
													<Sidebar.MenuSub>
														{#each item.items as sub (sub)}
															<Sidebar.MenuSubItem>
																<Sidebar.MenuSubButton>
																	{#snippet child({ props })}
																		<a href="#" {...props}>{sub}</a>
																	{/snippet}
																</Sidebar.MenuSubButton>
															</Sidebar.MenuSubItem>
														{/each}
													</Sidebar.MenuSub>
												</Collapsible.Content>
											</Sidebar.MenuItem>
										{/snippet}
									</Collapsible.Root>
								{:else}
									<Sidebar.MenuItem>
										<Sidebar.MenuButton tooltipContent={item.title}>
											{#snippet child({ props })}
												<a href="#" {...props}>
													{@render icon(item.icon)}
													<span>{item.title}</span>
												</a>
											{/snippet}
										</Sidebar.MenuButton>
										{#if config.showBadges && item.badge && config.menuAction !== "dropdown"}
											<Sidebar.MenuBadge>{item.badge}</Sidebar.MenuBadge>
										{/if}
										{#if config.menuAction === "dropdown" && item.items?.length}
											<DropdownMenu.Root>
												<DropdownMenu.Trigger>
													{#snippet child({ props })}
														<Sidebar.MenuAction {...props}>
															{@render icon(moreIcon)}
															<span class="sr-only">More</span>
														</Sidebar.MenuAction>
													{/snippet}
												</DropdownMenu.Trigger>
												<DropdownMenu.Content side="right" align="start">
													{#each item.items as sub (sub)}
														<DropdownMenu.Item>
															{#snippet child({ props })}
																<a href="#" {...props}>{sub}</a>
															{/snippet}
														</DropdownMenu.Item>
													{/each}
												</DropdownMenu.Content>
											</DropdownMenu.Root>
										{/if}
									</Sidebar.MenuItem>
								{/if}
							{/each}
						{/if}
					</Sidebar.Menu>
				</Sidebar.GroupContent>
			</Sidebar.Group>
		{:else if config.navStyle === "flat"}
			{#each docsGroups as group (group.title)}
				<Sidebar.Group>
					<Sidebar.GroupLabel>{group.title}</Sidebar.GroupLabel>
					<Sidebar.GroupContent>
						<Sidebar.Menu>
							{#each group.items as sub (sub)}
								<Sidebar.MenuItem>
									<Sidebar.MenuButton>
										{#snippet child({ props })}
											<a href="#" {...props}>{sub}</a>
										{/snippet}
									</Sidebar.MenuButton>
								</Sidebar.MenuItem>
							{/each}
						</Sidebar.Menu>
					</Sidebar.GroupContent>
				</Sidebar.Group>
			{/each}
		{:else}
			<!-- Collapsible groups (label como trigger) -->
			{#each docsGroups as group, gi (group.title)}
				<Collapsible.Root open={gi === 0} class="group/collapsible">
					{#snippet child({ props })}
						<Sidebar.Group {...props}>
							<Sidebar.GroupLabel>
								{#snippet child({ props })}
									<Collapsible.Trigger {...props}>
										{group.title}
										{@render icon(
											chevronRightIcon,
											"ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90"
										)}
									</Collapsible.Trigger>
								{/snippet}
							</Sidebar.GroupLabel>
							<Collapsible.Content>
								<Sidebar.GroupContent>
									<Sidebar.Menu>
										{#each group.items as sub (sub)}
											<Sidebar.MenuItem>
												<Sidebar.MenuButton>
													{#snippet child({ props })}
														<a href="#" {...props}>{sub}</a>
													{/snippet}
												</Sidebar.MenuButton>
											</Sidebar.MenuItem>
										{/each}
									</Sidebar.Menu>
								</Sidebar.GroupContent>
							</Collapsible.Content>
						</Sidebar.Group>
					{/snippet}
				</Collapsible.Root>
			{/each}
		{/if}

		{#if config.showSecondary}
			<Sidebar.Group class="mt-auto">
				<Sidebar.GroupContent>
					<Sidebar.Menu>
						{#each navSecondary as item (item.title)}
							<Sidebar.MenuItem>
								<Sidebar.MenuButton size="sm" tooltipContent={item.title}>
									{#snippet child({ props })}
										<a href="#" {...props}>
											{@render icon(item.icon)}
											<span>{item.title}</span>
										</a>
									{/snippet}
								</Sidebar.MenuButton>
							</Sidebar.MenuItem>
						{/each}
					</Sidebar.Menu>
				</Sidebar.GroupContent>
			</Sidebar.Group>
		{/if}
	</Sidebar.Content>

	<!-- ── Footer ─────────────────────────────────────────────────────────── -->
	{#if config.footerMode !== "none"}
		<Sidebar.Footer>
			{#if config.footerMode === "card"}
				<Sidebar.Group class="group-data-[collapsible=icon]:hidden">
					<Card.Root class="gap-2 py-4 shadow-none">
						<Card.Header class="px-4">
							<Card.Title class="text-sm">Subscribe to our newsletter</Card.Title>
							<Card.Description>Opt-in to receive updates and news.</Card.Description>
						</Card.Header>
						<Card.Content class="px-4">
							<form class="grid gap-2.5">
								<Sidebar.Input type="email" placeholder="Email" />
								<Button
									size="sm"
									class="bg-sidebar-primary text-sidebar-primary-foreground w-full shadow-none"
								>
									Subscribe
								</Button>
							</form>
						</Card.Content>
					</Card.Root>
				</Sidebar.Group>
			{:else}
				<Sidebar.Menu>
					<Sidebar.MenuItem>
						{#if config.footerMode === "user"}
							<Sidebar.MenuButton size="lg" tooltipContent="shadcn">
								<div
									class="bg-muted flex aspect-square size-8 items-center justify-center rounded-lg"
								>
									{@render icon(userIcon)}
								</div>
								<div class="grid flex-1 text-left text-sm leading-tight">
									<span class="truncate font-medium">shadcn</span>
									<span class="text-muted-foreground truncate text-xs">m@example.com</span>
								</div>
							</Sidebar.MenuButton>
						{:else}
							<DropdownMenu.Root>
								<DropdownMenu.Trigger>
									{#snippet child({ props })}
										<Sidebar.MenuButton
											size="lg"
											class="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
											tooltipContent="shadcn"
											{...props}
										>
											<div
												class="bg-muted flex aspect-square size-8 items-center justify-center rounded-lg"
											>
												{@render icon(userIcon)}
											</div>
											<div class="grid flex-1 text-left text-sm leading-tight">
												<span class="truncate font-medium">shadcn</span>
												<span class="text-muted-foreground truncate text-xs">m@example.com</span>
											</div>
											{@render icon(chevronsIcon, "ml-auto")}
										</Sidebar.MenuButton>
									{/snippet}
								</DropdownMenu.Trigger>
								<DropdownMenu.Content
									side={config.side === "left" ? "right" : "left"}
									align="end"
									class="w-(--bits-dropdown-menu-anchor-width)"
								>
									<DropdownMenu.Label>My Account</DropdownMenu.Label>
									<DropdownMenu.Separator />
									<DropdownMenu.Item>Account</DropdownMenu.Item>
									<DropdownMenu.Item>Billing</DropdownMenu.Item>
									<DropdownMenu.Separator />
									<DropdownMenu.Item>Sign out</DropdownMenu.Item>
								</DropdownMenu.Content>
							</DropdownMenu.Root>
						{/if}
					</Sidebar.MenuItem>
				</Sidebar.Menu>
			{/if}
		</Sidebar.Footer>
	{/if}

	{#if config.showRail}
		<Sidebar.Rail />
	{/if}
</Sidebar.Root>
