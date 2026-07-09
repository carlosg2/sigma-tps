<script lang="ts">
	import { cn } from '$lib/utils.js';
	import { useTallerStore } from '$lib/tps/taller/store.svelte.js';
	import { ALERT_URGENCY } from '$lib/tps/taller/constants.js';
	import type { BranchCode } from '$lib/tps/taller/types.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Table from '$lib/components/ui/table/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { Progress } from '$lib/components/ui/progress/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import Building2 from '@lucide/svelte/icons/building-2';
	import Wrench from '@lucide/svelte/icons/wrench';
	import Users from '@lucide/svelte/icons/users';
	import TriangleAlert from '@lucide/svelte/icons/triangle-alert';
	import ArrowRight from '@lucide/svelte/icons/arrow-right';

	const store = useTallerStore();
	const DATE = '2026-07-02';

	const rows = $derived(store.state.branches.map((br) => {
		const load = store.bayLoad(br.code, DATE);
		const capacidad = store.state.bays.filter((b) => b.branch === br.code).reduce((s, b) => s + b.capacityHrs, 0)
			|| br.bays * 8;
		const comprometido = Object.values(load).reduce((s, h) => s + h, 0);
		const citasHoy = store.apptsOn(br.code, DATE).length;
		const alertas = store.alertsByBranch(br.code).length;
		const util = capacidad ? Math.round((comprometido / capacidad) * 100) : 0;
		return { br, capacidad, comprometido, citasHoy, alertas, util };
	}));

	const totals = $derived({
		citas: rows.reduce((s, r) => s + r.citasHoy, 0),
		bahias: store.state.branches.reduce((s, b) => s + b.bays, 0),
		tecnicos: store.state.branches.reduce((s, b) => s + b.techs, 0),
		alertas: store.state.alerts.length
	});

	function goBranch(code: BranchCode) {
		store.branch = code;
	}
	function utilColor(u: number) {
		return u >= 85 ? 'text-destructive' : u >= 60 ? 'text-yellow-600' : 'text-emerald-500';
	}
</script>

