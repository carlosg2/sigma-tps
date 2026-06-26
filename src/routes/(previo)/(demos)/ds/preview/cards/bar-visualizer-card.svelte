<script lang="ts">
	import * as Card from "$lib/components/ui/card/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import BarVisualizer, { type AgentState } from "../../elevenlabs/bar-visualizer.svelte";

	let agentState: AgentState = $state("speaking");
</script>

<Card.Root>
	<Card.Header>
		<Card.Title>Visualizador de frecuencia de audio</Card.Title>
		<Card.Description>
			Visualización en tiempo real de bandas de frecuencia con transiciones animadas de estado
		</Card.Description>
	</Card.Header>
	<Card.Content>
		<BarVisualizer
			{agentState}
			demo={true}
			barCount={20}
			minHeight={15}
			maxHeight={90}
			class="h-40 max-w-full"
		/>
	</Card.Content>
	<Card.Footer class="gap-2">
		<Button
			size="sm"
			variant={agentState === "connecting" ? "default" : "outline"}
			onclick={() => (agentState = "connecting")}
		>
			Conectando
		</Button>
		<Button
			size="sm"
			variant={agentState === "listening" ? "default" : "outline"}
			onclick={() => (agentState = "listening")}
		>
			Escuchando
		</Button>
		<Button
			size="sm"
			variant={agentState === "speaking" ? "default" : "outline"}
			onclick={() => (agentState = "speaking")}
		>
			Hablando
		</Button>
	</Card.Footer>
</Card.Root>
