<script lang="ts">
	import Example from "../example.svelte";
	import { Checkbox } from "$lib/components/ui/checkbox/index.js";
	import * as Field from "$lib/components/ui/field/index.js";
	import { Label } from "$lib/components/ui/label/index.js";
</script>

<Example title="With Checkbox">
	<Field.Field orientation="horizontal">
		<Checkbox id="label-demo-terms" />
		<Label for="label-demo-terms">Accept terms and conditions</Label>
	</Field.Field>
</Example>
