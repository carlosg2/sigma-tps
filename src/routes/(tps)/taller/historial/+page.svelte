<script lang="ts">
	import { cn } from '$lib/utils.js';
	import { useTallerStore } from '$lib/tps/taller/store.svelte.js';
	import { ARMOR_BADGE } from '$lib/tps/taller/constants.js';
	import type { Vehicle } from '$lib/tps/taller/types.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import Search from '@lucide/svelte/icons/search';
	import Car from '@lucide/svelte/icons/car';
	import Wrench from '@lucide/svelte/icons/wrench';
	import Camera from '@lucide/svelte/icons/camera';
	import Gauge from '@lucide/svelte/icons/gauge';
	import FileClock from '@lucide/svelte/icons/file-clock';

	const store = useTallerStore();

	let filter = $state('');
	let activeVin = $state<string | null>(null);

	const filtered = $derived(
		store.state.vehicles.filter((v) => {
			if (!filter) return true;
			const q = filter.toLowerCase();
			return [v.vin, v.brand, v.model, v.client, v.plate, v.level, v.color].join(' ').toLowerCase().includes(q);
		})
	);

	const active = $derived(activeVin ? store.getVehicle(activeVin) : null);
	const history = $derived(activeVin ? store.historyFor(activeVin) : []);

	function fmtDate(d: string) {
		return new Date(d).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' });
	}
</script>

