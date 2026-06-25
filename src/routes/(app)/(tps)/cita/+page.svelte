<script lang="ts">
	import Busqueda from "./Busqueda.svelte";
	import AgendarCitaDialog from "./AgendarCitaDialog.svelte";
	import { Button } from "$lib/components/ui/button";
	import { Badge } from "$lib/components/ui/badge";
	import * as Card from "$lib/components/ui/card";
	import { Separator } from "$lib/components/ui/separator";
	import { Search, Car, User, Phone, Mail, Calendar, Palette, Wrench, Clock, MapPin, DollarSign, CheckCircle2, AlertCircle, Settings, Plus, SearchCheck } from "@lucide/svelte";
	import { server } from '$lib/siteConfig';
	import { Icon } from "lucide-svelte";

	interface Proyecto {
		Folio: string;
		Cliente: string;
		Nombre: string;
		Articulo: string;
		Descripcion1: string;
		VIN: string;
		Motor: string;
		Modelo: string;
		ColorExteriorDescripcion: string;
		Telefonos: string;
		Email1: string | null;
		Placas: string;
	}

	interface Servicio {
		MovID: number;
		FechaEmision: string;
		ServicioTipo: string;
		ServicioKms: string;
		Comentarios: string;
	}

	interface PageData {
		proyectos: Proyecto[];
		serviciosTipo: any[];
	}

	let { data }: { data: PageData } = $props();
	
	let selectedProject = $state<Proyecto | null>(null);
	let serviciosHistorial = $state<Servicio[]>([]);
	let loadingServicios = $state(false);
	let dialogOpen = $state(false);

	async function loadServicios(vin: string) {
		loadingServicios = true;
		try {
			const response = await fetch(
				server.api + 'sp/spWebProyServiciosLista',
				{
					method: 'POST',
					body: JSON.stringify({ VIN: vin }),
					headers: {
						'Content-Type': 'application/json',
						Authorization:
							'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1bmlxdWVfbmFtZSI6Ik1BU0VSUCIsIm5iZiI6MTcwNDczOTg5MiwiZXhwIjoxNzk0NzM5ODkyLCJpYXQiOjE3MDQ3Mzk4OTIsImlzcyI6IkFQSSBSRVNUIiwiYXVkIjoiTUFTIEVSUCJ9.FjzsgDNyQRodwo_vk1UgJ8RcC0xh27SSZm7NoLotIok'
					}
				}
			);
			const servicios = await response.json();
			serviciosHistorial = servicios || [];
		} catch (error) {
			console.error('Error loading servicios:', error);
			serviciosHistorial = [];
		} finally {
			loadingServicios = false;
		}
	}

	function handleSearch(e: CustomEvent) {
		console.log('Folio seleccionado:', e.detail);
		selectedProject = e.detail;
		if (selectedProject) {
			loadServicios(selectedProject.VIN);
		}
	}

	function openAgendarDialog() {
		dialogOpen = true;
	}

	function formatDate(dateString: string) {
		return new Date(dateString).toLocaleDateString('es-ES', {
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		});
	}

	function getServiceIcon(servicioTipo: string) {
		const tipo = servicioTipo.toUpperCase();
		if (tipo.includes('REVISION') || tipo.includes('MANTENIMIENTO')) {
			return Settings;
		} else if (tipo.includes('CAMBIO') || tipo.includes('INSTALACION')) {
			return Wrench;
		} else if (tipo.includes('REEMPLAZO')) {
			return AlertCircle;
		}
		return CheckCircle2;
	}

	function getServiceTypeColor(servicioTipo: string) {
		const tipo = servicioTipo.toUpperCase();
		if (tipo.includes('REVISION') || tipo.includes('MANTENIMIENTO')) {
			return 'bg-blue-100 text-blue-700';
		} else if (tipo.includes('CAMBIO') || tipo.includes('INSTALACION')) {
			return 'bg-green-100 text-green-700';
		} else if (tipo.includes('REEMPLAZO')) {
			return 'bg-orange-100 text-orange-700';
		}
		return 'bg-gray-100 text-gray-700';
	}
</script>
<div
		  class="flex flex-1 items-center gap-3 justify-end"
		>
		  <div class="flex gap-4">
			
		  </div>
		  
		  <span
				aria-hidden="true"
				class="block h-6 w-px rounded-full bg-gray-200"
			></span>
		  
		</div>

