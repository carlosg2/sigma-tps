<script lang="ts">
	import * as Tooltip from "$lib/components/ui/tooltip/index.js";
	import { cn } from "$lib/utils.js";
	import LockIcon from "@lucide/svelte/icons/lock";
	import UnlockIcon from "@lucide/svelte/icons/lock-open";
	import { useDesignSystem, type Lockable } from "$lib/ds/index.js";

	type Props = {
		prop: keyof Lockable;
		class?: string;
	};

	let { prop, class: className }: Props = $props();

	const designSystem = useDesignSystem();
	const isLocked = $derived(designSystem.locks[prop]);
</script>

<Tooltip.Root>
	<Tooltip.Trigger
		onclick={() => (isLocked ? designSystem.unlock(prop) : designSystem.lock(prop))}
		data-locked={isLocked}
		class={cn(
			"flex size-4 cursor-pointer items-center justify-center rounded opacity-0 transition-opacity group-focus-within/picker:opacity-100 group-hover/picker:opacity-100 focus-visible:opacity-100 data-[locked=true]:opacity-100 pointer-coarse:hidden",
			className
		)}
		aria-label={isLocked ? "Unlock" : "Lock"}
	>
		{#if isLocked}
			<LockIcon class="text-foreground size-4" />
		{:else}
			<UnlockIcon class="text-foreground size-4" />
		{/if}
	</Tooltip.Trigger>
	<Tooltip.Content>
		{isLocked ? "Locked" : "Unlocked"}
	</Tooltip.Content>
</Tooltip.Root>
