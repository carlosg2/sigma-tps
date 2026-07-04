<script lang="ts">
	import Example from "../example.svelte";
	import * as Field from "$lib/components/ui/field/index.js";
	import { Label } from "$lib/components/ui/label/index.js";
	import { Textarea } from "$lib/components/ui/textarea/index.js";
</script>

<Example title="With Textarea">
	<Field.Field>
		<Label for="label-demo-message">Message</Label>
		<Textarea id="label-demo-message" placeholder="Message" />
	</Field.Field>
</Example>
