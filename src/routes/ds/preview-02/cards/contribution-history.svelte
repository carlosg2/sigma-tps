<script lang="ts">
	import * as Card from "$lib/components/ui/card/index.js";
	import * as Chart from "$lib/components/ui/chart/index.js";
	import { Badge } from "$lib/components/ui/badge/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import * as Item from "$lib/components/ui/item/index.js";
	import { scaleBand } from "d3-scale";
	import { BarChart } from "layerchart";

	const chartData = [
		{ month: "Dec", amount: 800 },
		{ month: "Jan", amount: 1100 },
		{ month: "Feb", amount: 900 },
		{ month: "Mar", amount: 1300 },
		{ month: "Apr", amount: 750 },
		{ month: "May", amount: 1400 },
	];

	const chartConfig = {
		amount: {
			label: "Contribución",
			color: "var(--chart-2)",
		},
	} satisfies Chart.ChartConfig;
</script>

<Card.Root>
	<Card.Header>
		<Card.Title>Historial de facturación</Card.Title>
		<Card.Description>Últimos 6 meses de movimientos</Card.Description>
		<Card.Action>
			<Badge variant="secondary">+12% vs. mes anterior</Badge>
		</Card.Action>
	</Card.Header>
	<Card.Content>
		<Chart.Container config={chartConfig} class="h-[200px] w-full">
			<BarChart
				data={chartData}
				x="month"
				xScale={scaleBand().padding(0.25)}
				axis="x"
				rule={false}
				series={[
					{
						key: "amount",
						label: chartConfig.amount.label,
						color: chartConfig.amount.color,
					},
				]}
				props={{
					bars: { stroke: "none", rounded: "top" },
					xAxis: { tickLength: 0 },
				}}
			>
				{#snippet tooltip()}
					<Chart.Tooltip hideLabel class="min-w-40" />
				{/snippet}
			</BarChart>
		</Chart.Container>
	</Card.Content>
	<Card.Footer class="flex-col gap-4">
		<div class="grid w-full grid-cols-1 gap-3 md:grid-cols-2">
			<Item.Root variant="muted" class="flex-col items-stretch">
				<Item.Content class="gap-1">
					<Item.Description
						class="text-muted-foreground text-xs font-medium tracking-wider uppercase"
					>
						Próximo vencimiento proveedor
					</Item.Description>
					<span class="cn-font-heading text-lg font-semibold">25 may 2024</span>
					<span class="text-muted-foreground text-sm">$1,000 programado</span>
				</Item.Content>
			</Item.Root>
			<Item.Root variant="muted" class="flex-col items-stretch">
				<Item.Content class="gap-1">
					<Item.Description
						class="text-muted-foreground text-xs font-medium tracking-wider uppercase"
					>
						Plan de tesorería automático
					</Item.Description>
					<span class="cn-font-heading text-lg font-semibold">Acelerado</span>
					<span class="text-muted-foreground text-sm">Recurrente semanal</span>
				</Item.Content>
			</Item.Root>
		</div>
		<Button class="w-full">Ver reporte completo</Button>
	</Card.Footer>
</Card.Root>
