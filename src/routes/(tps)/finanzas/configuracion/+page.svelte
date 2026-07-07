<script lang="ts">
	import { useFinanzasStore } from '$lib/tps/finanzas/store.svelte.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Field from '$lib/components/ui/field/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Switch } from '$lib/components/ui/switch/index.js';
	import { toast } from 'svelte-sonner';
	import Save from '@lucide/svelte/icons/save';

	const store = useFinanzasStore();

	let envioAutomatico = $state(store.state.config.envioAutomatico);
	let reintentar = $state(store.state.config.reintentar);
	let notificarErrores = $state(store.state.config.notificarErrores);
	let retencionDias = $state(store.state.config.retencionDias);

	function save() {
		store.updateConfig({
			envioAutomatico,
			reintentar,
			notificarErrores,
			retencionDias: Math.min(3650, Math.max(30, retencionDias || 365))
		});
		toast.success('Configuración guardada correctamente.');
	}
</script>

<div class="mx-auto flex w-full max-w-2xl flex-col gap-6">
	<div>
		<h2 class="text-xl font-semibold">Configuración</h2>
		<p class="text-muted-foreground text-sm">Preferencias generales del envío de avisos</p>
	</div>

	<Card.Root>
		<Card.Header>
			<Card.Title>General</Card.Title>
			<Card.Description>Comportamiento automático y retención del historial</Card.Description>
		</Card.Header>
		<Card.Content>
			<Field.FieldGroup>
				<Field.Field orientation="horizontal">
					<Field.FieldContent>
						<Field.FieldLabel for="cfg-auto">Envío automático al generar egreso</Field.FieldLabel>
						<Field.FieldDescription>El aviso se envía sin intervención manual.</Field.FieldDescription>
					</Field.FieldContent>
					<Switch id="cfg-auto" bind:checked={envioAutomatico} />
				</Field.Field>

				<Field.FieldSeparator />

				<Field.Field orientation="horizontal">
					<Field.FieldContent>
						<Field.FieldLabel for="cfg-retry">Reintentar si falla el envío</Field.FieldLabel>
						<Field.FieldDescription>Hasta 3 reintentos con intervalo de 5 minutos.</Field.FieldDescription>
					</Field.FieldContent>
					<Switch id="cfg-retry" bind:checked={reintentar} />
				</Field.Field>

				<Field.FieldSeparator />

				<Field.Field orientation="horizontal">
					<Field.FieldContent>
						<Field.FieldLabel for="cfg-notif">Notificar errores a Tesorería</Field.FieldLabel>
						<Field.FieldDescription>Envía una alerta interna cuando un aviso falla.</Field.FieldDescription>
					</Field.FieldContent>
					<Switch id="cfg-notif" bind:checked={notificarErrores} />
				</Field.Field>

				<Field.FieldSeparator />

				<Field.Field>
					<Field.FieldLabel for="cfg-dias">Retención de historial (días)</Field.FieldLabel>
					<Input id="cfg-dias" type="number" min={30} max={3650} bind:value={retencionDias} class="max-w-40" />
					<Field.FieldDescription>Tiempo que se conservan los registros de avisos enviados.</Field.FieldDescription>
				</Field.Field>
			</Field.FieldGroup>
		</Card.Content>
		<Card.Footer>
			<Button onclick={save}>
				<Save data-icon="inline-start" /> Guardar configuración
			</Button>
		</Card.Footer>
	</Card.Root>
</div>
