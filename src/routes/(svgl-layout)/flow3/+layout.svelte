<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { setupViewTransition } from '$lib/vewtransitions';
	import { ALL_FLOW_TRANSITIONS, type FlowTransition } from './flow3-nav';
	import { page } from '$app/state';
	import PageCard from '$lib/components/layout/pageCard.svelte';
	import './transitions.css';

	let { children } = $props();

	const { transition, on } = setupViewTransition();

	// Estado compartido entre los handlers del ciclo de view-transition.
	let _isBack = false;

	// backward: $page.data.transition aún es la página ORIGEN → aplicar ya.
	const offBefore = on(
		'before-start-view-transition',
		({ navigation }) => {
			_isBack = navigation.type === 'popstate' && (navigation.delta ?? 0) < 0;
			if (_isBack) {
				const t = (page.data.transition as FlowTransition) ?? 'fade';
				document.documentElement.classList.add(t, 'backward');
			}
		},
		{ autoWrap: false, autoClean: false }
	);

	// forward: await navigation.complete ya resolvió → $page.data es el DESTINO.
	// El callback de startViewTransition todavía no terminó: el nuevo snapshot
	// aún no se ha tomado, así que la clase queda incluida en él.
	const offAfter = on(
		'after-navigation-complete',
		() => {
			if (!_isBack) {
				const t = (page.data.transition as FlowTransition) ?? 'fade';
				document.documentElement.classList.add(t, 'forward');
			}
		},
		{ autoWrap: false, autoClean: false }
	);

	const offFinished = on(
		'transition-finished',
		() => {
			document.documentElement.classList.remove(...ALL_FLOW_TRANSITIONS, 'forward', 'backward');
		},
		{ autoWrap: false, autoClean: false }
	);

	onDestroy(() => {
		offBefore(false);
		offAfter(false);
		offFinished(false);
	});

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

