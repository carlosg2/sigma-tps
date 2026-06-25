<script lang="ts">
	import * as Card from "$lib/components/ui/card/index.js";
	import * as Field from "$lib/components/ui/field/index.js";
	import * as Dialog from "$lib/components/ui/dialog/index.js";
	import * as Select from "$lib/components/ui/select/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import { Textarea } from "$lib/components/ui/textarea/index.js";
	import { useDesignSystem } from "$lib/ds/index.js";
	import { FONTS } from "$lib/ds/fonts.js";

	const designSystem = useDesignSystem();

	const currentBody = $derived(FONTS.find((f) => f.value === designSystem.font));
	const currentHeading = $derived(
		designSystem.fontHeading === "inherit"
			? undefined
			: FONTS.find((f) => f.value === designSystem.fontHeading)
	);

	const headingLabel = $derived(
		currentHeading?.name && currentHeading.name !== currentBody?.name
			? currentHeading.name
			: "Inherit"
	);
	const bodyLabel = $derived(currentBody?.name ?? "Default");

	const categoryItems = [
		{ label: "General", value: "general" },
		{ label: "Bug Report", value: "bug" },
		{ label: "Feature Request", value: "feature" },
		{ label: "Improvement", value: "improvement" },
	];

	let categoryValue = $state<string>("general");
	const categoryLabel = $derived(
		categoryItems.find((item) => item.value === categoryValue)?.label ?? "General"
	);
</script>

<Card.Root>
	<Card.Content class="flex flex-col gap-2">
		<div class="text-muted-foreground text-xs font-medium tracking-wide uppercase">
			{headingLabel} - {bodyLabel}
		</div>
		<p class="cn-font-heading text-2xl font-medium">Diseñando con ritmo y jerarquía.</p>
		<p class="text-muted-foreground text-sm leading-relaxed">
			Un estilo de cuerpo sólido mantiene el contenido extenso legible y equilibra el peso
			visual de los encabezados.
		</p>
		<p class="text-muted-foreground text-sm leading-relaxed">
			El espaciado y el ritmo bien pensados ayudan a escanear los párrafos rápidamente sin
			que se sientan densos.
		</p>
	</Card.Content>
	<Card.Footer>
		<Dialog.Root>
			<Dialog.Trigger>
				{#snippet child({ props })}
					<Button variant="outline" class="w-full" {...props}>Compartir comentarios</Button>
				{/snippet}
			</Dialog.Trigger>
			<Dialog.Content>
				<Dialog.Header>
					<Dialog.Title>Compartir comentarios</Dialog.Title>
					<Dialog.Description>
						Cuéntanos cómo podemos mejorar tu experiencia.
					</Dialog.Description>
				</Dialog.Header>
				<Field.Group>
					<div class="grid grid-cols-2 gap-3">
						<Field.Field>
						<Field.Label for="feedback-name">Nombre</Field.Label>
						<Input id="feedback-name" placeholder="Tu nombre" />
						</Field.Field>
						<Field.Field>
						<Field.Label for="feedback-email">Correo</Field.Label>
						<Input id="feedback-email" type="email" placeholder="tu@ejemplo.com" />
						</Field.Field>
					</div>
					<Field.Field>
						<Field.Label for="feedback-category">Categoría</Field.Label>
						<Select.Root type="single" bind:value={categoryValue}>
							<Select.Trigger id="feedback-category" class="w-full"
								>{categoryLabel}</Select.Trigger
							>
							<Select.Content>
								<Select.Group>
									{#each categoryItems as item (item.value)}
										<Select.Item value={item.value}>{item.label}</Select.Item>
									{/each}
								</Select.Group>
							</Select.Content>
						</Select.Root>
					</Field.Field>
					<Field.Field>
					<Field.Label for="feedback-message">Mensaje</Field.Label>
					<Textarea
						id="feedback-message"
						placeholder="Cuéntanos qué tienes en mente..."
							class="min-h-24 resize-none"
						/>
					</Field.Field>
				</Field.Group>
				<Dialog.Footer>
					<Dialog.Close>
						{#snippet child({ props })}
							<Button variant="outline" {...props}>Cancelar</Button>
						{/snippet}
					</Dialog.Close>
					<Button>Enviar</Button>
				</Dialog.Footer>
			</Dialog.Content>
		</Dialog.Root>
	</Card.Footer>
</Card.Root>
