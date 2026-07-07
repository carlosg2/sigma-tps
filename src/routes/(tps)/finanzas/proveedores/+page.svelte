<script lang="ts">
	import { useFinanzasStore } from '$lib/tps/finanzas/store.svelte.js';
	import { isValidEmail } from '$lib/tps/finanzas/constants.js';
	import StatusBadge from '$lib/tps/components/status-badge.svelte';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Table from '$lib/components/ui/table/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import * as Field from '$lib/components/ui/field/index.js';
	import * as Alert from '$lib/components/ui/alert/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Switch } from '$lib/components/ui/switch/index.js';
	import { toast } from 'svelte-sonner';
	import Search from '@lucide/svelte/icons/search';
	import RotateCcw from '@lucide/svelte/icons/rotate-ccw';
	import Settings from '@lucide/svelte/icons/settings-2';
	import Factory from '@lucide/svelte/icons/factory';
	import Check from '@lucide/svelte/icons/check';

	const store = useFinanzasStore();
	const data = $derived(store.state);

	let query = $state('');
	let correoFilter = $state<'todos' | 'con' | 'sin'>('todos');
	let estadoFilter = $state<'todos' | 'activo' | 'inactivo'>('todos');

	const correoLabel = $derived(
		correoFilter === 'todos' ? 'Todos los proveedores' : correoFilter === 'con' ? 'Con correo de avisos' : 'Sin correo de avisos'
	);
	const estadoLabel = $derived(
		estadoFilter === 'todos' ? 'Avisos: todos' : estadoFilter === 'activo' ? 'Avisos activos' : 'Avisos inactivos'
	);

	const filtered = $derived.by(() => {
		const q = query.toLowerCase();
		return data.proveedores.filter((p) => {
			const match = !q || `${p.nombre} ${p.rfc} ${p.correoC} ${p.correoA}`.toLowerCase().includes(q);
			const correoOk = correoFilter === 'todos' || (correoFilter === 'con' ? !!p.correoA : !p.correoA);
			const estadoOk = estadoFilter === 'todos' || (estadoFilter === 'activo' ? p.activo : !p.activo);
			return match && correoOk && estadoOk;
		});
	});

	const sinCorreoCount = $derived(data.proveedores.filter((p) => !p.correoA).length);

	function resetFilters() {
		query = '';
		correoFilter = 'todos';
		estadoFilter = 'todos';
	}

	function handleToggle(id: number) {
		const nuevo = store.toggleProveedor(id);
		toast.info(`Avisos ${nuevo ? 'activados' : 'desactivados'}`);
	}

	// --- Dialogo de configuracion ---
	let editId = $state<number | null>(null);
	const editing = $derived(editId !== null ? store.getProveedor(editId) : undefined);
	let formCorreo = $state('');
	let formContacto = $state('');
	let formActivo = $state(true);

	function openEdit(id: number) {
		const p = store.getProveedor(id);
		if (!p) return;
		editId = id;
		formCorreo = p.correoA;
		formContacto = p.contacto;
		formActivo = p.activo;
	}

	const correoInvalid = $derived(formCorreo.trim() !== '' && !isValidEmail(formCorreo.trim()));

	function saveEdit() {
		if (editId === null) return;
		if (correoInvalid) {
			toast.warning('Verifica el formato del correo de avisos.');
			return;
		}
		store.saveProveedor(editId, {
			correoA: formCorreo.trim(),
			contacto: formContacto.trim(),
			activo: formActivo
		});
		toast.success(`Configuración guardada · avisos ${formActivo ? 'activados' : 'desactivados'}`);
		editId = null;
	}
</script>

