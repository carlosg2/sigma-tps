<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import Tablet from '@lucide/svelte/icons/tablet';
	import Scissors from '@lucide/svelte/icons/scissors';
</script>

<div class="flex flex-col gap-6">
	<div><h2 class="text-xl font-semibold">Producción</h2><p class="text-muted-foreground text-sm">Kiosco de marcaje y control de nesting</p></div>
	<div class="grid gap-4 sm:grid-cols-2">
		<Card.Root><Card.Header><Card.Title class="flex items-center gap-2"><Tablet class="size-5" />Kiosco 3 Toques</Card.Title><Card.Description>Interfaz de marcaje en tiempo real para piso de producción — máximo 3 toques por acción</Card.Description></Card.Header><Card.Footer><Button href="/produccion/kiosco" variant="outline" class="w-full"><Badge variant="secondary" class="mr-2 font-mono text-xs">GAP-PRD-001</Badge>Abrir</Button></Card.Footer></Card.Root>
		<Card.Root><Card.Header><Card.Title class="flex items-center gap-2"><Scissors class="size-5" />Control de Nesting</Card.Title><Card.Description>Consumo real por placa de acero balístico · Remanentes reutilizables · Trazabilidad VIN</Card.Description></Card.Header><Card.Footer><Button href="/produccion/nesting" variant="outline" class="w-full"><Badge variant="secondary" class="mr-2 font-mono text-xs">GAP-PRD-002</Badge>Abrir</Button></Card.Footer></Card.Root>
	</div>
</div>
