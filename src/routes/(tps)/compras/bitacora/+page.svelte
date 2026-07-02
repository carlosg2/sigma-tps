<script lang="ts">
	import { useComprasStore } from '$lib/tps/compras/store.svelte.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Table from '$lib/components/ui/table/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import PlusCircle from '@lucide/svelte/icons/circle-plus';
	import CircleCheckBig from '@lucide/svelte/icons/circle-check-big';
	import CircleX from '@lucide/svelte/icons/circle-x';

	const store = useComprasStore();
	const rows = $derived(store.bitacoraGlobal);

	const icons = { creacion: PlusCircle, aprobado: CircleCheckBig, rechazado: CircleX };
	const colors = { creacion: 'text-muted-foreground', aprobado: 'text-emerald-500', rechazado: 'text-destructive' };
</script>

<div class="flex flex-col gap-6">
	<div class="flex flex-wrap items-center justify-between gap-3">
		<div>
			<h2 class="text-xl font-semibold">Bitácora de Autorizaciones</h2>
			<p class="text-muted-foreground text-sm">Registro completo con responsable, fecha/hora y comentario</p>
		</div>
		<Badge variant="outline" class="font-mono">GAP-COM-002</Badge>
	</div>

	<Card.Root>
		<Card.Content>
			<Table.Root>
				<Table.Header>
					<Table.Row>
						<Table.Head>Fecha / Hora</Table.Head>
						<Table.Head>No. OC</Table.Head>
						<Table.Head>Usuario · Rol</Table.Head>
						<Table.Head>Acción</Table.Head>
						<Table.Head>Comentario</Table.Head>
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{#each rows as b (b.id)}
						{@const Icon = icons[b.tipo]}
						<Table.Row>
							<Table.Cell class="text-muted-foreground font-mono text-xs whitespace-nowrap">{b.fecha}</Table.Cell>
							<Table.Cell>
								<span class="text-primary font-mono text-xs">{b.oc}</span>
								<p class="text-muted-foreground text-xs">{b.cc}</p>
							</Table.Cell>
							<Table.Cell class="text-sm">
								{b.usuario}
								<p class="text-muted-foreground text-xs">{b.rol}</p>
							</Table.Cell>
							<Table.Cell>
								<span class="flex items-center gap-2 text-sm">
									<Icon class="size-4 {colors[b.tipo]}" />{b.accion}
								</span>
							</Table.Cell>
							<Table.Cell class="text-muted-foreground text-xs italic">{b.comentario || '—'}</Table.Cell>
						</Table.Row>
					{/each}
				</Table.Body>
			</Table.Root>
		</Card.Content>
	</Card.Root>
</div>
