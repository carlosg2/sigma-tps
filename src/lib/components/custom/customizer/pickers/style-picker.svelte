<script lang="ts">
	import { STYLES } from "$lib/ds/index.js";
	import LockButton from "./lock-button.svelte";
	import * as Picker from "../picker/index.js";
	import { useDesignSystem } from "$lib/ds/index.js";
	import { IsMobile } from "$lib/hooks/is-mobile.svelte.js";
	import type { PresetConfig } from "shadcn-svelte/preset";

	type Props = { submenu?: boolean };
	let { submenu = false }: Props = $props();

	const designSystem = useDesignSystem();
	const isMobile = new IsMobile();

	const currentStyle = $derived(
		STYLES.find((s) => s.name === designSystem.style) ?? STYLES[0]
	);
</script>

<div class="group/picker relative">
	<Picker.Root {submenu}>
		<Picker.Trigger {submenu}>
			<div class="flex flex-col justify-start text-left">
				<div class="text-muted-foreground text-xs">Estilo</div>
				<div class="text-foreground text-sm font-medium">{currentStyle?.title}</div>
			</div>
		</Picker.Trigger>
		<Picker.Content
			side={isMobile.current ? "top" : submenu ? "left" : "right"}
			align={isMobile.current ? "center" : "start"}
			class="md:w-48"
			sideOffset={submenu ? 5 : 20}
			{submenu}
		>
			<Picker.RadioGroup bind:value={designSystem.style}>
				<Picker.Group>
					{#each STYLES as style (style.name)}
						<Picker.RadioItem value={style.name} closeOnSelect={false}>
							{style.title}
						</Picker.RadioItem>
					{/each}
				</Picker.Group>
			</Picker.RadioGroup>
		</Picker.Content>
	</Picker.Root>
	<LockButton prop="style" class="absolute top-1/2 right-10 -translate-y-1/2" />
</div>
