<script lang="ts">
	import type { Component } from 'svelte';
	import { page } from '$app/state';
	import PageHeader from '$lib/components/layout/pageHeader.svelte';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import * as Alert from '$lib/components/ui/alert';
	import ArrowLeft from '@lucide/svelte/icons/arrow-left';
	import ArrowRight from '@lucide/svelte/icons/arrow-right';
	import ArrowUp from '@lucide/svelte/icons/arrow-up';
	import Blend from '@lucide/svelte/icons/blend';
	import Copy from '@lucide/svelte/icons/copy';
	import Box from '@lucide/svelte/icons/box';
	import Images from '@lucide/svelte/icons/images';
	import FlipHorizontal2 from '@lucide/svelte/icons/flip-horizontal-2';
	import Circle from '@lucide/svelte/icons/circle';
	import Info from '@lucide/svelte/icons/info';

	// El título de la animación de ESTA página se pasa por prop (lo declara la
	// propia página). El grid enlaza al resto de páginas, cada una con su
	// transición. Navegación 100% con <a href> normal de SvelteKit.
	let { title }: { title: string } = $props();

	// Menú de la demo (una página por transición). Sólo presentación: la
	// transición efectiva la declara cada página con `defineTransition`.
	//  - `color`: fondo Tailwind distinto que encapsula el icono (icono siempre
	//    blanco → todos del mismo color).
	//  - `key`: identidad estable → `view-transition-name` compartido entre la
	//    tarjeta del grid Y el icono del título de esa misma transición. Así el
	//    icono VUELA entre ambas posiciones automáticamente, tanto al entrar como
	//    al volver (simétrico, sin handlers).
	const pages: {
		href: string;
		key: string;
		label: string;
		desc: string;
		icon: Component;
		color: string;
	}[] = [
		{ href: '/flow3', key: 'fade', label: 'Fade', desc: 'Desvanecimiento con cruce', icon: Blend, color: 'bg-amber-500' },
		{ href: '/flow3/push', key: 'push', label: 'Push', desc: 'Deslizamiento lateral', icon: ArrowRight, color: 'bg-blue-500' },
		{ href: '/flow3/cover', key: 'cover', label: 'Cover', desc: 'Cobertura sobre profundidad', icon: Copy, color: 'bg-emerald-500' },
		{ href: '/flow3/cover-v', key: 'cover-v', label: 'Cover V', desc: 'Cobertura vertical', icon: ArrowUp, color: 'bg-teal-500' },
		{ href: '/flow3/dive', key: 'dive', label: 'Dive', desc: 'Inmersión 3D en Z', icon: Box, color: 'bg-cyan-500' },
		{ href: '/flow3/parallax', key: 'parallax', label: 'Parallax', desc: 'Efecto paralaje (-20%)', icon: Images, color: 'bg-violet-500' },
		{ href: '/flow3/flip', key: 'flip', label: 'Flip', desc: 'Rotación 3D en Y', icon: FlipHorizontal2, color: 'bg-fuchsia-500' },
		{ href: '/flow3/circle', key: 'circle', label: 'Circle', desc: 'Revelado circular', icon: Circle, color: 'bg-rose-500' }
	];

	// Enlaces a las OTRAS páginas (se excluye la actual).
	const others = $derived(pages.filter((p) => p.href !== page.url.pathname));
	// Página actual (para el icono del título).
	const current = $derived(pages.find((p) => p.href === page.url.pathname));
</script>

<PageHeader>
	<div class="flex items-center gap-2">
		<Button variant="ghost" size="sm" onclick={() => history.back()}>
			<ArrowLeft data-icon="inline-start" />
			Atrás
		</Button>
		<h1 class="text-sm font-medium">{title}</h1>
	</div>
</PageHeader>

<div class="mx-auto flex w-full max-w-3xl flex-col gap-6 p-4 md:p-6">
	<div class="flex flex-col gap-1">
		<div class="flex items-center gap-3">
			{#if current}
				<span
					class="{current.color} inline-flex size-12 items-center justify-center rounded-xl text-white"
					style="view-transition-name: flow3-icon-{current.key}" /*  */
				>
					<current.icon class="size-6" />
				</span>
			{/if}
			<h2 class="text-2xl font-semibold tracking-tight">{title}</h2>
		</div>
		<p class="text-muted-foreground text-sm">
			Esta página entra y sale con su propia transición. Elige otra pantalla:
		</p>
	</div>

	<div class="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
		{#each others as p (p.href)}
			<a
				href={p.href}
				class="focus-visible:ring-ring rounded-xl focus-visible:ring-2 focus-visible:outline-none"
			>
				<Card.Root
					class="hover:border-primary hover:bg-border h-full gap-2 py-4 text-center transition-colors"
				>
					<Card.Header class="items-center gap-2 px-4">
						<span
							class="{p.color} mx-auto inline-flex size-12 items-center justify-center rounded-xl text-white"
							style="view-transition-name: flow3-icon-{p.key}" /*  */
						>
							<p.icon class="size-6" />
						</span>
						<Card.Title>{p.label}</Card.Title>
						<Card.Description>{p.desc}</Card.Description>
					</Card.Header>
				</Card.Root>
			</a>
		{/each}
	</div>

<!-- 	<Alert.Root>
		<Info />
		<Alert.Title>Cómo funciona</Alert.Title>
		<Alert.Description>
			<ul class="list-disc pl-4">
				<li>Cada página declara su transición en su <code>&lt;script module&gt;</code>.</li>
				<li>Navegas con <code>&lt;a href&gt;</code> normal; el destino define la animación.</li>
				<li>Al volver, esa misma transición se reproduce invertida.</li>
			</ul>
		</Alert.Description>
	</Alert.Root> -->
</div>
