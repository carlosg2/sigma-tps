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
	let scrollY = $state(0);

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

	// Fallback (sin SDA): mapeamos el scroll del documento a height/opacity
	function applyFallback() {
		if (sda || manualExpanded || !headerEl || !heroEl || !bottomEl) return;
		const t = clamp01(window.scrollY / range);
		headerEl.style.height = `${expanded + (collapsed - expanded) * t}px`;
		const o = `${1 - t}`;
		const ty = `translateY(${-6 * t}px)`;
		heroEl.style.opacity = o;
		heroEl.style.transform = ty;
		bottomEl.style.opacity = o;
		bottomEl.style.transform = ty;
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
		if (manualExpanded === next) return;
		// Solo se puede expandir manualmente cuando está colapsado por scroll
		if (!manualExpanded && !isCollapsed) return;

		const anchor = pickAnchor();
		const prev = document.documentElement.style.scrollBehavior;
		document.documentElement.style.scrollBehavior = "auto";

		manualExpanded = next;

		if (!sda && manualExpanded && headerEl && heroEl && bottomEl) {
			headerEl.style.height = `${expanded}px`;
			heroEl.style.opacity = "1";
			heroEl.style.transform = "translateY(0)";
			bottomEl.style.opacity = "1";
			bottomEl.style.transform = "translateY(0)";
		}

		requestAnimationFrame(() => {
			if (!sda && !manualExpanded) applyFallback();
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
	class="dyn p-4 md:p-6"
	class:manual-expanded={manualExpanded}
	class:no-sda={!sda}
	bind:this={root}
>
	<header
		class="header-card bg-card sticky top-16 z-10 mb-4 overflow-hidden rounded-2xl border shadow-lg"
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
				class="hero-anim from-primary/25 via-accent/10 flex min-h-16 items-center rounded-xl border bg-linear-to-br to-transparent p-3 text-sm"
				bind:this={heroEl}
			>
				Contenido del cabecero (métricas, filtros, etc). Se desvanece al colapsar.
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

	<main>
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
		--collapse-range: 140px;
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
				transform: translateY(0);
			}
			to {
				opacity: 0;
				transform: translateY(-6px);
			}
		}
	}

	/* Override manual: expandido forzado */
	.dyn.manual-expanded .header-card {
		animation: none !important;
		height: var(--expanded) !important;
	}
	.dyn.manual-expanded .hero-anim,
	.dyn.manual-expanded .bottom-anim {
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
		.dyn.no-sda .bottom-anim {
			transition: none !important;
		}
	}
</style>
