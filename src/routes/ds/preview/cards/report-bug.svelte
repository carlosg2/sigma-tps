<script lang="ts">
	import * as Card from "$lib/components/ui/card/index.js";
	import * as Field from "$lib/components/ui/field/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import * as Select from "$lib/components/ui/select/index.js";
	import { Textarea } from "$lib/components/ui/textarea/index.js";

	const severities = [
		{ value: "critical", label: "Critical" },
		{ value: "high", label: "High" },
		{ value: "medium", label: "Medium" },
		{ value: "low", label: "Low" },
	];

	const components = [
		{ value: "dashboard", label: "Dashboard" },
		{ value: "auth", label: "Auth" },
		{ value: "api", label: "API" },
		{ value: "billing", label: "Billing" },
	];

	let severity = $state(severities[2].value);
	let component = $state(components[0].value);
</script>

<Card.Root>
	<Card.Header>
		<Card.Title>Reportar incidencia ERP</Card.Title>
		<Card.Description>Ayúdanos a resolver fallos de inventario, facturación y logística.</Card.Description>
	</Card.Header>
	<Card.Content>
		<Field.Group>
			<Field.Field>
				<Field.Label for="bug-title">Título</Field.Label>
				<Input id="bug-title" placeholder="Breve descripción del problema" />
			</Field.Field>
			<div class="grid grid-cols-2 gap-3">
				<Field.Field>
					<Field.Label for="bug-severity">Gravedad</Field.Label>
					<Select.Root type="single" bind:value={severity}>
						<Select.Trigger id="bug-severity" class="w-full">
							{severities.find((s) => s.value === severity)?.label ??
								"Selecciona la gravedad"}
						</Select.Trigger>
						<Select.Content>
							{#each severities as severity (severity.value)}
								<Select.Item value={severity.value}>{severity.label}</Select.Item>
							{/each}
						</Select.Content>
					</Select.Root>
				</Field.Field>
				<Field.Field>
					<Field.Label for="bug-component">Componente</Field.Label>
					<Select.Root type="single" bind:value={component}>
						<Select.Trigger id="bug-component" class="w-full">
							{components.find((c) => c.value === component)?.label ??
								"Selecciona un componente"}
						</Select.Trigger>
						<Select.Content>
							{#each components as component (component.value)}
								<Select.Item value={component.value}>{component.label}</Select.Item>
							{/each}
						</Select.Content>
					</Select.Root>
				</Field.Field>
			</div>
			<Field.Field>
				<Field.Label for="bug-steps">Pasos para reproducir</Field.Label>
				<Textarea
					id="bug-steps"
					placeholder="1. Ve a&#10;2. Haz clic en&#10;3. Observa..."
					class="min-h-24 resize-none"
				/>
			</Field.Field>
		</Field.Group>
	</Card.Content>
	<Card.Footer>
		<Field.Field orientation="horizontal" class="justify-end">
			<Button variant="outline">Adjuntar evidencia</Button>
			<Button>Enviar reporte</Button>
		</Field.Field>
	</Card.Footer>
</Card.Root>
