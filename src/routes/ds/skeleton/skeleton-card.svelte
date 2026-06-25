<script lang="ts">
	import Example from "../example.svelte";
	import * as Card from "$lib/components/ui/card/index.js";
	import { Skeleton } from "$lib/components/ui/skeleton/index.js";
</script>

<Example title="Card">
	<Card.Root class="w-full">
		<Card.Header>
			<Skeleton class="h-4 w-2/3" />
			<Skeleton class="h-4 w-1/2" />
		</Card.Header>
		<Card.Content>
			<Skeleton class="aspect-square w-full" />
		</Card.Content>
	</Card.Root>
</Example>
