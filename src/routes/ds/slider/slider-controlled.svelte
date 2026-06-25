<script lang="ts">
	import Example from "../example.svelte";
	import { Label } from "$lib/components/ui/label/index.js";
	import { Slider } from "$lib/components/ui/slider/index.js";

	let value = $state([0.3, 0.7]);
</script>

<Example title="Controlled">
	<div class="grid w-full gap-3">
		<div class="flex items-center justify-between gap-2">
			<Label for="slider-demo-temperature">Temperature</Label>
			<span class="text-muted-foreground text-sm">
				{value.join(", ")}
			</span>
		</div>
		<Slider
			id="slider-demo-temperature"
			type="multiple"
			bind:value
			min={0}
			max={1}
			step={0.1}
		/>
	</div>
</Example>
