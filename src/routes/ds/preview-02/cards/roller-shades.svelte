<script lang="ts">
	import * as Card from "$lib/components/ui/card/index.js";
	import { Slider } from "$lib/components/ui/slider/index.js";
	import * as ToggleGroup from "$lib/components/ui/toggle-group/index.js";

	let position = $state([50]);

	const preset = $derived.by(() => {
		const p = position[0];
		if (p <= 10) return "open";
		if (p >= 90) return "closed";
		return "half";
	});

	function onPresetChange(v: string | undefined) {
		if (v == "open") {
			position = [0];
		} else if (v == "half") {
			position = [50];
		} else if (v == "closed") {
			position = [100];
		}
	}
</script>

<Card.Root>
	<Card.Header>
		<Card.Title>Sede principal</Card.Title>
		<Card.Description>Persianas del edificio</Card.Description>
	</Card.Header>
	<Card.Content class="flex flex-col gap-4">
		<div class="bg-muted flex h-32 flex-col overflow-hidden rounded-lg border">
			<div
				class="bg-muted-foreground transition-all duration-300"
				style:height="{position[0]}%"
			></div>
		</div>
		<div class="flex items-center gap-3">
			<span class="text-muted-foreground text-xs font-medium tracking-wider uppercase"
				>Abierta</span
			>
			<Slider type="multiple" bind:value={position} max={100} class="flex-1" />
			<span class="text-muted-foreground text-xs font-medium tracking-wider uppercase"
				>Cerrada</span
			>
		</div>
	</Card.Content>
	<Card.Footer>
		<ToggleGroup.Root
			type="single"
			value={preset}
			onValueChange={onPresetChange}
			variant="outline"
			spacing={1}
			class="w-full"
		>
			<ToggleGroup.Item value="open" class="flex-1">Abierta</ToggleGroup.Item>
			<ToggleGroup.Item value="half" class="flex-1">Media</ToggleGroup.Item>
			<ToggleGroup.Item value="closed" class="flex-1">Cerrada</ToggleGroup.Item>
		</ToggleGroup.Root>
	</Card.Footer>
</Card.Root>
