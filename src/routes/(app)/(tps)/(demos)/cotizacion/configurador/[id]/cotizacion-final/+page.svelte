<script lang="ts">
	import { Button } from "$lib/components/ui/button";
	import { Badge } from "$lib/components/ui/badge";
	import * as Card from "$lib/components/ui/card";
	import * as Table from "$lib/components/ui/table";
	import { Separator } from "$lib/components/ui/separator";
	import { ArrowLeft, FileText, Download, Send, Car, Shield, Weight, Calendar, User, Phone, Mail, MapPin, Database } from "@lucide/svelte";
	import { goto } from '$app/navigation';
	import { toast } from "svelte-sonner";
	import { server } from "$lib/siteConfig";
	import { Check, X } from "@lucide/svelte";

	interface CotizacionData {
		solicitudId: string;
		clienteInfo: {
			cliente: string;
			nombre: string;
			telefono: string;
			email: string;
		};
		vehiculoInfo: {
			marca: string;
			modelo: string;
			año: string;
			uso: string;
			amenazas: string;
			cobertura: string;
		};
		configuracion: any;
		precios: {
			subtotal: number;
			iva: number;
			total: number;
			pesoAproximadoBlindaje: number;
		};
		fechaGeneracion: string;
		listaMateriales: Array<{
			categoria: string;
			descripcion: string;
			cantidad?: number;
			unidad?: string;
			precioUnitario: number;
			importe: number;
		}>;
	}

	interface PageData {
		cotizacion: CotizacionData;
	}

	let { data }: { data: PageData } = $props();

	function volverAtras() {
		goto(`/cotizacion/configurador/${data.cotizacion.solicitudId}`);
	}

	function descargarPDF() {
		console.log('Descargando cotización en PDF...');
		// Aquí se implementaría la generación del PDF
	}

	function enviarPorEmail() {
		console.log('Enviando cotización por email...');
		// Aquí se implementaría el envío por email
	}

	async function enviarAlERP() {
		console.log('Enviando cotización al ERP...');
		
		// Preparar JSON completo con todos los datos de la cotización
		const datosParaERP = {
			solicitud: {
				id: data.cotizacion.solicitudId,
				fechaGeneracion: data.cotizacion.fechaGeneracion,
				estado: "cotizada"
			},
			cliente: {
				codigo: data.cotizacion.clienteInfo.cliente,
				nombre: data.cotizacion.clienteInfo.nombre,
				telefono: data.cotizacion.clienteInfo.telefono,
				email: data.cotizacion.clienteInfo.email
			},
			vehiculo: {
				marca: data.cotizacion.vehiculoInfo.marca,
				modelo: data.cotizacion.vehiculoInfo.modelo,
				año: data.cotizacion.vehiculoInfo.año,
				uso: data.cotizacion.vehiculoInfo.uso,
				nivelAmenazas: data.cotizacion.vehiculoInfo.amenazas,
				tipoCobertura: data.cotizacion.vehiculoInfo.cobertura
			},
			configuracionBlindaje: {
				nivelProteccion: data.cotizacion.configuracion.nivelProteccion,
				tipoBlindaje: data.cotizacion.configuracion.tipoBlindaje,
				cristalesEspeciales: data.cotizacion.configuracion.cristalesEspeciales,
				suspensionReforzada: data.cotizacion.configuracion.suspensionReforzada,
				opciones: {
					rollBarTecho: data.cotizacion.configuracion.rollBarTecho || false,
					proteccionBateria: data.cotizacion.configuracion.proteccionBateria || false,
					runFlatTires: data.cotizacion.configuracion.runFlatTires || false,
					proteccionTanque: data.cotizacion.configuracion.proteccionTanque || false,
					cortinaCubreEquipaje: data.cotizacion.configuracion.cortinaCubreEquipaje || false,
					sistemaAudio: data.cotizacion.configuracion.sistemaAudio || false,
					proteccionComputadora: data.cotizacion.configuracion.proteccionComputadora || false,
					defensaReforzada: data.cotizacion.configuracion.defensaReforzada || false
				}
			},
			listaMateriales: data.cotizacion.listaMateriales.map(material => ({
				categoria: material.categoria,
				descripcion: material.descripcion,
				cantidad: material.cantidad || 1,
				unidad: material.unidad || "PZA",
				precioUnitario: material.precioUnitario,
				importe: material.importe
			})),
			totales: {
				subtotal: data.cotizacion.precios.subtotal,
				iva: data.cotizacion.precios.iva,
				total: data.cotizacion.precios.total,
				pesoAproximadoBlindaje: data.cotizacion.precios.pesoAproximadoBlindaje
			},
			resumenPorCategoria: Object.entries(materialesPorCategoria).map(([categoria, materiales]) => ({
				categoria,
				cantidadItems: materiales.length,
				subtotalCategoria: materiales.reduce((sum, material) => sum + material.importe, 0)
			}))
		};

		
		
		try {
			
			console.log('Datos preparados para ERP:', JSON.stringify(datosParaERP, null, 2));
			
			const response = await fetch(
				server.api + "sp/sp_ProcesarCotizacionJSON",
				{
					method: "POST",
					body: JSON.stringify({
						ID: data.cotizacion.solicitudId,
						JsonData: JSON.stringify(datosParaERP)
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
				toast.success("Cotización enviada al ERP exitosamente");
				goto('/cotizacion');
			} else {
				toast.error(responseData[0]?.OkRef || "Error al procesar la solicitud");
			}
			
		} catch (error) {
			console.error('Error:', error);
			toast.error('Error de conexión al procesar la solicitud de cotización');
		}
		
	}

	async function aprobarCotizacion() {
		console.log('Aprobando cotización...');
		
		try {
			
			
			const response = await fetch(
				server.api + "sp/spAvanzarSituacionCotizacion",
				{
					method: "POST",
					body: JSON.stringify({
						Usuario:  "MASERP",
						ID: data.cotizacion.solicitudId
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
				toast.success("Cotización aprobada exitosamente");
				goto('/cotizacion');
			} else {
				toast.error(responseData[0]?.OkRef || "Error al procesar la solicitud");
			}
			
		} catch (error) {
			console.error('Error:', error);
			toast.error('Error de conexión al procesar la aprobación de cotización');
		}
		
	}

	// Agrupar materiales por categoría
	let materialesPorCategoria = $derived.by(() => {
		const grupos = data.cotizacion.listaMateriales.reduce((acc, material) => {
			if (!acc[material.categoria]) {
				acc[material.categoria] = [];
			}
			acc[material.categoria].push(material);
			return acc;
		}, {} as Record<string, typeof data.cotizacion.listaMateriales>);
		
		return grupos;
	});

	// Fecha formateada
	let fechaFormateada = $derived.by(() => {
		return new Date(data.cotizacion.fechaGeneracion).toLocaleDateString('es-MX', {
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		});
	});
</script>

<div class="min-h-screen">
	<div class="max-w-7xl mx-auto p-4 space-y-6">
		<!-- Header -->
		<div class="relative overflow-hidden rounded-xl bg-card p-6 shadow-lg border">
			<div class="flex items-center justify-between">
				<div class="flex items-center gap-3">
					<div class="rounded-lg bg-muted-foreground/10 p-2">
						<FileText class="h-6 w-6 text-blue-600" />
					</div>
					<div>
						<h1 class="text-3xl font-bold">Cotización de Vehículo Blindado</h1>
						<p class="text-muted-foreground mt-1">#{data.cotizacion.solicitudId} • Generado el {fechaFormateada}</p>
					</div>
				</div>
				<Button variant="outline" size="sm" onclick={volverAtras}>
					<ArrowLeft class="h-4 w-4 text-muted-foreground" />
					Regresar al Configurador
				</Button>
			</div>
		</div>

		<!-- Acciones principales -->
		<div class="flex flex-wrap gap-3 justify-between items-center p-4 bg-card rounded-lg border shadow-sm">
			<div class="flex flex-wrap gap-3">
				<Button onclick={descargarPDF} variant="outline">
					<Download class="h-4 w-4 text-blue-600" />
					Descargar PDF
				</Button>
				<Button onclick={enviarPorEmail} variant="outline">
					<Send class="h-4 w-4 text-blue-600" />
					Enviar por Email
				</Button>
				<Button onclick={enviarAlERP} variant="outline">
					<Database class="h-4 w-4 text-green-600" />
					Solicitar Aprobación
				</Button>
			</div>
			<div class="flex flex-wrap gap-3">
				<Button onclick={aprobarCotizacion} class="bg-red-600 hover:bg-red-700 text-white">
					<X class="h-4 w-4 mr-0 text-white" />
					Rechazar
				</Button>
				<Button onclick={aprobarCotizacion} class="bg-green-600 hover:bg-green-700 text-white">
					<Check class="h-4 w-4 mr-0 text-white" />
					Aprobar
				</Button>
			</div>
			
			
		</div>

		<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
			<!-- Información del cliente y vehículo -->
			<div class="lg:col-span-1 space-y-4">
				<!-- Información del Cliente -->
				<Card.Root class="">
					<Card.Header class="border-b">
						<Card.Title class="flex items-center gap-2">
							<User class="h-5 w-5 text-blue-600" />
							Información del Cliente
						</Card.Title>
					</Card.Header>
					<Card.Content class="space-y-4">
						<div class="p-3 bg-muted-foreground/10 rounded-lg border">
							<p class="font-semibold text-lg">{data.cotizacion.clienteInfo.nombre}</p>
							<p class="text-sm font-medium">Cliente: {data.cotizacion.clienteInfo.cliente}</p>
						</div>
						<div class="space-y-2">
							<div class="flex items-center gap-3 p-2 hover:bg-muted-foreground/10 rounded-md transition-colors">
								<div class="w-8 h-8 bg-muted-foreground/10 rounded-full flex items-center justify-center">
									<Phone class="h-4 w-4 text-blue-600" />
								</div>
								<span class="text-sm font-medium">{data.cotizacion.clienteInfo.telefono}</span>
							</div>
							<div class="flex items-center gap-3 p-2 hover:bg-muted-foreground/10 rounded-md transition-colors">
								<div class="w-8 h-8 bg-muted-foreground/10 rounded-full flex items-center justify-center">
									<Mail class="h-4 w-4 text-blue-600" />
								</div>
								<span class="text-sm font-medium">{data.cotizacion.clienteInfo.email}</span>
							</div>
						</div>
					</Card.Content>
				</Card.Root>

				<!-- Información del Vehículo -->
				<Card.Root class="">
					<Card.Header class="border-b">
						<Card.Title class="flex items-center gap-2">
							<Car class="h-5 w-5 text-amber-600" />
							Vehículo a Blindar
						</Card.Title>
					</Card.Header>
					<Card.Content class="space-y-4">
						<div class="p-3 bg-muted-foreground/10 rounded-lg border">
							<p class="font-semibold text-lg">
								{data.cotizacion.vehiculoInfo.marca} {data.cotizacion.vehiculoInfo.modelo}
							</p>
							<p class="text-sm font-medium">Modelo {data.cotizacion.vehiculoInfo.año}</p>
						</div>
						<div class="space-y-3">
							<div class="flex justify-between items-center p-2 hover:bg-muted-foreground/10 rounded-md transition-colors">
								<span class="text-sm font-medium text-muted-foreground">Tipo de Uso:</span>
								<Badge variant="secondary">{data.cotizacion.vehiculoInfo.uso}</Badge>
							</div>
							<div class="flex justify-between items-center p-2 hover:bg-muted-foreground/10 rounded-md transition-colors">
								<span class="text-sm font-medium text-muted-foreground">Nivel de Amenazas:</span>
								<Badge variant="outline" class="font-semibold">
									{data.cotizacion.vehiculoInfo.amenazas}
								</Badge>
							</div>
							<div class="flex justify-between items-center p-2 hover:bg-muted-foreground/10 rounded-md transition-colors">
								<span class="text-sm font-medium text-muted-foreground">Cobertura:</span>
								<span class="font-semibold">{data.cotizacion.vehiculoInfo.cobertura}</span>
							</div>
						</div>
					</Card.Content>
				</Card.Root>

			<!-- Resumen de configuración -->
			<Card.Root class="">
				<Card.Header class="border-b">
					<Card.Title class="flex items-center gap-2">
						<Shield class="h-5 w-5 text-indigo-600" />
						Configuración de Blindaje
					</Card.Title>
				</Card.Header>
				<Card.Content class="space-y-3">
					<div class="flex justify-between items-center p-2 hover:bg-muted-foreground/10 rounded-md transition-colors">
						<span class="text-sm font-medium text-muted-foreground">Nivel de Protección:</span>
						<Badge variant="default" class="font-semibold px-3 py-1">
							{data.cotizacion.configuracion.nivelProteccion}
						</Badge>
					</div>
					<div class="flex justify-between items-center p-2 hover:bg-muted-foreground/10 rounded-md transition-colors">
						<span class="text-sm font-medium text-muted-foreground">Material:</span>
						<span class="capitalize font-semibold">{data.cotizacion.configuracion.tipoBlindaje}</span>
					</div>
					<div class="flex justify-between items-center p-2 hover:bg-muted-foreground/10 rounded-md transition-colors">
						<span class="text-sm font-medium text-muted-foreground">Cristales:</span>
						<span class="font-semibold">{data.cotizacion.configuracion.cristalesEspeciales}</span>
					</div>
					<Separator class="my-3" />
					<div class="flex items-center justify-between p-3 bg-muted-foreground/10 rounded-lg border">
						<span class="text-sm font-medium text-muted-foreground flex items-center gap-2">
							<div class="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
								<Weight class="size-4 text-muted-foreground" />
							</div>
							Peso Aprox. del Blindaje:
						</span>
						<span class="font-bold text-lg">{data.cotizacion.precios.pesoAproximadoBlindaje} KG</span>
					</div>
				</Card.Content>
			</Card.Root>

			<!-- Resumen financiero -->
			<Card.Root class="">
				<Card.Header class="border-b">
					<Card.Title class="flex items-center gap-2">
						<div class="w-6 h-6 rounded-full flex items-center justify-center">
							<Calendar class="h-4 w-4 text-green-600" />
						</div>
						Resumen Financiero
					</Card.Title>
				</Card.Header>
				<Card.Content class="space-y-4">
					<div class="space-y-3">
						<div class="flex justify-between items-center p-2 rounded-md">
							<span class="text-sm font-medium">Subtotal:</span>
							<span class="font-semibold">${data.cotizacion.precios.subtotal.toLocaleString()}</span>
						</div>
						<div class="flex justify-between items-center p-2 rounded-md">
							<span class="text-sm font-medium">IVA (16%):</span>
							<span class="font-semibold">${data.cotizacion.precios.iva.toLocaleString()}</span>
						</div>
					</div>
					<Separator class="" />
					<div class="p-4 bg-muted-foreground/10 rounded-lg border">
						<div class="flex justify-between items-center">
							<span class="font-bold text-lg">Total Final:</span>
							<span class="font-bold text-2xl">${data.cotizacion.precios.total.toLocaleString()}</span>
						</div>
						<div class="text-xs text-muted-foreground mt-2 flex items-center gap-1">
							<Calendar class="size-4 text-green-600" />
							Cotización generada el {fechaFormateada}
						</div>
					</div>
				</Card.Content>
			</Card.Root>
		</div>

		<!-- Lista detallada de materiales -->
		<div class="lg:col-span-2">
			<Card.Root class="">
				<Card.Header class="border-b">
					<div class="flex items-center justify-between">
						<div>
							<Card.Title class="flex items-center gap-2">
								<div class="w-6 h-6 rounded-full flex items-center justify-center">
									<FileText class="size-4 text-blue-600" />
								</div>
								Lista Detallada de Materiales y Servicios
							</Card.Title>
							<Card.Description class="mt-1">
								Desglose completo de todos los componentes y servicios incluidos en su cotización
							</Card.Description>
						</div>
						<Badge variant="secondary">
							{Object.keys(materialesPorCategoria).length} categorías
						</Badge>
					</div>
				</Card.Header>
				<Card.Content class="p-0">
					{#each Object.entries(materialesPorCategoria) as [categoria, materiales], index}
						<div class="border-b  last:border-b-0">
							<!-- Header de categoría -->
							<div class="sticky top-0 bg-muted-foreground/10 p-4  z-10">
								<div class="flex items-center justify-between">
									<h3 class=" font-bold flex items-center gap-2">
										<div class="w-2 h-6 bg-blue-500 rounded-full"></div>
										{categoria}
									</h3>
									<div class="text-sm px-3 py-1 rounded-full border">
										{materiales.length} items
									</div>
								</div>
							</div>

							<!-- Tabla de materiales -->
							<div class="overflow-x-auto">
								<Table.Root class="relative text-muted-foreground gutter-md md:gutter-xl" bleed={true} dense={false} grid={false} striped={false}>
									<Table.Header class="text-muted-foreground">
										<Table.Row class="transition-colors">
											<Table.Head class="font-semibold text-muted-foreground">Descripción</Table.Head>
											<Table.Head class="text-center font-semibold w-20 text-muted-foreground">Cant.</Table.Head>
											<Table.Head class="text-center font-semibold w-20 text-muted-foreground">Unidad</Table.Head>
											<Table.Head class="text-right font-semibold w-32 text-muted-foreground">Precio Unit.</Table.Head>
											<Table.Head class="text-right font-semibold w-32 text-muted-foreground">Importe Total</Table.Head>
										</Table.Row>
									</Table.Header>
									<Table.Body>
										{#each materiales as material, materialIndex}
											<Table.Row class="hover:bg-muted-foreground/10 transition-colors group">
												<Table.Cell class="font-medium py-3 transition-colors">
													<div class="flex items-center gap-2">
														<div class="w-1 h-4 bg-blue-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
														{material.descripcion}
													</div>
												</Table.Cell>
												<Table.Cell class="text-center font-medium">
													<div class="bg-muted-foreground/10 rounded-md px-2 py-1 transition-colors">
														{material.cantidad || 1}
													</div>
												</Table.Cell>
												<Table.Cell class="text-center">
													<Badge variant="outline" class="bg-muted-foreground/10  text-xs">
														{material.unidad || 'PZA'}
													</Badge>
												</Table.Cell>
												<Table.Cell class="text-right font-semibold transition-colors">
													<input 
														type="number" 
														value={material.precioUnitario}
														class="w-full text-right border rounded px-2 py-1 text-sm"
														step="0.01"
														min="0"
													/>
												</Table.Cell>
												<Table.Cell class="text-right font-bold text-green-600 group-hover:text-green-700 transition-colors">
													${material.importe.toLocaleString()}
												</Table.Cell>
											</Table.Row>
										{/each}
									</Table.Body>
								</Table.Root>
							</div>

							<!-- Subtotal por categoría -->
							<div class=" p-4 pl-8 pr-8">
								<div class="flex justify-between items-center">
									<span class="text-sm font-medium">Subtotal {categoria}:</span>
									<span class="text-lg font-bold">
										${materiales.reduce((sum, material) => sum + material.importe, 0).toLocaleString()}
									</span>
								</div>
							</div>
						</div>
					{/each}
				</Card.Content>
			</Card.Root>
		</div>
	</div>

	<!-- Términos y condiciones -->
	<Card.Root class="">
		<Card.Header class="border-b">
			<Card.Title class="flex items-center gap-2">
				<div class="w-6 h-6 rounded-full flex items-center justify-center">
					<FileText class="h-4 w-4 text-amber-600" />
				</div>
				Términos y Condiciones
			</Card.Title>
		</Card.Header>
		<Card.Content class="pt-6">
			<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
				<div class="space-y-3">
					<div class="flex items-start gap-3 p-3 rounded-lg border">
						<div class="w-6 h-6 bg-muted-foreground/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
							<Calendar class="size-4 text-blue-600" />
						</div>
						<div>
							<p class="font-semibold text-sm">Vigencia de la cotización</p>
							<p class="text-sm">30 días a partir de la fecha de emisión</p>
						</div>
					</div>
					<div class="flex items-start gap-3 p-3 rounded-lg border">
						<div class="w-6 h-6 bg-muted-foreground/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
							<Shield class="size-4 text-green-600" />
						</div>
						<div>
							<p class="font-semibold text-sm">Garantía</p>
							<p class="text-sm">12 meses en materiales y mano de obra bajo condiciones normales</p>
						</div>
					</div>
					<div class="flex items-start gap-3 p-3 rounded-lg border">
						<div class="w-6 h-6 bg-muted-foreground/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
							<Weight class="size-4 text-purple-600" />
						</div>
						<div>
							<p class="font-semibold text-sm">Peso del blindaje</p>
							<p class="text-sm">Puede variar ±10% según especificaciones finales</p>
						</div>
					</div>
				</div>
				<div class="space-y-3">
					<div class="flex items-start gap-3 p-3 rounded-lg border">
						<div class="w-6 h-6 bg-muted-foreground/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
							<Car class="size-4 text-amber-600" />
						</div>
						<div>
							<p class="font-semibold text-sm">Tiempo de entrega</p>
							<p class="text-sm">45-60 días hábiles después de confirmación</p>
						</div>
					</div>
					<div class="flex items-start gap-3 p-3 rounded-lg border">
						<div class="w-6 h-6 bg-muted-foreground/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
							<Mail class="size-4 text-red-600" />
						</div>
						<div>
							<p class="font-semibold text-sm">Forma de pago</p>
							<p class="text-sm">50% anticipo • 50% contra entrega</p>
						</div>
					</div>
					<div class="flex items-start gap-3 p-3 rounded-lg border">
						<div class="w-6 h-6 bg-muted-foreground/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
							<FileText class="size-4 text-muted-foreground" />
						</div>
						<div>
							<p class="font-semibold text-sm">Precios</p>
							<p class="text-sm">Sujetos a cambios por fluctuaciones en materiales</p>
						</div>
					</div>
				</div>
			</div>
		</Card.Content>
	</Card.Root>
</div>
</div>
