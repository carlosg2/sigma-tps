<script lang="ts">
	import { flowForward, type FlowTransition } from '../flow-nav.svelte';
	import FlowHeader from '../FlowHeader.svelte';
	import '../screens.css';

	const nextTransitions: { id: FlowTransition; icon: string; label: string }[] = [
		{ id: 'flip', icon: '🔄', label: 'Flip' },
		{ id: 'cover', icon: '📄', label: 'Cover' },
		{ id: 'dive', icon: '🏊', label: 'Dive' }
	];

	function goExtra(transition: FlowTransition) {
		flowForward('/flow2/detail', '/flow2/extra', transition);
	}
</script>

<FlowHeader title="Página de Detalle" showBack />

<div class="screen">
	<div class="screen-content">
		<div class="success-banner">
			<div class="big-icon">✅</div>
			<h2>¡Transición completada!</h2>
			<p>Esta ruta se cargó con la View Transitions API a través de la librería.</p>
		</div>

		<div>
			<h3>Continúa navegando</h3>
			<div class="transition-grid">
				{#each nextTransitions as t (t.id)}
					<button class="transition-btn" onclick={() => goExtra(t.id)}>
						<span class="btn-icon">{t.icon}</span>
						<strong>Página 3</strong>
						<small>{t.label}</small>
					</button>
				{/each}
			</div>
		</div>

		<div class="info-card">
			<h3>🎯 Ventajas de esta implementación</h3>
			<ul class="info-list">
				<li><span>✅</span> Transiciones bidireccionales (forward/backward)</li>
				<li><span>✅</span> Historial propio para volver con la misma animación</li>
				<li><span>✅</span> URL real por pantalla (compartible, back del navegador)</li>
				<li><span>✅</span> Sin swap manual del DOM ni overlays</li>
			</ul>
		</div>
	</div>
</div>
