<script lang="ts">
	import * as Table from "$lib/components/ui/table";
	import { Button } from "$lib/components/ui/button";

	let config = $state({
		stickyHeader: true,
		stickyFooter: true,
		tableHeight: "400px"
	});

	let tableConfig = $state({
		bleed: false,
		dense: false,
		grid: false,
		striped: false
	});

	// Generate sample data for demonstration
	const generateData = (count: number) => {
		return Array.from({ length: count }, (_, i) => ({
			id: i + 1,
			name: `Item ${i + 1}`,
			category: ["Electronics", "Clothing", "Books", "Sports", "Home"][i % 5],
			price: Math.floor(Math.random() * 1000) + 10,
			stock: Math.floor(Math.random() * 100) + 1,
			status: ["Active", "Inactive", "Pending"][i % 3],
			description: `This is a description for item ${i + 1}. It contains some details about the product.`
		}));
	};

	const data = generateData(50);
	
	// Calculate totals for footer
	const totalItems = data.length;
	const totalValue = data.reduce((sum, item) => sum + item.price * item.stock, 0);
	const totalStock = data.reduce((sum, item) => sum + item.stock, 0);
</script>

<div class="p-8 space-y-8">
	<div class="space-y-4">
		<h1 class="text-3xl font-bold">Sticky Table & Configuration Demo</h1>
		<p class="text-muted-foreground">
			This demo showcases the sticky header and footer functionality along with various table configuration options.
			Scroll vertically to see the header and footer remain visible, and experiment with different styling options.
		</p>
	</div>

	<!-- Controls -->
	<div class="flex flex-wrap gap-4 p-4 border rounded-lg bg-muted/50">
		<div class="space-y-2">
			<h3 class="text-sm font-medium">Sticky Options</h3>
			<div class="flex flex-wrap gap-4">
				<label class="flex items-center gap-2">
					<input type="checkbox" bind:checked={config.stickyHeader} />
					Sticky Header
				</label>
				<label class="flex items-center gap-2">
					<input type="checkbox" bind:checked={config.stickyFooter} />
					Sticky Footer  
				</label>
			</div>
		</div>
		
		<div class="space-y-2">
			<h3 class="text-sm font-medium">Table Height</h3>
			<label class="flex items-center gap-2">
				<span>Height:</span>
				<select bind:value={config.tableHeight} class="px-2 py-1 border rounded">
					<option value="300px">300px</option>
					<option value="400px">400px</option>
					<option value="500px">500px</option>
					<option value="600px">600px</option>
				</select>
			</label>
		</div>

		<div class="space-y-2">
			<h3 class="text-sm font-medium">Table Styling</h3>
			<div class="flex flex-wrap gap-4">
				<label class="flex items-center gap-2">
					<input type="checkbox" bind:checked={tableConfig.bleed} />
					Bleed
				</label>
				<label class="flex items-center gap-2">
					<input type="checkbox" bind:checked={tableConfig.dense} />
					Dense
				</label>
				<label class="flex items-center gap-2">
					<input type="checkbox" bind:checked={tableConfig.grid} />
					Grid
				</label>
				<label class="flex items-center gap-2">
					<input type="checkbox" bind:checked={tableConfig.striped} />
					Striped
				</label>
			</div>
		</div>
	</div>

	<!-- Main Demo Table -->
	<div class="space-y-4">
		<h2 class="text-xl font-semibold">Main Demo Table</h2>
		<div class="border rounded-lg overflow-hidden">
			<Table.Root 
				height={config.tableHeight}
				bleed={tableConfig.bleed}
				dense={tableConfig.dense}
				grid={tableConfig.grid}
				striped={tableConfig.striped}
			>
				<Table.Header sticky={config.stickyHeader}>
					<Table.Row>
						<Table.Head class="w-16">ID</Table.Head>
						<Table.Head class="min-w-[150px]">Name</Table.Head>
						<Table.Head class="min-w-[120px]">Category</Table.Head>
						<Table.Head class="text-right w-24">Price</Table.Head>
						<Table.Head class="text-right w-24">Stock</Table.Head>
						<Table.Head class="w-24">Status</Table.Head>
						<Table.Head class="min-w-[200px]">Description</Table.Head>
						<Table.Head class="w-32">Actions</Table.Head>
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{#each data as item (item.id)}
						<Table.Row>
							<Table.Cell class="font-medium">{item.id}</Table.Cell>
							<Table.Cell>{item.name}</Table.Cell>
							<Table.Cell>
								<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
									{item.category}
								</span>
							</Table.Cell>
							<Table.Cell class="text-right">${item.price.toLocaleString()}</Table.Cell>
							<Table.Cell class="text-right">{item.stock}</Table.Cell>
							<Table.Cell>
								<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium {
									item.status === 'Active' ? 'bg-green-100 text-green-800' :
									item.status === 'Inactive' ? 'bg-red-100 text-red-800' :
									'bg-yellow-100 text-yellow-800'
								}">
									{item.status}
								</span>
							</Table.Cell>
							<Table.Cell class="text-sm text-muted-foreground">{item.description}</Table.Cell>
							<Table.Cell>
								<div class="flex gap-2">
									<Button size="sm" variant="outline">Edit</Button>
									<Button size="sm" variant="outline">View</Button>
								</div>
							</Table.Cell>
						</Table.Row>
					{/each}
				</Table.Body>
				<Table.Footer sticky={config.stickyFooter}>
					<Table.Row>
						<Table.Cell class="font-medium">Total</Table.Cell>
						<Table.Cell class="font-medium">{totalItems} items</Table.Cell>
						<Table.Cell></Table.Cell>
						<Table.Cell class="text-right font-medium">${totalValue.toLocaleString()}</Table.Cell>
						<Table.Cell class="text-right font-medium">{totalStock}</Table.Cell>
						<Table.Cell></Table.Cell>
						<Table.Cell class="text-sm text-muted-foreground">Summary totals</Table.Cell>
						<Table.Cell></Table.Cell>
					</Table.Row>
				</Table.Footer>
			</Table.Root>
		</div>
	</div>

	<!-- Comparison Table - Without Sticky -->
	<div class="space-y-4">
		<h2 class="text-xl font-semibold">Comparison: Table Without Sticky Headers/Footers & Configurations</h2>
		<div class="border rounded-lg overflow-hidden">
			<Table.Root 
				height="300px"
				bleed={false}
				dense={false}
				grid={false}
				striped={false}
			>
				<Table.Header sticky={false}>
					<Table.Row>
						<Table.Head>ID</Table.Head>
						<Table.Head>Name</Table.Head>
						<Table.Head>Category</Table.Head>
						<Table.Head>Price</Table.Head>
						<Table.Head>Stock</Table.Head>
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{#each data.slice(0, 20) as item (item.id)}
						<Table.Row>
							<Table.Cell>{item.id}</Table.Cell>
							<Table.Cell>{item.name}</Table.Cell>
							<Table.Cell>{item.category}</Table.Cell>
							<Table.Cell>${item.price}</Table.Cell>
							<Table.Cell>{item.stock}</Table.Cell>
						</Table.Row>
					{/each}
				</Table.Body>
				<Table.Footer sticky={false}>
					<Table.Row>
						<Table.Cell class="font-medium">Total</Table.Cell>
						<Table.Cell class="font-medium">{data.slice(0, 20).length} items</Table.Cell>
						<Table.Cell></Table.Cell>
						<Table.Cell class="font-medium">
							${data.slice(0, 20).reduce((sum, item) => sum + item.price, 0).toLocaleString()}
						</Table.Cell>
						<Table.Cell class="font-medium">
							{data.slice(0, 20).reduce((sum, item) => sum + item.stock, 0)}
						</Table.Cell>
					</Table.Row>
				</Table.Footer>
			</Table.Root>
		</div>
	</div>

	<!-- Features & Usage -->
	<div class="space-y-4">
		<h2 class="text-xl font-semibold">Features & Usage</h2>
		<div class="prose prose-sm max-w-none">
			<h3 class="text-lg font-medium">Sticky Features</h3>
			<ul class="space-y-2">
				<li><strong>Sticky Header:</strong> Add <code>sticky={true}</code> to <code>Table.Header</code> to make headers stick to the top when scrolling</li>
				<li><strong>Sticky Footer:</strong> Add <code>sticky={true}</code> to <code>Table.Footer</code> to make footers stick to the bottom when scrolling</li>
				<li><strong>Constrained Height:</strong> Set a <code>height</code> prop on <code>Table.Root</code> to create a scrollable table container</li>
			</ul>
			
			<h3 class="text-lg font-medium">Table Configuration Options</h3>
			<ul class="space-y-2">
				<li><strong>Bleed:</strong> Remove horizontal padding for full-width appearance</li>
				<li><strong>Dense:</strong> Reduce row padding for more compact display</li>
				<li><strong>Grid:</strong> Add vertical borders between columns for a grid-like appearance</li>
				<li><strong>Striped:</strong> Alternate row background colors for better readability</li>
			</ul>
			
			<h3 class="text-lg font-medium">Technical Details</h3>
			<ul class="space-y-2">
				<li><strong>Proper Z-Index:</strong> Sticky elements have appropriate z-index layering for correct visual stacking</li>
				<li><strong>Responsive Design:</strong> Tables maintain their responsive behavior with sticky positioning</li>
				<li><strong>Context API:</strong> Table configurations are shared with child components via Svelte context</li>
			</ul>
		</div>
	</div>

	<!-- Code Examples -->
	<div class="space-y-4">
		<h2 class="text-xl font-semibold">Code Example</h2>
		<div class="bg-muted/50 p-4 rounded-lg">
			<pre class="text-sm"><code>{`<Table.Root 
  height="400px"
  bleed={false}
  dense={false}
  grid={true}
  striped={true}
>
  <Table.Header sticky={true}>
    <Table.Row>
      <Table.Head>Column 1</Table.Head>
      <Table.Head>Column 2</Table.Head>
    </Table.Row>
  </Table.Header>
  <Table.Body>
    <!-- Table rows -->
  </Table.Body>
  <Table.Footer sticky={true}>
    <Table.Row>
      <Table.Cell>Total</Table.Cell>
      <Table.Cell>Summary</Table.Cell>
    </Table.Row>
  </Table.Footer>
</Table.Root>`}</code></pre>
		</div>
	</div>
</div>