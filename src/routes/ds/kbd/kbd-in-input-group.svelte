<script lang="ts">
	import Example from "../example.svelte";
	import * as InputGroup from "$lib/components/ui/input-group/index.js";
	import * as Kbd from "$lib/components/ui/kbd/index.js";
</script>

<Example title="InputGroup">
	<InputGroup.Root>
		<InputGroup.Input />
		<InputGroup.Addon>
			<Kbd.Root>Space</Kbd.Root>
		</InputGroup.Addon>
	</InputGroup.Root>
</Example>