<div class="flex flex-col gap-6">
	<div class="flex flex-wrap items-center justify-between gap-3">
		<div>
			<h2 class="text-xl font-semibold">Proveedores</h2>
			<p class="text-muted-foreground text-sm">
				Catálogo sincronizado con el ERP · Configura correos y preferencias de avisos
			</p>
		</div>
	</div>

	<Card.Root>
		<Card.Header>
			<div class="flex flex-wrap items-center gap-2">
				<div class="relative w-full max-w-xs flex-1">
					<Search class="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
					<Input placeholder="Buscar nombre, RFC o correo…" bind:value={query} class="pl-8" />
				</div>
				<Select.Root type="single" bind:value={correoFilter}>
					<Select.Trigger size="sm" class="w-52">{correoLabel}</Select.Trigger>
					<Select.Content>
						<Select.Item value="todos">Todos los proveedores</Select.Item>
						<Select.Item value="con">Con correo de avisos</Select.Item>
						<Select.Item value="sin">Sin correo de avisos</Select.Item>
					</Select.Content>
				</Select.Root>
				<Select.Root type="single" bind:value={estadoFilter}>
					<Select.Trigger size="sm" class="w-44">{estadoLabel}</Select.Trigger>
					<Select.Content>
						<Select.Item value="todos">Avisos: todos</Select.Item>
						<Select.Item value="activo">Avisos activos</Select.Item>
						<Select.Item value="inactivo">Avisos inactivos</Select.Item>
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
						<Table.Head>Proveedor</Table.Head>
						<Table.Head>Correo comercial (ERP)</Table.Head>
						<Table.Head>Correo de avisos</Table.Head>
						<Table.Head>Contacto pagos</Table.Head>
						<Table.Head class="text-center">Avisos activos</Table.Head>
						<Table.Head class="text-right">Configurar</Table.Head>
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{#each filtered as p (p.id)}
						<Table.Row>
							<Table.Cell>
								<p class="text-sm font-medium">{p.nombre}</p>
								<p class="text-muted-foreground font-mono text-xs">{p.rfc} · {p.tel}</p>
							</Table.Cell>
							<Table.Cell class="text-muted-foreground text-xs">{p.correoC}</Table.Cell>
							<Table.Cell>
								{#if p.correoA}
									<span class="inline-flex items-center gap-1 text-sm text-emerald-400">
										<Check class="size-3.5" /> {p.correoA}
									</span>
								{:else}
									<StatusBadge label="Sin configurar" colorClass="bg-chart-4/15 text-chart-4" />
								{/if}
							</Table.Cell>
							<Table.Cell class="text-sm">{p.contacto || '—'}</Table.Cell>
							<Table.Cell class="text-center">
								<Switch checked={p.activo} onCheckedChange={() => handleToggle(p.id)} aria-label="Avisos activos" />
							</Table.Cell>
							<Table.Cell class="text-right">
								<Button size="sm" variant="outline" onclick={() => openEdit(p.id)}>
									<Settings data-icon="inline-start" /> Configurar
								</Button>
							</Table.Cell>
						</Table.Row>
					{/each}
					{#if filtered.length === 0}
						<Table.Row>
							<Table.Cell colspan={6} class="text-muted-foreground py-10 text-center text-sm">
								Sin resultados con los filtros aplicados.
							</Table.Cell>
						</Table.Row>
					{/if}
				</Table.Body>
			</Table.Root>
			<p class="text-muted-foreground mt-3 text-xs">
				Mostrando {filtered.length} de {data.proveedores.length} proveedores · {sinCorreoCount} sin correo de avisos configurado
			</p>
		</Card.Content>
	</Card.Root>
</div>

<!-- ── CONFIGURAR AVISOS ── -->
<Dialog.Root open={editId !== null} onOpenChange={(o) => { if (!o) editId = null; }}>
	<Dialog.Content class="sm:max-w-lg">
		{#if editing}
			<Dialog.Header>
				<Dialog.Title>Configurar avisos</Dialog.Title>
				<Dialog.Description>Los datos del ERP son de solo lectura.</Dialog.Description>
			</Dialog.Header>

			<Alert.Root>
				<Factory />
				<Alert.Title>{editing.nombre}</Alert.Title>
				<Alert.Description>
					RFC: {editing.rfc} · Correo comercial: {editing.correoC}
				</Alert.Description>
			</Alert.Root>

			<Field.FieldGroup>
				<Field.Field data-invalid={correoInvalid ? true : undefined}>
					<Field.FieldLabel for="correo-avisos">Correo para avisos de pago</Field.FieldLabel>
					<Input
						id="correo-avisos"
						type="email"
						placeholder="pagos@empresa.mx"
						bind:value={formCorreo}
						aria-invalid={correoInvalid ? true : undefined}
					/>
					<Field.FieldDescription>
						{#if correoInvalid}
							El formato del correo no es válido.
						{:else}
							Si se deja vacío se usará el correo comercial del ERP.
						{/if}
					</Field.FieldDescription>
				</Field.Field>

				<Field.Field>
					<Field.FieldLabel for="contacto-pagos">Contacto de pagos / Cuentas por pagar</Field.FieldLabel>
					<Input id="contacto-pagos" placeholder="Nombre del contacto" bind:value={formContacto} />
				</Field.Field>

				<Field.Field orientation="horizontal">
					<Field.FieldContent>
						<Field.FieldLabel for="avisos-activos">Avisos activos para este proveedor</Field.FieldLabel>
						<Field.FieldDescription>Al desactivar, no se enviarán correos aunque se genere un egreso.</Field.FieldDescription>
					</Field.FieldContent>
					<Switch id="avisos-activos" bind:checked={formActivo} />
				</Field.Field>
			</Field.FieldGroup>

			<Dialog.Footer>
				<Button variant="outline" onclick={() => (editId = null)}>Cancelar</Button>
				<Button onclick={saveEdit}>Guardar configuración</Button>
			</Dialog.Footer>
		{/if}
	</Dialog.Content>
</Dialog.Root>
