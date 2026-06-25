<script lang="ts">
	import data from "./data.js";
	import SectionCards from "./components/section-cards.svelte";
	import ChartAreaInteractive from "./components/chart-area-interactive.svelte";
	import DataTable from "./components/data-table.svelte";


</script>


		<!-- Page content start-->
		<div class="flex flex-1 flex-col">
			<div class="@container/main flex flex-1 flex-col gap-2">
				<div class="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
					<!-- <SectionCards />
					<div class="px-4 lg:px-6 overflow-hidden">
						<ChartAreaInteractive />
					</div> -->
					<DataTable {data} />
				</div>
			</div>
		</div>
		<!-- <div class="flex flex-1 flex-col gap-4 p-4">
			{#each Array.from({ length: 24 }) as _, index (index)}
				<div class="bg-muted/50 aspect-video h-12 w-full rounded-lg"></div>
			{/each}
		</div> -->


<!-- App.svelte -->



