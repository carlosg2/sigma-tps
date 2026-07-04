<script lang="ts">
	import Example from "../example.svelte";
	import * as Input from "$lib/components/ui/input/index.js";
	import * as Field from "$lib/components/ui/field/index.js";
</script>

<Example title="Disabled">
	<Field.Field>
		<Field.Label for="input-demo-disabled">Email</Field.Label>
		<Input.Root id="input-demo-disabled" type="email" placeholder="Email" disabled />
	</Field.Field>
</Example>
