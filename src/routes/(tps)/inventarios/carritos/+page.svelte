<script lang="ts">
	import { useInventariosStore } from '$lib/tps/inventarios/store.svelte.js';
	import { celdaIcon, pad } from '$lib/tps/inventarios/constants.js';
	import type { Celda } from '$lib/tps/inventarios/types.js';
	import StatusBadge from '$lib/tps/components/status-badge.svelte';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import * as Item from '$lib/components/ui/item/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import { toast } from 'svelte-sonner';
	import Tag from '@lucide/svelte/icons/tag';
	import Printer from '@lucide/svelte/icons/printer';
	import LogIn from '@lucide/svelte/icons/log-in';
	import FileText from '@lucide/svelte/icons/file-text';
	import Package from '@lucide/svelte/icons/package';

	const store = useInventariosStore();
	const data = $derived(store.state);

	let folioId = $state<string>(store.state.folios[0]?.id ?? '');
	const folio = $derived(folioId ? store.getFolio(folioId) : undefined);
	const folioLabel = $derived(folio ? `${folio.id} · ${folio.unidad}` : '— Seleccionar Folio —');
	const totales = $derived(folio ? store.folioTotales(folio) : { total: 0, surtidos: 0, confirmadas: 0, pendientes: 0 });

	// Etiqueta dialog
	let etiquetaOpen = $state(false);
	let etiquetaCelda = $state<Celda | null>(null);

	function abrirEtiqueta(celda: Celda) {
		etiquetaCelda = celda;
		etiquetaOpen = true;
	}

	function imprimirEtiqueta() {
		etiquetaOpen = false;
		toast.success('Etiqueta enviada', { description: 'Enviada a impresora Zebra ZT230 correctamente.' });
	}

	function imprimirTodas() {
		if (!folio) return;
		toast.success('Etiquetas enviadas', { description: `${totales.total} etiquetas de ${folio.id} enviadas a Zebra ZT230 · Almacén 2.` });
	}
</script>

