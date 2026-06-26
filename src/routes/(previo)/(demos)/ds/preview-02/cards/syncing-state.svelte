<script lang="ts">
	import { Button } from "$lib/components/ui/button/index.js";
	import * as Card from "$lib/components/ui/card/index.js";
	import * as Empty from "$lib/components/ui/empty/index.js";
	import { Spinner } from "$lib/components/ui/spinner/index.js";
</script>

<Card.Root>
	<Card.Content class="p-0">
		<Empty.Root class="p-4">
			<Empty.Header>
				<Empty.Media variant="icon">
					<Spinner />
				</Empty.Media>
				<Empty.Title>Sincronizando cuentas</Empty.Title>
				<Empty.Description>
					Estamos importando sus últimas translotes. Esto suele tardar unos
					segundos.
				</Empty.Description>
			</Empty.Header>
			<Empty.Content>
				<Button variant="outline">Cancelar</Button>
			</Empty.Content>
		</Empty.Root>
	</Card.Content>
</Card.Root>
