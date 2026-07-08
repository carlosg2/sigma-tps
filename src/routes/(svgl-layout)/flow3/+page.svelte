<script module lang="ts">
	import { defineTransition } from './flow3-nav';
	// La CONFIG de la transición vive aquí, dentro de la página.
	defineTransition('/flow3', 'fade');
</script>

<script lang="ts">
	import Flow3Page from './Flow3Page.svelte';
</script>

<Flow3Page title="Fade — desvanecimiento con cruce" />
