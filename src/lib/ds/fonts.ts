import { type RegistryItem } from "shadcn-svelte/schema";

import { FONT_DEFINITIONS, type FontDefinition, type FontName } from "./font-definitions.js";

function createFontItem(definition: FontDefinition, role: "body" | "heading") {
	return {
		name: role === "body" ? `font-${definition.name}` : `font-heading-${definition.name}`,
		title: role === "body" ? definition.title : `${definition.title} (Heading)`,
		type: "registry:font",
		font: {
			family: definition.family,
			provider: definition.provider,
			variable: role === "body" ? definition.registryVariable : "--font-heading",
			...(definition.weight ? { weight: [...definition.weight] } : {}),
			subsets: [...definition.subsets],
			import: definition.import,
			dependency: definition.dependency,
		},
	} satisfies RegistryItem;
}

export const bodyFonts = FONT_DEFINITIONS.map((definition) =>
	createFontItem(definition, "body")
) satisfies RegistryItem[];

export const headingFonts = FONT_DEFINITIONS.map((definition) =>
	createFontItem(definition, "heading")
) satisfies RegistryItem[];

export const fonts = [...bodyFonts, ...headingFonts] satisfies RegistryItem[];


function createFontOption(name: FontName) {
	const definition = FONT_DEFINITIONS.find((font) => font.name === name);

	if (!definition) {
		throw new Error(`Unknown font definition: ${name}`);
	}

	return {
		name: definition.title,
		value: definition.name,
		font: {
			style: {
				fontFamily: definition.family,
			},
		},
		type: definition.type,
	} as const;
}

export const FONTS = [
	createFontOption("geist"),
	createFontOption("inter"),
	createFontOption("noto-sans"),
	createFontOption("nunito-sans"),
	createFontOption("figtree"),
	createFontOption("roboto"),
	createFontOption("raleway"),
	createFontOption("dm-sans"),
	createFontOption("public-sans"),
	createFontOption("outfit"),
	createFontOption("oxanium"),
	createFontOption("manrope"),
	createFontOption("space-grotesk"),
	createFontOption("montserrat"),
	createFontOption("ibm-plex-sans"),
	createFontOption("source-sans-3"),
	createFontOption("instrument-sans"),
	createFontOption("geist-mono"),
	createFontOption("jetbrains-mono"),
	createFontOption("noto-serif"),
	createFontOption("roboto-slab"),
	createFontOption("merriweather"),
	createFontOption("lora"),
	createFontOption("playfair-display"),
	createFontOption("eb-garamond"),
	createFontOption("instrument-serif"),
] as const;

export type Font = (typeof FONTS)[number];

export const FONT_HEADING_OPTIONS = [
	{
		name: "Inherit",
		value: "inherit",
		font: null,
		type: "default",
	},
	...FONTS,
] as const;

export type FontHeadingOption = (typeof FONT_HEADING_OPTIONS)[number];
