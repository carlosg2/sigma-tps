<script lang="ts">
	import Example from "../example.svelte";
	import { Skeleton } from "$lib/components/ui/skeleton/index.js";
</script>

<Example title="Text">
	<div class="flex w-full flex-col gap-2">
		<Skeleton class="h-4 w-full" />
		<Skeleton class="h-4 w-full" />
		<Skeleton class="h-4 w-3/4" />
	</div>
</Example>
