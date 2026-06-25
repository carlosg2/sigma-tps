<script lang="ts">
	import Example from "../example.svelte";
	import { Button } from "$lib/components/ui/button/index.js";
	import * as Tooltip from "$lib/components/ui/tooltip/index.js";
</script>

<Example title="Basic">
	<Tooltip.Root>
		<Tooltip.Trigger>
			{#snippet child({ props })}
				<Button variant="outline" class="w-fit" {...props}>Show Tooltip</Button>
			{/snippet}
		</Tooltip.Trigger>
		<Tooltip.Content>
			<p>Add to library</p>
		</Tooltip.Content>
	</Tooltip.Root>
</Example>
