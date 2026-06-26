<script lang="ts">
	import * as Card from "$lib/components/ui/card/index.js";
	import IconPlaceholder from "$lib/components/custom/icon-placeholder/icon-placeholder.svelte";
	// Icon registry seeds — parsed by scripts/build-icons.ts to generate registry files.
	// lucide="CopyIcon" lucide="CircleAlertIcon" lucide="TrashIcon" lucide="ShareIcon" lucide="ShoppingBagIcon" lucide="MoreHorizontalIcon" lucide="Loader2Icon" lucide="ArrowLeftIcon" lucide="ArrowRightIcon" lucide="SearchIcon" lucide="SettingsIcon"
	// tabler="IconCopy" tabler="IconExclamationCircle" tabler="IconTrash" tabler="IconShare" tabler="IconShoppingBag" tabler="IconDots" tabler="IconLoader" tabler="IconPlus" tabler="IconMinus" tabler="IconArrowLeft" tabler="IconArrowRight" tabler="IconCheck" tabler="IconChevronDown" tabler="IconChevronRight" tabler="IconSearch" tabler="IconSettings"
	// hugeicons="Copy01Icon" hugeicons="AlertCircleIcon" hugeicons="Delete02Icon" hugeicons="Share03Icon" hugeicons="ShoppingBag01Icon" hugeicons="MoreHorizontalCircle01Icon" hugeicons="Loading03Icon" hugeicons="PlusSignIcon" hugeicons="MinusSignIcon" hugeicons="ArrowLeft02Icon" hugeicons="ArrowRight02Icon" hugeicons="Tick02Icon" hugeicons="ArrowDown01Icon" hugeicons="ArrowRight01Icon" hugeicons="Search01Icon" hugeicons="Settings01Icon"
	// phosphor="CopyIcon" phosphor="WarningCircleIcon" phosphor="TrashIcon" phosphor="ShareIcon" phosphor="BagIcon" phosphor="DotsThreeIcon" phosphor="SpinnerIcon" phosphor="PlusIcon" phosphor="MinusIcon" phosphor="ArrowLeftIcon" phosphor="ArrowRightIcon" phosphor="CheckIcon" phosphor="CaretDownIcon" phosphor="CaretRightIcon" phosphor="MagnifyingGlassIcon" phosphor="GearIcon"
	// remixicon="RiFileCopyLine" remixicon="RiErrorWarningLine" remixicon="RiDeleteBinLine" remixicon="RiShareLine" remixicon="RiShoppingBagLine" remixicon="RiMoreLine" remixicon="RiLoaderLine" remixicon="RiAddLine" remixicon="RiSubtractLine" remixicon="RiArrowLeftLine" remixicon="RiArrowRightLine" remixicon="RiCheckLine" remixicon="RiArrowDownSLine" remixicon="RiArrowRightSLine" remixicon="RiSearchLine" remixicon="RiSettingsLine"

	const PREVIEW_ICONS = [
		{
			lucide: "CopyIcon",
			tabler: "IconCopy",
			hugeicons: "Copy01Icon",
			phosphor: "CopyIcon",
			remixicon: "RiFileCopyLine",
		},
		{
			lucide: "CircleAlertIcon",
			tabler: "IconExclamationCircle",
			hugeicons: "AlertCircleIcon",
			phosphor: "WarningCircleIcon",
			remixicon: "RiErrorWarningLine",
		},
		{
			lucide: "TrashIcon",
			tabler: "IconTrash",
			hugeicons: "Delete02Icon",
			phosphor: "TrashIcon",
			remixicon: "RiDeleteBinLine",
		},
		{
			lucide: "ShareIcon",
			tabler: "IconShare",
			hugeicons: "Share03Icon",
			phosphor: "ShareIcon",
			remixicon: "RiShareLine",
		},
		{
			lucide: "ShoppingBagIcon",
			tabler: "IconShoppingBag",
			hugeicons: "ShoppingBag01Icon",
			phosphor: "BagIcon",
			remixicon: "RiShoppingBagLine",
		},
		{
			lucide: "MoreHorizontalIcon",
			tabler: "IconDots",
			hugeicons: "MoreHorizontalCircle01Icon",
			phosphor: "DotsThreeIcon",
			remixicon: "RiMoreLine",
		},
		{
			lucide: "Loader2Icon",
			tabler: "IconLoader",
			hugeicons: "Loading03Icon",
			phosphor: "SpinnerIcon",
			remixicon: "RiLoaderLine",
			class: "animate-spin",
		},
		{
			lucide: "PlusIcon",
			tabler: "IconPlus",
			hugeicons: "PlusSignIcon",
			phosphor: "PlusIcon",
			remixicon: "RiAddLine",
		},
		{
			lucide: "MinusIcon",
			tabler: "IconMinus",
			hugeicons: "MinusSignIcon",
			phosphor: "MinusIcon",
			remixicon: "RiSubtractLine",
		},
		{
			lucide: "ArrowLeftIcon",
			tabler: "IconArrowLeft",
			hugeicons: "ArrowLeft02Icon",
			phosphor: "ArrowLeftIcon",
			remixicon: "RiArrowLeftLine",
		},
		{
			lucide: "ArrowRightIcon",
			tabler: "IconArrowRight",
			hugeicons: "ArrowRight02Icon",
			phosphor: "ArrowRightIcon",
			remixicon: "RiArrowRightLine",
		},
		{
			lucide: "CheckIcon",
			tabler: "IconCheck",
			hugeicons: "Tick02Icon",
			phosphor: "CheckIcon",
			remixicon: "RiCheckLine",
		},
		{
			lucide: "ChevronDownIcon",
			tabler: "IconChevronDown",
			hugeicons: "ArrowDown01Icon",
			phosphor: "CaretDownIcon",
			remixicon: "RiArrowDownSLine",
		},
		{
			lucide: "ChevronRightIcon",
			tabler: "IconChevronRight",
			hugeicons: "ArrowRight01Icon",
			phosphor: "CaretRightIcon",
			remixicon: "RiArrowRightSLine",
		},
		{
			lucide: "SearchIcon",
			tabler: "IconSearch",
			hugeicons: "Search01Icon",
			phosphor: "MagnifyingGlassIcon",
			remixicon: "RiSearchLine",
		},
		{
			lucide: "SettingsIcon",
			tabler: "IconSettings",
			hugeicons: "Settings01Icon",
			phosphor: "GearIcon",
			remixicon: "RiSettingsLine",
		},
	] as const;
</script>

<Card.Root>
	<Card.Content>
		<div class="grid grid-cols-8 place-items-center gap-4">
			{#each PREVIEW_ICONS as icon, index (index)}
				<Card.Root
					class="ring-border flex size-8 items-center justify-center rounded-md p-0 ring *:[svg]:size-4"
				>
					<IconPlaceholder
						lucide={icon.lucide}
						tabler={icon.tabler}
						hugeicons={icon.hugeicons}
						phosphor={icon.phosphor}
						remixicon={icon.remixicon}
						class={'class' in icon ? icon.class : undefined}
					/>
				</Card.Root>
			{/each}
		</div>
	</Card.Content>
</Card.Root>
