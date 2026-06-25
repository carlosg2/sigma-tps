<script lang="ts">
	import * as Card from "$lib/components/ui/card/index.js";
	import * as Chart from "$lib/components/ui/chart/index.js";
	import { Separator } from "$lib/components/ui/separator/index.js";
	import { PieChart, Text } from "layerchart";

	const chartData = [
		{ name: "saved", value: 24000, color: "var(--color-saved)" },
		{ name: "remaining", value: 6000, color: "var(--color-remaining)" },
	];

	const chartConfig = {
		saved: { label: "Ahorrado", color: "var(--chart-2)" },
		remaining: { label: "Restante", color: "var(--chart-1)" },
	} satisfies Chart.ChartConfig;
</script>

<Card.Root>
	<Card.Content>
		<Chart.Container config={chartConfig} class="mx-auto aspect-square max-h-[220px]">
			<PieChart
				data={chartData}
				key="name"
				value="value"
				c="color"
				innerRadius={0.8}
				padding={28}
			>
				{#snippet aboveMarks()}
					<Text
						value="$24,000"
						textAnchor="middle"
						verticalAnchor="middle"
						class="fill-foreground text-2xl! font-bold"
						dy={-8}
					/>
					<Text
						value="80% de $30,000"
						textAnchor="middle"
						verticalAnchor="middle"
						class="fill-muted-foreground! text-muted-foreground"
						dy={14}
					/>
				{/snippet}
				{#snippet tooltip()}
					<Chart.Tooltip hideLabel />
				{/snippet}
			</PieChart>
		</Chart.Container>
	</Card.Content>
	<Card.Footer class="flex-col gap-0">
		<div class="flex w-full items-center justify-between py-3">
				<span class="text-muted-foreground text-sm">Finalización proyectada</span>
				<span class="text-sm font-semibold">Octubre 2024</span>
		</div>
		<Separator />
		<div class="flex w-full items-center justify-between py-3">
				<span class="text-muted-foreground text-sm">Promedio mensual</span>
			<span class="text-sm font-semibold tabular-nums">$1,250</span>
		</div>
		<Separator />
		<div class="flex w-full items-center justify-between py-3">
				<span class="text-muted-foreground text-sm">Mayor contribución</span>
				<span class="text-sm font-semibold">Transferencia automática</span>
		</div>
	</Card.Footer>
</Card.Root>
