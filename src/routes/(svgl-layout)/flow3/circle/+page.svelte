<script module lang="ts">
	import { defineTransition } from '../flow3-nav';
	defineTransition('/flow3/circle', 'circle');
</script>

<script lang="ts">
	import Flow3Page from '../Flow3Page.svelte';
</script>

<div class="mx-auto flex w-full h-90 flex-col gap-6 p-4 md:p-6 bg-border"></div>

<Flow3Page title="Circle — revelado circular" />
