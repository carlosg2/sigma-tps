<script lang="ts">
	import * as Card from "$lib/components/ui/card/index.js";
	import * as Empty from "$lib/components/ui/empty/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import IconPlaceholder from "$lib/components/custom/icon-placeholder/icon-placeholder.svelte";
</script>

<Card.Root>
	<Card.Header>
		<Card.Title>Carga de documentos ERP</Card.Title>
		<Card.Description>Arrastra y suelta facturas, órdenes o contratos</Card.Description>
	</Card.Header>
	<Card.Content>
		<Empty.Root class="border">
			<Empty.Header>
				<Empty.Media variant="icon">
					<IconPlaceholder
						lucide="UploadCloudIcon"
						tabler="IconCloudUpload"
						hugeicons="CloudUploadIcon"
						phosphor="CloudArrowUpIcon"
						remixicon="RiUploadCloudLine"
					/>
				</Empty.Media>
				<Empty.Title>Subir archivos</Empty.Title>
				<Empty.Description>PNG, JPG, PDF de hasta 10 MB</Empty.Description>
			</Empty.Header>
			<Empty.Content>
				<Button>Explorar documentos</Button>
			</Empty.Content>
		</Empty.Root>
	</Card.Content>
</Card.Root>
