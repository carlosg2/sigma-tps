<script lang="ts">
	import * as Card from "$lib/components/ui/card/index.js";
	import * as Field from "$lib/components/ui/field/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import * as NativeSelect from "$lib/components/ui/native-select/index.js";
	import { Textarea } from "$lib/components/ui/textarea/index.js";
</script>

<Card.Root class="mx-auto w-full max-w-md">
	<Card.Header>
		<Card.Title>Cuenta corporativa</Card.Title>
		<Card.Description>Administra los datos de la empresa y los permisos.</Card.Description>
	</Card.Header>
	<Card.Content>
		<form id="profile">
			<Field.Group>
				<Field.Field>
					<Field.Label for="name">Nombre</Field.Label>
					<Input id="name" placeholder="shadcn" />
					<Field.Description>
					Tu nombre puede aparecer en GitHub donde contribuyes o donde te mencionan.
					Puedes quitarlo en cualquier momento.
					</Field.Description>
				</Field.Field>
				<Field.Field>
					<Field.Label for="email">Correo público</Field.Label>
					<NativeSelect.Root id="email">
						<NativeSelect.Option value="m@shadcn.com">m@shadcn.com</NativeSelect.Option>
						<NativeSelect.Option value="m@gmail.com">m@gmail.com</NativeSelect.Option>
					</NativeSelect.Root>
					<Field.Description>
					Puedes administrar tus direcciones de correo verificadas en la
					<a href="https://github.com/settings/emails" class="underline"
						>configuración de email</a
						>.
					</Field.Description>
				</Field.Field>
				<Field.Field>
				<Field.Label for="bio">Biografía</Field.Label>
				<Textarea id="bio" placeholder="Cuéntanos un poco sobre ti" />
					<Field.Description>
					Puedes <span>@mencionar</span> a otros usuarios y organizaciones para enlazarlos.
					</Field.Description>
				</Field.Field>
			</Field.Group>
		</form>
	</Card.Content>
	<Card.Footer>
		<Button form="profile">Guardar configuración</Button>
	</Card.Footer>
</Card.Root>
