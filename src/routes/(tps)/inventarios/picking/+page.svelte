<script lang="ts">
	import { useInventariosStore } from '$lib/tps/inventarios/store.svelte.js';
	import { celdaIcon } from '$lib/tps/inventarios/constants.js';
	import StatusBadge from '$lib/tps/components/status-badge.svelte';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Table from '$lib/components/ui/table/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import * as Empty from '$lib/components/ui/empty/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { toast } from 'svelte-sonner';
	import Printer from '@lucide/svelte/icons/printer';
	import Check from '@lucide/svelte/icons/check';
	import Folder from '@lucide/svelte/icons/folder';
	import Car from '@lucide/svelte/icons/car';
	import User from '@lucide/svelte/icons/user';
	import Calendar from '@lucide/svelte/icons/calendar';
	import PackageSearch from '@lucide/svelte/icons/package-search';

	const store = useInventariosStore();
	const data = $derived(store.state);

	let folioId = $state<string>('');
	const folio = $derived(folioId ? store.getFolio(folioId) : undefined);
	const folioLabel = $derived(folio ? `${folio.id} · ${folio.unidad}` : '— Seleccionar Folio —');

	function surtir(pn: string, desc: string) {
		if (!folio) return;
		store.surtirMaterial(folio.id, pn);
		toast.success('Material surtido', { description: desc });
	}

	function imprimir() {
		if (!folio) {
			toast.warning('Sin folio', { description: 'Selecciona primero un folio.' });
			return;
		}
		toast.info('Enviando a impresión', { description: `Lista de picking de ${folio.id} enviada a impresora de oficina.` });
	}
</script>

<div class="flex flex-col gap-6">
	<div class="flex flex-wrap items-center justify-between gap-3">
		<div>
			<h2 class="text-xl font-semibold">Lista de Picking por Folio / VIN</h2>
			<p class="text-muted-foreground text-sm">Materiales agrupados por celda de trabajo</p>
		</div>
		<Badge variant="outline" class="font-mono">GAP-ALM-003</Badge>
	</div>

	<div class="flex flex-wrap items-center gap-2">
		<Select.Root type="single" bind:value={folioId}>
			<Select.Trigger class="w-64">{folioLabel}</Select.Trigger>
			<Select.Content>
				<Select.Group>
					{#each data.folios as f (f.id)}
						<Select.Item value={f.id}>{f.id} · {f.unidad}</Select.Item>
					{/each}
				</Select.Group>
			</Select.Content>
		</Select.Root>
		<Button variant="outline" onclick={imprimir}>
			<Printer data-icon="inline-start" /> Imprimir Lista
		</Button>
	</div>

	{#if folio}
		<div class="flex flex-wrap items-center gap-2">
			<Badge variant="secondary"><Folder data-icon="inline-start" /> {folio.id}</Badge>
			<Badge variant="secondary"><Car data-icon="inline-start" /> {folio.vin}</Badge>
			<Badge variant="secondary"><User data-icon="inline-start" /> {folio.resp}</Badge>
			<Badge variant="secondary"><Calendar data-icon="inline-start" /> {folio.fecha}</Badge>
		</div>

		{#each folio.celdas as celda (celda.letra)}
			{@const Icon = celdaIcon(celda.letra)}
			<Card.Root>
				<Card.Header>
					<Card.Title class="flex items-center gap-2 text-base">
						<Icon class="size-4" /> {celda.nombre}
					</Card.Title>
				</Card.Header>
				<Card.Content>
					<Table.Root>
						<Table.Header>
							<Table.Row>
								<Table.Head>Material</Table.Head>
								<Table.Head>P/N</Table.Head>
								<Table.Head class="text-center">Cant.</Table.Head>
								<Table.Head>Estado</Table.Head>
								<Table.Head class="text-right">Acción</Table.Head>
							</Table.Row>
						</Table.Header>
						<Table.Body>
							{#each celda.materiales as m (m.pn)}
								<Table.Row>
									<Table.Cell class="font-medium">{m.desc}</Table.Cell>
									<Table.Cell class="text-primary font-mono text-xs">{m.pn}</Table.Cell>
									<Table.Cell class="text-center tabular-nums">{m.qty} {m.um}</Table.Cell>
									<Table.Cell>
										{#if m.surtido}
											<StatusBadge label="Surtido" colorClass="bg-emerald-500/15 text-emerald-400" />
										{:else}
											<StatusBadge label="Pendiente" colorClass="bg-chart-4/15 text-chart-4" />
										{/if}
									</Table.Cell>
									<Table.Cell class="text-right">
										<Button variant="outline" size="sm" disabled={m.surtido} onclick={() => surtir(m.pn, m.desc)}>
											<Check data-icon="inline-start" />
											{m.surtido ? 'Surtido' : 'Surtir'}
										</Button>
									</Table.Cell>
								</Table.Row>
							{/each}
						</Table.Body>
					</Table.Root>
				</Card.Content>
			</Card.Root>
		{/each}
	{:else}
		<Empty.Root class="border">
			<Empty.Header>
				<Empty.Media variant="icon">
					<PackageSearch />
				</Empty.Media>
				<Empty.Title>Selecciona un folio</Empty.Title>
				<Empty.Description>Elige un folio para generar la lista de materiales agrupada por celda.</Empty.Description>
			</Empty.Header>
		</Empty.Root>
	{/if}
</div>
