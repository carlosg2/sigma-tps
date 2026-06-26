<script lang="ts">
	import { onMount } from 'svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Toaster } from '$lib/components/ui/sonner/index.js';
	import { DataTableSkeleton } from '$lib/components/data-table/index.js';
	import ModeToggle from '$lib/components/mode-toggle.svelte';
	import {
		departments,
		generateDemoPeople,
		skills,
		statuses,
		type DemoPerson
	} from './_demo-data.js';
	import GridDemo from './_grid-demo.svelte';
	import DataTableShowcase from './_data-table-showcase.svelte';

	type DemoMode = 'grid' | 'table';
	type TableMode = 'basic' | 'advanced';
	type AdvancedFilterUi = 'advancedFilters' | 'commandFilters';

	const isTestEnvironment = import.meta.env.MODE === 'test' || import.meta.env.VITEST;

	let demoMode = $state<DemoMode>(isTestEnvironment ? 'table' : 'grid');
	let tableMode = $state<TableMode>('basic');
	let advancedFilterUi = $state<AdvancedFilterUi>('commandFilters');
	let showTableSkeleton = $state(false);

	// Table styling toggles (forwarded to DataTable via the showcase).
	let tableDense = $state(false);
	let tableStriped = $state(false);
	let tableGrid = $state(false);
	let tableBleed = $state(false);
	let tableStickyHeader = $state(false);

	// Table demo only needs a small slice — avoid generating 10k rows on first paint.
	const tableRows = $state<DemoPerson[]>(generateDemoPeople(200, { lite: true }));

	let windowHeight = $state(760);

	onMount(() => {
		const update = () => (windowHeight = window.innerHeight);
		update();
		window.addEventListener('resize', update);
		return () => window.removeEventListener('resize', update);
	});

	const gridHeight = $derived(Math.max(400, windowHeight - 150));
</script>

<div class="mx-auto flex w-full max-w-[1600px] flex-col gap-4 px-6 py-6">
	<div class="flex flex-col gap-2">
		<div class="flex items-center justify-between">
			<div>
				<h1 class="text-2xl font-bold tracking-tight">svelte-tablecn</h1>
				<p class="text-sm text-muted-foreground">
					A powerful data grid for Svelte 5. Port of <a
						href="https://tablecn.com"
						target="_blank"
						rel="noopener noreferrer"
						class="underline underline-offset-4 hover:text-foreground">tablecn.com</a
					>
				</p>
			</div>
			<div class="flex items-center gap-2">
				<Button
					variant={demoMode === 'grid' ? 'default' : 'outline'}
					size="sm"
					onclick={() => (demoMode = 'grid')}
				>
					Data Grid Demo
				</Button>
				<Button
					variant={demoMode === 'table' ? 'default' : 'outline'}
					size="sm"
					onclick={() => (demoMode = 'table')}
				>
					Data Table Demo
				</Button>
				<ModeToggle />
			</div>
		</div>
	</div>

	{#if demoMode === 'grid'}
		<GridDemo height={gridHeight} />
	{:else}
		<div class="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-muted/30 p-3">
			<div class="flex flex-wrap items-center gap-2">
				<Button
					variant={tableMode === 'basic' ? 'default' : 'outline'}
					size="sm"
					onclick={() => (tableMode = 'basic')}
				>
					Basic Table
				</Button>
				<Button
					variant={tableMode === 'advanced' ? 'default' : 'outline'}
					size="sm"
					onclick={() => (tableMode = 'advanced')}
				>
					Advanced Table
				</Button>
				{#if tableMode === 'advanced'}
					<span class="mx-1 text-muted-foreground">|</span>
					<Button
						variant={advancedFilterUi === 'advancedFilters' ? 'default' : 'outline'}
						size="sm"
						onclick={() => (advancedFilterUi = 'advancedFilters')}
					>
						Filter list
					</Button>
					<Button
						variant={advancedFilterUi === 'commandFilters' ? 'default' : 'outline'}
						size="sm"
						onclick={() => (advancedFilterUi = 'commandFilters')}
					>
						Filter menu
					</Button>
				{/if}
			</div>
			<Button variant="outline" size="sm" onclick={() => (showTableSkeleton = !showTableSkeleton)}>
				{showTableSkeleton ? 'Show Live Table' : 'Show Skeleton'}
			</Button>
		</div>

		<div class="flex flex-wrap items-center gap-2 rounded-lg border bg-muted/30 p-3">
			<span class="text-sm font-medium text-muted-foreground">Style:</span>
			<Button
				variant={tableDense ? 'default' : 'outline'}
				size="sm"
				onclick={() => (tableDense = !tableDense)}
			>
				Compact
			</Button>
			<Button
				variant={tableStriped ? 'default' : 'outline'}
				size="sm"
				onclick={() => (tableStriped = !tableStriped)}
			>
				Striped
			</Button>
			<Button
				variant={tableGrid ? 'default' : 'outline'}
				size="sm"
				onclick={() => (tableGrid = !tableGrid)}
			>
				Grid
			</Button>
			<Button
				variant={tableBleed ? 'default' : 'outline'}
				size="sm"
				onclick={() => (tableBleed = !tableBleed)}
			>
				Bleed
			</Button>
			<Button
				variant={tableStickyHeader ? 'default' : 'outline'}
				size="sm"
				onclick={() => (tableStickyHeader = !tableStickyHeader)}
			>
				Sticky header
			</Button>
		</div>

		{#if showTableSkeleton}
			<DataTableSkeleton columnCount={8} filterCount={tableMode === 'basic' ? 6 : 2} rowCount={10} />
		{:else}
			{#key `${tableMode}-${advancedFilterUi}`}
				<DataTableShowcase
					mode={tableMode}
					{advancedFilterUi}
					rows={tableRows}
					{departments}
					{statuses}
					{skills}
					dense={tableDense}
					striped={tableStriped}
					grid={tableGrid}
					bleed={tableBleed}
					stickyHeader={tableStickyHeader}
					height={tableStickyHeader ? '480px' : undefined}
				/>
			{/key}
		{/if}
	{/if}
</div>

<Toaster />
