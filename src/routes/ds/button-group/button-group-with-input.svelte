<script lang="ts">
	import Example from "../example.svelte";
	import { ButtonGroup } from "$lib/components/ui/button-group/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
</script>

<Example title="With Input">
	<div class="flex flex-col gap-4">
		<ButtonGroup>
			<Button variant="outline">Button</Button>
			<Input placeholder="Type something here..." />
		</ButtonGroup>
		<ButtonGroup>
			<Input placeholder="Type something here..." />
			<Button variant="outline">Button</Button>
		</ButtonGroup>
	</div>
</Example>
