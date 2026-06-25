<script lang="ts">
	import Example from "../example.svelte";
	import { Textarea } from "$lib/components/ui/textarea/index.js";
</script>

<Example title="Invalid">
	<Textarea placeholder="Type your message here." aria-invalid="true" />
</Example>
