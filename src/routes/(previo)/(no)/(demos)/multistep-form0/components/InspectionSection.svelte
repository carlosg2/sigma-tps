<script lang="ts">
	import StateRadioGroup from "./StateRadioGroup.svelte";
	import ObservationsTextarea from "./ObservationsTextarea.svelte";
	import PhotoUpload from "./PhotoUpload.svelte";
	import { Separator } from "$lib/components/ui/separator";

	
	let { 
		form, 
		name, 
		title, 
		estado = $bindable(),
		observaciones = $bindable(),
		fotos = $bindable(),
		estadosDisponibles,
		placeholder,
		isLast = false,
		API_CONFIG
	}: {
		form: any;
		name: string;
		title: string;
		estado: string;
		observaciones: string;
		fotos: File[];
		estadosDisponibles: Array<{ value: string; label: string; color: string }>;
		placeholder: string;
		isLast?: boolean;
		API_CONFIG: any;
	} = $props();
</script>

<div class="space-y-3">
	<StateRadioGroup 
		{form} 
		name="{name}_estado" 
		legend="Estado de {title}" 
		bind:value={estado} 
		{estadosDisponibles} 
	/>

	<!-- Componente de upload de fotos -->
	<PhotoUpload 
		{form} 
		name="{name}_fotos" 
		{title}
		bind:files={fotos}
		maxFiles={3}
		capture="environment"
		{API_CONFIG}
	/>
	
	<ObservationsTextarea 
		{form} 
		name="{name}_observaciones" 
		label="Observaciones de {title}" 
		{placeholder}
		bind:value={observaciones}
	/>

  
</div>

<!-- {#if !isLast}
	<Separator />
{/if} -->
