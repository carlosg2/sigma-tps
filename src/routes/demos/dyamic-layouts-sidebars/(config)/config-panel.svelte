<script lang="ts">
	import * as ToggleGroup from "$lib/components/ui/toggle-group/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import { Switch } from "$lib/components/ui/switch/index.js";
	import { Label } from "$lib/components/ui/label/index.js";
	import { Separator } from "$lib/components/ui/separator/index.js";
	import IconPlaceholder from "$lib/components/custom/icon-placeholder/icon-placeholder.svelte";
	import { presets, settingsIcon, type LayoutConfig } from "./layout-config.js";

	let {
		config,
		reset,
	}: { config: LayoutConfig; reset: () => void } = $props();

	let panelOpen = $state(true);

	const codeSnippet = $derived(
		`<Sidebar.Root variant="${config.variant}" collapsible="${config.collapsible}" side="${config.side}">`
	);

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	function set<K extends keyof LayoutConfig>(key: K, value: any) {
		config[key] = value;
	}
</script>

{#snippet section(title: string)}
	<p class="text-muted-foreground text-[10px] font-semibold tracking-wide uppercase">{title}</p>
{/snippet}

<div class="fixed right-4 bottom-4 z-50 flex flex-col items-end gap-2">
	{#if panelOpen}
		<div
			class="bg-popover text-popover-foreground w-80 max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl border shadow-xl"
		>
			<div class="flex items-center justify-between border-b px-4 py-3">
				<div class="flex items-center gap-2">
					<IconPlaceholder
						lucide={settingsIcon.lucide}
						tabler={settingsIcon.tabler}
						hugeicons={settingsIcon.hugeicons}
						phosphor={settingsIcon.phosphor}
						remixicon={settingsIcon.remixicon}
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

			<div class="max-h-[78vh] space-y-4 overflow-y-auto p-4">
				<!-- Presets -->
				<div class="space-y-2">
					<Label class="text-xs font-medium">Presets</Label>
					<div class="grid grid-cols-2 gap-2">
						{#each presets as p (p.id)}
							<Button
								variant={config.variant === p.variant && config.collapsible === p.collapsible
									? "default"
									: "outline"}
								size="sm"
								onclick={() => {
									config.variant = p.variant;
									config.collapsible = p.collapsible;
									config.open = true;
								}}
							>
								{p.label}
							</Button>
						{/each}
					</div>
				</div>

				<Separator />
				{@render section("Structure")}

				<div class="space-y-2">
					<Label class="text-xs font-medium">Variant</Label>
					<ToggleGroup.Root
						type="single"
						variant="outline"
						class="w-full"
						value={config.variant}
						onValueChange={(v) => v && set("variant", v)}
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
						value={config.collapsible}
						onValueChange={(v) => v && set("collapsible", v)}
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
							value={config.side}
							onValueChange={(v) => v && set("side", v)}
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
							value={config.width}
							onValueChange={(v) => v && set("width", v)}
						>
							<ToggleGroup.Item value="compact" class="flex-1 text-[10px]">S</ToggleGroup.Item>
							<ToggleGroup.Item value="default" class="flex-1 text-[10px]">M</ToggleGroup.Item>
							<ToggleGroup.Item value="comfortable" class="flex-1 text-[10px]">L</ToggleGroup.Item>
						</ToggleGroup.Root>
					</div>
				</div>

				<Separator />
				{@render section("Chrome")}

				<div class="space-y-2">
					<Label class="text-xs font-medium">App header</Label>
					<ToggleGroup.Root
						type="single"
						variant="outline"
						class="w-full"
						value={config.appHeader}
						onValueChange={(v) => v && set("appHeader", v)}
					>
						<ToggleGroup.Item value="inset" class="flex-1 text-[10px]">inset</ToggleGroup.Item>
						<ToggleGroup.Item value="global" class="flex-1 text-[10px]">global</ToggleGroup.Item>
					</ToggleGroup.Root>
				</div>

				<div class="space-y-2">
					<Label class="text-xs font-medium">Sidebar header</Label>
					<ToggleGroup.Root
						type="single"
						variant="outline"
						class="w-full"
						value={config.headerMode}
						onValueChange={(v) => v && set("headerMode", v)}
					>
						<ToggleGroup.Item value="none" class="flex-1 text-[10px]">none</ToggleGroup.Item>
						<ToggleGroup.Item value="brand" class="flex-1 text-[10px]">brand</ToggleGroup.Item>
						<ToggleGroup.Item value="workspace" class="flex-1 text-[10px]">team</ToggleGroup.Item>
						<ToggleGroup.Item value="version" class="flex-1 text-[10px]">ver</ToggleGroup.Item>
					</ToggleGroup.Root>
				</div>

				<div class="space-y-2">
					<Label class="text-xs font-medium">Footer</Label>
					<ToggleGroup.Root
						type="single"
						variant="outline"
						class="w-full"
						value={config.footerMode}
						onValueChange={(v) => v && set("footerMode", v)}
					>
						<ToggleGroup.Item value="none" class="flex-1 text-[10px]">none</ToggleGroup.Item>
						<ToggleGroup.Item value="user" class="flex-1 text-[10px]">user</ToggleGroup.Item>
						<ToggleGroup.Item value="account" class="flex-1 text-[10px]">menu</ToggleGroup.Item>
						<ToggleGroup.Item value="card" class="flex-1 text-[10px]">card</ToggleGroup.Item>
					</ToggleGroup.Root>
				</div>

				<div class="flex items-center justify-between">
					<Label for="cfg-search" class="text-xs font-medium">Search box</Label>
					<Switch id="cfg-search" bind:checked={config.showSearch} />
				</div>
				<div class="flex items-center justify-between">
					<Label for="cfg-breadcrumb" class="text-xs font-medium">Breadcrumb</Label>
					<Switch id="cfg-breadcrumb" bind:checked={config.showBreadcrumb} />
				</div>

				<Separator />
				{@render section("Navigation")}

				<div class="space-y-2">
					<Label class="text-xs font-medium">Nav style</Label>
					<ToggleGroup.Root
						type="single"
						variant="outline"
						class="w-full"
						value={config.navStyle}
						onValueChange={(v) => v && set("navStyle", v)}
					>
						<ToggleGroup.Item value="tree" class="flex-1 text-[10px]">tree</ToggleGroup.Item>
						<ToggleGroup.Item value="flat" class="flex-1 text-[10px]">flat</ToggleGroup.Item>
						<ToggleGroup.Item value="groups" class="flex-1 text-[10px]">groups</ToggleGroup.Item>
					</ToggleGroup.Root>
				</div>

				<div class="space-y-2">
					<Label class="text-xs font-medium">Menu action (tree)</Label>
					<ToggleGroup.Root
						type="single"
						variant="outline"
						class="w-full"
						value={config.menuAction}
						onValueChange={(v) => v && set("menuAction", v)}
					>
						<ToggleGroup.Item value="collapsible" class="flex-1 text-[10px]">collapse</ToggleGroup.Item>
						<ToggleGroup.Item value="dropdown" class="flex-1 text-[10px]">dropdown</ToggleGroup.Item>
						<ToggleGroup.Item value="none" class="flex-1 text-[10px]">none</ToggleGroup.Item>
					</ToggleGroup.Root>
				</div>

				<Separator />
				{@render section("Extras")}

				<div class="space-y-3">
					<div class="flex items-center justify-between">
						<Label for="cfg-open" class="text-xs font-medium">Open</Label>
						<Switch id="cfg-open" bind:checked={config.open} />
					</div>
					<div class="flex items-center justify-between">
						<Label for="cfg-dual" class="text-xs font-medium">Dual sidebar (right)</Label>
						<Switch id="cfg-dual" bind:checked={config.dualSidebar} />
					</div>
					<div class="flex items-center justify-between">
						<Label for="cfg-secondary" class="text-xs font-medium">Secondary group</Label>
						<Switch id="cfg-secondary" bind:checked={config.showSecondary} />
					</div>
					<div class="flex items-center justify-between">
						<Label for="cfg-rail" class="text-xs font-medium">Rail</Label>
						<Switch id="cfg-rail" bind:checked={config.showRail} />
					</div>
					<div class="flex items-center justify-between">
						<Label for="cfg-badges" class="text-xs font-medium">Menu badges</Label>
						<Switch id="cfg-badges" bind:checked={config.showBadges} />
					</div>
					<div class="flex items-center justify-between">
						<Label for="cfg-groupaction" class="text-xs font-medium">Group action</Label>
						<Switch id="cfg-groupaction" bind:checked={config.showGroupAction} />
					</div>
					<div class="flex items-center justify-between">
						<Label for="cfg-separators" class="text-xs font-medium">Separators</Label>
						<Switch id="cfg-separators" bind:checked={config.showSeparators} />
					</div>
					<div class="flex items-center justify-between">
						<Label for="cfg-loading" class="text-xs font-medium">Loading (skeleton)</Label>
						<Switch id="cfg-loading" bind:checked={config.loading} />
					</div>
					<div class="flex items-center justify-between">
						<Label for="cfg-appbar-border" class="text-xs font-medium">Header border</Label>
						<Switch id="cfg-appbar-border" bind:checked={config.headerBorder} />
					</div>
				</div>

				<Separator />

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
				lucide={settingsIcon.lucide}
				tabler={settingsIcon.tabler}
				hugeicons={settingsIcon.hugeicons}
				phosphor={settingsIcon.phosphor}
				remixicon={settingsIcon.remixicon}
			/>
		</Button>
	{/if}
</div>
