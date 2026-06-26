<script lang="ts">
	import * as Card from "$lib/components/ui/card/index.js";
	import * as Field from "$lib/components/ui/field/index.js";
	import { Checkbox } from "$lib/components/ui/checkbox/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
</script>

<Card.Root>
	<Card.Header>
		<Card.Title>Órdenes y actividad</Card.Title>
		<Card.Description>Administra la visibilidad de pedidos, inventario y cumplimiento.</Card.Description>
	</Card.Header>
	<Card.Content>
		<form id="contributions-activity">
			<Field.Group>
				<Field.Set>
					<Field.Legend class="sr-only">Órdenes y actividad</Field.Legend>
					<Field.Group>
						<Field.Field orientation="horizontal">
							<Checkbox id="activity-private-profile" />
							<Field.Content>
								<Field.Label for="activity-private-profile">
									Hacer el perfil privado y ocultar la actividad
								</Field.Label>
								<Field.Description>
							Al habilitar esto, se ocultarán tus contribuciones y actividad de
							tu perfil de GitHub y de funciones sociales como seguidores,
							estrellas, feeds, tablas de clasificación y lanzamientos.
								</Field.Description>
							</Field.Content>
						</Field.Field>
					</Field.Group>
				</Field.Set>
			</Field.Group>
		</form>
	</Card.Content>
	<Card.Footer>
		<Button form="contributions-activity">Guardar cambios</Button>
	</Card.Footer>
</Card.Root>
