<script lang="ts">
	import { cn } from '$lib/utils.js';
	import { useTallerStore } from '$lib/tps/taller/store.svelte.js';
	import { ALERT_URGENCY, ARMOR_BADGE, SERVICE_TYPES } from '$lib/tps/taller/constants.js';
	import type { AlertUrgency, MaintenanceAlert } from '$lib/tps/taller/types.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Progress } from '$lib/components/ui/progress/index.js';
	import { Textarea } from '$lib/components/ui/textarea/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import { toast } from 'svelte-sonner';
	import TriangleAlert from '@lucide/svelte/icons/triangle-alert';
	import Gauge from '@lucide/svelte/icons/gauge';
	import Send from '@lucide/svelte/icons/send';
	import CalendarPlus from '@lucide/svelte/icons/calendar-plus';
	import Mail from '@lucide/svelte/icons/mail';
	import MessageCircle from '@lucide/svelte/icons/message-circle';

	const store = useTallerStore();

	let filtro = $state<AlertUrgency | 'todos'>('todos');
	const filtros: (AlertUrgency | 'todos')[] = ['todos', 'critico', 'alto', 'normal'];
	const filtroLabel: Record<string, string> = { todos: 'Todos', critico: 'Crítico', alto: 'Alto', normal: 'Normal' };

	const alertas = $derived(
		filtro === 'todos' ? store.state.alerts : store.state.alerts.filter((a) => a.urgency === filtro)
	);

	const counts = $derived({
		critico: store.state.alerts.filter((a) => a.urgency === 'critico').length,
		alto: store.state.alerts.filter((a) => a.urgency === 'alto').length,
		normal: store.state.alerts.filter((a) => a.urgency === 'normal').length
	});

	// Recordatorio
	let recOpen = $state(false);
	let recAlert = $state<MaintenanceAlert | null>(null);
	let recMsg = $state('');
	let recEmail = $state(true);
	let recWhats = $state(true);

	function openRec(a: MaintenanceAlert) {
		recAlert = a;
		const v = store.getVehicle(a.vin);
		recMsg = `Estimado cliente, su vehículo ${v?.brand ?? ''} ${v?.model ?? ''} (${v?.plate ?? ''}) requiere: ${a.svc}. Le invitamos a agendar su cita de servicio. Blindados Premium.`;
		recOpen = true;
	}

	function enviarRec() {
		const canales = [recEmail && 'correo', recWhats && 'WhatsApp'].filter(Boolean).join(' y ');
		toast.success('Recordatorio enviado', { description: `Invitación proactiva enviada por ${canales}` });
		recOpen = false;
	}

	function pct(a: MaintenanceAlert): number {
		return Math.min(Math.round((a.kmCur / a.kmThr) * 100), 130);
	}
</script>