<div class="flex flex-col gap-6">
	<div class="flex flex-wrap items-center justify-between gap-3">
		<div>
			<h2 class="text-xl font-semibold">Gestión de Carritos por Folio</h2>
			<p class="text-muted-foreground text-sm">Materiales embolsados y etiquetados por celda de trabajo</p>
		</div>
		<Badge variant="outline" class="font-mono">GAP-ALM-003</Badge>
	</div>

	<div class="flex flex-wrap items-center gap-2">
		<Select.Root type="single" bind:value={folioId}>
			<Select.Trigger class="w-64">{folioLabel}</Select.Trigger>
			<Select.Content>
				<Select.Group>
					{#each data.folios as f (f.id)}
						<Select.Item value={f.id}>{f.id} · {f.unidad}</Select.Item>
					{/each}
				</Select.Group>
			</Select.Content>
		</Select.Root>
	</div>

	{#if folio}
		<div class="grid grid-cols-1 gap-4 xl:grid-cols-3">
			<div class="flex flex-col gap-4 xl:col-span-2">
				{#each folio.celdas as celda (celda.letra)}
					{@const Icon = celdaIcon(celda.letra)}
					<Card.Root>
						<Card.Header>
							<Card.Title class="flex items-center gap-2 text-base">
								<Icon class="size-4" /> {celda.nombre}
							</Card.Title>
							<Card.Action>
								<Button variant="outline" size="sm" onclick={() => abrirEtiqueta(celda)}>
									<Tag data-icon="inline-start" /> Etiqueta
								</Button>
							</Card.Action>
						</Card.Header>
						<Card.Content class="flex flex-col gap-2">
							{#each celda.materiales as m, i (m.pn)}
								<Item.Root variant="outline" size="sm">
									<Item.Media variant="icon">
										<Package />
									</Item.Media>
									<Item.Content>
										<Item.Title>Bolsa {celda.letra}-{pad(i + 1)} · {m.desc} ({m.qty} {m.um})</Item.Title>
										<Item.Description class="font-mono">P/N: {m.pn}</Item.Description>
									</Item.Content>
									<Item.Actions>
										{#if m.surtido}
											<StatusBadge label="Lista" colorClass="bg-emerald-500/15 text-emerald-400" />
										{:else}
											<StatusBadge label="Pendiente" colorClass="bg-chart-4/15 text-chart-4" />
										{/if}
									</Item.Actions>
								</Item.Root>
							{/each}
						</Card.Content>
					</Card.Root>
				{/each}
			</div>

			<div class="flex flex-col gap-4">
				<Card.Root>
					<Card.Header>
						<Card.Title class="text-base">Carrito #C-{folio.num}</Card.Title>
						<Card.Description>{folio.unidad} · VIN {folio.vin}</Card.Description>
					</Card.Header>
					<Card.Content class="flex flex-col gap-2 text-sm">
						<div class="flex justify-between"><span class="text-muted-foreground">Total de bolsas</span><strong class="tabular-nums">{totales.total}</strong></div>
						<div class="flex justify-between"><span class="text-muted-foreground">Listas</span><strong class="text-emerald-400 tabular-nums">{totales.surtidos}</strong></div>
						<div class="flex justify-between"><span class="text-muted-foreground">Pendientes</span><strong class="text-chart-4 tabular-nums">{totales.pendientes}</strong></div>
						<Separator />
						<div class="flex justify-between"><span class="text-muted-foreground">Nivel de blindaje</span><strong>{folio.nivel}</strong></div>
						<div class="flex justify-between"><span class="text-muted-foreground">Responsable</span><strong>{folio.resp}</strong></div>
						<div class="flex justify-between"><span class="text-muted-foreground">Inicio preparación</span><strong>{folio.horaInicio} hrs</strong></div>
					</Card.Content>
				</Card.Root>

				<Card.Root>
					<Card.Header>
						<Card.Title class="text-base">Acciones del Carrito</Card.Title>
					</Card.Header>
					<Card.Content class="flex flex-col gap-2">
						<Button onclick={imprimirTodas}>
							<Printer data-icon="inline-start" /> Imprimir Todas las Etiquetas ({totales.total})
						</Button>
						<Button variant="outline" onclick={() => toast.info('Carrito asignado', { description: `Carrito C-${folio.num} · ${folio.unidad} enviado a línea de producción.` })}>
							<LogIn data-icon="inline-start" /> Enviar a Línea
						</Button>
						<Button variant="outline" onclick={() => toast.info('Reporte generado', { description: `PDF del Carrito C-${folio.num} · ${folio.id} disponible para descarga.` })}>
							<FileText data-icon="inline-start" /> Exportar Reporte PDF
						</Button>
					</Card.Content>
				</Card.Root>
			</div>
		</div>
	{/if}
</div>

<Dialog.Root bind:open={etiquetaOpen}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title class="flex items-center gap-2">
				<Tag class="text-primary size-4" /> Vista Previa de Etiqueta
			</Dialog.Title>
			<Dialog.Description>Etiqueta de celda para impresora Zebra ZT230.</Dialog.Description>
		</Dialog.Header>
		{#if folio && etiquetaCelda}
			<Card.Root>
				<Card.Content class="flex flex-col gap-1 py-4 text-center font-mono text-sm">
					<div class="text-base font-semibold">TPS BLINDAJES — ETIQUETA DE CELDA</div>
					<Separator class="my-2" />
					<div>Folio: <strong>{folio.id}</strong></div>
					<div>Celda: <strong>{etiquetaCelda.nombre}</strong></div>
					<div>Unidad: <strong>{folio.unidad}</strong></div>
					<div>Nivel: <strong>{folio.nivel}</strong></div>
					<div class="my-2 tracking-[0.4em]">|||| ||| || |||| ||| |</div>
					<div class="text-muted-foreground text-xs">{folio.id}-{etiquetaCelda.letra} · Resp: {folio.resp}</div>
				</Card.Content>
			</Card.Root>
		{/if}
		<Dialog.Footer>
			<Button variant="outline" onclick={() => (etiquetaOpen = false)}>Cerrar</Button>
			<Button onclick={imprimirEtiqueta}>
				<Printer data-icon="inline-start" /> Enviar a Zebra ZT230
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
