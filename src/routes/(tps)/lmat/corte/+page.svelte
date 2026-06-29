<script lang="ts">
	import { useStore } from '$lib/tps/store.svelte.js';
	import { ARMOR_LEVEL_LABELS, PLANT_LABELS } from '$lib/tps/constants.js';
	import { cn } from '$lib/utils.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Table from '$lib/components/ui/table/index.js';
	import * as Tabs from '$lib/components/ui/tabs/index.js';
	import * as Empty from '$lib/components/ui/empty/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import Search from '@lucide/svelte/icons/search';
	import Scissors from '@lucide/svelte/icons/scissors';
	import Car from '@lucide/svelte/icons/car';
	import LayoutGrid from '@lucide/svelte/icons/layout-grid';
	import History from '@lucide/svelte/icons/history';
	import Package from '@lucide/svelte/icons/package';

	const store = useStore();
	const app = $derived(store.state);

	// --- Datos de trazabilidad de corte (GAP-ING-005) ---
	// Cada programa tiene revisiones; cada revision se aplica a folios/VINs con su nesting
	type CutMethod = 'programa' | 'numero_parte';
	type CutApplication = { folio: string; vin: string; appliedAt: string; nestingRef: string; plates: number };
	type CutProgramRev = { rev: string; date: string; changes: string; applications: CutApplication[] };
	type CutProgram = { id: string; name: string; zone: string; method: CutMethod; revisions: CutProgramRev[] };

	const programs: CutProgram[] = [
		{
			id: 'CP-PISO', name: 'Programa Corte Piso', zone: 'Piso', method: 'programa', revisions: [
				{ rev: 'Rev. 02', date: '2025-03-10', changes: 'Optimizacion nesting', applications: [
					{ folio: '4520', vin: '3GNEC16Z0YG118420', appliedAt: '2025-03-12', nestingRef: 'NST-PISO-02-A', plates: 3 }
				] },
				{ rev: 'Rev. 04', date: '2025-05-18', changes: 'Refuerzo traslape 25mm', applications: [
					{ folio: '4521', vin: '3GNEC16Z1YG221530', appliedAt: '2025-05-22', nestingRef: 'NST-PISO-04-A', plates: 3 },
					{ folio: '4524', vin: '3GNEC16Z9YG554210', appliedAt: '2025-06-01', nestingRef: 'NST-PISO-04-B', plates: 4 }
				] }
			]
		},
		{
			id: 'CP-TECHO', name: 'Programa Corte Techo', zone: 'Techo', method: 'programa', revisions: [
				{ rev: 'Rev. 03', date: '2025-04-02', changes: 'Reduccion merma 8%', applications: [
					{ folio: '4521', vin: '3GNEC16Z1YG221530', appliedAt: '2025-05-22', nestingRef: 'NST-TECHO-03-A', plates: 2 },
					{ folio: '4522', vin: '3GNEK13Z7YG774190', appliedAt: '2025-05-25', nestingRef: 'NST-TECHO-03-B', plates: 2 }
				] }
			]
		},
		{
			id: 'CP-PUERTAS', name: 'Corte Puertas (por No. parte)', zone: 'Puertas', method: 'numero_parte', revisions: [
				{ rev: 'Rev. 01', date: '2025-02-15', changes: 'Liberacion inicial', applications: [
					{ folio: '4520', vin: '3GNEC16Z0YG118420', appliedAt: '2025-03-12', nestingRef: 'PT-2200-3MM', plates: 4 },
					{ folio: '4522', vin: '3GNEK13Z7YG774190', appliedAt: '2025-05-25', nestingRef: 'PT-2200-3MM', plates: 4 }
				] }
			]
		}
	];

	let vinQuery = $state('');
	let programQuery = $state('');

	type FolioRow = { folio: string; vin: string; program: string; zone: string; rev: string; appliedAt: string; nesting: string; plates: number; method: CutMethod };
	const allApplications = $derived.by(() => {
		const rows: FolioRow[] = [];
		for (const p of programs)
			for (const r of p.revisions)
				for (const a of r.applications)
					rows.push({ folio: a.folio, vin: a.vin, program: p.name, zone: p.zone, rev: r.rev, appliedAt: a.appliedAt, nesting: a.nestingRef, plates: a.plates, method: p.method });
		return rows;
	});

	const vinResults = $derived(
		vinQuery.length < 2 ? [] : allApplications.filter((r) => `${r.folio} ${r.vin}`.toLowerCase().includes(vinQuery.toLowerCase()))
	);
	const filteredPrograms = $derived(
		!programQuery ? programs : programs.filter((p) => p.name.toLowerCase().includes(programQuery.toLowerCase()))
	);

	const totalApplications = $derived(allApplications.length);
	const totalVINs = $derived(new Set(allApplications.map((r) => r.vin)).size);
	const projectFor = (folio: string) => app.projects.find((p) => p.folioTPS === folio);
</script>

<div class="flex flex-wrap items-center justify-between gap-3">
	<p class="text-muted-foreground text-sm">Trazabilidad de programas de corte por VIN y por revision · piso de produccion</p>
</div>

