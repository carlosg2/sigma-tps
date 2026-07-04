<script lang="ts">
	import * as Card from "$lib/components/ui/card/index.js";
	import { Kbd } from "$lib/components/ui/kbd/index.js";
	import { Separator } from "$lib/components/ui/separator/index.js";
</script>

<Card.Root>
	<Card.Content>
		<div class="flex flex-col gap-3">
			<div class="text-sm font-medium">Atajos</div>
			<div class="flex flex-col gap-2">
				<div class="text-muted-foreground flex items-center justify-between text-sm">
					<span>Buscar</span>
					<div class="flex gap-1">
						<Kbd>⌘</Kbd>
						<Kbd>K</Kbd>
					</div>
				</div>
				<Separator />
				<div class="text-muted-foreground flex items-center justify-between text-sm">
					<span>Lotes rápidas</span>
					<div class="flex gap-1">
						<Kbd>⌘</Kbd>
						<Kbd>J</Kbd>
					</div>
				</div>
				<Separator />
				<div class="text-muted-foreground flex items-center justify-between text-sm">
					<span>Archivo nuevo</span>
					<div class="flex gap-1">
						<Kbd>⌘</Kbd>
						<Kbd>N</Kbd>
					</div>
				</div>
				<Separator />
				<div class="text-muted-foreground flex items-center justify-between text-sm">
					<span>Guardar</span>
					<div class="flex gap-1">
						<Kbd>⌘</Kbd>
						<Kbd>S</Kbd>
					</div>
				</div>
				<Separator />
				<div class="text-muted-foreground flex items-center justify-between text-sm">
					<span>Alternar barra lateral</span>
					<div class="flex gap-1">
						<Kbd>⌘</Kbd>
						<Kbd>B</Kbd>
					</div>
				</div>
			</div>
		</div>
	</Card.Content>
</Card.Root>
