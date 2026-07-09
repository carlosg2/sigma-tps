<script lang="ts">
	import { cn } from '$lib/utils.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Table from '$lib/components/ui/table/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Textarea } from '$lib/components/ui/textarea/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import { toast } from 'svelte-sonner';
	import AlertTriangle from '@lucide/svelte/icons/triangle-alert';
	import Building2 from '@lucide/svelte/icons/building-2';
	import Wrench from '@lucide/svelte/icons/wrench';
	import CheckCircle from '@lucide/svelte/icons/check-circle';
	import Clock from '@lucide/svelte/icons/clock';
	import Camera from '@lucide/svelte/icons/camera';
	import ArrowRight from '@lucide/svelte/icons/arrow-right';

	type Siniestro = {
		id: string; vin: string; modelo: string; cliente: string;
		tipo: string; descripcion: string;
		costoInterno: number; costoExterno: number;
		tiempoInterno: string; tiempoExterno: string;
		ruta: 'pendiente' | 'interno' | 'externo';
		justificacion: string;
		proveedor?: string;
		fechaRegistro: string;
		estado: 'nuevo' | 'evaluacion' | 'autorizado' | 'en_proceso' | 'cerrado';
	};

	let siniestros = $state<Siniestro[]>([
		{ id: 'SIN-001', vin: 'VIN-MTY-008', modelo: 'Suburban 2024', cliente: 'Grupo Empresarial Noreste', tipo: 'Impacto lateral', descripcion: 'Rotura de cristal blindado trasero + deformación de panel puerta derecha trasera. Daño estructural leve en jamba.', costoInterno: 148_000, costoExterno: 185_000, tiempoInterno: '15 días hábiles', tiempoExterno: '22 días hábiles', ruta: 'pendiente', justificacion: '', proveedor: '', fechaRegistro: '2025-06-20', estado: 'evaluacion' },
		{ id: 'SIN-002', vin: 'VIN-CDMX-004', modelo: 'Land Cruiser 2023', cliente: 'Constructora Nacional SA', tipo: 'Vandalismo', descripcion: 'Pintura rallada en cofre y costado izquierdo. Espejo retrovisor externo roto. Sin daño a blindaje.', costoInterno: 0, costoExterno: 42_500, tiempoInterno: '—', tiempoExterno: '8 días hábiles', ruta: 'externo', justificacion: 'Trabajo estético que requiere taller especializado en pintura con certificación de fabricante.', proveedor: 'Autobody Premium MTY', fechaRegistro: '2025-06-18', estado: 'autorizado' },
		{ id: 'SIN-003', vin: 'VIN-MTY-011', modelo: 'Tahoe 2022', cliente: 'Familia Garza Garza', tipo: 'Proyectil — incidente seguridad', descripcion: 'Impacto balístico en puerta trasera derecha. Placa de acero absorbió el impacto. Requiere sustitución de placa y cristal.', costoInterno: 320_000, costoExterno: 0, tiempoInterno: '10 días hábiles', tiempoExterno: '—', ruta: 'interno', justificacion: 'Por protocolo de seguridad, los siniestros con impacto balístico se reparan únicamente en planta para mantener cadena de custodia y confidencialidad.', proveedor: '', fechaRegistro: '2025-06-22', estado: 'autorizado' }
	]);

	let selId = $state<string | null>(null);
	const sel = $derived(siniestros.find(s => s.id === selId) ?? null);

	function autorizar(id: string, ruta: 'interno' | 'externo') {
		siniestros = siniestros.map(s => s.id === id ? { ...s, ruta, estado: 'autorizado' } : s);
		toast.success(`Siniestro ${id} autorizado como reparación ${ruta === 'interno' ? 'interna en planta' : 'externa'}`, {
			description: ruta === 'interno' ? 'Se generará TOT/OP interna automáticamente.' : `Proveedor: ${siniestros.find(s=>s.id===id)?.proveedor || 'Por definir'}`
		});
	}

	function estadoVariant(e: Siniestro['estado']): 'outline' | 'secondary' | 'default' | 'destructive' {
		if (e === 'cerrado') return 'secondary';
		if (e === 'autorizado' || e === 'en_proceso') return 'default';
		if (e === 'nuevo') return 'destructive';
		return 'outline';
	}
</script>

