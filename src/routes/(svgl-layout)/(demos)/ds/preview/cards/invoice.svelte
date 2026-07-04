<script lang="ts">
	import * as Card from "$lib/components/ui/card/index.js";
	import { Badge } from "$lib/components/ui/badge/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import * as Table from "$lib/components/ui/table/index.js";

	const INVOICE_ITEMS = [
		{ item: "Design System License", qty: 1, unitPrice: 499 },
		{ item: "Priority Support", qty: 12, unitPrice: 99 },
		{ item: "Custom Components", qty: 3, unitPrice: 250 },
	];

	const subtotal = INVOICE_ITEMS.reduce((sum, row) => sum + row.qty * row.unitPrice, 0);
	const tax = 0;
	const totalDue = subtotal + tax;

	function formatCurrency(value: number) {
		return new Intl.NumberFormat("en-US", {
			style: "currency",
			currency: "USD",
			maximumFractionDigits: 2,
		}).format(value);
	}
</script>

<Card.Root>
	<Card.Header>
		<Card.Title>Factura #ERP-2847</Card.Title>
		<Card.Description>Vence el 30 de junio de 2026</Card.Description>
		<Card.Action>
			<Badge variant="secondary">Pendiente</Badge>
		</Card.Action>
	</Card.Header>
	<Card.Content>
		<Table.Root>
			<Table.Header>
				<Table.Row>
					<Table.Head>Artículo</Table.Head>
					<Table.Head class="text-right">Cant.</Table.Head>
					<Table.Head class="text-right">Tarifa</Table.Head>
					<Table.Head class="text-right">Monto</Table.Head>
				</Table.Row>
			</Table.Header>
			<Table.Body>
				{#each INVOICE_ITEMS as row, index (index)}
					<Table.Row>
						<Table.Cell class="text-sm">{row.item}</Table.Cell>
						<Table.Cell class="text-right tabular-nums">{row.qty}</Table.Cell>
						<Table.Cell class="text-right tabular-nums">
							{formatCurrency(row.unitPrice)}
						</Table.Cell>
						<Table.Cell class="text-right tabular-nums">
							{formatCurrency(row.qty * row.unitPrice)}
						</Table.Cell>
					</Table.Row>
				{/each}
				<Table.Row>
					<Table.Cell colspan={3} class="text-right">Subtotal</Table.Cell>
					<Table.Cell class="text-right tabular-nums">
						{formatCurrency(subtotal)}
					</Table.Cell>
				</Table.Row>
				<Table.Row>
					<Table.Cell colspan={3} class="text-right">Impuesto</Table.Cell>
					<Table.Cell class="text-right tabular-nums">$0.00</Table.Cell>
				</Table.Row>
				<Table.Row>
					<Table.Cell colspan={3} class="text-right">Total a pagar</Table.Cell>
					<Table.Cell class="text-right tabular-nums">
						{formatCurrency(totalDue)}
					</Table.Cell>
				</Table.Row>
			</Table.Body>
		</Table.Root>
	</Card.Content>
	<Card.Footer>
		<Button variant="outline" size="sm">Descargar PDF</Button>
		<Button size="sm" class="ml-auto">Aprobar pago proveedor</Button>
	</Card.Footer>
</Card.Root>
