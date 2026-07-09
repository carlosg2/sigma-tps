<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Table from '$lib/components/ui/table/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import * as Tabs from '$lib/components/ui/tabs/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import { Textarea } from '$lib/components/ui/textarea/index.js';
	import { toast } from 'svelte-sonner';
	import { cn } from '$lib/utils.js';
	import Plus from '@lucide/svelte/icons/circle-plus';
	import Shield from '@lucide/svelte/icons/shield';
	import Car from '@lucide/svelte/icons/car';
	import FileText from '@lucide/svelte/icons/file-text';
	import Send from '@lucide/svelte/icons/send';
	import Lock from '@lucide/svelte/icons/lock';
	import Check from '@lucide/svelte/icons/check';
	import AlertTriangle from '@lucide/svelte/icons/triangle-alert';

	// Catálogo de productos
	const modelos = ['Suburban 2024', 'Tahoe 2023', 'Land Cruiser 2024', 'Ram 1500 2024', 'Expedition 2022', 'Navigator 2024'];
	const niveles = ['B4', 'B6', 'B6+', 'B7'];
	const preciosBlindaje: Record<string, number> = { B4: 480_000, B6: 780_000, 'B6+': 1_180_000, B7: 1_680_000 };
	const preciosVehiculo: Record<string, number> = {
		'Suburban 2024': 1_420_000, 'Tahoe 2023': 1_180_000, 'Land Cruiser 2024': 1_680_000,
		'Ram 1500 2024': 780_000, 'Expedition 2022': 980_000, 'Navigator 2024': 1_280_000
	};

	const clientes = [
		{ id: 'CLI-001', nombre: 'Constructora del Norte SA', rfc: 'CNS810304HK1' },
		{ id: 'CLI-002', nombre: 'Seguridad Privada Noreste', rfc: 'SPN920714MG2' },
		{ id: 'CLI-003', nombre: 'Grupo Industrial GR', rfc: 'GIG030219AB3' },
		{ id: 'CLI-004', nombre: 'Empresa Minera Nacional', rfc: 'EMN980522JK4' }
	];

	// Inventario en stock
	const inventario = [
		{ vin: 'VIN-PT-001', modelo: 'Suburban 2024', nivel: 'B6', estado: 'Producto Terminado', disponible: true },
		{ vin: 'VIN-PT-002', modelo: 'Tahoe 2023', nivel: 'B6+', estado: 'Producto Terminado', disponible: true },
		{ vin: 'VIN-WIP-003', modelo: 'Land Cruiser 2024', nivel: 'B7', estado: 'En línea de producción', disponible: false }
	];

	// Estado del cotizador
	let clienteId = $state('CLI-001');
	let modeloSel = $state('Suburban 2024');
	let nivelSel = $state<string>('B6');
	let modalidad = $state<'tps' | 'cliente'>('tps');
	let valorComercial = $state('');
	let descuento = $state(0);
	let diasEntrega = $state(60);
	let version = $state(1);
	let enviando = $state(false);
	let cotCreada = $state(false);
	let bloqueadoDescuento = $state(false);
	let checkFact = $state<'pendiente' | 'factible' | 'no_factible' | null>(null);

	const precioBase = $derived((preciosVehiculo[modeloSel] ?? 0) + (preciosBlindaje[nivelSel] ?? 0));
	const precioConDescuento = $derived(Math.round(precioBase * (1 - descuento / 100)));
	const margenAlerta = $derived(descuento > 8);
	const tiempoAlerta = $derived(diasEntrega < 45);

	// Inventario match
	const unidadStock = $derived(inventario.find(i => i.modelo === modeloSel && i.nivel === nivelSel && i.disponible));

	function aplicarDescuento(v: number) {
		descuento = v;
		if (v > 8) {
			bloqueadoDescuento = true;
			toast.warning('Descuento requiere autorización', { description: 'Se enviará notificación al Gerente Comercial para aprobación.' });
		} else {
			bloqueadoDescuento = false;
		}
	}

	function enviarCotizacion() {
		enviando = true;
		setTimeout(() => {
			enviando = false;
			cotCreada = true;
			version += 1;
			toast.success(`Cotización COT-2025-0${248 + version} v${version} generada`, {
				description: `${clientes.find(c=>c.id===clienteId)?.nombre} · ${modeloSel} ${nivelSel} · $${precioConDescuento.toLocaleString()}`
			});
		}, 1400);
	}

	function solicitarFactibilidad() {
		checkFact = 'pendiente';
		toast.info('Check de Factibilidad enviado a Ingeniería', { description: `${modeloSel} + ${nivelSel} · Respuesta estimada en 24-48 hrs` });
	}

	// Modelos "exóticos" que requieren check
	const requiereCheck = $derived(['Land Cruiser 2024', 'Navigator 2024'].includes(modeloSel) && nivelSel === 'B7');
