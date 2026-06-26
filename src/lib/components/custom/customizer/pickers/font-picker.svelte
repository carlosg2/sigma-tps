<script lang="ts">
	import * as Picker from "../picker/index.js";
	import { FONTS, FONT_HEADING_OPTIONS } from "$lib/ds/index.js";
	import { useDesignSystem } from "$lib/ds/index.js";
	import { IsMobile } from "$lib/hooks/is-mobile.svelte.js";
	import LockButton from "./lock-button.svelte";
	import FontAxesSliders from "./font-axes-sliders.svelte";
	import FontFeaturesToggles from "./font-features-toggles.svelte";
	import { getFontAxes, getFontFeatures } from "$lib/ds/font-definitions.js";
	import type { PresetConfig } from "shadcn-svelte/preset";

	type FontPickerOption = {
		name: string;
		value: string;
		type: string;
		font: {
			style: {
				fontFamily: string;
			};
		} | null;
	};

	type Props = {
		submenu?: boolean;
		label: string;
		param: "font" | "fontHeading";
		fonts?: readonly FontPickerOption[];
	};

	let { submenu = false, label, param, fonts: fontsProp }: Props = $props();

	const designSystem = useDesignSystem();
	const isMobile = new IsMobile();

	const fontList = $derived(fontsProp ?? (param === "fontHeading" ? FONT_HEADING_OPTIONS : FONTS));

	const currentValue = $derived(param === "font" ? designSystem.font : designSystem.fontHeading);
	const currentFont = $derived(fontList.find((f) => f.value === currentValue));
	const currentBodyFont = $derived(FONTS.find((f) => f.value === designSystem.font));
	const inheritsBodyFont = $derived(param === "fontHeading" && currentValue === "inherit");
	const displayFontName = $derived(inheritsBodyFont ? currentBodyFont?.name : currentFont?.name);
	const inheritFontLabel = $derived(currentBodyFont ? currentBodyFont.name : "Body font");
	const previewFontFamily = $derived(
		currentFont?.font?.style?.fontFamily ?? currentBodyFont?.font?.style?.fontFamily
	);

	const groupedFonts = $derived.by(() => {
		const list = param === "fontHeading" ? fontList.filter((f) => f.value !== "inherit") : [...fontList];
		const byType: Record<string, FontPickerOption[]> = {};
		const typeOrder: string[] = [];
		for (const font of list) {
			if (!byType[font.type]) {
				byType[font.type] = [];
				typeOrder.push(font.type);
			}
			byType[font.type].push(font);
		}
		return typeOrder.map((type) => ({
			type,
			label: `${type.charAt(0).toUpperCase()}${type.slice(1)}`,
			items: byType[type],
		}));
	});

	const resolvedFontForAxes = $derived(
		param === "fontHeading" && designSystem.fontHeading === "inherit"
			? designSystem.font
			: param === "fontHeading"
				? designSystem.fontHeading
				: designSystem.font
	);

	const showAxes = $derived(getFontAxes(resolvedFontForAxes) !== undefined);
	const showFeatures = $derived.by(() => {
		const f = getFontFeatures(resolvedFontForAxes);
		return f !== undefined && f.length > 0;
	});
</script>

<div class="group/picker relative">
	<Picker.Root {submenu}>
		<Picker.Trigger {submenu}>
			<div class="flex flex-col justify-start text-left">
				<div class="text-muted-foreground text-xs">{label}</div>
				<div class="text-foreground text-sm font-medium">{displayFontName}</div>
			</div>
			<div
				class="text-foreground pointer-events-none absolute top-1/2 right-4 flex size-4 -translate-y-1/2 items-center justify-center text-base select-none"
				style="font-family: {previewFontFamily}"
			>
				Aa
			</div>
		</Picker.Trigger>
		<Picker.Content
			side={isMobile.current ? "top" : submenu ? "left" : "right"}
			align={isMobile.current ? "center" : "start"}
			class="max-h-96 overflow-y-auto md:w-72"
			sideOffset={submenu ? 5 : 20}
			{submenu}
		>
			<Picker.RadioGroup bind:value={designSystem[param]}>
				{#if param === "fontHeading"}
					<Picker.Group>
						<Picker.RadioItem value="inherit" closeOnSelect={isMobile.current}>
							{inheritFontLabel}
						</Picker.RadioItem>
					</Picker.Group>
					<Picker.Separator class="opacity-50" />
				{/if}
				{#each groupedFonts as group (group.type)}
					<Picker.Group>
						<Picker.Label>{group.label}</Picker.Label>
						{#each group.items as font (font.value)}
							<Picker.RadioItem value={font.value} closeOnSelect={isMobile.current}>
								{font.name}
							</Picker.RadioItem>
						{/each}
					</Picker.Group>
				{/each}
			</Picker.RadioGroup>
			{#if showAxes}
				<Picker.Separator class="opacity-50" />
				<FontAxesSliders {param} />
			{/if}
			{#if showFeatures}
				<Picker.Separator class="opacity-50" />
				<FontFeaturesToggles {param} />
			{/if}
		</Picker.Content>
	</Picker.Root>
	<LockButton prop={param} class="absolute top-1/2 right-8 -translate-y-1/2" />
</div>
