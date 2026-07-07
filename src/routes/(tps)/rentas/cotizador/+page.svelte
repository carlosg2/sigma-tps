<script lang="ts">
	import { useRentasStore } from '$lib/tps/rentas/store.svelte.js';
	import { EXTRAS, CLIENTES, fmtMXN, fmtDate } from '$lib/tps/rentas/constants.js';
	import type { CotizacionDraft } from '$lib/tps/rentas/types.js';
	import AvailabilityCalendar from '$lib/tps/rentas/components/availability-calendar.svelte';
	import PropuestaPreview from '$lib/tps/rentas/components/propuesta-preview.svelte';
	import StatusBadge from '$lib/tps/components/status-badge.svelte';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import * as Field from '$lib/components/ui/field/index.js';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Checkbox } from '$lib/components/ui/checkbox/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import { toast } from 'svelte-sonner';
	import { parseDate, type DateValue } from '@internationalized/date';
	import type { DateRange } from 'bits-ui';
	import ShieldCheck from '@lucide/svelte/icons/shield-check';
	import CalendarCheck from '@lucide/svelte/icons/calendar-check';
	import Calculator from '@lucide/svelte/icons/calculator';
	import Save from '@lucide/svelte/icons/save';
	import GitBranch from '@lucide/svelte/icons/git-branch';
	import FileText from '@lucide/svelte/icons/file-text';
	import Eraser from '@lucide/svelte/icons/eraser';
	import Printer from '@lucide/svelte/icons/printer';
	import ChevronLeft from '@lucide/svelte/icons/chevron-left';
	import ChevronRight from '@lucide/svelte/icons/chevron-right';

	const store = useRentasStore();
	const activa = store.cotizacionActivaObj;

	function rangeFromCot(fi: string | null, ff: string | null): DateRange | undefined {
		if (!fi || !ff) return undefined;
		try {
			return { start: parseDate(fi), end: parseDate(ff) };
		} catch {
			return undefined;
		}
	}

	// --- Estado del formulario ---
	let cliente = $state(activa?.cliente ?? '');
	let vin = $state(activa?.vin ?? '');
	let tarifa = $state(activa?.tarifa ?? 18000);
	let selectedExtras = $state<string[]>(activa?.extras.map((e) => e.id) ?? []);
	let dateRange = $state<DateRange | undefined>(rangeFromCot(activa?.fechaInicio ?? null, activa?.fechaFin ?? null));
	let photoIdx = $state(0);

	const vehiculo = $derived(vin ? store.getVehiculo(vin) : undefined);

	function toISO(d?: DateValue): string | null {
		return d ? `${d.year}-${String(d.month).padStart(2, '0')}-${String(d.day).padStart(2, '0')}` : null;
	}
	const fechaInicio = $derived(toISO(dateRange?.start));
	const fechaFin = $derived(toISO(dateRange?.end));
	const dias = $derived(
		fechaInicio && fechaFin
			? Math.max(1, Math.round((new Date(fechaFin).getTime() - new Date(fechaInicio).getTime()) / 86400000))
			: 1
	);

	const extrasObj = $derived(EXTRAS.filter((e) => selectedExtras.includes(e.id)));
	const baseTotal = $derived(dias * tarifa);
	const extrasTotal = $derived(extrasObj.reduce((s, e) => s + e.precio * dias, 0));
	const total = $derived(baseTotal + extrasTotal);

	const clienteLabel = $derived(cliente || 'Seleccionar cliente');
	const vinLabel = $derived(vehiculo ? `${vehiculo.modelo} · ${vin}` : 'Seleccionar unidad');

	// Estado de disponibilidad/cotización mostrado en el resumen
	let dispoEstatus = $state<'sin' | 'ok' | 'no'>(activa?.disponibilidadOk ? 'ok' : 'sin');
	let cotEstatus = $state<'borrador' | 'calculada'>(activa && activa.total > 0 ? 'calculada' : 'borrador');

	function onVinChange(value: string) {
		vin = value;
		photoIdx = 0;
		const v = store.getVehiculo(value);
		if (v) tarifa = v.tarifa;
		dispoEstatus = 'sin';
	}

	function toggleExtra(id: string, checked: boolean) {
		selectedExtras = checked ? [...selectedExtras, id] : selectedExtras.filter((x) => x !== id);
	}

	function buildDraft(): CotizacionDraft {
		return {
			cliente,
			vin,
			fechaInicio,
			fechaFin,
			dias,
			tarifa,
			extras: extrasObj,
			baseTotal,
			extrasTotal,
			total
		};
	}

	function validate(): string | null {
		if (!cliente) return 'Selecciona un cliente.';
		if (!vin) return 'Selecciona una unidad (VIN).';
		if (!fechaInicio || !fechaFin) return 'Captura las fechas de inicio y fin.';
		if (fechaFin <= fechaInicio) return 'La fecha fin debe ser posterior al inicio.';
		return null;
	}

	function validarDisponibilidad() {
		const err = validate();
		if (err) {
			toast.warning(err);
			return;
		}
		const conflicto = store.checkOcupacion(vin, fechaInicio!, fechaFin!, store.state.cotizacionActiva);
		if (conflicto) {
			dispoEstatus = 'no';
			toast.error(
				conflicto.folio
					? `VIN bloqueado: ya reservado en ${conflicto.folio}.`
					: `VIN en ${conflicto.tipo === 'maintenance' ? 'mantenimiento' : 'uso'} en el periodo seleccionado.`
			);
		} else {
			dispoEstatus = 'ok';
			toast.success('Unidad disponible en el periodo.');
			if (store.state.cotizacionActiva) store.marcarDisponibilidad(store.state.cotizacionActiva, true);
		}
	}

	function calcular() {
		const err = validate();
		if (err) {
			toast.warning(err);
			return;
		}
		cotEstatus = 'calculada';
		if (store.state.cotizacionActiva) store.updateCotizacion(store.state.cotizacionActiva, buildDraft());
		toast.success(`Total calculado: ${fmtMXN(total)}`);
	}

	function guardar() {
		const err = validate();
		if (err) {
			toast.warning(err);
			return;
		}
		if (store.state.cotizacionActiva) {
			store.updateCotizacion(store.state.cotizacionActiva, buildDraft());
			toast.success(`Cotización ${store.state.cotizacionActiva} actualizada.`);
		} else {
			const folio = store.createCotizacion(buildDraft());
			toast.success(`Cotización guardada: ${folio}`);
		}
	}

	function nuevaVersion() {
		if (!store.state.cotizacionActiva) {
			toast.warning('Guarda o abre una cotización primero.');
			return;
		}
		const nueva = store.nuevaVersion(store.state.cotizacionActiva);
		if (nueva) toast.info(`Nueva versión: ${nueva}`);
	}

	let propuestaOpen = $state(false);
	function generarPropuesta() {
		const err = validate();
		if (err) {
			toast.warning(err);
			return;
		}
		if (store.state.cotizacionActiva) {
			store.updateCotizacion(store.state.cotizacionActiva, buildDraft());
		} else {
			store.createCotizacion(buildDraft());
		}
		propuestaOpen = true;
	}

	function limpiar() {
		store.setActiva(null);
		cliente = '';
		vin = '';
		tarifa = 18000;
		selectedExtras = [];
		dateRange = undefined;
		photoIdx = 0;
		dispoEstatus = 'sin';
		cotEstatus = 'borrador';
		toast.info('Formulario limpiado.');
	}

	function print() {
		if (typeof window !== 'undefined') window.print();
	}

	const activaObj = $derived(store.cotizacionActivaObj);
