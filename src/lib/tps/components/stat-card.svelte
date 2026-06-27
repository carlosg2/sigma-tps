<script lang="ts">
	import type { Component } from 'svelte';
	import { cn } from '$lib/utils.js';

	let {
		label,
		value,
		subtitle,
		icon,
		trend,
		class: className
	}: {
		label: string;
		value: string | number;
		subtitle?: string;
		icon?: Component<{ class?: string }>;
		trend?: { value: string; positive: boolean };
		class?: string;
	} = $props();

	const Icon = $derived(icon);
</script>

<div class={cn('bg-card rounded-lg border p-4', className)}>
	<div class="flex items-start justify-between">
		<div class="flex flex-col gap-1">
			<span class="text-muted-foreground text-xs font-medium">{label}</span>
			<span class="text-card-foreground text-2xl font-bold">{value}</span>
			{#if subtitle}
				<span class="text-muted-foreground text-xs">{subtitle}</span>
			{/if}
			{#if trend}
				<span
					class={cn(
						'text-xs font-medium',
						trend.positive ? 'text-primary' : 'text-destructive'
					)}
				>
					{trend.value}
				</span>
			{/if}
		</div>
		{#if Icon}
			<div
				class="bg-primary/10 text-primary flex h-9 w-9 items-center justify-center rounded-md"
			>
				<Icon class="size-5" />
			</div>
		{/if}
	</div>
</div>
