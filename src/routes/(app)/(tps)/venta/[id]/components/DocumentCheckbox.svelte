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

	// Asegurar que checked siempre tenga un valor válido
	$effect(() => {
		if (checked === undefined || checked === null) {
			checked = false;
		}
	});

	// Variable local para el checkbox que siempre tenga un valor válido
	let localChecked = $derived(checked || false);
</script>

<Form.Field {form} {name}>
	<Form.Control>
		{#snippet children({ props })}
		<div class="flex items-center space-x-2">
			<Checkbox 
				{...props} 
				checked={localChecked} 
				onCheckedChange={(newChecked) => { 
					checked = newChecked || false; 
				}} 
			/>
			<Form.Label>{label}</Form.Label>
		</div>
		{/snippet}
	</Form.Control>
</Form.Field>
