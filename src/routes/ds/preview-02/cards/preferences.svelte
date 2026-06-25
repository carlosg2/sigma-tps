<script lang="ts">
	import { Button } from "$lib/components/ui/button/index.js";
	import * as Card from "$lib/components/ui/card/index.js";
	import * as Field from "$lib/components/ui/field/index.js";
	import * as Select from "$lib/components/ui/select/index.js";
	import { Switch } from "$lib/components/ui/switch/index.js";
	import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";

	const CURRENCIES = [
		{ label: "MXN — Pesos mexicanos", value: "mxn" },
		{ label: "USD — Dólares estadounidenses", value: "usd" },
		{ label: "EUR — Euros", value: "eur" },
		{ label: "GBP — Libras esterlinas", value: "gbp" },
		{ label: "JPY — Yenes japoneses", value: "jpy" },
	] as const;

	let currency = $state<string>("mxn");
</script>

<Card.Root>
	<Card.Header>
		<Card.Title>Preferencias del ERP</Card.Title>
		<Card.Description>Administre la configuración corporativa y las alertas del sistema.</Card.Description>
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
				<Field.Label for="default-currency">Moneda predeterminada</Field.Label>
				<Select.Root type="single" bind:value={currency}>
					<Select.Trigger id="default-currency" class="w-full">
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
			<Field.Separator class="-my-4" />
			<Field.Field orientation="horizontal">
				<Field.Content>
					<Field.Label for="public-statistics">Estadísticas públicas</Field.Label>
					<Field.Description>
						Permita que otros vean el volumen de ventas y el estado operativo del negocio
					</Field.Description>
				</Field.Content>
				<Switch id="public-statistics" checked={true} />
			</Field.Field>
			<Field.Separator class="-my-4" />
			<Field.Field orientation="horizontal">
				<Field.Content>
					<Field.Label for="email-notifications">Alertas por correo</Field.Label>
					<Field.Description
						>Reportes mensuales de flujo de caja y actualizaciones de facturación</Field.Description
					>
				</Field.Content>
				<Switch id="email-notifications" checked={true} />
			</Field.Field>
		</Field.Group>
	</Card.Content>
	<Card.Footer>
		<Button variant="outline">Restablecer</Button>
		<Button class="ml-auto">Guardar preferencias</Button>
	</Card.Footer>
</Card.Root>
