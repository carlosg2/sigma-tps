<script lang="ts">
	import ShieldIcon from "@tabler/icons-svelte/icons/shield";
	import ShieldCheckIcon from "@tabler/icons-svelte/icons/shield-check";
	import WeightIcon from "@tabler/icons-svelte/icons/weight";
	import CurrencyDollarIcon from "@tabler/icons-svelte/icons/currency-dollar";
	import FeatherIcon from "@tabler/icons-svelte/icons/feather";
	import CertificateIcon from "@tabler/icons-svelte/icons/certificate";

	import * as Drawer from "$lib/components/ui/drawer";
	import { Button } from "$lib/components/ui/button/index.js";
	import { IsMobile } from "$lib/hooks/is-mobile.svelte.js";
	import { Label } from "$lib/components/ui/label/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import { Textarea } from "$lib/components/ui/textarea/index.js";
	import * as Select from "$lib/components/ui/select/index.js";
	import { Separator } from "$lib/components/ui/separator/index.js";
	import { Badge } from "$lib/components/ui/badge/index.js";
	import { Switch } from "$lib/components/ui/switch/index.js";
	import type { Schema } from "./schemas.js";
	import { getCostoColor } from "./schemas.js";

	const isMobile = new IsMobile();

	let { item }: { item: Schema } = $props();

	let nivel_nombre = $state(item.nivel_nombre);
	let estandar_certificacion = $state(item.estandar_certificacion);
	let proteccion_contra = $state(item.proteccion_contra);
	let materiales = $state(item.materiales);
	let peso_total_vehiculo_kg = $state(item.peso_total_vehiculo_kg);
	let aplicacion = $state(item.aplicacion);
	let costo_relativo = $state(item.costo_relativo);
	let disponible_ultraligero = $state(item.disponible_ultraligero);
	let activo = $state(item.activo);
</script>

