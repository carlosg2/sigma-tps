<script lang="ts">
	/* eslint-disable @typescript-eslint/no-explicit-any */
	import { page } from "$app/state";
	import * as Collapsible from "$lib/components/ui/collapsible/index.js";
	import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js";
	import * as Sidebar from "$lib/components/ui/sidebar/index.js";
	import * as ToggleGroup from "$lib/components/ui/toggle-group/index.js";
	import * as Item from "$lib/components/ui/item/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import { Switch } from "$lib/components/ui/switch/index.js";
	import { Label } from "$lib/components/ui/label/index.js";
	import { Separator } from "$lib/components/ui/separator/index.js";
	import IconPlaceholder from "$lib/components/custom/icon-placeholder/icon-placeholder.svelte";
	import { cn } from "$lib/utils.js";
	import StatusChip from "./status-chip.svelte";

	let { children } = $props();

	type Variant = "sidebar" | "floating" | "inset";
	type Collapsible = "offcanvas" | "icon" | "none";
	type Side = "left" | "right";
	type Width = "compact" | "default" | "comfortable";
	type HeaderMode = "none" | "brand" | "workspace";
	type FooterMode = "none" | "user" | "account";
	type MenuAction = "collapsible" | "dropdown" | "none";

	// ── Configuración reactiva (persiste entre páginas: vive en el layout) ─────
	let variant = $state<Variant>("inset");
	let collapsible = $state<Collapsible>("icon");
	let side = $state<Side>("left");
	let open = $state(true);
	let width = $state<Width>("default");

	let headerMode = $state<HeaderMode>("workspace");
	let footerMode = $state<FooterMode>("account");
	let menuAction = $state<MenuAction>("collapsible");
	let showSecondary = $state(true);
	let showRail = $state(true);
	let showBadges = $state(true);
	let showSeparators = $state(false);
	let showGroupAction = $state(true);
	let loading = $state(false);
	let headerBorder = $state(true);

	let panelOpen = $state(true);

	const WIDTHS: Record<Width, string> = {
		compact: "13rem",
		default: "16rem",
		comfortable: "20rem",
	};
	const sidebarStyle = $derived(
		`--sidebar-width: ${WIDTHS[width]}; --sidebar-width-mobile: 18rem;`
	);

	// ── Rutas canónicas (Material 3) ───────────────────────────────────────────
	const BASE = "/demos/dyamic-layouts-sidebars";
	const canonicals = [
		{
			id: "list-detail",
			label: "List-detail",
			href: `${BASE}/list-detail`,
			badge: "3",
			lucide: "ListIcon",
			tabler: "IconList",
			hugeicons: "LayoutLeftIcon",
			phosphor: "ListIcon",
			remixicon: "RiListUnordered",
		},
		{
			id: "supporting",
			label: "Supporting",
			href: `${BASE}/supporting`,
			badge: "",
			lucide: "LayoutIcon",
			tabler: "IconLayout",
			hugeicons: "LayoutIcon",
			phosphor: "LayoutIcon",
			remixicon: "RiLayoutLine",
		},
		{
			id: "feed",
			label: "Feed",
			href: `${BASE}/feed`,
			badge: "12",
			lucide: "LayoutGridIcon",
			tabler: "IconLayoutGrid",
			hugeicons: "GridIcon",
			phosphor: "GridFourIcon",
			remixicon: "RiGridLine",
		},
	] as const;

	const activeId = $derived(page.url.pathname.split("/").filter(Boolean).pop());
	const activeLabel = $derived(canonicals.find((c) => c.id === activeId)?.label ?? "Layout");

	// ── Presets ───────────────────────────────────────────────────────────────
	const presets = [
		{ id: "floating", label: "Floating", variant: "floating", collapsible: "offcanvas" },
		{ id: "icon", label: "Icon", variant: "sidebar", collapsible: "icon" },
		{ id: "inset", label: "Inset", variant: "inset", collapsible: "icon" },
		{ id: "classic", label: "Classic", variant: "sidebar", collapsible: "offcanvas" },
	] as const;

	function applyPreset(p: (typeof presets)[number]) {
		variant = p.variant;
		collapsible = p.collapsible;
		open = true;
	}

	function reset() {
		variant = "inset";
		collapsible = "icon";
		side = "left";
		open = true;
		width = "default";
		headerMode = "workspace";
		footerMode = "account";
		menuAction = "collapsible";
		showSecondary = true;
		showRail = true;
		showBadges = true;
		showSeparators = false;
		showGroupAction = true;
		loading = false;
		headerBorder = true;
	}

	const codeSnippet = $derived(
		`<Sidebar.Root variant="${variant}" collapsible="${collapsible}" side="${side}">`
	);

	// ── Datos ──────────────────────────────────────────────────────────────────
	const teams = [
		{ name: "Acme Inc", plan: "Enterprise" },
		{ name: "Acme Corp.", plan: "Startup" },
		{ name: "Evil Corp.", plan: "Free" },
	];
	let activeTeam = $state(teams[0]);

	const navMain = [
		{
			title: "Dashboard",
			lucide: "HomeIcon",
			tabler: "IconHome",
			hugeicons: "HomeIcon",
			phosphor: "HouseIcon",
			remixicon: "RiHomeLine",
			items: ["Overview", "Analytics"],
		},
		{
			title: "Orders",
			lucide: "ShoppingBagIcon",
			tabler: "IconShoppingBag",
			hugeicons: "ShoppingBag01Icon",
			phosphor: "BagIcon",
			remixicon: "RiShoppingBagLine",
			items: ["All Orders", "Pending", "Completed"],
		},
		{
			title: "Products",
			lucide: "ShoppingCartIcon",
			tabler: "IconShoppingCart",
			hugeicons: "ShoppingCart01Icon",
			phosphor: "ShoppingCartIcon",
			remixicon: "RiShoppingCartLine",
			items: ["All Products", "Categories"],
		},
	];

	const navSecondary = [
		{
			title: "Support",
			lucide: "HelpCircleIcon",
			tabler: "IconHelpCircle",
			hugeicons: "HelpCircleIcon",
			phosphor: "QuestionIcon",
			remixicon: "RiQuestionLine",
		},
		{
			title: "Feedback",
			lucide: "SendIcon",
			tabler: "IconSend",
			hugeicons: "SentIcon",
			phosphor: "PaperPlaneTiltIcon",
			remixicon: "RiSendPlaneLine",
		},
	];
