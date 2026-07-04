<script lang="ts">
	import * as Card from "$lib/components/ui/card/index.js";
	import * as Alert from "$lib/components/ui/alert/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import * as Field from "$lib/components/ui/field/index.js";
	import * as ToggleGroup from "$lib/components/ui/toggle-group/index.js";
</script>

<Card.Root>
	<Card.Header>
		<Card.Title>Programar auditoría</Card.Title>
		<Card.Description>Laura Pérez · Operaciones</Card.Description>
	</Card.Header>
	<Card.Content class="flex flex-col gap-4">
		<Field.Group>
			<Field.Field>
				<Field.Label>Disponible el 18 de marzo de 2026</Field.Label>
				<ToggleGroup.Root type="multiple" value={["slot-0"]} spacing={2}>
					<ToggleGroup.Item value="slot-0">9:00 AM</ToggleGroup.Item>
					<ToggleGroup.Item value="slot-1">10:30 AM</ToggleGroup.Item>
					<ToggleGroup.Item value="slot-2">11:00 AM</ToggleGroup.Item>
					<ToggleGroup.Item value="slot-3">1:30 PM</ToggleGroup.Item>
				</ToggleGroup.Root>
			</Field.Field>
		</Field.Group>
		<Alert.Root>
			<Alert.Title>¿Nuevo proveedor?</Alert.Title>
			<Alert.Description>Confirma la aprobación antes del cierre.</Alert.Description>
		</Alert.Root>
	</Card.Content>
	<Card.Footer>
		<Button class="w-full">Programar auditoría</Button>
	</Card.Footer>
</Card.Root>
