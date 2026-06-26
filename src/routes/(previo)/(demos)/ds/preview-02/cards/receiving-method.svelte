<script lang="ts">
	import { Button } from "$lib/components/ui/button/index.js";
	import * as Card from "$lib/components/ui/card/index.js";
	import * as Field from "$lib/components/ui/field/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import * as RadioGroup from "$lib/components/ui/radio-group/index.js";
	import IconPlaceholder from "$lib/components/custom/icon-placeholder/icon-placeholder.svelte";
</script>

<Card.Root>
	<Card.Header>
		<Card.Description>Preferencias de cobro proveedor</Card.Description>
		<Card.Title>Método de recepción ERP</Card.Title>
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
				<Field.Label for="account-holder">Titular de la cuenta</Field.Label>
				<Input id="account-holder" value="Synthetic Horizons Music LLC" />
			</Field.Field>
			<Field.Set>
				<Field.Legend variant="label">Método de recepción ERP</Field.Legend>
				<RadioGroup.Root
					value="bank"
					class="grid grid-cols-1 items-start gap-3 md:grid-cols-2"
				>
					<Field.Label for="method-bank">
						<Field.Field orientation="horizontal" class="pb-2.5">
							<RadioGroup.Item value="bank" id="method-bank" />
							<Field.Content>
								<Field.Description class="text-foreground font-medium"
									>Transferencia bancaria</Field.Description
								>
								<Field.Description>SWIFT / IBAN</Field.Description>
							</Field.Content>
						</Field.Field>
					</Field.Label>
					<Field.Label for="method-paypal">
						<Field.Field orientation="horizontal" class="pb-2.5">
							<RadioGroup.Item value="paypal" id="method-paypal" />
							<Field.Content>
								<Field.Description class="text-foreground font-medium"
									>PayPal</Field.Description
								>
								<Field.Description class="line-clamp-1"
									>Pago proveedor instantáneo</Field.Description
								>
							</Field.Content>
						</Field.Field>
					</Field.Label>
				</RadioGroup.Root>
			</Field.Set>
			<Field.Field>
				<Field.Label for="iban">IBAN / número de cuenta</Field.Label>
				<Input id="iban" placeholder="DE89 3704 0044 ...." />
			</Field.Field>
		</Field.Group>
	</Card.Content>
	<Card.Footer>
		<Button class="w-full" disabled>Guardar configuración de cobro proveedor</Button>
	</Card.Footer>
</Card.Root>
