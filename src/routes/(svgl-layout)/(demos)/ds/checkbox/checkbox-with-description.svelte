<script lang="ts">
	import Example from "../example.svelte";
	import * as Checkbox from "$lib/components/ui/checkbox/index.js";
	import * as Field from "$lib/components/ui/field/index.js";
</script>

<Example title="With Description">
	<Field.Field orientation="horizontal">
		<Checkbox.Root id="terms-2" checked />
		<Field.Content>
			<Field.Label for="terms-2">Accept terms and conditions</Field.Label>
			<Field.Description>
				By clicking this checkbox, you agree to the terms and conditions.
			</Field.Description>
		</Field.Content>
	</Field.Field>
</Example>
