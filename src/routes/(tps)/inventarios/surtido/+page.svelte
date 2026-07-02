<script lang="ts">
	import { useInventariosStore } from '$lib/tps/inventarios/store.svelte.js';
	import type { SurtidoPrioridad, LmatMatStatus, SurtidoEstatus } from '$lib/tps/inventarios/types.js';
	import StatCard from '$lib/tps/components/stat-card.svelte';
	import StatusBadge from '$lib/tps/components/status-badge.svelte';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Table from '$lib/components/ui/table/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import * as Alert from '$lib/components/ui/alert/index.js';
	import * as Item from '$lib/components/ui/item/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import { Textarea } from '$lib/components/ui/textarea/index.js';
	import { Progress } from '$lib/components/ui/progress/index.js';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import { toast } from 'svelte-sonner';
	import Clock from '@lucide/svelte/icons/clock';
	import Play from '@lucide/svelte/icons/play';
	import PackageCheck from '@lucide/svelte/icons/package-check';
	import Car from '@lucide/svelte/icons/car';
	import MapPin from '@lucide/svelte/icons/map-pin';
	import ScanLine from '@lucide/svelte/icons/scan-line';
	import Check from '@lucide/svelte/icons/check';
	import TriangleAlert from '@lucide/svelte/icons/triangle-alert';
	import ClipboardList from '@lucide/svelte/icons/clipboard-list';
	import CircleCheckBig from '@lucide/svelte/icons/circle-check-big';
	import Loader from '@lucide/svelte/icons/loader-circle';
	import ArrowRight from '@lucide/svelte/icons/arrow-right';

	const store = useInventariosStore();
	const data = $derived(store.state);

	const PRIORIDAD_COLORS: Record<SurtidoPrioridad, string> = {
		Alta: 'bg-destructive/15 text-destructive',
		Media: 'bg-chart-4/15 text-chart-4',
		Baja: 'bg-emerald-500/15 text-emerald-400'
	};

	const ESTATUS_COLORS: Record<SurtidoEstatus, string> = {
		pendiente: 'bg-chart-4/15 text-chart-4',
		proceso: 'bg-primary/15 text-primary',
		completado: 'bg-emerald-500/15 text-emerald-400'
	};

	const ESTATUS_LABELS: Record<SurtidoEstatus, string> = {
		pendiente: 'Pendiente',
		proceso: 'En Proceso',
		completado: 'Completado'
	};

	const MAT_STATUS_COLORS: Record<LmatMatStatus, string> = {
		done: 'bg-emerald-500/15 text-emerald-400',
		progress: 'bg-primary/15 text-primary',
		pending: 'bg-muted-foreground/20 text-muted-foreground'
	};

	const MAT_STATUS_LABELS: Record<LmatMatStatus, string> = {
		done: 'Surtido',
		progress: 'En proceso',
		pending: 'Pendiente'
	};

	// ── Folio selection ──
	let folioId = $state('');
	const folio = $derived(folioId ? store.getLmatFolio(folioId) : undefined);
	const folioLabel = $derived(
		folio ? `${folio.id} · ${folio.vehiculoDesc.substring(0, 32)}` : '— Seleccionar Folio LMAT —'
	);
	const materialesSorted = $derived(
		folio ? [...folio.materiales].sort((a, b) => a.ubic.localeCompare(b.ubic)) : []
	);
	const progress = $derived(
		folio ? store.lmatFolioProgress(folio) : { done: 0, total: 0, pct: 0, pending: 0 }
	);

	// ── Surtido dialog ──
	let surtidoOpen = $state(false);
	let surtidoStep = $state<1 | 2 | 3>(1);
	let surtidoMatSku = $state('');
	let scanSKU = $state('');
	let currentQty = $state(1);
	let scanning = $state(false);
	let sessionScanned = $state<{ sku: string; desc: string; ubic: string; qty: number }[]>([]);

	const currentMat = $derived(materialesSorted.find((m) => m.sku === surtidoMatSku));
	const remaining = $derived(currentMat ? currentMat.solicitado - currentMat.surtido : 0);
	const qtyExceeded = $derived(currentQty > remaining);

	function iniciarSurtido(targetSku?: string) {
		if (!folio) {
			toast.warning('Selecciona un folio primero');
			return;
		}
		let sku: string | undefined;
		if (targetSku) {
			const mat = materialesSorted.find((m) => m.sku === targetSku);
			if (!mat || mat.status === 'done') {
				toast.info('Este material ya fue surtido');
				return;
			}
			sku = targetSku;
		} else {
			const first = materialesSorted.find((m) => m.status !== 'done');
			if (!first) {
				toast.success('¡Folio completado! Todos los materiales ya están surtidos.');
				return;
			}
			sku = first.sku;
		}
		surtidoMatSku = sku;
		surtidoStep = 1;
		scanSKU = '';
		currentQty = 1;
		scanning = false;
		surtidoOpen = true;
	}

	function simulateScan() {
		scanning = true;
		setTimeout(() => {
			scanSKU = currentMat?.sku ?? '';
			scanning = false;
		}, 900);
	}

	function confirmSKU() {
		if (!scanSKU.trim()) {
			toast.error('Ingresa o escanea el SKU');
			return;
		}
		if (scanSKU.trim().toUpperCase() !== currentMat?.sku) {
			toast.warning(`SKU no coincide con LMAT — esperado: ${currentMat?.sku}`);
		}
		currentQty = Math.min(1, remaining);
		surtidoStep = 2;
	}

	function changeQty(delta: number) {
		const next = currentQty + delta;
		if (next < 1) return;
		currentQty = next;
	}

	function confirmSurtido() {
		if (!folio || !currentMat || qtyExceeded) return;
		store.surtirLmatMaterial(folio.id, currentMat.sku, currentQty);
		sessionScanned = [
			{ sku: currentMat.sku, desc: currentMat.desc, ubic: currentMat.ubic, qty: currentQty },
			...sessionScanned
		];
		toast.success(`${currentMat.sku} · ${currentQty} pzas. surtidas`);
		surtidoStep = 3;
	}

	function nextMaterial() {
		if (!folio) return;
		const currentIdx = materialesSorted.findIndex((m) => m.sku === surtidoMatSku);
		const nextMat =
			materialesSorted.find((m, i) => i > currentIdx && m.status !== 'done') ??
			materialesSorted.find((m) => m.status !== 'done');
		if (!nextMat) {
			toast.success('¡Todos los materiales del folio fueron surtidos!');
			surtidoOpen = false;
			return;
		}
		surtidoMatSku = nextMat.sku;
		surtidoStep = 1;
		scanSKU = '';
		currentQty = 1;
		scanning = false;
	}

	// ── Error dialog ──
	type ErrorTipo = '' | 'sku-incorrecto' | 'punto-faltante' | 'codigo-inexistente';
	const ERROR_TYPES: { id: ErrorTipo; label: string; desc: string }[] = [
		{ id: 'sku-incorrecto', label: 'SKU incorrecto', desc: 'El código no corresponde al material físico en almacén' },
		{ id: 'punto-faltante', label: 'Punto faltante en LMAT', desc: 'Un material requerido no aparece en la lista del folio' },
		{ id: 'codigo-inexistente', label: 'Código inexistente', desc: 'El código escaneado no existe en el catálogo del sistema' }
	];
	let errorOpen = $state(false);
	let errorTipo = $state<ErrorTipo>('');
	let errorNotes = $state('');
	let errorSubmitting = $state(false);
	let errorTicket = $state('');
	let errorDone = $state(false);

	function abrirError() {
		errorTipo = '';
		errorNotes = '';
		errorDone = false;
		errorTicket = '';
		errorOpen = true;
	}

	function submitError() {
		if (!errorTipo) {
			toast.error('Selecciona el tipo de error');
			return;
		}
		errorSubmitting = true;
		setTimeout(() => {
			const num = String(Math.floor(1000 + Math.random() * 8999));
			errorTicket = `ENG-${new Date().getFullYear()}-${num}`;
			errorSubmitting = false;
			errorDone = true;
			toast.success(`Ticket ${errorTicket} generado y escalado a Ingeniería`);
		}, 1600);
	}
