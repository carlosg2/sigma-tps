<script lang="ts">
	import { page } from '$app/state';
	import { useRentasStore } from '$lib/tps/rentas/store.svelte.js';
	import {
		CLIENTES,
		DOC_ESTATUS_OPCIONES,
		DOC_ESTATUS_COLORS,
		ANTIFRAUDE_COLORS,
		EXPEDIENTE_COLORS,
		CALIDAD_COLORS,
		LIBERACION_COLORS,
		fmtMXN
	} from '$lib/tps/rentas/constants.js';
	import type { DocEstatus, Riesgo } from '$lib/tps/rentas/types.js';
	import FlowChecklist from '$lib/tps/rentas/components/flow-checklist.svelte';
	import StatusBadge from '$lib/tps/components/status-badge.svelte';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Table from '$lib/components/ui/table/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import * as Field from '$lib/components/ui/field/index.js';
	import * as Empty from '$lib/components/ui/empty/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { toast } from 'svelte-sonner';
	import ShieldCheck from '@lucide/svelte/icons/shield-check';
	import ScanSearch from '@lucide/svelte/icons/scan-search';
	import FileCheck from '@lucide/svelte/icons/file-check';
	import Save from '@lucide/svelte/icons/save';
	import Send from '@lucide/svelte/icons/send';
	import Check from '@lucide/svelte/icons/check';
	import Ban from '@lucide/svelte/icons/ban';
	import History from '@lucide/svelte/icons/history';
	import CircleCheckBig from '@lucide/svelte/icons/circle-check-big';
	import CircleX from '@lucide/svelte/icons/circle-x';
	import Bell from '@lucide/svelte/icons/bell';

	const store = useRentasStore();
	const data = $derived(store.state);

	const initialFolio =
		page.url.searchParams.get('folio') ??
		store.state.cotizacionActiva ??
		store.state.cotizaciones[0]?.folio ??
		null;
	let selectedFolio = $state<string | null>(initialFolio);
	let clienteSel = $state('');
	let riesgoSel = $state<Riesgo>('bajo');

	const cot = $derived(selectedFolio ? store.getCotizacion(selectedFolio) : undefined);
	const comp = $derived(selectedFolio ? store.getCompliance(selectedFolio) : undefined);

	// Asegura el registro de compliance y sincroniza selects al cambiar de folio.
	$effect(() => {
		if (!selectedFolio) return;
		store.ensureCompliance(selectedFolio);
		const c = store.getCotizacion(selectedFolio);
		clienteSel = store.getCompliance(selectedFolio)?.cliente || c?.cliente || '';
		riesgoSel = store.getCompliance(selectedFolio)?.riesgo ?? 'bajo';
	});

	const folioLabel = $derived(
		selectedFolio && cot ? `${cot.folio} · ${cot.cliente}` : selectedFolio ?? 'Selecciona una cotización'
	);
	const clienteLabel = $derived(clienteSel || 'Seleccionar cliente');
	const riesgoLabel = $derived({ bajo: 'Bajo', medio: 'Medio', alto: 'Alto' }[riesgoSel]);

	function verificarListaNegra() {
		if (!selectedFolio) return;
		if (!clienteSel) {
			toast.warning('Selecciona un cliente.');
			return;
		}
		const limpio = store.verificarListaNegra(selectedFolio, clienteSel);
		if (limpio) toast.success(`"${clienteSel}" sin registros negativos.`);
		else toast.error(`"${clienteSel}" está en lista negra.`);
	}

	function marcarRecibidos() {
		if (!selectedFolio) return;
		store.marcarDocsRecibidos(selectedFolio);
		toast.info('Documentos marcados como Recibido.');
	}

	function guardarValidacion() {
		if (!selectedFolio) return;
		store.guardarValidacion(selectedFolio);
		toast.success('Validación guardada.');
	}

	function enviarCalidad() {
		if (!selectedFolio) return;
		const ok = store.enviarCalidad(selectedFolio);
		if (!ok) toast.warning('Completa el expediente antes de enviar a Calidad.');
		else toast.info('Expediente enviado a Calidad.');
	}

	function aprobarCalidad() {
		if (!selectedFolio) return;
		const { ok, liberada } = store.aprobarCalidad(selectedFolio);
		if (!ok) {
			toast.warning('El expediente debe estar completo para aprobar.');
			return;
		}
		toast.success('Calidad aprobada.');
		if (liberada) toast.success('🟢 Unidad liberada. Stop-Gate superado.');
	}

	function rechazarCalidad() {
		if (!selectedFolio) return;
		store.rechazarCalidad(selectedFolio);
		toast.error('Calidad rechazada.');
	}

	function reutilizarHistorial() {
		if (!selectedFolio) return;
		const prev = store.reutilizarHistorial(selectedFolio, clienteSel);
		if (prev) toast.success(`Historial de ${prev} reutilizado.`);
		else toast.warning('No hay historial previo aprobado para este cliente.');
	}

	function setDocEstatus(idx: number, value: string) {
		if (selectedFolio) store.setDocEstatus(selectedFolio, idx, value as DocEstatus);
	}

	const bitacoraOrden = $derived(comp ? [...comp.bitacora].reverse() : []);
	const bitacoraIcon = { info: Bell, success: CircleCheckBig, danger: CircleX };
	const bitacoraColor = { info: 'text-chart-3', success: 'text-emerald-500', danger: 'text-destructive' };
