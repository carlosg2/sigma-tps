<script lang="ts" generics="TData">
	import Settings2Icon from "@lucide/svelte/icons/settings-2";
	import type { Table } from "@tanstack/table-core";
	import { buttonVariants } from "$lib/components/ui/button/index.js";
	import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js";

	interface TableConfig {
		bleed: boolean;
		dense: boolean;
		grid: boolean;
		striped: boolean;
		stickyHeader: boolean;
		stickyFooter: boolean;
		tableHeight: string;
	}

	let { 
		table,
		tableConfig = $bindable()
	}: { 
		table: Table<TData>;
		tableConfig?: TableConfig;
	} = $props();
</script>

<DropdownMenu.Root>
	<DropdownMenu.Trigger
		class={buttonVariants({
			variant: "outline",
			size: "sm",
			class: "ml-auto hidden h-8 lg:flex",
		})}
	>
		<Settings2Icon />
		View
	</DropdownMenu.Trigger>
	<DropdownMenu.Content align="end" class="w-fit max-h-[50vh] overflow-y-auto">
		<!-- Column Visibility Section -->
		<DropdownMenu.Group>
			<DropdownMenu.Label>Toggle columns</DropdownMenu.Label>
			<DropdownMenu.Separator />
			{#each table
				.getAllColumns()
				.filter((col) => typeof col.accessorFn !== "undefined" && col.getCanHide()) as column (column)}
				<DropdownMenu.CheckboxItem
					bind:checked={() => column.getIsVisible(), (v) => column.toggleVisibility(!!v)}
					class="capitalize"
				>
					{column.id}
				</DropdownMenu.CheckboxItem>
			{/each}
		</DropdownMenu.Group>

		{#if tableConfig}
			<DropdownMenu.Separator />
			
			<!-- Sticky Options Section -->
			<DropdownMenu.Group>
				<DropdownMenu.Label>Sticky Options</DropdownMenu.Label>
				<DropdownMenu.CheckboxItem
					bind:checked={() => tableConfig.stickyHeader, (v) => tableConfig.stickyHeader = !!v}
				>
					Sticky Header
				</DropdownMenu.CheckboxItem>
				<DropdownMenu.CheckboxItem
					bind:checked={() => tableConfig.stickyFooter, (v) => tableConfig.stickyFooter = !!v}
				>
					Sticky Footer
				</DropdownMenu.CheckboxItem>
			</DropdownMenu.Group>

			<DropdownMenu.Separator />

			<!-- Table Height Section -->
			<DropdownMenu.Group>
				<DropdownMenu.Label>Table Height</DropdownMenu.Label>
				<DropdownMenu.RadioGroup bind:value={tableConfig.tableHeight}>
					<DropdownMenu.RadioItem value="300px">300px</DropdownMenu.RadioItem>
					<DropdownMenu.RadioItem value="400px">400px</DropdownMenu.RadioItem>
					<DropdownMenu.RadioItem value="500px">500px</DropdownMenu.RadioItem>
					<DropdownMenu.RadioItem value="600px">600px</DropdownMenu.RadioItem>
					<DropdownMenu.RadioItem value="auto">Auto</DropdownMenu.RadioItem>
				</DropdownMenu.RadioGroup>
			</DropdownMenu.Group>

			<DropdownMenu.Separator />

			<!-- Table Styling Section -->
			<DropdownMenu.Group>
				<DropdownMenu.Label>Table Styling</DropdownMenu.Label>
				<DropdownMenu.CheckboxItem
					bind:checked={() => tableConfig.bleed, (v) => tableConfig.bleed = !!v}
				>
					Bleed
				</DropdownMenu.CheckboxItem>
				<DropdownMenu.CheckboxItem
					bind:checked={() => tableConfig.dense, (v) => tableConfig.dense = !!v}
				>
					Dense
				</DropdownMenu.CheckboxItem>
				<DropdownMenu.CheckboxItem
					bind:checked={() => tableConfig.grid, (v) => tableConfig.grid = !!v}
				>
					Grid
				</DropdownMenu.CheckboxItem>
				<DropdownMenu.CheckboxItem
					bind:checked={() => tableConfig.striped, (v) => tableConfig.striped = !!v}
				>
					Striped
				</DropdownMenu.CheckboxItem>
			</DropdownMenu.Group>
		{/if}
	</DropdownMenu.Content>
</DropdownMenu.Root>
