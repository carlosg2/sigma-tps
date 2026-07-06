<script lang="ts">
	import { page } from '$app/state';
	import { useStore } from '$lib/tps/store.svelte.js';
	import { PRODUCTION_PROCESS_LABELS, PRODUCTION_PROCESS_COLORS } from '$lib/tps/constants.js';
	import StatusBadge from '$lib/tps/components/status-badge.svelte';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Table from '$lib/components/ui/table/index.js';
	import * as Alert from '$lib/components/ui/alert/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Checkbox } from '$lib/components/ui/checkbox/index.js';
	import { Textarea } from '$lib/components/ui/textarea/index.js';
	import { Progress } from '$lib/components/ui/progress/index.js';
	import { Separator } from '$lib/components/ui/separator/index.js';
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
	<div class="mx-auto flex w-full max-w-5xl flex-col items-center justify-center gap-4 py-20">
		<Package class="text-muted-foreground size-16" />
		<p class="text-muted-foreground text-lg">Kit no encontrado</p>
		<Button href="/lmat/kits" variant="outline" size="sm">Volver a Kits</Button>
	</div>
{:else}
	{@const statusConfig = KIT_STATUS_CONFIG[kit.status]}
	{@const scannedCount = kit.items.filter((i) => i.scanned).length}
	{@const totalCount = kit.items.length}
	{@const progress = totalCount > 0 ? (scannedCount / totalCount) * 100 : 0}

	<div class="mx-auto flex w-full max-w-5xl flex-col gap-6">
		<!-- Header -->
		<div class="flex flex-wrap items-start gap-4">
			<Button href="/lmat/kits" variant="outline" size="icon" class="shrink-0">
				<ArrowLeft />
			</Button>
			<div class="flex min-w-0 flex-1 flex-col gap-1">
				<div class="flex flex-wrap items-center gap-2">
					<h2 class="text-xl font-semibold sm:text-2xl">Kit #{kit.id.toUpperCase()}</h2>
					<StatusBadge label={statusConfig.label} colorClass={statusConfig.color} />
				</div>
				<p class="text-muted-foreground truncate text-sm">
					Folio {kit.folio} - {spec?.model || 'Sin especificacion'} - {kit.cell}
				</p>
			</div>
			<div class="flex w-full flex-wrap gap-2 sm:w-auto">
				<Button variant="outline" size="sm" class="flex-1 sm:flex-none">
					<QrCode data-icon="inline-start" /> Escanear
				</Button>
				<Button variant="outline" size="sm" class="flex-1 sm:flex-none">
					<Printer data-icon="inline-start" /> Imprimir
				</Button>
				<Button variant="outline" size="sm" class="flex-1 sm:flex-none">
					<Download data-icon="inline-start" /> Exportar
				</Button>
			</div>
		</div>

		<!-- Info Cards -->
		<div class="grid grid-cols-2 gap-4 md:grid-cols-2 lg:grid-cols-4">
			<Card.Root>
				<Card.Header>
					<Card.Description>Proceso</Card.Description>
				</Card.Header>
				<Card.Content>
					<StatusBadge label={PRODUCTION_PROCESS_LABELS[kit.process]} colorClass={PRODUCTION_PROCESS_COLORS[kit.process]} />
				</Card.Content>
			</Card.Root>
			<Card.Root>
				<Card.Header>
					<Card.Description>Celda</Card.Description>
					<Card.Title class="text-lg">{kit.cell}</Card.Title>
				</Card.Header>
			</Card.Root>
			<Card.Root>
				<Card.Header>
					<Card.Description>Progreso</Card.Description>
				</Card.Header>
				<Card.Content class="flex flex-col gap-2">
					<div class="flex items-center justify-between text-sm">
						<span>{scannedCount} de {totalCount} escaneados</span>
						<span class="font-medium tabular-nums">{Math.round(progress)}%</span>
					</div>
					<Progress value={progress} max={100} />
				</Card.Content>
			</Card.Root>
			<Card.Root>
				<Card.Header>
					<Card.Description>Estado</Card.Description>
				</Card.Header>
				<Card.Content>
					{#if kit.preparedBy}
						<div class="flex flex-col gap-1">
							<div class="flex items-center gap-2 text-sm">
								<User class="size-3" />
								<span>Preparado por: {kit.preparedBy}</span>
							</div>
							{#if kit.deliveredTo}
								<div class="text-muted-foreground flex items-center gap-2 text-sm">
									<Truck class="size-3" />
									<span>Entregado a: {kit.deliveredTo}</span>
								</div>
							{/if}
						</div>
					{:else}
						<p class="text-muted-foreground text-sm">Sin preparar</p>
					{/if}
				</Card.Content>
			</Card.Root>
		</div>

		<!-- Items List -->
		<Card.Root>
			<Card.Header class="border-b">
				<Card.Title>Componentes del Kit</Card.Title>
				<Card.Description>
					Escanea cada componente para confirmar su inclusion en el kit
				</Card.Description>
			</Card.Header>
			<Card.Content class="p-0">
				<!-- Vista desktop: tabla -->
				<div class="hidden overflow-x-auto md:block">
					<Table.Root>
						<Table.Header>
							<Table.Row>
								<Table.Head class="w-12"></Table.Head>
								<Table.Head>Codigo</Table.Head>
								<Table.Head>Descripcion</Table.Head>
								<Table.Head class="text-center">Cant. BOM</Table.Head>
								<Table.Head class="text-center">Cant. Surtida</Table.Head>
								<Table.Head class="text-center">Backorder</Table.Head>
								<Table.Head>UdM</Table.Head>
								<Table.Head>Estado</Table.Head>
								<Table.Head>Accion</Table.Head>
							</Table.Row>
						</Table.Header>
						<Table.Body>
							{#each kit.items as item (item.id)}
								<Table.Row class={item.scanned ? 'bg-emerald-500/5' : ''}>
									<Table.Cell>
										<Checkbox
											checked={item.scanned}
											disabled={item.scanned}
											onCheckedChange={() => handleScanItem(item.id)}
										/>
									</Table.Cell>
									<Table.Cell class="font-mono text-sm">{item.articleCode}</Table.Cell>
									<Table.Cell>{item.articleDescription}</Table.Cell>
									<Table.Cell class="text-center font-medium tabular-nums">{item.quantityBOM}</Table.Cell>
									<Table.Cell class="text-center tabular-nums">
										<span class={item.quantitySupplied === item.quantityBOM ? 'text-emerald-500' : 'text-destructive'}>
											{item.quantitySupplied}
										</span>
									</Table.Cell>
									<Table.Cell class="text-center">
										{#if item.quantityBackorder > 0}
											<StatusBadge label={String(item.quantityBackorder)} colorClass="bg-destructive text-destructive-foreground" />
										{:else}
											<span class="text-muted-foreground">-</span>
										{/if}
									</Table.Cell>
									<Table.Cell class="text-muted-foreground">{item.udm}</Table.Cell>
									<Table.Cell>
										{#if item.scanned}
											<StatusBadge label="Escaneado" colorClass="bg-emerald-500/15 text-emerald-400" />
										{:else if item.quantityBackorder > 0}
											<StatusBadge label="Backorder" colorClass="bg-destructive text-destructive-foreground" />
										{:else}
											<StatusBadge label="Pendiente" colorClass="bg-muted text-muted-foreground" />
										{/if}
									</Table.Cell>
									<Table.Cell>
										{#if !item.scanned}
											<Button variant="outline" size="sm" onclick={() => handleScanItem(item.id)}>
												<QrCode data-icon="inline-start" /> Escanear
											</Button>
										{/if}
									</Table.Cell>
								</Table.Row>
							{/each}
						</Table.Body>
					</Table.Root>
				</div>

				<!-- Vista mobile: tarjetas -->
				<div class="flex flex-col divide-y md:hidden">
					{#each kit.items as item (item.id)}
						<div class="flex items-start gap-3 p-4 {item.scanned ? 'bg-emerald-500/5' : ''}">  
							<Checkbox
								checked={item.scanned}
								disabled={item.scanned}
								onCheckedChange={() => handleScanItem(item.id)}
								class="mt-0.5 shrink-0"
							/>
							<div class="flex min-w-0 flex-1 flex-col gap-2">
								<div class="flex items-start justify-between gap-2">
									<div class="min-w-0">
										<p class="font-mono text-sm font-medium">{item.articleCode}</p>
										<p class="text-muted-foreground truncate text-sm">{item.articleDescription}</p>
									</div>
									{#if item.scanned}
										<StatusBadge label="Escaneado" colorClass="bg-emerald-500/15 text-emerald-400" />
									{:else if item.quantityBackorder > 0}
										<StatusBadge label="Backorder" colorClass="bg-destructive text-destructive-foreground" />
									{:else}
										<StatusBadge label="Pendiente" colorClass="bg-muted text-muted-foreground" />
									{/if}
								</div>
								<div class="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
									<span class="text-muted-foreground">BOM: <span class="text-foreground font-medium tabular-nums">{item.quantityBOM} {item.udm}</span></span>
									<span class="text-muted-foreground">Surtido: <span class="tabular-nums {item.quantitySupplied === item.quantityBOM ? 'text-emerald-500' : 'text-destructive'} font-medium">{item.quantitySupplied}</span></span>
									{#if item.quantityBackorder > 0}
										<span class="text-muted-foreground">Backorder: <span class="text-destructive font-medium tabular-nums">{item.quantityBackorder}</span></span>
									{/if}
								</div>
								{#if !item.scanned}
									<Button variant="outline" size="sm" class="w-full" onclick={() => handleScanItem(item.id)}>
										<QrCode data-icon="inline-start" /> Escanear
									</Button>
								{/if}
							</div>
						</div>
					{/each}
				</div>
			</Card.Content>
		</Card.Root>

		<!-- Backorder Notes -->
		{#if kit.hasBackorder}
			<Alert.Root variant="destructive">
				<TriangleAlert />
				<Alert.Title>Backorder</Alert.Title>
				<Alert.Description>
					{kit.backorderNotes || 'Este kit tiene componentes pendientes de surtir'}
				</Alert.Description>
			</Alert.Root>
		{/if}

		<!-- Actions -->
		<Card.Root>
			<Card.Header class="border-b">
				<Card.Title>Acciones</Card.Title>
			</Card.Header>
			<Card.Content class="flex flex-col gap-4">
				{#if kit.status !== 'entregado' && progress === 100}
					<Button class="w-full sm:w-auto" onclick={handleMarkDelivered}>
						<Truck data-icon="inline-start" /> Marcar como Entregado
					</Button>
				{/if}
				{#if kit.status !== 'entregado' && progress < 100}
					<div class="flex flex-col gap-3">
						<Textarea
							placeholder="Notas de backorder (ej: Cristal trasero en transito - llega manana)"
							bind:value={backorderNotes}
						/>
						<Button variant="outline" class="w-full sm:w-auto sm:self-start" onclick={handleMarkBackorder}>
							<TriangleAlert data-icon="inline-start" /> Registrar Backorder
						</Button>
					</div>
				{/if}
			</Card.Content>
		</Card.Root>
	</div>
{/if}
