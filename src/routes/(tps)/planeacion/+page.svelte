<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import BarChart from '@lucide/svelte/icons/bar-chart-2';
	import Warehouse from '@lucide/svelte/icons/warehouse';
	import Users from '@lucide/svelte/icons/users';
</script>

<div class="flex flex-col gap-6">
	<div><h2 class="text-xl font-semibold">Planeación</h2><p class="text-muted-foreground text-sm">MRP, visibilidad multi-planta y cargas de trabajo</p></div>
	<div class="grid gap-4 sm:grid-cols-3">
		<Card.Root><Card.Header><Card.Title class="flex items-center gap-2"><BarChart class="size-5" />Portal MRP</Card.Title><Card.Description>Explosión automatizada de LMAT contra ~300 OPs abiertas sin exportar a Excel</Card.Description></Card.Header><Card.Footer><Button href="/planeacion/mrp" variant="outline" class="w-full"><Badge variant="secondary" class="mr-2 font-mono text-xs">GAP-PLN-001</Badge>Abrir</Button></Card.Footer></Card.Root>
		<Card.Root><Card.Header><Card.Title class="flex items-center gap-2"><Warehouse class="size-5" />Multi-Planta</Card.Title><Card.Description>Existencias en tiempo real en las 5 localidades con alertas de transferencia</Card.Description></Card.Header><Card.Footer><Button href="/planeacion/multi-planta" variant="outline" class="w-full"><Badge variant="secondary" class="mr-2 font-mono text-xs">GAP-PLN-002</Badge>Abrir</Button></Card.Footer></Card.Root>
		<Card.Root><Card.Header><Card.Title class="flex items-center gap-2"><Users class="size-5" />Cargas de Trabajo</Card.Title><Card.Description>Carga planificada vs. capacidad real por centro de trabajo con factor fatiga</Card.Description></Card.Header><Card.Footer><Button href="/planeacion/cargas" variant="outline" class="w-full"><Badge variant="secondary" class="mr-2 font-mono text-xs">GAP-PLN-003</Badge>Abrir</Button></Card.Footer></Card.Root>
	</div>
</div>
