<script lang="ts">
	import Example from "../example.svelte";
	import * as Empty from "$lib/components/ui/empty/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import IconPlaceholder from "$lib/components/custom/icon-placeholder/icon-placeholder.svelte";
</script>

<Example title="With Icon">
	<Empty.Root class="border">
		<Empty.Header>
			<Empty.Media variant="icon">
				<IconPlaceholder
					lucide="FolderIcon"
					tabler="IconFolder"
					hugeicons="Folder01Icon"
					phosphor="FolderIcon"
					remixicon="RiFolderLine"
				/>
			</Empty.Media>
			<Empty.Title>Nothing to see here</Empty.Title>
			<Empty.Description>
				No posts have been created yet. Get started by <a href="#/"
					>creating your first post</a
				>.
			</Empty.Description>
		</Empty.Header>
		<Empty.Content>
			<Button variant="outline">
				<IconPlaceholder
					lucide="PlusIcon"
					tabler="IconPlus"
					hugeicons="PlusSignIcon"
					phosphor="PlusIcon"
					remixicon="RiAddLine"
					data-icon="inline-start"
				/>
				New Post
			</Button>
		</Empty.Content>
	</Empty.Root>
</Example>
