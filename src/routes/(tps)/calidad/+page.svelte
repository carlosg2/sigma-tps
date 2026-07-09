<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import ClipboardCheck from '@lucide/svelte/icons/clipboard-check';
	import Car from '@lucide/svelte/icons/car';
	import TrendingUp from '@lucide/svelte/icons/trending-up';
</script>

<div class="flex flex-col gap-6">
	<div><h2 class="text-xl font-semibold">Calidad</h2><p class="text-muted-foreground text-sm">Inspección de producción, control de rentas y KPIs</p></div>
	<div class="grid gap-4 sm:grid-cols-3">
		<Card.Root><Card.Header><Card.Title class="flex items-center gap-2"><ClipboardCheck class="size-5" />Inspección Producción</Card.Title><Card.Description>Checklist por etapa operativa con puntos críticos y autorización de avance</Card.Description></Card.Header><Card.Footer><Button href="/calidad/inspeccion" variant="outline" class="w-full"><Badge variant="secondary" class="mr-2 font-mono text-xs">GAP-CAL-004</Badge>Abrir</Button></Card.Footer></Card.Root>
		<Card.Root><Card.Header><Card.Title class="flex items-center gap-2"><Car class="size-5" />Check-out / Check-in Rentas</Card.Title><Card.Description>Control de calidad de salida y retorno de flota en tablet</Card.Description></Card.Header><Card.Footer><Button href="/calidad/checkout-rentas" variant="outline" class="w-full"><Badge variant="secondary" class="mr-2 font-mono text-xs">GAP-CAL-005</Badge>Abrir</Button></Card.Footer></Card.Root>
		<Card.Root><Card.Header><Card.Title class="flex items-center gap-2"><TrendingUp class="size-5" />KPIs de Calidad</Card.Title><Card.Description>Dashboard de indicadores de calidad para la flota de rentas</Card.Description></Card.Header><Card.Footer><Button href="/calidad/kpis" variant="outline" class="w-full"><Badge variant="secondary" class="mr-2 font-mono text-xs">GAP-CAL-006</Badge>Abrir</Button></Card.Footer></Card.Root>
	</div>
</div>
