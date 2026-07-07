<script lang="ts">
	import type { Proveedor, Factura } from '$lib/tps/finanzas/types.js';
	import { EMPRESA, fmtMoney } from '$lib/tps/finanzas/constants.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Table from '$lib/components/ui/table/index.js';
	import * as Alert from '$lib/components/ui/alert/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import CircleCheckBig from '@lucide/svelte/icons/circle-check-big';
	import TriangleAlert from '@lucide/svelte/icons/triangle-alert';
	import FileText from '@lucide/svelte/icons/file-text';

	let {
		prov,
		facturas,
		fecha,
		ref,
		banco,
		correo,
		folio
	}: {
		prov: Proveedor;
		facturas: Factura[];
		fecha: string;
		ref: string;
		banco: string;
		correo: string;
		folio: string | number;
	} = $props();

	const total = $derived(facturas.reduce((a, f) => a + (f.tot ?? 0), 0));
	const saldoPendiente = $derived(facturas.reduce((a, f) => a + (f.saldoRest ?? 0), 0));
	const asuntoProv = $derived(prov.nombre.split(' ').slice(0, 3).join(' '));
</script>

<Card.Root class="overflow-hidden">
	<!-- Encabezado del correo -->
	<Card.Header class="bg-primary text-primary-foreground items-center gap-1 py-6 text-center">
		<p class="text-primary-foreground/70 text-xs font-medium tracking-widest uppercase">
			Sistema de Pagos Automáticos
		</p>
		<Card.Title class="text-primary-foreground text-xl">{EMPRESA.nombre}</Card.Title>
		<Card.Description class="text-primary-foreground/80">Aviso de Pago</Card.Description>
		{#if folio}
			<div class="flex justify-center pt-2">
				<Badge variant="secondary" class="font-mono">Folio ERP: {folio}</Badge>
			</div>
		{/if}
	</Card.Header>

	<!-- Metadatos del correo -->
	<div class="bg-muted/50 text-muted-foreground flex flex-wrap gap-x-6 gap-y-1 border-b px-6 py-3 text-xs">
		<span><span class="font-medium">Para:</span> {correo || prov.nombre}</span>
		<span><span class="font-medium">CC:</span> {EMPRESA.cc}</span>
		<span><span class="font-medium">Asunto:</span> Confirmación de Pago — {asuntoProv} — Ref. {ref}</span>
	</div>

	<Card.Content class="flex flex-col gap-5 pt-6">
		<!-- Saludo -->
		<div class="flex flex-col gap-2 text-sm">
			<p>
				Estimado(a) <strong>{prov.contacto}</strong> — {prov.nombre},
			</p>
			<p class="text-muted-foreground">
				Le informamos que se ha procesado exitosamente el pago correspondiente a las siguientes
				facturas. Este aviso se genera automáticamente al registrar el egreso en {EMPRESA.nombre}.{folio
					? ` Folio de referencia: ${folio}.`
					: ''}
			</p>
		</div>

		<!-- Datos del pago -->
		<div class="bg-muted/40 grid grid-cols-2 gap-4 rounded-lg border p-4 sm:grid-cols-4">
			<div class="flex flex-col gap-1">
				<span class="text-muted-foreground text-xs tracking-wide uppercase">Fecha de Pago</span>
				<span class="text-sm font-semibold tabular-nums">{fecha}</span>
			</div>
			<div class="flex flex-col gap-1">
				<span class="text-muted-foreground text-xs tracking-wide uppercase">Referencia SPEI</span>
				<span class="text-primary font-mono text-sm font-semibold">{ref}</span>
			</div>
			<div class="flex flex-col gap-1">
				<span class="text-muted-foreground text-xs tracking-wide uppercase">Banco</span>
				<span class="text-sm font-semibold">{banco}</span>
			</div>
			<div class="flex flex-col gap-1">
				<span class="text-muted-foreground text-xs tracking-wide uppercase">Monto Total</span>
				<span class="text-base font-semibold tabular-nums text-emerald-500">{fmtMoney(total)}</span>
			</div>
		</div>

		<!-- Detalle de facturas -->
		<div class="flex flex-col gap-3">
			<div class="flex items-center gap-2 text-sm font-semibold">
				<FileText class="size-4" />
				Detalle de Facturas
			</div>
			<div class="overflow-hidden rounded-lg border">
				<Table.Root>
					<Table.Header>
						<Table.Row>
							<Table.Head># Factura</Table.Head>
							<Table.Head>Descripción</Table.Head>
							<Table.Head class="text-right">Subtotal</Table.Head>
							<Table.Head class="text-right">IVA 16%</Table.Head>
							<Table.Head class="text-right">Monto Pagado</Table.Head>
							<Table.Head class="text-right">Saldo Restante</Table.Head>
						</Table.Row>
					</Table.Header>
					<Table.Body>
						{#each facturas as f (f.num)}
							<Table.Row>
								<Table.Cell class="font-mono text-xs">{f.num}</Table.Cell>
								<Table.Cell class="text-sm">{f.desc}</Table.Cell>
								<Table.Cell class="text-right text-sm tabular-nums">{fmtMoney(f.sub)}</Table.Cell>
								<Table.Cell class="text-right text-sm tabular-nums">{fmtMoney(f.iva)}</Table.Cell>
								<Table.Cell class="text-primary text-right text-sm font-semibold tabular-nums">
									{fmtMoney(f.tot)}
								</Table.Cell>
								<Table.Cell class="text-right text-sm tabular-nums">
									{#if (f.saldoRest ?? 0) > 0}
										<span class="text-chart-4 font-semibold">{fmtMoney(f.saldoRest ?? 0)}</span>
									{:else}
										<Badge variant="outline" class="border-transparent bg-emerald-500/15 text-emerald-400">
											Liquidada
										</Badge>
									{/if}
								</Table.Cell>
							</Table.Row>
						{/each}
						<Table.Row class="bg-muted/50">
							<Table.Cell colspan={4} class="text-right text-xs font-semibold">
								TOTAL PAGADO EN ESTE EGRESO
							</Table.Cell>
							<Table.Cell class="text-right font-semibold tabular-nums text-emerald-500">
								{fmtMoney(total)}
							</Table.Cell>
							<Table.Cell class="text-right font-semibold tabular-nums">
								{#if saldoPendiente > 0}
									<span class="text-chart-4">{fmtMoney(saldoPendiente)}</span>
								{:else}
									<span class="text-muted-foreground">—</span>
								{/if}
							</Table.Cell>
						</Table.Row>
					</Table.Body>
				</Table.Root>
			</div>

			{#if saldoPendiente > 0}
				<Alert.Root>
					<TriangleAlert />
					<Alert.Title>Saldo pendiente</Alert.Title>
					<Alert.Description>
						Una o más facturas incluidas en este pago tienen un saldo restante de
						<strong>{fmtMoney(saldoPendiente)}</strong>, que se liquidará en el siguiente ciclo de
						pagos.
					</Alert.Description>
				</Alert.Root>
			{/if}
		</div>

		<!-- Confirmacion -->
		<Alert.Root class="border-transparent bg-emerald-500/10 text-emerald-500 [&>svg]:text-emerald-500">
			<CircleCheckBig />
			<Alert.Title>Su pago ha sido procesado</Alert.Title>
			<Alert.Description class="text-emerald-500/90">
				Si tiene alguna aclaración sobre este aviso, comuníquese con Cuentas por Pagar dentro de las
				próximas 48 horas hábiles.
			</Alert.Description>
		</Alert.Root>
	</Card.Content>

	<Separator />
	<Card.Footer class="text-muted-foreground flex-col gap-1 py-4 text-center text-xs">
		<p>Tesorería · {EMPRESA.nombre} · Tel: {EMPRESA.tel} · {EMPRESA.correo}</p>
		<p>Este es un mensaje automático. Por favor no responder directamente a este correo.</p>
	</Card.Footer>
</Card.Root>
