<script lang="ts">
	import { cn } from '$lib/utils.js';
	import { useTallerStore } from '$lib/tps/taller/store.svelte.js';
	import { BRANCH_CODES, APPT_STATUS_LABEL, APPT_STATUS_VARIANT } from '$lib/tps/taller/constants.js';
	import type { BranchCode } from '$lib/tps/taller/types.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import * as Table from '$lib/components/ui/table/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { Progress } from '$lib/components/ui/progress/index.js';
	import MapPin from '@lucide/svelte/icons/map-pin';
	import Wrench from '@lucide/svelte/icons/wrench';
	import User from '@lucide/svelte/icons/user';

	const store = useTallerStore();
	const branch = $derived(store.branch);
	function setBranch(b: string) { store.branch = b as BranchCode; }

	const DATE = '2026-07-02';

	const bays = $derived(store.state.bays.filter((b) => b.branch === branch));
	const load = $derived(store.bayLoad(branch, DATE));

	function pct(bayId: number, cap: number): number {
		return Math.min(Math.round(((load[bayId] ?? 0) / cap) * 100), 120);
	}
	function color(p: number): string {
		if (p >= 100) return 'bg-destructive';
		if (p >= 85) return 'bg-yellow-400';
		return 'bg-emerald-500';
	}
	function estadoLabel(p: number): string {
		if (p >= 100) return 'Saturada';
		if (p >= 85) return 'Alta ocupación';
		if (p > 0) return 'Disponible';
		return 'Libre';
	}

	const totalCap = $derived(bays.reduce((s, b) => s + b.capacityHrs, 0));
	const totalLoad = $derived(bays.reduce((s, b) => s + (load[b.id] ?? 0), 0));
	const utilizacion = $derived(totalCap ? Math.round((totalLoad / totalCap) * 100) : 0);
</script>

<div class="flex flex-col gap-5">
	<div class="flex flex-wrap items-center justify-between gap-3">
		<div>
			<h2 class="text-xl font-semibold">Capacidad de Bahías</h2>
			<p class="text-muted-foreground text-sm">Carga por bahía y técnico · El sistema impide agendar citas que excedan la capacidad instalada</p>
		</div>
		<div class="flex items-center gap-2">
			<Badge variant="outline" class="font-mono">GAP-TLL-001</Badge>
			<Select.Root type="single" value={branch} onValueChange={setBranch}>
				<Select.Trigger class="w-40"><MapPin class="mr-1 size-3" />{store.getBranch(branch)?.name ?? branch}</Select.Trigger>
				<Select.Content>
					{#each BRANCH_CODES as b}<Select.Item value={b}>{store.getBranch(b)?.name ?? b} ({b})</Select.Item>{/each}
				</Select.Content>
			</Select.Root>
		</div>
	</div>

	<!-- Resumen -->
	<div class="grid gap-4 sm:grid-cols-3">
		<Card.Root><Card.Header class="pb-2"><Card.Description>Bahías activas</Card.Description><Card.Title class="text-2xl tabular-nums">{bays.length}</Card.Title></Card.Header></Card.Root>
		<Card.Root><Card.Header class="pb-2"><Card.Description>Utilización del taller</Card.Description><Card.Title class="text-2xl tabular-nums {utilizacion >= 85 ? 'text-destructive' : utilizacion >= 60 ? 'text-yellow-600' : 'text-emerald-500'}">{utilizacion}%</Card.Title></Card.Header></Card.Root>
		<Card.Root><Card.Header class="pb-2"><Card.Description>Horas comprometidas</Card.Description><Card.Title class="text-2xl tabular-nums">{totalLoad} / {totalCap} h</Card.Title></Card.Header></Card.Root>
	</div>

	<!-- Bahías cards -->
	<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
		{#each bays as b (b.id)}
			{@const p = pct(b.id, b.capacityHrs)}
			<Card.Root class={cn(p >= 100 && 'border-destructive/50', p >= 85 && p < 100 && 'border-yellow-500/50', p < 85 && p > 0 && 'border-emerald-500/40')}>
				<Card.Header class="pb-2">
					<Card.Title class="flex items-center gap-2 text-sm"><Wrench class="size-4" />{b.name}</Card.Title>
					<Card.Description class="flex items-center gap-1 text-xs"><User class="size-3" />{b.tech}</Card.Description>
				</Card.Header>
				<Card.Content>
					<div class="flex items-baseline justify-between">
						<span class="text-2xl font-bold tabular-nums">{load[b.id] ?? 0}<span class="text-muted-foreground text-sm">/{b.capacityHrs}h</span></span>
						<Badge variant={p >= 100 ? 'destructive' : p >= 85 ? 'outline' : 'secondary'}>{p}%</Badge>
					</div>
					<div class="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
						<div class={cn('h-full rounded-full transition-all', color(p))} style="width:{Math.min(p, 100)}%"></div>
					</div>
					<p class="text-muted-foreground mt-1 text-xs">{estadoLabel(p)}</p>
				</Card.Content>
			</Card.Root>
		{/each}
	</div>

	<!-- Detalle de citas por bahía -->
	<Card.Root>
		<Card.Header><Card.Title class="text-sm">Citas del día por bahía · {DATE}</Card.Title></Card.Header>
		<Card.Content>
			<Table.Root>
				<Table.Header>
					<Table.Row>
						<Table.Head>Bahía</Table.Head>
						<Table.Head>Hora</Table.Head>
						<Table.Head>Vehículo</Table.Head>
						<Table.Head>Servicio</Table.Head>
						<Table.Head class="text-right">Duración</Table.Head>
						<Table.Head>Estado</Table.Head>
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{#each store.apptsOn(branch, DATE) as a (a.id)}
						{@const v = store.getVehicle(a.vin)}
						<Table.Row>
							<Table.Cell class="font-medium">Bahía {a.bay}</Table.Cell>
							<Table.Cell class="tabular-nums text-sm">{String(a.sh).padStart(2, '0')}:{String(a.sm).padStart(2, '0')}</Table.Cell>
							<Table.Cell class="text-sm">{v ? `${v.brand} ${v.model}` : a.vin}</Table.Cell>
							<Table.Cell class="text-muted-foreground text-sm">{a.svc}</Table.Cell>
							<Table.Cell class="text-right tabular-nums text-sm">{a.dur}h</Table.Cell>
							<Table.Cell><Badge variant={APPT_STATUS_VARIANT[a.status]}>{APPT_STATUS_LABEL[a.status]}</Badge></Table.Cell>
						</Table.Row>
					{/each}
				</Table.Body>
			</Table.Root>
		</Card.Content>
	</Card.Root>
</div>
