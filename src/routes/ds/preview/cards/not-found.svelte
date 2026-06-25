<script lang="ts">
	import * as Card from "$lib/components/ui/card/index.js";
	import * as Empty from "$lib/components/ui/empty/index.js";
	import * as InputGroup from "$lib/components/ui/input-group/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import { Kbd } from "$lib/components/ui/kbd/index.js";
	import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
</script>

<Card.Root>
	<Card.Content>
		<Empty.Root class="h-72">
			<Empty.Header>
			<Empty.Title>404 - No encontrado</Empty.Title>
			<Empty.Description>
				La página que buscas no existe. Intenta buscar lo que necesitas
				abajo.
				</Empty.Description>
			</Empty.Header>
			<Empty.Content>
				<InputGroup.Root class="w-3/4">
					<InputGroup.Input placeholder="Intenta buscar páginas..." />
					<InputGroup.Addon>
						<IconPlaceholder
							lucide="SearchIcon"
							tabler="IconSearch"
							hugeicons="Search01Icon"
							phosphor="MagnifyingGlassIcon"
							remixicon="RiSearchLine"
						/>
					</InputGroup.Addon>
					<InputGroup.Addon align="inline-end">
						<Kbd>/</Kbd>
					</InputGroup.Addon>
				</InputGroup.Root>
				<Button variant="link">Ir a la página principal</Button>
			</Empty.Content>
		</Empty.Root>
	</Card.Content>
</Card.Root>
