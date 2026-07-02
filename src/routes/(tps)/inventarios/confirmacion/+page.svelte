<script lang="ts">
	import { useInventariosStore } from '$lib/tps/inventarios/store.svelte.js';
	import { celdaIcon, pad } from '$lib/tps/inventarios/constants.js';
	import StatusBadge from '$lib/tps/components/status-badge.svelte';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import * as Item from '$lib/components/ui/item/index.js';
	import * as Empty from '$lib/components/ui/empty/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Progress } from '$lib/components/ui/progress/index.js';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import { toast } from 'svelte-sonner';
	import QrCode from '@lucide/svelte/icons/qr-code';
	import Check from '@lucide/svelte/icons/check';
	import CircleCheckBig from '@lucide/svelte/icons/circle-check-big';
	import ScanLine from '@lucide/svelte/icons/scan-line';
	import Clock from '@lucide/svelte/icons/clock';

	const store = useInventariosStore();
	const data = $derived(store.state);

	let folioId = $state<string>(store.state.folios[1]?.id ?? store.state.folios[0]?.id ?? '');
	const folio = $derived(folioId ? store.getFolio(folioId) : undefined);
	const folioLabel = $derived(folio ? `${folio.id} · ${folio.unidad}` : '— Seleccionar Folio —');

	let log = $state<{ hora: string; msg: string }[]>([]);

	function celdaPct(materiales: { confirmada: boolean }[]): number {
		if (!materiales.length) return 0;
		return Math.round((materiales.filter((m) => m.confirmada).length / materiales.length) * 100);
	}

	function pushLog(msg: string) {
		const d = new Date();
		log = [{ hora: `${pad(d.getHours())}:${pad(d.getMinutes())}`, msg }, ...log];
	}

	function confirmar(pn: string, label: string) {
		if (!folio) return;
		store.confirmarBolsa(folio.id, pn);
		pushLog(`${label} — confirmada`);
		toast.success('Bolsa confirmada', { description: label });
	}

	function simularEscaneo() {
		if (!folio) return;
		for (const celda of folio.celdas) {
			const mat = celda.materiales.find((m) => !m.confirmada);
			if (mat) {
				confirmar(mat.pn, `Bolsa ${celda.letra}-${pad(celda.materiales.indexOf(mat) + 1)}`);
				return;
			}
		}
		toast.info('Escaneo', { description: 'No hay bolsas pendientes.' });
	}

	function confirmarKit() {
		if (!folio) return;
		const ok = store.confirmarKitCompleto(folio.id);
		if (!ok) {
			toast.warning('Kit incompleto', { description: 'Aún hay bolsas pendientes de confirmar.' });
			return;
		}
		pushLog(`KIT COMPLETO confirmado — ${folio.id}`);
		toast.success('¡Kit Completo!', { description: `${folio.id} confirmado. Notificación enviada a producción.` });
	}
</script>

<div class="flex flex-col gap-6">
	<div class="flex flex-wrap items-center justify-between gap-3">
		<div>
			<h2 class="text-xl font-semibold">Confirmación Electrónica de Kits</h2>
			<p class="text-muted-foreground text-sm">Escanea o confirma manualmente el armado de cada bolsa / celda</p>
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
	</div>

	{#if folio}
		<div class="grid grid-cols-1 gap-4 xl:grid-cols-3">
			<div class="flex flex-col gap-4 xl:col-span-2">
				<Card.Root>
					<Card.Header>
						<Card.Title class="flex items-center gap-2 text-base">
							<QrCode class="text-primary size-4" /> Folio: {folio.id} · {folio.unidad}
						</Card.Title>
					</Card.Header>
					<Card.Content>
						<Button variant="outline" class="w-full border-dashed" onclick={simularEscaneo}>
							<ScanLine data-icon="inline-start" /> Simular escaneo de bolsa
						</Button>
					</Card.Content>
				</Card.Root>

				{#each folio.celdas as celda (celda.letra)}
					{@const Icon = celdaIcon(celda.letra)}
					{@const confirmadas = celda.materiales.filter((m) => m.confirmada).length}
					<Card.Root>
						<Card.Header>
							<Card.Title class="flex items-center gap-2 text-base">
								<Icon class="size-4" /> {celda.nombre}
							</Card.Title>
							<Card.Action>
								<StatusBadge
									label={`${confirmadas}/${celda.materiales.length} confirmadas`}
									colorClass={confirmadas === celda.materiales.length ? 'bg-emerald-500/15 text-emerald-400' : 'bg-chart-3/20 text-chart-3'}
								/>
							</Card.Action>
						</Card.Header>
						<Card.Content class="flex flex-col gap-2">
							{#each celda.materiales as m, i (m.pn)}
								<Item.Root variant="outline" size="sm">
									<Item.Content>
										<Item.Title>Bolsa {celda.letra}-{pad(i + 1)} · {m.desc}</Item.Title>
										<Item.Description class="font-mono">{m.pn} · {m.qty} {m.um}</Item.Description>
									</Item.Content>
									<Item.Actions>
										<Button variant={m.confirmada ? 'secondary' : 'outline'} size="sm" disabled={m.confirmada} onclick={() => confirmar(m.pn, `Bolsa ${celda.letra}-${pad(i + 1)}`)}>
											<Check data-icon="inline-start" />
											{m.confirmada ? 'Confirmada' : 'Confirmar'}
										</Button>
									</Item.Actions>
								</Item.Root>
							{/each}
						</Card.Content>
					</Card.Root>
				{/each}
			</div>

			<div class="flex flex-col gap-4">
				<Card.Root>
					<Card.Header>
						<Card.Title class="text-base">Progreso del Kit</Card.Title>
					</Card.Header>
					<Card.Content class="flex flex-col gap-3">
						{#each folio.celdas as celda (celda.letra)}
							{@const pct = celdaPct(celda.materiales)}
							<div class="flex flex-col gap-1">
								<div class="flex justify-between text-sm">
									<span>{celda.nombre}</span>
									<span class="text-muted-foreground tabular-nums">{pct}%</span>
								</div>
								<Progress value={pct} class="h-2" />
							</div>
						{/each}
						<Separator />
						<Button onclick={confirmarKit}>
							<CircleCheckBig data-icon="inline-start" /> Confirmar Kit Completo
						</Button>
					</Card.Content>
				</Card.Root>

				<Card.Root>
					<Card.Header>
						<Card.Title class="flex items-center gap-2 text-base">
							<Clock class="text-primary size-4" /> Registro en tiempo real
						</Card.Title>
					</Card.Header>
					<Card.Content>
						{#if log.length}
							<ul class="flex flex-col gap-2 text-sm">
								{#each log as entry, i (i)}
									<li class="flex gap-2">
										<span class="text-emerald-400 tabular-nums">{entry.hora}</span>
										<span class="text-muted-foreground">{entry.msg}</span>
									</li>
								{/each}
							</ul>
						{:else}
							<p class="text-muted-foreground text-sm">Kit cargado — confirma bolsas para ver el registro.</p>
						{/if}
					</Card.Content>
				</Card.Root>
			</div>
		</div>
	{:else}
		<Empty.Root class="border">
			<Empty.Header>
				<Empty.Media variant="icon">
					<QrCode />
				</Empty.Media>
				<Empty.Title>Selecciona un folio</Empty.Title>
				<Empty.Description>Carga un folio para confirmar el armado de cada bolsa.</Empty.Description>
			</Empty.Header>
		</Empty.Root>
	{/if}
</div>
