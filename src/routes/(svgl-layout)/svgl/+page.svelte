<script lang="ts">
  import PageCard from "$lib/components/layout/pageCard.svelte";
  import PageHeader from "$lib/components/layout/pageHeader.svelte";
  import * as InputGroup from "$lib/components/ui/input-group/index.js";
  import { Kbd } from "$lib/components/ui/kbd/index.js";

  import Files from "@lucide/svelte/icons/files";
  import SearchIcon from "@lucide/svelte/icons/search";

  const demoSvgs = [
    { name: "Svelte", category: "Framework", color: "#FF3E00" },
    { name: "React", category: "Framework", color: "#61DAFB" },
    { name: "Vue", category: "Framework", color: "#42B883" },
    { name: "Angular", category: "Framework", color: "#DD0031" },
    { name: "TypeScript", category: "Language", color: "#3178C6" },
    { name: "Node.js", category: "Library", color: "#339933" },
    { name: "Tailwind", category: "Library", color: "#06B6D4" },
    { name: "Vite", category: "DevOps", color: "#646CFF" },
    { name: "Vercel", category: "Cloud", color: "#000000" },
    { name: "GitHub", category: "DevOps", color: "#181717" },
    { name: "Figma", category: "Design", color: "#F24E1E" },
    { name: "PostgreSQL", category: "Database", color: "#4169E1" },
  ];
</script>

<svelte:head>
  <title>svgl — demo</title>
</svelte:head>

<!-- Search bar usando InputGroup del design system -->
<InputGroup.Root class="h-10 ">
  <InputGroup.Addon>
    <SearchIcon size={16} />
  </InputGroup.Addon>
  <InputGroup.Input
    type="search"
    autocomplete="off"
    placeholder="Search..."
  />
  <InputGroup.Addon align="inline-end">
    <Kbd>⌘K</Kbd>
  </InputGroup.Addon>
</InputGroup.Root>

<!-- Card principal — altura = 100vh - header(4.5rem) - search+margen(3.1rem) = 7.6rem -->
<PageCard
  containerClass="mt-2"
  contentCardClass="max-h-[calc(100vh-7.6rem)] min-h-[calc(100vh-7.6rem)]"
>
  <PageHeader>
    <div class="flex items-center space-x-2 text-neutral-500 dark:text-neutral-400">
      <Files size={18} strokeWidth={1.5} />
      <p>
        <span class="font-mono">{demoSvgs.length}</span>
        <span>logos</span>
      </p>
    </div>
  </PageHeader>

  <div class="p-4 space-y-8">
    {#each [1, 2, 3] as section (section)}
      <div>
        <p class="mb-3 text-xs font-medium uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
          Section {section}
        </p>
        <div class="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
          {#each demoSvgs as svg (svg.name + section)}
            <button
              class="group flex flex-col items-center gap-2 rounded-xl border border-border/50 bg-white p-4 text-center transition-all hover:border-border dark:border-border/50 dark:bg-card dark:hover:border-border"
            >
              <div
                class="flex h-12 w-12 items-center justify-center rounded-lg"
                style="background-color: {svg.color}18;"
              >
                <div class="h-8 w-8 rounded-md" style="background-color: {svg.color};"></div>
              </div>
              <div>
                <p class="text-xs font-medium text-neutral-700 dark:text-neutral-300">{svg.name}</p>
                <p class="text-[10px] text-neutral-400">{svg.category}</p>
              </div>
            </button>
          {/each}
        </div>
      </div>
    {/each}
  </div>
</PageCard>
