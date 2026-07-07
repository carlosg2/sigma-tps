<script lang="ts">
	import { browser } from '$app/environment';
	import { useFinanzasStore } from '$lib/tps/finanzas/store.svelte.js';
	import { AVISO_ESTADO_COLORS, AVISO_ESTADO_LABELS, fmtMoney, isValidEmail } from '$lib/tps/finanzas/constants.js';
	import AvisoPreview from '$lib/tps/finanzas/components/aviso-preview.svelte';
	import StatusBadge from '$lib/tps/components/status-badge.svelte';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Table from '$lib/components/ui/table/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import * as Field from '$lib/components/ui/field/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { toast } from 'svelte-sonner';
	import Search from '@lucide/svelte/icons/search';
	import RotateCcw from '@lucide/svelte/icons/rotate-ccw';
	import Download from '@lucide/svelte/icons/download';
	import Mail from '@lucide/svelte/icons/mail';
	import RefreshCw from '@lucide/svelte/icons/refresh-cw';
	import Send from '@lucide/svelte/icons/send';

	const store = useFinanzasStore();
	const data = $derived(store.state);

	let query = $state('');
	let provFilter = $state<string>('todos');
	let estadoFilter = $state<string>('todos');

	const provLabel = $derived(
		provFilter === 'todos' ? 'Todos los proveedores' : (store.getProveedor(+provFilter)?.nombre.split(' ').slice(0, 3).join(' ') ?? '')
	);
	const estadoLabel = $derived(estadoFilter === 'todos' ? 'Todos los estados' : AVISO_ESTADO_LABELS[estadoFilter as keyof typeof AVISO_ESTADO_LABELS]);

	const filtered = $derived.by(() => {
		const q = query.toLowerCase();
		return data.historial.filter((h) => {
			const p = store.getProveedor(h.provId);
			const match =
				!q ||
				(p?.nombre.toLowerCase().includes(q) ?? false) ||
				h.ref.toLowerCase().includes(q) ||
				h.facturas.some((f) => f.num.toLowerCase().includes(q));
			const provOk = provFilter === 'todos' || h.provId === +provFilter;
			const estadoOk = estadoFilter === 'todos' || h.estado === estadoFilter;
			return match && provOk && estadoOk;
		});
	});

	function resetFilters() {
		query = '';
		provFilter = 'todos';
		estadoFilter = 'todos';
	}

	// --- Ver correo ---
	let viewId = $state<number | null>(null);
	const viewing = $derived(viewId !== null ? store.getHistorial(viewId) : undefined);
	const viewingProv = $derived(viewing ? store.getProveedor(viewing.provId) : undefined);

	// --- Reenviar ---
	let reenviarId = $state<number | null>(null);
	const reenviarItem = $derived(reenviarId !== null ? store.getHistorial(reenviarId) : undefined);
	const reenviarProv = $derived(reenviarItem ? store.getProveedor(reenviarItem.provId) : undefined);
	let reenviarEmail = $state('');

	function openReenviar(id: number) {
		const h = store.getHistorial(id);
		const p = h ? store.getProveedor(h.provId) : undefined;
		reenviarId = id;
		reenviarEmail = h?.correo || (p ? store.correoDestino(p) : '');
	}

	const reenviarInvalid = $derived(!isValidEmail(reenviarEmail.trim()));

	function confirmReenviar() {
		if (reenviarId === null) return;
		if (reenviarInvalid) {
			toast.warning('Ingresa un correo válido.');
			return;
		}
		store.reenviarHistorial(reenviarId, reenviarEmail.trim());
		toast.success(`Aviso reenviado a ${reenviarEmail.trim()}`);
		reenviarId = null;
	}

	function exportCSV() {
		const rows = [
			['Folio', 'Fecha', 'Proveedor', 'RFC', 'Facturas', 'Monto', 'Correo', 'Referencia SPEI', 'Estado'],
			...data.historial.map((h) => {
				const p = store.getProveedor(h.provId);
				return [
					String(h.id),
					h.fecha,
					p?.nombre ?? '',
					p?.rfc ?? '',
					h.facturas.map((f) => f.num).join(' | '),
					String(h.monto),
					h.correo,
					h.ref,
					AVISO_ESTADO_LABELS[h.estado]
				];
			})
		];
		const csv = rows.map((r) => r.map((v) => `"${v}"`).join(',')).join('\n');
		if (!browser) return;
		const a = document.createElement('a');
		a.href = 'data:text/csv;charset=utf-8,\uFEFF' + encodeURIComponent(csv);
		a.download = 'historial_avisos_pago.csv';
		a.click();
		toast.success('Historial exportado a CSV.');
	}
