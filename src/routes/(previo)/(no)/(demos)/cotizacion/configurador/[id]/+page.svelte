<script lang="ts">
	import { Button } from "$lib/components/ui/button";
	import { Badge } from "$lib/components/ui/badge";
	import * as Card from "$lib/components/ui/card";
	import * as Select from "$lib/components/ui/select";
	import * as RadioGroup from "$lib/components/ui/radio-group";
	import { Checkbox } from "$lib/components/ui/checkbox";
	import { Separator } from "$lib/components/ui/separator";
	import { ArrowLeft, Settings, Shield, Car, FileText, Calculator, CheckCircle2 } from "@lucide/svelte";
	import { goto } from '$app/navigation';

	interface SolicitudData {
		cliente: string;
		cliente_nombre: string;
		cliente_telefono: string;
		cliente_email: string;
		marca: string;
		modelo: string;
		año: string;
		uso: string;
		amenazas: string;
		cobertura: string;
		requisitos: string;
		ubicacion: string;
	}

	interface PageData {
		solicitud: SolicitudData;
		id: string;
	}

	let { data }: { data: PageData } = $props();

	// Estado del configurador - usando strings simples para bind:value
	let configuracion = $state({
		// Combos principales (3-4 opciones)
		nivelProteccion: "",
		tipoBlindaje: "",
		suspensionReforzada: "",
		cristalesEspeciales: "",
		
		// Checkboxes opcionales (6-8 opciones)
		rollBarTecho: false,
		proteccionBateria: false,
		runFlatTires: false,
		proteccionTanque: false,
		cortinaCubreEquipaje: false,
		sistemaAudio: false,
		proteccionComputadora: false,
		defensaReforzada: false
	});

	// Configuración de productos disponibles
	const opcionesConfiguracion = {
		nivelProteccion: [
			{ value: "III", label: "Nivel III - Arma corta", precio: 180000 },
			{ value: "IIIA", label: "Nivel IIIA - Arma corta mejorado", precio: 220000 },
			{ value: "IV", label: "Nivel IV - Arma larga", precio: 280000 },
			{ value: "IV-PLUS", label: "Nivel IV TPS PLUS - Máxima protección", precio: 350000 }
		],
		tipoBlindaje: [
			{ value: "acero", label: "Acero balístico estándar", precio: 0 },
			{ value: "ceramico", label: "Cerámico compuesto", precio: 45000 },
			{ value: "aramida", label: "Aramida multicapa", precio: 65000 }
		],
		suspensionReforzada: [
			{ value: "estandar", label: "Refuerzo estándar", precio: 25000 },
			{ value: "neumatica", label: "Suspensión neumática", precio: 85000 },
			{ value: "hidraulica", label: "Suspensión hidráulica", precio: 120000 }
		],
		cristalesEspeciales: [
			{ value: "32mm", label: "Cristales 32mm tono claro", precio: 95000 },
			{ value: "38mm", label: "Cristales 38mm tono selectivo", precio: 125000 },
			{ value: "42mm", label: "Cristales 42mm máxima protección", precio: 165000 }
		]
	};

	const opcionesAdicionales = [
		{ key: "rollBarTecho", label: "Roll Bar en techo", precio: 35000 },
		{ key: "proteccionBateria", label: "Protección de batería", precio: 8500 },
		{ key: "runFlatTires", label: "4 Run Flat Tires", precio: 45000 },
		{ key: "proteccionTanque", label: "Protección tanque combustible", precio: 28000 },
		{ key: "cortinaCubreEquipaje", label: "Cortina cubre equipaje operable", precio: 12000 },
		{ key: "sistemaAudio", label: "Sistema audio con subwoofer", precio: 25000 },
		{ key: "proteccionComputadora", label: "Protección computadora maestra", precio: 15000 },
		{ key: "defensaReforzada", label: "Defensa delantera reforzada", precio: 18000 }
	];

	// Cálculos de precio
	let precioBase = $derived.by(() => {
		let total = 0;
		
		// Agregar precios de combos
		const nivelSeleccionado = opcionesConfiguracion.nivelProteccion.find(n => n.value === configuracion.nivelProteccion);
		if (nivelSeleccionado) total += nivelSeleccionado.precio;
		
		const blindajeSeleccionado = opcionesConfiguracion.tipoBlindaje.find(t => t.value === configuracion.tipoBlindaje);
		if (blindajeSeleccionado) total += blindajeSeleccionado.precio;
		
		const suspensionSeleccionada = opcionesConfiguracion.suspensionReforzada.find(s => s.value === configuracion.suspensionReforzada);
		if (suspensionSeleccionada) total += suspensionSeleccionada.precio;
		
		const cristalesSeleccionados = opcionesConfiguracion.cristalesEspeciales.find(c => c.value === configuracion.cristalesEspeciales);
		if (cristalesSeleccionados) total += cristalesSeleccionados.precio;
		
		// Agregar precios de opcionales
		opcionesAdicionales.forEach(opcion => {
			if (configuracion[opcion.key]) {
				total += opcion.precio;
			}
		});
		
		return total;
	});

	let iva = $derived(precioBase * 0.16);
	let precioTotal = $derived(precioBase + iva);

	// Validar si la configuración está completa
	let configuracionCompleta = $derived.by(() => {
		return configuracion.nivelProteccion && 
		       configuracion.tipoBlindaje && 
		       configuracion.suspensionReforzada && 
		       configuracion.cristalesEspeciales;
	});

	// Contar opciones seleccionadas
	let opcionesSeleccionadas = $derived.by(() => {
		let count = 0;
		if (configuracion.nivelProteccion) count++;
		if (configuracion.tipoBlindaje) count++;
		if (configuracion.suspensionReforzada) count++;
		if (configuracion.cristalesEspeciales) count++;
		return count;
	});

	// Calcular precios detallados de forma simplificada
	let preciosDetallados = $derived.by(() => {
		let configuracion_precio = 0;
		let adicionales_precio = 0;

		try {
			// Sumar configuración principal
			const nivelSeleccionado = opcionesConfiguracion.nivelProteccion.find(n => n.value === configuracion.nivelProteccion);
			if (nivelSeleccionado) configuracion_precio += nivelSeleccionado.precio;
			
			const blindajeSeleccionado = opcionesConfiguracion.tipoBlindaje.find(b => b.value === configuracion.tipoBlindaje);
			if (blindajeSeleccionado) configuracion_precio += blindajeSeleccionado.precio;
			
			const suspensionSeleccionada = opcionesConfiguracion.suspensionReforzada.find(s => s.value === configuracion.suspensionReforzada);
			if (suspensionSeleccionada) configuracion_precio += suspensionSeleccionada.precio;
			
			const cristalesSeleccionados = opcionesConfiguracion.cristalesEspeciales.find(c => c.value === configuracion.cristalesEspeciales);
			if (cristalesSeleccionados) configuracion_precio += cristalesSeleccionados.precio;

			// Sumar opciones adicionales
			opcionesAdicionales.forEach(opcion => {
				if (configuracion[opcion.key]) {
					adicionales_precio += opcion.precio;
				}
			});
		} catch (error) {
			console.error('Error calculating detailed prices:', error);
		}

		return {
			configuracion: configuracion_precio,
			adicionales: adicionales_precio
		};
	});

	// Lista de opciones adicionales activas simplificada
	let opcionesAdicionalesActivas = $derived.by(() => {
		try {
			return opcionesAdicionales
				.filter(opcion => configuracion[opcion.key])
				.map(opcion => opcion.label || opcion.key);
		} catch (error) {
			console.error('Error getting active options:', error);
			return [];
		}
	});

	function volverAtras() {
		goto('/cotizacion');
	}

	function generarCotizacion() {
		if (configuracionCompleta) {
			console.log('Generando cotización con configuración:', configuracion);
			console.log('Precio total:', precioTotal);
			
			// Preparar datos de cotización para pasar a la página final
			const datosConfiguracion = {
				id: data.id,
				solicitud: data.solicitud,
				configuracion: configuracion,
				precios: {
					subtotal: precioBase,
					iva: iva,
					total: precioTotal,
					configuracion: preciosDetallados.configuracion,
					adicionales: preciosDetallados.adicionales
				},
				opcionesSeleccionadas: opcionesSeleccionadas,
				opcionesAdicionalesActivas: opcionesAdicionalesActivas
			};
			
			// Guardar en sessionStorage para acceso en la página final
			if (typeof window !== 'undefined') {
				sessionStorage.setItem(`cotizacion-${data.id}`, JSON.stringify(datosConfiguracion));
			}
			
			// Navegar a la página de cotización final
			goto(`/cotizacion/configurador/${data.id}/cotizacion-final`);
		}
	}

	function resetearConfiguracion() {
		configuracion = {
			nivelProteccion: "",
			tipoBlindaje: "",
			suspensionReforzada: "",
			cristalesEspeciales: "",
			rollBarTecho: false,
			proteccionBateria: false,
			runFlatTires: false,
			proteccionTanque: false,
			cortinaCubreEquipaje: false,
			sistemaAudio: false,
			proteccionComputadora: false,
			defensaReforzada: false
		};
	}
