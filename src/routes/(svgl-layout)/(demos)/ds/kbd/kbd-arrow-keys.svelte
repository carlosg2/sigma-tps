<script lang="ts">
	import Example from "../example.svelte";
	import * as Kbd from "$lib/components/ui/kbd/index.js";
</script>

<Example title="Arrow Keys">
	<div class="flex items-center gap-2">
		<Kbd.Root>↑</Kbd.Root>
		<Kbd.Root>↓</Kbd.Root>
		<Kbd.Root>←</Kbd.Root>
		<Kbd.Root>→</Kbd.Root>
	</div>
</Example>
