
<script lang="ts">
	import { type Infer, type SuperValidated, superForm } from "sveltekit-superforms";
	import SuperDebug from "sveltekit-superforms";
	import * as Card from "$lib/components/ui/card/index.js";
	import { browser, dev } from "$app/environment";
	import { 
		step1Schema, 
		type VehicleRequestSchema 
	} from './schema.js';
	import { zod } from 'sveltekit-superforms/adapters';
	import { Car, User, CheckCircle2, FileText, Calculator, Shield } from "lucide-svelte";
	import Button from "$lib/components/ui/button/button.svelte";
	import { toast } from 'svelte-sonner';
	import { server } from '$lib/siteConfig';
	import { goto } from '$app/navigation';
	import * as Sidebar from "$lib/components/ui/sidebar/index.js";

	// Componentes reutilizables del formulario
	import FormInput from './components/FormInput.svelte';

	let { 
		data,
		formPaso1,
		API_CONFIG,
		Modulo,
		ID,
		ordenCompra
	}: { 
		data: SuperValidated<Infer<VehicleRequestSchema>>;
		formPaso1?: SuperValidated<Infer<typeof step1Schema>>;
		API_CONFIG: {
			url: string;
			token: string;
			path: string;
			timeout: number;
			maxFileSize: number;
			acceptedTypes: string[];
		};
		Modulo: string;
		ID: number;
		ordenCompra?: any[];
	} = $props();

	// Determinar qué datos usar para inicializar
	// Si tenemos datos precargados del paso 1, los usamos, sino usamos el form completo
	const shouldUsePrecargados = formPaso1 && ordenCompra && ordenCompra.length > 0;
	
	const form = superForm(shouldUsePrecargados ? formPaso1 : data, {
		SPA: true,
		validators: zod(step1Schema),
		dataType: 'json'
	});

	const { form: formData, enhance, validateForm } = form;

	// Verificar si hay datos precargados y mostrar notificación
	if (shouldUsePrecargados && browser) {
		toast.success(`Datos precargados desde orden de compra`, {
			description: `Vehículo: ${ordenCompra[0]?.Descripcion1 || 'N/A'} - VIN: ${ordenCompra[0]?.VIN || 'N/A'}`,
			duration: 5000
		});
	}

	// Hook del sidebar para obtener el estado
	const sidebar = Sidebar.useSidebar();

	// Función para manejar el envío final
	async function handleFinalSubmit(data: Infer<VehicleRequestSchema>) {
		try {
			console.log('Enviando solicitud de cotización:', data);
			
			const response = await fetch(
				server.api + "sp/SP_ProcesarJsonVehiculos",
				{
					method: "POST",
					body: JSON.stringify({
						Usuario: "MASERP",
						JsonData: JSON.stringify(data)
					}),
					headers: {
						"Content-Type": "application/json",
						Authorization:
							"Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1bmlxdWVfbmFtZSI6Ik1BU0VSUCIsIm5iZiI6MTcwNDczOTg5MiwiZXhwIjoxNzk0NzM5ODkyLCJpYXQiOjE3MDQ3Mzk4OTIsImlzcyI6IkFQSSBSRVNUIiwiYXVkIjoiTUFTIEVSUCJ9.FjzsgDNyQRodwo_vk1UgJ8RcC0xh27SSZm7NoLotIok",
					},
				}
			);

			const responseData = await response.json();

			if (responseData[0]?.Ok === null) {
				console.log('Respuesta exitosa:', responseData);
				toast.success("Solicitud de cotización enviada exitosamente");
				goto('/cotizacion');
			} else {
				toast.error(responseData[0]?.OkRef || "Error al procesar la solicitud");
			}
			
		} catch (error) {
			console.error('Error:', error);
			toast.error('Error de conexión al procesar la solicitud de cotización');
		}
	}

	// Inicializar campos de texto opcionales para evitar errores de TypeScript
	if (!$formData.cliente_email) $formData.cliente_email = "";
	if (!$formData.compania) $formData.compania = "";
	
	// Inicializar campos de seguridad
	if (!$formData.uso) $formData.uso = undefined;
	if (!$formData.amenazas) $formData.amenazas = undefined;
	if (!$formData.cobertura) $formData.cobertura = undefined;
	if (!$formData.requisitos) $formData.requisitos = "";
	if (!$formData.ubicacion) $formData.ubicacion = "";

