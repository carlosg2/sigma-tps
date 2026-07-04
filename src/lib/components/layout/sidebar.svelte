<script lang="ts">
  import { cn } from "$lib/utils.js";

  import { Separator } from "$lib/components/ui/separator";
  import ShowCategories from "$lib/components/layout/showCategories.svelte";
  import ShowSidebarLinks from "$lib/components/layout/showSidebarLinks.svelte";
  import ScrollArea from "$lib/components/ui/scroll-area/scroll-area.svelte";

  interface Props {
    children?: import("svelte").Snippet;
  }

  let { children }: Props = $props();
</script>

<section class="bg-neutral-100 dark:bg-neutral-950">
  <aside
    class={cn(
      "md:fixed md:left-1 md:h-[calc(100vh-4.5rem)]",
      "overflow-x-hidden",
      "w-54",
      "hidden flex-col space-y-3 md:flex",
      "bg-neutral-100 dark:bg-neutral-950",
    )}
  >
    <nav class="flex flex-col space-y-0.5 px-2">
      <ShowSidebarLinks />
    </nav>
    <div class="px-2">
      <Separator orientation="horizontal" />
    </div>
    <nav class="relative flex h-auto flex-col space-y-0.5 overflow-hidden">
      <ScrollArea
        class="flex size-full flex-col gap-y-0.5 overflow-hidden px-2"
      >
        <ShowCategories />
      </ScrollArea>
    </nav>
  </aside>
  <main class={cn("px-2 md:mr-4 md:ml-56 md:px-0", "overflow-hidden")}>
    {@render children?.()}
  </main>
</section>
