<script lang="ts">
	import * as Card from "$lib/components/ui/card/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	/* import LiveWaveform from "../../elevenlabs/live-waveform.svelte"; */

	let active = $state(false);
	let processing = $state(true);
	let mode = $state<"static" | "scrolling">("static");

	function handleToggleActive() {
		active = !active;
		if (active) {
			processing = false;
		}
	}

	function handleToggleProcessing() {
		processing = !processing;
		if (processing) {
			active = false;
		}
	}
</script>

<Card.Root>
	<Card.Header>
		<Card.Title>Forma de onda de audio en vivo</Card.Title>
		<Card.Description>
			Visualización en tiempo real de entrada del micrófono con reactividad de audio
		</Card.Description>
	</Card.Header>
	<Card.Content>
		<!-- <LiveWaveform
			{active}
			{processing}
			height={80}
			barWidth={3}
			barGap={2}
			{mode}
			fadeEdges={true}
			barColor="gray"
			historySize={120}
		/> -->
	</Card.Content>
	<Card.Footer class="gap-2">
		<Button size="sm" variant={active ? "default" : "outline"} onclick={handleToggleActive}>
			{active ? "Detener" : "Iniciar"} escucha
		</Button>
		<Button
			size="sm"
			variant={processing ? "default" : "outline"}
			onclick={handleToggleProcessing}
		>
			{processing ? "Detener" : "Iniciar"} procesamiento
		</Button>
		<Button
			size="sm"
			variant="outline"
			onclick={() => (mode = mode === "static" ? "scrolling" : "static")}
		>
			{mode === "static" ? "Estático" : "Desplazamiento"}
		</Button>
	</Card.Footer>
</Card.Root>
