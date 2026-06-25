<script lang="ts">
	import Busqueda from "./Busqueda.svelte";
/* 	import AgendarCitaDialog from "./AgendarCitaDialog.svelte"; */
	import { Button } from "$lib/components/ui/button";
	import { Badge } from "$lib/components/ui/badge";
	import * as Card from "$lib/components/ui/card";
	import { Separator } from "$lib/components/ui/separator";
	import { Search, User, Phone, Mail, MapPin, Plus } from "@lucide/svelte";
	import { server } from '$lib/siteConfig';
	import { goto } from '$app/navigation';
	import { Send } from "@lucide/svelte";

	interface Cliente {
		Cliente: string;
		Nombre: string;
		RFC: string;
		CodigoPostal: string;
		FiscalRegimen: string;
		Uso: string;
		Contacto: string;
		Email: string;
		Telefonos: string | null;
	}

	interface Cotizacion {
		ID: number;
		Empresa: string;
		Mov: string;
		MovID: string;
		Concepto: string;
		FechaEmision: string;
		Situacion: string;
		Cliente: string;
		Nombre: string;
		Comentarios: string;
	}

	interface PageData {
		clientes: Cliente[];
		cotizaciones?: Cotizacion[];
	}

	let { data }: { data: PageData } = $props();
	
	let selectedClient = $state<Cliente | null>(null);

	function handleSearch(e: CustomEvent) {
		console.log('Cliente seleccionado:', e.detail);
		selectedClient = e.detail;
	}

	function solicitorCotizacion() {
		if (selectedClient) {
			goto(`/cotizacion/${selectedClient.Cliente}`);
		}
	}

	function irAAutorizacion(id: number) {
		goto(`/cotizacion/configurador/${id}`);
	}

	function irACotizacion(id: number) {
		goto(`/cotizacion/configurador/${id}/cotizacion-final`);
	}

	function irAEnviar(id: number) {
		goto(`/cotizacion/configurador/${id}/cotizacion-enviar`);
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

<!-- Header del Cliente Seleccionado -->
{#if selectedClient}
<div class="p-6">
	<Card.Root class="border-2 border-primary/20 shadow-lg">
		<Card.Header class="pb-4">
			<div class="flex flex-col sm:flex-row sm:items-start gap-4">
				<!-- Icono del cliente -->
				<div class="shrink-0 p-3 bg-primary/10 rounded-xl">
					<User class="h-8 w-8 text-primary" />
				</div>
				
				<!-- Información principal -->
				<div class="flex-1 space-y-2">
					<div class="flex flex-col sm:flex-row sm:items-center gap-2">
						<Card.Title class="text-xl font-bold text-foreground">
							{selectedClient.Nombre}
						</Card.Title>
						<Badge class="w-fit">
							CLIENTE: 
							{selectedClient.Cliente}
						</Badge>
					</div>
					
					<div class="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
						<div class="flex items-center gap-1.5">
							<User class="h-4 w-4" />
							<span>{selectedClient.Contacto}</span>
						</div>
						<div class="flex items-center gap-1.5">
							<Mail class="h-4 w-4" />
							<span>{selectedClient.RFC}</span>
						</div>
						<div class="flex items-center gap-1.5">
							<MapPin class="h-4 w-4" />
							<span>CP: {selectedClient.CodigoPostal}</span>
						</div>
					</div>
				</div>
			</div>
		</Card.Header>
		
		<Card.Content class="pt-0">
			<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-muted/30 rounded-lg">
				<div class="space-y-1">
					<p class="text-xs font-medium text-muted-foreground uppercase tracking-wide">Régimen Fiscal</p>
					<p class="font-mono text-sm">{selectedClient.FiscalRegimen}</p>
				</div>
				<div class="space-y-1">
					<p class="text-xs font-medium text-muted-foreground uppercase tracking-wide">Uso CFDI</p>
					<p class="font-mono text-sm">{selectedClient.Uso}</p>
				</div>
				<div class="space-y-1">
					<p class="text-xs font-medium text-muted-foreground uppercase tracking-wide">Código Postal</p>
					<p class="font-mono text-sm">{selectedClient.CodigoPostal}</p>
				</div>
				<div class="space-y-1">
					<p class="text-xs font-medium text-muted-foreground uppercase tracking-wide">RFC</p>
					<p class="font-mono text-sm">{selectedClient.RFC || 'No especificado'}</p>
				</div>
			</div>
			
			<!-- Información de contacto -->
			<div class="flex flex-wrap items-center gap-6 mt-4 pt-4 border-t">
				{#if selectedClient.Telefonos}
				<div class="flex items-center gap-2 text-sm">
					<Phone class="h-4 w-4 text-muted-foreground" />
					<a href="tel:{selectedClient.Telefonos}" class="hover:text-primary transition-colors">
						{selectedClient.Telefonos}
					</a>
				</div>
				{/if}
				{#if selectedClient.Email}
				<div class="flex items-center gap-2 text-sm">
					<Mail class="h-4 w-4 text-muted-foreground" />
					<a href="mailto:{selectedClient.Email}" class="hover:text-primary transition-colors">
						{selectedClient.Email}
					</a>
				</div>
				{/if}
			</div>
		</Card.Content>
		
		<Card.Footer class="flex justify-end pt-6">
			<Button class="bg-primary hover:bg-primary/90" onclick={solicitorCotizacion}>
				Solicitar Cotización
			</Button>
		</Card.Footer>
	</Card.Root>
</div>
{:else}
<!-- Empty State mostrando dos columnas; una con un boton para crear un nuevo folio y otra para buscar un folio existente-->
<div class="max-w-4xl mx-auto p-4">
<div class="grid grid-cols-2 gap-4 md:gap-6 relative">

	<div class="p-3 md:p-6 min-h-[160px] md:min-h-[320px] flex flex-col justify-center items-center text-center">
		<!-- Icono solo en desktop -->
		<div class="hidden md:flex w-20 h-20 mb-4 bg-green-50 rounded-xl items-center justify-center">
			<Plus class="w-10 h-10 text-green-600" />
		</div>

		<div class="max-w-xs mx-auto">
			<h3 class="text-sm md:text-base font-semibold text-gray-900 mb-2">
				Cliente Nuevo
			</h3>
			<p class="mb-3 md:mb-4 text-xs md:text-sm text-gray-600">
				Crea un nuevo cliente para generar una cotización.
			</p>
			<Button variant="outline" disabled size="sm">
				<Plus class="w-3 h-3 md:w-4 md:h-4" />
				<span class="hidden sm:inline">Nuevo</span>
				<span class="sm:hidden">+</span>
			</Button>
		</div>
	</div>

	<!-- Separador vertical -->
	<div class="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-3/4">
		<Separator orientation="vertical" />
	</div>

	<div class="p-3 md:p-6 min-h-[160px] md:min-h-[320px] flex flex-col justify-center items-center text-center">
		<!-- Icono solo en desktop -->
		<div class="hidden md:flex w-20 h-20 mb-4 bg-blue-50 rounded-xl items-center justify-center">
			<Search class="w-10 h-10 text-blue-600" />
		</div>

		<div class="max-w-xs mx-auto">
			<h3 class="text-sm md:text-base font-semibold text-gray-900 mb-2">
				Cliente existente
			</h3>
			<p class="mb-3 md:mb-4 text-xs md:text-sm text-gray-600">
				Busca un cliente para crear una cotización.
			</p>

			<Busqueda clientes={data.clientes} on:busqueda={handleSearch}>
				{#snippet itemTemplate(item)}
          <div class="w-full">
            <div class="text-xs text-muted-foreground">
              {item.Cliente} • {item.RFC}
            </div>
            <div class="font-medium">
              {item.Nombre}
            </div>
            <div class="text-sm text-muted-foreground">
              {item.Contacto} • {item.Email}
            </div>
          </div>
				{/snippet}

				<Button variant="outline" size="sm">
					<Search class="w-3 h-3 md:w-4 md:h-4" />
					<span class="hidden sm:inline">Buscar</span>
					<span class="sm:hidden">🔍</span>
				</Button>

			</Busqueda>
			
		</div>
	</div>
</div>

<!-- Lista de Cotizaciones -->
<div class="mt-6">
    {#if data.cotizaciones && data.cotizaciones.length > 0}
      <div class="space-y-4">
        {#each data.cotizaciones as cotizacion}
          <Card.Root class="hover:shadow-md transition-shadow">
            <Card.Header class="pb-3">
              <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div class="flex-1">
                  <!-- Primera línea: ID destacado + Status + Fecha -->
                  <div class="flex items-center gap-3 mb-2">
                    <div class="flex items-center gap-2">
                      <span class="text-lg font-bold text-foreground">
                        #{cotizacion.ID}
                      </span>
                      <Badge variant={cotizacion.Situacion === 'SOLICITUD' ? 'outline' : cotizacion.Situacion === 'POR AUTORIZAR' ? 'secondary' : cotizacion.Situacion === 'AUTORIZADO' ? 'default' : 'outline'}>
                        {cotizacion.Situacion}
                      </Badge>
                    </div>
                    <span class="text-sm text-muted-foreground">
                      {new Date(cotizacion.FechaEmision).toLocaleDateString('es-MX', { 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </span>
                  </div>
                  
                  <!-- Segunda línea: Cliente y detalles -->
                  <div class="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                    <div class="flex items-center gap-1.5">
                      <User class="h-4 w-4" />
                      <span class="font-medium">{cotizacion.Nombre}</span>
                    </div>
                    <div class="flex items-center gap-1.5">
                      <span class="font-mono bg-muted px-2 py-1 rounded text-xs">
                        {cotizacion.Cliente}
                      </span>
                    </div>
                    <div class="text-xs">
                      {cotizacion.Empresa} • Mov {cotizacion.MovID}
                    </div>
                  </div>
                </div>
                <div class="text-right">
                  <p class="text-sm font-medium text-muted-foreground">
                    {cotizacion.Concepto}
                  </p>
                </div>
              </div>
            </Card.Header>
            
            {#if cotizacion.Comentarios && cotizacion.Comentarios.trim()}
            <Card.Content class="pt-0">
              <div class="bg-muted/30 rounded-lg p-3">
                <h5 class="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                  Detalles del Vehículo
                </h5>
                <div class="text-sm whitespace-pre-line text-foreground">
                  {cotizacion.Comentarios.trim()}
                </div>
              </div>
            </Card.Content>
            {/if}
            
            <Card.Footer class="flex justify-end gap-2 pt-4">
              <Button variant="outline" size="sm" onclick={() => irAAutorizacion(cotizacion.ID)}>
                Configurar Vehiculo
              </Button>
							<Button variant="outline" size="sm" onclick={() => irACotizacion(cotizacion.ID)}>
                Autorizar
              </Button>
              <Button variant="outline" size="sm" onclick={() => irAEnviar(cotizacion.ID)}>
								<Send class="h-4 w-4 " />
                Enviar
              </Button>
            </Card.Footer>
          </Card.Root>
        {/each}
      </div>
    {:else}
      <Card.Root>
        <Card.Content class="flex flex-col items-center justify-center py-8 text-center">
          <div class="w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-4">
            <Search class="w-6 h-6 text-muted-foreground" />
          </div>
          <h3 class="font-medium text-foreground mb-1">No hay cotizaciones</h3>
          <p class="text-sm text-muted-foreground">
            No se encontraron cotizaciones para este cliente.
          </p>
        </Card.Content>
      </Card.Root>
    {/if}
  </div>


</div>
<!-- End Empty State -->
{/if}

