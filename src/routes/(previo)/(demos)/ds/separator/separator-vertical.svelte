<script lang="ts">
	import Example from "../example.svelte";
	import { Separator } from "$lib/components/ui/separator/index.js";
</script>

<Example title="Vertical">
	<div class="style-lyra:text-xs/relaxed flex h-5 items-center gap-4 text-sm">
		<div>Blog</div>
		<Separator orientation="vertical" />
		<div>Docs</div>
		<Separator orientation="vertical" />
		<div>Source</div>
	</div>
</Example>
