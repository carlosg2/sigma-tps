<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import CalendarDays from '@lucide/svelte/icons/calendar-days';
	import Wrench from '@lucide/svelte/icons/wrench';
	import Building2 from '@lucide/svelte/icons/building-2';
	import TriangleAlert from '@lucide/svelte/icons/triangle-alert';
	import Tablet from '@lucide/svelte/icons/tablet';
	import FileClock from '@lucide/svelte/icons/file-clock';
	import ShieldAlert from '@lucide/svelte/icons/shield-alert';
	import ArrowRight from '@lucide/svelte/icons/arrow-right';

	const cards = [
		{ href: '/taller/agenda', icon: CalendarDays, title: 'Agenda de Servicio', desc: 'Calendario Día/Semana/Mes por bahía y técnico con nueva cita y disponibilidad', gap: 'GAP-TLL-001' },
		{ href: '/taller/bahias', icon: Wrench, title: 'Capacidad de Bahías', desc: 'Carga por bahía y control de capacidad instalada', gap: 'GAP-TLL-001' },
		{ href: '/taller/multi-sucursal', icon: Building2, title: 'Multi-Sucursal', desc: 'Vista consolidada de las 5 sucursales para homologar procesos', gap: 'GAP-TLL-001' },
		{ href: '/taller/alertas-mantenimiento', icon: TriangleAlert, title: 'Alertas de Mantenimiento', desc: 'Preventivo por kilometraje con invitaciones proactivas al cliente', gap: 'GAP-TLL-001' },
		{ href: '/taller/recepcion', icon: Tablet, title: 'Recepción de Vehículo', desc: 'Wizard de 5 pasos con inspección de 170 puntos, evidencia y firma', gap: 'GAP-TLL-002' },
		{ href: '/taller/historial', icon: FileClock, title: 'Historial por VIN', desc: 'Servicios anteriores, kilometrajes y expediente fotográfico por vehículo', gap: 'GAP-TLL-002' },
		{ href: '/taller/siniestros', icon: ShieldAlert, title: 'Bifurcación de Siniestros', desc: 'Flujo de decisión Interno vs. Externo con autorización electrónica', gap: 'GAP-TLL-005' }
	];
</script>

<div class="flex flex-col gap-6">
	<div>
		<h2 class="text-xl font-semibold">Taller de Servicios</h2>
		<p class="text-muted-foreground text-sm">Agenda, capacidad, recepción, historial y gestión de siniestros</p>
	</div>
	<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
		{#each cards as c}
			{@const Icon = c.icon}
			<Card.Root>
				<Card.Header>
					<Card.Title class="flex items-center gap-2"><Icon class="size-5" />{c.title}</Card.Title>
					<Card.Description>{c.desc}</Card.Description>
				</Card.Header>
				<Card.Footer>
					<Button href={c.href} variant="outline" class="w-full">
						<Badge variant="secondary" class="mr-2 font-mono text-xs">{c.gap}</Badge>Abrir <ArrowRight class="ml-auto size-4" />
					</Button>
				</Card.Footer>
			</Card.Root>
		{/each}
	</div>
</div>