</script>

<div class="flex flex-col gap-6">
	<!-- Cabecero -->
	<div class="flex flex-wrap items-center justify-between gap-3">
		<div>
			<h2 class="text-xl font-semibold">Surtido de Materiales</h2>
			<p class="text-muted-foreground text-sm">Flujo de surtido por folio LMAT con ruta optimizada por ubicación</p>
		</div>
		<Badge variant="outline" class="font-mono">GAP-ALM-005</Badge>
	</div>

	<!-- KPIs -->
	<div
		class="grid grid-cols-1 gap-4 @xl/main:grid-cols-3 **:data-[slot=card]:from-primary/5 **:data-[slot=card]:to-card **:data-[slot=card]:bg-linear-to-t **:data-[slot=card]:shadow-xs dark:**:data-[slot=card]:bg-card"
	>
		<StatCard label="Folios Pendientes" value={store.lmatPendientes} subtitle="Sin iniciar" icon={Clock} />
		<StatCard label="En Proceso" value={store.lmatEnProceso} subtitle="Surtido activo" icon={Play} />
		<StatCard label="Completados" value={store.lmatCompletados} subtitle="Hoy" icon={PackageCheck} />
	</div>

	<!-- Selector + acciones -->
	<div class="flex flex-wrap items-center gap-2">
		<Select.Root type="single" bind:value={folioId}>
			<Select.Trigger class="w-72">{folioLabel}</Select.Trigger>
			<Select.Content>
				{#each data.lmatFolios as f (f.id)}
					<Select.Item value={f.id}>
						{f.id} · {f.vehiculoDesc.substring(0, 34)}
					</Select.Item>
				{/each}
			</Select.Content>
		</Select.Root>
		<Button onclick={() => iniciarSurtido()} disabled={!folio || folio.estatus === 'completado'}>
			<Play data-icon="inline-start" /> Iniciar Surtido
		</Button>
		<Button variant="outline" onclick={abrirError}>
			<TriangleAlert data-icon="inline-start" /> Reportar Error
		</Button>
	</div>

	{#if folio}
		<!-- Info del folio -->
		<Card.Root>
			<Card.Header>
				<Card.Title class="flex items-center gap-2">
					<Car class="size-4" />
					{folio.vehiculoDesc}
				</Card.Title>
				<Card.Description>{folio.vehiculo} · {folio.linea} · {folio.maquina}</Card.Description>
				<Card.Action class="flex items-center gap-2">
					<StatusBadge label={`Prio. ${folio.prioridad}`} colorClass={PRIORIDAD_COLORS[folio.prioridad]} />
					<StatusBadge label={ESTATUS_LABELS[folio.estatus]} colorClass={ESTATUS_COLORS[folio.estatus]} />
				</Card.Action>
			</Card.Header>
			<Card.Content class="flex flex-col gap-3">
				<div class="flex flex-wrap gap-x-6 gap-y-1 text-sm">
					<span><span class="text-muted-foreground">Folio vehículo: </span><span class="font-mono font-semibold">{folio.folioVehiculo}</span></span>
					<span><span class="text-muted-foreground">Especificación: </span><span class="font-mono font-semibold">{folio.numEspecificacion}</span></span>
				</div>
				<div>
					<div class="mb-1 flex justify-between text-xs">
						<span class="text-muted-foreground">{progress.done} de {progress.total} materiales surtidos</span>
						<span class="font-semibold">{progress.pct}%</span>
					</div>
					<Progress value={progress.pct} class="h-2" />
				</div>
			</Card.Content>
		</Card.Root>

		<!-- Tabla + Ruta -->
		<div class="grid grid-cols-1 gap-4 lg:grid-cols-3">
			<!-- Tabla de materiales -->
			<Card.Root class="lg:col-span-2">
				<Card.Header>
					<Card.Title class="text-base">Lista de Materiales (LMAT)</Card.Title>
					<Card.Description>Ordenada por ubicación · ruta óptima de surtido</Card.Description>
				</Card.Header>
				<Card.Content class="p-0">
					<Table.Root>
						<Table.Header>
							<Table.Row>
								<Table.Head>SKU</Table.Head>
								<Table.Head>Descripción</Table.Head>
								<Table.Head>Ubic.</Table.Head>
								<Table.Head class="text-center">Sol.</Table.Head>
								<Table.Head class="text-center">Surtido</Table.Head>
								<Table.Head class="text-center">Estado</Table.Head>
								<Table.Head class="text-right">Acción</Table.Head>
							</Table.Row>
						</Table.Header>
						<Table.Body>
							{#each materialesSorted as mat (mat.sku)}
								<Table.Row class={mat.status === 'done' ? 'opacity-50' : ''}>
									<Table.Cell class="text-primary font-mono text-xs">{mat.sku}</Table.Cell>
									<Table.Cell class="text-sm">{mat.desc}</Table.Cell>
									<Table.Cell class="font-mono text-xs font-semibold">{mat.ubic}</Table.Cell>
									<Table.Cell class="text-center tabular-nums">{mat.solicitado}</Table.Cell>
									<Table.Cell
										class="text-center tabular-nums font-semibold {mat.surtido >= mat.solicitado
											? 'text-emerald-500'
											: 'text-chart-4'}">{mat.surtido}</Table.Cell>
									<Table.Cell class="text-center">
										<StatusBadge
											label={MAT_STATUS_LABELS[mat.status]}
											colorClass={MAT_STATUS_COLORS[mat.status]}
										/>
									</Table.Cell>
									<Table.Cell class="text-right">
										{#if mat.status !== 'done'}
											<Button
												size="sm"
												variant="outline"
												onclick={() => iniciarSurtido(mat.sku)}
											>
												Surtir
											</Button>
										{:else}
											<span class="text-xs font-medium text-emerald-500">✓ Listo</span>
										{/if}
									</Table.Cell>
								</Table.Row>
							{/each}
						</Table.Body>
					</Table.Root>
				</Card.Content>
			</Card.Root>

			<!-- Sidebar derecho -->
			<div class="flex flex-col gap-4">
				<!-- Ruta de surtido -->
				<Card.Root>
					<Card.Header>
						<Card.Title class="flex items-center gap-2 text-base">
							<MapPin class="size-4" /> Ruta de Surtido
						</Card.Title>
						<Card.Description>Secuencia por ubicación</Card.Description>
					</Card.Header>
					<Card.Content class="flex flex-col gap-1">
						{#each materialesSorted as mat, i (mat.sku)}
							<div
								class="flex items-center gap-2 rounded px-2 py-1.5 text-xs {mat.status === 'done'
									? 'opacity-40'
									: mat.status === 'progress'
										? 'bg-primary/8'
										: 'bg-muted/50'}"
							>
								<span class="min-w-14 font-mono font-bold text-primary">{mat.ubic}</span>
								<span class="flex-1 truncate text-muted-foreground">{mat.sku}</span>
								{#if mat.status === 'done'}
									<Check class="size-3.5 shrink-0 text-emerald-500" />
								{:else if mat.status === 'progress'}
									<span class="size-2 shrink-0 rounded-full bg-primary"></span>
								{:else}
									<span class="size-2 shrink-0 rounded-full bg-chart-4/40"></span>
								{/if}
							</div>
						{/each}
					</Card.Content>
				</Card.Root>

				<!-- Escaneados en sesión -->
				{#if sessionScanned.length > 0}
					<Card.Root>
						<Card.Header>
							<Card.Title class="text-base">Escaneados en sesión</Card.Title>
							<Card.Description>{sessionScanned.length} movimiento(s)</Card.Description>
						</Card.Header>
						<Card.Content>
							<Item.Group>
								{#each sessionScanned as s (s.sku + s.qty)}
									<Item.Root size="xs" variant="outline">
										<Item.Media variant="icon" class="bg-emerald-500/10">
											<PackageCheck class="text-emerald-500" />
										</Item.Media>
										<Item.Content>
											<Item.Title class="font-mono text-xs">{s.sku}</Item.Title>
											<Item.Description class="truncate">{s.desc}</Item.Description>
										</Item.Content>
										<Item.Actions>
											<span class="font-bold tabular-nums text-emerald-500">{s.qty}</span>
											<span class="text-muted-foreground text-xs">pzas</span>
										</Item.Actions>
									</Item.Root>
								{/each}
							</Item.Group>
						</Card.Content>
					</Card.Root>
				{/if}
			</div>
		</div>
	{:else}
		<!-- Estado vacío -->
		<Card.Root>
			<Card.Content class="flex flex-col items-center justify-center gap-3 py-16 text-center">
				<ClipboardList class="text-muted-foreground/30 size-12" />
				<p class="text-muted-foreground text-sm">Selecciona un folio LMAT para ver los materiales y comenzar el surtido</p>
			</Card.Content>
		</Card.Root>
	{/if}
</div>

<!-- ── DIALOG: FLUJO DE SURTIDO ── -->
<Dialog.Root bind:open={surtidoOpen}>
	<Dialog.Content class="sm:max-w-md">
		{#if currentMat}
			<Dialog.Header>
				<Dialog.Title>Surtido de Material</Dialog.Title>
				<Dialog.Description>Folio {folio?.id} · {folio?.vehiculo}</Dialog.Description>
			</Dialog.Header>

			<!-- Step indicator -->
			<div class="flex items-center gap-2">
				{#each [1, 2, 3] as s (s)}
					<span
						class="flex size-7 items-center justify-center rounded-full text-xs font-bold transition-colors {surtidoStep === s
							? 'bg-primary text-primary-foreground'
							: surtidoStep > s
								? 'bg-emerald-500 text-white'
								: 'bg-muted text-muted-foreground'}"
					>
						{surtidoStep > s ? '✓' : s}
					</span>
					{#if s < 3}
						<div
							class="h-0.5 flex-1 transition-colors {surtidoStep > s ? 'bg-emerald-500' : 'bg-border'}"
						></div>
					{/if}
				{/each}
			</div>

			<Separator />

			<!-- Material en curso -->
			<div class="rounded-lg border-l-4 border-l-primary bg-primary/5 px-4 py-3 text-sm">
				<p class="text-muted-foreground text-xs font-semibold uppercase tracking-wide">Material en curso</p>
				<p class="font-mono font-bold">{currentMat.sku}</p>
				<p class="text-muted-foreground text-xs">{currentMat.desc}</p>
				<p class="text-muted-foreground mt-0.5 text-xs">
					Ubic: <span class="font-mono font-bold text-primary">{currentMat.ubic}</span>
					· Pendiente: <span class="font-semibold text-chart-4">{remaining}</span> pzas
				</p>
			</div>

			<!-- PASO 1: Escanear SKU -->
			{#if surtidoStep === 1}
				<div class="flex flex-col gap-3">
					<div
						class="rounded-lg border-2 border-dashed p-4 text-center transition-all {scanSKU
							? 'border-emerald-500 bg-emerald-500/5'
							: 'border-border bg-muted/30'}"
					>
						<ScanLine class="text-muted-foreground mx-auto mb-1.5 size-8" />
						{#if scanSKU}
							<p class="font-mono font-bold text-emerald-600">{scanSKU}</p>
							<p class="text-muted-foreground text-xs">Código detectado</p>
						{:else if scanning}
							<p class="text-primary flex items-center justify-center gap-2 text-sm">
								<Loader class="size-4 animate-spin" /> Escaneando...
							</p>
						{:else}
							<p class="text-muted-foreground text-sm">Apunta el lector al código de barras del producto</p>
						{/if}
					</div>
					<div class="flex flex-col gap-1.5">
						<Label for="input-sku">Código SKU</Label>
						<Input
							id="input-sku"
							bind:value={scanSKU}
							placeholder="Ej. VID-10002 …"
							onkeydown={(e) => e.key === 'Enter' && confirmSKU()}
						/>
					</div>
					<div class="flex gap-2">
						<Button variant="outline" class="flex-1" onclick={simulateScan} disabled={scanning}>
							<ScanLine data-icon="inline-start" />
							{scanning ? 'Escaneando…' : 'Simular Escaneo'}
						</Button>
						<Button class="flex-1" onclick={confirmSKU}>
							<Check data-icon="inline-start" /> Confirmar SKU
						</Button>
					</div>
				</div>
			{/if}

			<!-- PASO 2: Confirmar cantidad -->
			{#if surtidoStep === 2}
				<div class="flex flex-col gap-3">
					<div class="rounded-lg bg-muted/40 px-4 py-2 text-sm">
						<span class="text-muted-foreground">SKU confirmado: </span>
						<span class="font-mono font-bold">{scanSKU}</span>
					</div>
					<p class="text-muted-foreground text-center text-xs">
						Máximo permitido (LMAT): <span class="font-bold text-foreground">{remaining}</span> pzas
					</p>
					<div class="flex items-center justify-center gap-6 rounded-lg bg-muted/40 py-5">
						<Button
							variant="outline"
							size="icon"
							class="size-11 rounded-full text-lg"
							onclick={() => changeQty(-1)}
							disabled={currentQty <= 1}
						>−</Button>
						<span
							class="min-w-16 text-center text-4xl font-bold tabular-nums transition-colors {qtyExceeded
								? 'text-destructive'
								: ''}">{currentQty}</span>
						<Button
							variant="outline"
							size="icon"
							class="size-11 rounded-full text-lg"
							onclick={() => changeQty(1)}
						>+</Button>
					</div>
					{#if qtyExceeded}
						<Alert.Root variant="destructive">
							<TriangleAlert />
							<Alert.Description>
								Cantidad excede el límite LMAT. Máximo: {remaining} pzas.
							</Alert.Description>
						</Alert.Root>
					{/if}
					<Button onclick={confirmSurtido} disabled={qtyExceeded}>
						<Check data-icon="inline-start" /> Confirmar Surtido
					</Button>
				</div>
			{/if}

			<!-- PASO 3: Confirmado -->
			{#if surtidoStep === 3}
				<div class="flex flex-col items-center gap-4 py-2 text-center">
					<CircleCheckBig class="size-14 text-emerald-500" />
					<div>
						<p class="text-lg font-bold text-emerald-600">¡Surtido Registrado!</p>
						<p class="text-muted-foreground text-sm">
							{currentMat.sku} · {currentQty} pzas. surtidas
						</p>
						{#if progress.pending > 0}
							<p class="text-muted-foreground mt-1 text-xs">
								Quedan <span class="font-semibold text-chart-4">{progress.pending}</span> materiales pendientes
							</p>
						{/if}
					</div>
					<div class="flex w-full flex-col gap-2">
						{#if progress.pending > 0}
							<Button onclick={nextMaterial}>
								<ArrowRight data-icon="inline-start" /> Siguiente material
							</Button>
						{:else}
							<Button onclick={() => (surtidoOpen = false)}>
								<CircleCheckBig data-icon="inline-start" /> ¡Folio Completado!
							</Button>
						{/if}
						<Button variant="outline" onclick={() => (surtidoOpen = false)}>
							Ver lista LMAT
						</Button>
					</div>
				</div>
			{/if}

			{#if surtidoStep < 3}
				<Dialog.Footer>
					<Button variant="ghost" onclick={() => (surtidoOpen = false)}>Cancelar</Button>
				</Dialog.Footer>
			{/if}
		{/if}
	</Dialog.Content>
</Dialog.Root>

<!-- ── DIALOG: REPORTE DE ERROR ── -->
<Dialog.Root bind:open={errorOpen}>
	<Dialog.Content class="sm:max-w-md">
		{#if !errorDone}
			<Dialog.Header>
				<Dialog.Title class="flex items-center gap-2">
					<TriangleAlert class="size-5 text-destructive" /> Reporte de Error
				</Dialog.Title>
				<Dialog.Description>Escalamiento automático a Ingeniería</Dialog.Description>
			</Dialog.Header>

			<div class="grid grid-cols-2 gap-3 text-sm">
				<div>
					<p class="text-muted-foreground text-xs">Folio LMAT</p>
					<p class="font-mono font-semibold">{folio?.id ?? '—'}</p>
				</div>
				<div>
					<p class="text-muted-foreground text-xs">SKU en curso</p>
					<p class="font-mono font-semibold">{currentMat?.sku ?? '—'}</p>
				</div>
			</div>

			<Separator />

			<div class="flex flex-col gap-2">
				<p class="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Tipo de error *</p>
				{#each ERROR_TYPES as et (et.id)}
					<button
						class="w-full rounded-lg border-2 p-3 text-left transition-colors {errorTipo === et.id
							? 'border-destructive bg-destructive/5'
							: 'border-border hover:border-destructive/50 hover:bg-muted/50'}"
						onclick={() => (errorTipo = et.id)}
					>
						<p class="text-sm font-semibold">{et.label}</p>
						<p class="text-muted-foreground text-xs">{et.desc}</p>
					</button>
				{/each}
			</div>

			<div class="flex flex-col gap-1.5">
				<Label for="error-notes">Notas adicionales</Label>
				<Textarea
					id="error-notes"
					bind:value={errorNotes}
					rows={3}
					placeholder="Describe el problema con más detalle…"
				/>
			</div>

			<Dialog.Footer>
				<Button variant="ghost" onclick={() => (errorOpen = false)}>Cancelar</Button>
				<Button variant="destructive" onclick={submitError} disabled={errorSubmitting}>
					{#if errorSubmitting}
						<Loader class="size-4 animate-spin" data-icon="inline-start" /> Escalando…
					{:else}
						<TriangleAlert data-icon="inline-start" /> Escalar a Ingeniería
					{/if}
				</Button>
			</Dialog.Footer>
		{:else}
			<!-- Ticket generado -->
			<Dialog.Header>
				<Dialog.Title>Ticket Generado</Dialog.Title>
			</Dialog.Header>
			<div class="flex flex-col items-center gap-4 py-4 text-center">
				<ClipboardList class="text-primary size-14" />
				<div>
					<p class="text-muted-foreground mb-1 text-sm">Número de ticket</p>
					<p class="font-mono text-2xl font-black tracking-widest text-primary">{errorTicket}</p>
				</div>
				<p class="text-muted-foreground text-sm leading-relaxed">
					El reporte fue escalado automáticamente al equipo de <strong class="text-foreground">Ingeniería</strong>.
					El folio queda en espera hasta recibir resolución.
				</p>
				<div class="bg-muted/50 w-full rounded-lg px-4 py-3 text-left text-xs text-muted-foreground leading-relaxed">
					<strong class="text-foreground">Detalle:</strong><br />
					Tipo: {ERROR_TYPES.find((e) => e.id === errorTipo)?.label ?? '—'}<br />
					Folio: {folio?.id ?? '—'} · SKU: {currentMat?.sku ?? '—'}
					{#if errorNotes}<br />Notas: {errorNotes}{/if}
				</div>
			</div>
			<Dialog.Footer>
				<Button onclick={() => (errorOpen = false)}>Cerrar</Button>
			</Dialog.Footer>
		{/if}
	</Dialog.Content>
</Dialog.Root>
