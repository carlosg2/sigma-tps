// Adapted from shadcn-svelte docs/src/lib/features/design-system/components/design-system-provider-state.svelte.ts
// Changes from original:
//   - Removed URL params ($app/navigation, $app/state)
//   - Removed shareUrl getter
//   - Replaced applyBias/RANDOMIZE_BIASES with simple random selection
//   - Uses PRESET_ arrays from shadcn-svelte/preset for randomization

import {
	decodePreset,
	encodePreset,
	DEFAULT_PRESET_CONFIG,
	type PresetConfig,
	PRESET_BASE_COLOR_KEYS,
	PRESET_CHART_COLORS,
	PRESET_FONTS,
	PRESET_MENU_ACCENTS,
	PRESET_MENU_COLORS,
	PRESET_RADII,
	PRESET_STYLES,
} from "shadcn-svelte/preset";
import { iconLibraries } from "shadcn-svelte/icons";
import { Context, PersistedState, StateHistory } from "runed";
import { BASE_THEMES, getThemesForBaseColor } from "./config.js";
import {
	getFontAxes,
	getDefaultAxesValues,
	getFontFeatures,
	getDefaultFeatureValues,
	type FontAxisDefinition,
	type FontFeatureDefinition,
} from "./font-definitions.js";

type ChartColorName = (typeof PRESET_CHART_COLORS)[number];

export interface IDesignSystemState extends PresetConfig {
	preset: string;
	chartColor: ChartColorName;
	locks: Lockable;
	lock: (key: keyof Lockable) => void;
	unlock: (key: keyof Lockable) => void;
	reset: () => void;
	randomize: () => void;
	undo: () => void;
	redo: () => void;
	canUndo: boolean;
	canRedo: boolean;
	fontAxesValues: Record<string, number>;
	setFontAxis: (axis: string, value: number) => void;
	resetFontAxes: () => void;
	currentFontAxes: Record<string, FontAxisDefinition> | undefined;
	fontVariationSettings: string;
	fontHeadingAxesValues: Record<string, number>;
	setFontHeadingAxis: (axis: string, value: number) => void;
	resetFontHeadingAxes: () => void;
	currentFontHeadingAxes: Record<string, FontAxisDefinition> | undefined;
	fontHeadingVariationSettings: string;
	textScale: string;
	fontFeatureValues: Record<string, boolean>;
	toggleFontFeature: (tag: string) => void;
	resetFontFeatures: () => void;
	currentFontFeatures: readonly FontFeatureDefinition[] | undefined;
	fontFeatureSettings: string;
	fontHeadingFeatureValues: Record<string, boolean>;
	toggleFontHeadingFeature: (tag: string) => void;
	resetFontHeadingFeatures: () => void;
	currentFontHeadingFeatures: readonly FontFeatureDefinition[] | undefined;
	fontHeadingFeatureSettings: string;
}

export type Lockable = {
	style: boolean;
	baseColor: boolean;
	theme: boolean;
	chartColor: boolean;
	iconLibrary: boolean;
	font: boolean;
	fontHeading: boolean;
	item: boolean;
	menuAccent: boolean;
	menuColor: boolean;
	radius: boolean;
	template: boolean;
};

class DesignSystemState implements IDesignSystemState {
	#history: StateHistory<string>;
	#preset: PersistedState<string>;
	#locks: PersistedState<Lockable>;
	#fontAxes: PersistedState<Record<string, Record<string, number>>>;
	#fontFeatures: PersistedState<Record<string, Record<string, boolean>>>;
	#textScale: PersistedState<string>;

