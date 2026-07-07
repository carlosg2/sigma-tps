<script lang="ts">
	import FlowHeader from '../FlowHeader.svelte';
	import '../screens.css';
</script>

<FlowHeader title="Página Extra" showBack />

<div class="screen">
	<div class="screen-content">
		<div class="success-banner">
			<div class="big-icon">🎯</div>
			<h2>Tercer nivel de navegación</h2>
			<p>Cada ruta define su transición; al entrar o salir se aplica (invertida al volver).</p>
		</div>

		<div>
			<h3>Acciones</h3>
			<div class="transition-grid">
				<a class="transition-btn" href="/flow2">
					<span class="btn-icon">🏠</span>
					<strong>Ir a Inicio</strong>
					<small>Transición de /flow2 (fade)</small>
				</a>
				<a class="transition-btn" href="/flow2/detail">
					<span class="btn-icon">↩️</span>
					<strong>Ir a Detalle</strong>
					<small>Transición de /flow2/detail (push)</small>
				</a>
			</div>
		</div>

		<div class="info-card">
			<h3>🎯 Sin registro de navegación</h3>
			<ul class="info-list">
				<li><span>🔗</span> Navegación normal con <code>&lt;a href&gt;</code>: el destino define su animación</li>
				<li><span>↩️</span> El botón «Atrás» invierte la transición con la que se entró</li>
				<li><span>🧭</span> Romper la secuencia (ir a otra ruta) nunca aplica la animación equivocada</li>
			</ul>
		</div>
	</div>
</div>
