<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { toast } from 'svelte-sonner';
	import { useSpecV2Store } from '$lib/tps/spec-v2/store.svelte.js';
	import { useStore } from '$lib/tps/store.svelte.js';
	import { exportSpecPdf } from '$lib/tps/spec-v2/pdf.js';
	import { SPEC_SECTIONS } from '$lib/tps/spec-v2/catalog-sections.js';
	import { componentKey, type SpecComponentValue, type SpecV2Status, type SpecAuthStatus } from '$lib/tps/spec-v2/types.js';
	import {
		SPEC_V2_STATUS_LABELS,
		SPEC_V2_STATUS_COLORS,
		SPEC_AUTH_STATUS_LABELS,
		SPEC_AUTH_STATUS_COLORS,
		SPEC_DESIGN_TYPE_LABELS
	} from '$lib/tps/spec-v2/constants.js';
	import { ARMOR_LEVEL_LABELS } from '$lib/tps/constants.js';
	import { formatCurrency } from '$lib/tps/utils.js';
	import StatusBadge from '$lib/tps/components/status-badge.svelte';
	import StatCard from '$lib/tps/components/stat-card.svelte';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Tabs from '$lib/components/ui/tabs/index.js';
	import * as Table from '$lib/components/ui/table/index.js';
	import * as Accordion from '$lib/components/ui/accordion/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import * as Empty from '$lib/components/ui/empty/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Textarea } from '$lib/components/ui/textarea/index.js';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import ArrowLeft from '@lucide/svelte/icons/arrow-left';
	import Pencil from '@lucide/svelte/icons/pencil';
	import Save from '@lucide/svelte/icons/save';
	import X from '@lucide/svelte/icons/x';
	import Copy from '@lucide/svelte/icons/copy';
	import Download from '@lucide/svelte/icons/download';
	import FileDown from '@lucide/svelte/icons/file-down';
	import Check from '@lucide/svelte/icons/check';
	import Ban from '@lucide/svelte/icons/ban';
	import RotateCcw from '@lucide/svelte/icons/rotate-ccw';

	const store = useSpecV2Store();
	const main = useStore();

	const id = $derived(page.params.id);
	const spec = $derived(store.getSpec(id));
	const articles = $derived(store.state.specArticles);
	const articleById = $derived(new Map(articles.map((a) => [a.id, a])));

	let editing = $state(false);
	let tab = $state('contenido');
	let openSecs = $state<string[]>([SPEC_SECTIONS[0]?.seccion ?? '']);

	type DraftEntry = { value: string; specArticleId: string; quantity: number; notes: string };
	let draft = $state<Record<string, DraftEntry>>({});

	const capturedMap = $derived(
		new Map((spec?.components ?? []).map((c) => [componentKey(c.seccion, c.subSeccion, c.componente), c]))
	);

	function capturedInSection(seccion: string): number {
		return (spec?.components ?? []).filter((c) => c.seccion === seccion).length;
	}

	// Totales calculados a partir de articulos asignados
	const totals = $derived.by(() => {
		let weight = 0;
		let cost = 0;
		for (const c of spec?.components ?? []) {
			if (!c.specArticleId) continue;
			const art = articleById.get(c.specArticleId);
			if (!art) continue;
			const qty = c.quantity || 0;
			weight += art.unitWeight * qty;
			cost += art.price * qty;
		}
		return { weight: Math.round(weight), cost: Math.round(cost) };
	});

	function startEdit() {
		const d: Record<string, DraftEntry> = {};
		for (const sec of SPEC_SECTIONS) {
			for (const sub of sec.subSecciones) {
				for (const comp of sub.componentes) {
					const key = componentKey(sec.seccion, sub.subSeccion, comp.componente);
					const ex = capturedMap.get(key);
					d[key] = {
						value: ex?.value ?? '',
						specArticleId: ex?.specArticleId ?? '',
						quantity: ex?.quantity ?? 0,
						notes: ex?.notes ?? ''
					};
				}
			}
		}
		draft = d;
		editing = true;
	}

	function cancelEdit() {
		editing = false;
		draft = {};
	}

	function saveEdit() {
		if (!spec) return;
		const components: SpecComponentValue[] = [];
		for (const sec of SPEC_SECTIONS) {
			for (const sub of sec.subSecciones) {
				for (const comp of sub.componentes) {
					const key = componentKey(sec.seccion, sub.subSeccion, comp.componente);
					const e = draft[key];
					if (!e) continue;
					if (e.value.trim() || e.specArticleId) {
						components.push({
							seccion: sec.seccion,
							subSeccion: sub.subSeccion,
							componente: comp.componente,
							descripcion: comp.descripcion,
							value: e.value.trim(),
							specArticleId: e.specArticleId || null,
							quantity: Number(e.quantity) || 0,
							notes: e.notes ?? ''
						});
					}
				}
			}
		}
		store.setComponents(spec.id, components, 'Actualizacion de contenido', main.state.currentUser.name);
		editing = false;
		draft = {};
		toast.success('Contenido actualizado', { description: `${components.length} componentes capturados` });
	}

	function doClone() {
		if (!spec) return;
		const newId = store.cloneSpec(spec.id, main.state.currentUser.name);
		if (newId) {
			toast.success('Especificacion clonada');
			goto(`/especificaciones-v2/${newId}`);
		}
	}

	async function doPdf(mode: 'download' | 'open') {
		if (!spec) return;
		try {
			await exportSpecPdf(spec, articles, mode);
		} catch (e) {
			toast.error('No se pudo generar el PDF', { description: e instanceof Error ? e.message : '' });
		}
	}

	function authorize(department: string, status: SpecAuthStatus) {
		if (!spec) return;
		store.authorize(spec.id, department, status, main.state.currentUser.name, '');
	}

	function changeStatus(value: string) {
		if (!spec) return;
		store.setStatus(spec.id, value as SpecV2Status);
	}

	const statusLabel = $derived(spec ? SPEC_V2_STATUS_LABELS[spec.status] : '');