</script>

<div class="flex flex-col gap-6">
	<div class="flex flex-wrap items-center justify-between gap-3">
		<div>
			<h2 class="text-xl font-semibold">Cotizador de Rentas</h2>
			<p class="text-muted-foreground text-sm">Captura comercial, disponibilidad y propuesta</p>
		</div>
		<div class="flex items-center gap-2">
			{#if store.state.cotizacionActiva}
				<Badge variant="secondary" class="font-mono">{store.state.cotizacionActiva}</Badge>
			{/if}
			<Badge variant="outline" class="font-mono">GAP-RNT-001</Badge>
		</div>
	</div>

	<div class="grid grid-cols-1 gap-6 xl:grid-cols-3">
		<!-- Formulario -->
		<div class="flex flex-col gap-6 xl:col-span-2">
			<Card.Root>
				<Card.Header>
					<Card.Title>Datos de cotización</Card.Title>
					<Card.Description>Cliente, unidad, periodo y tarifa</Card.Description>
				</Card.Header>
				<Card.Content>
					<Field.FieldGroup>
						<div class="grid gap-4 sm:grid-cols-2">
							<Field.Field>
								<Field.FieldLabel>Cliente</Field.FieldLabel>
								<Select.Root type="single" bind:value={cliente}>
									<Select.Trigger>{clienteLabel}</Select.Trigger>
									<Select.Content>
										{#each CLIENTES as c (c)}
											<Select.Item value={c}>{c}</Select.Item>
										{/each}
									</Select.Content>
								</Select.Root>
							</Field.Field>

							<Field.Field>
								<Field.FieldLabel>Unidad (VIN)</Field.FieldLabel>
								<Select.Root type="single" value={vin} onValueChange={onVinChange}>
									<Select.Trigger>{vinLabel}</Select.Trigger>
									<Select.Content>
										{#each store.vehiculos as v (v.vin)}
											<Select.Item value={v.vin}>{v.modelo} · {v.vin}</Select.Item>
										{/each}
									</Select.Content>
								</Select.Root>
							</Field.Field>

							<Field.Field>
								<Field.FieldLabel for="dias">Días estimados</Field.FieldLabel>
								<Input id="dias" type="number" value={dias} readonly class="tabular-nums" />
								<Field.FieldDescription>Calculado del rango seleccionado.</Field.FieldDescription>
							</Field.Field>

							<Field.Field>
								<Field.FieldLabel for="tarifa">Tarifa base diaria (MXN)</Field.FieldLabel>
								<Input id="tarifa" type="number" min={1000} step={500} bind:value={tarifa} class="tabular-nums" />
							</Field.Field>
						</div>
					</Field.FieldGroup>
				</Card.Content>
			</Card.Root>

			<Card.Root>
				<Card.Header>
					<Card.Title>Calendario de disponibilidad</Card.Title>
					<Card.Description>Selecciona el periodo de renta. Los días no disponibles están deshabilitados.</Card.Description>
				</Card.Header>
				<Card.Content class="flex flex-col gap-4">
					<div class="flex flex-wrap gap-3 text-xs">
						<span class="flex items-center gap-1.5"><span class="size-2.5 rounded-full bg-emerald-500"></span> Disponible</span>
						<span class="flex items-center gap-1.5"><span class="bg-destructive size-2.5 rounded-full"></span> Ocupado</span>
						<span class="flex items-center gap-1.5"><span class="bg-chart-4 size-2.5 rounded-full"></span> Mantenimiento</span>
					</div>
					<div class="flex justify-center">
						<AvailabilityCalendar {vin} bind:value={dateRange} />
					</div>
					<p class="text-muted-foreground text-center text-sm">
						{#if fechaInicio && fechaFin}
							Del {fmtDate(fechaInicio)} al {fmtDate(fechaFin)} — {dias} día(s)
						{:else if fechaInicio}
							Inicio: {fmtDate(fechaInicio)} — selecciona la fecha fin.
						{:else}
							Selecciona fecha inicio y fin.
						{/if}
					</p>
				</Card.Content>
			</Card.Root>

			<Card.Root>
				<Card.Header>
					<Card.Title>Extras del servicio</Card.Title>
					<Card.Description>Servicios adicionales facturados por día</Card.Description>
				</Card.Header>
				<Card.Content>
					<div class="grid gap-3 sm:grid-cols-2">
						{#each EXTRAS as e (e.id)}
							<Label
								class="hover:bg-accent/40 has-data-[state=checked]:border-primary/50 has-data-[state=checked]:bg-primary/5 flex cursor-pointer items-center gap-3 rounded-lg border p-3"
							>
								<Checkbox checked={selectedExtras.includes(e.id)} onCheckedChange={(v) => toggleExtra(e.id, v === true)} />
								<span class="flex-1 text-sm font-normal">{e.label}</span>
								<span class="text-muted-foreground text-xs tabular-nums">{fmtMXN(e.precio)}/día</span>
							</Label>
						{/each}
					</div>
				</Card.Content>
			</Card.Root>
		</div>

		<!-- Panel lateral: preview + resumen + acciones -->
		<div class="flex flex-col gap-6">
			<Card.Root>
				<Card.Header>
					<Card.Title>Vehículo seleccionado</Card.Title>
				</Card.Header>
				<Card.Content class="flex flex-col gap-3">
					{#if vehiculo}
						<div class="bg-muted overflow-hidden rounded-lg border">
							<img src={vehiculo.fotos[photoIdx]} alt={vehiculo.modelo} class="aspect-video w-full object-cover" />
						</div>
						<div class="flex items-center justify-between gap-2">
							<Button
								size="icon"
								variant="outline"
								onclick={() => (photoIdx = (photoIdx - 1 + vehiculo.fotos.length) % vehiculo.fotos.length)}
								aria-label="Foto anterior"
							>
								<ChevronLeft />
							</Button>
							<span class="text-muted-foreground text-xs tabular-nums">{photoIdx + 1}/{vehiculo.fotos.length}</span>
							<Button
								size="icon"
								variant="outline"
								onclick={() => (photoIdx = (photoIdx + 1) % vehiculo.fotos.length)}
								aria-label="Foto siguiente"
							>
								<ChevronRight />
							</Button>
						</div>
						<div>
							<p class="font-medium">{vehiculo.modelo}</p>
							<p class="text-muted-foreground font-mono text-xs">VIN {vehiculo.vin} · Nivel {vehiculo.nivel}</p>
						</div>
					{:else}
						<div class="text-muted-foreground flex aspect-video items-center justify-center rounded-lg border border-dashed text-sm">
							<div class="flex flex-col items-center gap-2">
								<ShieldCheck class="size-8 opacity-40" />
								Sin unidad seleccionada
							</div>
						</div>
					{/if}
				</Card.Content>
			</Card.Root>

			<Card.Root>
				<Card.Header>
					<Card.Title>Resumen y versionado</Card.Title>
				</Card.Header>
				<Card.Content class="flex flex-col gap-3">
					<div class="grid grid-cols-2 gap-3 text-sm">
						<div>
							<p class="text-muted-foreground text-xs">Versión actual</p>
							<p class="font-semibold">{activaObj?.version ?? 'v01'}</p>
						</div>
						<div>
							<p class="text-muted-foreground text-xs">Total</p>
							<p class="font-semibold tabular-nums">{fmtMXN(total)}</p>
						</div>
						<div>
							<p class="text-muted-foreground text-xs">Disponibilidad</p>
							<StatusBadge
								label={dispoEstatus === 'ok' ? 'Disponible' : dispoEstatus === 'no' ? 'No disponible' : 'Sin validar'}
								colorClass={dispoEstatus === 'ok'
									? 'bg-emerald-500/15 text-emerald-400'
									: dispoEstatus === 'no'
										? 'bg-destructive/15 text-destructive'
										: 'bg-muted text-muted-foreground'}
							/>
						</div>
						<div>
							<p class="text-muted-foreground text-xs">Cotización</p>
							<StatusBadge
								label={cotEstatus === 'calculada' ? 'Calculada' : 'Borrador'}
								colorClass={cotEstatus === 'calculada' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-muted text-muted-foreground'}
							/>
						</div>
					</div>

					{#if activaObj && activaObj.historial.length > 0}
						<Separator />
						<div class="flex flex-col gap-2">
							<p class="text-muted-foreground text-xs font-medium tracking-wide uppercase">Historial de versiones</p>
							{#each activaObj.historial as h (h.version)}
								<div class="flex items-center justify-between gap-2 text-sm">
									<span class="font-medium">{h.version}</span>
									<span class="tabular-nums">{fmtMXN(h.total)}</span>
									<span class="text-muted-foreground text-xs">{h.fecha}</span>
								</div>
							{/each}
						</div>
					{/if}
				</Card.Content>
			</Card.Root>

			<Card.Root>
				<Card.Content class="flex flex-col gap-2 pt-6">
					<Button variant="outline" onclick={validarDisponibilidad}>
						<CalendarCheck data-icon="inline-start" /> Validar disponibilidad
					</Button>
					<Button onclick={calcular}>
						<Calculator data-icon="inline-start" /> Calcular total
					</Button>
					<Button variant="outline" onclick={guardar}>
						<Save data-icon="inline-start" /> Guardar cotización
					</Button>
					<Button variant="outline" onclick={nuevaVersion}>
						<GitBranch data-icon="inline-start" /> Nueva versión
					</Button>
					<Button onclick={generarPropuesta}>
						<FileText data-icon="inline-start" /> Generar propuesta
					</Button>
					<Button variant="ghost" onclick={limpiar}>
						<Eraser data-icon="inline-start" /> Limpiar
					</Button>
				</Card.Content>
			</Card.Root>
		</div>
	</div>
</div>

<!-- ── PROPUESTA IMPRIMIBLE ── -->
<Dialog.Root bind:open={propuestaOpen}>
	<Dialog.Content class="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
		<Dialog.Header>
			<Dialog.Title>Propuesta comercial</Dialog.Title>
			<Dialog.Description>Vista previa de la propuesta. Usa Imprimir para guardarla como PDF.</Dialog.Description>
		</Dialog.Header>
		{#if activaObj}
			<PropuestaPreview cot={activaObj} />
		{/if}
		<Dialog.Footer>
			<Button variant="outline" onclick={() => (propuestaOpen = false)}>Cerrar</Button>
			<Button onclick={print}>
				<Printer data-icon="inline-start" /> Imprimir / Guardar PDF
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
