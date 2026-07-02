<script lang="ts">
	import { useInventariosStore } from '$lib/tps/inventarios/store.svelte.js';
	import { FOLIO_ESTATUS_LABEL, FOLIO_ESTATUS_COLORS, NOTIF_TIPO_ACCENT, celdaIcon } from '$lib/tps/inventarios/constants.js';
	import type { CeldaLetra } from '$lib/tps/inventarios/types.js';
	import StatCard from '$lib/tps/components/stat-card.svelte';
	import StatusBadge from '$lib/tps/components/status-badge.svelte';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Table from '$lib/components/ui/table/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Progress } from '$lib/components/ui/progress/index.js';
	import FolderOpen from '@lucide/svelte/icons/folder-open';
	import PackageCheck from '@lucide/svelte/icons/package-check';
	import TriangleAlert from '@lucide/svelte/icons/triangle-alert';
	import CarFront from '@lucide/svelte/icons/car-front';
	import Zap from '@lucide/svelte/icons/zap';
	import Clock from '@lucide/svelte/icons/clock';
	import ArrowRight from '@lucide/svelte/icons/arrow-right';

	const store = useInventariosStore();
	const data = $derived(store.state);

	const foliosRecientes = $derived(data.folios.slice(0, 5));
	const alertas = $derived(data.notificaciones.filter((n) => n.estado !== 'Surtido').slice(0, 3));

	const celdasAvance = $derived.by(() => {
		const letras: CeldaLetra[] = ['A', 'B', 'C', 'D'];
		const nombres: Record<CeldaLetra, string> = {
			A: 'Blindaje Lateral',
			B: 'Vidrios Balísticos',
			C: 'Arneses y Eléctrico',
			D: 'Piso y Ruedas'
		};
		return letras.map((letra) => {
			let total = 0;
			let surtidos = 0;
			for (const f of data.folios) {
				for (const c of f.celdas) {
					if (c.letra === letra) {
						total += c.materiales.length;
						surtidos += c.materiales.filter((m) => m.surtido).length;
					}
				}
			}
			const pct = total ? Math.round((surtidos / total) * 100) : 0;
			return { letra, nombre: nombres[letra], total, surtidos, pct };
		});
	});

	function folioPct(f: (typeof data.folios)[number]): number {
		const { total, surtidos } = store.folioTotales(f);
		return total ? Math.round((surtidos / total) * 100) : 0;
	}
</script>