<!-- Header del Folio Seleccionado -->
{#if selectedProject}
<div class="p-6">
	<Card.Root class="border-2 border-primary/20 shadow-lg">
		<Card.Header class="pb-4">
			<div class="flex flex-col sm:flex-row sm:items-start gap-4">
				<!-- Icono del vehículo -->
				<div class="shrink-0 p-3 bg-primary/10 rounded-xl">
					<Car class="h-8 w-8 text-primary" />
				</div>
				
				<!-- Información principal -->
				<div class="flex-1 space-y-2">
					<div class="flex flex-col sm:flex-row sm:items-center gap-2">
						<Card.Title class="text-xl font-bold text-foreground">
							{selectedProject.Descripcion1}
						</Card.Title>
						<Badge  class="w-fit">
							FOLIO: 
							{selectedProject.Folio}
						</Badge>
					</div>
					
					<div class="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
						<div class="flex items-center gap-1.5">
							<User class="h-4 w-4" />
							<span>{selectedProject.Nombre}</span>
						</div>
						<div class="flex items-center gap-1.5">
							<Calendar class="h-4 w-4" />
							<span>Modelo {selectedProject.Modelo}</span>
						</div>
						<div class="flex items-center gap-1.5">
							<Palette class="h-4 w-4" />
							<span>{selectedProject.ColorExteriorDescripcion}</span>
						</div>
					</div>
				</div>
				
				<!-- Botón de acción -->
				<div class="shrink-0">
					<Button class="bg-primary hover:bg-primary/90" onclick={openAgendarDialog}>
						Agendar Cita
					</Button>
				</div>
			</div>
		</Card.Header>
		
		<Card.Content class="pt-0">
			<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 p-4 bg-muted/30 rounded-lg">
				<div class="space-y-1">
					<p class="text-xs font-medium text-muted-foreground uppercase tracking-wide">Cliente</p>
					<p class="font-mono text-sm">{selectedProject.Cliente}</p>
				</div>
				<div class="space-y-1">
					<p class="text-xs font-medium text-muted-foreground uppercase tracking-wide">VIN</p>
					<p class="font-mono text-sm">{selectedProject.VIN}</p>
				</div>
				<div class="space-y-1">
					<p class="text-xs font-medium text-muted-foreground uppercase tracking-wide">Placas</p>
					<p class="font-mono text-sm">{selectedProject.Placas}</p>
				</div>
				<div class="space-y-1">
					<p class="text-xs font-medium text-muted-foreground uppercase tracking-wide">Motor</p>
					<p class="font-mono text-sm">{selectedProject.Motor}</p>
				</div>
				<div class="space-y-1">
					<p class="text-xs font-medium text-muted-foreground uppercase tracking-wide">Artículo</p>
					<p class="font-mono text-sm">{selectedProject.Articulo}</p>
				</div>
			</div>
			
			<!-- Información de contacto -->
			<div class="flex flex-wrap items-center gap-6 mt-4 pt-4 border-t">
				<div class="flex items-center gap-2 text-sm">
					<Phone class="h-4 w-4 text-muted-foreground" />
					<a href="tel:{selectedProject.Telefonos}" class="hover:text-primary transition-colors">
						{selectedProject.Telefonos}
					</a>
				</div>
				{#if selectedProject.Email1}
				<div class="flex items-center gap-2 text-sm">
					<Mail class="h-4 w-4 text-muted-foreground" />
					<a href="mailto:{selectedProject.Email1}" class="hover:text-primary transition-colors">
						{selectedProject.Email1}
					</a>
				</div>
				{/if}
			</div>
		</Card.Content>
	</Card.Root>

	<!-- Historial de Servicios -->
	<div class="mt-6">
		<Card.Root>
			<Card.Header>
				<div class="flex items-center justify-between">
					<div class="flex items-center gap-2">
						<Wrench class="h-5 w-5 text-primary" />
						<Card.Title class="text-lg font-semibold">
							Historial de Servicios
						</Card.Title>
					</div>
					{#if serviciosHistorial.length > 0}
						<Badge variant="outline" class="text-xs">
							{serviciosHistorial.length} servicios
						</Badge>
					{/if}
				</div>
			</Card.Header>
			
			<Card.Content>
				{#if loadingServicios}
					<!-- Loading state -->
					<div class="space-y-4">
						{#each Array(3) as _}
							<div class="flex gap-4 animate-pulse">
								<div class="shrink-0 w-8 h-8 bg-muted rounded-full"></div>
								<div class="flex-1 space-y-2">
									<div class="h-4 bg-muted rounded w-3/4"></div>
									<div class="h-3 bg-muted rounded w-1/2"></div>
								</div>
							</div>
						{/each}
					</div>
				{:else if serviciosHistorial.length === 0}
					<!-- Empty state -->
					<div class="text-center py-8">
						<div class="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-4">
							<Wrench class="h-6 w-6 text-muted-foreground" />
						</div>
						<h3 class="text-sm font-medium text-foreground mb-1">No hay servicios registrados</h3>
						<p class="text-sm text-muted-foreground">
							Este vehículo no tiene historial de servicios disponible.
						</p>
					</div>
				{:else}
					<!-- Timeline de servicios con diseño mejorado -->
					<div class="space-y-0">
						{#each serviciosHistorial as servicio, index}
							{@const IconComponent = getServiceIcon(servicio.ServicioTipo)}
							<div class="group relative flex gap-x-3.5">
								<!-- Timeline Line & Icon -->
								<div class="relative group-last:after:hidden after:absolute after:top-7 after:bottom-1 after:start-3 after:w-px after:-translate-x-[0.5px] after:bg-gray-200">
									<div class="relative z-10 size-6 flex justify-center items-center">
										<span class="flex shrink-0 justify-center items-center size-6 {getServiceTypeColor(servicio.ServicioTipo)} rounded-full">
											<IconComponent class="h-3.5 w-3.5" />
										</span>
									</div>
								</div>
								
								<!-- Service Content -->
								<div class="grow pb-6">
									<!-- Service Header -->
									<span class="block">
										<span class="text-sm text-muted-foreground">Servicio</span>
										<span class="font-semibold text-sm text-foreground">#{servicio.MovID}</span>
										<span class="text-sm text-muted-foreground">realizado</span>
										<span class="ms-1 text-xs text-muted-foreground">{formatDate(servicio.FechaEmision)}</span>
									</span>
									
									<!-- Service Type & KM -->
									<div class="mt-2 flex flex-wrap items-center gap-2">
										<Badge variant="secondary" class="text-xs">
											{servicio.ServicioTipo}
										</Badge>
										{#if servicio.ServicioKms}
											<Badge variant="outline" class="text-xs">
												<MapPin class="h-3 w-3 mr-1" />
												{servicio.ServicioKms} km
											</Badge>
										{/if}
									</div>
									
									<!-- Service Description -->
									{#if servicio.Comentarios}
										<p class="mt-2 text-sm text-foreground leading-relaxed">
											{servicio.Comentarios}
										</p>
									{/if}
								</div>
							</div>
						{/each}
					</div>
				{/if}
			</Card.Content>
		</Card.Root>
	</div>
</div>
{:else}
<!-- Empty State mostrando dos columnas; una con un boton para crear un nuevo folio y otra para buscar un folio existente-->
<div class="max-w-3xl mx-auto">
<div class="grid grid-cols-1 md:grid-cols-2 gap-4 relative">

	<div class="p-5 min-h-96 flex flex-col justify-center items-center text-center">
			<svg class="w-48 mx-auto mb-4" width="178" height="90" viewBox="0 0 178 90" fill="none" xmlns="http://www.w3.org/2000/svg">
			<!-- Formulario principal -->
			<rect x="20" y="20" width="138" height="50" rx="8" fill="white" stroke="#e5e7eb" stroke-width="1"/>
			
			<!-- Header del formulario -->
			<rect x="28" y="28" width="122" height="6" rx="3" fill="#d1d5db"/>
			
			<!-- Campos del formulario -->
			<rect x="28" y="40" width="50" height="4" rx="2" fill="#f3f4f6"/>
			<rect x="85" y="40" width="55" height="4" rx="2" fill="#f3f4f6"/>
			
			<rect x="28" y="50" width="70" height="4" rx="2" fill="#f3f4f6"/>
			<rect x="105" y="50" width="35" height="4" rx="2" fill="#f3f4f6"/>
			
			<rect x="28" y="60" width="85" height="4" rx="2" fill="#f3f4f6"/>
			
			<!-- Botón de acción -->
			<rect x="125" y="57" width="20" height="8" rx="4" fill="#dbeafe"/>
			<rect x="129" y="59" width="12" height="4" rx="2" fill="#3b82f6"/>
			
			<!-- Icono de más flotante -->
			<g filter="url(#filterCreate)">
				<circle cx="89" cy="30" r="10" fill="white"/>
				<circle cx="89" cy="30" r="9.5" stroke="#e5e7eb"/>
				<!-- Cruz del más -->
				<path d="M85 30h8M89 26v8" stroke="#10b981" stroke-width="2" stroke-linecap="round"/>
			</g>
			
			<defs>
			<filter id="filterCreate" x="70" y="15" width="38" height="38" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
			<feFlood flood-opacity="0" result="BackgroundImageFix"/>
			<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
			<feOffset dy="3"/>
			<feGaussianBlur stdDeviation="4.5"/>
			<feComposite in2="hardAlpha" operator="out"/>
			<feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.05 0"/>
			<feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow"/>
			<feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow" result="shape"/>
			</filter>
			</defs>
		</svg>

		<div class="max-w-sm mx-auto">
			<p class="mt-2 font-medium text-gray-800">
				Cliente Nuevo
			</p>
			<p class="mb-5 text-sm text-gray-500">
				Usa el formulario para crear un nuevo cliente y poder agendar una cita de servicio.
			</p>
			<!-- boton con icono -->
			<Button variant="outline" disabled>
				<Plus />
				Nuevo
			</Button>
		</div>
	</div>

	<!-- Separador vertical -->
	<div class="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-3/4">
		<Separator orientation="vertical" />
	</div>

	<div class="p-5 min-h-96 flex flex-col justify-center items-center text-center">
		<svg class="w-48 mx-auto mb-4" width="178" height="90" viewBox="0 0 178 90" fill="none" xmlns="http://www.w3.org/2000/svg">
			<rect x="27" y="50.5" width="124" height="39" rx="7.5" fill="currentColor" class="fill-white"/>
			<rect x="27" y="50.5" width="124" height="39" rx="7.5" stroke="currentColor" class="stroke-gray-50"/>
			<rect x="34.5" y="58" width="24" height="24" rx="4" fill="currentColor" class="fill-gray-50"/>
			<rect x="66.5" y="61" width="60" height="6" rx="3" fill="currentColor" class="fill-gray-50"/>
			<rect x="66.5" y="73" width="77" height="6" rx="3" fill="currentColor" class="fill-gray-50"/>
			<rect x="19.5" y="28.5" width="139" height="39" rx="7.5" fill="currentColor" class="fill-white"/>
			<rect x="19.5" y="28.5" width="139" height="39" rx="7.5" stroke="currentColor" class="stroke-gray-100"/>
			<rect x="27" y="36" width="24" height="24" rx="4" fill="currentColor" class="fill-gray-100"/>
			<rect x="59" y="39" width="60" height="6" rx="3" fill="currentColor" class="fill-gray-100"/>
			<rect x="59" y="51" width="92" height="6" rx="3" fill="currentColor" class="fill-gray-100"/>
			<g filter="url(#filter19)">
			<rect x="12" y="6" width="154" height="40" rx="8" fill="currentColor" class="fill-white" shape-rendering="crispEdges"/>
			<rect x="12.5" y="6.5" width="153" height="39" rx="7.5" stroke="currentColor" class="stroke-gray-100" shape-rendering="crispEdges"/>
			<rect x="20" y="14" width="24" height="24" rx="4" fill="currentColor" class="fill-gray-200 "/>
			<rect x="52" y="17" width="60" height="6" rx="3" fill="currentColor" class="fill-gray-200"/>
			<rect x="52" y="29" width="106" height="6" rx="3" fill="currentColor" class="fill-gray-200"/>
			</g>
			<defs>
			<filter id="filter19" x="0" y="0" width="178" height="64" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
			<feFlood flood-opacity="0" result="BackgroundImageFix"/>
			<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
			<feOffset dy="6"/>
			<feGaussianBlur stdDeviation="6"/>
			<feComposite in2="hardAlpha" operator="out"/>
			<feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.03 0"/>
			<feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_1187_14810"/>
			<feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_1187_14810" result="shape"/>
			</filter>
			</defs>
		</svg>

		<div class="max-w-sm mx-auto">
			<p class="mt-2 font-medium text-gray-800">
				Cliente existente
			</p>
			<p class="mb-5 text-sm text-gray-500">
				Usa el buscador para encontrar un cliente y poder agendar una cita de servicio.
			</p>

			<Busqueda proyectos={data.proyectos} on:busqueda={handleSearch}>
				{#snippet itemTemplate(item)}
          <div class="w-full">
            <div class="text-xs text-muted-foreground">
              {item.Folio} • {item.Cliente}
            </div>
            <div class="font-medium">
              {item.Nombre}
            </div>
            <div class="text-sm text-muted-foreground">
              {item.Descripcion1} • {item.VIN}
            </div>
          </div>
				{/snippet}
				
				<!-- <Button variant="outline" size="icon" class="rounded-full" href="#" >
					<span class="sr-only">Buscar</span>
					<Search class="h-6 w-6 " />
				</Button> -->

				<Button variant="outline">
					<Search  />
					Buscar
				</Button>

			</Busqueda>
			
		</div>
	</div>

</div>
</div>
<!-- End Empty State -->
{/if}

<!-- Diálogo de Agendar Cita -->
<AgendarCitaDialog 
	bind:open={dialogOpen} 
	serviciosTipo={data.serviciosTipo}
	proyecto={selectedProject}
/>

