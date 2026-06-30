<script lang="ts">
	import * as Picker from "../picker/index.js";
	import { useDesignSystem } from "$lib/ds/index.js";
	import { IsMobile } from "$lib/hooks/is-mobile.svelte.js";
	import LockButton from "./lock-button.svelte";
	import { iconLibraries } from "shadcn-svelte/icons";
	import type { PresetConfig } from "shadcn-svelte/preset";

	type Props = { submenu?: boolean };
	let { submenu = false }: Props = $props();

	const designSystem = useDesignSystem();
	const isMobile = new IsMobile();

	const currentIconLibrary = $derived(iconLibraries[designSystem.iconLibrary]);
	const allLibraries = Object.values(iconLibraries);
</script>

<div class="group/picker relative">
	<Picker.Root {submenu}>
		<Picker.Trigger {submenu}>
			<div class="flex flex-col justify-start text-left">
				<div class="text-muted-foreground text-xs">Iconos</div>
				<div class="text-foreground text-sm font-medium capitalize">{currentIconLibrary?.name}</div>
			</div>
		</Picker.Trigger>
		<Picker.Content
			side={isMobile.current ? "top" : submenu ? "left" : "right"}
			align={isMobile.current ? "center" : "start"}
			sideOffset={submenu ? 5 : 20}
			{submenu}
		>
			<Picker.RadioGroup bind:value={designSystem.iconLibrary}>
				<Picker.Group>
					{#each allLibraries as lib (lib.name)}
						<Picker.RadioItem value={lib.name} closeOnSelect={false}>
							<span class="capitalize">{lib.name}</span>
						</Picker.RadioItem>
					{/each}
				</Picker.Group>
			</Picker.RadioGroup>
		</Picker.Content>
	</Picker.Root>
	<LockButton prop="iconLibrary" class="absolute top-1/2 right-10 -translate-y-1/2" />
</div>
