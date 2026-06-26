<script lang="ts">
	import Example from "../example.svelte";
	import { Slider } from "$lib/components/ui/slider/index.js";
</script>

<Example title="Disabled">
	<Slider type="single" value={50} max={100} step={1} disabled />
</Example>
