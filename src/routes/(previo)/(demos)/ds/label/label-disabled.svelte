<script lang="ts">
	import Example from "../example.svelte";
	import * as Field from "$lib/components/ui/field/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import { Label } from "$lib/components/ui/label/index.js";
</script>

<Example title="Disabled">
	<Field.Field data-disabled={true}>
		<Label for="label-demo-disabled">Disabled</Label>
		<Input id="label-demo-disabled" placeholder="Disabled" disabled />
	</Field.Field>
</Example>
