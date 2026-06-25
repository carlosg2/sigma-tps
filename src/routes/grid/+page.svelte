<script lang="ts">
	import GridDemo from './_grid-demo.svelte';
	import { Toaster } from '$lib/components/ui/sonner/index.js';
</script>

<div class="mx-auto flex w-full max-w-350 flex-col gap-4 px-6 py-6">
	<div class="flex items-center justify-between gap-2">
		<div>
			<h1 class="text-2xl font-bold tracking-tight">Demo de tabla de datos</h1>
			<p class="text-sm text-muted-foreground">Demo básico de svelte-tablecn montado en esta app.</p>
		</div>
	</div>

	<GridDemo height={320} />
</div>

<Toaster />
