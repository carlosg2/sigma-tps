<script lang="ts">
	import { Button } from "$lib/components/ui/button/index.js";
	import * as Card from "$lib/components/ui/card/index.js";
	import * as Field from "$lib/components/ui/field/index.js";
	import * as InputGroup from "$lib/components/ui/input-group/index.js";
	import IconPlaceholder from "$lib/components/custom/icon-placeholder/icon-placeholder.svelte";
</script>

<Card.Root>
	<Card.Header>
		<Card.Title>Enlaces corporativos</Card.Title>
	</Card.Header>
	<Card.Content>
		<Field.Group>
			<Field.Field>
				<Field.Label for="spotify-url">URL del artista en Spotify</Field.Label>
				<InputGroup.Root>
					<InputGroup.Addon>
						<IconPlaceholder
							lucide="CirclePlusIcon"
							tabler="IconCirclePlus"
							hugeicons="PlusSignCircleIcon"
							phosphor="PlusCircleIcon"
							remixicon="RiAddCircleLine"
						/>
					</InputGroup.Addon>
					<InputGroup.Input id="spotify-url" value="spotify.com/artist/3j...2k" />
				</InputGroup.Root>
			</Field.Field>
			<Field.Field>
				<Field.Label for="instagram-handle">Usuario de Instagram</Field.Label>
				<InputGroup.Root>
					<InputGroup.Addon>
						<IconPlaceholder
							lucide="CameraIcon"
							tabler="IconCamera"
							hugeicons="Camera01Icon"
							phosphor="CameraIcon"
							remixicon="RiCameraLine"
						/>
					</InputGroup.Addon>
					<InputGroup.Input id="instagram-handle" value="@julianduryea_music" />
				</InputGroup.Root>
			</Field.Field>
			<Field.Field>
				<Field.Label for="soundcloud-url">URL de SoundCloud</Field.Label>
				<InputGroup.Root>
					<InputGroup.Addon>
						<IconPlaceholder
							lucide="CloudIcon"
							tabler="IconCloud"
							hugeicons="CloudUploadIcon"
							phosphor="CloudIcon"
							remixicon="RiCloudLine"
						/>
					</InputGroup.Addon>
					<InputGroup.Input id="soundcloud-url" placeholder="soundcloud.com/username" />
				</InputGroup.Root>
			</Field.Field>
			<Field.Field>
				<Field.Label for="website-url">Sitio web</Field.Label>
				<InputGroup.Root>
					<InputGroup.Addon>
						<IconPlaceholder
							lucide="GlobeIcon"
							tabler="IconWorld"
							hugeicons="Globe02Icon"
							phosphor="GlobeIcon"
							remixicon="RiGlobalLine"
						/>
					</InputGroup.Addon>
					<InputGroup.Input id="website-url" placeholder="https://yoursite.com" />
				</InputGroup.Root>
			</Field.Field>
		</Field.Group>
	</Card.Content>
	<Card.Footer class="justify-end gap-2">
		<Button variant="secondary">Descartar</Button>
		<Button>Guardar cambios</Button>
	</Card.Footer>
</Card.Root>