</script>

<div class="max-w-4xl mx-auto">
	<!-- Header -->
	<div 
		class="fixed top-[calc(var(--header-height))] left-0 right-0 md:left-[calc(var(--sidebar-width))] z-40 bg-linear-to-b from-bg-background to-card backdrop-blur-sm border-b border-border"
		class:md:w-[calc(100vw-calc(var(--spacing)*74))]={sidebar.state !== 'collapsed'}
		class:md:w-[calc(100vw-calc(0.25rem*20))]={sidebar.state === 'collapsed'}
	>
		<div class="max-w-4xl mx-auto px-4 py-4 md:max-w-none md:px-6">
			<div class="flex items-center gap-3 mb-2">
				<Calculator class="size-8 text-primary" />
				<div>
					<div class=" tracking-wide text-xs font-medium text-muted-foreground/70 mb-0 leading-tight">
						{ID ? `Solicitud ${ID}` : 'Nueva Solicitud'}
					</div>
					<div class="text-xl font-bold text-foreground">Solicitud de Cotización</div>
				</div>
			</div>
		</div>
	</div>

	<!-- Espaciador para evitar que el contenido se esconda -->
	<div class="h-[calc(var(--header-height)+40px)]"></div>

	<form method="POST" class="space-y-6" use:enhance id="vehicle-quote-form">

		<!-- Indicador de datos precargados -->
		{#if shouldUsePrecargados}
			<div class="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 animate-fade-up">
				<div class="flex items-start gap-3">
					<CheckCircle2 class="size-5 text-green-600 mt-0.5 flex-shrink-0" />
					<div class="flex-1">
						<h4 class="text-sm font-medium text-green-800 mb-1">
							Datos precargados desde la orden de compra
						</h4>
						<p class="text-sm text-green-700 mb-2">
							Los siguientes datos se cargaron automáticamente. Completa los campos vacíos.
						</p>
						<div class="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-green-600">
							{#if ordenCompra[0]?.Empresa || ordenCompra[0]?.RazonSocial}
								<div><strong>Compañía:</strong> {ordenCompra[0]?.Empresa || ordenCompra[0]?.RazonSocial || 'N/A'}</div>
							{/if}
							<div><strong>Cliente:</strong> {ordenCompra[0]?.Nombre || 'N/A'}</div>
							<div><strong>Teléfono:</strong> {ordenCompra[0]?.Telefonos || 'N/A'}</div>
							<div><strong>Modelo:</strong> {ordenCompra[0]?.Descripcion1 || 'N/A'}</div>
							<div><strong>VIN:</strong> {ordenCompra[0]?.VIN || 'N/A'}</div>
							<div><strong>Año:</strong> {ordenCompra[0]?.Modelo || 'N/A'}</div>
							{#if ordenCompra[0]?.EMail}
								<div><strong>Email:</strong> {ordenCompra[0].EMail}</div>
							{/if}
						</div>
					</div>
				</div>
			</div>
		{/if}

		<!-- Información General del Vehículo -->
		<Card.Root class="animate-fade-up">
			<Card.Header>
				<Card.Title class="flex items-center gap-2">
					<User class="size-5" />
					Datos del Cliente
				</Card.Title>
			</Card.Header>
			<Card.Content class="space-y-4">
				<FormInput 
					{form} 
					name="compania" 
					label="Compañía (Opcional)" 
					placeholder="Nombre de la compañía" 
					bind:value={$formData.compania!} 
				/>

				<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
					<FormInput 
						{form} 
						name="cliente_nombre" 
						label="Contacto" 
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
		</Card.Root>

		<Card.Root class="animate-fade-up">
			<Card.Header>
				<Card.Title class="flex items-center gap-2">
					<Car class="size-5" />
					Datos del Vehículo
				</Card.Title>
			</Card.Header>
			<Card.Content class="space-y-4">
				<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
					<FormInput {form} name="marca" label="Marca" placeholder="Toyota, Honda, etc." bind:value={$formData.marca} required />
					<FormInput {form} name="modelo" label="Modelo" placeholder="Corolla, Civic, etc." bind:value={$formData.modelo} required />
					<FormInput {form} name="año" label="Año" placeholder="2020" bind:value={$formData.año} required />
				</div>
			</Card.Content>
		</Card.Root>

		<Card.Root class="animate-fade-up">
			<Card.Header>
				<Card.Title class="flex items-center gap-2">
					<Shield class="size-5" />
					Información de Seguridad
				</Card.Title>
			</Card.Header>
			<Card.Content class="space-y-4">
				<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
					<div class="space-y-2">
						<label for="uso" class="text-sm font-medium">Uso</label>
						<select 
							id="uso"
							name="uso"
							bind:value={$formData.uso!}
							class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
						>
							<option value="">Seleccionar uso</option>
							<option value="Personal">Personal</option>
							<option value="Ejecutivo">Ejecutivo</option>
							<option value="Valores">Valores</option>
						</select>
					</div>

					<div class="space-y-2">
						<label for="amenazas" class="text-sm font-medium">Amenazas</label>
						<select 
							id="amenazas"
							name="amenazas"
							bind:value={$formData.amenazas!}
							class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
						>
							<option value="">Seleccionar amenaza</option>
							<option value="Arma corta">Arma corta</option>
							<option value="Arma Larga">Arma Larga</option>
							<option value="Explosivos">Explosivos</option>
						</select>
					</div>

					<div class="space-y-2">
						<label for="cobertura" class="text-sm font-medium">Cobertura</label>
						<select 
							id="cobertura"
							name="cobertura"
							bind:value={$formData.cobertura!}
							class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
						>
							<option value="">Seleccionar cobertura</option>
							<option value="Conductor">Conductor</option>
							<option value="Pasajeros">Pasajeros</option>
							<option value="Total">Total</option>
						</select>
					</div>
				</div>

				<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div class="space-y-2">
						<label for="requisitos" class="text-sm font-medium">Requisitos</label>
						<textarea 
							id="requisitos"
							name="requisitos"
							bind:value={$formData.requisitos!} 
							class="min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
							placeholder="Requisitos específicos de seguridad"
						></textarea>
					</div>

					<div class="space-y-2">
						<label for="ubicacion" class="text-sm font-medium">Ubicación</label>
						<textarea 
							id="ubicacion"
							name="ubicacion"
							bind:value={$formData.ubicacion!} 
							class="min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
							placeholder="Ubicación donde se utilizará el vehículo"
						></textarea>
					</div>
				</div>
			</Card.Content>
		</Card.Root>

	</form>

	<!-- Barra de envío inferior -->
	<div 
		class="sticky bottom-0 left-0 md:left-[calc(var(--sidebar-width))] right-0 z-50 py-4 bg-background/95 backdrop-blur-sm border-t border-border mt-8"
		class:md:w-[calc(100vw-calc(var(--spacing)*74))]={sidebar.state !== 'collapsed'}
		class:md:w-[calc(100vw-calc(0.25rem*20))]={sidebar.state === 'collapsed'}
	>
		<div class="max-w-4xl mx-auto ">
			<div class="flex justify-center items-center">
				<Button size="lg" type="button" onclick={async () => {
					const result = await validateForm({ update: false });
					if (result.valid) {
						await handleFinalSubmit(result.data);
					} else {
						toast.error('Por favor, completa todos los campos requeridos', {
							description: 'Revisa los campos marcados en rojo'
						});
					}
				}} class="w-full sm:w-auto bg-green-600 hover:bg-green-700">
					<CheckCircle2 class="size-4 mr-2" />
					Enviar Solicitud
				</Button>
			</div>
		</div>
	</div>
</div>

<!-- Debug en desarrollo -->
{#if dev}
	<div class="mt-8 max-w-4xl mx-auto space-y-4">
		{#if ordenCompra && ordenCompra.length > 0}
			<SuperDebug data={ordenCompra[0]} />
		{/if}
		<SuperDebug data={$formData} />
	</div>
{/if}
