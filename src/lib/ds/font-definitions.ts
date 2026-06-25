export type FontAxisDefinition = {
	default: number;
	min: number;
	max: number;
	step: number;
	label: string;
	description?: string;
};

/**
 * Official descriptions from the Google Fonts Axis Registry
 * https://github.com/googlefonts/axisregistry
 * Keyed by the 4-character OpenType axis tag.
 */
export const REGISTERED_AXES_DESCRIPTIONS: Record<string, string> = {
	wght: "Adjust the style from lighter to bolder in typographic color, by varying stroke weights, spacing and kerning, and other aspects of the type. This typically changes overall width, and so may be used in conjunction with Width and Grade axes.",
	opsz: "Adapt the style to specific text sizes. At smaller sizes, letters typically become optimized for more legibility. At larger sizes, optimized for headlines, with more extreme weights and widths. In CSS this axis is activated automatically when it is available.",
	wdth: "Adjust the style from narrower to wider, by varying the proportions of counters, strokes, spacing and kerning, and other aspects of the type. This typically changes the typographic color in a subtle way, and so may be used in conjunction with Weight and Grade axes.",
	slnt: "Adjust the style from upright to slanted. Negative values produce right-leaning forms, also known to typographers as an 'oblique' style. Positive values produce left-leaning forms, also called a 'backslanted' or 'reverse oblique' style.",
	ital: "Adjust the style from roman to italic. A value of 0 is roman, a value of 1 is full italic, and intermediate values are increasingly slanted.",
	GRAD: "Adjust the visual weight or grade of the typeface without changing the space it occupies. Useful for fine-tuning weight across different screen densities or rendering conditions.",
	MONO: "Adjust the spacing of characters from proportional to monospaced. A value of 0 is proportional, a value of 1 is fully monospaced.",
	CASL: "Adjust the style from a more geometric form to a more casual, handwritten form.",
	CRSV: "Control whether cursive forms are used. 0 suppresses cursive, 0.5 auto, 1 forces cursive.",
	SOFT: "Adjust the overall softness of the letterforms, from angular to rounded.",
};

export type FontFeatureDefinition = {
	tag: string;
	label: string;
	default: boolean;
};

export type FontDefinition = {
	name: string;
	title: string;
	type: "sans" | "mono" | "serif";
	family: string;
	registryVariable: "--font-sans" | "--font-mono" | "--font-serif";
	previewVariable: string;
	provider: "google";
	import: string;
	dependency: string;
	subsets: readonly string[];
	weight?: readonly string[];
	axes?: Record<string, FontAxisDefinition>;
	features?: readonly FontFeatureDefinition[];
};

