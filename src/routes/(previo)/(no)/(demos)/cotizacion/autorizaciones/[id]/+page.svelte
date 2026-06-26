<script lang="ts">
	import { Button } from "$lib/components/ui/button";
	import { Badge } from "$lib/components/ui/badge";
	import * as Card from "$lib/components/ui/card";
	import { Separator } from "$lib/components/ui/separator";
	import { ArrowLeft, User, FileText, DollarSign, CheckCircle2, XCircle, Clock } from "@lucide/svelte";
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';

	interface Partida {
		Articulo: string;
		Descripcion: string;
		Importe: number;
	}

	interface CotizacionDetalle {
		ID: number;
		Empresa: string;
		Mov: string;
		MovID: string;
		Concepto: string;
		FechaEmision: string;
		Estatus: string;
		Cliente: string;
		Nombre: string;
		Comentarios: string;
		// Otras propiedades que puedan venir en el detalle
		Total?: number;
		Subtotal?: number;
		IVA?: number;
	}

	interface PageData {
		cotizacion: Partida[];
	}

	let { data }: { data: PageData } = $props();
	
	// Estado para la información del cabecero (debería venir del estado global o parámetros)
	// Por ahora usaré datos de ejemplo, pero esto debería venir del contexto de la cotización
	let cotizacionInfo = $state<CotizacionDetalle>({
		ID: 129301,
		Empresa: "GMC",
		Mov: "Cotizacion",
		MovID: "10",
		Concepto: "Solo Blindaje", 
		FechaEmision: "2025-09-07T00:00:00",
		Estatus: "CONFIRMAR",
		Cliente: "C01446",
		Nombre: "DANIEL ROLDAN SORIA",
		Comentarios: "   Marca: Cadillac\r\n   Modelo: SRX\r\n   Año: 2016\r\n   Requisitos: Escolta Bilingue\r\n   Ubicacion: Parras de la Fuente\r\n",
		Total: 0,
		Subtotal: 0,
		IVA: 0
	});

	// Calcular totales
	let subtotal = $derived(data.cotizacion.reduce((sum, partida) => sum + partida.Importe, 0));
	let iva = $derived(subtotal * 0.16);
	let total = $derived(subtotal + iva);

	function volverAtras() {
		goto('/cotizacion');
	}

	function aprobarCotizacion() {
		// Lógica para aprobar la cotización
		console.log('Aprobando cotización:', cotizacionInfo.ID);
	}

	function rechazarCotizacion() {
		// Lógica para rechazar la cotización
		console.log('Rechazando cotización:', cotizacionInfo.ID);
	}
</script>