</script>

<div class="flex flex-col gap-6">
	<div class="flex flex-wrap items-center justify-between gap-3">
		<div>
			<h2 class="text-xl font-semibold">Historial de Avisos</h2>
			<p class="text-muted-foreground text-sm">Registro completo de notificaciones enviadas a proveedores</p>
		</div>
		<Button variant="outline" size="sm" onclick={exportCSV}>
			<Download data-icon="inline-start" /> Exportar CSV
		</Button>
	</div>

	<Card.Root>
		<Card.Header>
			<div class="flex flex-wrap items-center gap-2">
				<div class="relative w-full max-w-xs flex-1">
					<Search class="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
					<Input placeholder="Buscar proveedor, referencia, factura…" bind:value={query} class="pl-8" />
				</div>
				<Select.Root type="single" bind:value={provFilter}>
					<Select.Trigger size="sm" class="w-52">{provLabel}</Select.Trigger>
					<Select.Content>
						<Select.Item value="todos">Todos los proveedores</Select.Item>
						{#each data.proveedores as p (p.id)}
							<Select.Item value={String(p.id)}>{p.nombre.split(' ').slice(0, 3).join(' ')}</Select.Item>
						{/each}
					</Select.Content>
				</Select.Root>
				<Select.Root type="single" bind:value={estadoFilter}>
					<Select.Trigger size="sm" class="w-40">{estadoLabel}</Select.Trigger>
					<Select.Content>
						<Select.Item value="todos">Todos los estados</Select.Item>
						<Select.Item value="enviado">Enviado</Select.Item>
						<Select.Item value="error">Con error</Select.Item>
						<Select.Item value="sin_correo">Sin correo</Select.Item>
					</Select.Content>
				</Select.Root>
				<Button variant="ghost" size="sm" class="ms-auto" onclick={resetFilters}>
					<RotateCcw data-icon="inline-start" /> Limpiar
				</Button>
			</div>
		</Card.Header>
		<Card.Content>
			<Table.Root>
				<Table.Header>
					<Table.Row>
						<Table.Head>Folio</Table.Head>
						<Table.Head>Fecha / Hora</Table.Head>
						<Table.Head>Proveedor</Table.Head>
						<Table.Head>Facturas</Table.Head>
						<Table.Head class="text-right">Monto</Table.Head>
						<Table.Head>Enviado a</Table.Head>
						<Table.Head class="text-center">Estado</Table.Head>
						<Table.Head class="text-right">Acciones</Table.Head>
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{#each filtered as h (h.id)}
						{@const p = store.getProveedor(h.provId)}
						{@const facNums = h.facturas.map((f) => f.num).join(', ')}
						<Table.Row>
							<Table.Cell><span class="text-primary font-mono text-xs font-semibold">#{h.id}</span></Table.Cell>
							<Table.Cell>
								<p class="text-sm">{h.fecha.split(' ')[0]}</p>
								<p class="text-muted-foreground text-xs tabular-nums">{h.fecha.slice(11, 19)}</p>
							</Table.Cell>
							<Table.Cell>
								<p class="text-sm font-medium">{p?.nombre.split(' ').slice(0, 3).join(' ')}</p>
								<p class="text-muted-foreground font-mono text-xs">{p?.rfc}</p>
							</Table.Cell>
							<Table.Cell class="text-muted-foreground max-w-40 truncate text-xs" title={facNums}>{facNums}</Table.Cell>
							<Table.Cell class="text-right font-semibold tabular-nums">{fmtMoney(h.monto)}</Table.Cell>
							<Table.Cell class="text-sm">{h.correo || '—'}</Table.Cell>
							<Table.Cell class="text-center">
								<StatusBadge label={AVISO_ESTADO_LABELS[h.estado]} colorClass={AVISO_ESTADO_COLORS[h.estado]} />
							</Table.Cell>
							<Table.Cell>
								<div class="flex justify-end gap-1">
									<Button size="icon" variant="ghost" onclick={() => (viewId = h.id)} title="Ver correo">
										<Mail />
									</Button>
									{#if h.estado !== 'enviado'}
										<Button size="icon" variant="ghost" onclick={() => openReenviar(h.id)} title="Reenviar">
											<RefreshCw />
										</Button>
									{/if}
								</div>
							</Table.Cell>
						</Table.Row>
					{/each}
					{#if filtered.length === 0}
						<Table.Row>
							<Table.Cell colspan={8} class="text-muted-foreground py-10 text-center text-sm">
								Sin registros con los filtros aplicados.
							</Table.Cell>
						</Table.Row>
					{/if}
				</Table.Body>
			</Table.Root>
			<p class="text-muted-foreground mt-3 text-xs">Mostrando {filtered.length} de {data.historial.length} registros</p>
		</Card.Content>
	</Card.Root>
</div>

<!-- ── VER CORREO ── -->
<Dialog.Root open={viewId !== null} onOpenChange={(o) => { if (!o) viewId = null; }}>
	<Dialog.Content class="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
		{#if viewing && viewingProv}
			<Dialog.Header>
				<Dialog.Title>Aviso #{viewing.id} · {viewingProv.nombre.split(' ').slice(0, 3).join(' ')}</Dialog.Title>
				<Dialog.Description>Copia del aviso de pago enviado al proveedor.</Dialog.Description>
			</Dialog.Header>
			<AvisoPreview
				prov={viewingProv}
				facturas={viewing.facturas}
				fecha={viewing.fecha.split(' ')[0]}
				ref={viewing.ref}
				banco={viewing.banco}
				correo={viewing.correo || store.correoDestino(viewingProv)}
				folio={viewing.id}
			/>
			<Dialog.Footer>
				<Button variant="outline" onclick={() => (viewId = null)}>Cerrar</Button>
			</Dialog.Footer>
		{/if}
	</Dialog.Content>
</Dialog.Root>

<!-- ── REENVIAR ── -->
<Dialog.Root open={reenviarId !== null} onOpenChange={(o) => { if (!o) reenviarId = null; }}>
	<Dialog.Content class="sm:max-w-md">
		{#if reenviarItem && reenviarProv}
			<Dialog.Header>
				<Dialog.Title>Reenviar aviso de pago</Dialog.Title>
				<Dialog.Description>Reenviar el aviso a {reenviarProv.nombre}.</Dialog.Description>
			</Dialog.Header>
			<Field.FieldGroup>
				<Field.Field data-invalid={reenviarInvalid ? true : undefined}>
					<Field.FieldLabel for="reenviar-email">Correo destino</Field.FieldLabel>
					<Input id="reenviar-email" type="email" bind:value={reenviarEmail} aria-invalid={reenviarInvalid ? true : undefined} />
					<Field.FieldDescription>
						{#if reenviarInvalid}
							Ingresa un correo válido.
						{:else}
							Puedes corregir el correo si el anterior era incorrecto.
						{/if}
					</Field.FieldDescription>
				</Field.Field>
			</Field.FieldGroup>
			<Dialog.Footer>
				<Button variant="outline" onclick={() => (reenviarId = null)}>Cancelar</Button>
				<Button onclick={confirmReenviar} disabled={reenviarInvalid}>
					<Send data-icon="inline-start" /> Reenviar
				</Button>
			</Dialog.Footer>
		{/if}
	</Dialog.Content>
</Dialog.Root>
