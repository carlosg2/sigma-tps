<script lang="ts">
	import { TYPOGRAPHIC_SCALES } from "$lib/ds/index.js";
	import * as Picker from "../picker/index.js";
	import { useDesignSystem } from "$lib/ds/index.js";
	import { IsMobile } from "$lib/hooks/is-mobile.svelte.js";

	type Props = {
		submenu?: boolean;
	};

	let { submenu = false }: Props = $props();

	const designSystem = useDesignSystem();
	const isMobile = new IsMobile();

	const currentScale = $derived(
		TYPOGRAPHIC_SCALES.find((s) => s.value === designSystem.textScale) ?? TYPOGRAPHIC_SCALES[0]
	);
</script>

<div class="group/picker relative">
	<Picker.Root {submenu}>
		<Picker.Trigger {submenu}>
			<div class="flex flex-col justify-start text-left">
				<div class="text-muted-foreground text-xs">Escala tipográfica</div>
				<div class="text-foreground text-sm font-medium">
					{currentScale.label}
				</div>
			</div>
			<div
				class="text-muted-foreground pointer-events-none absolute top-1/2 right-4 flex -translate-y-1/2 items-center justify-center text-xs tabular-nums select-none"
			>
				{currentScale.value}&times;
			</div>
		</Picker.Trigger>
		<Picker.Content
			side={isMobile.current ? "top" : submenu ? "left" : "right"}
			align={isMobile.current ? "center" : "start"}
			sideOffset={submenu ? 5 : 20}
			{submenu}
		>
			<div class="grid grid-cols-3 gap-1 p-2">
				{#each TYPOGRAPHIC_SCALES as scale (scale.value)}
					<button
						type="button"
						class="flex flex-col items-center gap-0.5 rounded-md px-2 py-2 text-center transition-colors {designSystem.textScale ===
						scale.value
							? 'bg-primary text-primary-foreground'
							: 'hover:bg-accent hover:text-accent-foreground'}"
						onclick={() => (designSystem.textScale = scale.value)}
					>
						<span class="text-sm font-semibold tabular-nums">{scale.value}</span>
						<span class="text-[10px] opacity-70">{scale.label}</span>
					</button>
				{/each}
			</div>
		</Picker.Content>
	</Picker.Root>
</div>
