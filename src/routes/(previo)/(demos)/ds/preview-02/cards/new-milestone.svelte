<script lang="ts">
	import { Button } from "$lib/components/ui/button/index.js";
	import * as Card from "$lib/components/ui/card/index.js";
	import * as Field from "$lib/components/ui/field/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
</script>

<Card.Root>
	<Card.Header>
		<Card.Title>Defina un nuevo hito</Card.Title>
		<Card.Description>
			Defina su meta de producción y ayudaremos a medir el progreso del tesorería.
		</Card.Description>
	</Card.Header>
	<Card.Content>
		<Field.Group>
			<Field.Field>
				<Field.Label for="goal-name">Nombre de la meta</Field.Label>
				<Input id="goal-name" placeholder="Ej. Nuevo equipo, ampliación de planta" />
			</Field.Field>
			<div class="grid grid-cols-2 gap-3">
				<Field.Field>
					<Field.Label for="target-amount">Monto objetivo</Field.Label>
					<Input id="target-amount" value="$15,000" />
				</Field.Field>
				<Field.Field>
					<Field.Label for="target-date">Fecha objetivo</Field.Label>
					<Input id="target-date" value="Dec 2025" />
				</Field.Field>
			</div>
		</Field.Group>
	</Card.Content>
	<Card.Footer class="flex-col gap-2">
		<Button class="w-full">Crear meta</Button>
		<Button variant="outline" class="w-full">Cancelar</Button>
	</Card.Footer>
</Card.Root>
