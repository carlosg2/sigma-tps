<script lang="ts">
	import { Badge } from "$lib/components/ui/badge/index.js";
	import * as Card from "$lib/components/ui/card/index.js";
	import * as Item from "$lib/components/ui/item/index.js";
	import { Separator } from "$lib/components/ui/separator/index.js";
</script>

<Card.Root>
	<Card.Header>
		<Card.Description>Saldo disponible ERP ERP</Card.Description>
		<Card.Title class="text-5xl tabular-nums">$0.00</Card.Title>
		<Badge variant="outline">
			<span class="size-2 rounded-full bg-yellow-500"></span>
			Configuración pendiente
		</Badge>
	</Card.Header>
	<Card.Content class="flex flex-1 flex-col justify-end">
		<Item.Root variant="muted" class="flex-col items-stretch">
			<Item.Content class="gap-3">
				<div class="flex items-center justify-between">
					<span class="text-muted-foreground text-sm">Ingresos netos</span>
					<span class="text-sm font-medium tabular-nums">$0.00</span>
				</div>
				<div class="flex items-center justify-between">
					<span class="text-muted-foreground text-sm">Comisión de procesamiento</span>
					<span class="text-sm font-medium tabular-nums">-$0.00</span>
				</div>
				<Separator />
				<div class="flex items-center justify-between">
					<span class="text-muted-foreground text-sm">Total disponible para compensación de cliente</span>
					<span class="text-sm font-semibold tabular-nums">$0.00 USD</span>
				</div>
			</Item.Content>
		</Item.Root>
	</Card.Content>
	<Card.Footer>
		<Card.Description>
			Una vez conectado el proveedor, los saldos superiores a $10.00 serán elegibles
			automáticamente para la distribución mensual el día 15 de cada mes.
		</Card.Description>
	</Card.Footer>
</Card.Root>
