<script lang="ts">
	import { useRentasStore } from '$lib/tps/rentas/store.svelte.js';
	import { FLOW_STEPS } from '$lib/tps/rentas/constants.js';
	import { Progress } from '$lib/components/ui/progress/index.js';
	import CircleCheck from '@lucide/svelte/icons/circle-check-big';
	import Circle from '@lucide/svelte/icons/circle';
	import ArrowRight from '@lucide/svelte/icons/arrow-right';

	let { folio }: { folio: string } = $props();

	const store = useRentasStore();
	const status = $derived(store.flowStatusFor(folio));
	const progress = $derived(store.flowProgress(folio));
	const nextStep = $derived(FLOW_STEPS.find((s) => !status[s.id]));
</script>

<div class="flex flex-col gap-4">
	<div class="flex items-center justify-between text-sm">
		<span class="text-muted-foreground">Control operativo del flujo</span>
		<span class="font-semibold tabular-nums">{progress.pct}% · {progress.done}/{progress.total} pasos</span>
	</div>
	<Progress value={progress.pct} />

	<div class="grid grid-cols-1 gap-2 sm:grid-cols-2">
		{#each FLOW_STEPS as step (step.id)}
			{@const done = status[step.id]}
			<div class="flex items-center gap-2 text-sm">
				{#if done}
					<CircleCheck class="size-4 shrink-0 text-emerald-500" />
					<span>{step.label}</span>
				{:else}
					<Circle class="text-muted-foreground/40 size-4 shrink-0" />
					<span class="text-muted-foreground">{step.label}</span>
				{/if}
			</div>
		{/each}
	</div>

	<div class="text-muted-foreground flex items-center gap-1.5 text-sm">
		{#if nextStep}
			<ArrowRight class="size-4 shrink-0" />
			<span>Próximo paso: <span class="text-foreground font-medium">{nextStep.label}</span></span>
		{:else}
			<CircleCheck class="size-4 shrink-0 text-emerald-500" />
			<span class="text-foreground font-medium">Flujo completado. Unidad lista para salida.</span>
		{/if}
	</div>
</div>
