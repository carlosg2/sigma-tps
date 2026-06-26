<script lang="ts">
	import { Badge } from "$lib/components/ui/badge/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import * as Card from "$lib/components/ui/card/index.js";
	import * as Chart from "$lib/components/ui/chart/index.js";
	import { scaleBand } from "d3-scale";
	import { BarChart } from "layerchart";

	const activityData = [
		{ month: "Jan", amount: 40 },
		{ month: "Feb", amount: 55 },
		{ month: "Mar", amount: 35 },
		{ month: "Apr", amount: 60 },
		{ month: "May", amount: 45 },
		{ month: "Jun", amount: 50 },
		{ month: "Jul", amount: 65 },
		{ month: "Aug", amount: 40 },
		{ month: "Sep", amount: 55 },
		{ month: "Oct", amount: 70 },
		{ month: "Nov", amount: 45 },
		{ month: "Dec", amount: 80 },
	];

	const chartConfig = {
		amount: { label: "Actividad", color: "var(--chart-2)" },
	} satisfies Chart.ChartConfig;
</script>

<div class="grid grid-cols-2 gap-3">
	<Card.Root>
		<Card.Content>
			<Card.Description>Saldo de la tarjeta corporativa ERP</Card.Description>
			<Card.Title class="text-2xl tabular-nums">MXN$12.94</Card.Title>
			<Card.Description class="tabular-nums">MXN$11,337.06 disponibles</Card.Description>
		</Card.Content>
	</Card.Root>
	<Card.Root class="flex flex-col justify-between">
		<Card.Content class="flex flex-1 flex-col justify-between">
			<div class="flex flex-col gap-1">
				<Card.Description>Pago proveedor vencido</Card.Description>
				<Card.Title class="text-2xl">1 Apr</Card.Title>
			</div>
			<Button variant="outline" size="sm" class="mt-3 w-full">Pago proveedor anticipado</Button>
		</Card.Content>
	</Card.Root>
	<Card.Root class="col-span-2">
		<Card.Content class="flex flex-col gap-2">
			<div class="flex items-center justify-between">
				<Card.Description>Actividad anual contable</Card.Description>
				<Badge variant="secondary">+MXN$0.25 de cashback diario</Badge>
			</div>
			<Chart.Container config={chartConfig} class="h-20 w-full">
				<BarChart
					data={activityData}
					x="month"
					xScale={scaleBand().padding(0.2)}
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
						bars: { rounded: "top" },
						xAxis: {
							format: (v: string) => String(v).slice(0, 1),
							tickLength: 0,
							class: "text-[10px]",
						},
					}}
				>
					{#snippet tooltip()}
						<Chart.Tooltip hideLabel />
					{/snippet}
				</BarChart>
			</Chart.Container>
		</Card.Content>
	</Card.Root>
</div>
