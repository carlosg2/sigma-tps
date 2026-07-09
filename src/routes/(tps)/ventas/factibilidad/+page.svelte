<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Table from '$lib/components/ui/table/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import { Textarea } from '$lib/components/ui/textarea/index.js';
	import { toast } from 'svelte-sonner';
	import { cn } from '$lib/utils.js';
	import Search from '@lucide/svelte/icons/search';
	import CheckCircle from '@lucide/svelte/icons/check-circle';
	import XCircle from '@lucide/svelte/icons/circle-x';
	import Clock from '@lucide/svelte/icons/clock';
	import Shield from '@lucide/svelte/icons/shield';
	import AlertTriangle from '@lucide/svelte/icons/triangle-alert';

	type Estado = 'pendiente' | 'factible' | 'no_factible' | 'factible_restricciones';
	type CheckFact = {
		id: string; modelo: string; nivel: string; solicitante: string;
		cotizacion: string; fechaSol: string; estado: Estado;
		respuesta?: string; responsable?: string; fechaResp?: string;
		historial: boolean; // true = ya respondida antes para esta combinación
	};

	let checks = $state<CheckFact[]>([
		{ id: 'CF-001', modelo: 'Land Cruiser 2024', nivel: 'B7', solicitante: 'L. Medina (Ventas)', cotizacion: 'COT-2025-0241', fechaSol: '2025-06-20', estado: 'pendiente', historial: false },
		{ id: 'CF-002', modelo: 'Navigator 2024', nivel: 'B6+', solicitante: 'R. Torres (Ventas)', cotizacion: 'COT-2025-0238', fechaSol: '2025-06-19', estado: 'factible', respuesta: 'El Navigator 2024 soporta el blindaje B6+ estándar. Se requiere refuerzo de muelles traseros incluido en la propuesta.', responsable: 'M. Jiménez (Ingeniería)', fechaResp: '2025-06-20', historial: false },
		{ id: 'CF-003', modelo: 'Ram 1500 2024', nivel: 'B6', solicitante: 'P. Garza (Ventas)', cotizacion: 'COT-2025-0235', fechaSol: '2025-06-17', estado: 'factible_restricciones', respuesta: 'Factible con restricciones: el Ram 1500 en carrocería corta requiere reubicar la batería auxiliar. Tiempo adicional estimado: +5 días hábiles.', responsable: 'A. Flores (Ingeniería)', fechaResp: '2025-06-18', historial: false },
		{ id: 'CF-004', modelo: 'Suburban 2024', nivel: 'B6', solicitante: 'Sistema', cotizacion: '—', fechaSol: '2025-05-10', estado: 'factible', respuesta: 'Combinación estándar validada. Aplica para todos los Suburban 2024.', responsable: 'Ingeniería', fechaResp: '2025-05-11', historial: true }
	]);

	let selId = $state<string | null>(null);
	const sel = $derived(checks.find(c => c.id === selId));
	let respuesta = $state('');
	let estadoResp = $state<Estado>('factible');

	function responder(id: string) {
		checks = checks.map(c => c.id === id ? { ...c, estado: estadoResp, respuesta, responsable: 'M. Jiménez (Ingeniería)', fechaResp: new Date().toLocaleDateString('es-MX') } : c);
		toast.success('Respuesta de factibilidad registrada', { description: `${id} · Estado: ${estadoResp} · Vendedor notificado automáticamente` });
		selId = null;
		respuesta = '';
	}

	function estadoVariant(e: Estado): 'secondary' | 'destructive' | 'outline' | 'default' {
		if (e === 'factible') return 'secondary';
		if (e === 'no_factible') return 'destructive';
		if (e === 'factible_restricciones') return 'outline';
		return 'default';
	}
	function estadoLabel(e: Estado) {
		if (e === 'factible') return 'Factible';
		if (e === 'no_factible') return 'No Factible';
		if (e === 'factible_restricciones') return 'Factible c/Restricciones';
		return 'Pendiente';
	}
</script>

