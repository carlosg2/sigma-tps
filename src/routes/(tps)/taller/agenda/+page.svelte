<script lang="ts">
	import { cn } from '$lib/utils.js';
	import { useTallerStore } from '$lib/tps/taller/store.svelte.js';
	import {
		BRANCH_CODES, SERVICE_TYPES, APPT_STATUS_LABEL, APPT_STATUS_VARIANT,
		APPT_ACCENT, ARMOR_BADGE
	} from '$lib/tps/taller/constants.js';
	import type { Appointment, BranchCode } from '$lib/tps/taller/types.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import * as Tabs from '$lib/components/ui/tabs/index.js';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import * as Popover from '$lib/components/ui/popover/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import { Textarea } from '$lib/components/ui/textarea/index.js';
	import { toast } from 'svelte-sonner';
	import ChevronLeft from '@lucide/svelte/icons/chevron-left';
	import ChevronRight from '@lucide/svelte/icons/chevron-right';
	import Plus from '@lucide/svelte/icons/circle-plus';
	import MapPin from '@lucide/svelte/icons/map-pin';
	import Bell from '@lucide/svelte/icons/bell';
	import Clock from '@lucide/svelte/icons/clock';
	import Wrench from '@lucide/svelte/icons/wrench';
	import Car from '@lucide/svelte/icons/car';
	import CheckCircle from '@lucide/svelte/icons/circle-check';
	import CalendarDays from '@lucide/svelte/icons/calendar-days';
	import User from '@lucide/svelte/icons/user';

	const store = useTallerStore();

	let cursor = $state(new Date(2026, 6, 2));
	let calView = $state<'dia' | 'semana' | 'mes'>('dia');

	const branch = $derived(store.branch);
	function setBranch(b: string) { store.branch = b as BranchCode; }

	const HOURS = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18];
	const DIAS_SEMANA = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

	function fmtDate(d: Date): string {
		return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
	}
	function fmtLabel(d: Date): string {
		return d.toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
	}

	const cursorKey = $derived(fmtDate(cursor));

	function nav(dir: number) {
		const d = new Date(cursor);
		if (calView === 'dia') d.setDate(d.getDate() + dir);
		else if (calView === 'semana') d.setDate(d.getDate() + dir * 7);
		else d.setMonth(d.getMonth() + dir);
		cursor = d;
	}
	function today() { cursor = new Date(2026, 6, 2); }

	const dayAppts = $derived(store.apptsOn(branch, cursorKey));

	function weekDays(d: Date): Date[] {
		const start = new Date(d);
		start.setDate(d.getDate() - d.getDay());
		return Array.from({ length: 7 }, (_, i) => { const x = new Date(start); x.setDate(start.getDate() + i); return x; });
	}
	const week = $derived(weekDays(cursor));

	function monthMatrix(d: Date): Date[][] {
		const first = new Date(d.getFullYear(), d.getMonth(), 1);
		const start = new Date(first);
		start.setDate(1 - first.getDay());
		const weeks: Date[][] = [];
		for (let w = 0; w < 6; w++) {
			const row: Date[] = [];
			for (let i = 0; i < 7; i++) { const x = new Date(start); x.setDate(start.getDate() + w * 7 + i); row.push(x); }
			weeks.push(row);
		}
		return weeks;
	}
	const month = $derived(monthMatrix(cursor));

	const stats = $derived.by(() => {
		const list = dayAppts;
		const enProceso = list.filter((a) => a.status === 'en-proceso').length;
		const completadas = list.filter((a) => a.status === 'completada').length;
		const br = store.getBranch(branch);
		const load = store.bayLoad(branch, cursorKey);
		const bahiasDisp = (br?.bays ?? 0) - Object.values(load).filter((h) => h >= 6).length;
		return { total: list.length, enProceso, completadas, bahiasDisp: Math.max(bahiasDisp, 0) };
	});

	let detailOpen = $state(false);
	let detailAppt = $state<Appointment | null>(null);
	function openDetail(a: Appointment) { detailAppt = a; detailOpen = true; }

	function apptLabel(a: Appointment): string {
		const v = store.getVehicle(a.vin);
		return v ? `${v.brand} ${v.model}` : a.vin;
	}

	let newOpen = $state(false);
	let nVin = $state('');
	let nSvc = $state('');
	let nDate = $state('2026-07-02');
	let nHour = $state('9');
	let nMin = $state('0');
	let nDur = $state('2');
	let nBay = $state('1');
	let nNotas = $state('');

	const selVehicle = $derived(store.getVehicle(nVin));
	const branchBays = $derived(store.state.bays.filter((b) => b.branch === branch));
	const bayFree = $derived(nVin && nSvc ? store.isBayFree(branch, nDate, +nBay, +nHour, +nMin, +nDur) : true);

	function openNew() {
		nVin = ''; nSvc = ''; nDate = cursorKey; nHour = '9'; nMin = '0'; nDur = '2'; nBay = '1'; nNotas = '';
		newOpen = true;
	}

	function confirmNew() {
		if (!nVin) { toast.error('Selecciona un vehículo'); return; }
		if (!nSvc) { toast.error('Selecciona el tipo de servicio'); return; }
		if (!bayFree) { toast.error('La bahía no está disponible en ese horario'); return; }
		const tech = branchBays.find((b) => b.id === +nBay)?.tech ?? '';
		const appt = store.addAppointment({
			date: nDate, sh: +nHour, sm: +nMin, dur: +nDur, vin: nVin, svc: nSvc,
			bay: +nBay, tech, branch, status: 'programada', notas: nNotas || undefined
		});
		toast.success(`Cita ${appt.id} agendada`, { description: `${apptLabel(appt)} · ${nDate} ${nHour.padStart(2, '0')}:${nMin.padStart(2, '0')}` });
		newOpen = false;
	}

	let notifOpen = $state(false);

	function apptTop(a: Appointment): number { return ((a.sh - 8) * 60 + a.sm); }
	function apptHeight(a: Appointment): number { return a.dur * 60; }