</script>

<div class="flex flex-col gap-6">
	<div class="flex flex-wrap items-center justify-between gap-3">
		<div>
			<h2 class="text-xl font-semibold">Cumplimiento y Stop-Gate</h2>
			<p class="text-muted-foreground text-sm">Antifraude, expediente documental, calidad y liberación</p>
		</div>
		<Badge variant="outline" class="font-mono">GAP-RNT-003</Badge>
	</div>

	{#if data.cotizaciones.length === 0}
		<Card.Root>
			<Card.Content class="pt-6">
				<Empty.Root>
					<Empty.Header>
						<Empty.Media variant="icon"><ShieldCheck /></Empty.Media>
						<Empty.Title>Sin cotizaciones</Empty.Title>
						<Empty.Description>Crea una cotización para iniciar su cumplimiento.</Empty.Description>
					</Empty.Header>
					<Empty.Content>
						<Button href="/rentas/cotizador">Ir al cotizador</Button>
					</Empty.Content>
				</Empty.Root>
			</Card.Content>
		</Card.Root>
	{:else}
		<Card.Root>
			<Card.Header>
				<Card.Title>Cotización en cumplimiento</Card.Title>
				<Card.Description>Selecciona la cotización a revisar</Card.Description>
			</Card.Header>
			<Card.Content>
				<Select.Root type="single" bind:value={selectedFolio as string}>
					<Select.Trigger class="w-full sm:w-96">{folioLabel}</Select.Trigger>
					<Select.Content>
						{#each data.cotizaciones as c (c.folio)}
							<Select.Item value={c.folio}>{c.folio} · {c.cliente} · {fmtMXN(c.total)}</Select.Item>
						{/each}
					</Select.Content>
				</Select.Root>
			</Card.Content>
		</Card.Root>

		{#if selectedFolio && comp}
			<!-- Control del flujo -->
			<Card.Root>
				<Card.Header>
					<Card.Title>Control operativo del flujo</Card.Title>
					<Card.Description>Avance completo del proceso para {selectedFolio}</Card.Description>
				</Card.Header>
				<Card.Content>
					<FlowChecklist folio={selectedFolio} />
				</Card.Content>
			</Card.Root>

			<div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
				<!-- Cumplimiento documental -->
				<Card.Root>
					<Card.Header>
						<Card.Title>Cumplimiento por cotización</Card.Title>
						<Card.Description>Antifraude y checklist documental obligatorio</Card.Description>
					</Card.Header>
					<Card.Content class="flex flex-col gap-4">
						<Field.FieldGroup>
							<div class="grid gap-4 sm:grid-cols-2">
								<Field.Field>
									<Field.FieldLabel>Cliente</Field.FieldLabel>
									<Select.Root type="single" bind:value={clienteSel}>
										<Select.Trigger>{clienteLabel}</Select.Trigger>
										<Select.Content>
											{#each CLIENTES as c (c)}
												<Select.Item value={c}>{c}</Select.Item>
											{/each}
										</Select.Content>
									</Select.Root>
								</Field.Field>
								<Field.Field>
									<Field.FieldLabel>Riesgo inicial</Field.FieldLabel>
									<Select.Root type="single" bind:value={riesgoSel as string}>
										<Select.Trigger>{riesgoLabel}</Select.Trigger>
										<Select.Content>
											<Select.Item value="bajo">Bajo</Select.Item>
											<Select.Item value="medio">Medio</Select.Item>
											<Select.Item value="alto">Alto</Select.Item>
										</Select.Content>
									</Select.Root>
								</Field.Field>
							</div>
						</Field.FieldGroup>

						<div class="flex flex-wrap gap-2">
							<Button variant="outline" size="sm" onclick={verificarListaNegra}>
								<ScanSearch data-icon="inline-start" /> Verificar lista negra
							</Button>
							<Button variant="outline" size="sm" onclick={marcarRecibidos}>
								<FileCheck data-icon="inline-start" /> Marcar recibidos
							</Button>
							<Button size="sm" onclick={guardarValidacion}>
								<Save data-icon="inline-start" /> Guardar validación
							</Button>
						</div>

						<div class="overflow-hidden rounded-lg border">
							<Table.Root>
								<Table.Header>
									<Table.Row>
										<Table.Head>Documento</Table.Head>
										<Table.Head class="w-40">Estatus</Table.Head>
										<Table.Head>Observaciones</Table.Head>
									</Table.Row>
								</Table.Header>
								<Table.Body>
									{#each comp.documentos as doc, i (doc.nombre)}
										<Table.Row>
											<Table.Cell class="text-sm">{doc.nombre}</Table.Cell>
											<Table.Cell>
												<Select.Root type="single" value={doc.estatus} onValueChange={(v) => setDocEstatus(i, v)}>
													<Select.Trigger size="sm" class="w-full">
														<StatusBadge label={doc.estatus} colorClass={DOC_ESTATUS_COLORS[doc.estatus]} />
													</Select.Trigger>
													<Select.Content>
														{#each DOC_ESTATUS_OPCIONES as opt (opt)}
															<Select.Item value={opt}>{opt}</Select.Item>
														{/each}
													</Select.Content>
												</Select.Root>
											</Table.Cell>
											<Table.Cell>
												<Input
													value={doc.obs}
													placeholder="Notas…"
													oninput={(e) => selectedFolio && store.setDocObs(selectedFolio, i, e.currentTarget.value)}
												/>
											</Table.Cell>
										</Table.Row>
									{/each}
								</Table.Body>
							</Table.Root>
						</div>
					</Card.Content>
				</Card.Root>

				<!-- Control de calidad (stop-gate) -->
				<Card.Root>
					<Card.Header>
						<Card.Title>Control de calidad · Stop-Gate</Card.Title>
						<Card.Description>Resultados de las validaciones y liberación</Card.Description>
					</Card.Header>
					<Card.Content class="flex flex-col gap-4">
						<div class="grid grid-cols-2 gap-3">
							<div class="flex flex-col gap-1 rounded-lg border p-3">
								<span class="text-muted-foreground text-xs">Antifraude</span>
								<StatusBadge label={comp.antifraude} colorClass={ANTIFRAUDE_COLORS[comp.antifraude]} />
							</div>
							<div class="flex flex-col gap-1 rounded-lg border p-3">
								<span class="text-muted-foreground text-xs">Expediente</span>
								<StatusBadge label={comp.expediente} colorClass={EXPEDIENTE_COLORS[comp.expediente]} />
							</div>
							<div class="flex flex-col gap-1 rounded-lg border p-3">
								<span class="text-muted-foreground text-xs">Calidad</span>
								<StatusBadge label={comp.calidad} colorClass={CALIDAD_COLORS[comp.calidad]} />
							</div>
							<div class="flex flex-col gap-1 rounded-lg border p-3">
								<span class="text-muted-foreground text-xs">Liberación</span>
								<StatusBadge label={comp.liberacion} colorClass={LIBERACION_COLORS[comp.liberacion]} />
							</div>
						</div>

						<div class="flex flex-wrap gap-2">
							<Button variant="outline" size="sm" onclick={enviarCalidad}>
								<Send data-icon="inline-start" /> Enviar a Calidad
							</Button>
							<Button size="sm" onclick={aprobarCalidad}>
								<Check data-icon="inline-start" /> Aprobar
							</Button>
							<Button variant="outline" size="sm" onclick={rechazarCalidad}>
								<Ban data-icon="inline-start" /> Rechazar
							</Button>
							<Button variant="ghost" size="sm" onclick={reutilizarHistorial}>
								<History data-icon="inline-start" /> Reutilizar historial
							</Button>
						</div>

						<div class="flex flex-col gap-2">
							<h4 class="text-sm font-semibold">Bitácora de validaciones</h4>
							{#if bitacoraOrden.length === 0}
								<p class="text-muted-foreground text-sm">Sin registros.</p>
							{:else}
								<div class="flex flex-col gap-3">
									{#each bitacoraOrden as b (b.fecha + b.msg)}
										{@const Icon = bitacoraIcon[b.tipo]}
										<div class="flex gap-3 text-sm">
											<Icon class="mt-0.5 size-4 shrink-0 {bitacoraColor[b.tipo]}" />
											<div>
												<p class="font-medium">{b.msg}</p>
												<p class="text-muted-foreground text-xs">{b.fecha}</p>
											</div>
										</div>
									{/each}
								</div>
							{/if}
						</div>
					</Card.Content>
				</Card.Root>
			</div>
		{/if}
	{/if}
</div>
