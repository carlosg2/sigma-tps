<script lang="ts">
	import { Button } from "$lib/components/ui/button/index.js";
	import * as Card from "$lib/components/ui/card/index.js";
	import * as Field from "$lib/components/ui/field/index.js";
	import * as InputGroup from "$lib/components/ui/input-group/index.js";
	import * as Item from "$lib/components/ui/item/index.js";
	import * as NativeSelect from "$lib/components/ui/native-select/index.js";
	import { Progress } from "$lib/components/ui/progress/index.js";
</script>

<div class="grid grid-cols-2 gap-(--gap)">
	<Card.Root>
		<Card.Header>
			<Card.Title>Objetivos de tesorería</Card.Title>
			<Card.Description>Hitos activos para 2026</Card.Description>
			<Card.Action>
				<Button variant="outline" size="sm">Nueva meta ERP</Button>
			</Card.Action>
		</Card.Header>
		<Card.Content>
			<Item.Group class="gap-3">
				<Item.Root variant="muted" class="flex-col items-stretch">
					<Item.Content class="gap-3">
						<Item.Description
							class="cn-font-heading text-muted-foreground text-xs font-medium tracking-wider uppercase"
						>
							Jubilación
						</Item.Description>
						<span class="text-3xl font-semibold tabular-nums">$420,000</span>
						<Progress value={65} />
					</Item.Content>
					<Item.Footer>
						<span class="text-muted-foreground text-sm">65% alcanzado</span>
						<span class="text-sm font-medium tabular-nums">$273,000</span>
					</Item.Footer>
				</Item.Root>
				<Item.Root variant="muted" class="flex-col items-stretch">
					<Item.Content class="gap-3">
						<Item.Description
							class="cn-font-heading text-muted-foreground text-xs font-medium tracking-wider uppercase"
						>
							Inmobiliario
						</Item.Description>
						<span class="text-3xl font-semibold tabular-nums">$85,000</span>
						<Progress value={32} />
					</Item.Content>
					<Item.Footer>
						<span class="text-muted-foreground text-sm">32% alcanzado</span>
						<span class="text-sm font-medium tabular-nums">$27,200</span>
					</Item.Footer>
				</Item.Root>
			</Item.Group>
		</Card.Content>
		<Card.Footer>
			<Card.Description class="text-center">
					Aún no se han alcanzado los objetivos de inventario del año.
			</Card.Description>
		</Card.Footer>
	</Card.Root>
	<Card.Root>
		<Card.Header>
			<Card.Title>Comprar activo ERP</Card.Title>
		</Card.Header>
		<Card.Content class="flex flex-1 flex-col gap-3">
			<Field.Group class="flex-1">
				<Field.Field>
					<Field.Label for="invest-amount">Monto a aprovisionar</Field.Label>
					<InputGroup.Root>
						<InputGroup.Addon>
							<InputGroup.Text>$</InputGroup.Text>
						</InputGroup.Addon>
						<InputGroup.Input id="invest-amount" value="1,000.00" />
					</InputGroup.Root>
				</Field.Field>
				<Field.Field>
					<Field.Label for="invest-type">Tipo de orden ERP</Field.Label>
					<NativeSelect.Root id="invest-type" value="market">
						<NativeSelect.Option value="market">Orden de mercado</NativeSelect.Option>
						<NativeSelect.Option value="limit">Orden limitada</NativeSelect.Option>
						<NativeSelect.Option value="stop">Orden stop</NativeSelect.Option>
					</NativeSelect.Root>
					<Field.Description
						>Las órdenes de mercado se ejecutan al precio actual.</Field.Description
					>
				</Field.Field>
				<div class="flex flex-col gap-2">
					<div class="flex items-center justify-between">
						<span class="text-muted-foreground text-sm">Lotes estimadas</span>
						<span class="text-sm font-semibold tabular-nums">1.95</span>
					</div>
					<div class="flex items-center justify-between">
						<span class="text-muted-foreground text-sm">Capacidad de compra</span>
						<span class="text-sm font-semibold tabular-nums">$12,450.00</span>
					</div>
				</div>
			</Field.Group>
		</Card.Content>
		<Card.Footer class="flex-col gap-3">
			<Button class="w-full">Revisar orden ERP ERP</Button>
			<Card.Description class="text-center">
					Las operaciones suelen ejecutarse en minutos durante horario bursátil.
			</Card.Description>
		</Card.Footer>
	</Card.Root>
</div>
