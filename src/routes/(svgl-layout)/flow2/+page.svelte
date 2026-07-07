<script lang="ts">
	import { navigateWith, type FlowTransition } from './flow-nav.svelte';
	import FlowHeader from './FlowHeader.svelte';
	import './screens.css';

	const transitions: { id: FlowTransition; icon: string; label: string; desc: string }[] = [
		{ id: 'fade', icon: '🌅', label: 'Fade', desc: 'Desvanecimiento con cruce' },
		{ id: 'push', icon: '➡️', label: 'Push', desc: 'Deslizamiento lateral' },
		{ id: 'cover', icon: '📄', label: 'Cover', desc: 'Cobertura sobre profundidad' },
		{ id: 'cover-v', icon: '⬆️', label: 'Cover V', desc: 'Cobertura vertical' },
		{ id: 'dive', icon: '🏊', label: 'Dive', desc: 'Inmersión 3D en Z' },
		{ id: 'parallax', icon: '🌆', label: 'Parallax', desc: 'Efecto paralaje (-20%)' },
		{ id: 'flip', icon: '🔄', label: 'Flip', desc: 'Rotación 3D en Y' },
		{ id: 'circle', icon: '⭕', label: 'Circle', desc: 'Revelado circular' }
	];

	// El picker fuerza una transición concreta hacia /flow2/detail (override).
	// La navegación normal usaría simplemente goto('/flow2/detail').
	function go(transition: FlowTransition) {
		navigateWith('/flow2/detail', transition);
	}
</script>

<FlowHeader title="View Transitions" />

<div class="screen">
	<div class="screen-content">
		<div class="screen-hero">
			<h2>🚀 sveltekit-view-transition</h2>
			<p>Navegación real entre rutas, animada dentro del panel de contenido.</p>
		</div>

		<div class="transition-grid">
			{#each transitions as t (t.id)}
				<button class="transition-btn" onclick={() => go(t.id)}>
					<span class="btn-icon">{t.icon}</span>
					<strong>{t.label}</strong>
					<small>{t.desc}</small>
				</button>
			{/each}
		</div>

		<div class="info-card">
			<h3>💡 Cómo funciona</h3>
			<ul class="info-list">
				<li><span>🧭</span> Cada pantalla es una ruta real de SvelteKit</li>
				<li><span>🎯</span> Sólo el panel de contenido anima (el sidebar queda fijo)</li>
				<li><span>✂️</span> La animación se recorta y no invade el sidebar</li>
				<li><span>♿</span> Respeta <code>prefers-reduced-motion</code></li>
			</ul>
		</div>
	</div>
</div>
