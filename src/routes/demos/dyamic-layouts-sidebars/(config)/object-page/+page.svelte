<script lang="ts">
	import { onMount } from "svelte";
	import { cn } from "$lib/utils.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import { Badge } from "$lib/components/ui/badge/index.js";
	import { Progress } from "$lib/components/ui/progress/index.js";
	import IconPlaceholder from "$lib/components/custom/icon-placeholder/icon-placeholder.svelte";

	let root = $state<HTMLElement>();
	let sda = $state(true);
	let collapsed = $state(false); // fallback sin SDA
	let activeSection = $state("general");

	const sections = [
		{ id: "general", label: "Información general" },
		{ id: "items", label: "Partidas", count: 4 },
		{ id: "pricing", label: "Precios" },
		{ id: "attachments", label: "Adjuntos", count: 3 },
		{ id: "activity", label: "Actividad" },
	];

	const facts = [
		{ label: "Valor neto", value: "$12,480.00" },
		{ label: "Partidas abiertas", value: "3" },
		{ label: "Creado por", value: "A. García" },
		{ label: "Fecha de entrega", value: "24 jul. 2026" },
	];

	const info = [
		{ label: "Cliente", value: "Acme Inc." },
		{ label: "Orden de compra", value: "PO-4581-2026" },
		{ label: "Condiciones de pago", value: "Neto 30" },
		{ label: "Incoterm", value: "FOB / Rotterdam" },
		{ label: "Org. de ventas", value: "1000 · EU Central" },
		{ label: "Moneda", value: "USD" },
	];

	const lineItems = [
		{ pos: "10", material: "Lámina de aluminio 2 mm", qty: "120 ud", net: "$3,600.00" },
		{ pos: "20", material: "Perno de acero M8", qty: "1,000 ud", net: "$450.00" },
		{ pos: "30", material: "Junta de goma 40 mm", qty: "300 ud", net: "$1,230.00" },
		{ pos: "40", material: "Cable de cobre 1.5 mm", qty: "500 m", net: "$7,200.00" },
	];

	function updateActive() {
		if (!root) return;
		const offset = 140;
		let current = sections[0].id;
		for (const s of sections) {
			const el = document.getElementById(`op-${s.id}`);
			if (el && el.getBoundingClientRect().top - offset <= 0) current = s.id;
		}
		activeSection = current;
	}

	function onScroll() {
		updateActive();
		if (!sda) collapsed = window.scrollY > 100;
	}

	function goTo(id: string) {
		document.getElementById(`op-${id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
	}

	onMount(() => {
		sda = typeof CSS !== "undefined" && CSS.supports?.("animation-timeline: scroll()");
		updateActive();
	});
</script>

<svelte:window onscroll={onScroll} />

{#snippet star(filled: boolean)}
	<IconPlaceholder
		lucide="StarIcon"
		tabler="IconStar"
		hugeicons="StarIcon"
		phosphor="StarIcon"
		remixicon="RiStarLine"
		class={filled ? "text-amber-500" : "text-muted-foreground/40"}
	/>
{/snippet}

<div class="op" class:collapsed={!sda && collapsed} bind:this={root}>
	<!-- ── Encabezado de página dinámico (colapsable al hacer scroll) ─────── -->
	<header class="op-header bg-background sticky top-16 z-5 border-b">
		<div class="px-4 pt-4 md:px-6">
			<!-- Barra de título (siempre visible) -->
			<div class="flex items-start gap-4">
				<div
					class="op-avatar from-primary/30 to-accent/20 flex shrink-0 items-center justify-center rounded-xl bg-linear-to-br"
				>
					<IconPlaceholder
						lucide="FileTextIcon"
						tabler="IconFileText"
						hugeicons="File02Icon"
						phosphor="FileTextIcon"
						remixicon="RiFileTextLine"
					/>
				</div>

				<div class="min-w-0 flex-1">
					<div class="flex flex-wrap items-center gap-2">
					<h1 class="truncate text-xl font-semibold">Pedido de venta 4581</h1>
					<Badge variant="secondary" class="gap-1">
						<span class="size-1.5 rounded-full bg-emerald-500"></span>
						En proceso
					</Badge>
					<Badge variant="outline">Borrador</Badge>
					</div>
					<p class="text-muted-foreground mt-0.5 truncate text-sm">
						Acme Inc. · PO-4581-2026 · Creado el 8 jul. 2026
					</p>
				</div>

				<!-- Acciones globales (barra de herramientas del encabezado) -->
				<div class="flex shrink-0 items-center gap-2">
					<Button size="sm" class="hidden sm:inline-flex">
						<IconPlaceholder
							lucide="PencilIcon"
							tabler="IconPencil"
							hugeicons="EditIcon"
							phosphor="PencilIcon"
							remixicon="RiPencilLine"
						/>
						Editar
					</Button>
					<Button size="sm" variant="outline" class="hidden md:inline-flex">
						<IconPlaceholder
							lucide="ShareIcon"
							tabler="IconShare"
							hugeicons="ShareIcon"
							phosphor="ShareIcon"
							remixicon="RiShareLine"
						/>
						Compartir
					</Button>
					<Button size="icon-sm" variant="ghost">
						<IconPlaceholder
							lucide="MoreHorizontalIcon"
							tabler="IconDots"
							hugeicons="MoreHorizontalCircle01Icon"
							phosphor="DotsThreeIcon"
							remixicon="RiMoreLine"
						/>
					</Button>
				</div>
			</div>
		</div>

		<!-- Contenido del encabezado: facetas + mensaje (se colapsa) -->
		<div class="op-facets overflow-hidden">
			<div class="space-y-4 px-4 pt-4 pb-4 md:px-6">
				<!-- Message strip -->
				<div
					class="flex items-center gap-2 rounded-lg border border-sky-500/30 bg-sky-500/10 px-3 py-2 text-sm text-sky-700 dark:text-sky-300"
				>
					<IconPlaceholder
						lucide="InfoIcon"
						tabler="IconInfoCircle"
						hugeicons="InformationCircleIcon"
						phosphor="InfoIcon"
						remixicon="RiInformationLine"
					/>
					<span>La entrega está programada dentro de los próximos 5 días hábiles.</span>
				</div>

				<!-- Facetas -->
				<div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
					<!-- Key value facets -->
					{#each facts as f (f.label)}
						<div class="bg-card rounded-xl border p-3">
							<div class="text-muted-foreground text-xs">{f.label}</div>
							<div class="mt-1 text-lg font-semibold">{f.value}</div>
						</div>
					{/each}
					<!-- Progress facet -->
					<div class="bg-card rounded-xl border p-3">
						<div class="text-muted-foreground text-xs">Avance de entrega</div>
						<div class="mt-2 flex items-center gap-2">
							<Progress value={60} class="h-2" />
							<span class="text-xs font-medium tabular-nums">60%</span>
						</div>
					</div>
					<!-- Rating facet -->
					<div class="bg-card rounded-xl border p-3">
						<div class="text-muted-foreground text-xs">Calificación del proveedor</div>
						<div class="mt-1 flex items-center gap-0.5">
							{#each Array(5) as _, i (i)}
								{@render star(i < 4)}
							{/each}
							<span class="text-muted-foreground ml-1.5 text-xs">4.0</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	</header>

	<!-- ── Barra de anclajes (fija, scroll-spy) ───────────────────────────── -->
	<nav class="op-anchorbar bg-background/95 sticky top-16 z-30 border-b shadow-sm backdrop-blur">
		<div class="flex gap-1 overflow-x-auto px-2 md:px-4">
			{#each sections as s (s.id)}
				<button
					type="button"
					onclick={() => goTo(s.id)}
					class={cn(
						"relative shrink-0 px-3 py-3 text-sm font-medium whitespace-nowrap transition-colors",
						activeSection === s.id
							? "text-foreground"
							: "text-muted-foreground hover:text-foreground"
					)}
				>
					{s.label}{#if s.count}<span class="text-muted-foreground"> ({s.count})</span>{/if}
					{#if activeSection === s.id}
						<span class="bg-primary absolute inset-x-2 bottom-0 h-0.5 rounded-full"></span>
					{/if}
				</button>
			{/each}
		</div>
	</nav>

	<!-- ── Contenido (secciones / subsecciones) ───────────────────────────── -->
	<main class="relative z-10 space-y-8 bg-background px-4 py-6 pb-24 md:px-6">
		<!-- Información general -->
		<section id="op-general" data-section class="op-section">
			<h2 class="mb-3 text-base font-semibold">Información general</h2>
			<div class="bg-card rounded-xl border p-4">
				<dl class="grid gap-x-8 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
					{#each info as row (row.label)}
						<div class="flex flex-col gap-0.5">
							<dt class="text-muted-foreground text-xs">{row.label}</dt>
							<dd class="text-sm font-medium">{row.value}</dd>
						</div>
					{/each}
				</dl>
			</div>
		</section>

		<!-- Partidas (tabla) -->
		<section id="op-items" data-section class="op-section">
			<div class="mb-3 flex items-center justify-between">
				<h2 class="text-base font-semibold">Partidas <span class="text-muted-foreground">(4)</span></h2>
				<Button size="sm" variant="outline">
					<IconPlaceholder
						lucide="PlusIcon"
						tabler="IconPlus"
						hugeicons="PlusSignIcon"
						phosphor="PlusIcon"
						remixicon="RiAddLine"
					/>
					Agregar partida
				</Button>
			</div>
			<div class="bg-card overflow-hidden rounded-xl border">
				<div
					class="text-muted-foreground grid grid-cols-[3rem_1fr_6rem_7rem] gap-4 border-b px-4 py-2.5 text-xs font-medium"
				>
					<span>Pos.</span><span>Material</span><span>Cantidad</span>
					<span class="text-right">Valor neto</span>
				</div>
				{#each lineItems as item (item.pos)}
					<div
						class="grid grid-cols-[3rem_1fr_6rem_7rem] items-center gap-4 border-b px-4 py-3 text-sm last:border-0"
					>
						<span class="text-muted-foreground tabular-nums">{item.pos}</span>
						<span class="truncate font-medium">{item.material}</span>
						<span class="text-muted-foreground tabular-nums">{item.qty}</span>
						<span class="text-right font-medium tabular-nums">{item.net}</span>
					</div>
				{/each}
			</div>
			<div class="mt-2 text-right">
				<Button variant="link" size="sm" class="text-xs">Mostrar todo (24)</Button>
			</div>
		</section>

		<!-- Precios -->
		<section id="op-pricing" data-section class="op-section">
			<h2 class="mb-3 text-base font-semibold">Precios</h2>
			<div class="grid gap-4 md:grid-cols-2">
				<div class="bg-card space-y-3 rounded-xl border p-4">
					{#each [["Subtotal", "$11,480.00"], ["Descuento", "-$480.00"], ["Impuesto (16%)", "$1,760.00"]] as [k, v] (k)}
						<div class="flex items-center justify-between text-sm">
							<span class="text-muted-foreground">{k}</span>
							<span class="font-medium tabular-nums">{v}</span>
						</div>
					{/each}
					<div class="flex items-center justify-between border-t pt-3 text-sm font-semibold">
						<span>Total</span><span class="tabular-nums">$12,760.00</span>
					</div>
				</div>
				<div class="bg-card flex flex-col justify-center rounded-xl border p-4">
					<div class="text-muted-foreground text-xs">Margen</div>
					<div class="mt-1 text-3xl font-semibold text-emerald-600 dark:text-emerald-400">
						23.4%
					</div>
					<Progress value={23} class="mt-3 h-2" />
				</div>
			</div>
		</section>

		<!-- Adjuntos -->
		<section id="op-attachments" data-section class="op-section">
			<h2 class="mb-3 text-base font-semibold">
				Adjuntos <span class="text-muted-foreground">(3)</span>
			</h2>
			<div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
				{#each ["Contract.pdf", "Specs-v2.xlsx", "Drawing.dwg"] as file (file)}
					<div class="bg-card flex items-center gap-3 rounded-xl border p-3">
						<div class="bg-muted flex size-10 shrink-0 items-center justify-center rounded-lg">
							<IconPlaceholder
								lucide="FileTextIcon"
								tabler="IconFileText"
								hugeicons="File02Icon"
								phosphor="FileTextIcon"
								remixicon="RiFileTextLine"
							/>
						</div>
						<div class="min-w-0">
							<div class="truncate text-sm font-medium">{file}</div>
							<div class="text-muted-foreground text-xs">Subido hoy</div>
						</div>
					</div>
				{/each}
			</div>
		</section>

		<!-- Actividad -->
		<section id="op-activity" data-section class="op-section">
			<h2 class="mb-3 text-base font-semibold">Actividad</h2>
			<div class="bg-card rounded-xl border p-4">
				<ol class="relative ml-2 space-y-5 border-s pl-6">
					{#each [["Pedido creado", "A. García · hace 3 días"], ["Aprobado por el gerente", "M. López · hace 2 días"], ["Entrega programada", "Sistema · ayer"], ["Factura generada", "Sistema · hoy"]] as [title, meta] (title)}
						<li class="relative">
							<span class="bg-primary absolute -inset-s-6.75 top-1 size-2.5 rounded-full"></span>
							<div class="text-sm font-medium">{title}</div>
							<div class="text-muted-foreground text-xs">{meta}</div>
						</li>
					{/each}
				</ol>
			</div>
		</section>
	</main>

	<!-- ── Barra de herramientas inferior (acciones de finalización) ──────── -->
	<footer
		class="op-footer bg-background/90 sticky bottom-0 z-20 flex items-center justify-end gap-2 border-t px-4 py-3 backdrop-blur md:px-6"
	>
		<span class="text-muted-foreground mr-auto hidden text-xs sm:inline">
			Borrador guardado automáticamente
		</span>
		<Button variant="ghost" size="sm">Cancelar</Button>
		<Button size="sm">
			<IconPlaceholder
				lucide="CheckIcon"
				tabler="IconCheck"
				hugeicons="Tick02Icon"
				phosphor="CheckIcon"
				remixicon="RiCheckLine"
			/>
			Guardar
		</Button>
	</footer>
</div>

<style>
	.op {
		/* offset para el scroll-spy y el scroll-into-view (app bar + header colapsado + anchor bar) */
		--op-range: 120px;
		--op-offset: 140px;
	}

	.op-avatar {
		width: 56px;
		height: 56px;
	}

	/* La anchor bar se pega justo debajo del app bar (4rem), por encima del header colapsado */
	.op-anchorbar {
		top: 4rem;
	}

	.op-section {
		scroll-margin-top: var(--op-offset);
	}

	/*
	  Body scroll priority: la animación de colapso se controla con el scroller
	  RAÍZ (documento), no con un contenedor interno.
	*/
	@supports (animation-timeline: scroll()) {
		.op-facets {
			animation: opCollapse 1s linear both;
			animation-timeline: scroll(root block);
			animation-range: 0 var(--op-range);
		}
		.op-avatar {
			animation: opAvatar 1s linear both;
			animation-timeline: scroll(root block);
			animation-range: 0 var(--op-range);
		}

		@keyframes opCollapse {
			from {
				max-height: 320px;
				opacity: 1;
			}
			to {
				max-height: 0;
				opacity: 0;
			}
		}
		@keyframes opAvatar {
			from {
				width: 56px;
				height: 56px;
			}
			to {
				width: 40px;
				height: 40px;
			}
		}
	}

	/* Fallback sin SDA */
	.op.collapsed .op-facets {
		max-height: 0;
		opacity: 0;
	}
	.op.collapsed .op-avatar {
		width: 40px;
		height: 40px;
	}
	.op:not(.collapsed) .op-facets {
		transition:
			max-height 160ms linear,
			opacity 160ms linear;
	}

	@media (prefers-reduced-motion: reduce) {
		.op.collapsed .op-facets,
		.op:not(.collapsed) .op-facets {
			transition: none;
		}
	}
</style>
