<script lang="ts">
	import { cn } from '$lib/utils.js';
	import { useTallerStore } from '$lib/tps/taller/store.svelte.js';
	import {
		INSPECTION_CATS, INSPECTION_TOTAL, ACCESSORIES, PHOTO_CATS, CAT_TO_PHOTO,
		SERVICE_TYPES, ARMOR_BADGE
	} from '$lib/tps/taller/constants.js';
	import type { Vehicle, Appointment } from '$lib/tps/taller/types.js';
	import type { Component } from 'svelte';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import * as Collapsible from '$lib/components/ui/collapsible/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import { Textarea } from '$lib/components/ui/textarea/index.js';
	import { Progress } from '$lib/components/ui/progress/index.js';
	import { toast } from 'svelte-sonner';
	import Check from '@lucide/svelte/icons/check';
	import X from '@lucide/svelte/icons/x';
	import TriangleAlert from '@lucide/svelte/icons/triangle-alert';
	import Camera from '@lucide/svelte/icons/camera';
	import PenLine from '@lucide/svelte/icons/pen-line';
	import Search from '@lucide/svelte/icons/search';
	import ChevronDown from '@lucide/svelte/icons/chevron-down';
	import ArrowLeft from '@lucide/svelte/icons/arrow-left';
	import ArrowRight from '@lucide/svelte/icons/arrow-right';
	import CircleCheck from '@lucide/svelte/icons/circle-check';
	import Car from '@lucide/svelte/icons/car';
	import PanelTop from '@lucide/svelte/icons/panel-top';
	import Shield from '@lucide/svelte/icons/shield';
	import Armchair from '@lucide/svelte/icons/armchair';
	import Zap from '@lucide/svelte/icons/zap';
	import Wrench from '@lucide/svelte/icons/wrench';
	import Disc3 from '@lucide/svelte/icons/disc-3';
	import CircleDot from '@lucide/svelte/icons/circle-dot';
	import Clock from '@lucide/svelte/icons/clock';
	import FileText from '@lucide/svelte/icons/file-text';
	import Trash2 from '@lucide/svelte/icons/trash-2';

	const store = useTallerStore();
	const DATE = '2026-07-02';

	const CAT_ICONS: Record<string, Component> = {
		car: Car, 'panel-top': PanelTop, shield: Shield, armchair: Armchair,
		zap: Zap, wrench: Wrench, 'disc-3': Disc3, 'circle-dot': CircleDot
	};

	const STEPS = ['Identificación', 'Recepción', `Inspección ${INSPECTION_TOTAL} pts`, 'Evidencia', 'Orden de Servicio'];
	let step = $state(1);

	// --- Estado ---
	let vehicle = $state<Vehicle | null>(null);
	let fromAppt = $state<Appointment | null>(null);
	let vinInput = $state('');

	// Paso 2
	let recFecha = $state(DATE);
	let recHora = $state('09:00');
	let recTech = $state('Ing. Rodrigo Cienfuegos');
	let recService = $state('');
	let recMotivo = $state('');
	let recKm = $state('');
	let accSt = $state<Record<string, boolean>>({});
	let accOtros = $state('');

	// Paso 3 — inspeccion
	type ItemState = 'ok' | 'flag' | 'fail' | null;
	let inspSt = $state<Record<string, ItemState>>({});
	let inspNote = $state<Record<string, string>>({});
	let inspHasPh = $state<Record<string, boolean>>({});
	let openCat = $state<string | null>('ext');

	// Paso 4 — fotos
	type Photo = { id: string; cat: string; label: string; type: 'photo' | 'video' | 'file'; ptId: string | null };
	let photos = $state<Photo[]>([]);
	let photoFilter = $state('Todos');

	// Firma
	let signed = $state(false);

	const techs = store.state.technicians.filter((t) => t.branch === 'MTY');
	const todayAppts = $derived(store.apptsOn('MTY', DATE));

	// --- Navegacion ---
	function goStep(n: number) {
		if (n < 1 || n > 5) return;
		if (n > 1 && !vehicle) { toast.warning('Identifica el vehículo primero'); return; }
		if (n === 3 && step === 2) {
			if (!recKm) { toast.error('Registra el kilometraje'); return; }
			if (!recService) { toast.error('Selecciona el tipo de servicio'); return; }
		}
		step = n;
	}

	// --- Paso 1 ---
	function selectVehicle(v: Vehicle) {
		vehicle = v;
		toast.success(`${v.brand} ${v.model} identificado`);
	}
	function searchVIN() {
		const val = vinInput.trim().toUpperCase();
		if (!val) { toast.error('Ingresa un VIN'); return; }
		const v = store.getVehicle(val);
		if (!v) { toast.error('VIN no encontrado en el catálogo'); return; }
		fromAppt = null;
		selectVehicle(v);
	}
	function selectFromAppt(a: Appointment) {
		const v = store.getVehicle(a.vin);
		if (!v) return;
		fromAppt = a;
		recService = a.svc;
		recTech = a.tech;
		if (a.notas) recMotivo = a.notas;
		selectVehicle(v);
		toast.success(`Cita ${a.id} · iniciando recepción`);
	}

	const kmNote = $derived.by(() => {
		const entered = parseInt(recKm) || 0;
		if (!entered || !vehicle) return null;
		const diff = entered - vehicle.km;
		return diff >= 0
			? { ok: true, text: `+${diff.toLocaleString('es-MX')} km desde el último registro (${vehicle.km.toLocaleString('es-MX')} km)` }
			: { ok: false, text: `Valor menor al último registro (${vehicle.km.toLocaleString('es-MX')} km) — verificar odómetro` };
	});

	// --- Paso 3 progreso ---
	const allPids = INSPECTION_CATS.flatMap((c) => c.pts.map((_, i) => `${c.id}_${i}`));
	const counts = $derived.by(() => {
		let ok = 0, flag = 0, fail = 0;
		for (const p of allPids) {
			const s = inspSt[p];
			if (s === 'ok') ok++; else if (s === 'flag') flag++; else if (s === 'fail') fail++;
		}
		return { ok, flag, fail, done: ok + flag + fail, pend: allPids.length - ok - flag - fail };
	});
	const inspPct = $derived(Math.round((counts.done / allPids.length) * 100));

	function setInsp(pid: string, s: ItemState) {
		inspSt[pid] = inspSt[pid] === s ? null : s;
	}
	function catStat(catId: string, len: number) {
		const pids = Array.from({ length: len }, (_, i) => `${catId}_${i}`);
		const fail = pids.filter((p) => inspSt[p] === 'fail').length;
		const flag = pids.filter((p) => inspSt[p] === 'flag').length;
		const done = pids.filter((p) => inspSt[p]).length;
		return { fail, flag, done, len };
	}
	function markAllOk() {
		for (const c of INSPECTION_CATS) c.pts.forEach((_, i) => { const pid = `${c.id}_${i}`; if (!inspSt[pid]) inspSt[pid] = 'ok'; });
		toast.success('Puntos sin revisar marcados como OK');
	}

	// --- Nota modal ---
	let noteOpen = $state(false);
	let notePid = $state<string | null>(null);
	let notePtName = $state('');
	let noteText = $state('');
	function openNote(pid: string, name: string) { notePid = pid; notePtName = name; noteText = inspNote[pid] ?? ''; noteOpen = true; }
	function saveNote() { if (notePid) inspNote[notePid] = noteText.trim(); noteOpen = false; if (noteText.trim()) toast.success('Nota guardada'); }

	// --- Camara modal ---
	let camOpen = $state(false);
	let camPid = $state<string | null>(null);
	let camCat = $state('General');
	let camLabel = $state('');
	function openCam(pid: string | null, cat: string) {
		camPid = pid; camCat = cat;
		camLabel = pid ? getPtName(pid).substring(0, 50) : '';
		camOpen = true;
	}
	function getPtName(pid: string): string {
		const [cid, pi] = pid.split('_');
		const cat = INSPECTION_CATS.find((c) => c.id === cid);
		return cat ? cat.pts[+pi] ?? '' : '';
	}
	function capture(type: 'photo' | 'video' | 'file') {
		const label = camLabel.trim() || camCat;
		photos = [...photos, { id: 'ph_' + Date.now(), cat: camCat, label, type, ptId: camPid }];
		if (camPid) inspHasPh[camPid] = true;
		camOpen = false;
		toast.success(`Evidencia capturada: ${label.substring(0, 28)}`);
	}
	function delPhoto(id: string) { photos = photos.filter((p) => p.id !== id); }
	const filteredPhotos = $derived(photoFilter === 'Todos' ? photos : photos.filter((p) => p.cat === photoFilter));

	// --- Firma canvas ---
	let canvasEl = $state<HTMLCanvasElement | null>(null);
	let drawing = false;
	$effect(() => {
		if (step !== 5 || !canvasEl) return;
		const cv = canvasEl;
		const ctx = cv.getContext('2d');
		if (!ctx) return;
		const dpr = window.devicePixelRatio || 1;
		cv.width = cv.offsetWidth * dpr;
		cv.height = cv.offsetHeight * dpr;
		ctx.scale(dpr, dpr);
		ctx.strokeStyle = 'currentColor';
		ctx.lineWidth = 2.5;
		ctx.lineCap = 'round';
		ctx.lineJoin = 'round';
		const pos = (e: MouseEvent | TouchEvent) => {
			const r = cv.getBoundingClientRect();
			const s = 'touches' in e ? e.touches[0] : e;
			return { x: s.clientX - r.left, y: s.clientY - r.top };
		};
		const start = (e: MouseEvent | TouchEvent) => { e.preventDefault(); drawing = true; const p = pos(e); ctx.beginPath(); ctx.moveTo(p.x, p.y); };
		const draw = (e: MouseEvent | TouchEvent) => { if (!drawing) return; e.preventDefault(); const p = pos(e); ctx.lineTo(p.x, p.y); ctx.stroke(); signed = true; };
		const end = () => { drawing = false; };
		cv.addEventListener('mousedown', start);
		cv.addEventListener('mousemove', draw);
		cv.addEventListener('mouseup', end);
		cv.addEventListener('mouseleave', end);
		cv.addEventListener('touchstart', start, { passive: false });
		cv.addEventListener('touchmove', draw, { passive: false });
		cv.addEventListener('touchend', end);
		return () => {
			cv.removeEventListener('mousedown', start);
			cv.removeEventListener('mousemove', draw);
			cv.removeEventListener('mouseup', end);
			cv.removeEventListener('mouseleave', end);
			cv.removeEventListener('touchstart', start);
			cv.removeEventListener('touchmove', draw);
			cv.removeEventListener('touchend', end);
		};
	});
	function clearSign() {
		if (!canvasEl) return;
		const ctx = canvasEl.getContext('2d');
		ctx?.clearRect(0, 0, canvasEl.width, canvasEl.height);
		signed = false;
	}

	// --- Distribucion / confirmar ---
	let distEmail = $state(true), distWhats = $state(true), distPrint = $state(true), distErp = $state(true);
	const osNum = 'OS-2026-' + String(Math.floor(Math.random() * 90000) + 10000);
	const accList = $derived(Object.keys(accSt).filter((a) => accSt[a]));
	const obsList = $derived(
		INSPECTION_CATS.flatMap((c) => c.pts.map((pt, i) => ({ pid: `${c.id}_${i}`, pt })))
			.filter(({ pid }) => inspSt[pid] === 'flag' || inspSt[pid] === 'fail')
	);

	function confirmOS() {
		if (!vehicle) { toast.error('Identifica el vehículo primero'); return; }
		if (!signed) { toast.warning('Se requiere la firma del cliente'); return; }
		if (!distEmail && !distWhats && !distPrint && !distErp) { toast.warning('Selecciona al menos un canal'); return; }
		toast.success(`${osNum} generada correctamente`);
		const acc: string[] = [];
		if (distEmail) acc.push(`Correo enviado a ${vehicle.email}`);
		if (distWhats) acc.push('Resumen enviado por WhatsApp');
		if (distPrint) acc.push('OS enviada a impresora del taller');
		if (distErp) acc.push('Sincronizado con ERP — doble captura eliminada');
		acc.forEach((m, i) => setTimeout(() => toast.info(m), 700 * (i + 1)));
		setTimeout(reset, 700 * (acc.length + 2));
	}
	function reset() {
		vehicle = null; fromAppt = null; vinInput = '';
		recService = ''; recMotivo = ''; recKm = ''; accSt = {}; accOtros = '';
		inspSt = {}; inspNote = {}; inspHasPh = {}; photos = []; signed = false;
		step = 1;
		toast.success('Listo para recibir el siguiente vehículo');
	}

	function toggleAcc(a: string) { accSt[a] = !accSt[a]; }
