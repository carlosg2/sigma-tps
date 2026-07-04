<script lang="ts">
	import { Button } from "$lib/components/ui/button/index.js";
	import * as Card from "$lib/components/ui/card/index.js";
	import * as Field from "$lib/components/ui/field/index.js";
	import * as Select from "$lib/components/ui/select/index.js";
	import { Slider } from "$lib/components/ui/slider/index.js";
	import { Textarea } from "$lib/components/ui/textarea/index.js";
	import IconPlaceholder from "$lib/components/custom/icon-placeholder/icon-placeholder.svelte";

	const CURRENCIES = [
		{ label: "MXN — Pesos mexicanos", value: "mxn" },
		{ label: "USD — Dólares estadounidenses", value: "usd" },
		{ label: "EUR — Euros", value: "eur" },
		{ label: "GBP — Libras esterlinas", value: "gbp" },
		{ label: "JPY — Yenes japoneses", value: "jpy" },
	] as const;

	let amount = $state([3000]);
	let currency = $state<string>("mxn");
</script>

<Card.Root>
	<Card.Header>
		<Card.Title>Umbral de pago a proveedores proveedor</Card.Title>
		<Card.Description
			>Defina el saldo mínimo requerido antes de activar un pago proveedor.</Card.Description
		>
		<Card.Action>
			<Button variant="ghost" size="icon-sm" class="bg-muted">
				<IconPlaceholder
					lucide="XIcon"
					tabler="IconX"
					hugeicons="Cancel01Icon"
					phosphor="XIcon"
					remixicon="RiCloseLine"
				/>
			</Button>
		</Card.Action>
	</Card.Header>
	<Card.Content>
		<Field.Group>
			<Field.Field>
				<Field.Label for="preferred-currency">Moneda preferida</Field.Label>
				<Select.Root type="single" bind:value={currency}>
					<Select.Trigger id="preferred-currency" class="w-full">
						{CURRENCIES.find((c) => c.value === currency)?.label}
					</Select.Trigger>
					<Select.Content>
						<Select.Group>
							{#each CURRENCIES as item (item.value)}
								<Select.Item value={item.value}>{item.label}</Select.Item>
							{/each}
						</Select.Group>
					</Select.Content>
				</Select.Root>
			</Field.Field>
			<Field.Field>
				<div class="flex items-baseline justify-between">
					<Field.Label for="min-payout">Monto mínimo de proveedor proveedor</Field.Label>
					<span class="text-2xl font-semibold tabular-nums">
						${amount[0].toFixed(2)}
					</span>
				</div>
				<Slider
					type="multiple"
					id="min-payout"
					bind:value={amount}
					min={50}
					max={10000}
					step={50}
				/>
				<div class="flex items-center justify-between">
					<Field.Description>$50 (MIN)</Field.Description>
					<Field.Description>$10,000 (MAX)</Field.Description>
				</div>
			</Field.Field>
			<Field.Field>
				<Field.Label for="payout-notes">Notas de aprobación</Field.Label>
				<Textarea
					id="payout-notes"
					placeholder="Agregue notas para esta configuración de pago proveedor..."
					class="min-h-[100px]"
				/>
			</Field.Field>
		</Field.Group>
	</Card.Content>
	<Card.Footer>
		<Button class="w-full">Guardar umbral ERP</Button>
	</Card.Footer>
</Card.Root>
