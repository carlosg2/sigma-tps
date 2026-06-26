<script lang="ts">
	import { MENU_COLORS, type MenuColorValue } from "$lib/ds/index.js";
	import * as Picker from "../picker/index.js";
	import { useDesignSystem } from "$lib/ds/index.js";
	import { IsMobile } from "$lib/hooks/is-mobile.svelte.js";
	import LockButton from "./lock-button.svelte";

	type Props = { submenu?: boolean };
	let { submenu = false }: Props = $props();

	const designSystem = useDesignSystem();
	const isMobile = new IsMobile();

	const currentMenuColor = $derived(
		MENU_COLORS.find((mc) => mc.value === designSystem.menuColor) ?? MENU_COLORS[0]
	);
</script>

<div class="group/picker relative">
	<Picker.Root {submenu}>
		<Picker.Trigger {submenu}>
			<div class="flex flex-col justify-start text-left">
				<div class="text-muted-foreground text-xs">Menu Color</div>
				<div class="text-foreground text-sm font-medium">{currentMenuColor?.label}</div>
			</div>
		</Picker.Trigger>
		<Picker.Content
			side={isMobile.current ? "top" : submenu ? "left" : "right"}
			align={isMobile.current ? "center" : "start"}
			sideOffset={submenu ? 5 : 20}
			{submenu}
		>
			<Picker.RadioGroup bind:value={designSystem.menuColor}>
				<Picker.Group>
					{#each MENU_COLORS as mc (mc.value)}
						<Picker.RadioItem value={mc.value} closeOnSelect={false}>
							{mc.label}
						</Picker.RadioItem>
					{/each}
				</Picker.Group>
			</Picker.RadioGroup>
		</Picker.Content>
	</Picker.Root>
	<LockButton prop="menuColor" class="absolute top-1/2 right-10 -translate-y-1/2" />
</div>
