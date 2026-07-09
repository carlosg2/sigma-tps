<script lang="ts">
	import { cn } from '$lib/utils.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import { toast } from 'svelte-sonner';
	import Check from '@lucide/svelte/icons/check';
	import Play from '@lucide/svelte/icons/play';
	import Pause from '@lucide/svelte/icons/pause';
	import CircleCheck from '@lucide/svelte/icons/circle-check';
	import User from '@lucide/svelte/icons/user';
	import Zap from '@lucide/svelte/icons/zap';
	import Bell from '@lucide/svelte/icons/bell';
	import Clock from '@lucide/svelte/icons/clock';
	import Tablet from '@lucide/svelte/icons/tablet';

	type TareaEstado = 'pendiente' | 'en_proceso' | 'pausada' | 'completada';
	type Tarea = {
		id: string; folio: string; vin: string; modelo: string;
		proceso: string; frontera: string;
		estado: TareaEstado; hrsAcum: number; hrsEst: number;
		inicio?: string;
	};

	// Simulación de login del operador
	let operadorId = $state<string | null>(null);
	let operadorNombre = $state('');

	const operadores = [
		{ id: 'OP-01', nombre: 'J. Martínez' },
		{ id: 'OP-02', nombre: 'R. González' },
		{ id: 'OP-03', nombre: 'A. López' }
	];

	let tareas = $state<Tarea[]>([
		{ id: 'T-001', folio: 'OP-2025-0891', vin: 'VIN-P1-0891', modelo: 'Suburban 2024', proceso: 'Blindaje — Instalación placas laterales', frontera: 'Blindaje', estado: 'pendiente', hrsAcum: 0, hrsEst: 8 },
		{ id: 'T-002', folio: 'OP-2025-0892', vin: 'VIN-P1-0892', modelo: 'Tahoe 2023', proceso: 'Armado — Instalación cristales', frontera: 'Armado', estado: 'en_proceso', hrsAcum: 3.5, hrsEst: 6, inicio: '08:30' },
		{ id: 'T-003', folio: 'OP-2025-0893', vin: 'VIN-P1-0893', modelo: 'Land Cruiser', proceso: 'Desarmado — Preparación carrocería', frontera: 'Desarmado', estado: 'pausada', hrsAcum: 1.2, hrsEst: 3 },
	]);

	function iniciar(id: string) {
		tareas = tareas.map(t => t.id === id ? { ...t, estado: 'en_proceso', inicio: new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }) } : t);
		toast.success('Tarea iniciada', { description: `Cronómetro corriendo · ${tareas.find(t=>t.id===id)?.proceso}` });
	}

	function pausar(id: string) {
		tareas = tareas.map(t => t.id === id ? { ...t, estado: 'pausada' } : t);
		toast.info('Tarea pausada', { description: 'Registra el motivo del paro técnico en el campo de comentarios.' });
	}

	function completar(id: string) {
		const t = tareas.find(t => t.id === id)!;
		tareas = tareas.map(t => t.id === id ? { ...t, estado: 'completada' } : t);
		toast.success(`Frontera "${t.frontera}" cerrada`, {
			description: `Almacén notificado para surtir el siguiente kit · Calidad convocada para inspección`
		});
	}

	function solicitarLiberacion(id: string) {
		const t = tareas.find(t => t.id === id)!;
		toast.info('Notificación enviada a Calidad', { description: `"${t.proceso}" listo para inspección · ${t.folio}` });
	}

	function estadoColor(e: TareaEstado) {
		if (e === 'completada') return 'border-emerald-500/50 bg-emerald-50/30';
		if (e === 'en_proceso') return 'border-primary/50 bg-primary/5';
		if (e === 'pausada') return 'border-yellow-500/50 bg-yellow-50/30';
		return 'border-muted';
	}
</script>

