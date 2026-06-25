<script lang="ts">
	import { Button } from "$lib/components/ui/button/index.js";
	import * as Card from "$lib/components/ui/card/index.js";
	import * as Field from "$lib/components/ui/field/index.js";
	import * as InputGroup from "$lib/components/ui/input-group/index.js";
	import * as Item from "$lib/components/ui/item/index.js";
	import * as Select from "$lib/components/ui/select/index.js";
	import { Separator } from "$lib/components/ui/separator/index.js";
	import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";

	const FROM_ACCOUNTS = [
		{ label: "Cuenta corriente principal (··8402) — $12,450.00", value: "checking" },
		{ label: "Empresa (··7731) — $8,920.00", value: "business" },
	] as const;

	const TO_ACCOUNTS = [
		{ label: "Tesorería de alta operaciónbilidad (··1192) — $42,100.00", value: "savings" },
		{ label: "Inventario (··3349) — $18,200.00", value: "investment" },
	] as const;

	let fromAccount = $state<string>("checking");
	let toAccount = $state<string>("savings");
</script>

<Card.Root>
	<Card.Header>
		<Card.Title>Transferir fondoss</Card.Title>
		<Card.Description>Traslade fondoss entre las cuentas corporativas conectadas.</Card.Description>
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
				<Field.Label for="transfer-amount">Monto a transferir</Field.Label>
				<InputGroup.Root>
					<InputGroup.Addon>
						<InputGroup.Text>$</InputGroup.Text>
					</InputGroup.Addon>
					<InputGroup.Input id="transfer-amount" value="1,200.00" />
				</InputGroup.Root>
			</Field.Field>
			<Field.Field>
				<Field.Label for="from-account">Cuenta origen</Field.Label>
				<Select.Root type="single" bind:value={fromAccount}>
					<Select.Trigger id="from-account" class="w-full">
						{FROM_ACCOUNTS.find((a) => a.value === fromAccount)?.label}
					</Select.Trigger>
					<Select.Content>
						<Select.Group>
							{#each FROM_ACCOUNTS as item (item.value)}
								<Select.Item value={item.value}>{item.label}</Select.Item>
							{/each}
						</Select.Group>
					</Select.Content>
				</Select.Root>
			</Field.Field>
			<Field.Field>
				<Field.Label for="to-account">Cuenta destino</Field.Label>
				<Select.Root type="single" bind:value={toAccount}>
					<Select.Trigger id="to-account" class="w-full">
						{TO_ACCOUNTS.find((a) => a.value === toAccount)?.label}
					</Select.Trigger>
					<Select.Content>
						<Select.Group>
							{#each TO_ACCOUNTS as item (item.value)}
								<Select.Item value={item.value}>{item.label}</Select.Item>
							{/each}
						</Select.Group>
					</Select.Content>
				</Select.Root>
			</Field.Field>
			<Item.Root variant="muted" class="flex-col items-stretch">
				<Item.Content class="gap-3">
					<div class="flex items-center justify-between">
						<span class="text-muted-foreground text-sm">Llegada estimada</span>
						<span class="text-sm font-medium">Hoy, 14 abr</span>
					</div>
					<Separator />
					<div class="flex items-center justify-between">
						<span class="text-muted-foreground text-sm">Comisión de transferencia</span>
						<span class="text-sm font-medium tabular-nums">$0.00</span>
					</div>
					<Separator />
					<div class="flex items-center justify-between">
						<span class="text-sm font-medium">Monto total</span>
						<span class="text-sm font-semibold tabular-nums">$1,200.00</span>
					</div>
				</Item.Content>
			</Item.Root>
		</Field.Group>
	</Card.Content>
	<Card.Footer>
		<Button class="w-full">Confirmar transferencia</Button>
	</Card.Footer>
</Card.Root>