<div class="flex flex-col gap-6">
	<div class="flex flex-wrap items-center justify-between gap-3">
		<div>
			<h2 class="text-xl font-semibold">Check de Factibilidad Técnica</h2>
			<p class="text-muted-foreground text-sm">Validación de Ingeniería para modelos exóticos o niveles especiales · GAP-VTA-002 + GAP-VTA-002</p>
		</div>
		<Badge variant="outline" class="font-mono">GAP-VTA-002</Badge>
	</div>

	<!-- Pendientes -->
	{#if checks.filter(c => c.estado === 'pendiente').length > 0}
		<Card.Root class="border-yellow-500/40">
			<Card.Header class="pb-2">
				<Card.Title class="flex items-center gap-2 text-sm text-yellow-800">
						<Clock class="size-4 text-yellow-600" />{checks.filter(c => c.estado === 'pendiente').length} consulta(s) pendiente(s) de respuesta
				</Card.Title>
				<Card.Description>Las cotizaciones ligadas no pueden avanzar a pedido hasta recibir respuesta.</Card.Description>
			</Card.Header>
		</Card.Root>
	{/if}

	<div class="grid gap-6 lg:grid-cols-5">
		<!-- Lista -->
		<div class="space-y-3 lg:col-span-2">
			{#each checks as c (c.id)}
				<button class="w-full text-left" onclick={() => (selId = selId === c.id ? null : c.id)}>
					<Card.Root class={cn('transition-shadow hover:shadow-md', selId === c.id && 'ring-2 ring-primary', c.historial && 'opacity-60')}>
						<Card.Header class="pb-2">
							<div class="flex items-center justify-between">
								<span class="font-mono text-xs">{c.id}</span>
								<Badge variant={estadoVariant(c.estado)} class="text-xs">{estadoLabel(c.estado)}</Badge>
							</div>
						</Card.Header>
						<Card.Content>
							<p class="font-medium text-sm">{c.modelo}</p>
							<div class="flex items-center gap-2 mt-1">
								<Shield class="size-3 text-muted-foreground" />
								<span class="text-muted-foreground text-xs">Nivel {c.nivel}</span>
								{#if c.historial}<Badge variant="outline" class="text-[10px]">Historial</Badge>{/if}
							</div>
							<p class="text-muted-foreground text-xs mt-1">{c.solicitante} · {c.fechaSol}</p>
						</Card.Content>
					</Card.Root>
				</button>
			{/each}
		</div>

		<!-- Detalle / respuesta -->
		<div class="lg:col-span-3">
			{#if sel}
				<Card.Root>
					<Card.Header>
						<Card.Title>{sel.id} · {sel.modelo} {sel.nivel}</Card.Title>
						<Card.Description>Solicitado por {sel.solicitante} · Cotización {sel.cotizacion} · {sel.fechaSol}</Card.Description>
					</Card.Header>
					<Card.Content class="space-y-4">
						{#if sel.estado === 'pendiente'}
							<!-- Formulario de respuesta -->
							<div class="space-y-3">
								<div>
									<Label>Resultado de la evaluación</Label>
									<div class="mt-1 flex gap-2 flex-wrap">
										{#each [['factible','Factible'], ['factible_restricciones','Factible c/Restricciones'], ['no_factible','No Factible']] as [v, l]}
											<Button size="sm" variant={estadoResp===v?'default':'outline'} onclick={()=>(estadoResp=v as Estado)}>{l}</Button>
										{/each}
									</div>
								</div>
								<div>
									<Label>Comentarios y documentación de soporte</Label>
									<Textarea bind:value={respuesta} placeholder="Indicar si el vehículo soporta el peso, restricciones, ajustes necesarios, documentos adjuntos…" class="min-h-24 mt-1" />
								</div>
								<Button class="w-full" disabled={!respuesta.trim()} onclick={() => responder(sel.id)}>
									<CheckCircle class="mr-2 size-4" />Registrar Respuesta y Notificar a Ventas
								</Button>
							</div>
						{:else}
							<!-- Respuesta registrada -->
							<div class={cn('rounded-md border p-4', sel.estado === 'factible' ? 'border-emerald-500/50 bg-emerald-50/30' : sel.estado === 'no_factible' ? 'border-destructive/50 bg-destructive/5' : 'border-yellow-500/50 bg-yellow-50/30')}>
								<div class="flex items-center gap-2 mb-2">
									{#if sel.estado === 'factible'}
										<CheckCircle class="size-5 text-emerald-500" />
										<span class="font-semibold text-emerald-700">Factible</span>
									{:else if sel.estado === 'no_factible'}
										<XCircle class="size-5 text-destructive" />
										<span class="font-semibold text-destructive">No Factible</span>
									{:else}
										<AlertTriangle class="size-5 text-yellow-600" />
										<span class="font-semibold text-yellow-700">Factible con Restricciones</span>
									{/if}
								</div>
								<p class="text-sm">{sel.respuesta}</p>
								<p class="text-muted-foreground text-xs mt-2">{sel.responsable} · {sel.fechaResp}</p>
							</div>
						{/if}
					</Card.Content>
				</Card.Root>
			{:else}
				<Card.Root class="flex min-h-48 items-center justify-center">
					<p class="text-muted-foreground text-sm">Selecciona una consulta para ver el detalle o responder</p>
				</Card.Root>
			{/if}
		</div>
	</div>
</div>
