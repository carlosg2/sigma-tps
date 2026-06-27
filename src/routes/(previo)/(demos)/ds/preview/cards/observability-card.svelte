<script lang="ts">
	import * as Card from "$lib/components/ui/card/index.js";
	import { Badge } from "$lib/components/ui/badge/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import IconPlaceholder from "$lib/components/custom/icon-placeholder/icon-placeholder.svelte";
</script>

<Card.Root class="relative w-full max-w-md overflow-hidden pt-0">
	<div class="bg-primary absolute inset-0 z-30 aspect-video opacity-50 mix-blend-color"></div>
	<img
		src="https://images.unsplash.com/photo-1604076850742-4c7221f3101b?q=80&w=1887&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
		alt=""
		title="Photo by mymind on Unsplash"
		class="relative z-20 aspect-video w-full object-cover brightness-60 grayscale"
	/>
	<Card.Header>
		<Card.Title>Observability Plus reemplaza a Monitoring</Card.Title>
		<Card.Description>
			Pasa a la forma mejorada de explorar tus datos con lenguaje natural. Monitoring ya no
			estará disponible en el plan Pro en noviembre de 2026.
		</Card.Description>
	</Card.Header>
	<Card.Footer>
		<Button>
			Crear consulta
			<IconPlaceholder
				lucide="PlusIcon"
				tabler="IconPlus"
				hugeicons="PlusSignIcon"
				phosphor="PlusIcon"
				remixicon="RiAddLine"
				data-icon="inline-end"
			/>
		</Button>
		<Badge variant="secondary" class="ml-auto">Advertencia</Badge>
	</Card.Footer>
</Card.Root>
