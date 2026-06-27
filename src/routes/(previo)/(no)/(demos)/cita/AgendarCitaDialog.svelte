<script lang="ts">
	import { Button } from "$lib/components/ui/button";
	import * as Card from "$lib/components/ui/card";
	import * as Dialog from "$lib/components/ui/dialog";
	import { Badge } from "$lib/components/ui/badge";
	import Calendar from "$lib/components/ui/calendar/calendar.svelte";
	import { CalendarDate, getLocalTimeZone } from "@internationalized/date";
	import { Clock, CheckCircle2, ArrowLeft, ArrowRight } from "@lucide/svelte";
	import { server } from '$lib/siteConfig';
	import { goto } from "$app/navigation";

	let { 
		open = $bindable(false),
		proyecto,
		serviciosTipo = []
	}: {
		open: boolean;
		proyecto: any;
		serviciosTipo: any[];
	} = $props();

	// Estados del diálogo
	let currentStep = $state(1);
	let selectedServicio = $state<any>(null);
	let selectedDate = $state<CalendarDate | undefined>(undefined);
	let selectedTime = $state<string | null>(null);
	let isSendingToERP = $state(false);

	// Datos del calendario
	const bookedDates = Array.from({ length: 3 }, (_, i) => new CalendarDate(2026, 9, 10 + i));
	const timeSlots = Array.from({ length: 37 }, (_, i) => {
		const totalMinutes = i * 15;
		const hour = Math.floor(totalMinutes / 60) + 9;
		const minute = totalMinutes % 60;
		return `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
	});

	function nextStep() {
		if (currentStep < 3) {
			currentStep++;
		}
	}

	function prevStep() {
		if (currentStep > 1) {
			currentStep--;
		}
	}

	function resetDialog() {
		currentStep = 1;
		selectedServicio = null;
		selectedDate = undefined;
		selectedTime = null;
	}

	function handleClose() {
		resetDialog();
		open = false;
	}

	function selectServicio(servicio: any) {
		selectedServicio = servicio;
		nextStep();
	}

	async function confirmCita() {
		if (!proyecto || !selectedServicio || !selectedDate || !selectedTime) {
			alert('Faltan datos para confirmar la cita');
			return;
		}

		isSendingToERP = true;

		try {
			// Formatear fecha para el SP (MM/dd/yyyy)
			const fechaCita = selectedDate.toDate(getLocalTimeZone()).toLocaleDateString('en-US', {
				month: '2-digit',
				day: '2-digit',
				year: 'numeric'
			});

			console.log('📤 Enviando cita al ERP:', {
				Usuario: 'INT',
				Folio: proyecto.Folio,
				FechaCita: fechaCita,
				HoraCita: selectedTime,
				Observaciones: 'Cita agendada desde portal web',
				ServicioTipo: selectedServicio.Tipo
			});

			const response = await fetch(
				server.api + 'sp/spWebVentaCita',
				{
					method: 'POST',
					body: JSON.stringify({
						Usuario: 'INT',
						Folio: proyecto.Folio,
						FechaCita: fechaCita,
						HoraCita: selectedTime,
						Observaciones: 'Cita agendada desde portal web',
						ServicioTipo: selectedServicio.Tipo
					}),
					headers: {
						'Content-Type': 'application/json',
						Authorization:
							'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1bmlxdWVfbmFtZSI6Ik1BU0VSUCIsIm5iZiI6MTcwNDczOTg5MiwiZXhwIjoxNzk0NzM5ODkyLCJpYXQiOjE3MDQ3Mzk4OTIsImlzcyI6IkFQSSBSRVNUIiwiYXVkIjoiTUFTIEVSUCJ9.FjzsgDNyQRodwo_vk1UgJ8RcC0xh27SSZm7NoLotIok'
					}
				}
			);

			const data = await response.json();
			console.log('📥 Respuesta del ERP:', data);

			if (data[0]?.Ok === null || data[0]?.Ok === undefined) {
				alert('✅ Cita agendada exitosamente en el ERP');
				console.log('✅ Cita agendada correctamente:', data);
				handleClose();
        goto(`/cita/cotizacion`);
			} else {
				alert('❌ Error al agendar cita en ERP: ' + (data[0]?.OkRef || 'Error desconocido'));
				console.error('❌ Error del ERP:', data[0]?.OkRef);
			}

		} catch (error) {
			console.error('❌ Error al enviar cita al ERP:', error);
			alert('❌ Error de conexión al enviar la cita al ERP. Revise la consola para más detalles.');
		} finally {
			isSendingToERP = false;
		}
	}

	function formatSelectedDate() {
		if (!selectedDate) return '';
		return selectedDate.toDate(getLocalTimeZone()).toLocaleDateString("es-ES", {
			weekday: "long",
			day: "numeric",
			month: "long",
			year: "numeric"
		});
	}
</script>

<Dialog.Root bind:open>
	<Dialog.Content class="max-w-4xl max-h-[90vh] overflow-y-auto">
		<Dialog.Header>
			<Dialog.Title>Agendar Servicio</Dialog.Title>
			<Dialog.Description>
				{#if currentStep === 1}
					Selecciona el tipo de servicio que necesitas
				{:else if currentStep === 2}
					Elige la fecha y hora para tu cita
				{:else}
					Confirma los detalles de tu cita
				{/if}
			</Dialog.Description>
		</Dialog.Header>

		<!-- Indicador de pasos -->
		<div class="flex items-center justify-center mb-6">
			<div class="flex items-center space-x-2">
				{#each Array(3) as _, i}
					<div class="flex items-center">
						<div class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium {
							currentStep > i + 1 ? 'bg-primary text-primary-foreground' :
							currentStep === i + 1 ? 'bg-primary text-primary-foreground' :
							'bg-muted text-muted-foreground'
						}">
							{currentStep > i + 1 ? '✓' : i + 1}
						</div>
						{#if i < 2}
							<div class="w-12 h-0.5 {currentStep > i + 1 ? 'bg-primary' : 'bg-muted'}"></div>
						{/if}
					</div>
				{/each}
			</div>
		</div>

		<!-- Contenido del paso actual -->
		<div class="min-h-[400px]">
			{#if currentStep === 1}
				<!-- Paso 1: Selección de servicio -->
				<div class="space-y-4">
					<h3 class="text-lg font-semibold mb-4">Tipos de Servicio Disponibles</h3>
					<div class="grid gap-3 max-h-80 overflow-y-auto">
						{#each serviciosTipo as servicio}
							<button
								type="button"
								onclick={() => selectServicio(servicio)}
								class="p-4 text-left border rounded-lg hover:bg-muted/50 transition-colors {
									selectedServicio?.Tipo === servicio.Tipo ? 'border-primary bg-primary/5' : 'border-border'
								}"
							>
								<div class="font-medium">{servicio.Tipo}</div>
								<div class="text-sm text-muted-foreground mt-1">Servicio de mantenimiento</div>
							</button>
						{/each}
					</div>
				</div>

			{:else if currentStep === 2}
				<!-- Paso 2: Selección de fecha y hora -->
				<div class="space-y-4">
					<h3 class="text-lg font-semibold mb-4">Selecciona Fecha y Hora</h3>
					
					<Card.Root class="gap-0 p-0">
						<Card.Content class="relative p-0 md:pr-48">
							<div class="p-6">
								<Calendar
									type="single"
									bind:value={selectedDate}
									isDateUnavailable={(date) => bookedDates.some((d) => d.compare(date) === 0)}
									class="data-unavailable:line-through data-unavailable:opacity-100 bg-transparent p-0 [--cell-size:--spacing(10)] md:[--cell-size:--spacing(12)] [&_[data-outside-month]]:hidden"
									weekdayFormat="short"
								/>
							</div>
							<div class="no-scrollbar inset-y-0 right-0 flex max-h-72 w-full scroll-pb-6 flex-col gap-4 overflow-y-auto border-t p-6 md:absolute md:max-h-none md:w-48 md:border-l md:border-t-0">
								<div class="grid gap-2">
									{#each timeSlots as time}
										<Button
											variant={selectedTime === time ? "default" : "outline"}
											onclick={() => (selectedTime = time)}
											class="w-full shadow-none"
											size="sm"
										>
											{time}
										</Button>
									{/each}
								</div>
							</div>
						</Card.Content>
						<Card.Footer class="flex flex-col gap-4 border-t !py-5 px-6 md:flex-row">
							<div class="text-sm">
								{#if selectedDate && selectedTime}
									Cita programada para
									<span class="font-medium">{formatSelectedDate()}</span>
									a las <span class="font-medium">{selectedTime}</span>.
								{:else}
									Selecciona una fecha y hora para tu cita.
								{/if}
							</div>
						</Card.Footer>
					</Card.Root>
				</div>

			{:else if currentStep === 3}
				<!-- Paso 3: Confirmación -->
				<div class="space-y-6">
					<div class="text-center">
						<CheckCircle2 class="h-16 w-16 text-green-500 mx-auto mb-4" />
						<h3 class="text-lg font-semibold mb-2">Confirmar Cita</h3>
						<p class="text-muted-foreground">Revisa los detalles de tu cita antes de confirmar</p>
					</div>

					<Card.Root>
						<Card.Header>
							<Card.Title class="text-base">Detalles de la Cita</Card.Title>
						</Card.Header>
						<Card.Content class="space-y-4">
							<!-- Información del vehículo -->
							<div class="flex justify-between items-start">
								<span class="text-sm text-muted-foreground">Vehículo:</span>
								<div class="text-right">
									<div class="font-medium">{proyecto.Descripcion1}</div>
									<div class="text-sm text-muted-foreground">{proyecto.Folio}</div>
								</div>
							</div>

							<!-- Cliente -->
							<div class="flex justify-between items-center">
								<span class="text-sm text-muted-foreground">Cliente:</span>
								<span class="font-medium">{proyecto.Nombre}</span>
							</div>

							<!-- Servicio -->
							<div class="flex justify-between items-center">
								<span class="text-sm text-muted-foreground">Servicio:</span>
								<Badge variant="secondary">{selectedServicio?.Tipo}</Badge>
							</div>

							<!-- Fecha y hora -->
							<div class="flex justify-between items-start">
								<span class="text-sm text-muted-foreground">Fecha y hora:</span>
								<div class="text-right">
									<div class="font-medium">{formatSelectedDate()}</div>
									<div class="text-sm text-muted-foreground">{selectedTime}</div>
								</div>
							</div>
						</Card.Content>
					</Card.Root>
				</div>
			{/if}
		</div>

		<!-- Footer con botones de navegación -->
		<Dialog.Footer class="flex justify-between">
			<div>
				{#if currentStep > 1}
					<Button variant="outline" onclick={prevStep}>
						<ArrowLeft class="h-4 w-4 mr-2" />
						Anterior
					</Button>
				{/if}
			</div>
			
			<div class="flex gap-2">
				<Button variant="outline" onclick={handleClose}>
					Cancelar
				</Button>
				
				{#if currentStep === 2}
					<Button 
						onclick={nextStep} 
						disabled={!selectedDate || !selectedTime}
					>
						Siguiente
						<ArrowRight class="h-4 w-4 ml-2" />
					</Button>
				{:else if currentStep === 3}
					<Button onclick={confirmCita} disabled={isSendingToERP}>
						{#if isSendingToERP}
							Enviando...
						{:else}
							Confirmar Cita
						{/if}
					</Button>
				{/if}
			</div>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
