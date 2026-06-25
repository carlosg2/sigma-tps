<script lang="ts">
	import * as Form from "$lib/components/ui/form/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	
	let { 
		form, 
		name, 
		label, 
		placeholder = "", 
		value = $bindable(),
		required = false,
		type = "text",
		...restProps 
	}: {
		form: any;
		name: string;
		label: string;
		placeholder?: string;
		value: string;
		required?: boolean;
		type?: string;
	} = $props();

	// Asegurar que value siempre tenga un valor válido
	$effect(() => {
		if (value === undefined || value === null) {
			value = "";
		}
	});

	// Variable local para el input que siempre tenga un valor válido
	let localValue = $derived(value || "");
</script>

<Form.Field {form} {name}>
	<Form.Control>
		{#snippet children({ props })}
		<Form.Label class={required ? "after:content-['*'] after:ml-0.5 after:text-destructive" : ""}>
			{label}
		</Form.Label>
		<Input 
			{...props} 
			{...restProps} 
			value={localValue} 
			oninput={(e) => { 
				value = e.currentTarget.value; 
			}} 
			{placeholder} 
			{type} 
		/>
		{/snippet}
	</Form.Control>
	<Form.FieldErrors />
</Form.Field>
