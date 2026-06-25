<script lang="ts">
	import Example from "../example.svelte";
	import { Button } from "$lib/components/ui/button/index.js";
	import * as Tooltip from "$lib/components/ui/tooltip/index.js";
	import * as Kbd from "$lib/components/ui/kbd/index.js";
	import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
</script>

<Example title="With Keyboard Shortcut">
	<Tooltip.Root>
		<Tooltip.Trigger>
			{#snippet child({ props })}
				<Button variant="outline" size="icon-sm" {...props}>
					<IconPlaceholder
						lucide="SaveIcon"
						tabler="IconDeviceFloppy"
						hugeicons="FloppyDiskIcon"
						phosphor="FloppyDiskIcon"
						remixicon="RiSaveLine"
					/>
				</Button>
			{/snippet}
		</Tooltip.Trigger>
		<Tooltip.Content class="pr-1.5">
			<div class="flex items-center gap-2">
				Save Changes <Kbd.Root>S</Kbd.Root>
			</div>
		</Tooltip.Content>
	</Tooltip.Root>
</Example>
