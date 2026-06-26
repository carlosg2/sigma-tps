<script lang="ts">
	import Example from "../example.svelte";
	import { Spinner } from "$lib/components/ui/spinner/index.js";
</script>

<Example title="Basic">
	<div class="flex items-center gap-6">
		<Spinner />
		<Spinner class="size-6" />
	</div>
</Example>
