<script lang="ts">
	import Example from "../example.svelte";
	import { Badge } from "$lib/components/ui/badge/index.js";
	import { Spinner } from "$lib/components/ui/spinner/index.js";
</script>

<Example title="Badge" class="items-center justify-center">
	<div class="flex items-center justify-center gap-2">
		<Badge>
			<Spinner data-icon="inline-start" />
			Syncing
		</Badge>
		<Badge variant="secondary">
			<Spinner data-icon="inline-start" />
			Updating
		</Badge>
		<Badge variant="outline">
			<Spinner data-icon="inline-start" />
			Loading
		</Badge>
		<Badge variant="link" class="hidden sm:flex">
			<Spinner data-icon="inline-start" />
			Link
		</Badge>
	</div>
</Example>
