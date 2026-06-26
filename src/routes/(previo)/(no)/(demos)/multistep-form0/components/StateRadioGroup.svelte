<script lang="ts">
	import * as Form from "$lib/components/ui/form/index.js";
	import * as RadioGroup from "$lib/components/ui/radio-group/index.js";
	import { Badge } from "$lib/components/ui/badge/index.js";
	
	let { 
		form, 
		name, 
		title,
		legend, // backwards compatibility
		value = $bindable(), 
		estadosDisponibles,
		size = "normal", // "normal" | "small"
		subtitle,
		large = false
	}: {
		form: any;
		name: string;
		title?: string; // new prop name
		legend?: string; // old prop name for backwards compatibility
		value: string;
		estadosDisponibles: Array<{ value: string; label: string; color: string }>;
		size?: "normal" | "small";
		subtitle?: string;
		large?: boolean;
	} = $props();
	
	const isSmall = size === "small";
	const displayTitle = title || legend || "";
	const isLarge = large || false;
</script>

<Form.Fieldset {form} {name} class="space-y-3">
	<Form.Legend class={isLarge ? "text-lg font-medium" : isSmall ? "text-sm" : "text-base font-medium"}>{displayTitle}</Form.Legend>
	<RadioGroup.Root bind:value class={`grid grid-cols-2 gap-${isLarge ? '4' : isSmall ? '2' : '3'} sm:grid-cols-4`}>
		{#each estadosDisponibles as { value: optionValue, label, color }}
			<Form.Control>
				{#snippet children({ props })}
				<Form.Label class={`${isLarge ? 'p-4' : isSmall ? 'p-2' : 'p-3'} flex flex-col items-center ${isSmall ? 'text-xs' : 'text-sm'} cursor-pointer transition-all duration-300 rounded-lg
					border-2 border-border hover:border-primary/50 [&:has([data-state=checked])]:border-primary [&:has([data-state=checked])]:bg-primary/5`}>
					<RadioGroup.Item value={optionValue} class="sr-only" aria-label={label} {...props} />
					{#if isSmall}
						<Badge variant="outline" class="{color} text-xs">{label}</Badge>
					{:else}
						{label}
					{/if}
					{#if subtitle && isLarge}
						<span class="text-xs text-muted-foreground text-center">{subtitle}</span>
					{/if}
				</Form.Label>
				{/snippet}
			</Form.Control>
		{/each}
	</RadioGroup.Root>
	<Form.FieldErrors />
</Form.Fieldset>
