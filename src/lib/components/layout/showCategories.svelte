<script lang="ts">
  import { page } from "$app/state";
  import { cn } from "$lib/utils.js";
  import { sidebarItemClasses } from "$lib/components/layout/sidebarItemClasses.js";
  import { sidebarBadgeClasses } from "$lib/components/layout/sidebarBadgeClasses.js";

  const demoCategories = [
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
  ];
</script>

{#each demoCategories.sort((a, b) => a.name.localeCompare(b.name)) as cat (cat.name)}
  <a
    href={`/svgl/directory/${cat.name.toLowerCase()}`}
    class={cn(
      sidebarItemClasses.base,
      page.url.pathname === `/svgl/directory/${cat.name.toLowerCase()}` &&
        sidebarItemClasses.active,
      "pr-3",
    )}
  >
    <p class="truncate">{cat.name}</p>
    <span
      class={cn(sidebarBadgeClasses, page.url.pathname && "border-transparent")}
    >
      {cat.count}
    </span>
  </a>
{/each}