<div class="flex flex-col gap-6">
	<div class="flex flex-wrap items-center justify-between gap-3">
		<div>
			<h2 class="text-xl font-semibold">Bifurcación de Siniestros</h2>
			<p class="text-muted-foreground text-sm">Flujo de autorización: Reparación Interna (planta) vs. Proveedor Externo</p>
		</div>
		<Badge variant="outline" class="font-mono">GAP-TLL-005</Badge>
	</div>

	<div class="grid gap-6 lg:grid-cols-3">
		<!-- Lista -->
		<div class="space-y-3">
			{#each siniestros as s (s.id)}
				<button class="w-full text-left" onclick={() => (selId = selId === s.id ? null : s.id)}>
					<Card.Root class={cn('transition-shadow hover:shadow-md', selId === s.id && 'ring-2 ring-primary')}>
						<Card.Header class="pb-2">
							<div class="flex items-center justify-between">
								<Card.Title class="text-sm font-mono">{s.id}</Card.Title>
								<Badge variant={estadoVariant(s.estado)} class="capitalize text-xs">{s.estado.replace('_',' ')}</Badge>
							</div>
							<Card.Description>{s.vin} · {s.modelo}</Card.Description>
						</Card.Header>
						<Card.Content>
							<p class="text-sm font-medium">{s.tipo}</p>
							<p class="text-muted-foreground text-xs">{s.cliente}</p>
							{#if s.ruta !== 'pendiente'}
								<div class="mt-2 flex items-center gap-1">
									{#if s.ruta === 'interno'}
										<Wrench class="size-3 text-blue-500" /><span class="text-xs text-blue-600 font-medium">Reparación interna</span>
									{:else}
										<Building2 class="size-3 text-orange-500" /><span class="text-xs text-orange-600 font-medium">Proveedor externo</span>
									{/if}
								</div>
							{/if}
						</Card.Content>
					</Card.Root>
				</button>
			{/each}
		</div>

		<!-- Detalle -->
		<div class="lg:col-span-2">
			{#if sel}
				<Card.Root>
					<Card.Header>
						<div class="flex items-center justify-between">
							<Card.Title>{sel.id} · {sel.tipo}</Card.Title>
							<Badge variant={estadoVariant(sel.estado)} class="capitalize">{sel.estado.replace('_',' ')}</Badge>
						</div>
						<Card.Description>{sel.vin} · {sel.modelo} · {sel.cliente}</Card.Description>
					</Card.Header>
					<Card.Content class="space-y-4">
						<div>
							<Label class="text-xs text-muted-foreground">Diagnóstico</Label>
							<p class="text-sm mt-1">{sel.descripcion}</p>
						</div>

						<div class="flex items-center gap-2">
							<Camera class="size-4 text-muted-foreground" />
							<span class="text-muted-foreground text-sm">3 fotografías adjuntas</span>
							<Button size="sm" variant="outline" class="ml-auto">Ver fotos</Button>
						</div>

						<Separator />

						<!-- Comparativo interno vs externo -->
						<div class="grid grid-cols-2 gap-4">
							<Card.Root class={cn('border-2', sel.ruta === 'interno' ? 'border-blue-500' : 'border-muted')}>
								<Card.Header class="pb-2">
									<Card.Title class="text-sm flex items-center gap-2">
										<Wrench class="size-4 text-blue-500" />Reparación Interna
									</Card.Title>
								</Card.Header>
								<Card.Content class="space-y-1 text-sm">
									{#if sel.costoInterno > 0}
										<div class="flex justify-between"><span class="text-muted-foreground">Costo estimado</span><span class="font-medium tabular-nums">${sel.costoInterno.toLocaleString()}</span></div>
										<div class="flex justify-between"><span class="text-muted-foreground">Tiempo estimado</span><span class="font-medium">{sel.tiempoInterno}</span></div>
									{:else}
										<p class="text-muted-foreground text-xs">No aplica para este tipo de siniestro</p>
									{/if}
								</Card.Content>
								{#if sel.estado === 'evaluacion' && sel.costoInterno > 0}
									<Card.Footer>
										<Button class="w-full" variant="outline" onclick={() => autorizar(sel.id, 'interno')}>
											<CheckCircle class="mr-2 size-4" />Autorizar Ruta Interna
										</Button>
									</Card.Footer>
								{/if}
							</Card.Root>

							<Card.Root class={cn('border-2', sel.ruta === 'externo' ? 'border-orange-500' : 'border-muted')}>
								<Card.Header class="pb-2">
									<Card.Title class="text-sm flex items-center gap-2">
										<Building2 class="size-4 text-orange-500" />Proveedor Externo
									</Card.Title>
								</Card.Header>
								<Card.Content class="space-y-1 text-sm">
									{#if sel.costoExterno > 0}
										<div class="flex justify-between"><span class="text-muted-foreground">Costo estimado</span><span class="font-medium tabular-nums">${sel.costoExterno.toLocaleString()}</span></div>
										<div class="flex justify-between"><span class="text-muted-foreground">Tiempo estimado</span><span class="font-medium">{sel.tiempoExterno}</span></div>
										{#if sel.proveedor}<div class="flex justify-between"><span class="text-muted-foreground">Proveedor</span><span class="font-medium">{sel.proveedor}</span></div>{/if}
									{:else}
										<p class="text-muted-foreground text-xs">No aplica para este tipo de siniestro</p>
									{/if}
								</Card.Content>
								{#if sel.estado === 'evaluacion' && sel.costoExterno > 0}
									<Card.Footer>
										<Button class="w-full" variant="outline" onclick={() => autorizar(sel.id, 'externo')}>
											<CheckCircle class="mr-2 size-4" />Autorizar Ruta Externa
										</Button>
									</Card.Footer>
								{/if}
							</Card.Root>
						</div>

						{#if sel.justificacion}
							<div>
								<Label class="text-xs text-muted-foreground">Justificación de la autorización</Label>
								<p class="text-sm mt-1 italic text-muted-foreground">{sel.justificacion}</p>
							</div>
						{/if}

						{#if sel.ruta === 'interno' && sel.estado === 'autorizado'}
							<Button class="w-full" onclick={() => toast.info('TOT/OP interna generada', { description: 'OP-2025-0847 creada en planta · VIN ' + sel.vin })}>
								<ArrowRight class="mr-2 size-4" />Generar OP Interna (TOT)
							</Button>
						{/if}
					</Card.Content>
				</Card.Root>
			{:else}
				<Card.Root class="flex min-h-48 items-center justify-center">
					<p class="text-muted-foreground text-sm">Selecciona un siniestro para ver el detalle</p>
				</Card.Root>
			{/if}
		</div>
	</div>
</div>
