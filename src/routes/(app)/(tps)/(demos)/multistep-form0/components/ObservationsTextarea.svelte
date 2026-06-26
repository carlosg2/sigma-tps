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
</script>

<Form.Field {form} {name}>
	<Form.Control>
		{#snippet children({ props })}
		<Form.Label>{label}</Form.Label>
		<Textarea {...props} bind:value {placeholder} class="resize-none" {rows} />
		{/snippet}
	</Form.Control>
	<Form.FieldErrors />
</Form.Field>
