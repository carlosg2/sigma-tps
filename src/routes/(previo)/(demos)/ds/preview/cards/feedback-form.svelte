<script lang="ts">
	import * as Card from "$lib/components/ui/card/index.js";
	import * as Field from "$lib/components/ui/field/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import * as NativeSelect from "$lib/components/ui/native-select/index.js";
	import { Textarea } from "$lib/components/ui/textarea/index.js";
</script>

<Card.Root>
	<Card.Content>
		<form id="feedback-form">
			<Field.Group>
				<Field.Field>
					<Field.Label for="topic">Tema</Field.Label>
					<NativeSelect.Root id="topic">
						<NativeSelect.Option value="">Selecciona un tema</NativeSelect.Option>
						<NativeSelect.Option value="ai">AI</NativeSelect.Option>
						<NativeSelect.Option value="billing">Billing</NativeSelect.Option>
						<NativeSelect.Option value="dashboard-interface">
							Interfaz del panel
						</NativeSelect.Option>
					</NativeSelect.Root>
				</Field.Field>
				<Field.Field>
					<Field.Label for="feedback">Comentarios</Field.Label>
					<Textarea id="feedback" placeholder="Tus comentarios nos ayudan a mejorar..." />
				</Field.Field>
			</Field.Group>
		</form>
	</Card.Content>
	<Card.Footer>
		<Button type="submit" form="feedback-form">Enviar</Button>
	</Card.Footer>
</Card.Root>