<div class="flex flex-col gap-6">
	<div>
		<h2 class="text-xl font-semibold">Resumen Operativo</h2>
		<p class="text-muted-foreground text-sm">
			Turno activo · {data.folios[0]?.fecha ?? ''} — Línea Blindaje Alta Gama · Bienvenido,
			<strong class="text-foreground">{data.currentUser.name}</strong>
		</p>
	</div>

	<div
		class="grid grid-cols-1 gap-4 @xl/main:grid-cols-2 @5xl/main:grid-cols-4 **:data-[slot=card]:from-primary/5 **:data-[slot=card]:to-card **:data-[slot=card]:bg-linear-to-t **:data-[slot=card]:shadow-xs dark:**:data-[slot=card]:bg-card"
	>
		<a href="/inventarios/picking" class="contents">
			<StatCard label="Folios Activos" value={store.foliosActivos} subtitle="En proceso y urgentes" icon={FolderOpen} />
		</a>
		<a href="/inventarios/confirmacion" class="contents">
			<StatCard label="Kits Completados" value={store.kitsCompletados} subtitle="Turno actual" icon={PackageCheck} />
		</a>
		<a href="/inventarios/linekeeper" class="contents">
			<StatCard label="Aditivas Pendientes" value={store.aditivasPendientes} subtitle="Sin surtir · Linekeeper" icon={TriangleAlert} />
		</a>
		<a href="/inventarios/carritos" class="contents">
			<StatCard label="Unidades en Proceso" value={store.unidadesEnProceso} subtitle="En línea de blindaje" icon={CarFront} />
		</a>
	</div>

	<div class="grid grid-cols-1 gap-4 xl:grid-cols-2">
		<Card.Root>
			<Card.Header>
				<Card.Title class="text-base">Folios Recientes</Card.Title>
				<Card.Description>Progreso de surtido por folio</Card.Description>
				<Card.Action>
					<Button href="/inventarios/picking" variant="outline" size="sm">
						Ver todos
						<ArrowRight data-icon="inline-end" />
					</Button>
				</Card.Action>
			</Card.Header>
			<Card.Content>
				<Table.Root>
					<Table.Header>
						<Table.Row>
							<Table.Head>Folio</Table.Head>
							<Table.Head>Unidad</Table.Head>
							<Table.Head>Estatus</Table.Head>
							<Table.Head class="w-28">Progreso</Table.Head>
						</Table.Row>
					</Table.Header>
					<Table.Body>
						{#each foliosRecientes as f (f.id)}
							<Table.Row>
								<Table.Cell class="font-mono font-medium">{f.id}</Table.Cell>
								<Table.Cell>
									<div class="font-medium">{f.unidad}</div>
									<div class="text-muted-foreground font-mono text-xs">{f.vin}</div>
								</Table.Cell>
								<Table.Cell>
									<StatusBadge label={FOLIO_ESTATUS_LABEL[f.estatus]} colorClass={FOLIO_ESTATUS_COLORS[f.estatus]} />
								</Table.Cell>
								<Table.Cell>
									<div class="flex items-center gap-2">
										<Progress value={folioPct(f)} class="h-1.5" />
										<span class="text-muted-foreground w-9 text-right text-xs tabular-nums">{folioPct(f)}%</span>
									</div>
								</Table.Cell>
							</Table.Row>
						{/each}
					</Table.Body>
				</Table.Root>
			</Card.Content>
		</Card.Root>

		<Card.Root>
			<Card.Header>
				<Card.Title class="flex items-center gap-2 text-base">
					<Zap class="text-primary size-4" /> Linekeeper — Alertas Activas
				</Card.Title>
				<Card.Description>Aditivas y cambios autorizados por producción</Card.Description>
				<Card.Action>
					<Button href="/inventarios/linekeeper" variant="outline" size="sm">
						Ver bandeja
						<ArrowRight data-icon="inline-end" />
					</Button>
				</Card.Action>
			</Card.Header>
			<Card.Content class="flex flex-col gap-3">
				{#each alertas as n (n.id)}
					<Card.Root class="border-l-4 {NOTIF_TIPO_ACCENT[n.tipo]}">
						<Card.Header>
							<Card.Title class="text-sm">{n.titulo} en {n.folio}</Card.Title>
							<Card.Description>{n.desc}</Card.Description>
						</Card.Header>
						<Card.Footer class="text-muted-foreground gap-2 text-xs">
							<Clock class="size-3.5" />
							{n.hora} · Autoriza: {n.autoriza}
						</Card.Footer>
					</Card.Root>
				{/each}
			</Card.Content>
		</Card.Root>
	</div>

	<Card.Root>
		<Card.Header>
			<Card.Title class="text-base">Avance por Celda de Trabajo — Turno Actual</Card.Title>
			<Card.Description>Surtido acumulado de materiales por celda en todos los folios</Card.Description>
		</Card.Header>
		<Card.Content>
			<div class="grid grid-cols-1 gap-4 @xl/main:grid-cols-2 @4xl/main:grid-cols-4">
				{#each celdasAvance as c (c.letra)}
					{@const Icon = celdaIcon(c.letra)}
					<Card.Root>
						<Card.Header>
							<Card.Description class="flex items-center gap-2">
								<Icon class="size-4" /> Celda {c.letra} · {c.nombre}
							</Card.Description>
							<Card.Title class="text-2xl font-semibold tabular-nums">{c.pct}%</Card.Title>
						</Card.Header>
						<Card.Footer class="flex-col items-start gap-2">
							<Progress value={c.pct} class="h-2" />
							<span class="text-muted-foreground text-xs">{c.surtidos} / {c.total} materiales</span>
						</Card.Footer>
					</Card.Root>
				{/each}
			</div>
		</Card.Content>
	</Card.Root>
</div>
