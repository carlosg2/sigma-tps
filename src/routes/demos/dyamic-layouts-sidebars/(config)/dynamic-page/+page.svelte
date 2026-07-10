<script lang="ts">
	import { onMount } from "svelte";
	import { cn } from "$lib/utils.js";

	// Refs
	let root = $state<HTMLElement>();
	let headerEl = $state<HTMLElement>();
	let heroEl = $state<HTMLElement>();
	let bottomEl = $state<HTMLElement>();

	// Estado
	let sda = $state(true); // Scroll-Driven Animations soportadas
	let manualExpanded = $state(false);
	let animating = $state(false); // Transición manual (expandir/contraer) en curso
	let scrollY = $state(0);

	const DURATION = 280; // ms — debe coincidir con la transición CSS de .animating

	// Se leen de las CSS custom props en onMount (para no duplicar valores)
	let expanded = 180;
	let collapsed = 64;
	let range = 140;

	const isCollapsed = $derived(scrollY >= range * 0.99);
	const showToggle = $derived(manualExpanded || isCollapsed);

	const items = Array.from({ length: 60 }, (_, i) => i + 1);

	const clamp01 = (x: number) => Math.max(0, Math.min(1, x));

	function readVar(name: string, fallback: number) {
		if (!root) return fallback;
		const n = parseFloat(getComputedStyle(root).getPropertyValue(name));
		return Number.isFinite(n) ? n : fallback;
	}

	onMount(() => {
		sda = typeof CSS !== "undefined" && CSS.supports?.("animation-timeline: scroll()");
		expanded = readVar("--expanded", expanded);
		collapsed = readVar("--collapsed", collapsed);
		range = readVar("--collapse-range", range);
		scrollY = window.scrollY;
		if (!sda) applyFallback();
	});

	// Estilos del cabecero para un progreso de colapso t (0 = expandido, 1 = colapsado)
	function frameStyle(t: number) {
		return {
			height: `${expanded + (collapsed - expanded) * t}px`,
			opacity: `${1 - t}`,
			transform: `perspective(600px) translateY(${-6 * t}px) translateZ(${-40 * t}px)`,
		};
	}

	function setFrame(s: { height: string; opacity: string; transform: string }) {
		if (!headerEl || !heroEl || !bottomEl) return;
		headerEl.style.height = s.height;
		heroEl.style.opacity = s.opacity;
		heroEl.style.transform = s.transform;
		bottomEl.style.opacity = s.opacity;
		bottomEl.style.transform = s.transform;
	}

	function clearFrame() {
		if (!headerEl || !heroEl || !bottomEl) return;
		headerEl.style.height = "";
		heroEl.style.opacity = "";
		heroEl.style.transform = "";
		bottomEl.style.opacity = "";
		bottomEl.style.transform = "";
	}

	// Fallback (sin SDA): mapeamos el scroll del documento a height/opacity
	function applyFallback() {
		if (sda || manualExpanded || !headerEl || !heroEl || !bottomEl) return;
		setFrame(frameStyle(clamp01(window.scrollY / range)));
	}

	function onScroll() {
		scrollY = window.scrollY;
		if (!sda) applyFallback();
		// Auto-contrae si el usuario vuelve arriba estando expandido manualmente
		if (manualExpanded && scrollY < range * 0.6) setManualExpanded(false);
	}

	// ── Compensación anti-brinco basada en un "anchor" ──────────────────────
	function pickAnchor() {
		if (!root) return null;
		const rect = root.getBoundingClientRect();
		const x = rect.left + Math.min(60, rect.width / 2);
		const appBar = 64; // alto del app bar sticky del layout
		const yOffset = (manualExpanded ? expanded : collapsed) + appBar + 28;
		const y = Math.min(window.innerHeight - 20, yOffset);
		const el = (document.elementFromPoint(x, y) as HTMLElement | null)?.closest?.(".dyn-item");
		if (!el) return null;
		return { el, top: el.getBoundingClientRect().top };
	}

	function compensate(anchor: { el: Element; top: number } | null) {
		if (!anchor?.el) return;
		const delta = anchor.el.getBoundingClientRect().top - anchor.top;
		if (Math.abs(delta) > 0.5) window.scrollBy(0, delta);
	}

	function setManualExpanded(next: boolean) {
		if (manualExpanded === next || animating) return;
		// Solo se puede expandir manualmente cuando está colapsado por scroll
		if (!manualExpanded && !isCollapsed) return;

		const anchor = pickAnchor();
		const prev = document.documentElement.style.scrollBehavior;
		document.documentElement.style.scrollBehavior = "auto";

		// ── SDA: transición explícita entre colapsado y expandido ──
		// La anim de scroll aplica de golpe, así que la desactivamos (clase
		// .animating) y hacemos un tween CSS entre el estado actual y el destino.
		if (sda && headerEl && heroEl && bottomEl) {
			const currentT = clamp01(window.scrollY / range);
			const from = next ? frameStyle(currentT) : frameStyle(0);
			const to = next ? frameStyle(0) : frameStyle(currentT);

			animating = true;
			manualExpanded = next;
			setFrame(from); // congela el estado inicial (inline gana sobre la anim)

			requestAnimationFrame(() => {
				void headerEl!.offsetHeight; // fuerza reflow para asegurar el tween
				setFrame(to);
				compensate(anchor);
			});

			window.setTimeout(() => {
				animating = false; // devuelve el control a la anim de scroll / CSS
				compensate(anchor);
				requestAnimationFrame(() => {
					clearFrame();
					compensate(anchor);
					document.documentElement.style.scrollBehavior = prev;
				});
			}, DURATION);
			return;
		}

		// ── Fallback (sin SDA): la transición la da el CSS de .no-sda ──
		manualExpanded = next;
		if (manualExpanded) setFrame(frameStyle(0));

		requestAnimationFrame(() => {
			if (!manualExpanded) applyFallback();
			compensate(anchor);
			requestAnimationFrame(() => {
				compensate(anchor);
				document.documentElement.style.scrollBehavior = prev;
			});
		});
	}

	function toTop() {
		window.scrollTo({ top: 0, behavior: "smooth" });
	}
