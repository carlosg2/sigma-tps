<script lang="ts">
	import Example from "../example.svelte";
	import * as Field from "$lib/components/ui/field/index.js";
	import { Textarea } from "$lib/components/ui/textarea/index.js";
</script>

<Example title="With Label">
	<Field.Field>
		<Field.Label for="textarea-demo-message">Message</Field.Label>
		<Textarea id="textarea-demo-message" placeholder="Type your message here." rows={6} />
	</Field.Field>
</Example>
