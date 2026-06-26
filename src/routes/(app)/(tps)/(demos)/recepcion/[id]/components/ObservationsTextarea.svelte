<script lang="ts">
	import * as Form from "$lib/components/ui/form/index.js";
	import { Textarea } from "$lib/components/ui/textarea/index.js";
	
	let { 
		form, 
		name, 
		label, 
		placeholder, 
		value = $bindable(),
		rows = 3 
	}: {
		form: any;
		name: string;
		label: string;
		placeholder: string;
		value: string;
		rows?: number;
	} = $props();

	// Asegurar que value siempre tenga un valor válido
	$effect(() => {
		if (value === undefined || value === null) {
			value = "";
		}
	});

	// Variable local para el textarea que siempre tenga un valor válido
	let localValue = $derived(value || "");
</script>

<Form.Field {form} {name}>
	<Form.Control>
		{#snippet children({ props })}
		<Form.Label>{label}</Form.Label>
		<Textarea 
			{...props} 
			value={localValue} 
			oninput={(e) => { 
				value = e.currentTarget.value; 
			}} 
			{placeholder} 
			class="resize-none" 
			{rows} 
		/>
		{/snippet}
	</Form.Control>
	<Form.FieldErrors />
</Form.Field>
