<script lang="ts">
	import { Button } from "$lib/components/ui/button/index.js";
	import * as Card from "$lib/components/ui/card/index.js";
	import * as Empty from "$lib/components/ui/empty/index.js";
	import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
</script>

<Card.Root>
	<Card.Content>
		<Empty.Root class="p-4">
			<Empty.Media variant="icon">
				<IconPlaceholder
					lucide="AudioLinesIcon"
					tabler="IconPlayerRecordFilled"
					hugeicons="AudioWave01Icon"
					phosphor="RecordIcon"
					remixicon="RiRecordCircleLine"
				/>
			</Empty.Media>
			<Empty.Header>
				<Empty.Title>Explorar catálogo</Empty.Title>
				<Empty.Description>
					Revise los códigos, metadatos y activos del catálogo antes de publicar la versión ERP.
				</Empty.Description>
			</Empty.Header>
			<Empty.Content>
				<Button>Ver catálogo</Button>
			</Empty.Content>
		</Empty.Root>
	</Card.Content>
</Card.Root>
