<script lang="ts">
	import { useInventariosStore } from '$lib/tps/inventarios/store.svelte.js';
	import { TRAZA_TIPO_COLORS, RESPONSABLES, CELDAS_FILTRO } from '$lib/tps/inventarios/constants.js';
	import StatusBadge from '$lib/tps/components/status-badge.svelte';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Table from '$lib/components/ui/table/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { toast } from 'svelte-sonner';
	import FileSpreadsheet from '@lucide/svelte/icons/file-spreadsheet';

	const store = useInventariosStore();
	const data = $derived(store.state);

	let folioFilter = $state<string>('todos');
	let celdaFilter = $state<string>('todas');
	let respFilter = $state<string>('todos');

	const folioOptions = $derived([...new Set(data.trazabilidad.map((r) => r.folio))]);

	const filtered = $derived.by(() => {
		let items = data.trazabilidad;
		if (folioFilter !== 'todos') items = items.filter((r) => r.folio === folioFilter);
		if (celdaFilter !== 'todas') items = items.filter((r) => r.celda === celdaFilter.split('—')[0].trim());
		if (respFilter !== 'todos') items = items.filter((r) => r.resp === respFilter);
		return items;
	});

	const folioLabel = $derived(folioFilter === 'todos' ? 'Todos los folios' : folioFilter);
	const celdaLabel = $derived(celdaFilter === 'todas' ? 'Todas las celdas' : celdaFilter);
	const respLabel = $derived(respFilter === 'todos' ? 'Todos los responsables' : respFilter);

	function exportar() {
		toast.info('Exportando Excel', { description: `${filtered.length} registros exportados correctamente. Descarga iniciada.` });
	}
</script>

<div class="flex flex-col gap-6">
	<div class="flex flex-wrap items-center justify-between gap-3">
		<div>
			<h2 class="text-xl font-semibold">Registro y Trazabilidad de Surtidos</h2>
			<p class="text-muted-foreground text-sm">Historial completo con fecha, hora, responsable y folio</p>
		</div>
		<Badge variant="outline" class="font-mono">GAP-ALM-003</Badge>
	</div>

	<Card.Root>
		<Card.Header>
			<div class="flex flex-wrap items-center gap-2">
				<Select.Root type="single" bind:value={folioFilter}>
					<Select.Trigger size="sm" class="w-48">{folioLabel}</Select.Trigger>
					<Select.Content>
						<Select.Group>
							<Select.Item value="todos">Todos los folios</Select.Item>
							{#each folioOptions as f (f)}
								<Select.Item value={f}>{f}</Select.Item>
							{/each}
						</Select.Group>
					</Select.Content>
				</Select.Root>
				<Select.Root type="single" bind:value={celdaFilter}>
					<Select.Trigger size="sm" class="w-56">{celdaLabel}</Select.Trigger>
					<Select.Content>
						<Select.Group>
							<Select.Item value="todas">Todas las celdas</Select.Item>
							{#each CELDAS_FILTRO as c (c)}
								<Select.Item value={c}>{c}</Select.Item>
							{/each}
						</Select.Group>
					</Select.Content>
				</Select.Root>
				<Select.Root type="single" bind:value={respFilter}>
					<Select.Trigger size="sm" class="w-52">{respLabel}</Select.Trigger>
					<Select.Content>
						<Select.Group>
							<Select.Item value="todos">Todos los responsables</Select.Item>
							{#each RESPONSABLES as r (r)}
								<Select.Item value={r}>{r}</Select.Item>
							{/each}
						</Select.Group>
					</Select.Content>
				</Select.Root>
				<Button variant="outline" size="sm" class="ms-auto" onclick={exportar}>
					<FileSpreadsheet data-icon="inline-start" /> Exportar Excel
				</Button>
			</div>
		</Card.Header>
		<Card.Content>
			<Table.Root>
				<Table.Header>
					<Table.Row>
						<Table.Head>Folio</Table.Head>
						<Table.Head>Unidad</Table.Head>
						<Table.Head>Celda</Table.Head>
						<Table.Head>Material Surtido</Table.Head>
						<Table.Head class="text-center">Cant.</Table.Head>
						<Table.Head>Fecha / Hora</Table.Head>
						<Table.Head>Responsable</Table.Head>
						<Table.Head>Tipo</Table.Head>
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{#each filtered as r (r.id)}
						<Table.Row>
							<Table.Cell class="font-mono font-medium">{r.folio}</Table.Cell>
							<Table.Cell class="text-muted-foreground">{r.unidad}</Table.Cell>
							<Table.Cell>{r.celda}</Table.Cell>
							<Table.Cell class="font-medium">{r.mat}</Table.Cell>
							<Table.Cell class="text-center tabular-nums">{r.qty}</Table.Cell>
							<Table.Cell class="text-muted-foreground text-sm">{r.fecha} · {r.hora} hrs</Table.Cell>
							<Table.Cell>{r.resp}</Table.Cell>
							<Table.Cell>
								<StatusBadge label={r.tipo} colorClass={TRAZA_TIPO_COLORS[r.tipo]} />
							</Table.Cell>
						</Table.Row>
					{:else}
						<Table.Row>
							<Table.Cell colspan={8} class="text-muted-foreground py-8 text-center">
								Sin registros para los filtros seleccionados.
							</Table.Cell>
						</Table.Row>
					{/each}
				</Table.Body>
			</Table.Root>
		</Card.Content>
	</Card.Root>
</div>
