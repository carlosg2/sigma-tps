<script lang="ts">
	import { Button } from "$lib/components/ui/button/index.js";
	import * as Card from "$lib/components/ui/card/index.js";
	import { Checkbox } from "$lib/components/ui/checkbox/index.js";
	import * as Field from "$lib/components/ui/field/index.js";

	const NOTIFICATIONS = [
		{
			id: "transactions",
			label: "Alertas de translotes",
			description: "Depósitos, retiros y transferencias.",
			defaultChecked: true,
		},
		{
			id: "security",
			label: "Alertas de seguridad",
			description: "Intentos de acceso y cambios de cuenta.",
			defaultChecked: true,
		},
		{
			id: "goals",
			label: "Hitos de objetivos",
			description: "Actualizaciones en 25%, 50%, 75% y 100%.",
			defaultChecked: false,
		},
		{
			id: "market",
			label: "Actualizaciones del mercado",
			description: "Resumen diario de inventario y alertas de precio.",
			defaultChecked: false,
		},
	];

	let checkedMap = $state<Record<string, boolean>>(
		Object.fromEntries(NOTIFICATIONS.map((n) => [n.id, n.defaultChecked]))
	);

	const allChecked = $derived(NOTIFICATIONS.every((n) => checkedMap[n.id]));
	const someChecked = $derived(NOTIFICATIONS.some((n) => checkedMap[n.id]) && !allChecked);

	function setAll(value: boolean) {
		checkedMap = Object.fromEntries(NOTIFICATIONS.map((n) => [n.id, value]));
	}

	function setOne(id: string, value: boolean) {
		checkedMap = { ...checkedMap, [id]: value };
	}
</script>

<Card.Root>
	<Card.Header>
		<Card.Title>Alertas del ERP</Card.Title>
		<Card.Description>Configure los eventos y alertas que desea recibir.</Card.Description>
	</Card.Header>
	<Card.Content>
		<Field.Group>
			<Field.Field orientation="horizontal">
				<Checkbox
					id="notify-all"
					checked={allChecked}
					indeterminate={someChecked}
					onCheckedChange={(v) => setAll(!!v)}
				/>
				<Field.Content>
					<Field.Label for="notify-all">Seleccionar todo</Field.Label>
				</Field.Content>
			</Field.Field>
			{#each NOTIFICATIONS as n (n.id)}
				<Field.Field orientation="horizontal">
					<Checkbox
						id={"notify-" + n.id}
						checked={checkedMap[n.id]}
						onCheckedChange={(v) => setOne(n.id, !!v)}
					/>
					<Field.Content>
						<Field.Label for={"notify-" + n.id}>{n.label}</Field.Label>
						<Field.Description>{n.description}</Field.Description>
					</Field.Content>
				</Field.Field>
			{/each}
		</Field.Group>
	</Card.Content>
	<Card.Footer>
		<Button class="w-full">Guardar preferencias</Button>
	</Card.Footer>
</Card.Root>
