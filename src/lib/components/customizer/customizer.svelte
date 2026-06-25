<script lang="ts">
	import { buttonVariants } from "$lib/components/ui/button/index.js";
	import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js";
	import StylePicker from "./pickers/style-picker.svelte";
	import BaseColorPicker from "./pickers/base-color-picker.svelte";
	import ThemePicker from "./pickers/theme-picker.svelte";
	import ChartColorPicker from "./pickers/chart-color-picker.svelte";
	import IconLibraryPicker from "./pickers/icon-library-picker.svelte";
	import FontPicker from "./pickers/font-picker.svelte";
	import FontScalePicker from "./pickers/font-scale-picker.svelte";
	import RadiusPicker from "./pickers/radius-picker.svelte";
	import MenuColorPicker from "./pickers/menu-color-picker.svelte";
	import MenuAccentPicker from "./pickers/menu-accent-picker.svelte";
	import RandomButton from "./pickers/random-button.svelte";
	import ResetButton from "./pickers/reset-button.svelte";
	import { cn } from "$lib/utils.js";
	import { setMode, mode } from "mode-watcher";
	import SlidersHorizontalIcon from "@lucide/svelte/icons/sliders-horizontal";
	import UndoIcon from "@lucide/svelte/icons/undo-2";
	import RedoIcon from "@lucide/svelte/icons/redo-2";
	import { useDesignSystem } from "$lib/ds/index.js";
	import { useIsMac } from "$lib/hooks/use-is-mac.svelte.js";
	import MoonIcon from "@lucide/svelte/icons/moon";
	import SunIcon from "@lucide/svelte/icons/sun";

	const isMac = useIsMac();
	const designSystem = useDesignSystem();
</script>

<DropdownMenu.Root>
	<DropdownMenu.Trigger
		class={cn(buttonVariants({ variant: "ghost", size: "icon" }), "size-8")}
		title="Customize"
	>
		<SlidersHorizontalIcon class="size-4" />
		<span class="sr-only">Customizer</span>
	</DropdownMenu.Trigger>

	<DropdownMenu.Content align="end" class="dark min-w-64 p-0" preventScroll={false}>
		<DropdownMenu.Group>
			<StylePicker submenu />
			<BaseColorPicker submenu />
			<ThemePicker submenu />
			<ChartColorPicker submenu />
			<IconLibraryPicker submenu />
			<FontPicker submenu label="Heading" param="fontHeading" />
			<FontPicker submenu label="Font" param="font" />
			<FontScalePicker submenu />
			<RadiusPicker submenu />
			<MenuColorPicker submenu />
			<MenuAccentPicker submenu />
			<DropdownMenu.Separator />
			<RandomButton submenu />
			<ResetButton submenu />
		</DropdownMenu.Group>

		<DropdownMenu.Separator />

		<DropdownMenu.Group>
			<DropdownMenu.Item
				closeOnSelect={false}
				onclick={() => setMode(mode.current === "dark" ? "light" : "dark")}
				class="justify-between"
			>
				<div class="flex flex-col justify-start text-left">
					<div class="text-muted-foreground text-xs">Mode</div>
					<div class="text-foreground text-sm font-medium">
						Switch to {mode.current === "dark" ? "Light" : "Dark"} Mode
					</div>
				</div>
				{#if mode.current === "dark"}
					<SunIcon class="size-4 md:hidden" />
				{:else}
					<MoonIcon class="size-4 md:hidden" />
				{/if}
				<kbd class="bg-foreground/10 text-foreground hidden rounded px-1.5 py-0.5 text-xs md:flex">D</kbd>
			</DropdownMenu.Item>
		</DropdownMenu.Group>

		<DropdownMenu.Separator />

		<DropdownMenu.Group>
			<DropdownMenu.Item
				closeOnSelect={false}
				onclick={() => designSystem.undo()}
				disabled={!designSystem.canUndo}
				class="justify-between"
			>
				<div class="flex items-center gap-2">
					<UndoIcon class="size-4" />
					<span>Undo</span>
				</div>
				<div class="hidden items-center gap-1 md:flex">
					<kbd class="bg-foreground/10 text-foreground rounded px-1.5 py-0.5 text-xs">{isMac.cmdOrCtrl}</kbd>
					<kbd class="bg-foreground/10 text-foreground rounded px-1.5 py-0.5 text-xs">Z</kbd>
				</div>
			</DropdownMenu.Item>
			<DropdownMenu.Item
				closeOnSelect={false}
				onclick={() => designSystem.redo()}
				disabled={!designSystem.canRedo}
				class="justify-between"
			>
				<div class="flex items-center gap-2">
					<RedoIcon class="size-4" />
					<span>Redo</span>
				</div>
				<div class="hidden items-center gap-1 md:flex">
					<kbd class="bg-foreground/10 text-foreground rounded px-1.5 py-0.5 text-xs">⇧</kbd>
					<kbd class="bg-foreground/10 text-foreground rounded px-1.5 py-0.5 text-xs">{isMac.cmdOrCtrl}</kbd>
					<kbd class="bg-foreground/10 text-foreground rounded px-1.5 py-0.5 text-xs">Z</kbd>
				</div>
			</DropdownMenu.Item>
		</DropdownMenu.Group>
	</DropdownMenu.Content>
</DropdownMenu.Root>