</script>

<div class="max-w-7xl mx-auto p-4 space-y-6">
	<!-- Header -->
	<div class="flex items-center gap-3 mb-6">
		<Button variant="ghost" size="sm" onclick={volverAtras}>
			<ArrowLeft class="h-4 w-4 mr-2" />
			Regresar
		</Button>
		<div class="h-6 w-px bg-border"></div>
		<div class="flex items-center gap-3">
			<Settings class="h-6 w-6 text-primary" />
			<h1 class="text-3xl font-bold text-foreground">Configurador de Vehículo Blindado</h1>
		</div>
	</div>

	<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
		{#if data && data.solicitud}
		<!-- Panel izquierdo - Información de solicitud mejorada -->
		<div class="lg:col-span-1 space-y-6">
			<!-- Información del Vehículo -->
			<Card.Root class="border-2 border-primary/20">
				<Card.Header class="pb-3">
					<Card.Title class="flex items-center gap-2 text-lg">
						<Car class="h-5 w-5 text-primary" />
						Vehículo a Blindar
					</Card.Title>
				</Card.Header>
				<Card.Content class="space-y-4">
					<!-- Info principal del vehículo -->
					<div class="p-4 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 rounded-lg border">
						<div class="text-center space-y-2">
							<h3 class="font-bold text-xl text-primary">{data.solicitud.marca} {data.solicitud.modelo}</h3>
							<p class="text-lg font-semibold text-muted-foreground">Año {data.solicitud.año}</p>
							<div class="flex justify-center gap-2 mt-3">
								<Badge variant="secondary" class="text-xs px-3 py-1">
									<FileText class="h-3 w-3 mr-1" />
									ID: {data.id}
								</Badge>
							</div>
						</div>
					</div>

					<!-- Información del Cliente -->
					<div class="space-y-3">
						<h4 class="font-semibold text-sm flex items-center gap-2 text-primary">
							<div class="w-2 h-2 bg-blue-500 rounded-full"></div>
							Información del Cliente
						</h4>
						<div class="pl-4 space-y-2">
							<div>
								<p class="font-medium">{data.solicitud.cliente_nombre}</p>
								<p class="text-sm text-muted-foreground">{data.solicitud.cliente}</p>
							</div>
							{#if data.solicitud.cliente_email}
								<div class="text-sm">
									<span class="text-muted-foreground">Email:</span>
									<span class="ml-1">{data.solicitud.cliente_email}</span>
								</div>
							{/if}
							{#if data.solicitud.cliente_telefono}
								<div class="text-sm">
									<span class="text-muted-foreground">Teléfono:</span>
									<span class="ml-1">{data.solicitud.cliente_telefono}</span>
								</div>
							{/if}
						</div>
					</div>

					<Separator />

					<!-- Detalles de uso -->
					<div class="space-y-3">
						<h4 class="font-semibold text-sm flex items-center gap-2 text-primary">
							<div class="w-2 h-2 bg-orange-500 rounded-full"></div>
							Análisis de Riesgo
						</h4>
						<div class="space-y-3 pl-4">
							<div class="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
								<p class="text-sm text-muted-foreground mb-1">Tipo de uso</p>
								<Badge variant="default" class="bg-blue-600">
									{data.solicitud.uso}
								</Badge>
							</div>

							<div class="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
								<p class="text-sm text-muted-foreground mb-1">Nivel de amenazas</p>
								<Badge variant="destructive" class="bg-red-600">
									<Shield class="h-3 w-3 mr-1" />
									{data.solicitud.amenazas}
								</Badge>
							</div>

							{#if data.solicitud.ubicacion}
								<div class="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
									<p class="text-sm text-muted-foreground mb-1">Ubicación de operación</p>
									<p class="text-sm font-medium">{data.solicitud.ubicacion}</p>
								</div>
							{/if}

							{#if data.solicitud.cobertura}
								<div class="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
									<p class="text-sm text-muted-foreground mb-1">Tipo de cobertura</p>
									<Badge variant="outline" class="bg-purple-100 text-purple-700 border-purple-300">
										{data.solicitud.cobertura}
									</Badge>
								</div>
							{/if}
						</div>
					</div>

					{#if data.solicitud.requisitos}
						<Separator />
						<div class="space-y-2">
							<h4 class="font-semibold text-sm flex items-center gap-2 text-primary">
								<div class="w-2 h-2 bg-purple-500 rounded-full"></div>
								Requisitos Especiales
							</h4>
							<div class="pl-4">
								<p class="text-sm bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg border border-purple-200 dark:border-purple-800">
									{data.solicitud.requisitos}
								</p>
							</div>
						</div>
					{/if}
				</Card.Content>
			</Card.Root>

			<!-- Progreso de Configuración -->
			<Card.Root>
				<Card.Header class="pb-3">
					<Card.Title class="flex items-center gap-2">
						<Settings class="h-5 w-5 text-primary" />
						Progreso de Configuración
					</Card.Title>
				</Card.Header>
				<Card.Content class="space-y-4">
					<!-- Indicadores de progreso -->
					<div class="space-y-3">
						{#each [
							{key: 'nivelProteccion', label: 'Nivel de Protección', completed: !!configuracion.nivelProteccion},
							{key: 'tipoBlindaje', label: 'Material de Blindaje', completed: !!configuracion.tipoBlindaje},
							{key: 'suspensionReforzada', label: 'Sistema de Suspensión', completed: !!configuracion.suspensionReforzada},
							{key: 'cristalesEspeciales', label: 'Cristales Blindados', completed: !!configuracion.cristalesEspeciales}
						] as item}
							<div class="flex items-center gap-3 p-2 rounded-lg {item.completed ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' : 'bg-muted/50'}">
								<div class="flex-shrink-0">
									{#if item.completed}
										<CheckCircle2 class="h-4 w-4 text-green-600" />
									{:else}
										<div class="h-4 w-4 border-2 border-muted-foreground/30 rounded-full"></div>
									{/if}
								</div>
								<span class="text-sm {item.completed ? 'font-medium text-green-700 dark:text-green-400' : 'text-muted-foreground'}">{item.label}</span>
							</div>
						{/each}
					</div>

					<!-- Barra de progreso general -->
					<div class="space-y-2">
						<div class="flex justify-between text-xs">
							<span class="text-muted-foreground">Configuración completa</span>
							<span class="font-medium">{Math.round((opcionesSeleccionadas / 4) * 100)}%</span>
						</div>
						<div class="w-full bg-muted rounded-full h-3">
							<div 
								class="h-3 rounded-full bg-gradient-to-r from-primary to-primary/80 transition-all duration-500 relative overflow-hidden"
								style="width: {Math.round((opcionesSeleccionadas / 4) * 100)}%"
							>
								<div class="absolute inset-0 bg-white/20 animate-pulse"></div>
							</div>
						</div>
					</div>

					{#if configuracionCompleta}
						<div class="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800 text-center">
							<div class="flex items-center justify-center gap-2 text-green-700 dark:text-green-400">
								<CheckCircle2 class="h-4 w-4" />
								<span class="text-sm font-medium">¡Configuración lista para cotizar!</span>
							</div>
						</div>
					{/if}
				</Card.Content>
			</Card.Root>

			<!-- Resumen de precios -->
			<Card.Root class="border-2 border-primary/30 bg-gradient-to-b from-background to-primary/5">
				<Card.Header class="pb-3">
					<Card.Title class="flex items-center gap-2">
						<Calculator class="h-5 w-5 text-primary" />
						Cotización Preliminar
					</Card.Title>
				</Card.Header>
				<Card.Content class="space-y-4">
					<!-- Precio base destacado -->
					<div class="p-4 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg border border-primary/20">
						<div class="text-center">
							<p class="text-sm text-muted-foreground mb-1">Precio estimado</p>
							<p class="text-3xl font-bold text-primary">${precioTotal.toLocaleString()}</p>
							<p class="text-xs text-muted-foreground">MXN (incluye IVA)</p>
						</div>
					</div>

					<!-- Desglose de precios -->
					<div class="space-y-2">
						<div class="flex justify-between text-sm">
							<span class="text-muted-foreground">Subtotal:</span>
							<span class="font-medium">${precioBase.toLocaleString()}</span>
						</div>
						<div class="flex justify-between text-sm">
							<span class="text-muted-foreground">IVA (16%):</span>
							<span class="font-medium">${iva.toLocaleString()}</span>
						</div>
						<Separator />
						<div class="flex justify-between font-semibold">
							<span>Total:</span>
							<span class="text-primary">${precioTotal.toLocaleString()}</span>
						</div>
					</div>

					<!-- Nota importante -->
					<div class="text-xs text-center text-muted-foreground bg-muted/50 p-3 rounded-lg">
						* Cotización preliminar sujeta a inspección técnica del vehículo
					</div>
				</Card.Content>
			</Card.Root>
		</div>

		<!-- Panel central - Configurador -->
		<div class="lg:col-span-2 space-y-6">
			<!-- Configuración Principal con RadioGroups -->
			<Card.Root>
				<Card.Header>
					<Card.Title class="flex items-center gap-2">
						<Shield class="h-5 w-5" />
						Configuración de Blindaje
					</Card.Title>
					<Card.Description>
						Selecciona las opciones principales de protección para el vehículo
					</Card.Description>
				</Card.Header>
				<Card.Content class="space-y-8">
					<!-- Nivel de Protección -->
					<div class="space-y-4">
						<div class="flex items-center gap-2 mb-3">
							<Shield class="h-5 w-5 text-primary" />
							<h3 class="text-lg font-semibold">Nivel de Protección</h3>
						</div>
						<RadioGroup.Root bind:value={configuracion.nivelProteccion} class="grid grid-cols-1 md:grid-cols-2 gap-4">
							{#each opcionesConfiguracion.nivelProteccion as opcion}
								<label class="group relative cursor-pointer">
									<div class="flex items-start space-x-4 p-4 rounded-lg border-2 transition-all hover:bg-muted/30 {configuracion.nivelProteccion === opcion.value ? 'border-primary bg-primary/5 shadow-sm' : 'border-border hover:border-primary/30'}">
										<RadioGroup.Item 
											value={opcion.value} 
											class="mt-1 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
										/>
										<div class="flex-1 space-y-2">
											<div class="flex justify-between items-start">
												<div class="space-y-1">
													<h4 class="font-semibold text-sm leading-tight">Nivel {opcion.value}</h4>
													<p class="text-xs text-muted-foreground leading-relaxed">
														{#if opcion.value === 'III'}
															Protección contra arma corta (.38, 9mm)
														{:else if opcion.value === 'IIIA'}
															Protección mejorada contra arma corta (.44 Magnum)
														{:else if opcion.value === 'IV'}
															Protección contra rifle (.30-06, AK-47)
														{:else if opcion.value === 'IV-PLUS'}
															Máxima protección disponible, multi-impacto
														{/if}
													</p>
												</div>
												<Badge 
													variant={configuracion.nivelProteccion === opcion.value ? "default" : "outline"} 
													class="text-xs font-bold whitespace-nowrap ml-2 {configuracion.nivelProteccion === opcion.value ? 'bg-primary text-primary-foreground' : 'text-primary'}"
												>
													+${opcion.precio.toLocaleString()}
												</Badge>
											</div>
										</div>
										
										<!-- Indicador de selección -->
										{#if configuracion.nivelProteccion === opcion.value}
											<div class="absolute -top-2 -right-2">
												<div class="bg-primary text-primary-foreground rounded-full p-1 shadow-sm">
													<CheckCircle2 class="h-3 w-3" />
												</div>
											</div>
										{/if}
									</div>
								</label>
							{/each}
						</RadioGroup.Root>
					</div>

					<Separator />

					<!-- Material de Blindaje -->
					<div class="space-y-4">
						<div class="flex items-center gap-2 mb-3">
							<div class="h-5 w-5 bg-slate-400 rounded-sm"></div>
							<h3 class="text-lg font-semibold">Material de Blindaje</h3>
						</div>
						<RadioGroup.Root bind:value={configuracion.tipoBlindaje} class="grid grid-cols-1 md:grid-cols-3 gap-4">
							{#each opcionesConfiguracion.tipoBlindaje as opcion}
								<label class="group relative cursor-pointer">
									<div class="flex items-start space-x-4 p-4 rounded-lg border-2 transition-all hover:bg-muted/30 {configuracion.tipoBlindaje === opcion.value ? 'border-primary bg-primary/5 shadow-sm' : 'border-border hover:border-primary/30'}">
										<RadioGroup.Item 
											value={opcion.value} 
											class="mt-1 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
										/>
										<div class="flex-1 space-y-2">
											<div class="flex justify-between items-start">
												<div class="space-y-1">
													<h4 class="font-semibold text-sm leading-tight">{opcion.label}</h4>
													<p class="text-xs text-muted-foreground leading-relaxed">
														{#if opcion.value === 'acero'}
															Material estándar, resistente y confiable
														{:else if opcion.value === 'ceramico'}
															Reducción de peso 25%, mayor resistencia
														{:else if opcion.value === 'aramida'}
															Material premium, máxima eficiencia
														{/if}
													</p>
												</div>
												<Badge 
													variant={configuracion.tipoBlindaje === opcion.value ? "default" : "outline"} 
													class="text-xs font-bold whitespace-nowrap ml-2 {configuracion.tipoBlindaje === opcion.value ? 'bg-primary text-primary-foreground' : 'text-primary'}"
												>
													{opcion.precio === 0 ? "Incluido" : `+$${opcion.precio.toLocaleString()}`}
												</Badge>
											</div>
										</div>
										
										<!-- Indicador de selección -->
										{#if configuracion.tipoBlindaje === opcion.value}
											<div class="absolute -top-2 -right-2">
												<div class="bg-primary text-primary-foreground rounded-full p-1 shadow-sm">
													<CheckCircle2 class="h-3 w-3" />
												</div>
											</div>
										{/if}
									</div>
								</label>
							{/each}
						</RadioGroup.Root>
					</div>

					<Separator />

					<!-- Sistema de Suspensión -->
					<div class="space-y-4">
						<div class="flex items-center gap-2 mb-3">
							<div class="h-5 w-5 bg-orange-400 rounded-full"></div>
							<h3 class="text-lg font-semibold">Sistema de Suspensión</h3>
						</div>
						<RadioGroup.Root bind:value={configuracion.suspensionReforzada} class="grid grid-cols-1 md:grid-cols-3 gap-4">
							{#each opcionesConfiguracion.suspensionReforzada as opcion}
								<label class="group relative cursor-pointer">
									<div class="flex items-start space-x-4 p-4 rounded-lg border-2 transition-all hover:bg-muted/30 {configuracion.suspensionReforzada === opcion.value ? 'border-primary bg-primary/5 shadow-sm' : 'border-border hover:border-primary/30'}">
										<RadioGroup.Item 
											value={opcion.value} 
											class="mt-1 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
										/>
										<div class="flex-1 space-y-2">
											<div class="flex justify-between items-start">
												<div class="space-y-1">
													<h4 class="font-semibold text-sm leading-tight">{opcion.label}</h4>
													<p class="text-xs text-muted-foreground leading-relaxed">
														{#if opcion.value === 'estandar'}
															Resortes y amortiguadores reforzados
														{:else if opcion.value === 'neumatica'}
															Ajuste automático de altura y rigidez
														{:else if opcion.value === 'hidraulica'}
															Control total, máximo confort y capacidad
														{/if}
													</p>
												</div>
												<Badge 
													variant={configuracion.suspensionReforzada === opcion.value ? "default" : "outline"} 
													class="text-xs font-bold whitespace-nowrap ml-2 {configuracion.suspensionReforzada === opcion.value ? 'bg-primary text-primary-foreground' : 'text-primary'}"
												>
													+${opcion.precio.toLocaleString()}
												</Badge>
											</div>
										</div>
										
										<!-- Indicador de selección -->
										{#if configuracion.suspensionReforzada === opcion.value}
											<div class="absolute -top-2 -right-2">
												<div class="bg-primary text-primary-foreground rounded-full p-1 shadow-sm">
													<CheckCircle2 class="h-3 w-3" />
												</div>
											</div>
										{/if}
									</div>
								</label>
							{/each}
						</RadioGroup.Root>
					</div>

					<Separator />

					<!-- Cristales Blindados -->
					<div class="space-y-4">
						<div class="flex items-center gap-2 mb-3">
							<div class="h-5 w-5 bg-blue-400 rounded border border-blue-600"></div>
							<h3 class="text-lg font-semibold">Cristales Blindados</h3>
						</div>
						<RadioGroup.Root bind:value={configuracion.cristalesEspeciales} class="grid grid-cols-1 md:grid-cols-3 gap-4">
							{#each opcionesConfiguracion.cristalesEspeciales as opcion}
								<label class="group relative cursor-pointer">
									<div class="flex items-start space-x-4 p-4 rounded-lg border-2 transition-all hover:bg-muted/30 {configuracion.cristalesEspeciales === opcion.value ? 'border-primary bg-primary/5 shadow-sm' : 'border-border hover:border-primary/30'}">
										<RadioGroup.Item 
											value={opcion.value} 
											class="mt-1 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
										/>
										<div class="flex-1 space-y-2">
											<div class="flex justify-between items-start">
												<div class="space-y-1">
													<h4 class="font-semibold text-sm leading-tight">{opcion.label}</h4>
													<p class="text-xs text-muted-foreground leading-relaxed">
														{#if opcion.value === '32mm'}
															Espesor estándar, tono claro/selectivo
														{:else if opcion.value === '38mm'}
															Mayor protección, tono personalizable
														{:else if opcion.value === '42mm'}
															Máxima protección, resistencia extrema
														{/if}
													</p>
												</div>
												<Badge 
													variant={configuracion.cristalesEspeciales === opcion.value ? "default" : "outline"} 
													class="text-xs font-bold whitespace-nowrap ml-2 {configuracion.cristalesEspeciales === opcion.value ? 'bg-primary text-primary-foreground' : 'text-primary'}"
												>
													+${opcion.precio.toLocaleString()}
												</Badge>
											</div>
										</div>
										
										<!-- Indicador de selección -->
										{#if configuracion.cristalesEspeciales === opcion.value}
											<div class="absolute -top-2 -right-2">
												<div class="bg-primary text-primary-foreground rounded-full p-1 shadow-sm">
													<CheckCircle2 class="h-3 w-3" />
												</div>
											</div>
										{/if}
									</div>
								</label>
							{/each}
						</RadioGroup.Root>
					</div>
				</Card.Content>
			</Card.Root>

			<!-- Equipamiento Adicional Mejorado -->
			<Card.Root>
				<Card.Header>
					<Card.Title class="flex items-center gap-2">
						<Settings class="h-5 w-5" />
						Equipamiento Adicional
					</Card.Title>
					<Card.Description>
						Selecciona las opciones adicionales que deseas incluir en tu vehículo blindado
					</Card.Description>
				</Card.Header>
				<Card.Content>
					<div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
						{#each opcionesAdicionales as opcion}
							<label class="group relative cursor-pointer">
								<div class="flex items-start space-x-4 p-4 rounded-lg border-2 transition-all hover:bg-muted/30 {configuracion[opcion.key] ? 'border-primary bg-primary/5 shadow-sm' : 'border-border hover:border-primary/30'}">
									<Checkbox 
										bind:checked={configuracion[opcion.key]} 
										id={opcion.key}
										class="data-[state=checked]:bg-primary data-[state=checked]:border-primary mt-1"
									/>
									<div class="flex-1 space-y-2">
										<div class="flex justify-between items-start">
											<div class="space-y-1">
												<h4 class="font-semibold text-sm leading-tight">{opcion.label}</h4>
												<p class="text-xs text-muted-foreground leading-relaxed">
													{#if opcion.key === 'rollBarTecho'}
														Estructura de seguridad interna reforzada
													{:else if opcion.key === 'proteccionBateria'}
														Blindaje especializado para batería del vehículo
													{:else if opcion.key === 'runFlatTires'}
														Llantas que funcionan sin aire hasta 50km
													{:else if opcion.key === 'proteccionTanque'}
														Blindaje para tanque de combustible
													{:else if opcion.key === 'cortinaCubreEquipaje'}
														Cortina operable posterior automática
													{:else if opcion.key === 'sistemaAudio'}
														Sistema de audio premium con subwoofer
													{:else if opcion.key === 'proteccionComputadora'}
														Protección para ECU y módulos electrónicos
													{:else if opcion.key === 'defensaReforzada'}
														Defensa delantera reforzada para impactos
													{/if}
												</p>
											</div>
											<Badge 
												variant={configuracion[opcion.key] ? "default" : "outline"} 
												class="text-xs font-bold whitespace-nowrap ml-2 {configuracion[opcion.key] ? 'bg-primary text-primary-foreground' : 'text-primary'}"
											>
												+${opcion.precio.toLocaleString()}
											</Badge>
										</div>
									</div>
									
									<!-- Indicador de selección -->
									{#if configuracion[opcion.key]}
										<div class="absolute -top-2 -right-2">
											<div class="bg-primary text-primary-foreground rounded-full p-1 shadow-sm">
												<CheckCircle2 class="h-3 w-3" />
											</div>
										</div>
									{/if}
								</div>
							</label>
						{/each}
					</div>
				</Card.Content>
			</Card.Root>

			<!-- Acciones -->
			<div class="flex flex-col sm:flex-row gap-3">
				<Button 
					onclick={resetearConfiguracion}
					variant="outline"
					class="flex-1"
				>
					Resetear Configuración
				</Button>
				<Button 
					onclick={generarCotizacion}
					disabled={!configuracionCompleta}
					class="flex-1"
				>
					<CheckCircle2 class="h-4 w-4 mr-2" />
					Generar Cotización
				</Button>
			</div>
		</div>
		{:else}
		<!-- Estado de carga -->
		<div class="lg:col-span-3 flex items-center justify-center p-12">
			<div class="text-center space-y-3">
				<div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
				<p class="text-muted-foreground">Cargando configurador...</p>
			</div>
		</div>
		{/if}
	</div>
</div>
