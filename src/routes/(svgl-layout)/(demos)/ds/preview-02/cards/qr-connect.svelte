<script lang="ts">
	import { onMount } from "svelte";
	import QRCode from "qrcode";
	import { Button } from "$lib/components/ui/button/index.js";
	import * as Card from "$lib/components/ui/card/index.js";

	const connectUrl = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";

	let dataUrl = $state("");

	onMount(() => {
		QRCode.toDataURL(connectUrl, { width: 160, margin: 1 }).then((url) => {
			dataUrl = url;
		});
	});
</script>

<Card.Root>
	<Card.Content class="flex justify-center pt-6">
		<div class="rounded-xl border bg-white p-4">
			{#if dataUrl}
				<img src={dataUrl} alt="" width="160" height="160" class="block" />
			{:else}
				<div class="bg-muted size-[160px] animate-pulse rounded"></div>
			{/if}
		</div>
	</Card.Content>
	<Card.Header class="text-center">
		<Card.Title>Escanee para vincular su dispositivo de operación</Card.Title>
		<Card.Description>
			Abra la app móvil del ERP y escanee este código para vincular su dispositivo de operación.
		</Card.Description>
	</Card.Header>
	<Card.Footer>
		<Button variant="secondary" class="w-full">Entendido</Button>
	</Card.Footer>
</Card.Root>
