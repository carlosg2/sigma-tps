<script lang="ts">
	import { Switch } from "$lib/components/ui/switch/index.js";
	import { Label } from "$lib/components/ui/label/index.js";
	import { useDesignSystem } from "$lib/ds/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import type { FontFeatureDefinition } from "$lib/ds/font-definitions.js";

	type Props = {
		param: "font" | "fontHeading";
	};

	let { param }: Props = $props();

	const designSystem = useDesignSystem();

	const isHeading = $derived(param === "fontHeading");
	const features = $derived(
		isHeading ? designSystem.currentFontHeadingFeatures : designSystem.currentFontFeatures
	);
	const values = $derived(
		isHeading ? designSystem.fontHeadingFeatureValues : designSystem.fontFeatureValues
	);

	const hasNonDefaultValues = $derived.by(() => {
		if (!features || features.length === 0) return false;
		return features.some((f: FontFeatureDefinition) => values[f.tag] !== f.default);
	});

	function handleToggle(tag: string) {
		if (isHeading) {
			designSystem.toggleFontHeadingFeature(tag);
		} else {
			designSystem.toggleFontFeature(tag);
		}
	}

	function handleReset() {
		if (isHeading) {
			designSystem.resetFontHeadingFeatures();
		} else {
			designSystem.resetFontFeatures();
		}
	}
</script>

{#if features && features.length > 0}
	<div class="flex flex-col gap-2.5 px-3 py-2">
		<div class="flex items-center justify-between">
			<span class="text-muted-foreground text-xs font-medium">Características OpenType</span>
			{#if hasNonDefaultValues}
				<Button
					variant="ghost"
					size="sm"
					class="text-muted-foreground h-auto px-1 py-0 text-[10px]"
					onclick={() => handleReset()}
				>
					Restablecer
				</Button>
			{/if}
		</div>
		{#each features as feature (feature.tag)}
			<div class="flex items-center justify-between gap-2">
				<Label class="text-xs font-normal">
					<span>{feature.label}</span>
					<span class="text-muted-foreground/60 ml-1 font-mono text-[10px]">{feature.tag}</span>
				</Label>
				<Switch
					checked={values[feature.tag] ?? feature.default}
					onCheckedChange={() => handleToggle(feature.tag)}
					class="scale-75"
				/>
			</div>
		{/each}
	</div>
{/if}
