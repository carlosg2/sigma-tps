<script lang="ts">
	import * as Card from "$lib/components/ui/card/index.js";
	import * as Empty from "$lib/components/ui/empty/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
</script>

<Card.Root>
	<Card.Content>
		<Empty.Root class="h-48">
			<Empty.Header>
				<Empty.Title>Recibe alertas por anomalías</Empty.Title>
				<Empty.Description>
					Monitorea automáticamente tus proyectos en busca de anomalías y recibe notificaciones.
				</Empty.Description>
			</Empty.Header>
			<Empty.Content>
				<Button>Actualiza la conciliación financiera</Button>
			</Empty.Content>
		</Empty.Root>
	</Card.Content>
</Card.Root>
