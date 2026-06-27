<script lang="ts">
	import { page } from '$app/state';
	import { useStore } from '$lib/tps/store.svelte.js';
	import { PRODUCTION_PROCESS_LABELS, PRODUCTION_PROCESS_COLORS } from '$lib/tps/constants.js';
	import ArrowLeft from '@lucide/svelte/icons/arrow-left';
	import Package from '@lucide/svelte/icons/package';
	import CircleCheckBig from '@lucide/svelte/icons/circle-check-big';
	import Clock from '@lucide/svelte/icons/clock';
	import TriangleAlert from '@lucide/svelte/icons/triangle-alert';
	import Truck from '@lucide/svelte/icons/truck';
	import User from '@lucide/svelte/icons/user';
	import QrCode from '@lucide/svelte/icons/qr-code';
	import Printer from '@lucide/svelte/icons/printer';
	import Download from '@lucide/svelte/icons/download';

	const KIT_STATUS_CONFIG = {
		pendiente: { label: 'Pendiente', color: 'bg-muted text-muted-foreground', icon: Clock },
		en_preparacion: { label: 'En Preparacion', color: 'bg-chart-4/15 text-chart-4', icon: Package },
		listo: { label: 'Listo', color: 'bg-chart-2/15 text-chart-2', icon: CircleCheckBig },
		entregado: { label: 'Entregado', color: 'bg-emerald-500/15 text-emerald-400', icon: Truck },
		parcial: { label: 'Parcial', color: 'bg-chart-1/15 text-chart-1', icon: TriangleAlert }
	};

	const store = useStore();
	const app = $derived(store.state);
	const id = $derived(page.params.id);

	let backorderNotes = $state('');

	const kit = $derived((app.supplyKits || []).find((k) => k.id === id));
	const spec = $derived((app.specifications || []).find((s) => s.id === kit?.specificationId));

	function handleScanItem(itemId: string) {
		if (!kit) return;
		store.dispatch({
			type: 'SCAN_KIT_ITEM',
			payload: { kitId: kit.id, itemId }
		});
	}

	function handleMarkDelivered() {
		if (!kit) return;
		store.dispatch({
			type: 'UPDATE_SUPPLY_KIT',
			payload: {
				id: kit.id,
				updates: {
					status: 'entregado',
					deliveredTo: app.currentUser.name,
					deliveredAt: new Date().toISOString(),
					supervisorConfirmed: true
				}
			}
		});
	}

	function handleMarkBackorder() {
		if (!kit) return;
		const hasBackorder = kit.items.some((i) => !i.scanned);
		store.dispatch({
			type: 'UPDATE_SUPPLY_KIT',
			payload: {
				id: kit.id,
				updates: {
					status: 'parcial',
					hasBackorder,
					backorderNotes
				}
			}
		});
	}
</script>

