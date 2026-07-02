<script lang="ts">
	import { useComprasStore } from '$lib/tps/compras/store.svelte.js';
	import { ALERTA_VARIANT } from '$lib/tps/compras/constants.js';
	import * as Alert from '$lib/components/ui/alert/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import TriangleAlert from '@lucide/svelte/icons/triangle-alert';
	import Clock from '@lucide/svelte/icons/clock';
	import Bell from '@lucide/svelte/icons/bell';
	import ArrowRight from '@lucide/svelte/icons/arrow-right';

	const store = useComprasStore();
	const alertas = $derived(store.state.alertas);

	const icons = { error: TriangleAlert, warning: Clock, info: Bell };
</script>

<div class="flex flex-col gap-6">
	<div class="flex flex-wrap items-center justify-between gap-3">
		<div>
			<h2 class="text-xl font-semibold">Alertas y Notificaciones</h2>
			<p class="text-muted-foreground text-sm">Materiales con retraso y cambios de estatus</p>
		</div>
		<Badge variant="outline" class="font-mono">GAP-COM-003</Badge>
	</div>

	<div class="flex flex-col gap-3">
		{#each alertas as a (a.id)}
			{@const Icon = icons[a.tipo]}
			<Alert.Root variant={ALERTA_VARIANT[a.tipo]}>
				<Icon />
				<Alert.Title class="flex items-center justify-between gap-2">
					{a.titulo}
					<span class="text-muted-foreground text-xs font-normal">{a.fecha}</span>
				</Alert.Title>
				<Alert.Description class="flex flex-col items-start gap-1">
					<span>{a.desc}</span>
					<Button href="/compras/requisiciones?req={a.req}" variant="link" size="sm" class="h-auto p-0">
						Ver requisición <ArrowRight data-icon="inline-end" class="size-3" />
					</Button>
				</Alert.Description>
			</Alert.Root>
		{/each}
	</div>
</div>
