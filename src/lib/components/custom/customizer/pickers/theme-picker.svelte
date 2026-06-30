<script lang="ts">
	import * as Picker from "../picker/index.js";
	import { useDesignSystem } from "$lib/ds/index.js";
	import { IsMobile } from "$lib/hooks/is-mobile.svelte.js";
	import LockButton from "./lock-button.svelte";
	import { mode } from "mode-watcher";
	import { BASE_THEMES, THEMES, type BaseTheme, type Theme } from "$lib/ds/index.js";

	type Props = { submenu?: boolean };
	let { submenu = false }: Props = $props();

	const designSystem = useDesignSystem();
	const isMobile = new IsMobile();

	const currentTheme = $derived(THEMES.find((t) => t.name === designSystem.theme) ?? THEMES[0]);

	function isBaseColor(theme: Theme): theme is BaseTheme {
		return BASE_THEMES.some((bc) => bc.name === theme.name);
	}

	function getColorForTheme(theme: Theme) {
		const m = (mode.current ?? "light") as "light" | "dark";
		if (isBaseColor(theme)) return (theme.cssVars[m] as Record<string, string>)["muted-foreground"];
		return (theme.cssVars[m] as Record<string, string>)["primary"];
	}
</script>

<div class="group/picker relative">
	<Picker.Root {submenu}>
		<Picker.Trigger {submenu}>
			<div class="flex flex-col justify-start text-left">
				<div class="text-muted-foreground text-xs">Tema</div>
				<div class="text-foreground text-sm font-medium">{currentTheme?.title}</div>
			</div>
			{#if currentTheme}
				<div
					style="--color: {getColorForTheme(currentTheme)};"
					class="pointer-events-none absolute top-1/2 right-4 size-4 -translate-y-1/2 rounded-full bg-(--color) select-none"
				></div>
			{/if}
		</Picker.Trigger>
		<Picker.Content
			side={isMobile.current ? "top" : submenu ? "left" : "right"}
			align={isMobile.current ? "center" : "start"}
			class="max-h-96 overflow-y-auto"
			sideOffset={submenu ? 5 : 20}
			{submenu}
		>
			<Picker.RadioGroup bind:value={designSystem.theme}>
				<Picker.Group>
					{#each THEMES.filter((t) => BASE_THEMES.some((bc) => bc.name === t.name)) as theme (theme.name)}
						{#if theme.name === designSystem.baseColor}
							<Picker.RadioItem value={theme.name} closeOnSelect={false}>
								<div class="flex items-center gap-2">
									{#if mode.current}
										<div
											style="--color: {getColorForTheme(theme)};"
											class="size-4 translate-y-0.5 rounded-full bg-(--color)"
										></div>
									{/if}
									<div class="flex flex-col">
										<div>{theme.title}</div>
										<div class="text-muted-foreground text-xs">Coincidir con el color base</div>
									</div>
								</div>
							</Picker.RadioItem>
						{/if}
					{/each}
				</Picker.Group>
				<Picker.Separator />
				<Picker.Group>
					{#each THEMES.filter((t) => !BASE_THEMES.some((bc) => bc.name === t.name)) as theme (theme.name)}
						<Picker.RadioItem value={theme.name} closeOnSelect={false}>
							<div class="flex items-center gap-2">
								{#if mode.current}
									<div
										style="--color: {(theme.cssVars[mode.current as 'light' | 'dark'] as Record<string,string>)?.['primary']};"
										class="size-4 rounded-full bg-(--color)"
									></div>
								{/if}
								{theme.title}
							</div>
						</Picker.RadioItem>
					{/each}
				</Picker.Group>
			</Picker.RadioGroup>
		</Picker.Content>
	</Picker.Root>
	<LockButton prop="theme" class="absolute top-1/2 right-10 -translate-y-1/2" />
</div>
