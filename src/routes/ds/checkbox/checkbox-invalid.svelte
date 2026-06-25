<script lang="ts">
	import Example from "../example.svelte";
	import * as Checkbox from "$lib/components/ui/checkbox/index.js";
	import * as Field from "$lib/components/ui/field/index.js";
</script>

<Example title="Invalid">
	<Field.Field orientation="horizontal" data-invalid>
		<Checkbox.Root id="terms-3" aria-invalid />
		<Field.Label for="terms-3">Accept terms and conditions</Field.Label>
	</Field.Field>
</Example>
