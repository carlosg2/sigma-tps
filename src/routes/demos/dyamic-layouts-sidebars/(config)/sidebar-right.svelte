<script lang="ts">
	import * as Sidebar from "$lib/components/ui/sidebar/index.js";
	import IconPlaceholder from "$lib/components/custom/icon-placeholder/icon-placeholder.svelte";
	import { plusIcon, userIcon, type IconSet } from "./layout-config.js";

	const groups = [
		{ name: "My Calendars", items: ["Personal", "Work", "Family"] },
		{ name: "Favorites", items: ["Holidays", "Birthdays"] },
		{ name: "Other", items: ["Travel", "Reminders"] },
	];
</script>

{#snippet icon(set: IconSet)}
	<IconPlaceholder
		lucide={set.lucide}
		tabler={set.tabler}
		hugeicons={set.hugeicons}
		phosphor={set.phosphor}
		remixicon={set.remixicon}
	/>
{/snippet}

<!-- Segundo pane (sidebar-15): sidebar de solo lectura, siempre visible en lg+ -->
<Sidebar.Root collapsible="none" side="right" class="sticky top-0 hidden h-svh border-s lg:flex">
	<Sidebar.Header class="border-sidebar-border h-16 border-b">
		<Sidebar.Menu>
			<Sidebar.MenuItem>
				<Sidebar.MenuButton size="lg">
					<div class="bg-muted flex aspect-square size-8 items-center justify-center rounded-lg">
						{@render icon(userIcon)}
					</div>
					<div class="grid flex-1 text-left text-sm leading-tight">
						<span class="truncate font-medium">shadcn</span>
						<span class="text-muted-foreground truncate text-xs">m@example.com</span>
					</div>
				</Sidebar.MenuButton>
			</Sidebar.MenuItem>
		</Sidebar.Menu>
	</Sidebar.Header>
	<Sidebar.Content>
		{#each groups as group (group.name)}
			<Sidebar.Group class="py-0">
				<Sidebar.GroupLabel>{group.name}</Sidebar.GroupLabel>
				<Sidebar.GroupContent>
					<Sidebar.Menu>
						{#each group.items as item (item)}
							<Sidebar.MenuItem>
								<Sidebar.MenuButton>
									{#snippet child({ props })}
										<a href="#" {...props}>{item}</a>
									{/snippet}
								</Sidebar.MenuButton>
							</Sidebar.MenuItem>
						{/each}
					</Sidebar.Menu>
				</Sidebar.GroupContent>
			</Sidebar.Group>
			<Sidebar.Separator class="mx-0" />
		{/each}
	</Sidebar.Content>
	<Sidebar.Footer>
		<Sidebar.Menu>
			<Sidebar.MenuItem>
				<Sidebar.MenuButton>
					{@render icon(plusIcon)}
					<span>New Calendar</span>
				</Sidebar.MenuButton>
			</Sidebar.MenuItem>
		</Sidebar.Menu>
	</Sidebar.Footer>
</Sidebar.Root>
