<script lang="ts">
	import Example from "../example.svelte";
	import * as Checkbox from "$lib/components/ui/checkbox/index.js";
	import * as Field from "$lib/components/ui/field/index.js";
</script>

<Example title="Basic">
	<Field.Field orientation="horizontal">
		<Checkbox.Root id="terms" />
		<Field.Label for="terms">Accept terms and conditions</Field.Label>
	</Field.Field>
</Example>
