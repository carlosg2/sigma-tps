<script lang="ts">
	import * as Table from "$lib/components/ui/table";

	let tableConfig = $state({
		bleed: false,
		dense: false,
		grid: false,
		striped: false,
		stickyHeader: false,
		stickyFooter: false,
		height: ""
	});

	const data = [
		{ id: 1, name: "John Doe", email: "john@example.com", role: "Admin" },
		{ id: 2, name: "Jane Smith", email: "jane@example.com", role: "User" },
		{ id: 3, name: "Bob Johnson", email: "bob@example.com", role: "Editor" },
		{ id: 4, name: "Alice Brown", email: "alice@example.com", role: "User" },
		{ id: 5, name: "Charlie Wilson", email: "charlie@example.com", role: "Admin" },
		{ id: 6, name: "Diana Prince", email: "diana@example.com", role: "User" },
		{ id: 7, name: "Edward Norton", email: "edward@example.com", role: "Editor" },
		{ id: 8, name: "Fiona Apple", email: "fiona@example.com", role: "User" },
		{ id: 9, name: "George Martin", email: "george@example.com", role: "Admin" },
		{ id: 10, name: "Helen Troy", email: "helen@example.com", role: "User" },
		{ id: 11, name: "Ian Fleming", email: "ian@example.com", role: "Editor" },
		{ id: 12, name: "Julia Roberts", email: "julia@example.com", role: "User" },
		{ id: 13, name: "Kevin Bacon", email: "kevin@example.com", role: "Admin" },
		{ id: 14, name: "Laura Palmer", email: "laura@example.com", role: "User" },
		{ id: 15, name: "Mike Tyson", email: "mike@example.com", role: "Editor" },
		{ id: 16, name: "Nancy Drew", email: "nancy@example.com", role: "User" },
		{ id: 17, name: "Oscar Wilde", email: "oscar@example.com", role: "Admin" },
		{ id: 18, name: "Penny Lane", email: "penny@example.com", role: "User" },
		{ id: 19, name: "Quinn Fabray", email: "quinn@example.com", role: "Editor" },
		{ id: 20, name: "Rachel Green", email: "rachel@example.com", role: "User" }
	];
</script>

<div class="p-8 space-y-8">
	<h1 class="text-2xl font-bold">Enhanced Svelte Table Demo</h1>
	
	<!-- Controls -->
	<div class="flex gap-4 p-4 border rounded-lg">
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
		<label class="flex items-center gap-2">
			<input type="checkbox" bind:checked={tableConfig.stickyHeader} />
			Sticky Header
		</label>
		<label class="flex items-center gap-2">
			<input type="checkbox" bind:checked={tableConfig.stickyFooter} />
			Sticky Footer
		</label>
		<label class="flex items-center gap-2">
			<span>Height:</span>
			<select bind:value={tableConfig.height} class="px-2 py-1 border rounded">
				<option value="">Auto</option>
				<option value="300px">300px</option>
				<option value="400px">400px</option>
				<option value="500px">500px</option>
			</select>
		</label>
	</div>

	<!-- Table Demo -->
	<div class="overflow-hidden">
		<Table.Root 
			bleed={tableConfig.bleed}
			dense={tableConfig.dense}
			grid={tableConfig.grid}
			striped={tableConfig.striped}
			height={tableConfig.height || undefined}
		>
			<Table.Header sticky={tableConfig.stickyHeader}>
				<Table.Row>
					<Table.Head>ID</Table.Head>
					<Table.Head>Name</Table.Head>
					<Table.Head>Email</Table.Head>
					<Table.Head>Role</Table.Head>
				</Table.Row>
			</Table.Header>
			<Table.Body>
				{#each data as item (item.id)}
					<Table.Row>
						<Table.Cell>{item.id}</Table.Cell>
						<Table.Cell class="font-medium">{item.name}</Table.Cell>
						<Table.Cell>{item.email}</Table.Cell>
						<Table.Cell>
							<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
								{item.role}
							</span>
						</Table.Cell>
					</Table.Row>
				{/each}
			</Table.Body>
			<Table.Footer sticky={tableConfig.stickyFooter}>
				<Table.Row>
					<Table.Cell class="font-medium">Total</Table.Cell>
					<Table.Cell class="font-medium">{data.length} users</Table.Cell>
					<Table.Cell></Table.Cell>
					<Table.Cell class="font-medium">All roles</Table.Cell>
				</Table.Row>
			</Table.Footer>
		</Table.Root>
	</div>

	<!-- Clickable Table Demo -->
	<div class="border rounded-lg overflow-hidden">
		<h2 class="text-lg font-semibold p-4 border-b">Clickable Rows Demo</h2>
		<Table.Root striped={true}>
			<Table.Header>
				<Table.Row>
					<Table.Head>ID</Table.Head>
					<Table.Head>Name</Table.Head>
					<Table.Head>Email</Table.Head>
					<Table.Head>Role</Table.Head>
				</Table.Row>
			</Table.Header>
			<Table.Body>
				{#each data as item (item.id)}
					<Table.Row href="/user/{item.id}" title="View user {item.name}">
						<Table.Cell>{item.id}</Table.Cell>
						<Table.Cell class="font-medium">{item.name}</Table.Cell>
						<Table.Cell>{item.email}</Table.Cell>
						<Table.Cell>
							<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
								{item.role}
							</span>
						</Table.Cell>
					</Table.Row>
				{/each}
			</Table.Body>
		</Table.Root>
	</div>
</div>
