<script lang="ts">
	import Example from "../example.svelte";
	import * as Kbd from "$lib/components/ui/kbd/index.js";
</script>

<Example title="KbdGroup">
	<Kbd.Group>
		<Kbd.Root>Ctrl</Kbd.Root>
		<Kbd.Root>Shift</Kbd.Root>
		<Kbd.Root>P</Kbd.Root>
	</Kbd.Group>
</Example>
