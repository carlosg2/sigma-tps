<script lang="ts">
	import Example from "../example.svelte";
	import * as Empty from "$lib/components/ui/empty/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import { Spinner } from "$lib/components/ui/spinner/index.js";
	import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
</script>

<Example title="In Empty State" containerClass="lg:col-span-full">
	<Empty.Root class="min-h-[300px]">
		<Empty.Header>
			<Empty.Media variant="icon">
				<Spinner />
			</Empty.Media>
			<Empty.Title>No projects yet</Empty.Title>
			<Empty.Description>
				You haven&apos;t created any projects yet. Get started by creating your first
				project.
			</Empty.Description>
		</Empty.Header>
		<Empty.Content>
			<div class="flex gap-2">
				<Button href="#/">Create project</Button>
				<Button variant="outline">Import project</Button>
			</div>
			<Button variant="link" href="#/" class="text-muted-foreground">
				Learn more
				<IconPlaceholder
					lucide="ArrowRightIcon"
					tabler="IconArrowRight"
					hugeicons="ArrowRight02Icon"
					phosphor="ArrowRightIcon"
					remixicon="RiArrowRightLine"
				/>
			</Button>
		</Empty.Content>
	</Empty.Root>
</Example>
