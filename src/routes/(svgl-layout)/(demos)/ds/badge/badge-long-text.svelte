<script lang="ts">
	import Example from "../example.svelte";
	import { Badge } from "$lib/components/ui/badge/index.js";
</script>

<Example title="Long Text">
	<div class="flex flex-wrap gap-2">
		<Badge variant="secondary">A badge with a lot of text to see how it wraps</Badge>
	</div>
</Example>
