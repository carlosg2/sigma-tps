<script lang="ts">
	import { RADII, type RadiusValue } from "$lib/ds/index.js";
	import * as Picker from "../picker/index.js";
	import { useDesignSystem } from "$lib/ds/index.js";
	import { IsMobile } from "$lib/hooks/is-mobile.svelte.js";
	import LockButton from "./lock-button.svelte";

	type Props = { submenu?: boolean };
	let { submenu = false }: Props = $props();

	const designSystem = useDesignSystem();
	const isMobile = new IsMobile();

	const currentRadius = $derived(RADII.find((r) => r.name === designSystem.radius) ?? RADII[0]);
</script>

<div class="group/picker relative">
	<Picker.Root {submenu}>
		<Picker.Trigger {submenu}>
			<div class="flex flex-col justify-start text-left">
				<div class="text-muted-foreground text-xs">Radius</div>
				<div class="text-foreground text-sm font-medium">{currentRadius?.label}</div>
			</div>
			<div
				class="pointer-events-none absolute top-1/2 right-4 size-4 -translate-y-1/2 border-2 border-current select-none"
				style="border-radius: {currentRadius?.value}"
			></div>
		</Picker.Trigger>
		<Picker.Content
			side={isMobile.current ? "top" : submenu ? "left" : "right"}
			align={isMobile.current ? "center" : "start"}
			sideOffset={submenu ? 5 : 20}
			{submenu}
		>
			<Picker.RadioGroup bind:value={designSystem.radius}>
				<Picker.Group>
					{#each RADII as radius (radius.name)}
						<Picker.RadioItem value={radius.name} closeOnSelect={false}>
							<div class="flex items-center gap-2">
								<div
									class="size-4 border-2 border-current"
									style="border-radius: {radius.value}"
								></div>
								{radius.label}
							</div>
						</Picker.RadioItem>
					{/each}
				</Picker.Group>
			</Picker.RadioGroup>
		</Picker.Content>
	</Picker.Root>
	<LockButton prop="radius" class="absolute top-1/2 right-10 -translate-y-1/2" />
</div>
