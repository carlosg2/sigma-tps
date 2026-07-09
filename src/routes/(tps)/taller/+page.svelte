<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import CalendarDays from '@lucide/svelte/icons/calendar-days';
	import Tablet from '@lucide/svelte/icons/tablet';
	import AlertTriangle from '@lucide/svelte/icons/triangle-alert';
</script>

<div class="flex flex-col gap-6">
	<div><h2 class="text-xl font-semibold">Taller de Servicios</h2><p class="text-muted-foreground text-sm">Agenda, recepción y gestión de siniestros</p></div>
	<div class="grid gap-4 sm:grid-cols-3">
		<Card.Root><Card.Header><Card.Title class="flex items-center gap-2"><CalendarDays class="size-5" />Agenda de Servicio</Card.Title><Card.Description>Tablero de citas por bahía y técnico con sugerencia automática</Card.Description></Card.Header><Card.Footer><Button href="/taller/agenda" variant="outline" class="w-full"><Badge variant="secondary" class="mr-2 font-mono text-xs">GAP-TLL-001</Badge>Abrir</Button></Card.Footer></Card.Root>
		<Card.Root><Card.Header><Card.Title class="flex items-center gap-2"><Tablet class="size-5" />Recepción Vehículo</Card.Title><Card.Description>Apertura de Orden de Servicio con checklist de 170 puntos en tablet</Card.Description></Card.Header><Card.Footer><Button href="/taller/recepcion" variant="outline" class="w-full"><Badge variant="secondary" class="mr-2 font-mono text-xs">GAP-TLL-002</Badge>Abrir</Button></Card.Footer></Card.Root>
		<Card.Root><Card.Header><Card.Title class="flex items-center gap-2"><AlertTriangle class="size-5" />Bifurcación Siniestros</Card.Title><Card.Description>Flujo de decisión Interno vs. Externo con autorización electrónica</Card.Description></Card.Header><Card.Footer><Button href="/taller/siniestros" variant="outline" class="w-full"><Badge variant="secondary" class="mr-2 font-mono text-xs">GAP-TLL-005</Badge>Abrir</Button></Card.Footer></Card.Root>
	</div>
</div>
