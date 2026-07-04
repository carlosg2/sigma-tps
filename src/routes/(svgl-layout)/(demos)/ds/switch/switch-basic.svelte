<script lang="ts">
	import Example from "../example.svelte";
	import * as Field from "$lib/components/ui/field/index.js";
	import { Switch } from "$lib/components/ui/switch/index.js";
</script>

<Example title="Basic">
	<Field.Field orientation="horizontal">
		<Switch id="switch-basic" />
		<Field.Label for="switch-basic">Airplane Mode</Field.Label>
	</Field.Field>
</Example>
