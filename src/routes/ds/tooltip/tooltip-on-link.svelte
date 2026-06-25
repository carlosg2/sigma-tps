<script lang="ts">
	import Example from "../example.svelte";
	import * as Tooltip from "$lib/components/ui/tooltip/index.js";
</script>

<Example title="On Link">
	<Tooltip.Root>
		<Tooltip.Trigger>
			{#snippet child({ props })}
				<a
					href="/"
					class="text-primary w-fit text-sm underline-offset-4 hover:underline"
					onclick={(e) => e.preventDefault()}
					{...props}
				>
					Learn more
				</a>
			{/snippet}
		</Tooltip.Trigger>
		<Tooltip.Content>
			<p>Click to read the documentation</p>
		</Tooltip.Content>
	</Tooltip.Root>
</Example>