</script>

<!-- Snippet reutilizable para el icono de un item de navegación -->
{#snippet navIcon(item: any)}
	<IconPlaceholder
		lucide={item.lucide as any}
		tabler={item.tabler as any}
		hugeicons={item.hugeicons as any}
		phosphor={item.phosphor as any}
		remixicon={item.remixicon as any}
	/>
{/snippet}

<Sidebar.Provider bind:open style={sidebarStyle}>
	<Sidebar.Root {variant} {collapsible} {side}>
		<!-- ── Header ─────────────────────────────────────────────────────────── -->
		{#if headerMode !== "none"}
			<Sidebar.Header>
				<Sidebar.Menu>
					<Sidebar.MenuItem>
						{#if headerMode === "brand"}
							<Sidebar.MenuButton size="lg">
								{#snippet child({ props })}
									<a href={BASE} {...props}>
										<div
											class="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg"
										>
											<IconPlaceholder
												lucide="LayoutDashboardIcon"
												tabler="IconLayoutDashboard"
												hugeicons="DashboardSquare01Icon"
												phosphor="SquaresFourIcon"
												remixicon="RiLayoutLine"
											/>
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
							<!-- Workspace switcher (DropdownMenu) -->
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
												<IconPlaceholder
													lucide="LayoutDashboardIcon"
													tabler="IconLayoutDashboard"
													hugeicons="DashboardSquare01Icon"
													phosphor="SquaresFourIcon"
													remixicon="RiLayoutLine"
												/>
											</div>
											<div class="grid flex-1 text-left text-sm leading-tight">
												<span class="truncate font-medium">{activeTeam.name}</span>
												<span class="text-muted-foreground truncate text-xs">{activeTeam.plan}</span>
											</div>
											<IconPlaceholder
												lucide="ChevronsUpDownIcon"
												tabler="IconSelector"
												hugeicons="UnfoldMoreIcon"
												phosphor="CaretUpDownIcon"
												remixicon="RiExpandUpDownLine"
												class="ml-auto"
											/>
										</Sidebar.MenuButton>
									{/snippet}
								</DropdownMenu.Trigger>
								<DropdownMenu.Content
									class="w-(--bits-dropdown-menu-anchor-width)"
									align="start"
								>
									<DropdownMenu.Label>Workspaces</DropdownMenu.Label>
									{#each teams as team (team.name)}
										<DropdownMenu.Item onSelect={() => (activeTeam = team)}>
											<span>{team.name}</span>
										</DropdownMenu.Item>
									{/each}
								</DropdownMenu.Content>
							</DropdownMenu.Root>
						{/if}
					</Sidebar.MenuItem>
				</Sidebar.Menu>
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
										{@render navIcon(c)}
										<span>{c.label}</span>
									</a>
								{/snippet}
							</Sidebar.MenuButton>
							{#if showBadges && c.badge}
								<Sidebar.MenuBadge>{c.badge}</Sidebar.MenuBadge>
							{/if}
						</Sidebar.MenuItem>
					{/each}
				</Sidebar.Menu>
			</Sidebar.Group>

			{#if showSeparators}
				<Sidebar.Separator />
			{/if}

			<!-- Navegación decorativa (demuestra menuAction / loading / GroupAction) -->
			<Sidebar.Group>
				<Sidebar.GroupLabel>Platform</Sidebar.GroupLabel>
				{#if showGroupAction}
					<Sidebar.GroupAction title="Add">
						<IconPlaceholder
							lucide="PlusIcon"
							tabler="IconPlus"
							hugeicons="PlusSignIcon"
							phosphor="PlusIcon"
							remixicon="RiAddLine"
						/>
						<span class="sr-only">Add</span>
					</Sidebar.GroupAction>
				{/if}
				<Sidebar.GroupContent>
					<Sidebar.Menu>
						{#if loading}
							{#each Array(5) as _, i (i)}
								<Sidebar.MenuItem>
									<Sidebar.MenuSkeleton showIcon />
								</Sidebar.MenuItem>
							{/each}
						{:else}
							{#each navMain as item (item.title)}
								{#if menuAction === "collapsible" && item.items?.length}
									<Collapsible.Root>
										{#snippet child({ props })}
											<Sidebar.MenuItem {...props}>
												<Sidebar.MenuButton tooltipContent={item.title}>
													{#snippet child({ props })}
														<a href="#" {...props}>
															{@render navIcon(item)}
															<span>{item.title}</span>
														</a>
													{/snippet}
												</Sidebar.MenuButton>
												<Collapsible.Trigger>
													{#snippet child({ props })}
														<Sidebar.MenuAction class="data-[state=open]:rotate-90" {...props}>
															<IconPlaceholder
																lucide="ChevronRightIcon"
																tabler="IconChevronRight"
																hugeicons="ArrowRight01Icon"
																phosphor="CaretRightIcon"
																remixicon="RiArrowRightSLine"
															/>
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
													{@render navIcon(item)}
													<span>{item.title}</span>
												</a>
											{/snippet}
										</Sidebar.MenuButton>
										{#if menuAction === "dropdown" && item.items?.length}
											<DropdownMenu.Root>
												<DropdownMenu.Trigger>
													{#snippet child({ props })}
														<Sidebar.MenuAction {...props}>
															<IconPlaceholder
																lucide="MoreHorizontalIcon"
																tabler="IconDots"
																hugeicons="MoreHorizontalCircle01Icon"
																phosphor="DotsThreeIcon"
																remixicon="RiMoreLine"
															/>
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

			{#if showSecondary}
				<Sidebar.Group class="mt-auto">
					<Sidebar.GroupContent>
						<Sidebar.Menu>
							{#each navSecondary as item (item.title)}
								<Sidebar.MenuItem>
									<Sidebar.MenuButton size="sm" tooltipContent={item.title}>
										{#snippet child({ props })}
											<a href="#" {...props}>
												{@render navIcon(item)}
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
		{#if footerMode !== "none"}
			<Sidebar.Footer>
				<Sidebar.Menu>
					<Sidebar.MenuItem>
						{#if footerMode === "user"}
							<Sidebar.MenuButton size="lg" tooltipContent="shadcn">
								<div
									class="bg-muted flex aspect-square size-8 items-center justify-center rounded-lg"
								>
									<IconPlaceholder
										lucide="UserIcon"
										tabler="IconUser"
										hugeicons="UserIcon"
										phosphor="UserIcon"
										remixicon="RiUserLine"
									/>
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
												<IconPlaceholder
													lucide="UserIcon"
													tabler="IconUser"
													hugeicons="UserIcon"
													phosphor="UserIcon"
													remixicon="RiUserLine"
												/>
											</div>
											<div class="grid flex-1 text-left text-sm leading-tight">
												<span class="truncate font-medium">shadcn</span>
												<span class="text-muted-foreground truncate text-xs">m@example.com</span>
											</div>
											<IconPlaceholder
												lucide="ChevronsUpDownIcon"
												tabler="IconSelector"
												hugeicons="UnfoldMoreIcon"
												phosphor="CaretUpDownIcon"
												remixicon="RiExpandUpDownLine"
												class="ml-auto"
											/>
										</Sidebar.MenuButton>
									{/snippet}
								</DropdownMenu.Trigger>
								<DropdownMenu.Content
									side="top"
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
			</Sidebar.Footer>
		{/if}

		{#if showRail}
			<Sidebar.Rail />
		{/if}
	</Sidebar.Root>

	<Sidebar.Inset>
		<!-- App bar sticky (permanece visible con el scroll del body) -->
		<header
			class={cn(
				"bg-background/80 sticky top-0 z-20 flex h-16 shrink-0 items-center gap-2 px-4 backdrop-blur",
				headerBorder && "border-b",
				variant === "inset" && "md:rounded-t-xl"
			)}
		>
			<Sidebar.Trigger class="-ml-1" />
			<Separator orientation="vertical" class="mr-1 h-4!" />
			<div class="flex min-w-0 flex-col">
				<h1 class="truncate text-sm font-semibold">{activeLabel}</h1>
				<p class="text-muted-foreground truncate text-xs">
					{variant} · {collapsible} · {side}
				</p>
			</div>

			<StatusChip class="ml-3" />

			<!-- Switcher segmentado entre canonicals -->
			<nav class="bg-muted text-muted-foreground ml-auto inline-flex items-center rounded-lg p-0.5">
				{#each canonicals as c (c.id)}
					<a
						href={c.href}
						class={cn(
							"rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
							activeId === c.id
								? "bg-background text-foreground shadow-sm"
								: "hover:text-foreground"
						)}
					>
						{c.label}
					</a>
				{/each}
			</nav>
		</header>

		{@render children()}
	</Sidebar.Inset>
</Sidebar.Provider>

<!-- ── Panel de configuración flotante ─────────────────────────────────────── -->
<div class="fixed right-4 bottom-4 z-50 flex flex-col items-end gap-2">
	{#if panelOpen}
		<div
			class="bg-popover text-popover-foreground w-80 max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl border shadow-xl"
		>
			<div class="flex items-center justify-between border-b px-4 py-3">
				<div class="flex items-center gap-2">
					<IconPlaceholder
						lucide="Settings2Icon"
						tabler="IconSettings"
						hugeicons="Settings05Icon"
						phosphor="GearIcon"
						remixicon="RiSettingsLine"
					/>
					<span class="text-sm font-semibold">Layout & Sidebar</span>
				</div>
				<Button variant="ghost" size="icon-sm" onclick={() => (panelOpen = false)}>
					<IconPlaceholder
						lucide="XIcon"
						tabler="IconX"
						hugeicons="Cancel01Icon"
						phosphor="XIcon"
						remixicon="RiCloseLine"
					/>
				</Button>
			</div>

			<div class="max-h-[75vh] space-y-4 overflow-y-auto p-4">
				<!-- Presets -->
				<div class="space-y-2">
					<Label class="text-xs font-medium">Presets</Label>
					<div class="grid grid-cols-2 gap-2">
						{#each presets as p (p.id)}
							<Button
								variant={variant === p.variant && collapsible === p.collapsible
									? "default"
									: "outline"}
								size="sm"
								onclick={() => applyPreset(p)}
							>
								{p.label}
							</Button>
						{/each}
					</div>
				</div>

				<Separator />

				<!-- Structure -->
				<p class="text-muted-foreground text-[10px] font-semibold tracking-wide uppercase">
					Structure
				</p>

				<div class="space-y-2">
					<Label class="text-xs font-medium">Variant</Label>
					<ToggleGroup.Root
						type="single"
						variant="outline"
						class="w-full"
						value={variant}
						onValueChange={(v) => v && (variant = v as Variant)}
					>
						<ToggleGroup.Item value="sidebar" class="flex-1 text-xs">sidebar</ToggleGroup.Item>
						<ToggleGroup.Item value="floating" class="flex-1 text-xs">floating</ToggleGroup.Item>
						<ToggleGroup.Item value="inset" class="flex-1 text-xs">inset</ToggleGroup.Item>
					</ToggleGroup.Root>
				</div>

				<div class="space-y-2">
					<Label class="text-xs font-medium">Collapsible</Label>
					<ToggleGroup.Root
						type="single"
						variant="outline"
						class="w-full"
						value={collapsible}
						onValueChange={(v) => v && (collapsible = v as Collapsible)}
					>
						<ToggleGroup.Item value="offcanvas" class="flex-1 text-xs">offcanvas</ToggleGroup.Item>
						<ToggleGroup.Item value="icon" class="flex-1 text-xs">icon</ToggleGroup.Item>
						<ToggleGroup.Item value="none" class="flex-1 text-xs">none</ToggleGroup.Item>
					</ToggleGroup.Root>
				</div>

				<div class="grid grid-cols-2 gap-3">
					<div class="space-y-2">
						<Label class="text-xs font-medium">Side</Label>
						<ToggleGroup.Root
							type="single"
							variant="outline"
							class="w-full"
							value={side}
							onValueChange={(v) => v && (side = v as Side)}
						>
							<ToggleGroup.Item value="left" class="flex-1 text-xs">L</ToggleGroup.Item>
							<ToggleGroup.Item value="right" class="flex-1 text-xs">R</ToggleGroup.Item>
						</ToggleGroup.Root>
					</div>
					<div class="space-y-2">
						<Label class="text-xs font-medium">Width</Label>
						<ToggleGroup.Root
							type="single"
							variant="outline"
							class="w-full"
							value={width}
							onValueChange={(v) => v && (width = v as Width)}
						>
							<ToggleGroup.Item value="compact" class="flex-1 text-[10px]">S</ToggleGroup.Item>
							<ToggleGroup.Item value="default" class="flex-1 text-[10px]">M</ToggleGroup.Item>
							<ToggleGroup.Item value="comfortable" class="flex-1 text-[10px]">L</ToggleGroup.Item>
						</ToggleGroup.Root>
					</div>
				</div>

				<Separator />

				<!-- Composition -->
				<p class="text-muted-foreground text-[10px] font-semibold tracking-wide uppercase">
					Composition
				</p>

				<div class="space-y-2">
					<Label class="text-xs font-medium">Header</Label>
					<ToggleGroup.Root
						type="single"
						variant="outline"
						class="w-full"
						value={headerMode}
						onValueChange={(v) => v && (headerMode = v as HeaderMode)}
					>
						<ToggleGroup.Item value="none" class="flex-1 text-[10px]">none</ToggleGroup.Item>
						<ToggleGroup.Item value="brand" class="flex-1 text-[10px]">brand</ToggleGroup.Item>
						<ToggleGroup.Item value="workspace" class="flex-1 text-[10px]">workspace</ToggleGroup.Item>
					</ToggleGroup.Root>
				</div>

				<div class="space-y-2">
					<Label class="text-xs font-medium">Footer</Label>
					<ToggleGroup.Root
						type="single"
						variant="outline"
						class="w-full"
						value={footerMode}
						onValueChange={(v) => v && (footerMode = v as FooterMode)}
					>
						<ToggleGroup.Item value="none" class="flex-1 text-[10px]">none</ToggleGroup.Item>
						<ToggleGroup.Item value="user" class="flex-1 text-[10px]">user</ToggleGroup.Item>
						<ToggleGroup.Item value="account" class="flex-1 text-[10px]">account</ToggleGroup.Item>
					</ToggleGroup.Root>
				</div>

				<div class="space-y-2">
					<Label class="text-xs font-medium">Menu action</Label>
					<ToggleGroup.Root
						type="single"
						variant="outline"
						class="w-full"
						value={menuAction}
						onValueChange={(v) => v && (menuAction = v as MenuAction)}
					>
						<ToggleGroup.Item value="collapsible" class="flex-1 text-[10px]"
							>collapse</ToggleGroup.Item
						>
						<ToggleGroup.Item value="dropdown" class="flex-1 text-[10px]">dropdown</ToggleGroup.Item>
						<ToggleGroup.Item value="none" class="flex-1 text-[10px]">none</ToggleGroup.Item>
					</ToggleGroup.Root>
				</div>

				<Separator />

				<!-- Extras -->
				<p class="text-muted-foreground text-[10px] font-semibold tracking-wide uppercase">
					Extras
				</p>

				<div class="space-y-3">
					<div class="flex items-center justify-between">
						<Label for="cfg-open" class="text-xs font-medium">Open</Label>
						<Switch id="cfg-open" bind:checked={open} />
					</div>
					<div class="flex items-center justify-between">
						<Label for="cfg-secondary" class="text-xs font-medium">Secondary group</Label>
						<Switch id="cfg-secondary" bind:checked={showSecondary} />
					</div>
					<div class="flex items-center justify-between">
						<Label for="cfg-rail" class="text-xs font-medium">Rail</Label>
						<Switch id="cfg-rail" bind:checked={showRail} />
					</div>
					<div class="flex items-center justify-between">
						<Label for="cfg-badges" class="text-xs font-medium">Menu badges</Label>
						<Switch id="cfg-badges" bind:checked={showBadges} />
					</div>
					<div class="flex items-center justify-between">
						<Label for="cfg-groupaction" class="text-xs font-medium">Group action</Label>
						<Switch id="cfg-groupaction" bind:checked={showGroupAction} />
					</div>
					<div class="flex items-center justify-between">
						<Label for="cfg-separators" class="text-xs font-medium">Separators</Label>
						<Switch id="cfg-separators" bind:checked={showSeparators} />
					</div>
					<div class="flex items-center justify-between">
						<Label for="cfg-loading" class="text-xs font-medium">Loading (skeleton)</Label>
						<Switch id="cfg-loading" bind:checked={loading} />
					</div>
					<div class="flex items-center justify-between">
						<Label for="cfg-appbar-border" class="text-xs font-medium">App bar border</Label>
						<Switch id="cfg-appbar-border" bind:checked={headerBorder} />
					</div>
				</div>

				<Separator />

				<!-- Code snippet -->
				<div class="space-y-2">
					<Label class="text-xs font-medium">Markup</Label>
					<pre
						class="bg-muted text-muted-foreground overflow-x-auto rounded-md p-2 text-[11px] leading-relaxed"><code
							>{codeSnippet}</code
						></pre>
				</div>

				<Button variant="outline" size="sm" class="w-full" onclick={reset}>
					<IconPlaceholder
						lucide="RotateCwIcon"
						tabler="IconRotateClockwise2"
						hugeicons="RefreshIcon"
						phosphor="ArrowClockwiseIcon"
						remixicon="RiRefreshLine"
					/>
					Reset
				</Button>
			</div>
		</div>
	{:else}
		<Button size="icon" class="rounded-full shadow-xl" onclick={() => (panelOpen = true)}>
			<IconPlaceholder
				lucide="Settings2Icon"
				tabler="IconSettings"
				hugeicons="Settings05Icon"
				phosphor="GearIcon"
				remixicon="RiSettingsLine"
			/>
		</Button>
	{/if}
</div>