{#if !kit}
	<div class="flex h-96 flex-col items-center justify-center gap-4">
		<Package class="text-muted-foreground h-16 w-16" />
		<p class="text-muted-foreground text-lg">Kit no encontrado</p>
		<a
			href="/lmat/kits"
			class="border-border bg-card hover:bg-accent inline-flex items-center rounded-md border px-4 py-2 text-sm"
		>
			Volver a Kits
		</a>
	</div>
{:else}
	{@const statusConfig = KIT_STATUS_CONFIG[kit.status]}
	{@const StatusIcon = statusConfig.icon}
	{@const scannedCount = kit.items.filter((i) => i.scanned).length}
	{@const totalCount = kit.items.length}
	{@const progress = totalCount > 0 ? (scannedCount / totalCount) * 100 : 0}

	<div class="space-y-6">
		<!-- Header -->
		<div class="flex items-center gap-4">
			<a
				href="/lmat/kits"
				class="hover:bg-accent inline-flex h-9 w-9 items-center justify-center rounded-md"
			>
				<ArrowLeft class="h-4 w-4" />
			</a>
			<div class="flex-1">
				<div class="flex items-center gap-3">
					<h1 class="text-2xl font-semibold">Kit #{kit.id.toUpperCase()}</h1>
					<span
						class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium {statusConfig.color}"
					>
						<StatusIcon class="mr-1 h-3 w-3" />
						{statusConfig.label}
					</span>
				</div>
				<p class="text-muted-foreground">
					Folio {kit.folio} - {spec?.model || 'Sin especificacion'} - {kit.cell}
				</p>
			</div>
			<div class="flex gap-2">
				<button
					class="border-border bg-card hover:bg-accent inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm"
				>
					<QrCode class="h-4 w-4" />
					Escanear
				</button>
				<button
					class="border-border bg-card hover:bg-accent inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm"
				>
					<Printer class="h-4 w-4" />
					Imprimir
				</button>
				<button
					class="border-border bg-card hover:bg-accent inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm"
				>
					<Download class="h-4 w-4" />
					Exportar
				</button>
			</div>
		</div>

		<!-- Info Cards -->
		<div class="grid grid-cols-4 gap-4">
			<div class="border-border bg-card rounded-lg border">
				<div class="p-6 pb-2">
					<p class="text-muted-foreground text-sm">Proceso</p>
				</div>
				<div class="p-6 pt-0">
					<span
						class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium {PRODUCTION_PROCESS_COLORS[
							kit.process
						]}"
					>
						{PRODUCTION_PROCESS_LABELS[kit.process]}
					</span>
				</div>
			</div>
			<div class="border-border bg-card rounded-lg border">
				<div class="p-6 pb-2">
					<p class="text-muted-foreground text-sm">Celda</p>
				</div>
				<div class="p-6 pt-0">
					<p class="text-lg font-medium">{kit.cell}</p>
				</div>
			</div>
			<div class="border-border bg-card rounded-lg border">
				<div class="p-6 pb-2">
					<p class="text-muted-foreground text-sm">Progreso</p>
				</div>
				<div class="space-y-2 p-6 pt-0">
					<div class="flex items-center justify-between text-sm">
						<span>{scannedCount} de {totalCount} escaneados</span>
						<span class="font-medium">{Math.round(progress)}%</span>
					</div>
					<div class="bg-secondary h-2 rounded-full">
						<div
							class="bg-primary h-2 rounded-full transition-all"
							style="width: {progress}%"
						></div>
					</div>
				</div>
			</div>
			<div class="border-border bg-card rounded-lg border">
				<div class="p-6 pb-2">
					<p class="text-muted-foreground text-sm">Estado</p>
				</div>
				<div class="p-6 pt-0">
					{#if kit.preparedBy}
						<div class="space-y-1">
							<div class="flex items-center gap-2 text-sm">
								<User class="h-3 w-3" />
								<span>Preparado por: {kit.preparedBy}</span>
							</div>
							{#if kit.deliveredTo}
								<div class="text-muted-foreground flex items-center gap-2 text-sm">
									<Truck class="h-3 w-3" />
									<span>Entregado a: {kit.deliveredTo}</span>
								</div>
							{/if}
						</div>
					{:else}
						<p class="text-muted-foreground text-sm">Sin preparar</p>
					{/if}
				</div>
			</div>
		</div>

		<!-- Items List -->
		<div class="border-border bg-card rounded-lg border">
			<div class="space-y-1.5 p-6">
				<h3 class="font-semibold tracking-tight">Componentes del Kit</h3>
				<p class="text-muted-foreground text-sm">
					Escanea cada componente para confirmar su inclusion en el kit
				</p>
			</div>
			<div class="p-6 pt-0">
				<div class="overflow-hidden rounded-lg border">
					<table class="w-full">
						<thead>
							<tr class="bg-muted/50 border-b">
								<th class="w-12 p-3 text-left"></th>
								<th class="p-3 text-left">Codigo</th>
								<th class="p-3 text-left">Descripcion</th>
								<th class="p-3 text-center">Cant. BOM</th>
								<th class="p-3 text-center">Cant. Surtida</th>
								<th class="p-3 text-center">Backorder</th>
								<th class="p-3 text-left">UdM</th>
								<th class="p-3 text-left">Estado</th>
								<th class="p-3 text-left">Accion</th>
							</tr>
						</thead>
						<tbody>
							{#each kit.items as item (item.id)}
								<tr class="border-b {item.scanned ? 'bg-emerald-500/5' : ''}">
									<td class="p-3">
										<input
											type="checkbox"
											checked={item.scanned}
											disabled={item.scanned}
											onchange={() => handleScanItem(item.id)}
											class="h-4 w-4 rounded border"
										/>
									</td>
									<td class="p-3 font-mono text-sm">{item.articleCode}</td>
									<td class="p-3">{item.articleDescription}</td>
									<td class="p-3 text-center font-medium">{item.quantityBOM}</td>
									<td class="p-3 text-center">
										<span
											class={item.quantitySupplied === item.quantityBOM
												? 'text-emerald-500'
												: 'text-destructive'}
										>
											{item.quantitySupplied}
										</span>
									</td>
									<td class="p-3 text-center">
										{#if item.quantityBackorder > 0}
											<span
												class="bg-destructive text-destructive-foreground inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
											>
												{item.quantityBackorder}
											</span>
										{:else}
											<span class="text-muted-foreground">-</span>
										{/if}
									</td>
									<td class="text-muted-foreground p-3">{item.udm}</td>
									<td class="p-3">
										{#if item.scanned}
											<span
												class="inline-flex items-center rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs font-medium text-emerald-400"
											>
												<CircleCheckBig class="mr-1 h-3 w-3" />
												Escaneado
											</span>
										{:else if item.quantityBackorder > 0}
											<span
												class="bg-destructive text-destructive-foreground inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
											>
												<TriangleAlert class="mr-1 h-3 w-3" />
												Backorder
											</span>
										{:else}
											<span
												class="border-border inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium"
											>
												Pendiente
											</span>
										{/if}
									</td>
									<td class="p-3">
										{#if !item.scanned}
											<button
												onclick={() => handleScanItem(item.id)}
												class="border-border bg-card hover:bg-accent inline-flex items-center gap-1 rounded-md border px-3 py-1.5 text-sm"
											>
												<QrCode class="mr-1 h-3 w-3" />
												Escanear
											</button>
										{/if}
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			</div>
		</div>

		<!-- Backorder Notes -->
		{#if kit.hasBackorder}
			<div class="border-destructive/50 bg-card rounded-lg border">
				<div class="space-y-1.5 p-6">
					<h3 class="text-destructive flex items-center gap-2 font-semibold tracking-tight">
						<TriangleAlert class="h-5 w-5" />
						Backorder
					</h3>
					<p class="text-muted-foreground text-sm">
						Este kit tiene componentes pendientes de surtir
					</p>
				</div>
				<div class="p-6 pt-0">
					<p class="mb-4 text-sm">{kit.backorderNotes || 'Sin notas de backorder'}</p>
				</div>
			</div>
		{/if}

		<!-- Actions -->
		<div class="border-border bg-card rounded-lg border">
			<div class="space-y-1.5 p-6">
				<h3 class="font-semibold tracking-tight">Acciones</h3>
			</div>
			<div class="space-y-4 p-6 pt-0">
				<div class="flex gap-4">
					{#if kit.status !== 'entregado' && progress === 100}
						<button
							onclick={handleMarkDelivered}
							class="inline-flex items-center gap-2 rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
						>
							<Truck class="h-4 w-4" />
							Marcar como Entregado
						</button>
					{/if}
					{#if kit.status !== 'entregado' && progress < 100}
						<div class="flex-1 space-y-3">
							<textarea
								placeholder="Notas de backorder (ej: Cristal trasero en transito - llega manana)"
								bind:value={backorderNotes}
								class="border-border bg-card placeholder:text-muted-foreground w-full rounded-md border px-3 py-2 text-sm outline-none"
							></textarea>
							<button
								onclick={handleMarkBackorder}
								class="border-border bg-card hover:bg-accent inline-flex items-center gap-2 rounded-md border px-4 py-2 text-sm"
							>
								<TriangleAlert class="h-4 w-4" />
								Registrar Backorder
							</button>
						</div>
					{/if}
				</div>
			</div>
		</div>
	</div>
{/if}
