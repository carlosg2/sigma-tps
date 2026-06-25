<script lang="ts">
	import Example from "../example.svelte";
	import { Button } from "$lib/components/ui/button/index.js";
	import * as Tooltip from "$lib/components/ui/tooltip/index.js";
	import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
</script>

<Example title="With Icon">
	<Tooltip.Root>
		<Tooltip.Trigger>
			{#snippet child({ props })}
				<Button variant="ghost" size="icon" {...props}>
					<IconPlaceholder
						lucide="InfoIcon"
						tabler="IconInfoCircle"
						hugeicons="AlertCircleIcon"
						phosphor="InfoIcon"
						remixicon="RiInformationLine"
					/>
					<span class="sr-only">Info</span>
				</Button>
			{/snippet}
		</Tooltip.Trigger>
		<Tooltip.Content>
			<p>Additional information</p>
		</Tooltip.Content>
	</Tooltip.Root>
</Example>
