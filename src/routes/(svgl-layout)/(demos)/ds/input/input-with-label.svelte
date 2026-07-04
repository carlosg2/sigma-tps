<script lang="ts">
	import Example from "../example.svelte";
	import * as Input from "$lib/components/ui/input/index.js";
	import * as Field from "$lib/components/ui/field/index.js";
</script>

<Example title="With Label">
	<Field.Field>
		<Field.Label for="input-demo-email">Email</Field.Label>
		<Input.Root id="input-demo-email" type="email" placeholder="name@example.com" />
	</Field.Field>
</Example>