<div class="max-w-6xl mx-auto p-4 space-y-6">
	<!-- Botón de regresar -->
	<div class="flex items-center gap-3 mb-6">
		<Button variant="ghost" size="sm" onclick={volverAtras}>
			<ArrowLeft class="h-4 w-4 mr-2" />
			Regresar
		</Button>
		<div class="h-6 w-px bg-border"></div>
		<h1 class="text-2xl font-bold text-foreground">Autorización de Cotización</h1>
	</div>

	<!-- Cabecero de la Cotización -->
	<Card.Root class="border-2 border-primary/20 shadow-lg">
		<Card.Header class="pb-4">
			<div class="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
				<div class="flex-1">
					<!-- Primera línea: ID destacado + Status + Fecha -->
					<div class="flex items-center gap-3 mb-3">
						<div class="flex items-center gap-2">
							<span class="text-2xl font-bold text-foreground">
								#{cotizacionInfo.ID}
							</span>
							<Badge variant={cotizacionInfo.Estatus === 'CONFIRMAR' ? 'secondary' : cotizacionInfo.Estatus === 'APROBADO' ? 'default' : 'outline'} class="text-sm">
								{cotizacionInfo.Estatus}
							</Badge>
						</div>
						<span class="text-sm text-muted-foreground">
							{new Date(cotizacionInfo.FechaEmision).toLocaleDateString('es-MX', { 
								year: 'numeric', 
								month: 'long', 
								day: 'numeric' 
							})}
						</span>
					</div>
					
					<!-- Segunda línea: Cliente y detalles -->
					<div class="flex flex-wrap items-center gap-6 text-sm text-muted-foreground mb-4">
						<div class="flex items-center gap-2">
							<User class="h-4 w-4" />
							<span class="font-medium text-foreground">{cotizacionInfo.Nombre}</span>
						</div>
						<div class="flex items-center gap-2">
							<span class="font-mono bg-muted px-2 py-1 rounded text-xs">
								{cotizacionInfo.Cliente}
							</span>
						</div>
						<div class="text-sm">
							{cotizacionInfo.Empresa} • Mov {cotizacionInfo.MovID}
						</div>
					</div>

					<!-- Detalles del vehículo -->
					{#if cotizacionInfo.Comentarios && cotizacionInfo.Comentarios.trim()}
					<div class="bg-muted/30 rounded-lg p-4">
						<h4 class="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-2">
							<FileText class="h-4 w-4" />
							Detalles del Vehículo
						</h4>
						<div class="text-sm whitespace-pre-line text-foreground">
							{cotizacionInfo.Comentarios.trim()}
						</div>
					</div>
					{/if}
				</div>

				<div class="text-right">
					<p class="text-lg font-semibold text-muted-foreground">
						{cotizacionInfo.Concepto}
					</p>
				</div>
			</div>
		</Card.Header>
	</Card.Root>

	<!-- Partidas de la Cotización -->
	<Card.Root>
		<Card.Header>
			<Card.Title class="flex items-center gap-2">
				<DollarSign class="h-5 w-5" />
				Partidas de la Cotización
			</Card.Title>
		</Card.Header>
		<Card.Content class="p-0">
			<!-- Header de la tabla -->
			<div class="grid grid-cols-12 gap-4 p-4 bg-muted/30 border-b font-medium text-sm text-muted-foreground">
				<div class="col-span-3">Artículo</div>
				<div class="col-span-7">Descripción</div>
				<div class="col-span-2 text-right">Importe</div>
			</div>

			<!-- Partidas -->
			<div class="divide-y">
				{#each data.cotizacion as partida}
				<div class="grid grid-cols-12 gap-4 p-4 hover:bg-muted/20 transition-colors">
					<div class="col-span-3">
						<span class="font-mono text-sm bg-muted px-2 py-1 rounded">
							{partida.Articulo}
						</span>
					</div>
					<div class="col-span-7">
						<span class="text-sm">{partida.Descripcion}</span>
					</div>
					<div class="col-span-2 text-right">
						<span class="font-medium">
							${partida.Importe.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
						</span>
					</div>
				</div>
				{/each}
			</div>

			<!-- Totales -->
			<div class="border-t bg-muted/20">
				<div class="space-y-2 p-4">
					<div class="flex justify-between text-sm">
						<span class="text-muted-foreground">Subtotal:</span>
						<span class="font-medium">${subtotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
					</div>
					<div class="flex justify-between text-sm">
						<span class="text-muted-foreground">IVA (16%):</span>
						<span class="font-medium">${iva.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
					</div>
					<Separator />
					<div class="flex justify-between text-lg font-bold">
						<span>Total:</span>
						<span class="text-primary">${total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
					</div>
				</div>
			</div>
		</Card.Content>
	</Card.Root>

	<!-- Acciones de Autorización -->
	<Card.Root>
		<Card.Header>
			<Card.Title class="flex items-center gap-2">
				<CheckCircle2 class="h-5 w-5" />
				Acciones de Autorización
			</Card.Title>
			<Card.Description>
				Revisa los detalles de la cotización y selecciona una acción.
			</Card.Description>
		</Card.Header>
		<Card.Content>
			<div class="flex flex-col sm:flex-row gap-4 justify-center">
				<Button 
					variant="destructive" 
					size="lg" 
					onclick={rechazarCotizacion}
					class="flex-1 sm:flex-none"
				>
					<XCircle class="h-4 w-4 mr-2" />
					Rechazar
				</Button>
				<Button 
					variant="outline" 
					size="lg" 
					class="flex-1 sm:flex-none"
				>
					<Clock class="h-4 w-4 mr-2" />
					Posponer
				</Button>
				<Button 
					size="lg" 
					onclick={aprobarCotizacion}
					class="flex-1 sm:flex-none bg-green-600 hover:bg-green-700"
				>
					<CheckCircle2 class="h-4 w-4 mr-2" />
					Aprobar
				</Button>
			</div>
		</Card.Content>
	</Card.Root>
</div>
