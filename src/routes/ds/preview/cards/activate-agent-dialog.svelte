<script lang="ts">
	import * as Card from "$lib/components/ui/card/index.js";
	import * as Alert from "$lib/components/ui/alert/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import * as Item from "$lib/components/ui/item/index.js";
	import { Badge } from "$lib/components/ui/badge/index.js";
	import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
</script>

<Card.Root>
	<Card.Header>
		<Card.Title>
			<strong>Lanzá más rápido y con mayor seguridad</strong> con <strong>Vercel Agent</strong>
		</Card.Title>
		<Card.Description>
			Tu uso está sujeto al
			<a href="https://vercel.com/legal" class="underline">Acuerdo de beta pública</a> y a los
			<a href="https://vercel.com/legal/ai-terms" class="underline">Términos del producto de IA</a> de Vercel.
		</Card.Description>
	</Card.Header>
	<Card.Content class="flex flex-col gap-4">
		<Item.Group class="gap-0">
			<Item.Root size="xs" class="px-0">
				<Item.Media variant="icon" class="self-start">
					<IconPlaceholder
						lucide="CheckCircle2Icon"
						tabler="IconCircleCheckFilled"
						hugeicons="CheckmarkCircle02Icon"
						phosphor="CheckCircleIcon"
						remixicon="RiCheckboxCircleLine"
						class="fill-primary text-primary-foreground size-5"
					/>
				</Item.Media>
				<Item.Content>
					<Item.Title
						class="text-muted-foreground *:[strong]:text-foreground inline leading-relaxed font-normal *:[strong]:font-medium"
					>
					<strong>Revisiones de código</strong> con contexto completo del repositorio para detectar
					<strong>errores difíciles</strong> de encontrar.
					</Item.Title>
				</Item.Content>
			</Item.Root>
			<Item.Root size="xs" class="px-0">
				<Item.Media variant="icon" class="self-start">
					<IconPlaceholder
						lucide="CheckCircle2Icon"
						tabler="IconCircleCheckFilled"
						hugeicons="CheckmarkCircle02Icon"
						phosphor="CheckCircleIcon"
						remixicon="RiCheckboxCircleLine"
						class="fill-primary text-primary-foreground size-5"
					/>
				</Item.Media>
				<Item.Content>
					<Item.Title
						class="text-muted-foreground *:[strong]:text-foreground inline leading-relaxed font-normal *:[strong]:font-medium"
					>
						<strong>Sugerencias de código</strong> validadas en entornos aislados antes de fusionar.
					</Item.Title>
				</Item.Content>
			</Item.Root>
			<Item.Root size="xs" class="px-0">
				<Item.Media variant="icon" class="self-start">
					<IconPlaceholder
						lucide="CheckCircle2Icon"
						tabler="IconCircleCheckFilled"
						hugeicons="CheckmarkCircle02Icon"
						phosphor="CheckCircleIcon"
						remixicon="RiCheckboxCircleLine"
						class="fill-primary text-primary-foreground size-5"
					/>
				</Item.Media>
				<Item.Content>
					<Item.Title
						class="text-muted-foreground *:[strong]:text-foreground inline leading-relaxed font-normal *:[strong]:font-medium"
					>
					<strong>Análisis de causa raíz</strong> de problemas en producción con contexto de
					implementación.
					<Badge variant="secondary" class="bg-chart-1 text-chart-5 ml-1">
						Requiere Observability Plus
						</Badge>
					</Item.Title>
				</Item.Content>
			</Item.Root>
		</Item.Group>
		<Alert.Root>
			<Alert.Description>
				Los equipos Pro obtienen $100 de crédito de prueba de Vercel Agent durante 2 semanas
				tras la activación.
			</Alert.Description>
		</Alert.Root>
	</Card.Content>
	<Card.Footer class="justify-end gap-2">
		<Button variant="outline">Cancelar</Button>
		<Button>Activar con $100 de crédito</Button>
	</Card.Footer>
</Card.Root>
