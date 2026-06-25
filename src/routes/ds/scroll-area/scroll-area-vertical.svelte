<script lang="ts">
	import Example from "../example.svelte";
	import { ScrollArea } from "$lib/components/ui/scroll-area/index.js";
	import { Separator } from "$lib/components/ui/separator/index.js";

	const tags = Array.from({ length: 50 }).map((_, i, a) => `v1.2.0-beta.${a.length - i}`);
</script>

<Example title="Vertical">
	<ScrollArea
		class="style-luma:rounded-2xl style-rhea:rounded-2xl mx-auto h-72 w-48 rounded-md border"
	>
		<div class="p-4">
			<h4 class="mb-4 text-sm leading-none font-medium">Tags</h4>
			{#each tags as tag (tag)}
				<div class="text-sm">{tag}</div>
				<Separator class="my-2" />
			{/each}
		</div>
	</ScrollArea>
</Example>
