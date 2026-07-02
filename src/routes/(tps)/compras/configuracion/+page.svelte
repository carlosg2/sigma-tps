<script lang="ts">
	import { useComprasStore } from '$lib/tps/compras/store.svelte.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import { toast } from 'svelte-sonner';
	import ArrowLeft from '@lucide/svelte/icons/arrow-left';
	import Save from '@lucide/svelte/icons/save';

	const store = useComprasStore();
	const config = $derived(store.state.config);

	function setField(nivel: number, field: 'montoMin' | 'montoMax' | 'responsable', value: string) {
		if (field === 'responsable') {
			store.updateConfigNivel(nivel, { responsable: value });
		} else {
			store.updateConfigNivel(nivel, { [field]: +value || (field === 'montoMax' ? 9999999 : 0) });
		}
	}

	function save() {
		store.saveConfig();
		toast.success('Configuración guardada correctamente.');
	}
</script>

<div class="mx-auto flex w-full max-w-4xl flex-col gap-6">
	<div class="flex flex-wrap items-center justify-between gap-3">
		<Button href="/compras" variant="outline" size="sm">
			<ArrowLeft data-icon="inline-start" /> Volver
		</Button>
		<p class="text-muted-foreground text-sm">Define montos y responsables por nivel de autorización</p>
	</div>

	{#each config as n (n.nivel)}
		<Card.Root>
			<Card.Header>
				<Card.Title>{n.label}</Card.Title>
				<Card.Description>Rango de monto y responsable asignado a este nivel</Card.Description>
			</Card.Header>
			<Card.Content class="flex flex-col gap-4">
				<div class="grid gap-4 md:grid-cols-2">
					<div class="grid gap-2">
						<Label for="min-{n.nivel}">Monto mínimo ($)</Label>
						<Input
							id="min-{n.nivel}"
							type="number"
							value={n.montoMin}
							oninput={(e) => setField(n.nivel, 'montoMin', e.currentTarget.value)}
						/>
					</div>
					<div class="grid gap-2">
						<Label for="max-{n.nivel}">Monto máximo ($)</Label>
						<Input
							id="max-{n.nivel}"
							type="number"
							value={n.montoMax === 9999999 ? '' : n.montoMax}
							placeholder="Sin límite"
							oninput={(e) => setField(n.nivel, 'montoMax', e.currentTarget.value)}
						/>
					</div>
				</div>
				<div class="grid gap-2">
					<Label for="resp-{n.nivel}">Responsable de autorización</Label>
					<Input
						id="resp-{n.nivel}"
						value={n.responsable}
						oninput={(e) => setField(n.nivel, 'responsable', e.currentTarget.value)}
					/>
				</div>
			</Card.Content>
		</Card.Root>
	{/each}

	<div>
		<Button onclick={save}><Save data-icon="inline-start" /> Guardar configuración</Button>
	</div>
</div>