	constructor() {
		this.#preset = new PersistedState<string>(
			"design-system-preset",
			encodePreset(DEFAULT_PRESET_CONFIG)
		);
		this.#locks = new PersistedState<Lockable>("design-system-locks", {
			style: false,
			baseColor: false,
			theme: false,
			chartColor: false,
			iconLibrary: false,
			font: false,
			fontHeading: false,
			item: false,
			menuAccent: false,
			menuColor: false,
			radius: false,
			template: false,
		});

		this.#fontAxes = new PersistedState<Record<string, Record<string, number>>>(
			"font-axes",
			{}
		);

		this.#fontFeatures = new PersistedState<Record<string, Record<string, boolean>>>(
			"font-features",
			{}
		);

		this.#textScale = new PersistedState<string>("text-scale", "1");

		this.reset = this.reset.bind(this);
		this.randomize = this.randomize.bind(this);

		this.#history = new StateHistory(
			() => this.#preset.current,
			(value) => {
				this.#preset.current = value;
			}
		);
	}

	private get system(): PresetConfig {
		const preset = decodePreset(this.#preset.current);
		if (!preset) return DEFAULT_PRESET_CONFIG;
		return preset;
	}

	private set system(value: PresetConfig) {
		this.#preset.current = encodePreset(value);
	}

	undo() {
		this.#history.undo();
	}

	redo() {
		this.#history.redo();
	}

	get canUndo() {
		return this.#history.canUndo;
	}

	get canRedo() {
		return this.#history.canRedo;
	}

	get preset() {
		return this.#preset.current;
	}

	set preset(code: string) {
		const decoded = decodePreset(code);
		if (!decoded) return;
		this.system = decoded;
	}

	// locks

	lock(key: keyof Lockable): void {
		this.#locks.current = { ...this.#locks.current, [key]: true };
	}

	unlock(key: keyof Lockable): void {
		this.#locks.current = { ...this.#locks.current, [key]: false };
	}

	get locks(): Lockable {
		return this.#locks.current;
	}

	// helpers

	#update(system: Partial<PresetConfig>) {
		this.system = {
			...this.system,
			...system,
		};
	}

	// properties

	get baseColor() {
		return this.system.baseColor;
	}

	set baseColor(value: PresetConfig["baseColor"]) {
		const shouldUpdateTheme = BASE_THEMES.some((base) => base.name === this.theme);
		const nextTheme = shouldUpdateTheme ? value : this.system.theme;
		const availableChart = getThemesForBaseColor(value);
		const currentChart =
			this.system.chartColor ?? DEFAULT_PRESET_CONFIG.chartColor ?? "neutral";
		const nextChartColor = availableChart.some((t) => t.name === currentChart)
			? currentChart
			: (availableChart[0]!.name as ChartColorName);

		this.#update({
			theme: nextTheme,
			baseColor: value,
			chartColor: nextChartColor,
		});
	}

	get font() {
		return this.system.font;
	}

	set font(value: PresetConfig["font"]) {
		this.#update({ font: value });
	}

	get chartColor() {
		return this.system.chartColor ?? DEFAULT_PRESET_CONFIG.chartColor!;
	}

	set chartColor(value: ChartColorName) {
		this.#update({ chartColor: value });
	}

	get fontHeading() {
		return this.system.fontHeading;
	}

	set fontHeading(value: PresetConfig["fontHeading"]) {
		this.#update({ fontHeading: value });
	}

	get iconLibrary() {
		return this.system.iconLibrary;
	}

	set iconLibrary(value: PresetConfig["iconLibrary"]) {
		this.#update({ iconLibrary: value });
	}

	get menuAccent() {
		return this.system.menuAccent;
	}

	set menuAccent(value: PresetConfig["menuAccent"]) {
		this.#update({ menuAccent: value });
	}

	get menuColor() {
		return this.system.menuColor;
	}

	set menuColor(value: PresetConfig["menuColor"]) {
		this.#update({ menuColor: value });
	}

	get radius() {
		return this.system.radius;
	}

	set radius(value: PresetConfig["radius"]) {
		this.#update({ radius: value });
	}

	get style() {
		return this.system.style;
	}

	set style(value: PresetConfig["style"]) {
		this.#update({ style: value });
	}

	get theme() {
		return this.system.theme;
	}

	set theme(value: PresetConfig["theme"]) {
		this.#update({ theme: value });
	}

	reset() {
		this.system = DEFAULT_PRESET_CONFIG;
		this.#textScale.current = "1";
	}

	randomize() {
		const selectedBaseColor = this.locks.baseColor
			? this.baseColor
			: randomItem(PRESET_BASE_COLOR_KEYS);
		const selectedStyle = this.locks.style ? this.style : randomItem(PRESET_STYLES);

		const availableThemes = getThemesForBaseColor(selectedBaseColor);
		const selectedTheme = this.locks.theme ? this.theme : randomItem(availableThemes).name;
		const selectedChartColor = this.locks.chartColor
			? this.chartColor
			: randomItem(PRESET_CHART_COLORS);
		const selectedFont = this.locks.font ? this.font : randomItem(PRESET_FONTS);

		// Pick heading font: ~70% inherit, ~30% distinct
		let selectedFontHeading: PresetConfig["fontHeading"];
		if (this.locks.fontHeading) {
			selectedFontHeading = this.fontHeading;
		} else if (Math.random() < 0.7) {
			selectedFontHeading = "inherit";
		} else {
			const otherFonts = PRESET_FONTS.filter((f) => f !== selectedFont);
			selectedFontHeading = otherFonts.length > 0 ? randomItem(otherFonts) : selectedFont;
		}

		const radiusKeys = Object.keys(PRESET_RADII) as PresetConfig["radius"][];
		const selectedRadius = this.locks.radius ? this.radius : randomItem(radiusKeys);
		const iconLibraryKeys = Object.keys(iconLibraries) as PresetConfig["iconLibrary"][];
		const selectedIconLibrary = this.locks.iconLibrary
			? this.iconLibrary
			: randomItem(iconLibraryKeys);
		const selectedMenuAccent = this.locks.menuAccent
			? this.menuAccent
			: randomItem(PRESET_MENU_ACCENTS as unknown as string[]) as PresetConfig["menuAccent"];
		const selectedMenuColor = this.locks.menuColor
			? this.menuColor
			: randomItem(PRESET_MENU_COLORS as unknown as string[]) as PresetConfig["menuColor"];

		this.system = {
			baseColor: selectedBaseColor,
			style: selectedStyle,
			theme: selectedTheme as PresetConfig["theme"],
			chartColor: selectedChartColor,
			font: selectedFont,
			fontHeading: selectedFontHeading,
			radius: selectedRadius,
			iconLibrary: selectedIconLibrary,
			menuAccent: selectedMenuAccent,
			menuColor: selectedMenuColor,
		};
	}

	// Typographic Scale

	get textScale() {
		return this.#textScale.current;
	}

	set textScale(value: string) {
		this.#textScale.current = value;
	}

	// Font variable axes (body)

	get currentFontAxes(): Record<string, FontAxisDefinition> | undefined {
		return getFontAxes(this.font);
	}

	get fontAxesValues(): Record<string, number> {
		const axes = this.currentFontAxes;
		if (!axes) return {};
		const stored = this.#fontAxes.current[this.font];
		const defaults = getDefaultAxesValues(axes);
		return { ...defaults, ...stored };
	}

	setFontAxis(axis: string, value: number) {
		const current = this.#fontAxes.current;
		const fontValues = { ...(current[this.font] ?? {}), [axis]: value };
		this.#fontAxes.current = { ...current, [this.font]: fontValues };
	}

	resetFontAxes() {
		const current = this.#fontAxes.current;
		const { [this.font]: _, ...rest } = current;
		this.#fontAxes.current = rest;
	}

	get fontVariationSettings(): string {
		const axes = this.currentFontAxes;
		if (!axes) return "normal";
		const values = this.fontAxesValues;
		const defaults = getDefaultAxesValues(axes);
		const entries = Object.entries(values).filter(([axis, value]) => value !== defaults[axis]);
		if (entries.length === 0) return "normal";
		return entries.map(([axis, value]) => `'${axis}' ${value}`).join(", ");
	}

	// Heading font variable axes

	#resolvedHeadingFont(): string {
		return this.fontHeading === "inherit" ? this.font : this.fontHeading;
	}

	get currentFontHeadingAxes(): Record<string, FontAxisDefinition> | undefined {
		return getFontAxes(this.#resolvedHeadingFont());
	}

	get fontHeadingAxesValues(): Record<string, number> {
		const axes = this.currentFontHeadingAxes;
		if (!axes) return {};
		const fontKey = `heading:${this.#resolvedHeadingFont()}`;
		const stored = this.#fontAxes.current[fontKey];
		const defaults = getDefaultAxesValues(axes);
		return { ...defaults, ...stored };
	}

	setFontHeadingAxis(axis: string, value: number) {
		const current = this.#fontAxes.current;
		const fontKey = `heading:${this.#resolvedHeadingFont()}`;
		const fontValues = { ...(current[fontKey] ?? {}), [axis]: value };
		this.#fontAxes.current = { ...current, [fontKey]: fontValues };
	}

	resetFontHeadingAxes() {
		const current = this.#fontAxes.current;
		const fontKey = `heading:${this.#resolvedHeadingFont()}`;
		const { [fontKey]: _, ...rest } = current;
		this.#fontAxes.current = rest;
	}

	get fontHeadingVariationSettings(): string {
		const axes = this.currentFontHeadingAxes;
		if (!axes) return "normal";
		const values = this.fontHeadingAxesValues;
		const defaults = getDefaultAxesValues(axes);
		const entries = Object.entries(values).filter(([axis, value]) => value !== defaults[axis]);
		if (entries.length === 0) return "normal";
		return entries.map(([axis, value]) => `'${axis}' ${value}`).join(", ");
	}

	// Font feature settings (body)

	get currentFontFeatures(): readonly FontFeatureDefinition[] | undefined {
		return getFontFeatures(this.font);
	}

	get fontFeatureValues(): Record<string, boolean> {
		const features = this.currentFontFeatures;
		if (!features || features.length === 0) return {};
		const stored = this.#fontFeatures.current[this.font];
		const defaults = getDefaultFeatureValues(features);
		return { ...defaults, ...stored };
	}

	toggleFontFeature(tag: string) {
		const current = this.#fontFeatures.current;
		const fontValues = { ...(current[this.font] ?? {}) };
		fontValues[tag] = !this.fontFeatureValues[tag];
		this.#fontFeatures.current = { ...current, [this.font]: fontValues };
	}

	resetFontFeatures() {
		const current = this.#fontFeatures.current;
		const { [this.font]: _, ...rest } = current;
		this.#fontFeatures.current = rest;
	}

	get fontFeatureSettings(): string {
		const features = this.currentFontFeatures;
		if (!features || features.length === 0) return "normal";
		const values = this.fontFeatureValues;
		const nonDefault = features.filter((f) => values[f.tag] !== f.default);
		if (nonDefault.length === 0) return "normal";
		return nonDefault.map((f) => `'${f.tag}' ${values[f.tag] ? "on" : "off"}`).join(", ");
	}

	// Font feature settings (heading)

	get currentFontHeadingFeatures(): readonly FontFeatureDefinition[] | undefined {
		return getFontFeatures(this.#resolvedHeadingFont());
	}

	get fontHeadingFeatureValues(): Record<string, boolean> {
		const features = this.currentFontHeadingFeatures;
		if (!features || features.length === 0) return {};
		const fontKey = `heading:${this.#resolvedHeadingFont()}`;
		const stored = this.#fontFeatures.current[fontKey];
		const defaults = getDefaultFeatureValues(features);
		return { ...defaults, ...stored };
	}

	toggleFontHeadingFeature(tag: string) {
		const current = this.#fontFeatures.current;
		const fontKey = `heading:${this.#resolvedHeadingFont()}`;
		const fontValues = { ...(current[fontKey] ?? {}) };
		fontValues[tag] = !this.fontHeadingFeatureValues[tag];
		this.#fontFeatures.current = { ...current, [fontKey]: fontValues };
	}

	resetFontHeadingFeatures() {
		const current = this.#fontFeatures.current;
		const fontKey = `heading:${this.#resolvedHeadingFont()}`;
		const { [fontKey]: _, ...rest } = current;
		this.#fontFeatures.current = rest;
	}

	get fontHeadingFeatureSettings(): string {
		const features = this.currentFontHeadingFeatures;
		if (!features || features.length === 0) return "normal";
		const values = this.fontHeadingFeatureValues;
		const nonDefault = features.filter((f) => values[f.tag] !== f.default);
		if (nonDefault.length === 0) return "normal";
		return nonDefault.map((f) => `'${f.tag}' ${values[f.tag] ? "on" : "off"}`).join(", ");
	}
}

function randomItem<T>(array: readonly T[]): T {
	return array[Math.floor(Math.random() * array.length)];
}

export const DesignSystemContext = new Context<DesignSystemState>("DesignSystemContext");

export function useDesignSystem(): IDesignSystemState {
	return DesignSystemContext.get();
}

export function setupDesignSystem(): IDesignSystemState {
	return DesignSystemContext.set(new DesignSystemState());
}

export { type DesignSystemState };
