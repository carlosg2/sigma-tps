<script lang="ts">
	import type { Cotizacion } from '$lib/tps/rentas/types.js';
	import { useRentasStore } from '$lib/tps/rentas/store.svelte.js';
	import { fmtMXN, fmtDate } from '$lib/tps/rentas/constants.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Table from '$lib/components/ui/table/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import ShieldCheck from '@lucide/svelte/icons/shield-check';

	let { cot }: { cot: Cotizacion } = $props();

	const store = useRentasStore();
	const vehiculo = $derived(store.getVehiculo(cot.vin));

	const CONDICIONES = [
		'El arrendatario es responsable de cualquier daño no cubierto por el seguro contratado durante el periodo de renta.',
		'La unidad incluye seguro de cobertura amplia; el deducible corre por cuenta del cliente arrendatario.',
		'La cancelación con menos de 24 horas de anticipación genera un cargo equivalente al 50% del monto total pactado.',
		'La liberación de la unidad queda bloqueada hasta que el área de Calidad valide el expediente documental completo.',
		'La renta está sujeta a disponibilidad confirmada por el sistema ERP al momento de firma del contrato.',
		'Queda prohibido el uso del vehículo fuera del territorio nacional sin autorización escrita previa.'
	];
</script>

<Card.Root class="overflow-hidden">
	<Card.Header class="bg-primary text-primary-foreground gap-3 py-6">
		<div class="flex items-center justify-between gap-4">
			<div class="flex items-center gap-3">
				<div class="bg-primary-foreground/15 flex size-11 items-center justify-center rounded-lg">
					<ShieldCheck class="size-6" />
				</div>
				<div>
					<Card.Title class="text-primary-foreground text-lg">Blindados Premium</Card.Title>
					<Card.Description class="text-primary-foreground/80">
						Propuesta comercial de renta de vehículos blindados
					</Card.Description>
				</div>
			</div>
			<div class="text-right">
				<p class="text-primary-foreground/70 text-xs tracking-wide uppercase">Folio</p>
				<p class="font-mono text-lg font-semibold">{cot.folio}</p>
				<p class="text-primary-foreground/70 text-xs">Versión {cot.version}</p>
			</div>
		</div>
	</Card.Header>

	<Card.Content class="flex flex-col gap-5 pt-6">
		<!-- Cliente + unidad -->
		<div class="grid gap-4 sm:grid-cols-2">
			<div class="bg-muted/40 flex flex-col gap-1 rounded-lg border p-4">
				<span class="text-muted-foreground text-xs tracking-wide uppercase">Cliente</span>
				<span class="font-semibold">{cot.cliente}</span>
				<span class="text-muted-foreground text-xs">Folio {cot.folio}</span>
			</div>
			<div class="bg-muted/40 flex flex-col gap-1 rounded-lg border p-4">
				<span class="text-muted-foreground text-xs tracking-wide uppercase">Unidad asignada</span>
				<span class="font-semibold">{vehiculo ? vehiculo.modelo : cot.vin}</span>
				<span class="text-muted-foreground text-xs">
					VIN {cot.vin} · Nivel {vehiculo?.nivel ?? '—'}
				</span>
			</div>
		</div>

		<!-- Periodo -->
		<div class="grid grid-cols-2 gap-4 rounded-lg border p-4 sm:grid-cols-4">
			<div class="flex flex-col gap-1">
				<span class="text-muted-foreground text-xs tracking-wide uppercase">Fecha inicio</span>
				<span class="text-sm font-semibold">{fmtDate(cot.fechaInicio)}</span>
			</div>
			<div class="flex flex-col gap-1">
				<span class="text-muted-foreground text-xs tracking-wide uppercase">Fecha fin</span>
				<span class="text-sm font-semibold">{fmtDate(cot.fechaFin)}</span>
			</div>
			<div class="flex flex-col gap-1">
				<span class="text-muted-foreground text-xs tracking-wide uppercase">Días</span>
				<span class="text-sm font-semibold tabular-nums">{cot.dias}</span>
			</div>
			<div class="flex flex-col gap-1">
				<span class="text-muted-foreground text-xs tracking-wide uppercase">Tarifa / día</span>
				<span class="text-sm font-semibold tabular-nums">{fmtMXN(cot.tarifa)}</span>
			</div>
		</div>

		<!-- Extras -->
		<div class="flex flex-col gap-2">
			<h4 class="text-sm font-semibold">Servicios extras incluidos</h4>
			{#if cot.extras.length === 0}
				<p class="text-muted-foreground text-sm">Sin extras adicionales.</p>
			{:else}
				<div class="overflow-hidden rounded-lg border">
					<Table.Root>
						<Table.Header>
							<Table.Row>
								<Table.Head>Concepto</Table.Head>
								<Table.Head class="text-right">Precio / día</Table.Head>
								<Table.Head class="text-center">Días</Table.Head>
								<Table.Head class="text-right">Subtotal</Table.Head>
							</Table.Row>
						</Table.Header>
						<Table.Body>
							{#each cot.extras as e (e.id)}
								<Table.Row>
									<Table.Cell class="text-sm">{e.label}</Table.Cell>
									<Table.Cell class="text-right text-sm tabular-nums">{fmtMXN(e.precio)}</Table.Cell>
									<Table.Cell class="text-center text-sm tabular-nums">{cot.dias}</Table.Cell>
									<Table.Cell class="text-right text-sm font-medium tabular-nums">
										{fmtMXN(e.precio * cot.dias)}
									</Table.Cell>
								</Table.Row>
							{/each}
						</Table.Body>
					</Table.Root>
				</div>
			{/if}
		</div>

		<!-- Resumen financiero -->
		<div class="flex flex-col gap-2 rounded-lg border p-4">
			<h4 class="text-sm font-semibold">Resumen financiero</h4>
			<div class="flex items-center justify-between text-sm">
				<span class="text-muted-foreground">Subtotal renta base</span>
				<span class="tabular-nums">{fmtMXN(cot.baseTotal || cot.dias * cot.tarifa)}</span>
			</div>
			<div class="flex items-center justify-between text-sm">
				<span class="text-muted-foreground">Subtotal extras</span>
				<span class="tabular-nums">{fmtMXN(cot.extrasTotal || 0)}</span>
			</div>
			<Separator class="my-1" />
			<div class="flex items-center justify-between">
				<span class="font-semibold">Total de la propuesta</span>
				<span class="text-lg font-semibold tabular-nums text-emerald-500">{fmtMXN(cot.total)}</span>
			</div>
		</div>

		<!-- Condiciones -->
		<div class="flex flex-col gap-2">
			<h4 class="text-sm font-semibold">Condiciones generales del servicio</h4>
			<ol class="text-muted-foreground flex list-decimal flex-col gap-1 pl-5 text-xs">
				{#each CONDICIONES as c (c)}
					<li>{c}</li>
				{/each}
			</ol>
		</div>
	</Card.Content>

	<Separator />
	<Card.Footer class="text-muted-foreground flex-wrap justify-between gap-2 py-4 text-xs">
		<span>{cot.folio} · {cot.version} · Blindados Premium</span>
		<Badge variant="outline">Documento confidencial</Badge>
	</Card.Footer>
</Card.Root>
