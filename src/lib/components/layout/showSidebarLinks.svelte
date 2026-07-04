<script lang="ts">
  import { cn } from "$lib/utils.js";
  import { page } from "$app/state";
  import { sidebarItemClasses } from "$lib/components/layout/sidebarItemClasses.js";

  import Box from "@lucide/svelte/icons/box";
  import House from "@lucide/svelte/icons/house";
  import Cloud from "@lucide/svelte/icons/cloud";
  import Send from "@lucide/svelte/icons/send";
  import Github from "@lucide/svelte/icons/send";
  import Layers from "@lucide/svelte/icons/layers";
</script>

<a
  href="/svgl"
  class={cn(
    sidebarItemClasses.base,
    "justify-start space-x-3",
    page.url.pathname === "/svgl" && sidebarItemClasses.active,
  )}
>
  <House size={16} />
  <p class="truncate">Home</p>
</a>
<a
  href="/svgl/docs"
  class={cn(
    sidebarItemClasses.base,
    "justify-start space-x-3",
    page.url.pathname === "/svgl/docs" && sidebarItemClasses.active,
  )}
>
  <Cloud size={16} />
  <p class="truncate">API</p>
</a>

<a
  href="/svgl/extensions"
  class={cn(
    sidebarItemClasses.base,
    "justify-start space-x-3",
    page.url.pathname === "/svgl/extensions" && sidebarItemClasses.active,
  )}
>
  <Box size={16} />
  <p class="truncate">Extensions</p>
</a>
<a
  href="https://github.com/pheralb/svgl"
  target="_blank"
  rel="noreferrer"
  class={cn(
    sidebarItemClasses.base,
    "flex justify-start space-x-3 md:hidden",
  )}
>
  <Send size={16} />
  <p class="truncate">Submit SVG</p>
</a>
<a
  href="https://github.com/pheralb/svgl"
  target="_blank"
  rel="noreferrer"
  class={cn(
    sidebarItemClasses.base,
    "flex justify-start space-x-3 md:hidden",
  )}
>
  <Github size={16} />
  <p class="truncate">GitHub Repository</p>
</a>
