<script lang="ts">
  import type { Snippet } from "svelte";
  import { cn } from "$lib/utils.js";

  interface PageCardProps {
    children: Snippet;
    containerClass?: string;
    contentCardClass?: string;
  }

  let { children, contentCardClass, containerClass }: PageCardProps = $props();
</script>

<div class="p-px">
  <div
    class={cn(
      "overflow-hidden",
      "rounded-md border border-border",
      "bg-card/50",
      "",
      containerClass,
    )}
  >
    <div
      class={cn(
        "flex size-full max-h-[calc(100vh-4.5rem)] min-h-[calc(100vh-4.5rem)] flex-col overflow-y-auto",
        contentCardClass,
      )}
    >
      {@render children?.()}
    </div>
  </div>
</div>

