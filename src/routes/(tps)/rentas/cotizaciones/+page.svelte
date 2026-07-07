<script lang="ts">
	import { goto } from '$app/navigation';
	import { useRentasStore } from '$lib/tps/rentas/store.svelte.js';
	import { fmtMXN, fmtDate } from '$lib/tps/rentas/constants.js';
	import FlowChecklist from '$lib/tps/rentas/components/flow-checklist.svelte';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Table from '$lib/components/ui/table/index.js';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import * as Empty from '$lib/components/ui/empty/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Progress } from '$lib/components/ui/progress/index.js';
	import { toast } from 'svelte-sonner';
	import FileText from '@lucide/svelte/icons/file-text';
	import ExternalLink from '@lucide/svelte/icons/external-link';
	import ShieldCheck from '@lucide/svelte/icons/shield-check';
	import ListChecks from '@lucide/svelte/icons/list-checks';

	const store = useRentasStore();
	const data = $derived(store.state);

	function abrir(folio: string) {
		store.setActiva(folio);
		toast.info(`Cotización ${folio} cargada en el cotizador.`);
		goto('/rentas/cotizador');
	}

	function irCompliance(folio: string) {
		store.setActiva(folio);
		goto(`/rentas/compliance?folio=${folio}`);
	}

	let procesoFolio = $state<string | null>(null);
	const procesoCot = $derived(procesoFolio ? store.getCotizacion(procesoFolio) : undefined);
</script>

<div class="flex flex-col gap-6">
	<div class="flex flex-wrap items-center justify-between gap-3">
		<div>
			<h2 class="text-xl font-semibold">Cotizaciones guardadas</h2>
			<p class="text-muted-foreground text-sm">Seguimiento del avance y versiones de cada cotización</p>
		</div>
		<Button href="/rentas/cotizador" variant="outline" size="sm">
			<FileText data-icon="inline-start" /> Nueva cotización
		</Button>
	</div>

	<Card.Root>
		<Card.Content class="pt-6">
			{#if data.cotizaciones.length === 0}
				<Empty.Root>
					<Empty.Header>
						<Empty.Media variant="icon">
							<FileText />
						</Empty.Media>
						<Empty.Title>Sin cotizaciones guardadas</Empty.Title>
						<Empty.Description>Crea una cotización desde el cotizador para verla aquí.</Empty.Description>
					</Empty.Header>
					<Empty.Content>
						<Button href="/rentas/cotizador">Ir al cotizador</Button>
					</Empty.Content>
				</Empty.Root>
			{:else}
				<Table.Root>
					<Table.Header>
						<Table.Row>
							<Table.Head>Folio</Table.Head>
							<Table.Head>Cliente</Table.Head>
							<Table.Head>VIN</Table.Head>
							<Table.Head class="w-40">Avance</Table.Head>
							<Table.Head class="text-center">Versión</Table.Head>
							<Table.Head class="text-right">Total</Table.Head>
							<Table.Head class="text-right">Acciones</Table.Head>
						</Table.Row>
					</Table.Header>
					<Table.Body>
						{#each data.cotizaciones as c (c.folio)}
							{@const prog = store.flowProgress(c.folio)}
							<Table.Row>
								<Table.Cell><span class="text-primary font-mono text-xs font-semibold">{c.folio}</span></Table.Cell>
								<Table.Cell class="text-sm">{c.cliente}</Table.Cell>
								<Table.Cell class="text-muted-foreground font-mono text-xs">{c.vin}</Table.Cell>
								<Table.Cell>
									<div class="flex items-center gap-2">
										<Progress value={prog.pct} class="h-1.5" />
										<span class="text-muted-foreground text-xs tabular-nums">{prog.pct}%</span>
									</div>
								</Table.Cell>
								<Table.Cell class="text-center">
									<Badge variant="secondary">{c.version}</Badge>
								</Table.Cell>
								<Table.Cell class="text-right font-semibold tabular-nums">{fmtMXN(c.total)}</Table.Cell>
								<Table.Cell>
									<div class="flex justify-end gap-1">
										<Button size="sm" variant="ghost" onclick={() => (procesoFolio = c.folio)}>
											<ListChecks data-icon="inline-start" /> Proceso
										</Button>
										<Button size="sm" variant="ghost" onclick={() => abrir(c.folio)}>
											<ExternalLink data-icon="inline-start" /> Abrir
										</Button>
										<Button size="sm" variant="outline" onclick={() => irCompliance(c.folio)}>
											<ShieldCheck data-icon="inline-start" /> Compliance
										</Button>
									</div>
								</Table.Cell>
							</Table.Row>
						{/each}
					</Table.Body>
				</Table.Root>
			{/if}
		</Card.Content>
	</Card.Root>
</div>

<!-- ── PROCESO DE COTIZACIÓN ── -->
<Dialog.Root open={procesoFolio !== null} onOpenChange={(o) => { if (!o) procesoFolio = null; }}>
	<Dialog.Content class="max-h-[90vh] overflow-y-auto sm:max-w-xl">
		{#if procesoCot}
			<Dialog.Header>
				<Dialog.Title class="font-mono">Proceso · {procesoCot.folio}</Dialog.Title>
				<Dialog.Description>{procesoCot.cliente} · {procesoCot.vin}</Dialog.Description>
			</Dialog.Header>

			<div class="grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
				<div><p class="text-muted-foreground text-xs">Periodo</p><p class="font-medium">{fmtDate(procesoCot.fechaInicio)} – {fmtDate(procesoCot.fechaFin)}</p></div>
				<div><p class="text-muted-foreground text-xs">Días</p><p class="font-medium tabular-nums">{procesoCot.dias}</p></div>
				<div><p class="text-muted-foreground text-xs">Total</p><p class="font-medium tabular-nums">{fmtMXN(procesoCot.total)}</p></div>
			</div>

			<FlowChecklist folio={procesoCot.folio} />

			<Dialog.Footer>
				<Button variant="outline" onclick={() => { const f = procesoCot.folio; procesoFolio = null; abrir(f); }}>
					<ExternalLink data-icon="inline-start" /> Abrir en cotizador
				</Button>
				<Button onclick={() => { const f = procesoCot.folio; procesoFolio = null; irCompliance(f); }}>
					<ShieldCheck data-icon="inline-start" /> Ir a compliance
				</Button>
			</Dialog.Footer>
		{/if}
	</Dialog.Content>
</Dialog.Root>
