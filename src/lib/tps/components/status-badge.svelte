<script lang="ts">
	import { cn } from '$lib/utils.js';
	import { Badge } from '$lib/components/ui/badge/index.js';

	let {
		label,
		colorClass,
		class: className
	}: { label: string; colorClass: string; class?: string } = $props();
</script>

<Badge variant="outline" class={cn('border-transparent font-medium', colorClass, className)}>
	{label}
</Badge>
