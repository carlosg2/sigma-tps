<script lang="ts">
	import Example from "../example.svelte";
	import * as Kbd from "$lib/components/ui/kbd/index.js";
</script>

<Example title="Modifier Keys">
	<div class="flex items-center gap-2">
		<Kbd.Root>⌘</Kbd.Root>
		<Kbd.Root>C</Kbd.Root>
	</div>
</Example>