</script>

<div class="flex flex-col gap-6">
	<div class="flex flex-wrap items-center justify-between gap-3">
		<div>
			<h2 class="text-xl font-semibold">Cotizador de Ventas</h2>
			<p class="text-muted-foreground text-sm">Partidas Vehículo + Blindaje · Versionado automático · Workflow de autorizaciones</p>
		</div>
		<div class="flex items-center gap-2">
			<Badge variant="outline" class="font-mono">GAP-VTA-001</Badge>
			{#if cotCreada}<Badge variant="secondary" class="font-mono">v{version} guardada</Badge>{/if}
		</div>
	</div>

	<div class="grid gap-6 lg:grid-cols-3">
		<!-- Formulario -->
		<div class="space-y-4 lg:col-span-2">
			<!-- Cliente -->
			<Card.Root>
				<Card.Header><Card.Title class="text-sm">Cliente</Card.Title></Card.Header>
				<Card.Content>
					<Select.Root type="single" bind:value={clienteId}>
						<Select.Trigger>{clientes.find(c=>c.id===clienteId)?.nombre ?? 'Seleccionar cliente'}</Select.Trigger>
						<Select.Content>
							{#each clientes as c}<Select.Item value={c.id}>{c.nombre}</Select.Item>{/each}
						</Select.Content>
					</Select.Root>
				</Card.Content>
			</Card.Root>

			<!-- Partida: Vehículo + Blindaje -->
			<Card.Root>
				<Card.Header><Card.Title class="text-sm">Partida — Vehículo + Blindaje</Card.Title></Card.Header>
				<Card.Content class="grid gap-4 sm:grid-cols-2">
					<div>
						<Label>Modalidad</Label>
						<div class="mt-1 flex gap-2">
							<Button size="sm" variant={modalidad==='tps'?'default':'outline'} onclick={()=>(modalidad='tps')}>Unidad TPS Stock</Button>
							<Button size="sm" variant={modalidad==='cliente'?'default':'outline'} onclick={()=>(modalidad='cliente')}>Unidad del Cliente</Button>
						</div>
					</div>
					<div>
						<Label>Modelo</Label>
							<Select.Root type="single" bind:value={modeloSel}>
							<Select.Trigger>{modeloSel}</Select.Trigger>
							<Select.Content>{#each modelos as m}<Select.Item value={m}>{m}</Select.Item>{/each}</Select.Content>
						</Select.Root>
					</div>
					<div>
						<Label>Nivel de Blindaje</Label>
						<div class="mt-1 flex gap-2 flex-wrap">
							{#each niveles as n}
								<Button size="sm" variant={nivelSel===n?'default':'outline'} onclick={()=>(nivelSel=n)}><Shield class="mr-1 size-3" />{n}</Button>
							{/each}
						</div>
					</div>
					{#if modalidad === 'cliente'}
						<div>
							<Label>Valor Comercial (para seguro traslado)</Label>
							<Input bind:value={valorComercial} placeholder="Ej. $850,000" type="text" />
						</div>
					{/if}
				</Card.Content>
			</Card.Root>

			<!-- Inventario en tiempo real -->
			{#if unidadStock}
				<Card.Root class="border-emerald-500/50">
					<Card.Content class="flex items-center gap-3 pt-4">
						<Check class="size-5 text-emerald-500" />
						<div>
							<p class="text-sm font-medium text-emerald-700">Unidad disponible en Producto Terminado</p>
							<p class="text-muted-foreground text-xs">{unidadStock.vin} · {unidadStock.estado} · Entrega inmediata</p>
						</div>
						<Button size="sm" variant="outline" class="ml-auto" onclick={() => toast.success('Unidad reservada', { description: unidadStock!.vin + ' reservado para esta cotización' })}>
							Reservar
						</Button>
					</Card.Content>
				</Card.Root>
			{/if}

			<!-- Check de factibilidad requerido -->
			{#if requiereCheck}
				<Card.Root class="border-yellow-500/50">
					<Card.Content class="pt-4">
						<div class="flex items-center gap-3">
							<AlertTriangle class="size-5 text-yellow-500" />
							<div class="flex-1">
								<p class="text-sm font-medium">Check de Factibilidad requerido</p>
								<p class="text-muted-foreground text-xs">Este modelo + nivel requiere validación técnica de Ingeniería antes de avanzar.</p>
							</div>
							{#if !checkFact}
								<Button size="sm" variant="outline" onclick={solicitarFactibilidad}>Solicitar a Ingeniería</Button>
							{:else}
								<Badge variant={checkFact === 'factible' ? 'secondary' : checkFact === 'no_factible' ? 'destructive' : 'outline'}>
									{checkFact === 'pendiente' ? 'En revisión' : checkFact}
								</Badge>
							{/if}
						</div>
					</Card.Content>
				</Card.Root>
			{/if}

			<!-- Comercial -->
			<Card.Root>
				<Card.Header><Card.Title class="text-sm">Condiciones Comerciales</Card.Title></Card.Header>
				<Card.Content class="grid gap-4 sm:grid-cols-2">
					<div>
						<Label>Descuento ({descuento}%)</Label>
						<div class="mt-2 flex items-center gap-3">
							<input type="range" min="0" max="20" step="1" bind:value={descuento} oninput={(e)=>aplicarDescuento(+e.currentTarget.value)} class="flex-1" />
							<span class="tabular-nums text-sm w-8">{descuento}%</span>
						</div>
						{#if margenAlerta}<p class="text-destructive text-xs mt-1 flex items-center gap-1"><Lock class="size-3" />Requiere autorización del Gerente Comercial</p>{/if}
					</div>
					<div>
						<Label>Días de entrega prometidos</Label>
						<Input type="number" bind:value={diasEntrega} min="30" max="180" />
						{#if tiempoAlerta}<p class="text-yellow-600 text-xs mt-1 flex items-center gap-1"><AlertTriangle class="size-3" />Por debajo del estándar — requiere autorización</p>{/if}
					</div>
				</Card.Content>
			</Card.Root>
		</div>

		<!-- Resumen y acciones -->
		<div class="space-y-4">
			<Card.Root>
				<Card.Header><Card.Title class="text-sm">Resumen de Cotización</Card.Title></Card.Header>
				<Card.Content class="space-y-3">
					<div class="space-y-2 text-sm">
						<div class="flex justify-between"><span class="text-muted-foreground">Vehículo base</span><span class="tabular-nums">${(preciosVehiculo[modeloSel]??0).toLocaleString()}</span></div>
						<div class="flex justify-between"><span class="text-muted-foreground">Blindaje {nivelSel}</span><span class="tabular-nums">${(preciosBlindaje[nivelSel]??0).toLocaleString()}</span></div>
						<Separator />
						<div class="flex justify-between font-medium"><span>Subtotal</span><span class="tabular-nums">${precioBase.toLocaleString()}</span></div>
						{#if descuento > 0}
							<div class="flex justify-between text-destructive"><span>Descuento {descuento}%</span><span class="tabular-nums">-${(precioBase - precioConDescuento).toLocaleString()}</span></div>
						{/if}
						<Separator />
						<div class="flex justify-between text-base font-bold"><span>Total</span><span class="tabular-nums">${precioConDescuento.toLocaleString()}</span></div>
					</div>

					<div class="space-y-2 text-sm text-muted-foreground border-t pt-3">
						<div class="flex justify-between"><span>Entrega estimada</span><span>{diasEntrega} días hábiles</span></div>
						<div class="flex justify-between"><span>Versión</span><span>v{version}</span></div>
					</div>
				</Card.Content>
				<Card.Footer class="flex-col gap-2">
					<Button
						class="w-full"
						disabled={enviando || bloqueadoDescuento || (requiereCheck && checkFact !== 'factible')}
						onclick={enviarCotizacion}
					>
						<Send class="mr-2 size-4" />{enviando ? 'Generando...' : 'Generar Cotización PDF'}
					</Button>
					{#if bloqueadoDescuento}
						<p class="text-muted-foreground text-xs text-center">Bloqueado: descuento mayor al 8% requiere aprobación del Gerente Comercial.</p>
					{/if}
					{#if requiereCheck && checkFact !== 'factible'}
						<p class="text-muted-foreground text-xs text-center">Bloqueado: Check de Factibilidad con Ingeniería pendiente.</p>
					{/if}
				</Card.Footer>
			</Card.Root>

			<!-- Historial versiones -->
			{#if version > 1}
				<Card.Root>
					<Card.Header><Card.Title class="text-sm">Versiones Guardadas</Card.Title></Card.Header>
					<Card.Content>
						{#each Array.from({length: version - 1}, (_, i) => i + 1) as v}
							<div class="flex items-center justify-between py-1 text-sm">
								<span class="text-muted-foreground">v{v} · {new Date().toLocaleDateString('es-MX')}</span>
								<Button variant="ghost" size="sm" class="h-6 text-xs">Ver</Button>
							</div>
						{/each}
					</Card.Content>
				</Card.Root>
			{/if}
		</div>
	</div>
</div>