</script>

{#if !spec}
	<Empty.Root>
		<Empty.Header>
			<Empty.Media variant="icon"><X /></Empty.Media>
			<Empty.Title>Especificacion no encontrada</Empty.Title>
			<Empty.Description>La especificacion solicitada no existe.</Empty.Description>
		</Empty.Header>
		<Empty.Content>
			<Button href="/especificaciones-v2">Volver al catalogo</Button>
		</Empty.Content>
	</Empty.Root>
{:else}
	<!-- Header -->
	<div class="flex flex-wrap items-start justify-between gap-3">
		<div class="flex items-center gap-3">
			<Button href="/especificaciones-v2" variant="outline" size="icon">
				<ArrowLeft />
			</Button>
			<div>
				<div class="flex items-center gap-2">
					<h1 class="text-xl font-bold">{spec.brand} {spec.model}</h1>
					<StatusBadge label={statusLabel} colorClass={SPEC_V2_STATUS_COLORS[spec.status]} />
				</div>
				<p class="text-muted-foreground font-mono text-xs">
					{spec.code} · v{spec.version} · {ARMOR_LEVEL_LABELS[spec.armorLevel]} · {SPEC_DESIGN_TYPE_LABELS[spec.designType]}
				</p>
			</div>
		</div>
		<div class="flex flex-wrap items-center gap-2">
			{#if editing}
				<Button variant="outline" size="sm" onclick={cancelEdit}><X data-icon="inline-start" /> Cancelar</Button>
				<Button size="sm" onclick={saveEdit}><Save data-icon="inline-start" /> Guardar</Button>
			{:else}
				<Button variant="outline" size="sm" onclick={() => doPdf('open')}><FileDown data-icon="inline-start" /> Abrir PDF</Button>
				<Button variant="outline" size="sm" onclick={() => doPdf('download')}><Download data-icon="inline-start" /> Descargar PDF</Button>
				<Button variant="outline" size="sm" onclick={doClone}><Copy data-icon="inline-start" /> Clonar</Button>
				<Button size="sm" onclick={startEdit}><Pencil data-icon="inline-start" /> Editar contenido</Button>
			{/if}
		</div>
	</div>

	<!-- Stats -->
	<div class="grid grid-cols-2 gap-4 md:grid-cols-4">
		<StatCard label="Componentes capturados" value={spec.components.length} subtitle="de 375 en catalogo" />
		<StatCard
			label="Autorizaciones"
			value={`${spec.authorizations.filter((a) => a.status === 'autorizado').length}/${spec.authorizations.length}`}
			subtitle="Departamentos"
		/>
		<StatCard label="Peso de blindaje (calc)" value={`${totals.weight} kg`} subtitle="Articulos asignados" />
		<StatCard label="Costo estimado" value={formatCurrency(totals.cost)} subtitle="Materiales asignados" />
	</div>

	<Tabs.Root bind:value={tab}>
		<Tabs.List>
			<Tabs.Trigger value="contenido">Contenido</Tabs.Trigger>
			<Tabs.Trigger value="autorizaciones">Autorizaciones</Tabs.Trigger>
			<Tabs.Trigger value="info">Informacion</Tabs.Trigger>
		</Tabs.List>

		<!-- CONTENIDO -->
		<Tabs.Content value="contenido">
			<Card.Root>
				<Card.Header>
					<Card.Title>Contenido de la especificacion</Card.Title>
					<Card.Description>
						{#if editing}Captura el valor y, opcionalmente, asigna un articulo del catalogo por componente.{:else}Componentes capturados por seccion. Usa "Editar contenido" para modificar.{/if}
					</Card.Description>
				</Card.Header>
				<Card.Content>
					<Accordion.Root type="multiple" bind:value={openSecs}>
						{#each SPEC_SECTIONS as sec (sec.seccion)}
							{@const isOpen = openSecs.includes(sec.seccion)}
							<Accordion.Item value={sec.seccion}>
								<Accordion.Trigger>
									<span class="flex w-full items-center justify-between gap-2 pr-2">
										<span class="font-medium">{sec.seccion}. {sec.descripcion}</span>
										<span class="text-muted-foreground text-xs">{capturedInSection(sec.seccion)} capturados</span>
									</span>
								</Accordion.Trigger>
								<Accordion.Content>
									{#if isOpen}
										{#each sec.subSecciones as sub (sub.subSeccion)}
											{@const compsToShow = editing ? sub.componentes : sub.componentes.filter((comp) => capturedMap.has(componentKey(sec.seccion, sub.subSeccion, comp.componente)))}
											{#if compsToShow.length > 0}
												<div class="mb-4">
													<p class="text-muted-foreground mb-1 text-xs font-semibold tracking-wide uppercase">
														{sub.subSeccion} · {sub.descripcion}
													</p>
													<Table.Root>
														<Table.Header>
															<Table.Row>
																<Table.Head class="w-12">#</Table.Head>
																<Table.Head>Componente</Table.Head>
																<Table.Head>Valor</Table.Head>
																<Table.Head>Articulo</Table.Head>
																<Table.Head class="w-16 text-right">Cant.</Table.Head>
															</Table.Row>
														</Table.Header>
														<Table.Body>
															{#each compsToShow as comp (comp.componente)}
																{@const key = componentKey(sec.seccion, sub.subSeccion, comp.componente)}
																{@const captured = capturedMap.get(key)}
																<Table.Row>
																	<Table.Cell class="text-muted-foreground font-mono text-xs">{comp.componente}</Table.Cell>
																	<Table.Cell class="text-sm">{comp.descripcion}</Table.Cell>
																	{#if editing && draft[key]}
																		<Table.Cell>
																			<Input class="h-8 text-xs" bind:value={draft[key].value} placeholder="Valor / medida" />
																		</Table.Cell>
																		<Table.Cell>
																			<select
																				class="border-input bg-background h-8 w-full max-w-48 rounded-md border px-2 text-xs"
																				bind:value={draft[key].specArticleId}
																			>
																				<option value="">— Sin articulo —</option>
																				{#each articles as art (art.id)}
																					<option value={art.id}>{art.code}</option>
																				{/each}
																			</select>
																		</Table.Cell>
																		<Table.Cell class="text-right">
																			<Input type="number" min="0" class="h-8 w-16 text-right text-xs" bind:value={draft[key].quantity} />
																		</Table.Cell>
																	{:else}
																		<Table.Cell class="text-sm">{captured?.value || '—'}</Table.Cell>
																		<Table.Cell class="text-muted-foreground font-mono text-xs">
																			{captured?.specArticleId ? (articleById.get(captured.specArticleId)?.code ?? '—') : '—'}
																		</Table.Cell>
																		<Table.Cell class="text-right font-mono text-xs tabular-nums">
																			{captured?.quantity ? captured.quantity : '—'}
																		</Table.Cell>
																	{/if}
																</Table.Row>
															{/each}
														</Table.Body>
													</Table.Root>
												</div>
											{/if}
										{/each}
										{#if !editing && capturedInSection(sec.seccion) === 0}
											<p class="text-muted-foreground py-2 text-sm">Sin datos capturados en esta seccion.</p>
										{/if}
									{/if}
								</Accordion.Content>
							</Accordion.Item>
						{/each}
					</Accordion.Root>
				</Card.Content>
			</Card.Root>
		</Tabs.Content>

		<!-- AUTORIZACIONES -->
		<Tabs.Content value="autorizaciones">
			<Card.Root>
				<Card.Header>
					<Card.Title>Autorizaciones por departamento</Card.Title>
					<Card.Description>
						La especificacion se marca como "Autorizada" cuando todos los departamentos autorizan.
					</Card.Description>
				</Card.Header>
				<Card.Content>
					<Table.Root>
						<Table.Header>
							<Table.Row>
								<Table.Head>Departamento</Table.Head>
								<Table.Head>Estatus</Table.Head>
								<Table.Head>Autorizo</Table.Head>
								<Table.Head>Fecha</Table.Head>
								<Table.Head class="text-right">Acciones</Table.Head>
							</Table.Row>
						</Table.Header>
						<Table.Body>
							{#each spec.authorizations as auth (auth.department)}
								<Table.Row>
									<Table.Cell class="font-medium">{auth.department}</Table.Cell>
									<Table.Cell>
										<StatusBadge label={SPEC_AUTH_STATUS_LABELS[auth.status]} colorClass={SPEC_AUTH_STATUS_COLORS[auth.status]} />
									</Table.Cell>
									<Table.Cell class="text-muted-foreground text-sm">{auth.authorizedBy ?? '—'}</Table.Cell>
									<Table.Cell class="text-muted-foreground font-mono text-xs">{auth.authorizedAt ?? '—'}</Table.Cell>
									<Table.Cell>
										<div class="flex justify-end gap-1">
											{#if auth.status !== 'autorizado'}
												<Button size="sm" variant="outline" onclick={() => authorize(auth.department, 'autorizado')}>
													<Check data-icon="inline-start" /> Autorizar
												</Button>
											{/if}
											{#if auth.status !== 'rechazado'}
												<Button size="sm" variant="outline" onclick={() => authorize(auth.department, 'rechazado')}>
													<Ban data-icon="inline-start" /> Rechazar
												</Button>
											{/if}
											{#if auth.status !== 'pendiente'}
												<Button size="sm" variant="ghost" onclick={() => authorize(auth.department, 'pendiente')}>
													<RotateCcw />
												</Button>
											{/if}
										</div>
									</Table.Cell>
								</Table.Row>
							{/each}
						</Table.Body>
					</Table.Root>
				</Card.Content>
			</Card.Root>
		</Tabs.Content>

		<!-- INFO -->
		<Tabs.Content value="info">
			<div class="grid gap-4 lg:grid-cols-2">
				<Card.Root>
					<Card.Header>
						<Card.Title>Datos generales</Card.Title>
					</Card.Header>
					<Card.Content class="flex flex-col gap-3 text-sm">
						<div class="flex justify-between"><span class="text-muted-foreground">Codigo</span><span class="font-mono">{spec.code}</span></div>
						<Separator />
						<div class="flex justify-between"><span class="text-muted-foreground">Marca / Modelo</span><span>{spec.brand} {spec.model}</span></div>
						<div class="flex justify-between"><span class="text-muted-foreground">Año</span><span>{spec.year || '—'}</span></div>
						<div class="flex justify-between"><span class="text-muted-foreground">Nivel</span><span>{ARMOR_LEVEL_LABELS[spec.armorLevel]}</span></div>
						<div class="flex justify-between"><span class="text-muted-foreground">Tipo de diseño</span><span>{SPEC_DESIGN_TYPE_LABELS[spec.designType]}</span></div>
						{#if spec.producto}
							<div class="flex justify-between gap-4"><span class="text-muted-foreground">Producto</span><span class="text-right">{spec.producto}</span></div>
						{/if}
						{#if spec.disenoBlindaje}
							<div class="flex justify-between"><span class="text-muted-foreground">Diseño de blindaje</span><span>{spec.disenoBlindaje}</span></div>
						{/if}
						{#if spec.planta}
							<div class="flex justify-between"><span class="text-muted-foreground">Planta</span><span>{spec.planta}</span></div>
						{/if}
						{#if spec.diasFabricacion}
							<div class="flex justify-between gap-4"><span class="text-muted-foreground">Dias de fabricacion</span><span class="text-right">{spec.diasFabricacion}</span></div>
						{/if}
						<Separator />
						<div class="flex items-center justify-between">
							<span class="text-muted-foreground">Estatus</span>
							<Select.Root type="single" value={spec.status} onValueChange={changeStatus}>
								<Select.Trigger size="sm" class="w-40">{statusLabel}</Select.Trigger>
								<Select.Content>
									{#each Object.entries(SPEC_V2_STATUS_LABELS) as [k, v] (k)}
										<Select.Item value={k}>{v}</Select.Item>
									{/each}
								</Select.Content>
							</Select.Root>
						</div>
						{#if spec.notes}
							<Separator />
							<div>
								<span class="text-muted-foreground">Notas</span>
								<p class="mt-1">{spec.notes}</p>
							</div>
						{/if}
					</Card.Content>
				</Card.Root>

				<Card.Root>
					<Card.Header>
						<Card.Title>Historial de revisiones</Card.Title>
					</Card.Header>
					<Card.Content>
						<Table.Root>
							<Table.Header>
								<Table.Row>
									<Table.Head class="w-16">Ver.</Table.Head>
									<Table.Head>Motivo</Table.Head>
									<Table.Head>Por</Table.Head>
									<Table.Head>Fecha</Table.Head>
								</Table.Row>
							</Table.Header>
							<Table.Body>
								{#each [...spec.revisions].reverse() as rev (rev.id)}
									<Table.Row>
										<Table.Cell class="font-mono text-xs">v{rev.version}</Table.Cell>
										<Table.Cell class="text-sm">{rev.reason}</Table.Cell>
										<Table.Cell class="text-muted-foreground text-sm">{rev.changedBy}</Table.Cell>
										<Table.Cell class="text-muted-foreground font-mono text-xs">{rev.changedAt}</Table.Cell>
									</Table.Row>
								{/each}
							</Table.Body>
						</Table.Root>
					</Card.Content>
				</Card.Root>

				{#if (spec.comentariosIngenieria?.length ?? 0) > 0 || (spec.accesoriosEstandar?.length ?? 0) > 0 || (spec.accesoriosOpcionales?.length ?? 0) > 0}
					<Card.Root class="lg:col-span-2">
						<Card.Header>
							<Card.Title>Comentarios de ingenieria y accesorios</Card.Title>
						</Card.Header>
						<Card.Content class="grid gap-6 md:grid-cols-2">
							{#if (spec.comentariosIngenieria?.length ?? 0) > 0}
								<div class="md:col-span-2">
									<p class="text-muted-foreground mb-2 text-xs font-semibold tracking-wide uppercase">Comentarios de ingenieria</p>
									<ol class="list-decimal pl-5 text-sm leading-relaxed">
										{#each spec.comentariosIngenieria ?? [] as comentario (comentario)}
											<li>{comentario}</li>
										{/each}
									</ol>
								</div>
							{/if}
							{#if (spec.accesoriosEstandar?.length ?? 0) > 0}
								<div>
									<p class="text-muted-foreground mb-2 text-xs font-semibold tracking-wide uppercase">Accesorios estandar</p>
									<ul class="flex flex-col gap-1 text-sm">
										{#each spec.accesoriosEstandar ?? [] as acc (acc.code)}
											<li class="flex gap-2"><span class="text-primary font-mono text-xs">{acc.code}</span><span>{acc.description}</span></li>
										{/each}
									</ul>
								</div>
							{/if}
							{#if (spec.accesoriosOpcionales?.length ?? 0) > 0}
								<div>
									<p class="text-muted-foreground mb-2 text-xs font-semibold tracking-wide uppercase">Accesorios opcionales</p>
									<ul class="flex flex-col gap-1 text-sm">
										{#each spec.accesoriosOpcionales ?? [] as acc (acc.code)}
											<li class="flex gap-2"><span class="text-primary font-mono text-xs">{acc.code}</span><span>{acc.description}</span></li>
										{/each}
									</ul>
								</div>
							{/if}
						</Card.Content>
					</Card.Root>
				{/if}
			</div>
		</Tabs.Content>
	</Tabs.Root>
{/if}
