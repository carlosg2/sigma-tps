<script lang="ts">
	import * as Form from "$lib/components/ui/form/index.js";
	import { Checkbox } from "$lib/components/ui/checkbox/index.js";
	
	let { 
		form, 
		name, 
		label, 
		checked = $bindable()
	}: {
		form: any;
		name: string;
		label: string;
		checked: boolean;
	} = $props();
</script>

<Form.Field {form} {name}>
	<Form.Control>
		{#snippet children({ props })}
		<div class="flex items-center space-x-2">
			<Checkbox {...props} bind:checked />
			<Form.Label>{label}</Form.Label>
		</div>
		{/snippet}
	</Form.Control>
</Form.Field>
