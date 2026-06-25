<script lang="ts">
	import { goto } from "$app/navigation";
	import BarcodeScanner from "$lib/components/custom/BarcodeScanner.svelte";
	import { Badge } from "$lib/components/ui/badge";

	let lastScannedCode = $state<string>('');
	let scanHistory = $state<string[]>([]);

	function handleScanned(barcode: string) {
		console.log('Código escaneado:', barcode);
		lastScannedCode = barcode;
		
		// Agregar al historial si no está duplicado
		if (!scanHistory.includes(barcode)) {
			/* scanHistory = [barcode, ...scanHistory.slice(0, 9)]; // Mantener máximo 10 códigos */
      goto(`/venta/${barcode}`);
		}
	}
</script>

<div class="container mx-auto p-4 max-w-2xl">
	<div class="mb-8 text-center">
		<h1 class="text-3xl font-bold mb-2">Escáner de Códigos</h1>
		<p class="text-muted-foreground">
			Escanea códigos QR, códigos de barras y más con la cámara de tu dispositivo
		</p>
	</div>
	
	<div class="flex justify-center mb-8">
		<BarcodeScanner onscanned={handleScanned} />
	</div>

	{#if lastScannedCode}
		<div class="mb-6 p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
			<h2 class="text-lg font-semibold text-green-800 dark:text-green-300 mb-2">Último código escaneado:</h2>
			<div class="font-mono text-lg text-green-700 dark:text-green-200 break-all p-2 bg-white dark:bg-green-950/40 rounded border">
				{lastScannedCode}
			</div>
		</div>
	{/if}

	{#if scanHistory.length > 0}
		<div class="p-4 bg-muted/50 border border-border rounded-lg">
			<h2 class="text-lg font-semibold text-foreground mb-3">Historial de escaneos:</h2>
			<div class="space-y-2">
				{#each scanHistory as code, index}
					<div class="flex items-center gap-3 p-2 bg-background rounded border">
						<Badge variant="outline" class="shrink-0">{index + 1}</Badge>
						<span class="font-mono text-sm break-all text-muted-foreground">{code}</span>
					</div>
				{/each}
			</div>
		</div>
	{/if}
</div>