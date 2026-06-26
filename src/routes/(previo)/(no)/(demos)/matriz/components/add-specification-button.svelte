<script lang="ts">
	import { Button } from "$lib/components/ui/button/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import { Label } from "$lib/components/ui/label/index.js";
	import * as Dialog from "$lib/components/ui/dialog/index.js";
	import * as Select from "$lib/components/ui/select/index.js";
	import PlusIcon from "@lucide/svelte/icons/plus";
	import { categorias, especificaciones } from "../data/data.js";
	import type { MatrizMaterial } from "../data/schemas.js";

	let { 
		onAdd,
		vehiculoBase 
	}: { 
		onAdd: (material: MatrizMaterial) => void;
		vehiculoBase: MatrizMaterial | null;
	} = $props();

	let dialogOpen = $state(false);

	// Form state
	let formData = $state({
		categoria: "",
		descripcion: "",
		codigo_material: "",
		especificacion: "",
	});

	function resetForm() {
		formData = {
			categoria: "",
			descripcion: "",
			codigo_material: "",
			especificacion: "",
		};
	}

	function handleSubmit() {
		if (!vehiculoBase) return;
		if (!formData.categoria || !formData.descripcion || !formData.codigo_material || !formData.especificacion) {
			return;
		}

		// Crear nuevo material basado en el vehículo existente
		const newMaterial: MatrizMaterial = {
			id_matriz: -Date.now(), // ID temporal negativo
			clave_vehiculo: vehiculoBase.clave_vehiculo,
			nombre_vehiculo: vehiculoBase.nombre_vehiculo,
			marca: vehiculoBase.marca,
			modelo: vehiculoBase.modelo,
			anio: vehiculoBase.anio,
			nivel_codigo: vehiculoBase.nivel_codigo,
			nivel_nombre: vehiculoBase.nivel_nombre,
			norma: vehiculoBase.norma,
			diseno_codigo: vehiculoBase.diseno_codigo,
			diseno_nombre: vehiculoBase.diseno_nombre,
			categoria: formData.categoria,
			descripcion: formData.descripcion,
			codigo_material: formData.codigo_material,
			especificacion: formData.especificacion,
			cantidad: null,
			unidad: null,
			activo: true,
			fecha_creacion: new Date().toISOString(),
		};

		onAdd(newMaterial);
		resetForm();
		dialogOpen = false;
	}

	function handleOpenChange(open: boolean) {
		dialogOpen = open;
		if (!open) {
			resetForm();
		}
	}
</script>

<Dialog.Root open={dialogOpen} onOpenChange={handleOpenChange}>
	<Dialog.Trigger>
		{#snippet child({ props })}
			<Button 
				{...props} 
				variant="default" 
				size="sm" 
				class="h-8"
				disabled={!vehiculoBase}
			>
				<PlusIcon class="size-4" />
				Agregar
			</Button>
		{/snippet}
	</Dialog.Trigger>
	<Dialog.Content class="sm:max-w-[500px]">
		<Dialog.Header>
			<Dialog.Title>Nueva Especificación</Dialog.Title>
			<Dialog.Description>
				Agrega una nueva línea de especificación para el vehículo.
			</Dialog.Description>
		</Dialog.Header>
		
		<div class="grid gap-4 py-4">
			<!-- Categoría -->
			<div class="grid gap-2">
				<Label for="categoria">Categoría</Label>
				<Select.Root 
					type="single"
					value={formData.categoria}
					onValueChange={(value) => formData.categoria = value ?? ''}
				>
					<Select.Trigger id="categoria" class="w-full">
						{@const cat = categorias.find(c => c.value === formData.categoria)}
						{cat?.label ?? "Seleccionar categoría..."}
					</Select.Trigger>
					<Select.Content>
						{#each categorias as categoria (categoria.value)}
							<Select.Item value={categoria.value}>
								<categoria.icon class="size-4 mr-2 inline text-muted-foreground" />
								{categoria.label}
							</Select.Item>
						{/each}
					</Select.Content>
				</Select.Root>
			</div>

			<!-- Descripción -->
			<div class="grid gap-2">
				<Label for="descripcion">Descripción</Label>
				<Input
					id="descripcion"
					placeholder="Ej: Blindaje lateral puerta delantera"
					bind:value={formData.descripcion}
				/>
			</div>

			<!-- Código Material -->
			<div class="grid gap-2">
				<Label for="codigo_material">Código de Material</Label>
				<Input
					id="codigo_material"
					placeholder="Ej: DAB031"
					bind:value={formData.codigo_material}
					class="uppercase font-mono"
				/>
			</div>

			<!-- Especificación -->
			<div class="grid gap-2">
				<Label for="especificacion">Especificación</Label>
				<Select.Root
					type="single"
					value={formData.especificacion}
					onValueChange={(value) => formData.especificacion = value ?? ''}
				>
					<Select.Trigger id="especificacion" class="w-full">
						{@const espec = especificaciones.find(e => e.value === formData.especificacion)}
						{espec?.label ?? "Seleccionar especificación..."}
					</Select.Trigger>
					<Select.Content>
						{#each especificaciones as especificacion (especificacion.value)}
							<Select.Item value={especificacion.value}>
								<especificacion.icon class="size-4 mr-2 inline text-muted-foreground" />
								{especificacion.label}
							</Select.Item>
						{/each}
					</Select.Content>
				</Select.Root>
			</div>
		</div>

		<Dialog.Footer>
			<Button variant="outline" onclick={() => handleOpenChange(false)}>
				Cancelar
			</Button>
			<Button 
				onclick={handleSubmit}
				disabled={!formData.categoria || !formData.descripcion || !formData.codigo_material || !formData.especificacion}
			>
				<PlusIcon class="size-4" />
				Agregar Especificación
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
