import { getContext, setContext } from "svelte";

export const USER_CONFIG_COOKIE_NAME = "smail_user_config";

export type Layout = "fixed" | "full";
export type PackageManager = "npm" | "yarn" | "pnpm" | "bun";
export type ColorFormat = "class" | "hex" | "rgb" | "hsl" | "oklch" | "var";
export type ActiveTheme =
	| "default"
	| "scaled"
	| "mono"
	| "blue"
	| "green"
	| "amber"
	| "rose"
	| "purple"
	| "orange"
	| "teal"
	| "violet"
	| "red"
	| "yellow"
	| "neutral";

export type UserConfigType = {
	layout: Layout;
	packageManager: PackageManager;
	colorFormat: ColorFormat;
	activeTheme: ActiveTheme;
};

const DEFAULT_CONFIG: UserConfigType = {
	layout: "full",
	packageManager: "npm",
	colorFormat: "hsl",
	activeTheme: "default",
};

const VALID_LAYOUTS: Layout[] = ["fixed", "full"];
const VALID_PACKAGE_MANAGERS: PackageManager[] = ["npm", "yarn", "pnpm", "bun"];
const VALID_COLOR_FORMATS: ColorFormat[] = ["class", "hex", "rgb", "hsl", "oklch", "var"];
const VALID_THEMES: ActiveTheme[] = [
	"default",
	"scaled",
	"mono",
	"blue",
	"green",
	"amber",
	"rose",
	"purple",
	"orange",
	"teal",
	"violet",
	"red",
	"yellow",
	"neutral",
];

export function parseUserConfigValue(value: unknown): UserConfigType {
	if (typeof value !== "object" || value === null) return { ...DEFAULT_CONFIG };
	const v = value as Record<string, unknown>;
	return {
		layout: VALID_LAYOUTS.includes(v.layout as Layout)
			? (v.layout as Layout)
			: DEFAULT_CONFIG.layout,
		packageManager: VALID_PACKAGE_MANAGERS.includes(v.packageManager as PackageManager)
			? (v.packageManager as PackageManager)
			: DEFAULT_CONFIG.packageManager,
		colorFormat: VALID_COLOR_FORMATS.includes(v.colorFormat as ColorFormat)
			? (v.colorFormat as ColorFormat)
			: DEFAULT_CONFIG.colorFormat,
		activeTheme: VALID_THEMES.includes(v.activeTheme as ActiveTheme)
			? (v.activeTheme as ActiveTheme)
			: DEFAULT_CONFIG.activeTheme,
	};
}

export function parseUserConfigJson(value: string | undefined): UserConfigType {
	if (!value) return { ...DEFAULT_CONFIG };
	try {
		return parseUserConfigValue(JSON.parse(value));
	} catch {
		return { ...DEFAULT_CONFIG };
	}
}

export class UserConfig {
	#config: UserConfigType;

	constructor(config: UserConfigType) {
		this.#config = $state.raw(config);
	}

	get current(): UserConfigType {
		return this.#config;
	}

	setConfig(config: Partial<UserConfigType>): void {
		this.#config = { ...this.#config, ...config };
		document.cookie = `${USER_CONFIG_COOKIE_NAME}=${encodeURIComponent(JSON.stringify(this.#config))}; path=/; max-age=31536000; SameSite=Lax;`;
	}
}

const USER_CONFIG_CONTEXT_KEY = Symbol.for("smail-user-config");

export const UserConfigContext = {
	set(config: UserConfig): void {
		setContext(USER_CONFIG_CONTEXT_KEY, config);
	},
	get(): UserConfig {
		return getContext<UserConfig>(USER_CONFIG_CONTEXT_KEY);
	},
};
