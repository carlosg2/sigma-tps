<script lang="ts">
	import Example from "../example.svelte";
	import { ButtonGroup, ButtonGroupText } from "$lib/components/ui/button-group/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import { Label } from "$lib/components/ui/label/index.js";
</script>

<Example title="With Text">
	<div class="flex flex-col gap-4">
		<ButtonGroup>
			<ButtonGroupText>Text</ButtonGroupText>
			<Button variant="outline">Another Button</Button>
		</ButtonGroup>
		<ButtonGroup>
			<ButtonGroupText>
				{#snippet child({ props })}
					<Label for="input-text" {...props}>GPU Size</Label>
				{/snippet}
			</ButtonGroupText>
			<Input id="input-text" placeholder="Type something here..." />
		</ButtonGroup>
	</div>
</Example>
