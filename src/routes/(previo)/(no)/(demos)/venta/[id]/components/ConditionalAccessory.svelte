<script lang="ts">
	import * as Form from "$lib/components/ui/form/index.js";
	import { Checkbox } from "$lib/components/ui/checkbox/index.js";
	import { Separator } from "$lib/components/ui/separator/index.js";
	import StateRadioGroup from "./StateRadioGroup.svelte";
	import ObservationsTextarea from "./ObservationsTextarea.svelte";
	
	let { 
		form, 
		name, 
		title, // changed from label for consistency
		label, // backwards compatibility
		presente = $bindable(),
		isPresent = $bindable(), // backwards compatibility
		estado = $bindable(),
		observaciones = $bindable(),
		estadosDisponibles,
		showEstado = true,
		placeholder,
		children
	}: {
		form: any;
		name: string;
		title?: string; // new consistent prop name
		label?: string; // backwards compatibility
		presente?: boolean; // consistent prop name
		isPresent?: boolean; // backwards compatibility
		estado?: string;
		observaciones?: string;
		estadosDisponibles: Array<{ value: string; label: string; color: string }>;
		showEstado?: boolean;
		placeholder?: string;
		children?: any;
	} = $props();
	
	// Handle backwards compatibility
	const displayTitle = title || label || "";
	const isPresentValue = presente !== undefined ? presente : isPresent;

	// Asegurar que presente siempre tenga un valor válido
	$effect(() => {
		if (presente === undefined || presente === null) {
			presente = false;
		}
	});

	// Variable local para el checkbox que siempre tenga un valor válido
	let localChecked = $derived(presente || false);
</script>

<div class="space-y-3">
	<Form.Field {form} name="{name}_presente">
		<Form.Control>
			{#snippet children({ props })}
			<div class="flex items-center space-x-2">
				<Checkbox 
					{...props} 
					checked={localChecked} 
					onCheckedChange={(newChecked) => { 
						presente = newChecked || false; 
					}} 
				/>
				<Form.Label class="text-base font-medium">{displayTitle}</Form.Label>
			</div>
			{/snippet}
		</Form.Control>
	</Form.Field>
	
	{#if presente}
		<div class="ml-6 space-y-3">
			{#if showEstado && estado !== undefined}
				<StateRadioGroup 
					{form} 
					name="{name}_estado" 
					legend="Estado {displayTitle.toLowerCase()}" 
					bind:value={estado} 
					{estadosDisponibles} 
					size="small" 
				/>
			{/if}
			
			{#if observaciones !== undefined}
				<ObservationsTextarea 
					{form} 
					name="{name}_observaciones" 
					label="Observaciones" 
					bind:value={observaciones}
					placeholder={placeholder || "Describe cualquier observación adicional"}
					rows={2}
				/>
			{/if}
			
			{@render children?.()}
		</div>
	{/if}
</div>

<Separator />