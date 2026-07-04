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
					lucide="PlusIcon"
					tabler="IconPlus"
					hugeicons="Add01Icon"
					phosphor="PlusIcon"
					remixicon="RiAddLine"
				/>
			</Empty.Media>
			<Empty.Header>
				<Empty.Title>Distribuir catálogo</Empty.Title>
				<Empty.Description>
					Suba su primer lote para iniciar la distribución de activos y reportes del ERP.
				</Empty.Description>
			</Empty.Header>
			<Empty.Content>
				<Button>Crear lote</Button>
			</Empty.Content>
		</Empty.Root>
	</Card.Content>
</Card.Root>
