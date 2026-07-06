<script lang="ts">
  import type { LayoutProps } from "./$types";

  import Header from "$lib/components/layout/header.svelte";
  import SvglSidebar from "$lib/components/layout/svglSidebar.svelte";
  import * as Sidebar from "$lib/components/ui/sidebar/index.js";

  let { children }: LayoutProps = $props();
</script>

<Sidebar.Provider
  style="--header-height: 4.5rem;"
  class="min-h-0 flex-col"
>
  <Header />
  <div class="flex flex-1 overflow-hidden">
    <SvglSidebar />
    <Sidebar.Inset class="overflow-hidden px-2 md:px-0 md:pr-2">
      {@render children?.()}
    </Sidebar.Inset>
  </div>
</Sidebar.Provider>

<style>
  :global(body) {
    background-color: var(--color-neutral-100);
  }
  :global(html.dark body) {
    background-color: var(--color-neutral-950);
  }
</style>
