<script lang="ts">
	import * as Card from "$lib/components/ui/card/index.js";
	import { Badge } from "$lib/components/ui/badge/index.js";
	import * as Chart from "$lib/components/ui/chart/index.js";
	import { AreaChart } from "layerchart";
	import { curveNatural } from "d3-shape";
	import { scaleBand } from "d3-scale";

	const areaChartData = [
		{ month: "January", desktop: 186 },
		{ month: "February", desktop: 305 },
		{ month: "March", desktop: 237 },
		{ month: "April", desktop: 73 },
		{ month: "May", desktop: 209 },
		{ month: "June", desktop: 214 },
	];

	const areaChartConfig = {
		desktop: {
			label: "Desktop",
			color: "var(--chart-1)",
		},
	} satisfies Chart.ChartConfig;

	const latestVisitors = areaChartData[areaChartData.length - 1]?.desktop ?? 0;
	const previousVisitors = areaChartData[areaChartData.length - 2]?.desktop ?? latestVisitors;
	const trendPercent =
		previousVisitors === 0
			? 0
			: Math.round(((latestVisitors - previousVisitors) / previousVisitors) * 100);
	const trendPrefix = trendPercent > 0 ? "+" : "";
</script>

<Card.Root class="pb-0">
	<Card.Header>
		<Card.Title>Órdenes</Card.Title>
		<Card.Description>Últimos 6 meses</Card.Description>
		<Card.Action>
			<Badge variant={trendPercent >= 0 ? "secondary" : "destructive"}>
				{trendPrefix}{trendPercent}% vs. el mes pasado
			</Badge>
		</Card.Action>
	</Card.Header>
	<Card.Content class="px-0">
		<Chart.Container config={areaChartConfig} class="h-48 w-full">
			<AreaChart
				data={areaChartData}
				x="month"
				xScale={scaleBand()}
				axis="x"
				series={[
					{
						key: "desktop",
						label: "Desktop",
						color: areaChartConfig.desktop.color,
					},
				]}
				props={{
					area: {
						curve: curveNatural,
						fillOpacity: 0.15,
						motion: "tween",
					},
					xAxis: {
						format: (d: string) => d.slice(0, 3),
						tickLength: 0,
					},
				}}
			>
				{#snippet tooltip()}
					<Chart.Tooltip indicator="line" hideLabel />
				{/snippet}
			</AreaChart>
		</Chart.Container>
	</Card.Content>
</Card.Root>
