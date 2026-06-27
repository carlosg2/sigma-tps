<script lang="ts">
	import type { Component } from 'svelte';
	import { cn } from '$lib/utils.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import TrendingUpIcon from '@lucide/svelte/icons/trending-up';
	import TrendingDownIcon from '@lucide/svelte/icons/trending-down';

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

<Card.Root class={cn('@container/card', className)}>
	<Card.Header>
		<Card.Description>{label}</Card.Description>
		<Card.Title class="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
			{value}
		</Card.Title>
		<Card.Action>
			{#if trend}
				<Badge variant="outline">
					{#if trend.positive}<TrendingUpIcon />{:else}<TrendingDownIcon />{/if}
					{trend.value}
				</Badge>
			{:else if Icon}
				<Icon class="text-muted-foreground size-5" />
			{/if}
		</Card.Action>
	</Card.Header>
	{#if subtitle}
		<Card.Footer class="text-muted-foreground text-sm">
			{subtitle}
		</Card.Footer>
	{/if}
</Card.Root>