</script>

<div class="flex flex-col gap-5">
	<!-- Header -->
	<div class="flex flex-wrap items-center justify-between gap-3">
		<div>
			<h2 class="text-xl font-semibold">Agenda de Servicio</h2>
			<p class="text-muted-foreground text-sm">Tablero de citas por bahía y técnico · Sugerencia automática de disponibilidad</p>
		</div>
		<div class="flex flex-wrap items-center gap-2">
			<Badge variant="outline" class="font-mono">GAP-TLL-001</Badge>
			<Select.Root type="single" value={branch} onValueChange={setBranch}>
				<Select.Trigger class="w-40"><MapPin class="mr-1 size-3" />{store.getBranch(branch)?.name ?? branch}</Select.Trigger>
				<Select.Content>
					{#each BRANCH_CODES as b}
						<Select.Item value={b}>{store.getBranch(b)?.name ?? b} ({b})</Select.Item>
					{/each}
				</Select.Content>
			</Select.Root>

			<Popover.Root bind:open={notifOpen}>
				<Popover.Trigger>
					{#snippet child({ props })}
						<Button {...props} variant="outline" size="icon" class="relative">
							<Bell class="size-4" />
							{#if store.unreadNotifs > 0}
								<span class="bg-destructive absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full text-[9px] font-bold text-white">{store.unreadNotifs}</span>
							{/if}
						</Button>
					{/snippet}
				</Popover.Trigger>
				<Popover.Content class="w-80 p-0" align="end">
					<div class="flex items-center justify-between border-b p-3">
						<span class="text-sm font-semibold">Notificaciones</span>
						<Button variant="ghost" size="sm" class="h-6 text-xs" onclick={() => store.markAllRead()}>Marcar leídas</Button>
					</div>
					<div class="max-h-80 overflow-y-auto">
						{#each store.state.notifs as n (n.id)}
							<div class={cn('border-b p-3 last:border-0', !n.read && 'bg-primary/5')}>
								<p class="text-sm font-medium leading-tight">{n.title}</p>
								<p class="text-muted-foreground text-xs mt-0.5">{n.sub}</p>
								<p class="text-muted-foreground text-[10px] mt-1">{n.time}</p>
							</div>
						{/each}
					</div>
				</Popover.Content>
			</Popover.Root>

			<Button onclick={openNew}><Plus class="mr-2 size-4" />Nueva Cita</Button>
		</div>
	</div>

	<!-- Stats -->
	<div class="grid gap-4 sm:grid-cols-4">
		<Card.Root><Card.Header class="pb-2"><Card.Description>Citas del día</Card.Description><Card.Title class="text-2xl tabular-nums">{stats.total}</Card.Title></Card.Header></Card.Root>
		<Card.Root><Card.Header class="pb-2"><Card.Description>En proceso</Card.Description><Card.Title class="text-2xl tabular-nums text-primary">{stats.enProceso}</Card.Title></Card.Header></Card.Root>
		<Card.Root><Card.Header class="pb-2"><Card.Description>Completadas</Card.Description><Card.Title class="text-2xl tabular-nums text-emerald-500">{stats.completadas}</Card.Title></Card.Header></Card.Root>
		<Card.Root><Card.Header class="pb-2"><Card.Description>Bahías disponibles</Card.Description><Card.Title class="text-2xl tabular-nums">{stats.bahiasDisp}/{store.getBranch(branch)?.bays ?? 0}</Card.Title></Card.Header></Card.Root>
	</div>

	<!-- Calendar toolbar -->
	<div class="flex flex-wrap items-center justify-between gap-3">
		<Tabs.Root value={calView} onValueChange={(v) => (calView = v as typeof calView)}>
			<Tabs.List>
				<Tabs.Trigger value="dia">Día</Tabs.Trigger>
				<Tabs.Trigger value="semana">Semana</Tabs.Trigger>
				<Tabs.Trigger value="mes">Mes</Tabs.Trigger>
			</Tabs.List>
		</Tabs.Root>
		<div class="flex items-center gap-2">
			<Button variant="outline" size="icon" onclick={() => nav(-1)}><ChevronLeft class="size-4" /></Button>
			<Button variant="outline" size="sm" onclick={today}>Hoy</Button>
			<Button variant="outline" size="icon" onclick={() => nav(1)}><ChevronRight class="size-4" /></Button>
			<span class="text-sm font-medium min-w-48 text-center capitalize">
				{#if calView === 'mes'}
					{cursor.toLocaleDateString('es-MX', { month: 'long', year: 'numeric' })}
				{:else if calView === 'semana'}
					Semana del {week[0].getDate()} al {week[6].getDate()} {week[6].toLocaleDateString('es-MX', { month: 'short' })}
				{:else}
					{fmtLabel(cursor)}
				{/if}
			</span>
		</div>
	</div>

	{#if calView === 'dia'}
		<Card.Root>
			<Card.Content class="p-0 overflow-x-auto">
				<div class="relative" style="min-height:{HOURS.length * 60}px">
					{#each HOURS as h}
						<div class="flex border-b" style="height:60px">
							<div class="text-muted-foreground w-14 shrink-0 pt-1 pr-2 text-right text-[10px]">{String(h).padStart(2, '0')}:00</div>
							<div class="flex-1 border-l"></div>
						</div>
					{/each}
					{#each dayAppts as a (a.id)}
						{@const v = store.getVehicle(a.vin)}
						<button
							class={cn('absolute left-16 right-3 rounded-md border-l-4 border bg-card px-3 py-1.5 text-left shadow-sm transition hover:shadow-md', APPT_ACCENT[a.status])}
							style="top:{apptTop(a)}px; height:{apptHeight(a) - 4}px"
							onclick={() => openDetail(a)}
						>
							<div class="flex items-center justify-between gap-2">
								<span class="text-[11px] font-medium opacity-70">{String(a.sh).padStart(2, '0')}:{String(a.sm).padStart(2, '0')} · {a.dur}h</span>
								<Badge variant={APPT_STATUS_VARIANT[a.status]} class="h-4 px-1.5 text-[9px]">{APPT_STATUS_LABEL[a.status]}</Badge>
							</div>
							<p class="text-sm font-semibold truncate">{v ? `${v.brand} ${v.model}` : a.vin}</p>
							<p class="text-muted-foreground truncate text-xs">{a.svc}</p>
							<p class="text-muted-foreground text-[10px] mt-0.5">Bahía {a.bay} · {a.tech}</p>
						</button>
					{/each}
				</div>
			</Card.Content>
		</Card.Root>

	{:else if calView === 'semana'}
		<Card.Root>
			<Card.Content class="p-0 overflow-x-auto">
				<div class="min-w-180">
					<div class="grid border-b" style="grid-template-columns:56px repeat(7,1fr)">
						<div></div>
						{#each week as d}
							<div class="border-l p-2 text-center">
								<div class="text-muted-foreground text-[10px] uppercase">{DIAS_SEMANA[d.getDay()]}</div>
								<div class={cn('text-lg font-bold', fmtDate(d) === '2026-07-02' && 'text-primary')}>{d.getDate()}</div>
							</div>
						{/each}
					</div>
					{#each HOURS as h}
						<div class="grid border-b" style="grid-template-columns:56px repeat(7,1fr)">
							<div class="text-muted-foreground pt-1 pr-2 text-right text-[10px]">{String(h).padStart(2, '0')}:00</div>
							{#each week as d}
								{@const appts = store.apptsOn(branch, fmtDate(d)).filter((a) => a.sh === h)}
								<div class="border-l p-0.5 min-h-11.5">
									{#each appts as a (a.id)}
										{@const v = store.getVehicle(a.vin)}
										<button class={cn('mb-0.5 w-full rounded border-l-2 bg-muted/60 px-1 py-0.5 text-left text-[9px] leading-tight', APPT_ACCENT[a.status])} onclick={() => openDetail(a)}>
											<span class="font-medium truncate block">{v ? v.brand : a.vin}</span>
											<span class="text-muted-foreground truncate block">B{a.bay}</span>
										</button>
									{/each}
								</div>
							{/each}
						</div>
					{/each}
				</div>
			</Card.Content>
		</Card.Root>

	{:else}
		<Card.Root>
			<Card.Content class="p-3">
				<div class="grid grid-cols-7 gap-1">
					{#each DIAS_SEMANA as dn}
						<div class="text-muted-foreground pb-1 text-center text-[10px] font-semibold uppercase">{dn}</div>
					{/each}
					{#each month as w}
						{#each w as d}
							{@const appts = store.apptsOn(branch, fmtDate(d))}
							{@const inMonth = d.getMonth() === cursor.getMonth()}
							<div class={cn('min-h-19 rounded-md border p-1', !inMonth && 'opacity-40', fmtDate(d) === '2026-07-02' && 'border-primary')}>
								<div class="text-xs font-medium">{d.getDate()}</div>
								<div class="mt-0.5 space-y-0.5">
									{#each appts.slice(0, 3) as a (a.id)}
										{@const v = store.getVehicle(a.vin)}
										<button class={cn('w-full truncate rounded border-l-2 bg-muted/60 px-1 text-left text-[9px]', APPT_ACCENT[a.status])} onclick={() => openDetail(a)}>
											{String(a.sh).padStart(2, '0')}:{String(a.sm).padStart(2, '0')} {v ? v.brand : a.vin}
										</button>
									{/each}
									{#if appts.length > 3}<span class="text-muted-foreground text-[9px]">+{appts.length - 3} más</span>{/if}
								</div>
							</div>
						{/each}
					{/each}
				</div>
			</Card.Content>
		</Card.Root>
	{/if}
</div>

<Dialog.Root bind:open={detailOpen}>
	<Dialog.Content class="max-w-lg">
		{#if detailAppt}
			{@const a = detailAppt}
			{@const v = store.getVehicle(a.vin)}
			<Dialog.Header>
				<Dialog.Title class="flex items-center gap-2">
					<span class="font-mono text-sm">{a.id}</span>
					<Badge variant={APPT_STATUS_VARIANT[a.status]}>{APPT_STATUS_LABEL[a.status]}</Badge>
				</Dialog.Title>
				<Dialog.Description>{a.svc}</Dialog.Description>
			</Dialog.Header>
			<div class="space-y-3">
				{#if v}
					<div class="rounded-md border p-3">
						<div class="flex items-center justify-between">
							<div>
								<p class="font-semibold">{v.brand} {v.model} {v.year}</p>
								<p class="text-muted-foreground text-xs">{v.client}</p>
							</div>
							<Badge variant="outline" class={ARMOR_BADGE[v.level]}>{v.level}</Badge>
						</div>
						<div class="mt-2 grid grid-cols-3 gap-2 text-xs">
							<div><span class="text-muted-foreground block">VIN</span><span class="font-mono">{v.vin}</span></div>
							<div><span class="text-muted-foreground block">Matrícula</span>{v.plate}</div>
							<div><span class="text-muted-foreground block">Km</span>{v.km.toLocaleString('es-MX')}</div>
						</div>
					</div>
				{/if}
				<div class="grid grid-cols-2 gap-3 text-sm">
					<div class="flex items-center gap-2"><CalendarDays class="text-muted-foreground size-4" />{a.date}</div>
					<div class="flex items-center gap-2"><Clock class="text-muted-foreground size-4" />{String(a.sh).padStart(2, '0')}:{String(a.sm).padStart(2, '0')} · {a.dur}h</div>
					<div class="flex items-center gap-2"><Wrench class="text-muted-foreground size-4" />Bahía {a.bay}</div>
					<div class="flex items-center gap-2"><User class="text-muted-foreground size-4" />{a.tech}</div>
				</div>
				{#if a.notas}
					<div class="rounded-md bg-muted/50 p-2 text-sm"><span class="text-muted-foreground text-xs">Notas: </span>{a.notas}</div>
				{/if}
			</div>
			<Dialog.Footer class="flex-wrap gap-2">
				{#if a.status === 'programada'}
					<Button variant="outline" onclick={() => { store.setApptStatus(a.id, 'en-proceso'); toast.success('Cita en proceso'); detailOpen = false; }}>Iniciar servicio</Button>
				{/if}
				{#if a.status === 'en-proceso'}
					<Button variant="outline" onclick={() => { store.setApptStatus(a.id, 'completada'); toast.success('Servicio completado'); detailOpen = false; }}><CheckCircle class="mr-2 size-4" />Completar</Button>
				{/if}
				<Button href="/taller/recepcion" onclick={() => (detailOpen = false)}><Car class="mr-2 size-4" />Abrir Recepción</Button>
			</Dialog.Footer>
		{/if}
	</Dialog.Content>
</Dialog.Root>

<Dialog.Root bind:open={newOpen}>
	<Dialog.Content class="max-w-lg">
		<Dialog.Header>
			<Dialog.Title>Nueva Cita de Servicio</Dialog.Title>
			<Dialog.Description>{store.getBranch(branch)?.name} · Verificación automática de disponibilidad de bahía</Dialog.Description>
		</Dialog.Header>
		<div class="space-y-3">
			<div>
				<Label>Vehículo</Label>
				<Select.Root type="single" bind:value={nVin}>
					<Select.Trigger>{selVehicle ? `${selVehicle.brand} ${selVehicle.model} · ${selVehicle.plate}` : 'Seleccionar de la flota'}</Select.Trigger>
					<Select.Content>
						{#each store.state.vehicles as v (v.vin)}
							<Select.Item value={v.vin}>{v.brand} {v.model} · {v.plate}</Select.Item>
						{/each}
					</Select.Content>
				</Select.Root>
			</div>
			<div>
				<Label>Tipo de servicio</Label>
				<Select.Root type="single" bind:value={nSvc}>
					<Select.Trigger>{nSvc || 'Seleccionar servicio'}</Select.Trigger>
					<Select.Content>
						{#each SERVICE_TYPES as s}<Select.Item value={s}>{s}</Select.Item>{/each}
					</Select.Content>
				</Select.Root>
			</div>
			<div class="grid grid-cols-2 gap-3">
				<div><Label>Fecha</Label><Input type="date" bind:value={nDate} /></div>
				<div>
					<Label>Bahía</Label>
					<Select.Root type="single" bind:value={nBay}>
						<Select.Trigger>Bahía {nBay}</Select.Trigger>
						<Select.Content>
							{#each branchBays as b}<Select.Item value={String(b.id)}>{b.name} · {b.tech}</Select.Item>{/each}
						</Select.Content>
					</Select.Root>
				</div>
			</div>
			<div class="grid grid-cols-3 gap-3">
				<div>
					<Label>Hora</Label>
					<Select.Root type="single" bind:value={nHour}>
						<Select.Trigger>{nHour.padStart(2, '0')}:00</Select.Trigger>
						<Select.Content>
							{#each HOURS.slice(0, 10) as h}<Select.Item value={String(h)}>{String(h).padStart(2, '0')}:00</Select.Item>{/each}
						</Select.Content>
					</Select.Root>
				</div>
				<div>
					<Label>Min</Label>
					<Select.Root type="single" bind:value={nMin}>
						<Select.Trigger>:{nMin.padStart(2, '0')}</Select.Trigger>
						<Select.Content>
							<Select.Item value="0">:00</Select.Item>
							<Select.Item value="30">:30</Select.Item>
						</Select.Content>
					</Select.Root>
				</div>
				<div>
					<Label>Duración</Label>
					<Select.Root type="single" bind:value={nDur}>
						<Select.Trigger>{nDur}h</Select.Trigger>
						<Select.Content>
							{#each ['1', '1.5', '2', '2.5', '3', '4'] as d}<Select.Item value={d}>{d}h</Select.Item>{/each}
						</Select.Content>
					</Select.Root>
				</div>
			</div>
			<div><Label>Notas (opcional)</Label><Textarea bind:value={nNotas} placeholder="Instrucciones o comentarios del cliente…" class="min-h-16" /></div>

			{#if nVin && nSvc}
				<div class={cn('flex items-center gap-2 rounded-md border p-2 text-sm', bayFree ? 'border-emerald-500/40 bg-emerald-50/30' : 'border-destructive/40 bg-destructive/5')}>
					{#if bayFree}
						<CheckCircle class="size-4 text-emerald-500" /><span class="text-emerald-700">Bahía {nBay} disponible en ese horario</span>
					{:else}
						<Clock class="size-4 text-destructive" /><span class="text-destructive">Bahía {nBay} ocupada — elige otro horario o bahía</span>
					{/if}
				</div>
			{/if}
		</div>
		<Dialog.Footer>
			<Button variant="outline" onclick={() => (newOpen = false)}>Cancelar</Button>
			<Button onclick={confirmNew} disabled={!bayFree}><CheckCircle class="mr-2 size-4" />Confirmar Cita</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
