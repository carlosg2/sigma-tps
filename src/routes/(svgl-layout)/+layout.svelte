<script lang="ts">
  import type { LayoutProps } from "./$types";

  import Header from "$lib/components/layout/header.svelte";
  import Sidebar from "$lib/components/layout/sidebar.svelte";

  let { children }: LayoutProps = $props();
</script>

<div class="overflow-hidden ">
  <Header />
  <Sidebar>
    {@render children?.()}
  </Sidebar>
</div>

<style>
  :global(body) {
    background-color: var(--color-neutral-100);
  }
  :global(html.dark body) {
    background-color: var(--color-neutral-950);
  }
</style>