<div class="flex flex-col gap-5">
	<div class="flex flex-wrap items-center justify-between gap-3">
		<div>
			<h2 class="text-xl font-semibold">Alertas de Mantenimiento Preventivo</h2>
			<p class="text-muted-foreground text-sm">Basadas en kilometraje registrado · Invitaciones proactivas al cliente</p>
		</div>
		<Badge variant="outline" class="font-mono">GAP-TLL-001</Badge>
	</div>

	<!-- Resumen por urgencia -->
	<div class="grid gap-4 sm:grid-cols-3">
		<Card.Root class="border-destructive/40"><Card.Header class="pb-2"><Card.Description class="flex items-center gap-1"><span class="size-2 rounded-full bg-destructive"></span>Crítico</Card.Description><Card.Title class="text-2xl tabular-nums text-destructive">{counts.critico}</Card.Title></Card.Header><Card.Content><p class="text-muted-foreground text-xs">Supera umbral de km</p></Card.Content></Card.Root>
		<Card.Root class="border-yellow-500/40"><Card.Header class="pb-2"><Card.Description class="flex items-center gap-1"><span class="size-2 rounded-full bg-amber-500"></span>Alto</Card.Description><Card.Title class="text-2xl tabular-nums text-yellow-600">{counts.alto}</Card.Title></Card.Header><Card.Content><p class="text-muted-foreground text-xs">Próximo al umbral</p></Card.Content></Card.Root>
		<Card.Root class="border-emerald-500/40"><Card.Header class="pb-2"><Card.Description class="flex items-center gap-1"><span class="size-2 rounded-full bg-emerald-500"></span>Normal</Card.Description><Card.Title class="text-2xl tabular-nums text-emerald-600">{counts.normal}</Card.Title></Card.Header><Card.Content><p class="text-muted-foreground text-xs">Dentro de rango</p></Card.Content></Card.Root>
	</div>

	<!-- Filtros -->
	<div class="flex flex-wrap gap-2">
		{#each filtros as f}
			<Button variant={filtro === f ? 'default' : 'outline'} size="sm" onclick={() => (filtro = f)}>{filtroLabel[f]}</Button>
		{/each}
	</div>

	<!-- Lista de alertas -->
	<div class="grid gap-3">
		{#each alertas as a (a.id)}
			{@const v = store.getVehicle(a.vin)}
			{@const u = ALERT_URGENCY[a.urgency]}
			{@const p = pct(a)}
			<Card.Root class={cn('border-l-4', a.urgency === 'critico' ? 'border-l-destructive' : a.urgency === 'alto' ? 'border-l-amber-500' : 'border-l-emerald-500')}>
				<Card.Content class="flex flex-wrap items-center gap-4 pt-4">
					<div class="min-w-48 flex-1">
						<div class="flex items-center gap-2">
							{#if v}<Badge variant="outline" class={ARMOR_BADGE[v.level]}>{v.level}</Badge>{/if}
							<span class="font-semibold">{v ? `${v.brand} ${v.model}` : a.vin}</span>
							<Badge variant={u.variant}>{u.label}</Badge>
						</div>
						<p class="text-muted-foreground text-xs mt-0.5">{v?.client} · {v?.plate} · {a.branch}</p>
						<p class="text-sm mt-1">{a.svc}</p>
					</div>
					<div class="w-48">
						<div class="flex items-center justify-between text-xs mb-1">
							<span class="text-muted-foreground flex items-center gap-1"><Gauge class="size-3" />{a.kmCur.toLocaleString('es-MX')} km</span>
							<span class="tabular-nums">umbral {a.kmThr.toLocaleString('es-MX')}</span>
						</div>
						<div class="h-2 w-full overflow-hidden rounded-full bg-muted">
							<div class={cn('h-full rounded-full', a.kmCur >= a.kmThr ? 'bg-destructive' : p >= 90 ? 'bg-amber-400' : 'bg-emerald-500')} style="width:{Math.min(p, 100)}%"></div>
						</div>
						<p class={cn('mt-1 text-xs', a.kmCur >= a.kmThr ? 'text-destructive' : 'text-muted-foreground')}>
							{a.kmCur >= a.kmThr ? `+${(a.kmCur - a.kmThr).toLocaleString('es-MX')} km sobre umbral` : `Faltan ${(a.kmThr - a.kmCur).toLocaleString('es-MX')} km`}
						</p>
					</div>
					<div class="flex gap-2">
						<Button variant="outline" size="sm" onclick={() => openRec(a)}><Send class="mr-1 size-3" />Recordatorio</Button>
						<Button size="sm" href="/taller/agenda"><CalendarPlus class="mr-1 size-3" />Agendar</Button>
					</div>
				</Card.Content>
			</Card.Root>
		{/each}
	</div>
</div>

<!-- Modal recordatorio -->
<Dialog.Root bind:open={recOpen}>
	<Dialog.Content class="max-w-lg">
		{#if recAlert}
			{@const v = store.getVehicle(recAlert.vin)}
			<Dialog.Header>
				<Dialog.Title>Enviar Recordatorio de Servicio</Dialog.Title>
				<Dialog.Description>{v ? `${v.brand} ${v.model} · ${v.plate}` : recAlert.vin}</Dialog.Description>
			</Dialog.Header>
			<div class="space-y-3">
				<div><Label>Mensaje</Label><Textarea bind:value={recMsg} class="min-h-28" /></div>
				<div class="flex gap-4">
					<label class="flex items-center gap-2 text-sm"><input type="checkbox" bind:checked={recEmail} class="accent-primary" /><Mail class="size-4" />Correo{#if v} <span class="text-muted-foreground text-xs">({v.email})</span>{/if}</label>
					<label class="flex items-center gap-2 text-sm"><input type="checkbox" bind:checked={recWhats} class="accent-primary" /><MessageCircle class="size-4" />WhatsApp</label>
				</div>
			</div>
			<Dialog.Footer>
				<Button variant="outline" onclick={() => (recOpen = false)}>Cancelar</Button>
				<Button onclick={enviarRec} disabled={!recEmail && !recWhats}><Send class="mr-2 size-4" />Enviar Ahora</Button>
			</Dialog.Footer>
		{/if}
	</Dialog.Content>
</Dialog.Root>
