<script lang="ts">
	import Example from "../example.svelte";
	import * as Empty from "$lib/components/ui/empty/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import IconPlaceholder from "$lib/components/custom/icon-placeholder/icon-placeholder.svelte";
</script>

<Example title="With Muted Background">
	<Empty.Root class="bg-muted">
		<Empty.Header>
			<Empty.Title>No results found</Empty.Title>
			<Empty.Description>
				No results found for your search. Try adjusting your search terms.
			</Empty.Description>
		</Empty.Header>
		<Empty.Content>
			<Button>Try again</Button>
			<Button variant="link" href="#/" class="text-muted-foreground">
				Learn more
				<IconPlaceholder
					lucide="ArrowUpRightIcon"
					tabler="IconArrowUpRight"
					hugeicons="ArrowUpRight01Icon"
					phosphor="ArrowUpRightIcon"
					remixicon="RiArrowRightUpLine"
				/>
			</Button>
		</Empty.Content>
	</Empty.Root>
</Example>
