<script lang="ts">
	import { page } from "$app/state";
	import * as Sidebar from "$lib/components/ui/sidebar/index.js";
	import * as Breadcrumb from "$lib/components/ui/breadcrumb/index.js";
	import { Separator } from "$lib/components/ui/separator/index.js";
	import { cn } from "$lib/utils.js";
	import AppSidebar from "./app-sidebar.svelte";
	import SidebarRight from "./sidebar-right.svelte";
	import StatusChip from "./status-chip.svelte";
	import ConfigPanel from "./config-panel.svelte";
	import { BASE, canonicals, defaultConfig, WIDTHS } from "./layout-config.js";

	let { children } = $props();

	let config = $state(defaultConfig());

	const activeId = $derived(page.url.pathname.split("/").filter(Boolean).pop());
	const activeLabel = $derived(canonicals.find((c) => c.id === activeId)?.label ?? "Layout");

	const providerStyle = $derived(
		`--sidebar-width: ${WIDTHS[config.width]}; --sidebar-width-mobile: 18rem;` +
			(config.appHeader === "global" ? " --header-height: 4rem;" : "")
	);

	function reset() {
		Object.assign(config, defaultConfig());
	}
</script>

<!-- Contenido del app bar (trigger + breadcrumb/título + estado + switcher) -->
{#snippet appBarInner()}
	<Sidebar.Trigger class="-ml-1" />
	<Separator orientation="vertical" class="mr-1 h-4!" />
	{#if config.showBreadcrumb}
		<Breadcrumb.Root class="hidden sm:block">
			<Breadcrumb.List>
				<Breadcrumb.Item class="hidden md:block">
					<Breadcrumb.Link href={BASE}>Layout Lab</Breadcrumb.Link>
				</Breadcrumb.Item>
				<Breadcrumb.Separator class="hidden md:block" />
				<Breadcrumb.Item>
					<Breadcrumb.Page>{activeLabel}</Breadcrumb.Page>
				</Breadcrumb.Item>
			</Breadcrumb.List>
		</Breadcrumb.Root>
	{:else}
		<div class="flex min-w-0 flex-col">
			<h1 class="truncate text-sm font-semibold">{activeLabel}</h1>
			<p class="text-muted-foreground truncate text-xs">
				{config.variant} · {config.collapsible} · {config.side}
			</p>
		</div>
	{/if}

	<StatusChip class="ml-3 hidden lg:flex" />

	<nav class="bg-muted text-muted-foreground ml-auto inline-flex items-center rounded-lg p-0.5">
		{#each canonicals as c (c.id)}
			<a
				href={c.href}
				class={cn(
					"rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
					activeId === c.id ? "bg-background text-foreground shadow-sm" : "hover:text-foreground"
				)}
			>
				{c.label}
			</a>
		{/each}
	</nav>
{/snippet}

{#if config.appHeader === "global"}
	<Sidebar.Provider bind:open={config.open} style={providerStyle} class="flex flex-col">
		<!-- Header global: ancho completo por encima del sidebar (sidebar-16) -->
		<header
			class={cn(
				"bg-background/85 sticky top-0 z-50 flex h-(--header-height) w-full items-center gap-2 px-4 backdrop-blur",
				config.headerBorder && "border-b"
			)}
		>
			{@render appBarInner()}
		</header>
		<div class="flex flex-1">
			<AppSidebar
				{config}
				{activeId}
				rootClass="top-(--header-height) h-[calc(100svh-var(--header-height))]!"
			/>
			<Sidebar.Inset>
				{@render children()}
			</Sidebar.Inset>
			{#if config.dualSidebar}
				<SidebarRight />
			{/if}
		</div>
	</Sidebar.Provider>
{:else}
	<Sidebar.Provider bind:open={config.open} style={providerStyle}>
		<AppSidebar {config} {activeId} />
		<Sidebar.Inset>
			<!-- Header inset: dentro del Sidebar.Inset -->
			<header
				class={cn(
					"bg-background/80 sticky top-0 z-20 flex h-16 shrink-0 items-center gap-2 px-4 backdrop-blur",
					config.headerBorder && "border-b",
					config.variant === "inset" && "md:rounded-t-xl"
				)}
			>
				{@render appBarInner()}
			</header>
			{@render children()}
		</Sidebar.Inset>
		{#if config.dualSidebar}
			<SidebarRight />
		{/if}
	</Sidebar.Provider>
{/if}

<ConfigPanel {config} {reset} />
