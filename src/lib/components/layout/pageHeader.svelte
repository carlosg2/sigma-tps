<script lang="ts">
  import type { Snippet } from "svelte";
  import { cn } from "$lib/utils.js";

  interface PageHeaderProps {
    children: Snippet;
    className?: string;
  }

  let { children, className }: PageHeaderProps = $props();
</script>

<div
  class={cn(
    "sticky top-0 z-50 flex h-12.5 items-center justify-between px-4 py-1.5",
    "border-b border-border",
    "backdrop-blur-sm cbg-card/80 ",
    className,
  )}
>
  {@render children?.()}
</div>
