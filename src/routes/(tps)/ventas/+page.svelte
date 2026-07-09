<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import FileText from '@lucide/svelte/icons/file-text';
	import Shield from '@lucide/svelte/icons/shield';
	import MapPin from '@lucide/svelte/icons/map-pin';
</script>

<div class="flex flex-col gap-6">
	<div><h2 class="text-xl font-semibold">Ventas</h2><p class="text-muted-foreground text-sm">Cotizador, factibilidad técnica y confirmación de entrega</p></div>
	<div class="grid gap-4 sm:grid-cols-3">
		<Card.Root><Card.Header><Card.Title class="flex items-center gap-2"><FileText class="size-5" />Cotizador de Ventas</Card.Title><Card.Description>Vehículo + Blindaje · Versionado automático · Workflow de autorizaciones</Card.Description></Card.Header><Card.Footer><Button href="/ventas/cotizador" variant="outline" class="w-full"><Badge variant="secondary" class="mr-2 font-mono text-xs">GAP-VTA-001</Badge>Abrir</Button></Card.Footer></Card.Root>
		<Card.Root><Card.Header><Card.Title class="flex items-center gap-2"><Shield class="size-5" />Factibilidad Técnica</Card.Title><Card.Description>Check de Ingeniería para modelos exóticos con bloqueo hasta respuesta</Card.Description></Card.Header><Card.Footer><Button href="/ventas/factibilidad" variant="outline" class="w-full"><Badge variant="secondary" class="mr-2 font-mono text-xs">GAP-VTA-002</Badge>Abrir</Button></Card.Footer></Card.Root>
		<Card.Root><Card.Header><Card.Title class="flex items-center gap-2"><MapPin class="size-5" />Confirmación Entrega</Card.Title><Card.Description>Firma digital + fotos + GPS al momento de la entrega · Modo offline</Card.Description></Card.Header><Card.Footer><Button href="/ventas/entrega" variant="outline" class="w-full"><Badge variant="secondary" class="mr-2 font-mono text-xs">GAP-VTA-003</Badge>Abrir</Button></Card.Footer></Card.Root>
	</div>
</div>
