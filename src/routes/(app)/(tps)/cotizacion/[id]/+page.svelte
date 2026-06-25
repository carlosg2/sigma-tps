<script lang="ts">
	import type { PageData } from "./$types.js";
	import VehicleRequestForm from "./multistep-form.svelte";
	import { Separator } from "$lib/components/ui/separator/index.js";
	import { Badge } from "$lib/components/ui/badge/index.js";
	import * as Card from "$lib/components/ui/card/index.js";
	import { User, Phone, Mail, MapPin } from "@lucide/svelte";
	
	let { data }: { data: PageData } = $props();
</script>

<div class="container mx-auto py-4">
	<!-- Header con información del cliente seleccionado -->
	<!-- <Card.Root class="mb-6 border border-muted">
		<Card.Header class="pb-3">
			<div class="flex items-center gap-3">
				<div class="shrink-0 p-2 bg-primary/10 rounded-lg">
					<User class="h-5 w-5 text-primary" />
				</div>
				<div class="flex-1">
					<div class="flex items-center gap-2 mb-1">
						<Card.Title class="text-lg font-semibold">
							{data.clienteSeleccionado.Nombre}
						</Card.Title>
						<Badge variant="outline" class="text-xs">
							{data.clienteSeleccionado.Cliente}
						</Badge>
					</div>
					<div class="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
						<div class="flex items-center gap-1">
							<User class="h-3 w-3" />
							<span>{data.clienteSeleccionado.Contacto}</span>
						</div>
						{#if data.clienteSeleccionado.Email}
						<div class="flex items-center gap-1">
							<Mail class="h-3 w-3" />
							<span>{data.clienteSeleccionado.Email}</span>
						</div>
						{/if}
						{#if data.clienteSeleccionado.Telefonos}
						<div class="flex items-center gap-1">
							<Phone class="h-3 w-3" />
							<span>{data.clienteSeleccionado.Telefonos}</span>
						</div>
						{/if}
						<div class="flex items-center gap-1">
							<MapPin class="h-3 w-3" />
							<span>CP: {data.clienteSeleccionado.CodigoPostal}</span>
						</div>
					</div>
				</div>
			</div>
		</Card.Header>
	</Card.Root> -->

	<VehicleRequestForm 
		data={data.form} 
		formPaso1={data.formPaso1}
		API_CONFIG={data.API_CONFIG} 
		Modulo={data.Modulo} 
		ID={parseInt(data.ID)}
		clienteSeleccionado={data.clienteSeleccionado}
	/> 
</div>