export const FONT_DEFINITIONS = [
	{
		name: "geist",
		title: "Geist",
		type: "sans",
		family: "'Geist Variable', sans-serif",
		registryVariable: "--font-sans",
		previewVariable: "--font-geist-sans",
		provider: "google",
		import: "Geist",
		dependency: "@fontsource-variable/geist",
		subsets: ["latin"],
		axes: {
			wght: { default: 400, min: 100, max: 900, step: 1, label: "Weight" },
		},
		features: [
			{ tag: "tnum", label: "Tabular Numbers", default: false },
			{ tag: "pnum", label: "Proportional Numbers", default: false },
			{ tag: "frac", label: "Fractions", default: false },
			{ tag: "case", label: "Case-Sensitive", default: false },
			{ tag: "dlig", label: "Discretionary Ligatures", default: false },
			{ tag: "subs", label: "Subscript", default: false },
			{ tag: "sups", label: "Superscript", default: false },
			{ tag: "ordn", label: "Ordinals", default: false },
			{ tag: "ss01", label: "No tail a", default: false },
			{ tag: "ss02", label: "Alternate a", default: false },
			{ tag: "ss03", label: "Alternate l", default: false },
			{ tag: "ss04", label: "Alternate R", default: false },
			{ tag: "ss05", label: "Alternate I", default: false },
			{ tag: "ss06", label: "Alternate G", default: false },
			{ tag: "ss07", label: "Alternate arrows", default: false },
			{ tag: "ss08", label: "Rounded dot", default: false },
			{ tag: "ss09", label: "Alternate numbers", default: false },
			{ tag: "ss10", label: "Alternative enclosing shapes", default: false },
			{ tag: "ss11", label: "Contextual brand styles", default: false },
		],
	},
	{
		name: "inter",
		title: "Inter",
		type: "sans",
		family: "'Inter Variable', sans-serif",
		registryVariable: "--font-sans",
		previewVariable: "--font-inter",
		provider: "google",
		import: "Inter",
		dependency: "@fontsource-variable/inter",
		subsets: ["latin"],
		axes: {
			wght: { default: 400, min: 100, max: 900, step: 1, label: "Weight" },
			opsz: { default: 14, min: 14, max: 32, step: 0.1, label: "Optical Size" },
		},
		features: [
			{ tag: "tnum", label: "Tabular Numbers", default: false },
			{ tag: "zero", label: "Slashed Zero", default: false },
			{ tag: "case", label: "Case-Sensitive", default: false },
			{ tag: "frac", label: "Fractions", default: false },
			{ tag: "dlig", label: "Discretionary Ligatures", default: false },
			{ tag: "cv01", label: "Alternate one", default: false },
			{ tag: "cv02", label: "Open four", default: false },
			{ tag: "cv03", label: "Open six", default: false },
			{ tag: "cv04", label: "Open nine", default: false },
			{ tag: "cv05", label: "Lowercase l with tail", default: false },
			{ tag: "cv06", label: "Simplified u", default: false },
			{ tag: "cv07", label: "Alternate sharp s", default: false },
			{ tag: "cv08", label: "Serifed I", default: false },
			{ tag: "cv09", label: "Flat-top three", default: false },
			{ tag: "cv10", label: "Capital G with spur", default: false },
			{ tag: "cv11", label: "Single-story a", default: false },
			{ tag: "cv12", label: "Compact f", default: false },
			{ tag: "cv13", label: "Compact t", default: false },
			{ tag: "ss01", label: "Open digits", default: false },
			{ tag: "ss02", label: "Disambiguation", default: false },
			{ tag: "ss03", label: "Round quotes & commas", default: false },
			{ tag: "ss04", label: "Disambiguation (no slashed zero)", default: false },
		],
	},
	{
		name: "noto-sans",
		title: "Noto Sans",
		type: "sans",
		family: "'Noto Sans Variable', sans-serif",
		registryVariable: "--font-sans",
		previewVariable: "--font-noto-sans",
		provider: "google",
		import: "Noto_Sans",
		dependency: "@fontsource-variable/noto-sans",
		subsets: ["latin"],
		axes: {
			wght: { default: 400, min: 100, max: 900, step: 1, label: "Weight" },
			wdth: { default: 100, min: 62.5, max: 100, step: 0.1, label: "Width" },
		},
		features: [
			{ tag: "tnum", label: "Tabular Numbers", default: false },
			{ tag: "zero", label: "Slashed Zero", default: false },
			{ tag: "smcp", label: "Small Caps", default: false },
			{ tag: "frac", label: "Fractions", default: false },
			{ tag: "case", label: "Case-Sensitive", default: false },
			{ tag: "onum", label: "Oldstyle Numbers", default: false },
		],
	},
	{
		name: "nunito-sans",
		title: "Nunito Sans",
		type: "sans",
		family: "'Nunito Sans Variable', sans-serif",
		registryVariable: "--font-sans",
		previewVariable: "--font-nunito-sans",
		provider: "google",
		import: "Nunito_Sans",
		dependency: "@fontsource-variable/nunito-sans",
		subsets: ["latin"],
		axes: {
			wght: { default: 400, min: 200, max: 1000, step: 1, label: "Weight" },
			opsz: { default: 12, min: 6, max: 12, step: 0.1, label: "Optical Size" },
			wdth: { default: 100, min: 75, max: 125, step: 0.1, label: "Width" },
			YTLC: { default: 500, min: 440, max: 540, step: 1, label: "Lowercase Height" },
		},
	},
	{
		name: "figtree",
		title: "Figtree",
		type: "sans",
		family: "'Figtree Variable', sans-serif",
		registryVariable: "--font-sans",
		previewVariable: "--font-figtree",
		provider: "google",
		import: "Figtree",
		dependency: "@fontsource-variable/figtree",
		subsets: ["latin"],
		axes: {
			wght: { default: 400, min: 300, max: 900, step: 1, label: "Weight" },
		},
		features: [
			{ tag: "tnum", label: "Tabular Numbers", default: false },
			{ tag: "pnum", label: "Proportional Numbers", default: false },
			{ tag: "frac", label: "Fractions", default: false },
		],
	},
	{
		name: "roboto",
		title: "Roboto",
		type: "sans",
		family: "'Roboto Variable', sans-serif",
		registryVariable: "--font-sans",
		previewVariable: "--font-roboto",
		provider: "google",
		import: "Roboto",
		dependency: "@fontsource-variable/roboto",
		subsets: ["latin"],
		axes: {
			wght: { default: 400, min: 100, max: 900, step: 1, label: "Weight" },
			wdth: { default: 100, min: 75, max: 100, step: 0.1, label: "Width" },
		},
		features: [
			{ tag: "tnum", label: "Tabular Numbers", default: false },
			{ tag: "smcp", label: "Small Caps", default: false },
			{ tag: "frac", label: "Fractions", default: false },
			{ tag: "onum", label: "Oldstyle Numbers", default: false },
		],
	},
	{
		name: "raleway",
		title: "Raleway",
		type: "sans",
		family: "'Raleway Variable', sans-serif",
		registryVariable: "--font-sans",
		previewVariable: "--font-raleway",
		provider: "google",
		import: "Raleway",
		dependency: "@fontsource-variable/raleway",
		subsets: ["latin"],
		axes: {
			wght: { default: 400, min: 100, max: 900, step: 1, label: "Weight" },
		},
		features: [
			{ tag: "smcp", label: "Small Caps", default: false },
			{ tag: "dlig", label: "Discretionary Ligatures", default: false },
			{ tag: "salt", label: "Stylistic Alternates", default: false },
			{ tag: "frac", label: "Fractions", default: false },
		],
	},
	{
		name: "dm-sans",
		title: "DM Sans",
		type: "sans",
		family: "'DM Sans Variable', sans-serif",
		registryVariable: "--font-sans",
		previewVariable: "--font-dm-sans",
		provider: "google",
		import: "DM_Sans",
		dependency: "@fontsource-variable/dm-sans",
		subsets: ["latin"],
		axes: {
			wght: { default: 400, min: 100, max: 1000, step: 1, label: "Weight" },
			opsz: { default: 14, min: 9, max: 40, step: 0.1, label: "Optical Size" },
		},
	},
	{
		name: "public-sans",
		title: "Public Sans",
		type: "sans",
		family: "'Public Sans Variable', sans-serif",
		registryVariable: "--font-sans",
		previewVariable: "--font-public-sans",
		provider: "google",
		import: "Public_Sans",
		dependency: "@fontsource-variable/public-sans",
		subsets: ["latin"],
		axes: {
			wght: { default: 400, min: 100, max: 900, step: 1, label: "Weight" },
		},
		features: [
			{ tag: "tnum", label: "Tabular Numbers", default: false },
			{ tag: "pnum", label: "Proportional Numbers", default: false },
			{ tag: "frac", label: "Fractions", default: false },
		],
	},
	{
		name: "outfit",
		title: "Outfit",
		type: "sans",
		family: "'Outfit Variable', sans-serif",
		registryVariable: "--font-sans",
		previewVariable: "--font-outfit",
		provider: "google",
		import: "Outfit",
		dependency: "@fontsource-variable/outfit",
		subsets: ["latin"],
		axes: {
			wght: { default: 400, min: 100, max: 900, step: 1, label: "Weight" },
		},
		features: [
			{ tag: "tnum", label: "Tabular Numbers", default: false },
			{ tag: "pnum", label: "Proportional Numbers", default: false },
			{ tag: "frac", label: "Fractions", default: false },
		],
	},
	{
		name: "oxanium",
		title: "Oxanium",
		type: "sans",
		family: "'Oxanium Variable', sans-serif",
		registryVariable: "--font-sans",
		previewVariable: "--font-oxanium",
		provider: "google",
		import: "Oxanium",
		dependency: "@fontsource-variable/oxanium",
		subsets: ["latin"],
		axes: {
			wght: { default: 400, min: 200, max: 800, step: 1, label: "Weight" },
		},
	},
	{
		name: "manrope",
		title: "Manrope",
		type: "sans",
		family: "'Manrope Variable', sans-serif",
		registryVariable: "--font-sans",
		previewVariable: "--font-manrope",
		provider: "google",
		import: "Manrope",
		dependency: "@fontsource-variable/manrope",
		subsets: ["latin"],
		axes: {
			wght: { default: 400, min: 200, max: 800, step: 1, label: "Weight" },
		},
		features: [
			{ tag: "tnum", label: "Tabular Numbers", default: false },
			{ tag: "pnum", label: "Proportional Numbers", default: false },
			{ tag: "frac", label: "Fractions", default: false },
		],
	},
	{
		name: "space-grotesk",
		title: "Space Grotesk",
		type: "sans",
		family: "'Space Grotesk Variable', sans-serif",
		registryVariable: "--font-sans",
		previewVariable: "--font-space-grotesk",
		provider: "google",
		import: "Space_Grotesk",
		dependency: "@fontsource-variable/space-grotesk",
		subsets: ["latin"],
		axes: {
			wght: { default: 400, min: 300, max: 700, step: 1, label: "Weight" },
		},
		features: [
			{ tag: "tnum", label: "Tabular Numbers", default: false },
			{ tag: "pnum", label: "Proportional Numbers", default: false },
			{ tag: "zero", label: "Slashed Zero", default: false },
			{ tag: "frac", label: "Fractions", default: false },
			{ tag: "salt", label: "Stylistic Alternates", default: false },
			{ tag: "ss01", label: "Stylistic Set 1", default: false },
			{ tag: "ss02", label: "Stylistic Set 2", default: false },
			{ tag: "ss03", label: "Stylistic Set 3", default: false },
			{ tag: "ss04", label: "Stylistic Set 4", default: false },
		],
	},
	{
		name: "montserrat",
		title: "Montserrat",
		type: "sans",
		family: "'Montserrat Variable', sans-serif",
		registryVariable: "--font-sans",
		previewVariable: "--font-montserrat",
		provider: "google",
		import: "Montserrat",
		dependency: "@fontsource-variable/montserrat",
		subsets: ["latin"],
		axes: {
			wght: { default: 400, min: 100, max: 900, step: 1, label: "Weight" },
		},
		features: [
			{ tag: "tnum", label: "Tabular Numbers", default: false },
			{ tag: "onum", label: "Oldstyle Numbers", default: false },
		],
	},
	{
		name: "ibm-plex-sans",
		title: "IBM Plex Sans",
		type: "sans",
		family: "'IBM Plex Sans Variable', sans-serif",
		registryVariable: "--font-sans",
		previewVariable: "--font-ibm-plex-sans",
		provider: "google",
		import: "IBM_Plex_Sans",
		dependency: "@fontsource-variable/ibm-plex-sans",
		subsets: ["latin"],
		axes: {
			wght: { default: 400, min: 100, max: 700, step: 1, label: "Weight" },
			wdth: { default: 100, min: 75, max: 100, step: 0.1, label: "Width" },
		},
		features: [
			{ tag: "zero", label: "Slashed Zero", default: false },
			{ tag: "frac", label: "Fractions", default: false },
			{ tag: "onum", label: "Oldstyle Numbers", default: false },
			{ tag: "salt", label: "Stylistic Alternates", default: false },
			{ tag: "ss01", label: "Simple a", default: false },
			{ tag: "ss02", label: "Simple g", default: false },
			{ tag: "ss03", label: "Slashed zero", default: false },
			{ tag: "ss04", label: "Dotted zero", default: false },
			{ tag: "ss05", label: "Alternate ß (eszett)", default: false },
			{ tag: "ss06", label: "Bulgarian Cyrillic forms", default: false },
			{ tag: "subs", label: "Subscript", default: false },
			{ tag: "sups", label: "Superscript", default: false },
		],
	},
	{
		name: "source-sans-3",
		title: "Source Sans 3",
		type: "sans",
		family: "'Source Sans 3 Variable', sans-serif",
		registryVariable: "--font-sans",
		previewVariable: "--font-source-sans-3",
		provider: "google",
		import: "Source_Sans_3",
		dependency: "@fontsource-variable/source-sans-3",
		subsets: ["latin"],
		axes: {
			wght: { default: 400, min: 200, max: 900, step: 1, label: "Weight" },
		},
		features: [
			{ tag: "zero", label: "Slashed Zero", default: false },
			{ tag: "smcp", label: "Small Caps", default: false },
			{ tag: "frac", label: "Fractions", default: false },
			{ tag: "case", label: "Case-Sensitive", default: false },
			{ tag: "salt", label: "Stylistic Alternates", default: false },
			{ tag: "onum", label: "Oldstyle Numbers", default: false },
		],
	},
	{
		name: "instrument-sans",
		title: "Instrument Sans",
		type: "sans",
		family: "'Instrument Sans Variable', sans-serif",
		registryVariable: "--font-sans",
		previewVariable: "--font-instrument-sans",
		provider: "google",
		import: "Instrument_Sans",
		dependency: "@fontsource-variable/instrument-sans",
		subsets: ["latin"],
		axes: {
			wght: { default: 400, min: 400, max: 700, step: 1, label: "Weight" },
			wdth: { default: 100, min: 75, max: 100, step: 0.1, label: "Width" },
		},
		features: [
			{ tag: "tnum", label: "Tabular Numbers", default: false },
			{ tag: "case", label: "Case-Sensitive", default: false },
			{ tag: "ss01", label: "Round punctuation", default: false },
			{ tag: "ss02", label: "Alternate a", default: false },
			{ tag: "ss03", label: "Alternate y", default: false },
			{ tag: "ss04", label: "Alternate K", default: false },
			{ tag: "ss05", label: "Alternate R", default: false },
			{ tag: "ss06", label: "Alternate M", default: false },
			{ tag: "ss07", label: "Alternate G", default: false },
			{ tag: "ss08", label: "Alternate J", default: false },
			{ tag: "ss09", label: "Alternate Q", default: false },
			{ tag: "ss10", label: "Alternate 2", default: false },
			{ tag: "ss11", label: "Alternate &", default: false },
			{ tag: "ss12", label: "Alternate $", default: false },
		],
	},
	{
		name: "jetbrains-mono",
		title: "JetBrains Mono",
		type: "mono",
		family: "'JetBrains Mono Variable', monospace",
		registryVariable: "--font-mono",
		previewVariable: "--font-jetbrains-mono",
		provider: "google",
		import: "JetBrains_Mono",
		dependency: "@fontsource-variable/jetbrains-mono",
		subsets: ["latin"],
		axes: {
			wght: { default: 400, min: 100, max: 800, step: 1, label: "Weight" },
		},
		features: [
			{ tag: "zero", label: "Slashed Zero", default: false },
			{ tag: "frac", label: "Fractions", default: false },
			{ tag: "cv01", label: "Symmetric l", default: false },
			{ tag: "cv02", label: "Curly t", default: false },
			{ tag: "cv03", label: "Complex g", default: false },
			{ tag: "cv04", label: "Curly j", default: false },
			{ tag: "cv05", label: "Curly l", default: false },
			{ tag: "cv06", label: "Shorter m", default: false },
			{ tag: "cv07", label: "Lower W/w", default: false },
			{ tag: "cv08", label: "Sharp K/k", default: false },
			{ tag: "cv14", label: "Broken $ bar", default: false },
			{ tag: "cv15", label: "Alternate &", default: false },
			{ tag: "cv16", label: "Q bent tail", default: false },
			{ tag: "ss01", label: "Classic construction", default: false },
			{ tag: "ss02", label: "Closed construction", default: false },
			{ tag: "ss19", label: "Gaps in ligatures", default: false },
			{ tag: "ss20", label: "Shifted f stroke", default: false },
		],
	},
	{
		name: "geist-mono",
		title: "Geist Mono",
		type: "mono",
		family: "'Geist Mono Variable', monospace",
		registryVariable: "--font-mono",
		previewVariable: "--font-geist-mono",
		provider: "google",
		import: "Geist_Mono",
		dependency: "@fontsource-variable/geist-mono",
		subsets: ["latin"],
		axes: {
			wght: { default: 400, min: 100, max: 900, step: 1, label: "Weight" },
		},
	},
	{
		name: "noto-serif",
		title: "Noto Serif",
		type: "serif",
		family: "'Noto Serif Variable', serif",
		registryVariable: "--font-serif",
		previewVariable: "--font-noto-serif",
		provider: "google",
		import: "Noto_Serif",
		dependency: "@fontsource-variable/noto-serif",
		subsets: ["latin"],
		axes: {
			wght: { default: 400, min: 100, max: 900, step: 1, label: "Weight" },
			wdth: { default: 100, min: 62.5, max: 100, step: 0.1, label: "Width" },
		},
		features: [
			{ tag: "tnum", label: "Tabular Numbers", default: false },
			{ tag: "zero", label: "Slashed Zero", default: false },
			{ tag: "smcp", label: "Small Caps", default: false },
			{ tag: "frac", label: "Fractions", default: false },
			{ tag: "case", label: "Case-Sensitive", default: false },
		],
	},
	{
		name: "roboto-slab",
		title: "Roboto Slab",
		type: "serif",
		family: "'Roboto Slab Variable', serif",
		registryVariable: "--font-serif",
		previewVariable: "--font-roboto-slab",
		provider: "google",
		import: "Roboto_Slab",
		dependency: "@fontsource-variable/roboto-slab",
		subsets: ["latin"],
		axes: {
			wght: { default: 400, min: 100, max: 900, step: 1, label: "Weight" },
		},
	},
	{
		name: "merriweather",
		title: "Merriweather",
		type: "serif",
		family: "'Merriweather Variable', serif",
		registryVariable: "--font-serif",
		previewVariable: "--font-merriweather",
		provider: "google",
		import: "Merriweather",
		dependency: "@fontsource-variable/merriweather",
		subsets: ["latin"],
		axes: {
			wght: { default: 400, min: 300, max: 900, step: 1, label: "Weight" },
			opsz: { default: 18, min: 18, max: 144, step: 0.1, label: "Optical Size" },
			wdth: { default: 100, min: 87, max: 112, step: 0.1, label: "Width" },
		},
		features: [
			{ tag: "tnum", label: "Tabular Numbers", default: false },
			{ tag: "onum", label: "Oldstyle Numbers", default: false },
			{ tag: "zero", label: "Slashed Zero", default: false },
			{ tag: "smcp", label: "Small Caps", default: false },
			{ tag: "frac", label: "Fractions", default: false },
			{ tag: "case", label: "Case-Sensitive", default: false },
			{ tag: "ss01", label: "Alternate punctuation", default: false },
		],
	},
	{
		name: "lora",
		title: "Lora",
		type: "serif",
		family: "'Lora Variable', serif",
		registryVariable: "--font-serif",
		previewVariable: "--font-lora",
		provider: "google",
		import: "Lora",
		dependency: "@fontsource-variable/lora",
		subsets: ["latin"],
		axes: {
			wght: { default: 400, min: 400, max: 700, step: 1, label: "Weight" },
		},
		features: [
			{ tag: "tnum", label: "Tabular Numbers", default: false },
			{ tag: "pnum", label: "Proportional Numbers", default: false },
			{ tag: "frac", label: "Fractions", default: false },
		],
	},
	{
		name: "playfair-display",
		title: "Playfair Display",
		type: "serif",
		family: "'Playfair Display Variable', serif",
		registryVariable: "--font-serif",
		previewVariable: "--font-playfair-display",
		provider: "google",
		import: "Playfair_Display",
		dependency: "@fontsource-variable/playfair-display",
		subsets: ["latin"],
		axes: {
			wght: { default: 400, min: 400, max: 900, step: 1, label: "Weight" },
		},
		features: [
			{ tag: "onum", label: "Oldstyle Numbers", default: false },
			{ tag: "smcp", label: "Small Caps", default: false },
			{ tag: "dlig", label: "Discretionary Ligatures", default: false },
			{ tag: "frac", label: "Fractions", default: false },
		],
	},
	{
		name: "eb-garamond",
		title: "EB Garamond",
		type: "serif",
		family: "'EB Garamond Variable', serif",
		registryVariable: "--font-serif",
		previewVariable: "--font-eb-garamond",
		provider: "google",
		import: "EB_Garamond",
		dependency: "@fontsource-variable/eb-garamond",
		subsets: ["latin"],
		axes: {
			wght: { default: 400, min: 400, max: 800, step: 1, label: "Weight" },
		},
		features: [
			{ tag: "onum", label: "Oldstyle Numbers", default: false },
			{ tag: "smcp", label: "Small Caps", default: false },
			{ tag: "dlig", label: "Discretionary Ligatures", default: false },
			{ tag: "frac", label: "Fractions", default: false },
		],
	},
	{
		name: "instrument-serif",
		title: "Instrument Serif",
		type: "serif",
		family: "'Instrument Serif', serif",
		registryVariable: "--font-serif",
		previewVariable: "--font-instrument-serif",
		provider: "google",
		import: "Instrument_Serif",
		dependency: "@fontsource/instrument-serif",
		subsets: ["latin"],
		weight: ["400"],
	},
] as const satisfies readonly FontDefinition[];

export type FontName = (typeof FONT_DEFINITIONS)[number]["name"];

export function getFontAxes(name: string): Record<string, FontAxisDefinition> | undefined {
	const def: FontDefinition | undefined = FONT_DEFINITIONS.find((f) => f.name === name);
	return def?.axes;
}

export function getDefaultAxesValues(
	axes: Record<string, FontAxisDefinition>
): Record<string, number> {
	return Object.fromEntries(Object.entries(axes).map(([key, axis]) => [key, axis.default]));
}

export function getFontFeatures(name: string): readonly FontFeatureDefinition[] | undefined {
	const def: FontDefinition | undefined = FONT_DEFINITIONS.find((f) => f.name === name);
	return def?.features;
}

export function getDefaultFeatureValues(
	features: readonly FontFeatureDefinition[]
): Record<string, boolean> {
	return Object.fromEntries(features.map((f) => [f.tag, f.default]));
}