</script>

<div class="flex flex-col gap-5">
	<!-- Header -->
	<div class="flex flex-wrap items-center justify-between gap-3">
		<div>
			<h2 class="text-xl font-semibold">Recepción de Vehículo</h2>
			<p class="text-muted-foreground text-sm">Apertura de Orden de Servicio · Optimizado para tablet · Elimina doble captura</p>
		</div>
		<div class="flex items-center gap-2">
			<Badge variant="outline" class="font-mono">GAP-TLL-002</Badge>
			<Button variant="outline" size="sm" href="/taller/historial"><Search class="mr-2 size-4" />Historial por VIN</Button>
		</div>
	</div>

	<!-- Step tracker -->
	<div class="flex items-center">
		{#each STEPS as label, i}
			{@const n = i + 1}
			<button class="flex flex-1 flex-col items-center gap-1" onclick={() => goStep(n)}>
				<div class="flex w-full items-center">
					<div class={cn('h-0.5 flex-1', i === 0 ? 'opacity-0' : n <= step ? 'bg-primary' : 'bg-border')}></div>
					<div class={cn('flex size-8 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold transition',
						n < step ? 'border-emerald-500 bg-emerald-500/15 text-emerald-600' : n === step ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground')}>
						{#if n < step}<Check class="size-4" />{:else}{n}{/if}
					</div>
					<div class={cn('h-0.5 flex-1', i === STEPS.length - 1 ? 'opacity-0' : n < step ? 'bg-primary' : 'bg-border')}></div>
				</div>
				<span class={cn('text-center text-[10px] font-semibold uppercase tracking-wide', n === step ? 'text-primary' : n < step ? 'text-emerald-600' : 'text-muted-foreground')}>{label}</span>
			</button>
		{/each}
	</div>

	<!-- ═══ PASO 1 ═══ -->
	{#if step === 1}
		<Card.Root>
			<Card.Header><Card.Title class="text-sm">Citas Programadas para Hoy</Card.Title><Card.Description>{todayAppts.length} citas · {DATE}</Card.Description></Card.Header>
			<Card.Content class="space-y-2">
				{#each todayAppts as a (a.id)}
					{@const v = store.getVehicle(a.vin)}
					<div class={cn('flex flex-wrap items-center gap-3 rounded-md border p-3', fromAppt?.id === a.id && 'border-primary bg-primary/5')}>
						<span class="text-lg font-bold tabular-nums text-primary w-14 text-center">{String(a.sh).padStart(2, '0')}:{String(a.sm).padStart(2, '0')}</span>
						<div class="min-w-40 flex-1">
							<p class="text-sm font-semibold">{v ? `${v.brand} ${v.model}` : a.vin} {#if v}<Badge variant="outline" class={cn('ml-1', ARMOR_BADGE[v.level])}>{v.level}</Badge>{/if}</p>
							<p class="text-muted-foreground text-xs">{v?.client}</p>
							<p class="text-muted-foreground text-xs">{a.svc} · Bahía {a.bay} · {a.tech}</p>
						</div>
						<Button size="sm" disabled={fromAppt?.id === a.id} onclick={() => selectFromAppt(a)}>
							{fromAppt?.id === a.id ? 'En recepción' : 'Iniciar Recepción'}
						</Button>
					</div>
				{/each}
			</Card.Content>
		</Card.Root>

		<Card.Root>
			<Card.Header><Card.Title class="text-sm">Recepción sin Cita (Walk-in)</Card.Title></Card.Header>
			<Card.Content class="space-y-3">
				<div>
					<Label>VIN del Vehículo</Label>
					<div class="flex gap-2">
						<Input bind:value={vinInput} placeholder="Ej. WDD2221561A123401" class="font-mono uppercase" oninput={(e) => (vinInput = e.currentTarget.value.toUpperCase())} onkeydown={(e) => e.key === 'Enter' && searchVIN()} />
						<Button onclick={searchVIN}><Search class="mr-2 size-4" />Buscar</Button>
					</div>
				</div>
				<div>
					<Label class="text-muted-foreground text-xs">— o selecciona del catálogo —</Label>
					<Select.Root type="single" value={vehicle?.vin ?? ''} onValueChange={(vin) => { const v = store.getVehicle(vin); if (v) { fromAppt = null; selectVehicle(v); } }}>
						<Select.Trigger>Catálogo de Unidades Blindadas</Select.Trigger>
						<Select.Content>
							{#each store.state.vehicles as v (v.vin)}
								<Select.Item value={v.vin}>{v.brand} {v.model} · {v.plate} · {v.level}</Select.Item>
							{/each}
						</Select.Content>
					</Select.Root>
				</div>
			</Card.Content>
		</Card.Root>

		{#if vehicle}
			<Card.Root class="border-primary/50">
				<Card.Content class="pt-4">
					<div class="flex items-start justify-between">
						<div>
							<p class="text-lg font-bold">{vehicle.brand} {vehicle.model} {vehicle.year}</p>
							<p class="text-muted-foreground text-sm">{vehicle.client}</p>
						</div>
						<Badge variant="outline" class={ARMOR_BADGE[vehicle.level]}>{vehicle.level}</Badge>
					</div>
					<div class="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
						<div><p class="text-muted-foreground text-[10px] uppercase">VIN</p><p class="font-mono text-xs">{vehicle.vin}</p></div>
						<div><p class="text-muted-foreground text-[10px] uppercase">Matrícula</p><p class="text-sm font-medium">{vehicle.plate}</p></div>
						<div><p class="text-muted-foreground text-[10px] uppercase">Color</p><p class="text-sm font-medium">{vehicle.color}</p></div>
						<div><p class="text-muted-foreground text-[10px] uppercase">Km registrados</p><p class="text-sm font-medium">{vehicle.km.toLocaleString('es-MX')} km</p></div>
					</div>
					{#if fromAppt}
						<div class="mt-3 rounded-md bg-primary/10 p-2 text-xs text-primary">Cita {fromAppt.id} · {String(fromAppt.sh).padStart(2, '0')}:{String(fromAppt.sm).padStart(2, '0')} · Bahía {fromAppt.bay} — datos pre-llenados</div>
					{/if}
					<div class="mt-3 flex justify-end">
						<Button variant="link" href="/taller/historial" class="text-xs">Ver historial completo →</Button>
					</div>
				</Card.Content>
			</Card.Root>
		{/if}

	<!-- ═══ PASO 2 ═══ -->
	{:else if step === 2}
		<Card.Root>
			<Card.Header><Card.Title class="text-sm">Datos Generales de Recepción</Card.Title></Card.Header>
			<Card.Content class="grid gap-3 sm:grid-cols-2">
				<div><Label>Fecha de recepción</Label><Input type="date" bind:value={recFecha} /></div>
				<div><Label>Hora de entrada</Label><Input type="time" bind:value={recHora} /></div>
				<div>
					<Label>Técnico receptor</Label>
					<Select.Root type="single" bind:value={recTech}>
						<Select.Trigger>{recTech}</Select.Trigger>
						<Select.Content>{#each techs as t}<Select.Item value={t.name}>{t.name} — {t.spec}</Select.Item>{/each}</Select.Content>
					</Select.Root>
				</div>
				<div>
					<Label>Tipo de servicio solicitado</Label>
					<Select.Root type="single" bind:value={recService}>
						<Select.Trigger>{recService || 'Seleccionar servicio'}</Select.Trigger>
						<Select.Content>{#each SERVICE_TYPES as s}<Select.Item value={s}>{s}</Select.Item>{/each}</Select.Content>
					</Select.Root>
				</div>
				<div class="sm:col-span-2"><Label>Motivo / queja del cliente</Label><Textarea bind:value={recMotivo} placeholder="Describe el motivo de ingreso, quejas o solicitudes…" class="min-h-20" /></div>
			</Card.Content>
		</Card.Root>

		<Card.Root>
			<Card.Header><Card.Title class="text-sm">Kilometraje al Momento de Recepción</Card.Title></Card.Header>
			<Card.Content class="mx-auto max-w-xs text-center">
				<Input type="number" bind:value={recKm} placeholder="00000" class="text-center text-2xl font-bold tabular-nums" />
				{#if kmNote}
					<p class={cn('mt-2 text-xs', kmNote.ok ? 'text-emerald-600' : 'text-yellow-600')}>{kmNote.text}</p>
				{/if}
			</Card.Content>
		</Card.Root>

		<Card.Root>
			<Card.Header><Card.Title class="text-sm">Accesorios y Pertenencias Entregadas</Card.Title></Card.Header>
			<Card.Content>
				<div class="grid gap-2 sm:grid-cols-3">
					{#each ACCESSORIES as a}
						<button onclick={() => toggleAcc(a)} class={cn('flex items-center gap-2 rounded-md border p-2 text-left text-sm transition', accSt[a] ? 'border-primary bg-primary/5' : 'hover:bg-muted')}>
							<span class={cn('flex size-5 shrink-0 items-center justify-center rounded border-2', accSt[a] ? 'border-primary bg-primary text-primary-foreground' : 'border-muted-foreground/40')}>{#if accSt[a]}<Check class="size-3" />{/if}</span>
							<span class={accSt[a] ? 'font-medium' : 'text-muted-foreground'}>{a}</span>
						</button>
					{/each}
				</div>
				<div class="mt-3"><Label>Otros (especificar)</Label><Input bind:value={accOtros} placeholder="Ej. Extintor, gato hidráulico, herramienta adicional…" /></div>
			</Card.Content>
		</Card.Root>

	<!-- ═══ PASO 3 ═══ -->
	{:else if step === 3}
		<Card.Root>
			<Card.Content class="pt-4">
				<div class="flex flex-wrap items-center justify-between gap-3">
					<div>
						<p class="text-muted-foreground text-xs uppercase">Progreso de inspección</p>
						<p class="text-sm font-medium">{counts.done} de {allPids.length} puntos inspeccionados</p>
					</div>
					<div class="flex items-center gap-3">
						<span class="text-2xl font-bold text-primary tabular-nums">{inspPct}%</span>
						<Button variant="outline" size="sm" onclick={markAllOk}><Check class="mr-2 size-4 text-emerald-500" />Marcar todo OK</Button>
					</div>
				</div>
				<Progress value={inspPct} class="mt-3" />
				<div class="mt-2 flex gap-4 text-xs">
					<span class="text-emerald-600">✔ {counts.ok} OK</span>
					<span class="text-yellow-600">⚠ {counts.flag} Observación</span>
					<span class="text-destructive">✖ {counts.fail} Falla</span>
					<span class="text-muted-foreground">· {counts.pend} Pendientes</span>
				</div>
			</Card.Content>
		</Card.Root>

		{#each INSPECTION_CATS as cat, ci}
			{@const st = catStat(cat.id, cat.pts.length)}
			{@const Icon = CAT_ICONS[cat.icon]}
			{@const base = INSPECTION_CATS.slice(0, ci).reduce((n, c) => n + c.pts.length, 0)}
			<Collapsible.Root open={openCat === cat.id} onOpenChange={(o) => (openCat = o ? cat.id : null)}>
				<Card.Root>
					<Collapsible.Trigger class="w-full">
						<Card.Header class="flex-row items-center gap-3 py-3">
							<Icon class="size-5 shrink-0" />
							<div class="flex-1 text-left">
								<Card.Title class="text-sm">{cat.name}</Card.Title>
								<Card.Description class="text-xs">{cat.pts.length} puntos</Card.Description>
							</div>
							{#if st.fail > 0}<Badge variant="destructive">{st.fail} falla{st.fail !== 1 ? 's' : ''}</Badge>
							{:else if st.flag > 0}<Badge variant="outline" class="border-yellow-400 text-yellow-700">{st.flag} obs.</Badge>
							{:else if st.done === st.len}<Badge variant="secondary" class="text-emerald-600">Completo</Badge>
							{:else}<Badge variant="outline">{st.done}/{st.len}</Badge>{/if}
							<ChevronDown class="text-muted-foreground size-4 transition-transform {openCat === cat.id ? 'rotate-180' : ''}" />
						</Card.Header>
					</Collapsible.Trigger>
					<Collapsible.Content>
						<Card.Content class="pt-0">
							{#each cat.pts as pt, pi}
								{@const pid = `${cat.id}_${pi}`}
								{@const s = inspSt[pid]}
								<div class={cn('flex items-center gap-2 border-t py-2', s === 'flag' && 'bg-yellow-50/40', s === 'fail' && 'bg-destructive/5')}>
									<span class="text-muted-foreground w-8 shrink-0 text-right text-xs tabular-nums">{base + pi + 1}</span>
									<span class="flex-1 text-sm">{pt}</span>
									<div class="flex gap-1">
										<Button size="icon" class="size-8" variant={s === 'ok' ? 'default' : 'outline'} onclick={() => setInsp(pid, 'ok')}><Check class="size-3" /></Button>
										<Button size="icon" class="size-8" variant={s === 'flag' ? 'default' : 'outline'} onclick={() => setInsp(pid, 'flag')}><TriangleAlert class="size-3" /></Button>
										<Button size="icon" class="size-8" variant={s === 'fail' ? 'destructive' : 'outline'} onclick={() => setInsp(pid, 'fail')}><X class="size-3" /></Button>
										<Button size="icon" class={cn('size-8', inspHasPh[pid] && 'border-blue-500 text-blue-500')} variant="outline" onclick={() => openCam(pid, CAT_TO_PHOTO[cat.id])}><Camera class="size-3" /></Button>
										<Button size="icon" class={cn('size-8', inspNote[pid] && 'border-indigo-500 text-indigo-500')} variant="outline" onclick={() => openNote(pid, pt)}><FileText class="size-3" /></Button>
									</div>
								</div>
								{#if inspNote[pid]}
									<p class="text-muted-foreground border-t px-10 py-1 text-xs italic">{inspNote[pid]}</p>
								{/if}
							{/each}
						</Card.Content>
					</Collapsible.Content>
				</Card.Root>
			</Collapsible.Root>
		{/each}

	<!-- ═══ PASO 4 ═══ -->
	{:else if step === 4}
		<Card.Root>
			<Card.Header><Card.Title class="text-sm">Evidencia Fotográfica y de Video</Card.Title><Card.Description>Cada archivo se vincula al VIN y a la Orden de Servicio</Card.Description></Card.Header>
			<Card.Content>
				<div class="flex flex-wrap gap-2">
					{#each PHOTO_CATS as c}
						<Button variant={photoFilter === c ? 'default' : 'outline'} size="sm" onclick={() => (photoFilter = c)}>{c}</Button>
					{/each}
				</div>
			</Card.Content>
		</Card.Root>
		<Card.Root>
			<Card.Content class="pt-4">
				<button class="hover:border-primary hover:bg-primary/5 flex w-full flex-col items-center gap-2 rounded-lg border-2 border-dashed py-8 transition" onclick={() => openCam(null, photoFilter === 'Todos' ? 'General' : photoFilter)}>
					<Camera class="text-muted-foreground size-8" />
					<span class="text-sm font-semibold">Tomar Foto / Grabar Video</span>
					<span class="text-muted-foreground text-xs">Captura desde la cámara de la tablet o galería</span>
				</button>
				{#if filteredPhotos.length}
					<div class="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
						{#each filteredPhotos as p (p.id)}
							<div class="group relative overflow-hidden rounded-lg border">
								<div class="bg-muted flex aspect-4/3 items-center justify-center text-3xl">{p.type === 'video' ? '🎥' : p.type === 'file' ? '🖼' : '📷'}</div>
								<div class="bg-background/90 absolute bottom-0 left-0 right-0 p-1.5">
									<p class="truncate text-[10px] font-medium">{p.label}</p>
									<p class="text-muted-foreground text-[9px]">{p.cat}</p>
								</div>
								<button class="bg-background/80 text-destructive absolute right-1 top-1 flex size-6 items-center justify-center rounded opacity-0 transition group-hover:opacity-100" onclick={() => delPhoto(p.id)}><Trash2 class="size-3" /></button>
							</div>
						{/each}
					</div>
				{:else}
					<p class="text-muted-foreground mt-4 text-center text-sm">Sin evidencia en esta categoría. Toca arriba para agregar.</p>
				{/if}
			</Card.Content>
		</Card.Root>

	<!-- ═══ PASO 5 ═══ -->
	{:else if step === 5}
		{#if vehicle}
			<Card.Root class="border-primary/40">
				<Card.Header class="flex-row items-center justify-between">
					<div>
						<Card.Title class="font-mono text-primary text-sm">{osNum}</Card.Title>
						<Card.Description>{new Date().toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</Card.Description>
					</div>
					<Badge variant="outline" class="border-yellow-400 text-yellow-700"><Clock class="mr-1 size-3" />En proceso</Badge>
				</Card.Header>
				<Card.Content class="space-y-4">
					<div>
						<p class="text-muted-foreground mb-1 text-[10px] font-semibold uppercase">Vehículo</p>
						<div class="grid grid-cols-2 gap-2 text-sm sm:grid-cols-3">
							<div><span class="text-muted-foreground block text-xs">Modelo</span>{vehicle.brand} {vehicle.model}</div>
							<div><span class="text-muted-foreground block text-xs">Año / Color</span>{vehicle.year} · {vehicle.color}</div>
							<div><span class="text-muted-foreground block text-xs">Nivel</span><Badge variant="outline" class={ARMOR_BADGE[vehicle.level]}>{vehicle.level}</Badge></div>
							<div><span class="text-muted-foreground block text-xs">VIN</span><span class="font-mono text-xs">{vehicle.vin}</span></div>
							<div><span class="text-muted-foreground block text-xs">Matrícula</span>{vehicle.plate}</div>
							<div><span class="text-muted-foreground block text-xs">Km ingreso</span>{recKm ? parseInt(recKm).toLocaleString('es-MX') + ' km' : '—'}</div>
						</div>
					</div>
					<div class="border-t pt-3">
						<p class="text-muted-foreground mb-1 text-[10px] font-semibold uppercase">Recepción</p>
						<div class="grid grid-cols-2 gap-2 text-sm sm:grid-cols-3">
							<div><span class="text-muted-foreground block text-xs">Cliente</span>{vehicle.client}</div>
							<div><span class="text-muted-foreground block text-xs">Fecha / hora</span>{recFecha} {recHora}</div>
							<div><span class="text-muted-foreground block text-xs">Técnico</span>{recTech}</div>
							<div class="sm:col-span-3"><span class="text-muted-foreground block text-xs">Servicio</span>{recService || 'No especificado'}</div>
						</div>
						{#if recMotivo}<p class="text-muted-foreground mt-2 text-sm"><span class="text-xs">Motivo: </span>{recMotivo}</p>{/if}
					</div>
					<div class="border-t pt-3">
						<p class="text-muted-foreground mb-2 text-[10px] font-semibold uppercase">Resumen Inspección — {INSPECTION_TOTAL} puntos</p>
						<div class="flex flex-wrap gap-2">
							<Badge variant="secondary" class="text-emerald-600">✔ {counts.ok} OK</Badge>
							<Badge variant="outline" class="border-yellow-400 text-yellow-700">⚠ {counts.flag} Observación</Badge>
							<Badge variant="outline" class="border-destructive/40 text-destructive">✖ {counts.fail} Falla</Badge>
							{#if counts.pend}<Badge variant="outline">· {counts.pend} sin inspeccionar</Badge>{/if}
						</div>
						{#if obsList.length}
							<div class="mt-2 space-y-1">
								{#each obsList.slice(0, 10) as { pid, pt }}
									<div class="flex items-start gap-2 rounded bg-muted/50 px-2 py-1 text-xs">
										<span class={cn('mt-1 size-1.5 shrink-0 rounded-full', inspSt[pid] === 'fail' ? 'bg-destructive' : 'bg-yellow-500')}></span>
										<span>{pt}{#if inspNote[pid]}<span class="text-muted-foreground"> — {inspNote[pid]}</span>{/if}{#if inspHasPh[pid]}<span class="text-blue-500"> 📷</span>{/if}</span>
									</div>
								{/each}
							</div>
						{/if}
					</div>
					<div class="border-t pt-3">
						<p class="text-muted-foreground mb-2 text-[10px] font-semibold uppercase">Accesorios ({accList.length}{accOtros ? '+' : ''})</p>
						{#if accList.length || accOtros}
							<div class="flex flex-wrap gap-1">
								{#each accList as a}<Badge variant="outline" class="text-xs">{a}</Badge>{/each}
								{#if accOtros}<Badge variant="outline" class="text-xs">{accOtros}</Badge>{/if}
							</div>
						{:else}<p class="text-muted-foreground text-sm">Ninguno registrado</p>{/if}
					</div>
					<div class="border-t pt-3">
						<p class="text-muted-foreground mb-1 text-[10px] font-semibold uppercase">Expediente digital</p>
						<p class="text-sm font-medium">{photos.length} archivo{photos.length !== 1 ? 's' : ''} vinculado{photos.length !== 1 ? 's' : ''} al VIN y la OS</p>
					</div>
				</Card.Content>
			</Card.Root>

			<Card.Root>
				<Card.Header><Card.Title class="text-sm">Firma de Conformidad del Cliente</Card.Title></Card.Header>
				<Card.Content>
					<div class="relative">
						<canvas bind:this={canvasEl} class="text-primary h-40 w-full rounded-md border-2 border-dashed" style="touch-action:none"></canvas>
						{#if !signed}
							<div class="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-muted-foreground">
								<PenLine class="mb-1 size-6" />
								<span class="text-sm font-medium">Firma aquí con el dedo o lápiz</span>
								<span class="text-xs">El cliente acepta el estado documentado</span>
							</div>
						{/if}
					</div>
					<div class="mt-2 flex items-center justify-between">
						<span class={cn('text-xs', signed ? 'text-emerald-600' : 'text-muted-foreground')}>{signed ? '✔ Firma registrada' : 'Sin firma'}</span>
						<Button variant="outline" size="sm" onclick={clearSign}><Trash2 class="mr-2 size-3" />Limpiar</Button>
					</div>
				</Card.Content>
			</Card.Root>

			<Card.Root>
				<Card.Header><Card.Title class="text-sm">Distribución de la Orden de Servicio</Card.Title></Card.Header>
				<Card.Content class="space-y-2">
					<label class="flex items-center gap-2 rounded-md border p-2 text-sm"><input type="checkbox" bind:checked={distEmail} class="accent-primary" />📧 Enviar copia al cliente por correo</label>
					<label class="flex items-center gap-2 rounded-md border p-2 text-sm"><input type="checkbox" bind:checked={distWhats} class="accent-primary" />💬 Enviar resumen por WhatsApp</label>
					<label class="flex items-center gap-2 rounded-md border p-2 text-sm"><input type="checkbox" bind:checked={distPrint} class="accent-primary" />🖨 Imprimir OS física en el taller</label>
					<label class="flex items-center gap-2 rounded-md border p-2 text-sm"><input type="checkbox" bind:checked={distErp} class="accent-primary" />🔗 Sincronizar con ERP — elimina doble captura</label>
				</Card.Content>
			</Card.Root>
		{/if}
	{/if}

	<!-- Bottom bar -->
	<div class="bg-background sticky bottom-0 flex items-center justify-between border-t py-3">
		<span class="text-muted-foreground text-sm">Paso {step} de 5 — {STEPS[step - 1]}</span>
		<div class="flex gap-2">
			{#if step > 1}<Button variant="outline" onclick={() => goStep(step - 1)}><ArrowLeft class="mr-2 size-4" />Anterior</Button>{/if}
			{#if step < 5}
				<Button onclick={() => goStep(step + 1)} disabled={!vehicle}>Siguiente <ArrowRight class="ml-2 size-4" /></Button>
			{:else}
				<Button onclick={confirmOS}><CircleCheck class="mr-2 size-4" />Confirmar y Generar OS</Button>
			{/if}
		</div>
	</div>
</div>

<!-- Modal nota -->
<Dialog.Root bind:open={noteOpen}>
	<Dialog.Content class="max-w-md">
		<Dialog.Header><Dialog.Title>Observación del Punto</Dialog.Title><Dialog.Description>{notePtName}</Dialog.Description></Dialog.Header>
		<Textarea bind:value={noteText} placeholder="Describe la observación o falla encontrada…" class="min-h-24" />
		<Button variant="outline" class="w-full" onclick={() => { noteOpen = false; openCam(notePid, 'Inspección'); }}><Camera class="mr-2 size-4" />Vincular foto a este punto</Button>
		<Dialog.Footer>
			<Button variant="outline" onclick={() => (noteOpen = false)}>Cancelar</Button>
			<Button onclick={saveNote}>Guardar Nota</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>

<!-- Modal camara -->
<Dialog.Root bind:open={camOpen}>
	<Dialog.Content class="max-w-md">
		<Dialog.Header><Dialog.Title>Captura de Evidencia</Dialog.Title><Dialog.Description>{camPid ? getPtName(camPid) : 'Evidencia general del vehículo'}</Dialog.Description></Dialog.Header>
		<div class="bg-muted flex aspect-video items-center justify-center rounded-lg border">
			<div class="text-center">
				<Camera class="text-muted-foreground mx-auto size-10" />
				<p class="text-muted-foreground mt-2 text-xs">Vista previa de cámara (tablet)</p>
				{#if vehicle}<p class="text-muted-foreground font-mono text-[10px]">{vehicle.brand} {vehicle.model} · {vehicle.vin}</p>{/if}
			</div>
		</div>
		<div><Label>Etiqueta / descripción</Label><Input bind:value={camLabel} placeholder="Ej. Rayón puerta trasera izquierda…" /></div>
		<Dialog.Footer class="flex-wrap gap-2">
			<Button variant="outline" onclick={() => capture('photo')}>📷 Foto</Button>
			<Button variant="outline" onclick={() => capture('video')}>🎥 Video</Button>
			<Button variant="outline" onclick={() => capture('file')}>📁 Galería</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