<div class="grid grid-cols-2 gap-4 md:grid-cols-4">
	<Card.Root><Card.Header><Card.Description class="flex items-center gap-2"><Scissors class="size-4" /> Programas</Card.Description><Card.Title class="text-2xl tabular-nums">{programs.length}</Card.Title></Card.Header></Card.Root>
	<Card.Root><Card.Header><Card.Description class="flex items-center gap-2"><Car class="size-4" /> VINs trazados</Card.Description><Card.Title class="text-2xl tabular-nums">{totalVINs}</Card.Title></Card.Header></Card.Root>
	<Card.Root><Card.Header><Card.Description class="flex items-center gap-2"><History class="size-4" /> Aplicaciones</Card.Description><Card.Title class="text-2xl tabular-nums">{totalApplications}</Card.Title></Card.Header></Card.Root>
	<Card.Root><Card.Header><Card.Description class="flex items-center gap-2"><LayoutGrid class="size-4" /> Metodos</Card.Description><Card.Title class="text-2xl tabular-nums">2</Card.Title></Card.Header></Card.Root>
</div>

<Tabs.Root value="por-vin" class="mt-4">
	<Tabs.List>
		<Tabs.Trigger value="por-vin">Por VIN / Folio</Tabs.Trigger>
		<Tabs.Trigger value="por-programa">Por Programa</Tabs.Trigger>
	</Tabs.List>

	<Tabs.Content value="por-vin">
		<Card.Root>
			<Card.Header>
				<Card.Title>Consulta por VIN o Folio</Card.Title>
				<Card.Description>Que revision de cada programa de corte se uso en esta unidad</Card.Description>
			</Card.Header>
			<Card.Content class="space-y-4">
				<div class="relative max-w-md">
					<Search class="text-muted-foreground absolute left-2.5 top-2.5 size-4" />
					<Input bind:value={vinQuery} placeholder="Buscar VIN o folio (ej. 4521)..." class="pl-9" />
				</div>
				{#if vinResults.length > 0}
					<Table.Root>
						<Table.Header><Table.Row>
							<Table.Head>Folio</Table.Head><Table.Head>VIN</Table.Head><Table.Head>Programa</Table.Head>
							<Table.Head>Zona</Table.Head><Table.Head>Revision</Table.Head><Table.Head>Nesting</Table.Head>
							<Table.Head class="text-right">Placas</Table.Head><Table.Head>Fecha</Table.Head>
						</Table.Row></Table.Header>
						<Table.Body>
							{#each vinResults as r (r.folio + r.program)}
								{@const proj = projectFor(r.folio)}
								<Table.Row>
									<Table.Cell class="font-mono font-semibold">{r.folio}</Table.Cell>
									<Table.Cell class="font-mono text-xs">{r.vin}{#if proj}<div class="text-muted-foreground">{proj.vehicleModel}</div>{/if}</Table.Cell>
									<Table.Cell>{r.program}</Table.Cell>
									<Table.Cell>{r.zone}</Table.Cell>
									<Table.Cell><Badge variant="secondary">{r.rev}</Badge></Table.Cell>
									<Table.Cell class="font-mono text-xs">{r.nesting}</Table.Cell>
									<Table.Cell class="text-right tabular-nums">{r.plates}</Table.Cell>
									<Table.Cell class="text-muted-foreground text-xs">{r.appliedAt}</Table.Cell>
								</Table.Row>
							{/each}
						</Table.Body>
					</Table.Root>
				{:else}
					<Empty.Root>
						<Empty.Header><Empty.Media variant="icon"><Car /></Empty.Media>
						<Empty.Title>Sin resultados</Empty.Title>
						<Empty.Description>Captura un VIN o folio para ver las revisiones de corte aplicadas.</Empty.Description></Empty.Header>
					</Empty.Root>
				{/if}
			</Card.Content>
		</Card.Root>
	</Tabs.Content>

	<Tabs.Content value="por-programa">
		<div class="mb-3 relative max-w-md">
			<Search class="text-muted-foreground absolute left-2.5 top-2.5 size-4" />
			<Input bind:value={programQuery} placeholder="Buscar programa..." class="pl-9" />
		</div>
		<div class="space-y-4">
			{#each filteredPrograms as p (p.id)}
				<Card.Root>
					<Card.Header>
						<Card.Title class="flex items-center gap-2"><Scissors class="size-4" /> {p.name}</Card.Title>
						<Card.Description>Zona {p.zone} · metodo: {p.method === 'programa' ? 'Por programa' : 'Por numero de parte'}</Card.Description>
					</Card.Header>
					<Card.Content class="space-y-3">
						{#each p.revisions as r (r.rev)}
							<div class="rounded-md border p-3">
								<div class="flex items-center justify-between"><Badge variant="secondary">{r.rev}</Badge><span class="text-muted-foreground text-xs">{r.date} · {r.changes}</span></div>
								<div class="mt-2 flex flex-wrap gap-2">
									{#each r.applications as a (a.folio)}
										<Badge variant="outline" class="font-mono"><Package class="mr-1 size-3" />{a.folio} · {a.plates} placas</Badge>
									{/each}
								</div>
							</div>
						{/each}
					</Card.Content>
				</Card.Root>
			{/each}
		</div>
	</Tabs.Content>
</Tabs.Root>
