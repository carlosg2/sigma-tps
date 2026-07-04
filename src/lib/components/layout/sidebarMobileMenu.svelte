<script lang="ts">
  import { cn } from "$lib/utils.js";

  import * as Sheet from "$lib/components/ui/sheet";
  import { buttonVariants } from "$lib/components/ui/button";
  import Separator from "$lib/components/ui/separator/separator.svelte";

  import MenuIcon from "@lucide/svelte/icons/menu";

  import ShowCategories from "$lib/components/layout/showCategories.svelte";
  import ShowSidebarLinks from "$lib/components/layout/showSidebarLinks.svelte";
  import ScrollArea from "$lib/components/ui/scroll-area/scroll-area.svelte";

  interface Props {
    className?: string;
  }

  let { className }: Props = $props();
</script>

<Sheet.Root>
  <Sheet.Trigger
    title="Open SVGL Menu"
    class={cn(buttonVariants({ variant: "ghost", size: "icon" }), className)}
  >
    <MenuIcon class="size-5" />
    <span class="sr-only">Open Menu</span>
  </Sheet.Trigger>
  <Sheet.Content class="gap-0.5" side="left">
    <Sheet.Header>
      <Sheet.Title class="flex items-center space-x-2">
        <div
          class="flex h-7 w-7 items-center justify-center rounded-md bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="size-4"
          >
            <polyline points="16 18 22 12 16 6" />
            <polyline points="8 6 2 12 8 18" />
          </svg>
        </div>
        <h2 class="text-xl font-medium tracking-tight">svgl</h2>
      </Sheet.Title>
    </Sheet.Header>
    <ScrollArea class="flex size-full flex-col">
      <div class="space-y-0.5 px-3 pb-3">
        <ShowSidebarLinks />
        <Separator orientation="horizontal" class="my-3" />
        <ShowCategories />
      </div>
    </ScrollArea>
  </Sheet.Content>
</Sheet.Root>
