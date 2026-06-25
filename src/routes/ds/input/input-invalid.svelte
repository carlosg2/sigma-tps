<script lang="ts">
	import Example from "../example.svelte";
	import * as Input from "$lib/components/ui/input/index.js";
</script>

<Example title="Invalid">
	<Input.Root type="text" placeholder="Error" aria-invalid="true" />
</Example>
