<script lang="ts">
	import { Button } from "$lib/components/ui/button/index.js";
	import * as Card from "$lib/components/ui/card/index.js";
	import * as Field from "$lib/components/ui/field/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import * as Item from "$lib/components/ui/item/index.js";
	import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
</script>

<Card.Root>
	<Card.Header>
		<Card.Title>Acceso a cuentas</Card.Title>
		<Card.Description>Actualice sus credenciales o vuelva a autenticar la sesión.</Card.Description>
	</Card.Header>
	<Card.Content>
		<Field.Group>
			<Field.Field>
				<Field.Label for="email-address">Correo electrónico</Field.Label>
				<Input id="email-address" type="email" value="artist@studio.inc" />
			</Field.Field>
			<Field.Field>
				<div class="flex items-center justify-between">
					<Field.Label for="current-password">Contraseña actual</Field.Label>
					<a
						href="#/"
						class="text-muted-foreground hover:text-foreground text-xs font-medium tracking-wider uppercase"
					>
						¿Olvidó?
					</a>
				</div>
				<Input id="current-password" type="password" value="password123" />
			</Field.Field>
		</Field.Group>
	</Card.Content>
	<Card.Footer class="flex-col gap-4">
		<Button class="w-full">
			<IconPlaceholder
				lucide="LockKeyholeIcon"
				tabler="IconLock"
				hugeicons="SquareLock02Icon"
				phosphor="LockKeyIcon"
				remixicon="RiLockLine"
			/>
			Actualizar seguridad
		</Button>
		<Item.Root variant="muted">
			{#snippet child({ props })}
				<a href="#/" {...props}>
					<Item.Media variant="icon">
						<IconPlaceholder
							lucide="AlertCircleIcon"
							tabler="IconAlertCircle"
							hugeicons="AlertCircleIcon"
							phosphor="WarningCircleIcon"
							remixicon="RiErrorWarningLine"
							class="text-destructive"
						/>
					</Item.Media>
					<Item.Content>
						<Item.Title>Zona de riesgo</Item.Title>
						<Item.Description class="line-clamp-1">
							Archivar cuenta y eliminar catálogo
						</Item.Description>
					</Item.Content>
					<IconPlaceholder
						lucide="ArrowRightIcon"
						tabler="IconArrowRight"
						hugeicons="ArrowRight01Icon"
						phosphor="ArrowRightIcon"
						remixicon="RiArrowRightLine"
						class="size-4"
					/>
				</a>
			{/snippet}
		</Item.Root>
	</Card.Footer>
</Card.Root>
