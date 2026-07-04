<script lang="ts">
	import Example from "../example.svelte";
	import { Calendar } from "$lib/components/ui/calendar/index.js";
	import * as Card from "$lib/components/ui/card/index.js";
</script>

<Example title="Single">
	<Card.Root class="mx-auto w-fit p-0">
		<Card.Content class="p-0">
			<Calendar type="single" captionLayout="dropdown" />
		</Card.Content>
	</Card.Root>
</Example>
