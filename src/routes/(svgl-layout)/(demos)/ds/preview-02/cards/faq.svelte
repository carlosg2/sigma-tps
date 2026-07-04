<script lang="ts">
	import * as Accordion from "$lib/components/ui/accordion/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import * as Card from "$lib/components/ui/card/index.js";
	import * as Tabs from "$lib/components/ui/tabs/index.js";

	const GENERAL_QUESTIONS = [
		{
			q: "¿Qué tan seguro está mi información financiera en el ERP?",
			a: "Utilizamos cifrado AES-256 de nivel bancario, infraestructura certificada y nunca almacenamos sus credenciales. Todas las conexiones usan tokens de solo lectura para la auditoría del sistema.",
		},
		{
			q: "¿Cómo conecto mis cuentas bancarias o de inventario?",
			a: "Vaya a Configuración > Cuentas vinculadas y busque su institución. El sistema soporta más de 12,000 bancos y corredores mediante integración ERP.",
		},
		{
			q: "¿Puedo exportar mis datos para fines fiscales?",
			a: "Sí. Abra Reportes > Exportación fiscal para descargar un resumen CSV o PDF de sus translotes, margen y utilidades de cualquier ejercicio.",
		},
	];

	const BILLING_QUESTIONS = [
		{
			q: "¿Cuál es la diferencia entre los planes Básico y Pro?",
			a: "Básico incluye presupuesto, control de inventario y hasta 3 módulos vinculados. Pro añade cuentas ilimitadas, seguimiento de margen, análisis de inventario y soporte prioritario.",
		},
		{
			q: "¿Cómo cancelo mi suscripción?",
			a: "Vaya a Configuración > ERP > Gestionar plan y haga clic en Cancelar. Su acceso continúa hasta el final del periodo vigente.",
		},
		{
			q: "¿Tienen prueba gratuita?",
			a: "Sí. Todas las cuentas nuevas comienzan con una prueba de 14 días del plan Pro sin necesidad de tarjeta.",
		},
	];

	const GOALS_QUESTIONS = [
		{
			q: "¿Cómo configuro una meta de producción personalizada?",
			a: "Haga clic en Nueva meta ERP desde la tarjeta de Objetivos de tesorería. Elija una categoría, defina un monto y una fecha objetivo y el sistema calculará la contribución mensual necesaria.",
		},
		{
			q: "¿Puedo seguir varias metas al mismo tiempo?",
			a: "Sí. Las cuentas Pro pueden seguir metas ilimitadas. Las cuentas Básicas admiten hasta 3 metas activas.",
		},
		{
			q: "¿Cómo se calculan las aportes mensuales ERP?",
			a: "El sistema divide el monto restante por los meses hasta la fecha objetivo, ajustado a su tasa de tesorería actual y a cualquier programación de transferencia automática.",
		},
	];
</script>

<Card.Root>
	<Card.Content>
		<Tabs.Root value="general">
			<Tabs.List class="w-full">
				<Tabs.Trigger value="general" class="flex-1">General</Tabs.Trigger>
				<Tabs.Trigger value="billing" class="flex-1">Facturación</Tabs.Trigger>
				<Tabs.Trigger value="goals" class="flex-1">Objetivos</Tabs.Trigger>
			</Tabs.List>
			<Tabs.Content value="general">
				<Accordion.Root type="single" value="0" class="w-full">
					{#each GENERAL_QUESTIONS as item, index (index)}
						<Accordion.Item value={String(index)}>
							<Accordion.Trigger>{item.q}</Accordion.Trigger>
							<Accordion.Content>{item.a}</Accordion.Content>
						</Accordion.Item>
					{/each}
				</Accordion.Root>
			</Tabs.Content>
			<Tabs.Content value="billing">
				<Accordion.Root type="single" value="0" class="w-full">
					{#each BILLING_QUESTIONS as item, index (index)}
						<Accordion.Item value={String(index)}>
							<Accordion.Trigger>{item.q}</Accordion.Trigger>
							<Accordion.Content>{item.a}</Accordion.Content>
						</Accordion.Item>
					{/each}
				</Accordion.Root>
			</Tabs.Content>
			<Tabs.Content value="goals">
				<Accordion.Root type="single" value="0" class="w-full">
					{#each GOALS_QUESTIONS as item, index (index)}
						<Accordion.Item value={String(index)}>
							<Accordion.Trigger>{item.q}</Accordion.Trigger>
							<Accordion.Content>{item.a}</Accordion.Content>
						</Accordion.Item>
					{/each}
				</Accordion.Root>
			</Tabs.Content>
		</Tabs.Root>
	</Card.Content>
	<Card.Footer>
		<Button variant="outline" class="w-full">Contactar soporte</Button>
		<Button variant="link" class="w-full">Conocer más</Button>
	</Card.Footer>
</Card.Root>
