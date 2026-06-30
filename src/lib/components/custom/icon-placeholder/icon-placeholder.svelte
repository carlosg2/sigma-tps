<script lang="ts">
	import { useDesignSystem } from "$lib/ds/index.js";
	import SquareIcon from "@lucide/svelte/icons/square";
	import LucideIcon from "./lucide-icon.svelte";
	import TablerIcon from "./tabler-icon.svelte";
	import PhosphorIcon from "./phosphor-icon.svelte";
	import HugeiconsIcon from "./hugeicons-icon.svelte";
	import RemixiconIcon from "./remixicon-icon.svelte";
	import type { HugeIconsIconName } from "$lib/registry/icons/__hugeicons__/index.js";
	import type { LucideIconName } from "$lib/registry/icons/__lucide__/index.js";
	import type { TablerIconName } from "$lib/registry/icons/__tabler__/index.js";
	import type { PhosphorIconName } from "$lib/registry/icons/__phosphor__/index.js";
	import type { RemixIconIconName } from "$lib/registry/icons/__remixicon__/index.js";
	import type { SVGAttributes } from "svelte/elements";

	type SvgProps = SVGAttributes<SVGSVGElement>;

	type Props = {
		hugeicons: HugeIconsIconName;
		lucide: LucideIconName;
		tabler: TablerIconName;
		phosphor: PhosphorIconName;
		remixicon: RemixIconIconName;
		class?: string;
	};

	let {
		hugeicons,
		lucide,
		tabler,
		phosphor,
		remixicon,
		class: className,
		...restProps
	}: Props & Omit<SvgProps, "class"> = $props();

	const designSystem = (() => {
		try {
			return useDesignSystem();
		} catch {
			return null;
		}
	})();

	const iconLibrary = designSystem?.iconLibrary ?? "lucide";
</script>

{#snippet PlaceholderIcon()}
	<SquareIcon class={className} {...restProps as unknown as object} />
{/snippet}

{#if iconLibrary === "hugeicons"}
	<HugeiconsIcon icon={hugeicons} {className} {...restProps as unknown as object}>
		{#snippet placeholder()}
			{@render PlaceholderIcon()}
		{/snippet}
	</HugeiconsIcon>
{:else if iconLibrary === "lucide"}
	<LucideIcon icon={lucide} class={className} {...restProps as unknown as object}>
		{#snippet placeholder()}
			{@render PlaceholderIcon()}
		{/snippet}
	</LucideIcon>
{:else if iconLibrary === "tabler"}
	<TablerIcon icon={tabler} class={className} {...restProps as unknown as object}>
		{#snippet placeholder()}
			{@render PlaceholderIcon()}
		{/snippet}
	</TablerIcon>
{:else if iconLibrary === "phosphor"}
	<PhosphorIcon icon={phosphor} class={className} {...restProps as unknown as object}>
		{#snippet placeholder()}
			{@render PlaceholderIcon()}
		{/snippet}
	</PhosphorIcon>
{:else if iconLibrary === "remixicon"}
	<RemixiconIcon icon={remixicon} class={className} {...restProps as unknown as object}>
		{#snippet placeholder()}
			{@render PlaceholderIcon()}
		{/snippet}
	</RemixiconIcon>
{/if}