<div class="flex flex-col gap-5">
	<div class="flex flex-wrap items-center justify-between gap-3">
		<div>
			<h2 class="text-xl font-semibold">Historial del Vehículo</h2>
			<p class="text-muted-foreground text-sm">Consulta por VIN o matrícula · Servicios anteriores, kilometrajes y expediente fotográfico</p>
		</div>
		<Badge variant="outline" class="font-mono">GAP-TLL-002</Badge>
	</div>

	<div class="grid gap-4 lg:grid-cols-[320px_1fr]">
		<!-- Catálogo -->
		<Card.Root class="h-fit">
			<Card.Header class="pb-2">
				<div class="relative">
					<Search class="text-muted-foreground absolute left-3 top-1/2 size-4 -translate-y-1/2" />
					<Input bind:value={filter} placeholder="Filtrar por VIN, modelo, cliente…" class="pl-9" />
				</div>
				<Card.Description class="text-xs">{filtered.length} vehículo{filtered.length !== 1 ? 's' : ''}</Card.Description>
			</Card.Header>
			<Card.Content class="max-h-140 space-y-1 overflow-y-auto p-2">
				{#each filtered as v (v.vin)}
					<button onclick={() => (activeVin = v.vin)} class={cn('flex w-full items-center gap-2 rounded-md border p-2 text-left transition', activeVin === v.vin ? 'border-primary bg-primary/5' : 'hover:bg-muted')}>
						<Car class="text-muted-foreground size-4 shrink-0" />
						<div class="min-w-0 flex-1">
							<p class="truncate text-xs font-semibold">{v.brand} {v.model} {v.year}</p>
							<p class="text-muted-foreground truncate text-[10px]">{v.client}</p>
							<p class="text-muted-foreground truncate font-mono text-[9px]">{v.vin}</p>
						</div>
						<Badge variant="outline" class={cn('shrink-0 text-[9px]', ARMOR_BADGE[v.level])}>{v.level}</Badge>
					</button>
				{/each}
			</Card.Content>
		</Card.Root>

		<!-- Detalle -->
		{#if active}
			<div class="space-y-4">
				<Card.Root class="border-primary/40">
					<Card.Content class="pt-4">
						<div class="flex items-start justify-between">
							<div>
								<p class="text-lg font-bold">{active.brand} {active.model} {active.year}</p>
								<p class="text-muted-foreground font-mono text-xs">{active.vin}</p>
							</div>
							<Badge variant="outline" class={ARMOR_BADGE[active.level]}>{active.level}</Badge>
						</div>
						<div class="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
							<div><p class="text-muted-foreground text-[10px] uppercase">Cliente</p><p class="text-sm font-medium">{active.client}</p></div>
							<div><p class="text-muted-foreground text-[10px] uppercase">Matrícula</p><p class="text-sm font-medium">{active.plate}</p></div>
							<div><p class="text-muted-foreground text-[10px] uppercase">Km actuales</p><p class="text-sm font-medium">{active.km.toLocaleString('es-MX')}</p></div>
							<div><p class="text-muted-foreground text-[10px] uppercase">Último servicio</p><p class="text-sm font-medium">{fmtDate(active.lastSvc)}</p></div>
						</div>
					</Card.Content>
				</Card.Root>

				<!-- KPIs -->
				<div class="grid gap-4 sm:grid-cols-3">
					<Card.Root><Card.Header class="pb-2"><Card.Description class="flex items-center gap-1"><Gauge class="size-3" />Km actuales</Card.Description><Card.Title class="text-2xl tabular-nums">{active.km.toLocaleString('es-MX')}</Card.Title></Card.Header></Card.Root>
					<Card.Root><Card.Header class="pb-2"><Card.Description class="flex items-center gap-1"><Wrench class="size-3" />Servicios previos</Card.Description><Card.Title class="text-2xl tabular-nums">{history.length}</Card.Title></Card.Header></Card.Root>
					<Card.Root><Card.Header class="pb-2"><Card.Description class="flex items-center gap-1"><Camera class="size-3" />Fotos en expediente</Card.Description><Card.Title class="text-2xl tabular-nums">{history.reduce((s, h) => s + h.fotos, 0)}</Card.Title></Card.Header></Card.Root>
				</div>

				<!-- Timeline -->
				<Card.Root>
					<Card.Header><Card.Title class="text-sm">Historial de Servicios</Card.Title></Card.Header>
					<Card.Content>
						{#if history.length}
							<div class="relative space-y-3 pl-6">
								<div class="bg-border absolute bottom-2 left-2 top-2 w-px"></div>
								{#each history as h, i}
									<div class="relative">
										<div class={cn('absolute -left-4.5 top-3 size-3 rounded-full border-2', i === 0 ? 'border-primary bg-primary/20' : 'border-muted-foreground/40 bg-background')}></div>
										<div class="rounded-md border p-3">
											<div class="flex items-start justify-between gap-2">
												<div>
													<p class="text-sm font-semibold">{h.svc}</p>
													<p class="text-muted-foreground text-xs">{new Date(h.date).toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
												</div>
												<div class="text-right">
													<p class="text-primary text-sm font-bold tabular-nums">{h.km.toLocaleString('es-MX')} km</p>
												</div>
											</div>
											<p class="text-muted-foreground mt-2 text-xs leading-relaxed">{h.obs}</p>
											<div class="text-muted-foreground mt-2 flex gap-3 text-xs">
												<span>👨‍🔧 {h.tech}</span>
												{#if h.fotos}<span class="text-blue-500">📷 {h.fotos} foto{h.fotos !== 1 ? 's' : ''}</span>{/if}
											</div>
										</div>
									</div>
								{/each}
							</div>
						{:else}
							<p class="text-muted-foreground py-6 text-center text-sm">Sin servicios previos registrados para este vehículo.</p>
						{/if}
					</Card.Content>
					<Card.Footer>
						<Button href="/taller/recepcion" class="w-full"><Wrench class="mr-2 size-4" />Abrir Recepción de este vehículo</Button>
					</Card.Footer>
				</Card.Root>
			</div>
		{:else}
			<Card.Root class="flex min-h-72 flex-col items-center justify-center gap-2 text-center">
				<FileClock class="text-muted-foreground size-10" />
				<p class="font-semibold">Selecciona un vehículo</p>
				<p class="text-muted-foreground max-w-xs text-sm">Elige una unidad del catálogo para ver su historial de servicios, kilometrajes y expediente fotográfico.</p>
			</Card.Root>
		{/if}
	</div>
</div>
