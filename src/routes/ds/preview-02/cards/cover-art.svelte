<script lang="ts">
	import { Button } from "$lib/components/ui/button/index.js";
	import * as Card from "$lib/components/ui/card/index.js";
	import * as Item from "$lib/components/ui/item/index.js";
	import { Label } from "$lib/components/ui/label/index.js";
	import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";

	let fileInput: HTMLInputElement | undefined = $state();

	function openPicker() {
		fileInput?.click();
	}
</script>

<Card.Root>
	<Card.Content class="flex flex-col gap-3">
		<Label
			for="cover-art"
			class="text-muted-foreground text-center text-xs font-normal tracking-wider uppercase"
		>
			Portada del catálogo
		</Label>
		<Item.Root class="aspect-square" variant="outline">
			<label
				for="cover-art"
				class="flex size-full cursor-pointer items-center justify-center"
			>
				<IconPlaceholder
					lucide="ImageIcon"
					tabler="IconPhoto"
					hugeicons="Image01Icon"
					phosphor="ImageIcon"
					remixicon="RiImageLine"
					class="text-muted-foreground/50 size-10"
				/>
			</label>
		</Item.Root>
		<input
			id="cover-art"
			bind:this={fileInput}
			type="file"
			accept="image/jpeg,image/png"
			class="sr-only"
		/>
	</Card.Content>
	<Card.Footer class="flex-col gap-2">
		<Button variant="secondary" class="w-full" type="button" onclick={openPicker}
			>Cargar portada</Button
		>
		<Card.Description class="text-center text-xs">
			Mínimo 3000 × 3000 px
			<br />
			Solo JPEG o PNG
		</Card.Description>
	</Card.Footer>
</Card.Root>
