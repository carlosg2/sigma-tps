<script lang="ts">
	import { Slider } from "$lib/components/ui/slider/index.js";
	import { Label } from "$lib/components/ui/label/index.js";
	import { useDesignSystem } from "$lib/ds/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import type { FontAxisDefinition } from "$lib/ds/font-definitions.js";

	type Props = {
		param: "font" | "fontHeading";
	};

	let { param }: Props = $props();

	const designSystem = useDesignSystem();

	const isHeading = $derived(param === "fontHeading");
	const axes = $derived(
		isHeading ? designSystem.currentFontHeadingAxes : designSystem.currentFontAxes
	);
	const axesEntries = $derived(axes ? Object.entries(axes) : []);
	const values = $derived(
		isHeading ? designSystem.fontHeadingAxesValues : designSystem.fontAxesValues
	);

	const hasNonDefaultValues = $derived.by(() => {
		if (!axes) return false;
		return Object.entries(axes).some(
			([key, axis]: [string, FontAxisDefinition]) => values[key] !== axis.default
		);
	});

	function handleAxisChange(axis: string, newValue: number) {
		if (isHeading) {
			designSystem.setFontHeadingAxis(axis, newValue);
		} else {
			designSystem.setFontAxis(axis, newValue);
		}
	}

	function handleReset() {
		if (isHeading) {
			designSystem.resetFontHeadingAxes();
		} else {
			designSystem.resetFontAxes();
		}
	}
</script>

{#if axesEntries.length > 0}
	<div class="flex flex-col gap-3 px-3 py-2">
		<div class="flex items-center justify-between">
			<span class="text-muted-foreground text-xs font-medium">Variable Axes</span>
			{#if hasNonDefaultValues}
				<Button
					variant="ghost"
					size="sm"
					class="text-muted-foreground h-auto px-1 py-0 text-[10px]"
					onclick={() => handleReset()}
				>
					Reset
				</Button>
			{/if}
		</div>
		{#each axesEntries as [axisKey, axis] (axisKey)}
			<div class="grid gap-1.5">
				<div class="flex items-center justify-between">
					<Label class="text-xs">{axis.label}</Label>
					<span class="text-muted-foreground w-12 text-end text-[11px] tabular-nums">
						{values[axisKey]?.toFixed(axis.step < 1 ? 1 : 0) ?? axis.default}
					</span>
				</div>
				<Slider
					type="single"
					min={axis.min}
					max={axis.max}
					step={axis.step}
					value={values[axisKey] ?? axis.default}
					onValueChange={(v: number) => handleAxisChange(axisKey, v)}
					class="**:[[role=slider]]:h-3 **:[[role=slider]]:w-3"
				/>
			</div>
		{/each}
	</div>
{/if}
