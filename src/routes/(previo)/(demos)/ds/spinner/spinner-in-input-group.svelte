<script lang="ts">
	import Example from "../example.svelte";
	import * as Field from "$lib/components/ui/field/index.js";
	import * as InputGroup from "$lib/components/ui/input-group/index.js";
	import { Spinner } from "$lib/components/ui/spinner/index.js";
</script>

<Example title="In Input Group">
	<Field.Field>
		<Field.Label for="input-group-spinner">Input Group</Field.Label>
		<InputGroup.Root>
			<InputGroup.Input id="input-group-spinner" />
			<InputGroup.Addon>
				<Spinner />
			</InputGroup.Addon>
		</InputGroup.Root>
	</Field.Field>
</Example>
