<script lang="ts">
  import { page } from "$app/state";
  import * as Sidebar from "$lib/components/ui/sidebar/index.js";
  import { Separator } from "$lib/components/ui/separator";

  import House from "@lucide/svelte/icons/house";
  import Cloud from "@lucide/svelte/icons/cloud";
  import Box from "@lucide/svelte/icons/box";
  import FileText from "@lucide/svelte/icons/file-text";


  const navLinks = [
    { href: "/svgl", label: "Home", icon: House },
    { href: "/editor", label: "Editor", icon: FileText },
    { href: "/svgl/docs", label: "API", icon: Cloud },
    { href: "/svgl/extensions", label: "Extensions", icon: Box },
  ];

  const categories = [
    { name: "Animated", count: 12 },
    { name: "Browser", count: 8 },
    { name: "Cloud", count: 15 },
    { name: "CMS", count: 6 },
    { name: "Database", count: 11 },
    { name: "Design", count: 9 },
    { name: "DevOps", count: 14 },
    { name: "Editor", count: 7 },
    { name: "Framework", count: 18 },
    { name: "Language", count: 22 },
    { name: "Library", count: 16 },
    { name: "Social", count: 10 },
  ].sort((a, b) => a.name.localeCompare(b.name));
</script>

<Sidebar.Root variant="sidebar"
  collapsible="icon"
  style="top: var(--header-height); height: calc(100svh - var(--header-height));"
>
  <Sidebar.Content class="gap-0 bg-background!">
    <!-- Nav links -->
    <Sidebar.Group class="px-2 py-2">
      <Sidebar.Menu>
        {#each navLinks as link (link.href)}
          <Sidebar.MenuItem>
            <Sidebar.MenuButton
              isActive={page.url.pathname === link.href}
              tooltipContent={link.label}
            >
              {#snippet child({ props })}
                <a href={link.href} {...props}>
                  <link.icon />
                  <span>{link.label}</span>
                </a>
              {/snippet}
            </Sidebar.MenuButton>
          </Sidebar.MenuItem>
        {/each}
      </Sidebar.Menu>
    </Sidebar.Group>

    <div class="px-2">
      <Separator />
    </div>

    <!-- Categories scrollable -->
    <Sidebar.Group class="overflow-y-auto px-2 py-2">
      <Sidebar.Menu>
        {#each categories as cat (cat.name)}
          <Sidebar.MenuItem>
            <Sidebar.MenuButton
              isActive={page.url.pathname === `/svgl/directory/${cat.name.toLowerCase()}`}
              tooltipContent={cat.name}
            >
              {#snippet child({ props })}
                <a href={`/svgl/directory/${cat.name.toLowerCase()}`} {...props}>
                  <span class="truncate">{cat.name}</span>
                </a>
              {/snippet}
            </Sidebar.MenuButton>
            <Sidebar.MenuBadge>{cat.count}</Sidebar.MenuBadge>
          </Sidebar.MenuItem>
        {/each}
      </Sidebar.Menu>
    </Sidebar.Group>
  </Sidebar.Content>

<!--   <Sidebar.Rail /> -->
</Sidebar.Root>
