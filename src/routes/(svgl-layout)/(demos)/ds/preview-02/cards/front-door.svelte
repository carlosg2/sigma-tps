<script lang="ts">
	import { Badge } from "$lib/components/ui/badge/index.js";
	import * as Card from "$lib/components/ui/card/index.js";
	import IconPlaceholder from "$lib/components/custom/icon-placeholder/icon-placeholder.svelte";
</script>

<Card.Root>
	<Card.Header>
		<Card.Title>Panel principal</Card.Title>
		<Card.Description>Panel de control ERP</Card.Description>
		<Card.Action>
			<div class="text-muted-foreground flex items-center gap-1.5 text-sm">
				Bloqueado
				<IconPlaceholder
					lucide="LockIcon"
					tabler="IconLock"
					hugeicons="SquareLock02Icon"
					phosphor="LockKeyIcon"
					remixicon="RiLockLine"
					class="size-4"
				/>
			</div>
		</Card.Action>
	</Card.Header>
	<Card.Content>
		<div
			class="bg-muted relative flex aspect-video items-center justify-center overflow-hidden rounded-lg bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,var(--border)_10px,var(--border)_11px)]"
		>
			<Badge variant="destructive" class="absolute top-2 right-2">En vivo</Badge>
		</div>
	</Card.Content>
</Card.Root>
