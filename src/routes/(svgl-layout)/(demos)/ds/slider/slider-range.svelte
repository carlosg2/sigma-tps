<script lang="ts">
	import Example from "../example.svelte";
	import { Slider } from "$lib/components/ui/slider/index.js";
</script>

<Example title="Range">
	<Slider type="multiple" value={[25, 50]} max={100} step={5} />
</Example>