<div class="flex flex-col gap-5">
	<div class="flex flex-wrap items-center justify-between gap-3">
		<div>
			<h2 class="text-xl font-semibold">Vista Multi-Sucursal</h2>
			<p class="text-muted-foreground text-sm">Consolidado de las 5 sucursales para homologar procesos de servicio</p>
		</div>
		<Badge variant="outline" class="font-mono">GAP-TLL-001</Badge>
	</div>

	<!-- Totales -->
	<div class="grid gap-4 sm:grid-cols-4">
		<Card.Root><Card.Header class="pb-2"><Card.Description class="flex items-center gap-1"><Building2 class="size-3" />Sucursales</Card.Description><Card.Title class="text-2xl tabular-nums">{store.state.branches.length}</Card.Title></Card.Header></Card.Root>
		<Card.Root><Card.Header class="pb-2"><Card.Description>Citas hoy (total)</Card.Description><Card.Title class="text-2xl tabular-nums">{totals.citas}</Card.Title></Card.Header></Card.Root>
		<Card.Root><Card.Header class="pb-2"><Card.Description class="flex items-center gap-1"><Wrench class="size-3" />Bahías totales</Card.Description><Card.Title class="text-2xl tabular-nums">{totals.bahias}</Card.Title></Card.Header></Card.Root>
		<Card.Root><Card.Header class="pb-2"><Card.Description class="flex items-center gap-1"><TriangleAlert class="size-3" />Alertas activas</Card.Description><Card.Title class="text-2xl tabular-nums text-yellow-600">{totals.alertas}</Card.Title></Card.Header></Card.Root>
	</div>

	<!-- Tarjetas por sucursal -->
	<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
		{#each rows as r (r.br.code)}
			<Card.Root>
				<Card.Header class="pb-2">
					<div class="flex items-center justify-between">
						<Card.Title class="text-base">{r.br.name}</Card.Title>
						<Badge variant="outline" class="font-mono">{r.br.code}</Badge>
					</div>
					<Card.Description>{r.br.city}</Card.Description>
				</Card.Header>
				<Card.Content class="space-y-3">
					<div class="grid grid-cols-3 gap-2 text-center">
						<div><p class="text-lg font-bold tabular-nums">{r.citasHoy}</p><p class="text-muted-foreground text-[10px]">Citas hoy</p></div>
						<div><p class="text-lg font-bold tabular-nums flex items-center justify-center gap-1"><Wrench class="size-3" />{r.br.bays}</p><p class="text-muted-foreground text-[10px]">Bahías</p></div>
						<div><p class="text-lg font-bold tabular-nums flex items-center justify-center gap-1"><Users class="size-3" />{r.br.techs}</p><p class="text-muted-foreground text-[10px]">Técnicos</p></div>
					</div>
					<div>
						<div class="flex items-center justify-between text-xs mb-1">
							<span class="text-muted-foreground">Utilización</span>
							<span class={cn('font-semibold tabular-nums', utilColor(r.util))}>{r.util}%</span>
						</div>
						<Progress value={Math.min(r.util, 100)} />
					</div>
					{#if r.alertas > 0}
						<div class="flex items-center gap-1 text-xs text-yellow-600"><TriangleAlert class="size-3" />{r.alertas} alerta{r.alertas !== 1 ? 's' : ''} de mantenimiento</div>
					{/if}
				</Card.Content>
				<Card.Footer>
					<Button variant="outline" size="sm" class="w-full" href="/taller/agenda" onclick={() => goBranch(r.br.code)}>
						Ver agenda <ArrowRight class="ml-2 size-3" />
					</Button>
				</Card.Footer>
			</Card.Root>
		{/each}
	</div>

	<!-- Tabla comparativa -->
	<Card.Root>
		<Card.Header><Card.Title class="text-sm">Comparativo de Sucursales</Card.Title></Card.Header>
		<Card.Content>
			<Table.Root>
				<Table.Header>
					<Table.Row>
						<Table.Head>Sucursal</Table.Head>
						<Table.Head>Ciudad</Table.Head>
						<Table.Head class="text-right">Citas hoy</Table.Head>
						<Table.Head class="text-right">Bahías</Table.Head>
						<Table.Head class="text-right">Técnicos</Table.Head>
						<Table.Head class="text-right">Horas comprometidas</Table.Head>
						<Table.Head class="text-right">Utilización</Table.Head>
						<Table.Head class="text-right">Alertas</Table.Head>
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{#each rows as r (r.br.code)}
						<Table.Row>
							<Table.Cell class="font-medium">{r.br.name} <span class="text-muted-foreground font-mono text-xs">{r.br.code}</span></Table.Cell>
							<Table.Cell class="text-muted-foreground text-sm">{r.br.city}</Table.Cell>
							<Table.Cell class="text-right tabular-nums">{r.citasHoy}</Table.Cell>
							<Table.Cell class="text-right tabular-nums">{r.br.bays}</Table.Cell>
							<Table.Cell class="text-right tabular-nums">{r.br.techs}</Table.Cell>
							<Table.Cell class="text-right tabular-nums">{r.comprometido} / {r.capacidad} h</Table.Cell>
							<Table.Cell class="text-right tabular-nums font-semibold {utilColor(r.util)}">{r.util}%</Table.Cell>
							<Table.Cell class="text-right">
								{#if r.alertas > 0}<Badge variant="outline" class="border-yellow-400 text-yellow-700">{r.alertas}</Badge>{:else}<span class="text-muted-foreground text-xs">—</span>{/if}
							</Table.Cell>
						</Table.Row>
					{/each}
				</Table.Body>
			</Table.Root>
		</Card.Content>
	</Card.Root>
</div>
