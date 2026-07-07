<script lang="ts">
	import { onMount } from 'svelte';
	import { setupViewTransition } from '$lib/vewtransitions';
	import { flowNav } from './flow-nav.svelte';
	import PageCard from '$lib/components/layout/pageCard.svelte';
	import './transitions.css';

	let { children } = $props();

	const { transition, classes } = setupViewTransition();

	// En cada navegación aplica al <html> la clase del tipo de transición
	// elegido + la dirección. transitions.css usa estas clases para decidir
	// qué keyframes correr sobre el grupo `content`.
	classes(() => [flowNav.transition, flowNav.direction]);

	// Mientras el layout de /flow2 esté montado, marcamos el <html> para
	// dejar el `root` estático (sidebar + header no animan, ver transitions.css)
	// y que sólo anime el panel de contenido (grupo `content`).
	onMount(() => {
		document.documentElement.classList.add('flow2-active');
		return () => document.documentElement.classList.remove('flow2-active');
	});
</script>

<svelte:head>
	<title>flow2 — view transitions</title>
</svelte:head>

<!-- El grupo `content` envuelve el PageCard para que el panel entero (incluido
     el header que renderiza cada página) anime como una unidad. El sidebar y el
     header principal quedan fuera y permanecen estáticos.
     El header NO se renderiza aquí: cada +page.svelte monta su propio FlowHeader
     para que forme parte del contenido que SvelteKit reemplaza y los snapshots
     old/new conserven cada uno su título correcto. -->
<div class="flow2-content" use:transition={'content'}>
	<PageCard containerClass="bg-card">
		{@render children?.()}
	</PageCard>
</div>

<style>
	/* El wrapper del grupo `content` sólo aporta el contexto de layout; los
	   visuales (borde, radio, fondo) los pone PageCard. El margen superior va
	   AQUÍ (no dentro de PageCard) para que quede FUERA del snapshot de la
	   transición y no aparezca una franja transparente sobre la tarjeta. */
	.flow2-content {
		width: 100%;
		margin-top: 0.5rem;
	}
</style>
