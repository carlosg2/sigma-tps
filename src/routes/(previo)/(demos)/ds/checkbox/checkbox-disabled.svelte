<script lang="ts">
	import Example from "../example.svelte";
	import * as Checkbox from "$lib/components/ui/checkbox/index.js";
	import * as Field from "$lib/components/ui/field/index.js";
</script>

<Example title="Disabled">
	<Field.Field orientation="horizontal">
		<Checkbox.Root id="toggle" disabled />
		<Field.Label for="toggle">Enable notifications</Field.Label>
	</Field.Field>
</Example>
