<script lang="ts">
	import Example from "../example.svelte";
	import { ButtonGroup } from "$lib/components/ui/button-group/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import * as InputGroup from "$lib/components/ui/input-group/index.js";
	import * as Tooltip from "$lib/components/ui/tooltip/index.js";
	import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
</script>

<Example title="Nested">
	<ButtonGroup>
		<ButtonGroup>
			<Button variant="outline" size="icon">
				<IconPlaceholder
					lucide="PlusIcon"
					tabler="IconPlus"
					hugeicons="PlusSignIcon"
					phosphor="PlusIcon"
					remixicon="RiAddLine"
				/>
			</Button>
		</ButtonGroup>
		<ButtonGroup>
			<InputGroup.Root>
				<InputGroup.Input placeholder="Send a message..." />
				<Tooltip.Root>
					<Tooltip.Trigger>
						{#snippet child({ props })}
							<InputGroup.Addon align="inline-end" {...props}>
								<IconPlaceholder
									lucide="AudioLinesIcon"
									tabler="IconHeadphones"
									hugeicons="AudioWave01Icon"
									phosphor="MicrophoneIcon"
									remixicon="RiMicLine"
								/>
							</InputGroup.Addon>
						{/snippet}
					</Tooltip.Trigger>
					<Tooltip.Content>Voice Mode</Tooltip.Content>
				</Tooltip.Root>
			</InputGroup.Root>
		</ButtonGroup>
	</ButtonGroup>
</Example>
