<script lang="ts">
	import { setTheme } from "mode-watcher";
	import * as Select from "$lib/components/ui/select/index.js";
	import type { HTMLAttributes } from "svelte/elements";
	import { cn } from "$lib/utils.js";
	import Label from "$lib/components/ui/label/label.svelte";
	import { UserConfigContext, type ActiveTheme } from "$lib/user-config.svelte.js";

	let { class: className, ...restProps }: HTMLAttributes<HTMLElement> = $props();

	const DEFAULT_THEMES = [
		{
			name: "Default",
			value: "default",
		},
		{
			name: "Scaled",
			value: "scaled",
		},
		{
			name: "Mono",
			value: "mono",
		},
	];

	const COLOR_THEMES = [
		{
			name: "Blue",
			value: "blue",
		},
		{
			name: "Green",
			value: "green",
		},
		{
			name: "Amber",
			value: "amber",
		},
		{
			name: "Rose",
			value: "rose",
		},
		{
			name: "Purple",
			value: "purple",
		},
		{
			name: "Orange",
			value: "orange",
		},
		{
			name: "Teal",
			value: "teal",
		},
	];

	const userConfig = UserConfigContext.get();
	
	// Estado para manejar la preview y tema inicial
	let initialTheme = $state(userConfig.current.activeTheme);
	let isSelectOpen = $state(false);

	const label = $derived(
		[...DEFAULT_THEMES, ...COLOR_THEMES].find((t) => t.value === userConfig.current.activeTheme)
			?.name ?? "Default"
	);

	// Función para aplicar tema de preview
	function previewTheme(theme: string) {
		setTheme(theme);
	}

	// Función para confirmar el tema seleccionado
	function confirmTheme(theme: string) {
		userConfig.setConfig({ activeTheme: theme });
		initialTheme = theme;
	}

	// Función para revertir al tema inicial
	function revertTheme() {
		setTheme(initialTheme);
		userConfig.setConfig({ activeTheme: initialTheme });
	}
</script>

<div class={cn("flex items-center gap-2", className)} {...restProps}>
	<Label for="theme-selector" class="sr-only">Theme</Label>

	<Select.Root
		type="single"
		bind:value={
			() => userConfig.current.activeTheme,
			(v) => {
				if (v && !isSelectOpen) {
					// Solo confirmar si el select está cerrado (selección por click/enter)
					confirmTheme(v);
				}
			}
		}
		onOpenChange={(open) => {
			isSelectOpen = open;
			if (open) {
				// Guardar tema inicial cuando se abre
				initialTheme = userConfig.current.activeTheme;
			} else if (!open) {
				// Si se cierra sin confirmar, revertir al tema inicial
				if (userConfig.current.activeTheme !== initialTheme) {
					revertTheme();
				}
			}
		}}
	>
		<Select.Trigger
			size="sm"
			class="justify-start shadow-none"
			id="theme-selector"
			onkeydown={(e) => {
				if (e.key === "Escape" && isSelectOpen) {
					revertTheme();
				}
			}}
		>
			<span class="font-medium"> Theme: </span>
			<span class="w-12">
				{label}
			</span>
		</Select.Trigger>
		<Select.Content align="end">
			<Select.Group>
				<Select.GroupHeading class="sr-only">Default</Select.GroupHeading>
				{#each DEFAULT_THEMES as theme (theme.value)}
					<Select.Item
						value={theme.value}
						label={theme.name}
						class="data-[selected]:opacity-50"
						onmouseenter={() => previewTheme(theme.value)}
						onfocus={() => previewTheme(theme.value)}
						onclick={() => confirmTheme(theme.value)}
						onkeydown={(e) => {
							if (e.key === "Enter") {
								confirmTheme(theme.value);
							}
						}}
					>
						{theme.name}
					</Select.Item>
				{/each}
			</Select.Group>
			<Select.Separator />
			<Select.Group>
				<Select.GroupHeading>Colors</Select.GroupHeading>
				{#each COLOR_THEMES as theme (theme.value)}
					<Select.Item
						value={theme.value}
						label={theme.name}
						class="data-[selected]:opacity-50"
						onmouseenter={() => previewTheme(theme.value)}
						onfocus={() => previewTheme(theme.value)}
						onclick={() => confirmTheme(theme.value)}
						onkeydown={(e) => {
							if (e.key === "Enter") {
								confirmTheme(theme.value);
							}
						}}
					>
						{theme.name}
					</Select.Item>
				{/each}
			</Select.Group>
		</Select.Content>
	</Select.Root>
</div>
