<script lang="ts">
	import { useSpecV2Store, specUid, specToday } from '$lib/tps/spec-v2/store.svelte.js';
	import { GRUPOS_MAYOR, GRUPOS_MENOR } from '$lib/tps/spec-v2/catalog-grupos.js';
	import type { SpecArticle } from '$lib/tps/spec-v2/types.js';
	import { UDM_LABELS } from '$lib/tps/constants.js';
	import { formatCurrency, searchMatch } from '$lib/tps/utils.js';
	import { toast } from 'svelte-sonner';
	import StatusBadge from '$lib/tps/components/status-badge.svelte';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Table from '$lib/components/ui/table/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import * as Empty from '$lib/components/ui/empty/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import ArrowLeft from '@lucide/svelte/icons/arrow-left';
	import Search from '@lucide/svelte/icons/search';
	import Plus from '@lucide/svelte/icons/plus';
	import Pencil from '@lucide/svelte/icons/pencil';
	import Copy from '@lucide/svelte/icons/copy';
	import Trash2 from '@lucide/svelte/icons/trash-2';
	import Boxes from '@lucide/svelte/icons/boxes';

	const store = useSpecV2Store();
	const articles = $derived(store.state.specArticles);

	let query = $state('');
	let mayorFilter = $state('todos');
	let menorFilter = $state('todos');

	const mayorOptions = $derived(Array.from(new Set(articles.map((a) => a.grupoMayor))).sort());
	const menorOptions = $derived.by(() => {
		const src = mayorFilter === 'todos' ? articles : articles.filter((a) => a.grupoMayor === mayorFilter);
		return Array.from(new Set(src.map((a) => a.grupoMenor))).sort();
	});

	const filtered = $derived.by(() => {
		let items = articles;
		if (query) items = items.filter((a) => searchMatch(`${a.code} ${a.description} ${a.grupoMayor} ${a.grupoMenor}`, query));
		if (mayorFilter !== 'todos') items = items.filter((a) => a.grupoMayor === mayorFilter);
		if (menorFilter !== 'todos') items = items.filter((a) => a.grupoMenor === menorFilter);
		return items;
	});

	const mayorFilterLabel = $derived(mayorFilter === 'todos' ? 'Todos los grupos mayor' : mayorFilter);
	const menorFilterLabel = $derived(menorFilter === 'todos' ? 'Todos los grupos menor' : menorFilter);

	// --- Dialog crear / editar ---
	let dialogOpen = $state(false);
	let editingId = $state<string | null>(null);
	let form = $state({
		code: '',
		description: '',
		grupoKey: '',
		grupoMenor: '',
		udm: 'pieza',
		unitWeight: 0,
		price: 0,
		currency: 'MXN' as 'MXN' | 'USD',
		status: 'activo' as 'activo' | 'inactivo'
	});
	let formErrors = $state<string[]>([]);

	// Opciones de grupos desde el catalogo completo
	const mayorCatalog = $derived(
		[...GRUPOS_MAYOR].sort((a, b) => a.grupoCont.localeCompare(b.grupoCont) || a.grupoMayor.localeCompare(b.grupoMayor))
	);
	const menorCatalog = $derived(
		form.grupoKey
			? GRUPOS_MENOR.filter((m) => `${m.grupoCont}|${m.grupoMayor}` === form.grupoKey)
			: []
	);

	const grupoKeyLabel = $derived.by(() => {
		if (!form.grupoKey) return 'Selecciona grupo mayor';
		const found = mayorCatalog.find((m) => `${m.grupoCont}|${m.grupoMayor}` === form.grupoKey);
		return found ? `${found.grupoCont} · ${found.grupoMayor}` : form.grupoKey;
	});
	const grupoMenorLabel = $derived.by(() => {
		if (!form.grupoMenor) return 'Selecciona grupo menor';
		const found = menorCatalog.find((m) => m.grupoMenor === form.grupoMenor);
		return found ? `${found.grupoMenor} — ${found.descripcion}` : form.grupoMenor;
	});
	const udmLabel = $derived(UDM_LABELS[form.udm as keyof typeof UDM_LABELS] ?? form.udm);

	function resetForm() {
		form = { code: '', description: '', grupoKey: '', grupoMenor: '', udm: 'pieza', unitWeight: 0, price: 0, currency: 'MXN', status: 'activo' };
		formErrors = [];
	}

	function openCreate() {
		editingId = null;
		resetForm();
		dialogOpen = true;
	}

	function openEdit(a: SpecArticle) {
		editingId = a.id;
		form = {
			code: a.code,
			description: a.description,
			grupoKey: `${a.grupoCont}|${a.grupoMayor}`,
			grupoMenor: a.grupoMenor,
			udm: a.udm,
			unitWeight: a.unitWeight,
			price: a.price,
			currency: a.currency,
			status: a.status
		};
		formErrors = [];
		dialogOpen = true;
	}

	function onMayorChange(v: string) {
		form.grupoKey = v;
		form.grupoMenor = '';
	}

	function save() {
		const errs: string[] = [];
		if (!form.code.trim()) errs.push('El codigo es obligatorio');
		if (!form.description.trim()) errs.push('La descripcion es obligatoria');
		if (!form.grupoKey) errs.push('Selecciona el grupo mayor');
		const dup = articles.some((a) => a.code.toLowerCase() === form.code.trim().toLowerCase() && a.id !== editingId);
		if (dup) errs.push('El codigo ya existe');
		formErrors = errs;
		if (errs.length > 0) return;

		const [grupoCont, grupoMayor] = form.grupoKey.split('|');
		const payload = {
			code: form.code.trim(),
			description: form.description.trim(),
			grupoCont,
			grupoMayor,
			grupoMenor: form.grupoMenor,
			udm: form.udm,
			unitWeight: Number(form.unitWeight) || 0,
			price: Number(form.price) || 0,
			currency: form.currency,
			status: form.status
		};

		if (editingId) {
			store.updateArticle(editingId, payload);
			toast.success('Articulo actualizado');
		} else {
			store.addArticle({ id: specUid('sa'), createdAt: specToday(), updatedAt: specToday(), ...payload });
			toast.success('Articulo creado');
		}
		dialogOpen = false;
	}

	function clone(a: SpecArticle) {
		store.cloneArticle(a.id);
		toast.success('Articulo clonado');
	}

	function remove(a: SpecArticle) {
		store.deleteArticle(a.id);
		toast.success('Articulo eliminado');
	}
