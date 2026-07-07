<script lang="ts">
	import { goto } from '$app/navigation';
	import { useFinanzasStore } from '$lib/tps/finanzas/store.svelte.js';
	import { EGRESO_AVISO_COLORS, EGRESO_AVISO_LABELS, fmtMoney } from '$lib/tps/finanzas/constants.js';
	import type { Egreso } from '$lib/tps/finanzas/types.js';
	import AvisoPreview from '$lib/tps/finanzas/components/aviso-preview.svelte';
	import StatusBadge from '$lib/tps/components/status-badge.svelte';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Table from '$lib/components/ui/table/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import * as Tabs from '$lib/components/ui/tabs/index.js';
	import * as Alert from '$lib/components/ui/alert/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Checkbox } from '$lib/components/ui/checkbox/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { Spinner } from '$lib/components/ui/spinner/index.js';
	import { toast } from 'svelte-sonner';
	import Search from '@lucide/svelte/icons/search';
	import RotateCcw from '@lucide/svelte/icons/rotate-ccw';
	import Eye from '@lucide/svelte/icons/eye';
	import Send from '@lucide/svelte/icons/send';
	import X from '@lucide/svelte/icons/x';
	import Info from '@lucide/svelte/icons/info';

	const store = useFinanzasStore();
	const data = $derived(store.state);

	let query = $state('');
	let provFilter = $state<string>('todos');
	let estadoFilter = $state<string>('todos');

	const provLabel = $derived(
		provFilter === 'todos' ? 'Todos los proveedores' : (store.getProveedor(+provFilter)?.nombre.split(' ').slice(0, 3).join(' ') ?? '')
	);
	const estadoLabel = $derived(estadoFilter === 'todos' ? 'Todos los estados' : EGRESO_AVISO_LABELS[estadoFilter as keyof typeof EGRESO_AVISO_LABELS]);

	const filtered = $derived.by(() => {
		const q = query.toLowerCase();
		return data.egresos.filter((e) => {
			const p = store.getProveedor(e.provId);
			const match =
				!q ||
				e.id.toLowerCase().includes(q) ||
				(p?.nombre.toLowerCase().includes(q) ?? false) ||
				e.facturas.some((f) => f.num.toLowerCase().includes(q)) ||
				e.ref.toLowerCase().includes(q);
			const provOk = provFilter === 'todos' || e.provId === +provFilter;
			const estadoOk = estadoFilter === 'todos' || e.aviso === estadoFilter;
			return match && provOk && estadoOk;
		});
	});

	const pendientesCount = $derived(data.egresos.filter((e) => e.aviso === 'pendiente').length);
	const errorCount = $derived(data.egresos.filter((e) => e.aviso === 'error').length);

	function resetFilters() {
		query = '';
		provFilter = 'todos';
		estadoFilter = 'todos';
	}

	// --- Seleccion (solo egresos no enviados) ---
	let selected = $state<string[]>([]);
	const selectables = $derived(filtered.filter((e) => e.aviso !== 'enviado'));
	const allSelected = $derived(selectables.length > 0 && selectables.every((e) => selected.includes(e.id)));
	const someSelected = $derived(!allSelected && selectables.some((e) => selected.includes(e.id)));
	const selTotal = $derived(selected.reduce((a, id) => a + (store.getEgreso(id)?.monto ?? 0), 0));

	function toggleOne(id: string, checked: boolean) {
		selected = checked ? [...selected, id] : selected.filter((x) => x !== id);
	}

	function toggleAll(checked: boolean) {
		if (checked) {
			const ids = selectables.map((e) => e.id);
			selected = [...new Set([...selected, ...ids])];
		} else {
			const ids = new Set(selectables.map((e) => e.id));
			selected = selected.filter((id) => !ids.has(id));
		}
	}

	function deselectAll() {
		selected = [];
	}

	// --- Preview individual ---
	let previewId = $state<string | null>(null);
	const previewEgreso = $derived(previewId ? store.getEgreso(previewId) : undefined);
	const previewProv = $derived(previewEgreso ? store.getProveedor(previewEgreso.provId) : undefined);

	// --- Preview de lote ---
	let loteOpen = $state(false);
	const loteEgresos = $derived(selected.map((id) => store.getEgreso(id)).filter((e): e is Egreso => !!e));
	const loteSinCorreo = $derived(loteEgresos.filter((e) => { const p = store.getProveedor(e.provId); return p ? !store.correoDestino(p) : true; }).length);

	let sending = $state(false);

	function enviarUno(id: string) {
		const e = store.getEgreso(id);
		const estado = store.enviarAviso(id);
		selected = selected.filter((x) => x !== id);
		if (estado === 'enviado') toast.success(`Aviso enviado · ${e?.id}`);
		else if (estado === 'sin_correo') toast.warning('Sin correo de avisos configurado para este proveedor.');
	}

	function confirmarLote() {
		if (!selected.length) return;
		sending = true;
		const ids = [...selected];
		// Simula latencia de envio manteniendo la UI responsiva.
		setTimeout(() => {
			const { sent, nomail } = store.enviarLote(ids);
			selected = [];
			loteOpen = false;
			sending = false;
			if (sent > 0) toast.success(`${sent} aviso${sent > 1 ? 's' : ''} enviado${sent > 1 ? 's' : ''} correctamente.`);
			if (nomail > 0) toast.warning(`${nomail} sin correo. Configúralo en Proveedores.`);
			setTimeout(() => goto('/finanzas/historial'), 900);
		}, 900);
	}
