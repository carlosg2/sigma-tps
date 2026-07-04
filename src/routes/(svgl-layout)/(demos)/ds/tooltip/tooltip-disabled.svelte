<script lang="ts">
	import Example from "../example.svelte";
	import { Button } from "$lib/components/ui/button/index.js";
	import * as Tooltip from "$lib/components/ui/tooltip/index.js";
</script>

<Example title="Disabled">
	<Tooltip.Root>
		<Tooltip.Trigger>
			{#snippet child({ props })}
				<span class="inline-block w-fit" {...props}>
					<Button variant="outline" disabled>Disabled</Button>
				</span>
			{/snippet}
		</Tooltip.Trigger>
		<Tooltip.Content>
			<p>This feature is currently unavailable</p>
		</Tooltip.Content>
	</Tooltip.Root>
</Example>