<div class="flex flex-col gap-6">
	<div class="flex flex-wrap items-center justify-between gap-3">
		<div class="flex items-center gap-2">
			<Tablet class="size-5" />
			<div>
				<h2 class="text-xl font-semibold">Kiosco — Marcaje en Tiempo Real</h2>
				<p class="text-muted-foreground text-sm">3 toques máximo · Optimizado para tablet en piso de producción</p>
			</div>
		</div>
		<Badge variant="outline" class="font-mono">GAP-PRD-001</Badge>
	</div>

	<!-- Identificación del operador (Toque 1) -->
	{#if !operadorId}
		<Card.Root>
			<Card.Header><Card.Title>¿Quién eres?</Card.Title><Card.Description>Toque 1 de 3 — Selecciona tu nombre para ver tus tareas</Card.Description></Card.Header>
			<Card.Content>
				<div class="grid gap-3 sm:grid-cols-3">
					{#each operadores as op}
						<Button class="h-16 text-base" variant="outline" onclick={() => { operadorId = op.id; operadorNombre = op.nombre; }}>
							<User class="mr-2 size-5" />{op.nombre}
						</Button>
					{/each}
				</div>
			</Card.Content>
		</Card.Root>
	{:else}
		<!-- Operador identificado -->
		<Card.Root>
			<Card.Content class="flex items-center justify-between pt-4">
				<div class="flex items-center gap-2">
					<div class="bg-primary/10 flex size-10 items-center justify-center rounded-full">
						<User class="text-primary size-5" />
					</div>
					<div>
						<p class="font-semibold">{operadorNombre}</p>
						<p class="text-muted-foreground text-xs">{operadorId} · Planta 1</p>
					</div>
				</div>
				<Button variant="ghost" size="sm" onclick={() => { operadorId = null; operadorNombre = ''; }}>Cambiar</Button>
			</Card.Content>
		</Card.Root>

		<!-- Tareas (Toque 2 = seleccionar, Toque 3 = iniciar/completar) -->
		<div class="grid gap-4">
			{#each tareas as t (t.id)}
				<Card.Root class={estadoColor(t.estado)}>
					<Card.Content class="pt-4 space-y-3">
						<div class="flex items-start justify-between gap-3">
							<div>
								<div class="flex items-center gap-2">
									<Badge variant="outline" class="font-mono text-xs">{t.folio}</Badge>
									<Badge variant="outline" class="text-xs">{t.frontera}</Badge>
								</div>
								<p class="text-base font-semibold mt-1">{t.proceso}</p>
								<p class="text-muted-foreground text-sm">{t.vin} · {t.modelo}</p>
							</div>
							<div class="text-right">
								<p class="tabular-nums text-sm font-medium">{t.hrsAcum.toFixed(1)} / {t.hrsEst} hrs</p>
								{#if t.inicio}<p class="text-muted-foreground text-xs flex items-center gap-1 justify-end"><Clock class="size-3" />Desde {t.inicio}</p>{/if}
							</div>
						</div>

						<!-- Barra de progreso -->
						<div class="h-2 w-full rounded-full bg-muted overflow-hidden">
							<div class="h-full rounded-full bg-primary transition-all" style="width:{Math.min(Math.round((t.hrsAcum/t.hrsEst)*100), 100)}%"></div>
						</div>

						<!-- Acciones — máx 1 toque -->
						<div class="flex gap-2">
							{#if t.estado === 'pendiente'}
								<Button class="flex-1 h-14 text-base" onclick={() => iniciar(t.id)}>
									<Play class="mr-2 size-5" />INICIAR
								</Button>
							{:else if t.estado === 'en_proceso'}
								<Button variant="outline" class="flex-1 h-14" onclick={() => pausar(t.id)}>
									<Pause class="mr-2 size-5" />PAUSAR
								</Button>
								<Button class="flex-1 h-14 text-base" onclick={() => completar(t.id)}>
									<CircleCheck class="mr-2 size-5" />COMPLETAR
								</Button>
							{:else if t.estado === 'pausada'}
								<Button class="flex-1 h-14" onclick={() => iniciar(t.id)}>
									<Play class="mr-2 size-5" />REANUDAR
								</Button>
							{:else if t.estado === 'completada'}
								<div class="flex-1 flex items-center justify-center gap-2 rounded-lg border border-emerald-500/50 bg-emerald-50/40 h-14">
									<CircleCheck class="size-5 text-emerald-500" />
									<span class="text-emerald-700 font-medium">Completada</span>
								</div>
								<Button variant="outline" class="h-14" onclick={() => solicitarLiberacion(t.id)}>
									<Bell class="mr-2 size-4" />Llamar a Calidad
								</Button>
							{/if}
						</div>
					</Card.Content>
				</Card.Root>
			{/each}
		</div>
	{/if}
</div>
