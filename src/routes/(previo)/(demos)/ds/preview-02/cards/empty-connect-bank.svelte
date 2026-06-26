<script lang="ts">
	import { Button } from "$lib/components/ui/button/index.js";
	import * as Card from "$lib/components/ui/card/index.js";
	import * as Empty from "$lib/components/ui/empty/index.js";
	import IconPlaceholder from "$lib/components/custom/icon-placeholder/icon-placeholder.svelte";
</script>

<Card.Root>
	<Card.Content>
		<Empty.Root class="p-4">
			<Empty.Media variant="icon">
				<IconPlaceholder
					lucide="CreditCardIcon"
					tabler="IconCreditCard"
					hugeicons="CreditCardIcon"
					phosphor="CreditCardIcon"
					remixicon="RiBankCardLine"
				/>
			</Empty.Media>
			<Empty.Header>
				<Empty.Title>Conectar banco</Empty.Title>
				<Empty.Description>
					Vincule su método de pago proveedor para recibir distribuciones mensuales de tesorería automáticamente.
				</Empty.Description>
			</Empty.Header>
			<Empty.Content>
				<Button>Configurar pago proveedors</Button>
			</Empty.Content>
		</Empty.Root>
	</Card.Content>
</Card.Root>
