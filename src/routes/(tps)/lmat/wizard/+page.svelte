<script lang="ts">
	import { useStore } from '$lib/tps/store.svelte.js';
	import { ARMOR_LEVEL_LABELS, VALIDATION_DEPARTMENTS } from '$lib/tps/constants.js';
	import { cn } from '$lib/utils.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { Progress } from '$lib/components/ui/progress/index.js';
	import type { ArmorLevel } from '$lib/tps/types.js';
	import Check from '@lucide/svelte/icons/check';
	import ArrowLeft from '@lucide/svelte/icons/arrow-left';
	import ArrowRight from '@lucide/svelte/icons/arrow-right';
	import Car from '@lucide/svelte/icons/car';
	import Shield from '@lucide/svelte/icons/shield';
	import FileStack from '@lucide/svelte/icons/file-stack';
	import Users from '@lucide/svelte/icons/users';

	const store = useStore();
	const app = $derived(store.state);

	const steps = [
		{ n: 1, label: 'Datos tecnicos', icon: Car },
		{ n: 2, label: 'Caratula de blindaje', icon: Shield },
		{ n: 3, label: 'BOM inicial', icon: FileStack },
		{ n: 4, label: 'Validacion', icon: Users }
	] as const;

	let current = $state(1);
	const armorLevels: ArmorLevel[] = ['NIII', 'NIII_plus', 'NIV', 'NIV_plus', 'NV', 'NVI', 'NVII'];

	let form = $state({
		brand: '', model: '', version: '', year: '',
		armorLevel: 'NIII' as ArmorLevel, materials: 'Acero balistico + Kevlar', cert: '',
		components: 0
	});
	const deptValidation = $state<Record<string, boolean>>(
		Object.fromEntries(['Ingenieria', 'Manufactura', 'Compras', 'Almacen'].map((d) => [d, false]))
	);

	const stepDone = $derived([
		Boolean(form.brand && form.model && form.year),
		Boolean(form.armorLevel && form.materials),
		form.components > 0,
		Object.values(deptValidation).every(Boolean)
	]);
	const overall = $derived(Math.round((stepDone.filter(Boolean).length / 4) * 100));

	function next() { if (current < 4) current++; }
	function prev() { if (current > 1) current--; }
</script>

<div class="flex flex-wrap items-center justify-between gap-3">
	<p class="text-muted-foreground text-sm">Asistente unificado de alta y gestion de producto · sin saltar entre modulos</p>
	<Badge variant="secondary">{overall}% completo</Badge>
</div>

<!-- Stepper -->
<div class="grid grid-cols-4 gap-2">
	{#each steps as s (s.n)}
		{@const Icon = s.icon}
		<button onclick={() => (current = s.n)} class={cn('flex flex-col items-center gap-1 rounded-md border p-3 text-center transition-colors', current === s.n ? 'border-primary bg-primary/5' : 'hover:bg-muted/50', stepDone[s.n - 1] && 'border-emerald-500/40')}>
			<div class={cn('flex size-8 items-center justify-center rounded-full', stepDone[s.n - 1] ? 'bg-emerald-500 text-white' : current === s.n ? 'bg-primary text-primary-foreground' : 'bg-muted')}>
				{#if stepDone[s.n - 1]}<Check class="size-4" />{:else}<Icon class="size-4" />{/if}
			</div>
			<span class="text-xs font-medium">{s.label}</span>
		</button>
	{/each}
</div>
<Progress value={overall} max={100} />

<Card.Root class="mt-4">
	<Card.Content class="space-y-4 pt-6">
		{#if current === 1}
			<div class="grid gap-4 md:grid-cols-2">
				<div><Label>Marca</Label><Input bind:value={form.brand} placeholder="Toyota" /></div>
				<div><Label>Modelo</Label><Input bind:value={form.model} placeholder="Land Cruiser 300" /></div>
				<div><Label>Version</Label><Input bind:value={form.version} placeholder="GX-R" /></div>
				<div><Label>Ano</Label><Input bind:value={form.year} placeholder="2025" /></div>
			</div>
		{:else if current === 2}
			<div class="grid gap-4 md:grid-cols-2">
				<div>
					<Label>Nivel de blindaje</Label>
					<Select.Root type="single" bind:value={form.armorLevel}>
						<Select.Trigger>{ARMOR_LEVEL_LABELS[form.armorLevel]}</Select.Trigger>
						<Select.Content>{#each armorLevels as lvl}<Select.Item value={lvl}>{ARMOR_LEVEL_LABELS[lvl]}</Select.Item>{/each}</Select.Content>
					</Select.Root>
				</div>
				<div><Label>Materiales</Label><Input bind:value={form.materials} /></div>
				<div class="md:col-span-2"><Label>Certificaciones</Label><Input bind:value={form.cert} placeholder="NIJ 0108.01 / CEN BR6" /></div>
			</div>
		{:else if current === 3}
			<div><Label>Componentes iniciales (BOM)</Label><Input type="number" min="0" bind:value={form.components} /></div>
			<p class="text-muted-foreground text-sm">Agrega la cantidad de componentes preliminares. El detalle se gestiona en el Explorador de BOM al liberar.</p>
		{:else}
			<p class="text-muted-foreground text-sm">Validacion colaborativa secuencial: Ingenieria → Manufactura → Compras → Almacen → libera Ingenieria.</p>
			<div class="space-y-2">
				{#each Object.keys(deptValidation) as dept (dept)}
					<label class="flex items-center justify-between rounded-md border p-3">
						<span>{dept}</span>
						<Button size="sm" variant={deptValidation[dept] ? 'default' : 'outline'} onclick={() => (deptValidation[dept] = !deptValidation[dept])}>
							{deptValidation[dept] ? 'Validado' : 'Pendiente'}
						</Button>
					</label>
				{/each}
			</div>
		{/if}
	</Card.Content>
</Card.Root>

<div class="mt-4 flex justify-between">
	<Button variant="outline" onclick={prev} disabled={current === 1}><ArrowLeft data-icon="inline-start" /> Anterior</Button>
	{#if current < 4}
		<Button onclick={next}>Siguiente <ArrowRight data-icon="inline-end" /></Button>
	{:else}
		<Button disabled={overall < 100}>Liberar producto</Button>
	{/if}
</div>
