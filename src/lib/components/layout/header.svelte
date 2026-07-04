<script lang="ts">
  import { cn } from "$lib/utils.js";

  import ModeToggle from "$lib/components/mode-toggle.svelte";
  import HomeLink from "$lib/components/layout/homeLink.svelte";
  import SidebarMobileMenu from "$lib/components/layout/sidebarMobileMenu.svelte";
  import Customizer from "$lib/components/custom/customizer/customizer.svelte";

  import { Separator } from "$lib/components/ui/separator";
</script>

<header
  class="sticky top-0 z-50 w-full bg-neutral-100 px-2 py-3 md:px-4 md:py-4 dark:bg-neutral-950"
>
  <nav class="flex w-full items-center justify-between">
    <div class="flex items-center space-x-2">
      <SidebarMobileMenu className="md:hidden" />
      <HomeLink />
    </div>
    <div class="flex h-5 items-center space-x-2.5">
      <div class="flex items-center space-x-1.5">
        <Customizer />
        <ModeToggle />
      </div>
      <div class="hidden h-5 items-center space-x-2 md:flex">
        <Separator orientation="vertical" />
        <a
          href="https://github.com/pheralb/svgl"
          target="_blank"
          rel="noreferrer"
          class={cn(
            "inline-flex items-center rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
            "hover:bg-neutral-200 dark:hover:bg-neutral-800",
          )}
        >
          GitHub
        </a>
        <Separator orientation="vertical" />
        <a
          href="https://github.com/pheralb/svgl"
          target="_blank"
          rel="noreferrer"
          class="inline-flex items-center gap-1.5 rounded-md bg-neutral-900 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-neutral-700 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
        >
          Submit
        </a>
      </div>
    </div>
  </nav>
</header>