</script>

<svelte:window onscroll={onScroll} />

<div
	class="dyn "
	class:manual-expanded={manualExpanded}
	class:animating={animating}
	class:no-sda={!sda}
	bind:this={root}
>
	<header
		class="header-card backdrop-blur-xl sticky top-16 z-10 mb-4 overflow-hidden border-b"
		bind:this={headerEl}
	>
		<div class="grid h-full grid-rows-[auto_1fr_auto] gap-2 p-4">
			<div class="flex min-h-8 items-center justify-between gap-3">
				<h1 class="truncate text-lg font-semibold">Tarjeta</h1>
				<div class="flex items-center gap-2">
					{#if showToggle}
						<button
							type="button"
							class="bg-muted hover:bg-muted/80 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors active:translate-y-px"
							aria-expanded={manualExpanded}
							onclick={() => setManualExpanded(!manualExpanded)}
						>
							{manualExpanded ? "Contraer" : "Expandir"}
						</button>
					{/if}
					<span
						class="bg-muted text-muted-foreground rounded-full border px-2.5 py-1 text-xs whitespace-nowrap"
					>
						SDA: {sda ? "ON" : "OFF (fallback)"}
					</span>
				</div>
			</div>

			<div
				class="hero-anim from-primary/25 via-accent/10 flex min-h-40 items-center rounded-xl border bg-linear-to-br to-transparent p-3 text-sm"
				bind:this={heroEl}
			>
				Contenido del cabecero (métricas, filtros, etc). Se desvanece al colapsar. Aqui
			</div>

			<div
				class="bottom-anim text-muted-foreground flex items-center justify-between gap-2 text-xs"
				bind:this={bottomEl}
			>
				<span>Actualizado: hoy</span>
				<button
					type="button"
					class="bg-muted hover:bg-muted/80 rounded-lg border px-2.5 py-2 text-xs transition-colors"
					onclick={toTop}
				>
					Volver arriba
				</button>
			</div>

			
		</div>
	</header>

	<main class=" p-4 md:p-6">
		<div class="text-muted-foreground mx-1 mb-2.5 text-sm font-semibold">Detalle</div>
		<div class="grid gap-2.5">
			{#each items as i (i)}
				<div class="dyn-item bg-card flex items-center gap-3 rounded-2xl border p-3">
					<div class="bg-muted size-9 shrink-0 rounded-xl border"></div>
					<div class="grid min-w-0 gap-0.5">
						<b class="truncate text-sm font-semibold">Item {i}</b>
						<span class="text-muted-foreground truncate text-xs">
							Detalle / descripción del item {i}
						</span>
					</div>
				</div>
			{/each}
		</div>
	</main>
</div>

<style>
	.dyn {
		--expanded: 280px;
		--collapsed: 64px;
		/*
		  IMPORTANTE: el header es sticky (in-flow), así que al colapsar encoge
		  el documento. Si el rango de scroll es MENOR que el delta de colapso
		  (--expanded − --collapsed = 216px), la altura se reduce más rápido de
		  lo que scrolleas → derivada negativa → rebote/zona muerta que impide
		  el scroll táctil en móvil. Mantener siempre --collapse-range > 216px.
		*/
		--collapse-range: 280px;
	}

	/* Altura base (estado expandido). El padding es FIJO (no salta). */
	.header-card {
		height: var(--expanded);
	}

	/*
	  Body scroll priority: el driver de la animación es el scroller RAÍZ
	  (documento), no un contenedor interno. Así conservamos pull-to-refresh,
	  auto-hide de la barra del navegador, etc.
	*/
	@supports (animation-timeline: scroll()) {
		.header-card {
			animation: dynCollapse 1s linear both;
			animation-timeline: scroll(root block);
			animation-range: 0 var(--collapse-range);
		}
		.hero-anim,
		.bottom-anim {
			animation: dynFade 1s linear both;
			animation-timeline: scroll(root block);
			animation-range: 0 var(--collapse-range);
		}

		@keyframes dynCollapse {
			from {
				height: var(--expanded);
			}
			to {
				height: var(--collapsed);
			}
		}
		@keyframes dynFade {
			from {
				opacity: 1;
				transform: perspective(600px) translateY(0) translateZ(0);
			}
			to {
				opacity: 0;
				transform: perspective(600px) translateY(-6px) translateZ(-40px);
			}
		}
	}

	/*
	  Transición manual (expandir/contraer estando colapsado por scroll):
	  desactivamos la anim de scroll y dejamos que los estilos inline hagan
	  el tween con esta transición.
	*/
	.dyn.animating .header-card {
		animation: none !important;
		transition: height 280ms cubic-bezier(0.22, 1, 0.36, 1);
	}
	.dyn.animating .hero-anim,
	.dyn.animating .bottom-anim {
		animation: none !important;
		transition:
			opacity 280ms ease,
			transform 280ms cubic-bezier(0.22, 1, 0.36, 1);
	}

	/* Override manual: expandido forzado (una vez terminada la transición) */
	.dyn.manual-expanded:not(.animating) .header-card {
		animation: none !important;
		height: var(--expanded) !important;
	}
	.dyn.manual-expanded:not(.animating) .hero-anim,
	.dyn.manual-expanded:not(.animating) .bottom-anim {
		animation: none !important;
		opacity: 1 !important;
		transform: none !important;
	}

	/* Fallback (sin SDA): transición suave al usar el toggle */
	.dyn.no-sda .header-card {
		transition: height 120ms linear;
	}
	.dyn.no-sda .hero-anim,
	.dyn.no-sda .bottom-anim {
		transition:
			opacity 120ms linear,
			transform 120ms linear;
			
	}

	@media (prefers-reduced-motion: reduce) {
		.dyn.no-sda .header-card,
		.dyn.no-sda .hero-anim,
		.dyn.no-sda .bottom-anim,
		.dyn.animating .header-card,
		.dyn.animating .hero-anim,
		.dyn.animating .bottom-anim {
			transition: none !important;
		}
	}
</style>
