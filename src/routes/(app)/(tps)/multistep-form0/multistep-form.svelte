
<script lang="ts">
	import { type Infer, type SuperValidated, superForm } from "sveltekit-superforms";
	import SuperDebug from "sveltekit-superforms";
	import * as Form from "$lib/components/ui/form/index.js";
	import * as Card from "$lib/components/ui/card/index.js";
	import { browser, dev } from "$app/environment";
	import { 
		step1Schema, 
		step2Schema, 
		step3Schema, 
		step4Schema, 
		step5Schema, 
		step6Schema, 
		type VehicleReceptionSchema 
	} from './schema.js';
	import { zod } from 'sveltekit-superforms/adapters';
	import * as RadioGroup from "$lib/components/ui/radio-group/index.js";
	import { Car, FileText, Settings, Wrench, Package, CheckCircle2, User, Phone, Mail } from "@lucide/svelte";
	import Button from "$lib/components/ui/button/button.svelte";
	import { Separator } from "$lib/components/ui/separator";
	import Progress from "$lib/components/ui/progress/progress.svelte";
	import { Input } from "$lib/components/ui/input/index.js";
	import { Textarea } from "$lib/components/ui/textarea/index.js";
	import { Checkbox } from "$lib/components/ui/checkbox/index.js";
	import { Badge } from "$lib/components/ui/badge/index.js";
	import { toast } from 'svelte-sonner';

	// Componentes reutilizables del formulario
	import StateRadioGroup from './components/StateRadioGroup.svelte';
	import ObservationsTextarea from './components/ObservationsTextarea.svelte';
	import InspectionSection from './components/InspectionSection.svelte';
	import ConditionalAccessory from './components/ConditionalAccessory.svelte';
	import FormInput from './components/FormInput.svelte';
	import DocumentCheckbox from './components/DocumentCheckbox.svelte';

	let { 
		data,
		API_CONFIG
	}: { 
		data: SuperValidated<Infer<VehicleReceptionSchema>>;
		API_CONFIG: {
			url: string;
			token: string;
			path: string;
			timeout: number;
			maxFileSize: number;
			acceptedTypes: string[];
		};
	} = $props();

	const steps = [
		zod(step1Schema), 
		zod(step2Schema), 
		zod(step3Schema), 
		zod(step4Schema), 
		zod(step5Schema), 
		zod(step6Schema)
	];
	
	let step = $state(1);

	const form = superForm(data, {
		SPA: true,
		validators: steps[0],
		dataType: 'json'
	});

	const { form: formData, enhance, validateForm, options, capture, restore } = form;

	// Función para manejar el envío final
	async function handleFinalSubmit(data: Infer<VehicleReceptionSchema>) {
		try {
			console.log('Datos de recepción del vehículo:', data);
			
			// Aquí iría la lógica para enviar los datos al servidor
			// Por ejemplo, guardar en base de datos, generar PDF, etc.
			
			// Reiniciar formulario al paso 1
			step = 1;
			options.validators = steps[0];
			
			// Mostrar mensaje de éxito
			alert('¡Recepción de vehículo registrada exitosamente!');
			
		} catch (error) {
			console.error('Error:', error);
			alert('Error al procesar la recepción del vehículo');
		}
	}

	let stepTitle = $derived(
		step === 1 ? "Información General" :
		step === 2 ? "Condición Externa" :
		step === 3 ? "Condición Interna" :
		step === 4 ? "Motor y Mecánica" :
		step === 5 ? "Accesorios" : "Documentos y Finalización"
	);

	let stepIcon = $derived(
		step === 1 ? Car :
		step === 2 ? FileText :
		step === 3 ? Settings :
		step === 4 ? Wrench :
		step === 5 ? Package : CheckCircle2
	);

	// Scroll to top function
	function scrollToTop() {
		window.scrollTo({ top: 0, behavior: 'smooth' });
	}

	// Estados disponibles para evaluación
	const estadosDisponibles = [
		{ value: 'excelente', label: 'Excelente', color: 'bg-green-100 text-green-800 border-green-200' },
		{ value: 'bueno', label: 'Bueno', color: 'bg-blue-100 text-blue-800 border-blue-200' },
		{ value: 'regular', label: 'Regular', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
		{ value: 'malo', label: 'Malo', color: 'bg-red-100 text-red-800 border-red-200' }
	];

	// Función para obtener la fecha actual en formato YYYY-MM-DD
	function getCurrentDate() {
		return new Date().toISOString().split('T')[0];
	}

	// Establecer fecha actual por defecto
	if (!$formData.fecha_recepcion) {
		$formData.fecha_recepcion = getCurrentDate();
	}

	// Inicializar arrays de fotos si no existen
	if (!$formData.carroceria_fotos) $formData.carroceria_fotos = [];
	if (!$formData.pintura_fotos) $formData.pintura_fotos = [];
	if (!$formData.cristales_fotos) $formData.cristales_fotos = [];
	if (!$formData.llantas_fotos) $formData.llantas_fotos = [];
	if (!$formData.asientos_fotos) $formData.asientos_fotos = [];
	if (!$formData.tablero_fotos) $formData.tablero_fotos = [];
	if (!$formData.tapiceria_fotos) $formData.tapiceria_fotos = [];
	if (!$formData.aire_acondicionado_fotos) $formData.aire_acondicionado_fotos = [];
	if (!$formData.motor_fotos) $formData.motor_fotos = [];
	if (!$formData.transmision_fotos) $formData.transmision_fotos = [];
	if (!$formData.frenos_fotos) $formData.frenos_fotos = [];
	if (!$formData.suspension_fotos) $formData.suspension_fotos = [];
	if (!$formData.estereo_fotos) $formData.estereo_fotos = [];
	if (!$formData.gato_fotos) $formData.gato_fotos = [];
	if (!$formData.refaccion_fotos) $formData.refaccion_fotos = [];
	if (!$formData.triangulos_fotos) $formData.triangulos_fotos = [];
	if (!$formData.manual_fotos) $formData.manual_fotos = [];

	// Inicializar campos de texto opcionales para evitar errores de TypeScript
	if (!$formData.cliente_email) $formData.cliente_email = "";
	if (!$formData.carroceria_observaciones) $formData.carroceria_observaciones = "";
	if (!$formData.pintura_observaciones) $formData.pintura_observaciones = "";
	if (!$formData.cristales_observaciones) $formData.cristales_observaciones = "";
	if (!$formData.llantas_observaciones) $formData.llantas_observaciones = "";
	if (!$formData.asientos_observaciones) $formData.asientos_observaciones = "";
	if (!$formData.tablero_observaciones) $formData.tablero_observaciones = "";
	if (!$formData.tapiceria_observaciones) $formData.tapiceria_observaciones = "";
	if (!$formData.aire_acondicionado_observaciones) $formData.aire_acondicionado_observaciones = "";
	if (!$formData.motor_observaciones) $formData.motor_observaciones = "";
	if (!$formData.transmision_observaciones) $formData.transmision_observaciones = "";
	if (!$formData.frenos_observaciones) $formData.frenos_observaciones = "";
	if (!$formData.suspension_observaciones) $formData.suspension_observaciones = "";
	if (!$formData.estereo_observaciones) $formData.estereo_observaciones = "";
	if (!$formData.otros_accesorios) $formData.otros_accesorios = "";
	if (!$formData.observaciones_generales) $formData.observaciones_generales = "";

</script>

<style>
</style>

<div class="max-w-4xl mx-auto">
	<!-- Header del paso actual -->
	<div class="mb-8">
		<div class="flex items-center gap-3 mb-4">
			{#if stepIcon}
				{@const IconComponent = stepIcon}
				<IconComponent class="size-8 text-primary" />
			{/if}
			<div>
				<div class="uppercase tracking-wide text-xs font-bold text-muted-foreground mb-1 leading-tight">
					Paso {step} de {steps.length}
				</div>
				<div class="text-2xl font-bold text-foreground">{stepTitle}</div>
			</div>
		</div>
		<Progress value={Number(step / steps.length * 100)} max={100} class="w-full rounded-full h-3" />
	</div>

	<form method="POST" class="space-y-6" use:enhance id="vehicle-reception-form">

		{#if step === 1}
			<!-- Información General del Vehículo -->
			<!-- <Card.Root class="animate-fade-up">
				<Card.Header>
					<Card.Title class="flex items-center gap-2">
						<User class="size-5" />
						Datos del Cliente
					</Card.Title>
				</Card.Header>
				<Card.Content class="space-y-4">
					<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
						<FormInput 
							{form} 
							name="cliente_nombre" 
							label="Nombre del Cliente" 
							placeholder="Nombre completo" 
							bind:value={$formData.cliente_nombre} 
							required 
						/>

						<FormInput 
							{form} 
							name="cliente_telefono" 
							label="Teléfono" 
							placeholder="+52 555 123 4567" 
							bind:value={$formData.cliente_telefono} 
							required 
						/>
					</div>

					<FormInput 
						{form} 
						name="cliente_email" 
						label="Email (Opcional)" 
						placeholder="cliente@ejemplo.com" 
						bind:value={$formData.cliente_email!} 
						type="email" 
					/>
				</Card.Content>
			</Card.Root> -->

			<Card.Root class="animate-fade-up">
				<Card.Header>
					<Card.Title class="flex items-center gap-2">
						<Car class="size-5" />
						Datos del Vehículo
					</Card.Title>
				</Card.Header>
				<Card.Content class="space-y-4">



					<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
						<!-- <Input id="file" type="file" accept="image/*" capture="environment"/> -->
						<FormInput {form} name="marca" label="Marca" placeholder="Toyota, Honda, etc." bind:value={$formData.marca} required />
						<FormInput {form} name="modelo" label="Modelo" placeholder="Corolla, Civic, etc." bind:value={$formData.modelo} required />
						<FormInput {form} name="año" label="Año" placeholder="2020" bind:value={$formData.año} required />
						<FormInput {form} name="color" label="Color" placeholder="Blanco, Negro, etc." bind:value={$formData.color} required />
						<FormInput {form} name="numero_serie" label="Número de Serie (VIN)" placeholder="1HGBH41JXMN109186" bind:value={$formData.numero_serie} required />
						<FormInput {form} name="placas" label="Placas" placeholder="ABC-123-D" bind:value={$formData.placas} required />
					</div>

					<FormInput {form} name="kilometraje" label="Kilometraje" placeholder="50,000 km" bind:value={$formData.kilometraje} required />
				</Card.Content>
			</Card.Root>

		{:else if step === 2}
			<!-- Condición Externa del Vehículo -->
			<Card.Root class="animate-fade-up">
				<Card.Header>
					<Card.Title>Condición Externa del Vehículo</Card.Title>
					<Card.Description>
						Evalúa el estado de los elementos externos del vehículo
					</Card.Description>
				</Card.Header>
				<Card.Content class="space-y-6">
					<InspectionSection 
						{form} 
						name="carroceria" 
						title="la Carrocería" 
						bind:estado={$formData.carroceria_estado} 
						bind:observaciones={$formData.carroceria_observaciones!}
						bind:fotos={$formData.carroceria_fotos}
						{estadosDisponibles}
						placeholder="Describe cualquier daño, rayón, abolladuras, etc."
						{API_CONFIG}
					/>

					<InspectionSection 
						{form} 
						name="pintura" 
						title="la Pintura" 
						bind:estado={$formData.pintura_estado} 
						bind:observaciones={$formData.pintura_observaciones!}
						bind:fotos={$formData.pintura_fotos}
						{estadosDisponibles}
						placeholder="Describe decoloración, rayones, óxido, etc."
						{API_CONFIG}
					/>

					<InspectionSection 
						{form} 
						name="cristales" 
						title="los Cristales" 
						bind:estado={$formData.cristales_estado} 
						bind:observaciones={$formData.cristales_observaciones!}
						bind:fotos={$formData.cristales_fotos}
						{estadosDisponibles}
						placeholder="Describe fracturas, chips, tintado, etc."
						{API_CONFIG}
					/>

					<InspectionSection 
						{form} 
						name="llantas" 
						title="Llantas y Rines" 
						bind:estado={$formData.llantas_estado} 
						bind:observaciones={$formData.llantas_observaciones!}
						bind:fotos={$formData.llantas_fotos}
						{estadosDisponibles}
						placeholder="Describe desgaste, daños en rines, presión, etc."
						isLast={true}
						{API_CONFIG}
					/>
				</Card.Content>
			</Card.Root>

		{:else if step === 3}
			<!-- Condición Interna del Vehículo -->
			<Card.Root class="animate-fade-up">
				<Card.Header>
					<Card.Title>Condición Interna del Vehículo</Card.Title>
					<Card.Description>
						Evalúa el estado del interior y componentes internos
					</Card.Description>
				</Card.Header>
				<Card.Content class="space-y-6">
					<InspectionSection 
						{form} 
						name="asientos" 
						title="los Asientos" 
						bind:estado={$formData.asientos_estado} 
						bind:observaciones={$formData.asientos_observaciones!}
						bind:fotos={$formData.asientos_fotos}
						{estadosDisponibles}
						placeholder="Describe rasgaduras, desgaste, manchas, etc."
						{API_CONFIG}
					/>

					<InspectionSection 
						{form} 
						name="tablero" 
						title="el Tablero" 
						bind:estado={$formData.tablero_estado} 
						bind:observaciones={$formData.tablero_observaciones!}
						bind:fotos={$formData.tablero_fotos}
						{estadosDisponibles}
						placeholder="Describe funcionamiento de luces, grietas, faltantes, etc."
						{API_CONFIG}
					/>

					<InspectionSection 
						{form} 
						name="tapiceria" 
						title="la Tapicería" 
						bind:estado={$formData.tapiceria_estado} 
						bind:observaciones={$formData.tapiceria_observaciones!}
						bind:fotos={$formData.tapiceria_fotos}
						{estadosDisponibles}
						placeholder="Describe el estado de puertas, techo, alfombras, etc."
						{API_CONFIG}
					/>

					<InspectionSection 
						{form} 
						name="aire_acondicionado" 
						title="el Aire Acondicionado" 
						bind:estado={$formData.aire_acondicionado_estado} 
						bind:observaciones={$formData.aire_acondicionado_observaciones!}
						bind:fotos={$formData.aire_acondicionado_fotos}
						{estadosDisponibles}
						placeholder="Describe funcionamiento, fugas, olores, etc."
						isLast={true}
						{API_CONFIG}
					/>
				</Card.Content>
			</Card.Root>
			
		{:else if step === 4}
			<!-- Motor y Mecánica -->
			<Card.Root class="animate-fade-up">
				<Card.Header>
					<Card.Title>Motor y Componentes Mecánicos</Card.Title>
					<Card.Description>
						Evalúa el estado de los componentes mecánicos del vehículo
					</Card.Description>
				</Card.Header>
				<Card.Content class="space-y-6">
					<InspectionSection 
						{form} 
						name="motor" 
						title="el Motor" 
						bind:estado={$formData.motor_estado} 
						bind:observaciones={$formData.motor_observaciones!}
						bind:fotos={$formData.motor_fotos}
						{estadosDisponibles}
						placeholder="Describe ruidos, fugas, humo, rendimiento, etc."
						{API_CONFIG}
					/>

					<InspectionSection 
						{form} 
						name="transmision" 
						title="la Transmisión" 
						bind:estado={$formData.transmision_estado} 
						bind:observaciones={$formData.transmision_observaciones!}
						bind:fotos={$formData.transmision_fotos}
						{estadosDisponibles}
						placeholder="Describe cambios, ruidos, fugas de aceite, etc."
						{API_CONFIG}
					/>

					<InspectionSection 
						{form} 
						name="frenos" 
						title="los Frenos" 
						bind:estado={$formData.frenos_estado} 
						bind:observaciones={$formData.frenos_observaciones!}
						bind:fotos={$formData.frenos_fotos}
						{estadosDisponibles}
						placeholder="Describe respuesta, ruidos, vibración, líquido, etc."
						{API_CONFIG}
					/>

					<InspectionSection 
						{form} 
						name="suspension" 
						title="la Suspensión" 
						bind:estado={$formData.suspension_estado} 
						bind:observaciones={$formData.suspension_observaciones!}
						bind:fotos={$formData.suspension_fotos}
						{estadosDisponibles}
						placeholder="Describe ruidos, rebote, alineación, etc."
						isLast={true}
						{API_CONFIG}
					/>
				</Card.Content>
			</Card.Root>

		{:else if step === 5}
			<!-- Accesorios y Elementos Adicionales -->
			<Card.Root class="animate-fade-up">
				<Card.Header>
					<Card.Title>Accesorios y Elementos Adicionales</Card.Title>
					<Card.Description>
						Documenta la presencia y estado de los accesorios del vehículo
					</Card.Description>
				</Card.Header>
				<Card.Content class="space-y-6">
					<ConditionalAccessory 
						{form} 
						name="estereo" 
						title="Estéreo presente" 
						bind:presente={$formData.estereo_presente}
						bind:estado={$formData.estereo_estado} 
						bind:observaciones={$formData.estereo_observaciones}
						{estadosDisponibles}
						placeholder="Marca, modelo, funcionamiento, etc."
					/>

					<ConditionalAccessory 
						{form} 
						name="gato" 
						title="Gato y herramientas presentes" 
						bind:presente={$formData.gato_presente}
						bind:estado={$formData.gato_estado} 
						{estadosDisponibles}
					/>

					<ConditionalAccessory 
						{form} 
						name="refaccion" 
						title="Llanta de refacción presente" 
						bind:presente={$formData.refaccion_presente}
						bind:estado={$formData.refaccion_estado} 
						{estadosDisponibles}
					/>

					<ConditionalAccessory 
						{form} 
						name="triangulos" 
						title="Triángulos de seguridad presentes" 
						bind:presente={$formData.triangulos_presente}
						bind:estado={$formData.triangulos_estado} 
						{estadosDisponibles}
					/>

					<ConditionalAccessory 
						{form} 
						name="manual" 
						title="Manual del propietario presente" 
						bind:presente={$formData.manual_presente}
						bind:estado={$formData.manual_estado} 
						{estadosDisponibles}
					/>

					<Separator />

					<!-- Otros Accesorios -->
					<ObservationsTextarea 
						{form} 
						name="otros_accesorios" 
						label="Otros Accesorios" 
						bind:value={$formData.otros_accesorios!}
						placeholder="Describe cualquier otro accesorio presente en el vehículo"
						rows={3}
					/>
				</Card.Content>
			</Card.Root>

		{:else if step === 6}
			<!-- Documentos y Finalización -->
			<Card.Root class="animate-fade-up">
				<Card.Header>
					<Card.Title>Documentos y Finalización</Card.Title>
					<Card.Description>
						Verifica la documentación y completa la recepción del vehículo
					</Card.Description>
				</Card.Header>
				<Card.Content class="space-y-6">
					<!-- Documentos -->
					<div class="space-y-4">
						<h3 class="text-lg font-medium">Documentos Presentes</h3>
						<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
							<DocumentCheckbox 
								{form} 
								name="tarjeta_circulacion" 
								label="Tarjeta de circulación" 
								bind:checked={$formData.tarjeta_circulacion}
							/>

							<DocumentCheckbox 
								{form} 
								name="factura_presente" 
								label="Factura o título de propiedad" 
								bind:checked={$formData.factura_presente}
							/>

							<DocumentCheckbox 
								{form} 
								name="verificacion_presente" 
								label="Verificación vehicular" 
								bind:checked={$formData.verificacion_presente}
							/>

							<DocumentCheckbox 
								{form} 
								name="seguro_presente" 
								label="Póliza de seguro" 
								bind:checked={$formData.seguro_presente}
							/>
						</div>
					</div>

					<Separator />

					<!-- Condición General -->
					<StateRadioGroup 
						{form} 
						name="condicion_general" 
						title="Condición General del Vehículo" 
						bind:value={$formData.condicion_general}
						{estadosDisponibles}
						subtitle="Evaluación general"
						large={true}
					/>

					<Separator />

					<!-- Observaciones Generales -->
					<ObservationsTextarea 
						{form} 
						name="observaciones_generales" 
						label="Observaciones Generales" 
						bind:value={$formData.observaciones_generales!}
						placeholder="Añade cualquier observación adicional sobre el vehículo o la recepción"
						rows={4}
					/>

					<Separator />

					<!-- Datos de Recepción -->
					<div class="space-y-4">
						<h3 class="text-lg font-medium">Datos de Recepción</h3>
						<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
							<FormInput 
								{form} 
								name="responsable_recepcion" 
								label="Responsable de Recepción" 
								bind:value={$formData.responsable_recepcion}
								placeholder="Nombre del empleado"
								required={true}
							/>

							<FormInput 
								{form} 
								name="fecha_recepcion" 
								label="Fecha de Recepción" 
								bind:value={$formData.fecha_recepcion}
								type="date"
								required={true}
							/>
						</div>
					</div>
				</Card.Content>
			</Card.Root>

		{/if}

	</form>

	<!-- Barra de navegación inferior -->
	<div class="sticky bottom-0 left-0 z-50 w-full py-4 bg-background/95 backdrop-blur-sm border-t border-border mt-8">
		<div class="max-w-4xl mx-auto px-4">
			<div class="flex justify-between items-center gap-4">
				<div class="flex-1">
					{#if step > 1}
						<Button size="lg" variant="outline" type="button" onclick={() => {
							scrollToTop(); 
							step--;
							options.validators = steps[step - 1];
						}} class="w-full sm:w-auto">
							Regresar
						</Button>
					{/if}
				</div>
				
				<div class="flex-1 flex justify-center">
					<div class="text-sm text-muted-foreground">
						Paso {step} de {steps.length}
					</div>
				</div>
				
				<div class="flex-1 flex justify-end">
					{#if step < steps.length}
						<Button size="lg" type="button" onclick={async () => {
							const result = await validateForm({ update: true });
							if (result.valid) {
								step += 1;
								scrollToTop();
								options.validators = steps[step - 1];
							}
						}} class="w-full sm:w-auto">
							Siguiente
						</Button>
					{:else}
						<Button size="lg" type="button" onclick={async () => {
							const result = await validateForm({ update: false });
							if (result.valid) {
								await handleFinalSubmit(result.data);
							}
						}} class="w-full sm:w-auto bg-green-600 hover:bg-green-700">
							Completar Recepción
						</Button>
					{/if}
				</div>
			</div>
		</div>
	</div>
</div>

<!-- Debug en desarrollo -->
{#if dev}
	<div class="mt-8 max-w-4xl mx-auto">
		<SuperDebug data={$formData} />
	</div>
{/if}
