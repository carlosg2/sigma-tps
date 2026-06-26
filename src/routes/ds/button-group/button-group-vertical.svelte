<script lang="ts">
	import Example from "../example.svelte";
	import { ButtonGroup } from "$lib/components/ui/button-group/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import IconPlaceholder from "$lib/components/custom/icon-placeholder/icon-placeholder.svelte";
</script>

<Example title="Vertical">
	<div class="flex gap-6">
		<ButtonGroup orientation="vertical" aria-label="Media controls" class="h-fit">
			<Button variant="outline" size="icon">
				<IconPlaceholder
					lucide="PlusIcon"
					tabler="IconPlus"
					hugeicons="PlusSignIcon"
					phosphor="PlusIcon"
					remixicon="RiAddLine"
				/>
			</Button>
			<Button variant="outline" size="icon">
				<IconPlaceholder
					lucide="MinusIcon"
					tabler="IconMinus"
					hugeicons="MinusSignIcon"
					phosphor="MinusIcon"
					remixicon="RiSubtractLine"
				/>
			</Button>
		</ButtonGroup>
	</div>
</Example>
