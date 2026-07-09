<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import TrendingUp from '@lucide/svelte/icons/trending-up';
	import FileSearch from '@lucide/svelte/icons/file-search';
</script>

<div class="flex flex-col gap-6">
	<div>
		<h2 class="text-xl font-semibold">Contabilidad</h2>
		<p class="text-muted-foreground text-sm">Módulos de reportes financieros y fiscalización</p>
	</div>
	<div class="grid gap-4 sm:grid-cols-2">
		<Card.Root>
			<Card.Header>
				<Card.Title class="flex items-center gap-2"><TrendingUp class="size-5" />Estados de Resultados</Card.Title>
				<Card.Description>Doble ER Interno/Externo generados simultáneamente al cierre de periodo</Card.Description>
			</Card.Header>
			<Card.Footer><Button href="/contabilidad/estados-resultados" variant="outline" class="w-full"><Badge variant="secondary" class="mr-2 font-mono text-xs">GAP-CON-003</Badge>Abrir módulo</Button></Card.Footer>
		</Card.Root>
		<Card.Root>
			<Card.Header>
				<Card.Title class="flex items-center gap-2"><FileSearch class="size-5" />Compulsa SAT</Card.Title>
				<Card.Description>Cruce automático CFDI ERP vs. portal SAT para detección de discrepancias</Card.Description>
			</Card.Header>
			<Card.Footer><Button href="/contabilidad/compulsa-sat" variant="outline" class="w-full"><Badge variant="secondary" class="mr-2 font-mono text-xs">GAP-CON-010</Badge>Abrir módulo</Button></Card.Footer>
		</Card.Root>
	</div>
</div>
