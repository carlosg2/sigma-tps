<script lang="ts">
	import { Badge } from "$lib/components/ui/badge/index.js";
	import { Calendar } from "$lib/components/ui/calendar/index.js";
	import * as Card from "$lib/components/ui/card/index.js";
	import * as Item from "$lib/components/ui/item/index.js";
	import { getLocalTimeZone, today, type DateValue } from "@internationalized/date";

	let date = $state<DateValue | undefined>(today(getLocalTimeZone()));
</script>

<Card.Root>
	<Card.Header>
		<Card.Title>Pago proveedors programados</Card.Title>
		<Card.Description>Seleccione una fecha para ver los pago proveedors programados.</Card.Description>
	</Card.Header>
	<Card.Content class="flex flex-col gap-4">
		<Item.Root variant="outline" class="justify-center">
			<Calendar
				type="single"
				bind:value={date}
				class="w-full [--cell-size:--spacing(8)] md:[--cell-size:--spacing(10)]"
			/>
		</Item.Root>
		<Item.Group class="w-full">
			<Item.Root variant="muted">
				<Item.Content>
					<Item.Title>Suscripción ERP</Item.Title>
					<Item.Description>15 abr 2024</Item.Description>
				</Item.Content>
				<Badge variant="secondary">$19.99</Badge>
			</Item.Root>
			<Item.Root variant="muted">
				<Item.Content>
					<Item.Title>Pago proveedor de arrendamiento</Item.Title>
					<Item.Description>1 abr 2024</Item.Description>
				</Item.Content>
				<Badge variant="secondary">$2,400.00</Badge>
			</Item.Root>
			<Item.Root variant="muted">
				<Item.Content>
					<Item.Title>Seguro del vehículo</Item.Title>
					<Item.Description>22 abr 2024</Item.Description>
				</Item.Content>
				<Badge variant="secondary">$186.00</Badge>
			</Item.Root>
		</Item.Group>
	</Card.Content>
</Card.Root>