</script>

<div class="flex flex-col gap-6">
	<div class="flex flex-wrap items-center justify-between gap-3">
		<div>
			<h2 class="text-xl font-semibold">Egresos del ERP</h2>
			<p class="text-muted-foreground text-sm">Selecciona egresos para enviar el aviso de pago al proveedor</p>
		</div>
		<Badge variant="outline" class="font-mono">GAP-FIN-004</Badge>
	</div>

	{#if selected.length > 0}
		<Card.Root class="border-primary/50 bg-primary/5 sticky top-16 z-30">
			<Card.Content class="flex flex-wrap items-center justify-between gap-3 py-4">
				<div>
					<p class="text-sm font-semibold">
						{selected.length} egreso{selected.length > 1 ? 's' : ''} seleccionado{selected.length > 1 ? 's' : ''}
					</p>
					<p class="text-muted-foreground text-xs tabular-nums">Total: {fmtMoney(selTotal)} MXN</p>
				</div>
				<div class="flex flex-wrap gap-2">
					<Button variant="ghost" size="sm" onclick={deselectAll}>
						<X data-icon="inline-start" /> Deseleccionar
					</Button>
					<Button variant="outline" size="sm" onclick={() => (loteOpen = true)}>
						<Eye data-icon="inline-start" /> Ver preview
					</Button>
					<Button size="sm" onclick={() => (loteOpen = true)}>
						<Send data-icon="inline-start" /> Enviar avisos
					</Button>
				</div>
			</Card.Content>
		</Card.Root>
	{/if}

	<Card.Root>
		<Card.Header>
			<div class="flex flex-wrap items-center gap-2">
				<div class="relative w-full max-w-xs flex-1">
					<Search class="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
					<Input placeholder="Buscar folio, proveedor, factura…" bind:value={query} class="pl-8" />
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
					<Select.Trigger size="sm" class="w-44">{estadoLabel}</Select.Trigger>
					<Select.Content>
						<Select.Item value="todos">Todos los estados</Select.Item>
						<Select.Item value="pendiente">Pendiente de aviso</Select.Item>
						<Select.Item value="sin_correo">Sin correo</Select.Item>
						<Select.Item value="error">Con error</Select.Item>
						<Select.Item value="enviado">Aviso enviado</Select.Item>
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
						<Table.Head class="w-10">
							<Checkbox
								checked={allSelected}
								indeterminate={someSelected}
								disabled={selectables.length === 0}
								onCheckedChange={(v) => toggleAll(v === true)}
								aria-label="Seleccionar todos"
							/>
						</Table.Head>
						<Table.Head>Folio ERP</Table.Head>
						<Table.Head>Fecha</Table.Head>
						<Table.Head>Proveedor</Table.Head>
						<Table.Head class="text-center">Fact.</Table.Head>
						<Table.Head class="text-right">Monto</Table.Head>
						<Table.Head>Ref. SPEI</Table.Head>
						<Table.Head class="text-center">Estado</Table.Head>
						<Table.Head class="text-right">Acciones</Table.Head>
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{#each filtered as e (e.id)}
						{@const p = store.getProveedor(e.provId)}
						{@const canSelect = e.aviso !== 'enviado'}
						{@const isSel = selected.includes(e.id)}
						<Table.Row data-state={isSel ? 'selected' : undefined}>
							<Table.Cell>
								{#if canSelect}
									<Checkbox checked={isSel} onCheckedChange={(v) => toggleOne(e.id, v === true)} aria-label="Seleccionar egreso" />
								{:else}
									<span class="text-muted-foreground">—</span>
								{/if}
							</Table.Cell>
							<Table.Cell><span class="text-primary font-mono text-xs font-semibold">{e.id}</span></Table.Cell>
							<Table.Cell class="text-muted-foreground text-xs whitespace-nowrap">{e.fecha}</Table.Cell>
							<Table.Cell>
								<p class="text-sm font-medium">{p?.nombre.split(' ').slice(0, 3).join(' ')}</p>
								<p class="text-muted-foreground font-mono text-xs">{p?.rfc}</p>
							</Table.Cell>
							<Table.Cell class="text-center">
								<Badge variant="secondary">{e.facturas.length}</Badge>
							</Table.Cell>
							<Table.Cell class="text-right font-semibold tabular-nums">{fmtMoney(e.monto)}</Table.Cell>
							<Table.Cell class="text-muted-foreground font-mono text-xs">{e.ref}</Table.Cell>
							<Table.Cell class="text-center">
								<StatusBadge label={EGRESO_AVISO_LABELS[e.aviso]} colorClass={EGRESO_AVISO_COLORS[e.aviso]} />
							</Table.Cell>
							<Table.Cell>
								<div class="flex justify-end gap-1">
									<Button size="icon" variant="ghost" onclick={() => (previewId = e.id)} title="Ver aviso">
										<Eye />
									</Button>
									{#if canSelect}
										<Button size="icon" variant="ghost" onclick={() => enviarUno(e.id)} title="Enviar aviso">
											<Send />
										</Button>
									{/if}
								</div>
							</Table.Cell>
						</Table.Row>
					{/each}
					{#if filtered.length === 0}
						<Table.Row>
							<Table.Cell colspan={9} class="text-muted-foreground py-10 text-center text-sm">
								Sin egresos con los filtros seleccionados.
							</Table.Cell>
						</Table.Row>
					{/if}
				</Table.Body>
			</Table.Root>
			<p class="text-muted-foreground mt-3 text-xs">
				Mostrando {filtered.length} de {data.egresos.length} egresos · {pendientesCount} pendientes · {errorCount} con error
			</p>
		</Card.Content>
	</Card.Root>
</div>

<!-- ── PREVIEW INDIVIDUAL ── -->
<Dialog.Root open={previewId !== null} onOpenChange={(o) => { if (!o) previewId = null; }}>
	<Dialog.Content class="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
		{#if previewEgreso && previewProv}
			<Dialog.Header>
				<Dialog.Title class="font-mono">Preview · {previewEgreso.id}</Dialog.Title>
				<Dialog.Description>Así recibirá el correo el proveedor. Verifica los datos antes de enviar.</Dialog.Description>
			</Dialog.Header>
			<AvisoPreview
				prov={previewProv}
				facturas={previewEgreso.facturas}
				fecha={previewEgreso.fecha}
				ref={previewEgreso.ref}
				banco={previewEgreso.banco}
				correo={store.correoDestino(previewProv)}
				folio={previewEgreso.id}
			/>
			<Dialog.Footer>
				<Button variant="outline" onclick={() => (previewId = null)}>Cerrar</Button>
				{#if previewEgreso.aviso !== 'enviado'}
					{@const id = previewEgreso.id}
					<Button onclick={() => { enviarUno(id); previewId = null; }}>
						<Send data-icon="inline-start" /> Confirmar y enviar
					</Button>
				{/if}
			</Dialog.Footer>
		{/if}
	</Dialog.Content>
</Dialog.Root>

<!-- ── PREVIEW DE LOTE ── -->
<Dialog.Root open={loteOpen} onOpenChange={(o) => (loteOpen = o)}>
	<Dialog.Content class="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
		<Dialog.Header>
			<Dialog.Title>Preview · {loteEgresos.length} aviso{loteEgresos.length > 1 ? 's' : ''} a enviar</Dialog.Title>
			<Dialog.Description>Se envía un correo por cada egreso seleccionado.</Dialog.Description>
		</Dialog.Header>

		<Alert.Root>
			<Info />
			<Alert.Title>Confirma antes de enviar</Alert.Title>
			<Alert.Description>
				{#if loteSinCorreo > 0}
					{loteSinCorreo} egreso(s) no se enviarán por falta de correo. El resto se enviará.
				{:else}
					Se enviarán {loteEgresos.length} correo{loteEgresos.length > 1 ? 's' : ''}, uno por cada egreso.
				{/if}
			</Alert.Description>
		</Alert.Root>

		{#if loteEgresos.length > 0}
			<Tabs.Root value={loteEgresos[0].id}>
				<Tabs.List class="flex-wrap">
					{#each loteEgresos as e (e.id)}
						<Tabs.Trigger value={e.id} class="font-mono text-xs">{e.id}</Tabs.Trigger>
					{/each}
				</Tabs.List>
				{#each loteEgresos as e (e.id)}
					{@const p = store.getProveedor(e.provId)}
					<Tabs.Content value={e.id}>
						{#if p}
							<AvisoPreview
								prov={p}
								facturas={e.facturas}
								fecha={e.fecha}
								ref={e.ref}
								banco={e.banco}
								correo={store.correoDestino(p)}
								folio={e.id}
							/>
						{/if}
					</Tabs.Content>
				{/each}
			</Tabs.Root>
		{/if}

		<Dialog.Footer>
			<Button variant="outline" onclick={() => (loteOpen = false)} disabled={sending}>Cancelar</Button>
			<Button onclick={confirmarLote} disabled={sending}>
				{#if sending}
					<Spinner data-icon="inline-start" /> Enviando…
				{:else}
					<Send data-icon="inline-start" /> Confirmar y enviar todos
				{/if}
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
