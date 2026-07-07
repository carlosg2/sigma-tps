<script lang="ts">
	import { flowForward } from '../flow-nav.svelte';
	import FlowHeader from '../FlowHeader.svelte';
	import '../screens.css';
</script>

<FlowHeader title="Página Extra" showBack />

<div class="screen">
	<div class="screen-content">
		<div class="success-banner">
			<div class="big-icon">🎯</div>
			<h2>Tercer nivel de navegación</h2>
			<p>El historial reversible permite volver con la misma animación, invertida.</p>
		</div>

		<div>
			<h3>Acciones</h3>
			<div class="transition-grid">
				<button
					class="transition-btn"
					onclick={() => flowForward('/flow2/extra', '/flow2', 'circle')}
				>
					<span class="btn-icon">🏠</span>
					<strong>Ir a Inicio</strong>
					<small>Circle</small>
				</button>
				<button
					class="transition-btn"
					onclick={() => flowForward('/flow2/extra', '/flow2/detail', 'parallax')}
				>
					<span class="btn-icon">↩️</span>
					<strong>Ir a Detalle</strong>
					<small>Parallax</small>
				</button>
			</div>
		</div>

		<div class="info-card">
			<h3>🎯 Historial reversible</h3>
			<ul class="info-list">
				<li><span>↩️</span> El botón «Atrás» reutiliza la misma transición, invertida</li>
				<li><span>🔗</span> Cada pantalla es una URL real (compartible, back del navegador)</li>
			</ul>
		</div>
	</div>
</div>
