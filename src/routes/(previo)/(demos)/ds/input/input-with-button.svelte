<script lang="ts">
	import Example from "../example.svelte";
	import * as Input from "$lib/components/ui/input/index.js";
	import * as Button from "$lib/components/ui/button/index.js";
</script>

<Example title="With Button">
	<div class="flex w-full gap-2">
		<Input.Root type="search" placeholder="Search..." class="flex-1" />
		<Button.Root>Search</Button.Root>
	</div>
</Example>
