<script lang="ts">
	import Example from "../example.svelte";
	import * as Field from "$lib/components/ui/field/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import { Label } from "$lib/components/ui/label/index.js";
</script>

<Example title="With Input">
	<Field.Field>
		<Label for="label-demo-username">Username</Label>
		<Input id="label-demo-username" placeholder="Username" />
	</Field.Field>
</Example>
