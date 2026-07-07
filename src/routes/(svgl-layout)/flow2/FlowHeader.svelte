<script lang="ts">
	import PageHeader from '$lib/components/layout/pageHeader.svelte';
	import ArrowLeft from '@lucide/svelte/icons/arrow-left';
	import { flowBack } from './flow-nav.svelte';

	// Props ESTÁTICAS por página. Se renderiza DENTRO de cada +page.svelte (no en
	// el layout) para que el header forme parte del contenido que SvelteKit
	// reemplaza en la navegación: así el snapshot `old` de la view-transition
	// conserva el título de la página saliente y el `new` el de la entrante,
	// sin condiciones de carrera con la reactividad (que sí ocurrían al derivar
	// el título de `page.url` en el layout persistente).
	let { title, showBack = false }: { title: string; showBack?: boolean } = $props();
</script>

<PageHeader>
	<div class="flex items-center gap-2">
		{#if showBack}
			<button
				class="inline-flex items-center gap-1 rounded-md px-2 py-1 text-sm text-neutral-600 transition-colors hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
				onclick={() => flowBack()}
			>
				<ArrowLeft size={16} strokeWidth={1.5} />
				<span>Atrás</span>
			</button>
		{/if}
		<h1 class="text-sm font-medium text-neutral-700 dark:text-neutral-200">{title}</h1>
	</div>
</PageHeader>