</script>

<!-- Header -->
<div class="flex flex-wrap items-center justify-between gap-3">
	<div class="flex items-center gap-3">
		<Button href="/especificaciones-v2" variant="outline" size="icon"><ArrowLeft /></Button>
		<p class="text-muted-foreground text-sm">{articles.length} articulos · {filtered.length} mostrados</p>
	</div>
	<Button size="sm" onclick={openCreate}><Plus data-icon="inline-start" /> Nuevo Articulo</Button>
</div>

<Card.Root>
	<Card.Header>
		<Card.Title>Catalogo de Articulos de Especificacion</Card.Title>
		<Card.Description>Catalogo propio, clasificado por GrupoCont → GrupoMayor → GrupoMenor.</Card.Description>
	</Card.Header>
	<Card.Content class="flex flex-col gap-4">
		<div class="flex flex-wrap items-center gap-2">
			<div class="relative w-full max-w-sm flex-1">
				<Search class="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
				<Input placeholder="Buscar por codigo, descripcion o grupo..." bind:value={query} class="pl-8" />
			</div>
			<Select.Root type="single" value={mayorFilter} onValueChange={(v) => { mayorFilter = v; menorFilter = 'todos'; }}>
				<Select.Trigger size="sm" class="w-52">{mayorFilterLabel}</Select.Trigger>
				<Select.Content>
					<Select.Item value="todos">Todos los grupos mayor</Select.Item>
					{#each mayorOptions as m (m)}
						<Select.Item value={m}>{m}</Select.Item>
					{/each}
				</Select.Content>
			</Select.Root>
			<Select.Root type="single" bind:value={menorFilter}>
				<Select.Trigger size="sm" class="w-52">{menorFilterLabel}</Select.Trigger>
				<Select.Content>
					<Select.Item value="todos">Todos los grupos menor</Select.Item>
					{#each menorOptions as m (m)}
						<Select.Item value={m}>{m}</Select.Item>
					{/each}
				</Select.Content>
			</Select.Root>
		</div>

		<Table.Root>
			<Table.Header>
				<Table.Row>
					<Table.Head>Codigo</Table.Head>
					<Table.Head>Descripcion</Table.Head>
					<Table.Head>Grupo</Table.Head>
					<Table.Head>UdM</Table.Head>
					<Table.Head class="text-right">Peso (kg)</Table.Head>
					<Table.Head class="text-right">Precio</Table.Head>
					<Table.Head class="text-right">Acciones</Table.Head>
				</Table.Row>
			</Table.Header>
			<Table.Body>
				{#each filtered as a (a.id)}
					<Table.Row>
						<Table.Cell class="text-primary font-mono text-xs">{a.code}</Table.Cell>
						<Table.Cell class="max-w-64 truncate">{a.description}</Table.Cell>
						<Table.Cell>
							<div class="flex flex-wrap items-center gap-1">
								<Badge variant="secondary" class="font-mono text-[10px]">{a.grupoCont}</Badge>
								<Badge variant="outline" class="text-[10px]">{a.grupoMayor}</Badge>
								<span class="text-muted-foreground text-xs">{a.grupoMenor}</span>
							</div>
						</Table.Cell>
						<Table.Cell class="text-muted-foreground text-xs">{UDM_LABELS[a.udm as keyof typeof UDM_LABELS] ?? a.udm}</Table.Cell>
						<Table.Cell class="text-right font-mono text-xs tabular-nums">{a.unitWeight}</Table.Cell>
						<Table.Cell class="text-right font-mono text-xs tabular-nums">{a.price > 0 ? formatCurrency(a.price, a.currency) : '—'}</Table.Cell>
						<Table.Cell>
							<div class="flex justify-end gap-1">
								<Button size="icon" variant="ghost" class="size-8" onclick={() => openEdit(a)} title="Editar"><Pencil /></Button>
								<Button size="icon" variant="ghost" class="size-8" onclick={() => clone(a)} title="Clonar"><Copy /></Button>
								<Button size="icon" variant="ghost" class="text-destructive size-8" onclick={() => remove(a)} title="Eliminar"><Trash2 /></Button>
							</div>
						</Table.Cell>
					</Table.Row>
				{/each}
			</Table.Body>
		</Table.Root>

		{#if filtered.length === 0}
			<Empty.Root class="border-0">
				<Empty.Header>
					<Empty.Media variant="icon"><Boxes /></Empty.Media>
					<Empty.Title>Sin resultados</Empty.Title>
					<Empty.Description>No se encontraron articulos con los filtros seleccionados.</Empty.Description>
				</Empty.Header>
			</Empty.Root>
		{/if}
	</Card.Content>
</Card.Root>

<!-- Dialog crear/editar -->
<Dialog.Root bind:open={dialogOpen}>
	<Dialog.Content class="max-w-lg">
		<Dialog.Header>
			<Dialog.Title>{editingId ? 'Editar' : 'Nuevo'} articulo de especificacion</Dialog.Title>
			<Dialog.Description>Define el articulo y su clasificacion por agrupadores.</Dialog.Description>
		</Dialog.Header>

		{#if formErrors.length > 0}
			<div class="text-destructive text-xs">
				<ul class="list-disc pl-4">
					{#each formErrors as e (e)}<li>{e}</li>{/each}
				</ul>
			</div>
		{/if}

		<div class="flex flex-col gap-3">
			<div class="grid gap-2">
				<Label for="acode">Codigo *</Label>
				<Input id="acode" bind:value={form.code} placeholder="ESP-CRIS-WS-001" />
			</div>
			<div class="grid gap-2">
				<Label for="adesc">Descripcion *</Label>
				<Input id="adesc" bind:value={form.description} placeholder="Parabrisas blindado NIII" />
			</div>
			<div class="grid gap-3 sm:grid-cols-2">
				<div class="grid gap-2">
					<Label>Grupo Mayor *</Label>
					<Select.Root type="single" value={form.grupoKey} onValueChange={onMayorChange}>
						<Select.Trigger class="w-full">{grupoKeyLabel}</Select.Trigger>
						<Select.Content class="max-h-72">
							{#each mayorCatalog as m (`${m.grupoCont}|${m.grupoMayor}`)}
								<Select.Item value={`${m.grupoCont}|${m.grupoMayor}`}>{m.grupoCont} · {m.grupoMayor} — {m.descripcion}</Select.Item>
							{/each}
						</Select.Content>
					</Select.Root>
				</div>
				<div class="grid gap-2">
					<Label>Grupo Menor</Label>
					<Select.Root type="single" bind:value={form.grupoMenor} disabled={menorCatalog.length === 0}>
						<Select.Trigger class="w-full">{grupoMenorLabel}</Select.Trigger>
						<Select.Content class="max-h-72">
							{#each menorCatalog as m (m.grupoMenor)}
								<Select.Item value={m.grupoMenor}>{m.grupoMenor} — {m.descripcion}</Select.Item>
							{/each}
						</Select.Content>
					</Select.Root>
				</div>
			</div>
			<div class="grid gap-3 sm:grid-cols-3">
				<div class="grid gap-2">
					<Label>UdM</Label>
					<Select.Root type="single" bind:value={form.udm}>
						<Select.Trigger class="w-full">{udmLabel}</Select.Trigger>
						<Select.Content class="max-h-72">
							{#each Object.entries(UDM_LABELS) as [k, v] (k)}
								<Select.Item value={k}>{v}</Select.Item>
							{/each}
						</Select.Content>
					</Select.Root>
				</div>
				<div class="grid gap-2">
					<Label for="aweight">Peso (kg)</Label>
					<Input id="aweight" type="number" min="0" step="0.1" bind:value={form.unitWeight} />
				</div>
				<div class="grid gap-2">
					<Label for="aprice">Precio</Label>
					<Input id="aprice" type="number" min="0" bind:value={form.price} />
				</div>
			</div>
			<div class="grid gap-3 sm:grid-cols-2">
				<div class="grid gap-2">
					<Label>Moneda</Label>
					<Select.Root type="single" bind:value={form.currency}>
						<Select.Trigger class="w-full">{form.currency}</Select.Trigger>
						<Select.Content>
							<Select.Item value="MXN">MXN</Select.Item>
							<Select.Item value="USD">USD</Select.Item>
						</Select.Content>
					</Select.Root>
				</div>
				<div class="grid gap-2">
					<Label>Estatus</Label>
					<Select.Root type="single" bind:value={form.status}>
						<Select.Trigger class="w-full">{form.status === 'activo' ? 'Activo' : 'Inactivo'}</Select.Trigger>
						<Select.Content>
							<Select.Item value="activo">Activo</Select.Item>
							<Select.Item value="inactivo">Inactivo</Select.Item>
						</Select.Content>
					</Select.Root>
				</div>
			</div>
		</div>

		<Dialog.Footer>
			<Button variant="outline" onclick={() => (dialogOpen = false)}>Cancelar</Button>
			<Button onclick={save}>{editingId ? 'Guardar cambios' : 'Crear articulo'}</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
