<script lang="ts">
	import * as Picker from "../picker/index.js";
	import { useDesignSystem } from "$lib/ds/index.js";
	import { IsMobile } from "$lib/hooks/is-mobile.svelte.js";
	import LockButton from "./lock-button.svelte";
	import { mode } from "mode-watcher";
	import { BASE_THEMES, THEMES, getThemesForBaseColor, type BaseTheme, type Theme } from "$lib/ds/index.js";
	import { PRESET_CHART_COLORS } from "shadcn-svelte/preset";

	type ChartColorName = (typeof PRESET_CHART_COLORS)[number];
	type Props = { submenu?: boolean };
	let { submenu = false }: Props = $props();

	const designSystem = useDesignSystem();
	const isMobile = new IsMobile();

	const availableChartColors = $derived(getThemesForBaseColor(designSystem.baseColor));

	const currentChartColor = $derived(
		availableChartColors.find((t) => t.name === designSystem.chartColor) ?? availableChartColors[0]
	);

	$effect(() => {
		if (!availableChartColors.some((t) => t.name === designSystem.chartColor) && availableChartColors[0]) {
			designSystem.chartColor = availableChartColors[0].name as ChartColorName;
		}
	});

	function isBaseColor(theme: Theme): theme is BaseTheme {
		return BASE_THEMES.some((bc) => bc.name === theme.name);
	}

	function getSwatchColor(theme: Theme) {
		const m = (mode.current ?? "light") as "light" | "dark";
		const vars = theme.cssVars[m] as Record<string, string>;
		return isBaseColor(theme) ? vars["muted-foreground"] : vars["primary"];
	}
</script>

<div class="group/picker relative">
	<Picker.Root {submenu}>
		<Picker.Trigger {submenu}>
			<div class="flex flex-col justify-start text-left">
				<div class="text-muted-foreground text-xs">Color de gráficas</div>
				<div class="text-foreground text-sm font-medium">{currentChartColor?.title}</div>
			</div>
			{#if mode.current && currentChartColor}
				<div
					style="--color: {getSwatchColor(currentChartColor)};"
					class="pointer-events-none absolute top-1/2 right-4 size-4 -translate-y-1/2 rounded-full bg-(--color) select-none"
				></div>
			{/if}
		</Picker.Trigger>
		<Picker.Content
			side={isMobile.current ? "top" : submenu ? "left" : "right"}
			align={isMobile.current ? "center" : "start"}
			class="max-h-92 overflow-y-auto"
			sideOffset={submenu ? 5 : 20}
			{submenu}
		>
			<Picker.RadioGroup bind:value={designSystem.chartColor}>
				<Picker.Group>
					{#each availableChartColors.filter((t) => BASE_THEMES.some((bc) => bc.name === t.name)) as theme (theme.name)}
						<Picker.RadioItem value={theme.name} closeOnSelect={false}>{theme.title}</Picker.RadioItem>
					{/each}
				</Picker.Group>
				<Picker.Separator />
				<Picker.Group>
					{#each availableChartColors.filter((t) => !BASE_THEMES.some((bc) => bc.name === t.name)) as theme (theme.name)}
						<Picker.RadioItem value={theme.name} closeOnSelect={false}>{theme.title}</Picker.RadioItem>
					{/each}
				</Picker.Group>
			</Picker.RadioGroup>
		</Picker.Content>
	</Picker.Root>
	<LockButton prop="chartColor" class="absolute top-1/2 right-10 -translate-y-1/2" />
</div>