<Drawer.Root direction={isMobile.current ? "bottom" : "right"}>
	<Drawer.Trigger>
		{#snippet child({ props })}
			<Button variant="ghost" class="text-foreground w-fit text-left font-semibold" {...props}>
				<ShieldIcon class="size-4 mr-1" />
				{item.nivel_codigo}
			</Button>
		{/snippet}
	</Drawer.Trigger>
	<Drawer.Content>
		<Drawer.Header class="gap-1">
			<Drawer.Title class="flex items-center gap-2">
				<ShieldCheckIcon class="size-5" />
				{item.nivel_codigo} - Detalles del Nivel
			</Drawer.Title>
			<Drawer.Description>{item.nivel_nombre}</Drawer.Description>
		</Drawer.Header>
		<div class="flex flex-col gap-4 overflow-y-auto px-4 text-sm">
			<!-- Resumen de características -->
			<div class="grid grid-cols-2 gap-3">
				<div class="flex items-center gap-2 rounded-lg border p-3">
					<WeightIcon class="size-5 text-muted-foreground" />
					<div>
						<p class="text-xs text-muted-foreground">Peso Total</p>
						<p class="font-semibold">{item.peso_total_vehiculo_kg.toLocaleString('es-MX')} kg</p>
					</div>
				</div>
				<div class="flex items-center gap-2 rounded-lg border p-3">
					<CurrencyDollarIcon class="size-5 text-muted-foreground" />
					<div>
						<p class="text-xs text-muted-foreground">Costo</p>
						<Badge class={getCostoColor(item.costo_relativo)}>{item.costo_relativo}</Badge>
					</div>
				</div>
				<div class="flex items-center gap-2 rounded-lg border p-3">
					<CertificateIcon class="size-5 text-muted-foreground" />
					<div>
						<p class="text-xs text-muted-foreground">Certificación</p>
						<p class="font-medium text-xs">{item.estandar_certificacion}</p>
					</div>
				</div>
				<div class="flex items-center gap-2 rounded-lg border p-3">
					<FeatherIcon class="size-5 text-muted-foreground" />
					<div>
						<p class="text-xs text-muted-foreground">Ultraligero</p>
						<Badge variant={item.disponible_ultraligero ? "default" : "secondary"}>
							{item.disponible_ultraligero ? "Disponible" : "No disponible"}
						</Badge>
					</div>
				</div>
			</div>
			
			<Separator />
			
			<!-- Información de Protección -->
			<div class="rounded-lg border p-4 bg-muted/30">
				<h4 class="font-semibold mb-2 flex items-center gap-2">
					<ShieldCheckIcon class="size-4" />
					Protección Contra
				</h4>
				<p class="text-sm text-muted-foreground">{item.proteccion_contra}</p>
			</div>

			<!-- Materiales -->
			<div class="rounded-lg border p-4">
				<h4 class="font-semibold mb-2">Materiales</h4>
				<p class="text-sm text-muted-foreground">{item.materiales}</p>
			</div>

			<!-- Aplicación -->
			<div class="rounded-lg border p-4">
				<h4 class="font-semibold mb-2">Aplicación</h4>
				<p class="text-sm text-muted-foreground">{item.aplicacion}</p>
			</div>

			<Separator />
			
			<!-- Formulario de Edición -->
			<form class="flex flex-col gap-4">
				<div class="flex flex-col gap-3">
					<Label for="nivel_nombre">Nombre del Nivel</Label>
					<Input id="nivel_nombre" bind:value={nivel_nombre} />
				</div>
				<div class="grid grid-cols-2 gap-4">
					<div class="flex flex-col gap-3">
						<Label for="estandar">Estándar de Certificación</Label>
						<Input id="estandar" bind:value={estandar_certificacion} />
					</div>
					<div class="flex flex-col gap-3">
						<Label for="peso">Peso Total (kg)</Label>
						<Input id="peso" type="number" bind:value={peso_total_vehiculo_kg} />
					</div>
				</div>
				<div class="flex flex-col gap-3">
					<Label for="proteccion">Protección Contra</Label>
					<Textarea id="proteccion" bind:value={proteccion_contra} rows={2} />
				</div>
				<div class="flex flex-col gap-3">
					<Label for="materiales">Materiales</Label>
					<Textarea id="materiales" bind:value={materiales} rows={2} />
				</div>
				<div class="flex flex-col gap-3">
					<Label for="aplicacion">Aplicación</Label>
					<Textarea id="aplicacion" bind:value={aplicacion} rows={2} />
				</div>
				<div class="grid grid-cols-2 gap-4">
					<div class="flex flex-col gap-3">
						<Label for="costo">Costo Relativo</Label>
						<Select.Root type="single" bind:value={costo_relativo}>
							<Select.Trigger id="costo" class="w-full">
								{costo_relativo ?? "Seleccionar costo"}
							</Select.Trigger>
							<Select.Content>
								<Select.Item value="Medio">Medio</Select.Item>
								<Select.Item value="Alto">Alto</Select.Item>
								<Select.Item value="Muy Alto">Muy Alto</Select.Item>
							</Select.Content>
						</Select.Root>
					</div>
					<div class="flex flex-col gap-3">
						<Label>Opciones</Label>
						<div class="flex flex-col gap-2">
							<div class="flex items-center justify-between">
								<Label for="ultraligero" class="text-sm font-normal">Ultraligero</Label>
								<Switch id="ultraligero" bind:checked={disponible_ultraligero} />
							</div>
							<div class="flex items-center justify-between">
								<Label for="activo" class="text-sm font-normal">Activo</Label>
								<Switch id="activo" bind:checked={activo} />
							</div>
						</div>
					</div>
				</div>
			</form>
		</div>
		<Drawer.Footer>
			<Button>Guardar Cambios</Button>
			<Drawer.Close>
				{#snippet child({ props })}
					<Button variant="outline" {...props}>Cancelar</Button>
				{/snippet}
			</Drawer.Close>
		</Drawer.Footer>
	</Drawer.Content>
</Drawer.Root>
