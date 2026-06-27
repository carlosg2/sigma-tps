<script lang="ts">
	import { cn } from '$lib/utils.js';

	let {
		label,
		colorClass,
		class: className
	}: { label: string; colorClass: string; class?: string } = $props();
</script>

<span
	class={cn(
		'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
		colorClass,
		className
	)}
>
	{label}
</span>
