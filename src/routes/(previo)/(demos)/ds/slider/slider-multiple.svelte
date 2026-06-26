<script lang="ts">
	import Example from "../example.svelte";
	import { Slider } from "$lib/components/ui/slider/index.js";
</script>

<Example title="Multiple Thumbs">
	<Slider type="multiple" value={[10, 20, 70]} max={100} step={10} />
</Example>
