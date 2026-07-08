<script lang="ts">
	import { onMount } from 'svelte';
	import { setupViewTransition } from '$lib/vewtransitions';
	import { resolveTransition } from './flow3-nav';
	import PageCard from '$lib/components/layout/pageCard.svelte';
	import './transitions.css';

	let { children } = $props();

	const { transition, classes } = setupViewTransition();

	// La animación se deriva ÚNICAMENTE del objeto `navigation`: la transición
	// es la que cada página declaró con `defineTransition` (ver flow3-nav.ts).
	// No hay estado que mantener, así que la navegación no lineal nunca aplica
	// la animación equivocada.
	classes(({ navigation }) =>
		resolveTransition({
			type: navigation.type,
			delta: navigation.delta,
			from: navigation.from ? { url: navigation.from.url } : null,
			to: navigation.to ? { url: navigation.to.url } : null
		})
	);

	// Mientras el layout de /flow3 esté montado dejamos el `root` estático
	// (sidebar + header no animan) y sólo anima el panel `content`.
	onMount(() => {
		document.documentElement.classList.add('flow3-active');
		return () => document.documentElement.classList.remove('flow3-active');
	});
</script>

<svelte:head>
	<title>flow3 — transición por página</title>
</svelte:head>

<div class="flow3-content w-full" use:transition={'content'}>
	<PageCard containerClass="bg-card">
		{@render children?.()}
	</PageCard>
</div>

